/**
 * Lambda: PATCH /orders/{id}/status
 * Validates transition, updates Supabase, sends status email via Gmail API
 */

const { createClient } = require('@supabase/supabase-js');
const { google }       = require('googleapis');
const ws               = require('ws');

let emailTemplates;
try   { emailTemplates = require('./lib/emailTemplates'); }
catch { emailTemplates = require('../create-order/emailTemplates'); }
const { buildStatusUpdateEmail } = emailTemplates;

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

async function sendEmail({ to, subject, html, text }) {
  const gmail = buildGmailClient();
  const from  = `Stellar Global Supplies <stellarglobalsupplies@gmail.com>`;
  await gmail.users.messages.send({
    userId:      'me',
    requestBody: { raw: buildRawMessage({ to, subject, html, text, from }) },
  });
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

    return respond(200, updated);
  }

  // Handle deliver endpoint
  if (path.includes('/deliver')) {
    // For deliver, we just update status to Delivered
    // Invoice handling would require S3 upload - simplified for now
    const { data: updated, error: updateErr } = await supabase
      .from('orders')
      .update({ 
        status: 'Delivered',
        updated_at: new Date().toISOString(),
        updated_by: user.id,
      })
      .eq('id', orderId)
      .select()
      .single();

    if (updateErr) {
      console.error('Deliver error:', updateErr);
      return respond(500, { message: 'Failed to mark as delivered' });
    }

    // Send delivery email
    try {
      const { subject, html, text } = buildStatusUpdateEmail(updated);
      await sendEmail({ to: updated.email, subject, html, text });
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
