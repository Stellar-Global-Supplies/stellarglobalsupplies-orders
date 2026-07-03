/**
 * Lambda: PATCH /orders/{id}/status
 * Validates transition, updates Supabase, sends status email via Gmail API
 * Handles invoice upload to S3
 */

const { createClient } = require('@supabase/supabase-js');
const { google }       = require('googleapis');
const ws               = require('ws');
const AWS              = require('aws-sdk');
const { randomUUID }   = require('crypto');

// S3 client for invoice uploads
const s3 = new AWS.S3({ region: process.env.AWS_REGION || 'us-east-1' });
const INVOICE_BUCKET = process.env.INVOICE_BUCKET_NAME || 'stellar-oms-invoices-production';

let emailTemplates;
try   { emailTemplates = require('./lib/emailTemplates'); }
catch { emailTemplates = require('../create-order/emailTemplates'); }
const { buildStatusUpdateEmail, buildDelayNotificationEmail } = emailTemplates;

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    realtime: {
      transport: ws,
    },
  }
);

// ── Gmail helper (shared pattern across all 3 lambdas) ────────────────────
function buildGmailClient() {
  const auth = new google.auth.OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    'https://developers.google.com/oauthplayground'
  );
  auth.setCredentials({ refresh_token: process.env.GMAIL_REFRESH_TOKEN });
  return google.gmail({ version: 'v1', auth });
}

function buildRawMessage({ to, subject, html, text, from }) {
  const boundary = `boundary_${Date.now()}`;
  const raw = [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    `MIME-Version: 1.0`,
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    ``,
    `--${boundary}`,
    `Content-Type: text/plain; charset="UTF-8"`,
    ``,
    text,
    ``,
    `--${boundary}`,
    `Content-Type: text/html; charset="UTF-8"`,
    ``,
    html,
    ``,
    `--${boundary}--`,
  ].join('\r\n');

  return Buffer.from(raw)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

async function sendEmail({ to, subject, html, text, invoiceUrl }) {
  const gmail = buildGmailClient();
  const from  = `Stellar Global Supplies <stellarglobalsupplies@gmail.com>`;
  
  // If invoice URL provided, download and attach
  if (invoiceUrl) {
    try {
      // Extract key from S3 URL
      const urlMatch = invoiceUrl.match(/https?:\/\/[^/]+\/(.+)$/);
      if (urlMatch) {
        const key = decodeURIComponent(urlMatch[1]);
        const s3Object = await s3.getObject({
          Bucket: INVOICE_BUCKET,
          Key: key,
        }).promise();
        
        // Build message with attachment
        const raw = buildRawMessageWithAttachment({
          to, subject, html, text, from,
          attachment: s3Object.Body,
          filename: key.split('/').pop() || 'invoice',
          mimeType: s3Object.ContentType || 'application/pdf',
        });
        
        await gmail.users.messages.send({
          userId:      'me',
          requestBody: { raw },
        });
        return;
      }
    } catch (attachErr) {
      console.error('Invoice attachment error (non-fatal):', attachErr.message);
    }
  }
  
  // Send without attachment
  await gmail.users.messages.send({
    userId:      'me',
    requestBody: { raw: buildRawMessage({ to, subject, html, text, from }) },
  });
}

function buildRawMessageWithAttachment({ to, subject, html, text, from, attachment, filename, mimeType }) {
  const boundary = `boundary_${Date.now()}`;
  // Use standard base64 for attachment content within MIME message
  const attachmentBase64 = attachment.toString('base64');
  
  const raw = [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    `MIME-Version: 1.0`,
    `Content-Type: multipart/mixed; boundary="${boundary}"`,
    ``,
    `--${boundary}`,
    `Content-Type: multipart/alternative; boundary="alt_${boundary}"`,
    ``,
    `--alt_${boundary}`,
    `Content-Type: text/plain; charset="UTF-8"`,
    ``,
    text,
    ``,
    `--alt_${boundary}`,
    `Content-Type: text/html; charset="UTF-8"`,
    ``,
    html,
    ``,
    `--alt_${boundary}--`,
    ``,
    `--${boundary}`,
    `Content-Type: ${mimeType}; name="${filename}"`,
    `Content-Disposition: attachment; filename="${filename}"`,
    `Content-Transfer-Encoding: base64`,
    ``,
    attachmentBase64,
    ``,
    `--${boundary}--`,
  ].join('\r\n');

  // Apply base64url encoding only to the final message for Gmail API
  return Buffer.from(raw)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

// ── Status transition rules ───────────────────────────────────────────────
const VALID_STATUSES = ['Order Received', 'Processing', 'Ready to Dispatch', 'Delivered'];
const NEXT_STATUS = {
  'Order Received':    'Processing',
  'Processing':        'Ready to Dispatch',
  'Ready to Dispatch': 'Delivered',
};

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  'Access-Control-Allow-Methods': 'PATCH,OPTIONS',
  'Access-Control-Allow-Credentials': 'true',
};

function respond(code, body) {
  return {
    statusCode: code,
    headers: { 'Content-Type': 'application/json', ...CORS },
    body: JSON.stringify(body),
  };
}

exports.handler = async (event) => {
  const method = event.requestContext?.http?.method || event.httpMethod;
  if (method === 'OPTIONS') return respond(200, {});

  const authHeader = event.headers?.authorization || event.headers?.Authorization;
  if (!authHeader?.startsWith('Bearer '))
    return respond(401, { message: 'Unauthorized' });

  const { data: { user }, error: authErr } =
    await supabase.auth.getUser(authHeader.split(' ')[1]);
  if (authErr || !user) return respond(401, { message: 'Invalid token' });

  const orderId = event.pathParameters?.id;
  if (!orderId) return respond(400, { message: 'Order ID required' });

  const path = event.path || event.rawPath || '';

    // Handle delay endpoint
    if (path.includes('/delay')) {
    let body = {};
    try { body = JSON.parse(event.body || '{}'); }
    catch { return respond(400, { message: 'Invalid JSON' }); }

    const { delivery_timeline } = body;
    if (!delivery_timeline) return respond(400, { message: 'Delivery date required' });

    // First fetch the current order to get customer email
    const { data: currentOrder, error: fetchErr } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (fetchErr || !currentOrder) {
      console.error('Fetch error:', fetchErr);
      return respond(404, { message: 'Order not found' });
    }

    const { data: updated, error: updateErr } = await supabase
      .from('orders')
      .update({ 
        delivery_timeline,
        updated_at: new Date().toISOString(),
        updated_by: user.id,
      })
      .eq('id', orderId)
      .select()
      .single();

    if (updateErr) {
      console.error('Delay error:', updateErr);
      return respond(500, { message: 'Failed to delay order' });
    }

    // Send delay notification email
    try {
      const { subject, html, text } = buildDelayNotificationEmail(updated);
      await sendEmail({ to: updated.email, subject, html, text });
    } catch (e) { console.error('Delay email error (non-fatal):', e.message); }

    return respond(200, updated);
  }

  // Handle deliver endpoint
  if (path.includes('/deliver')) {
    // Parse multipart form data for invoice file
    const contentType = event.headers?.['content-type'] || event.headers?.['Content-Type'] || '';
    let invoiceUrl = null;
    let paymentStatus = 'Paid';

    if (contentType.includes('multipart/form-data')) {
      // Extract boundary, removing any quotes
      const boundaryMatch = contentType.match(/boundary="?([^";]+)"?/);
      const boundary = boundaryMatch ? boundaryMatch[1] : null;
      
      if (boundary && event.body) {
        // Decode base64 body
        const bodyBuffer = Buffer.from(event.body, event.isBase64Encoded ? 'base64' : 'utf8');
        
        // Find the invoice file part
        const boundaryBuffer = Buffer.from(`\r\n--${boundary}\r\n`);
        const headerEndMarker = Buffer.from('\r\n\r\n');
        
        // Look for invoice part
        const invoiceHeader = `Content-Disposition: form-data; name="invoice"; filename=`;
        const invoiceHeaderBuffer = Buffer.from(invoiceHeader);
        
        const invoiceStart = bodyBuffer.indexOf(invoiceHeaderBuffer);
        if (invoiceStart !== -1) {
          // Find the end of the header (double CRLF)
          const headerEnd = bodyBuffer.indexOf(headerEndMarker, invoiceStart);
          if (headerEnd !== -1) {
            // Find the start of the filename
            const filenameStart = bodyBuffer.indexOf(Buffer.from('"'), invoiceStart + invoiceHeaderBuffer.length);
            const filenameEnd = bodyBuffer.indexOf(Buffer.from('"'), filenameStart + 1);
            const filename = bodyBuffer.slice(filenameStart + 1, filenameEnd).toString('utf8');
            
            // Find content type
            const ctStart = bodyBuffer.indexOf(Buffer.from('Content-Type: '), headerEnd);
            const ctEnd = bodyBuffer.indexOf(Buffer.from('\r\n'), ctStart);
            const mimeType = bodyBuffer.slice(ctStart + 14, ctEnd).toString('utf8');
            
            // Find the file content start (after double CRLF)
            const contentStart = headerEnd + 4;
            
            // Find the end of the file content (next boundary)
            const nextBoundary = bodyBuffer.indexOf(boundaryBuffer, contentStart);
            const contentEnd = nextBoundary !== -1 ? nextBoundary : bodyBuffer.length - (boundary.length + 8);
            
            // Extract file content
            const fileContent = bodyBuffer.slice(contentStart, contentEnd);
            
            // Upload to S3
            const key = `invoices/${orderId}/${Date.now()}_${filename}`;
            try {
              await s3.putObject({
                Bucket: INVOICE_BUCKET,
                Key: key,
                Body: fileContent,
                ContentType: mimeType,
                ACL: 'public-read',
              }).promise();
              invoiceUrl = `https://${INVOICE_BUCKET}.s3.amazonaws.com/${key}`;
            } catch (s3Err) {
              console.error('S3 upload error:', s3Err);
            }
          }
        }
        
        // Extract payment_status from form data
        const bodyString = bodyBuffer.toString('utf8');
        const paymentMatch = bodyString.match(/name="payment_status"\r?\n\r?\n([^\r?\n]+)/);
        if (paymentMatch) {
          paymentStatus = paymentMatch[1].trim();
        }
      }
    }

    // Update order to Delivered with invoice URL and timestamp
    const updateData = { 
      status: 'Delivered',
      payment_status: paymentStatus,
      updated_at: new Date().toISOString(),
      updated_by: user.id,
    };
    
    // Only set invoice fields if invoice was uploaded
    if (invoiceUrl) {
      updateData.invoice_url = invoiceUrl;
      updateData.invoice_uploaded_at = new Date().toISOString();
    }
    
    const { data: updated, error: updateErr } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId)
      .select()
      .single();

    if (updateErr) {
      console.error('Deliver error:', updateErr);
      return respond(500, { message: 'Failed to mark as delivered' });
    }

    // Send delivery email with invoice attachment
    try {
      const { subject, html, text } = buildStatusUpdateEmail(updated);
      await sendEmail({ to: updated.email, subject, html, text, invoiceUrl: updated.invoice_url });
    } catch (e) { console.error('Delivery email error (non-fatal):', e.message); }

    return respond(200, updated);
  }

  // Handle status update (original logic)
  let body = {};
  try { body = JSON.parse(event.body || '{}'); }
  catch { return respond(400, { message: 'Invalid JSON' }); }

  const { status, payment_status } = body;
  if (!status || !VALID_STATUSES.includes(status))
    return respond(400, { message: `Invalid status. Valid values: ${VALID_STATUSES.join(', ')}` });

  // Fetch current order
  const { data: current, error: fetchErr } = await supabase
    .from('orders').select('*').eq('id', orderId).single();
  if (fetchErr || !current) return respond(404, { message: 'Order not found' });

  // Validate transition
  const expectedNext = NEXT_STATUS[current.status];
  if (status !== expectedNext)
    return respond(400, {
      message: `Cannot transition "${current.status}" → "${status}". Expected next: "${expectedNext || 'none — already Delivered'}"`,
    });

  // Build update payload
  const updatePayload = {
    status,
    updated_at: new Date().toISOString(),
    updated_by: user.id,
  };
  if (payment_status && ['Pending', 'Partial', 'Paid'].includes(payment_status)) {
    updatePayload.payment_status = payment_status;
  }

  // Update
  const { data: updated, error: updateErr } = await supabase
    .from('orders')
    .update(updatePayload)
    .eq('id', orderId)
    .select()
    .single();

  if (updateErr) {
    console.error('Update error:', updateErr);
    return respond(500, { message: 'Failed to update order' });
  }

  // Send status email — non-blocking
  try {
    const { subject, html, text } = buildStatusUpdateEmail(updated);
    await sendEmail({ to: updated.email, subject, html, text });
  } catch (e) { console.error('Status email error (non-fatal):', e.message); }

  return respond(200, updated);
};
