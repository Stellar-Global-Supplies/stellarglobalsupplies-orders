/**
 * Lambda: POST /orders/{id}/notify
 * Manually re-sends email notification for any order via Gmail API
 */

const { createClient } = require('@supabase/supabase-js');
const { google }       = require('googleapis');
const ws               = require('ws');

let emailTemplates;
try   { emailTemplates = require('./lib/emailTemplates'); }
catch { emailTemplates = require('../create-order/emailTemplates'); }
const { buildOrderConfirmationEmail, buildStatusUpdateEmail } = emailTemplates;

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    realtime: {
      transport: ws,
    },
  }
);

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

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  'Access-Control-Allow-Methods': 'POST,OPTIONS',
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

  let body = {};
  try { body = JSON.parse(event.body || '{}'); } catch {}
  const type = body.type || 'status_update'; // 'confirmation' | 'status_update'

  const { data: order, error: fetchErr } = await supabase
    .from('orders').select('*').eq('id', orderId).single();
  if (fetchErr || !order) return respond(404, { message: 'Order not found' });

  try {
    const builder  = type === 'confirmation' ? buildOrderConfirmationEmail : buildStatusUpdateEmail;
    const { subject, html, text } = builder(order);
    await sendEmail({ to: order.email, subject, html, text });
    return respond(200, { message: 'Email sent', recipient: order.email, type });
  } catch (err) {
    console.error('Send notification error:', err);
    return respond(500, { message: 'Failed to send email', detail: err.message });
  }
};
