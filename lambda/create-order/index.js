/**
 * Lambda: POST /orders
 * Creates order in Supabase with status = "Order Received"
 * Sends confirmation email via Gmail API (OAuth2)
 */

const { createClient }            = require('@supabase/supabase-js');
const { google }                  = require('googleapis');
const ws                          = require('ws');
const { buildOrderConfirmationEmail } = require('./emailTemplates');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    realtime: {
      transport: ws,
    },
  }
);

// ── Gmail OAuth2 client ────────────────────────────────────────────────────
function buildGmailClient() {
  const auth = new google.auth.OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    'https://developers.google.com/oauthplayground'   // redirect_uri (not used at runtime)
  );
  auth.setCredentials({ refresh_token: process.env.GMAIL_REFRESH_TOKEN });
  return google.gmail({ version: 'v1', auth });
}

/**
 * Encode a raw RFC-2822 message to base64url for the Gmail API
 */
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

  const raw = buildRawMessage({ to, subject, html, text, from });

  await gmail.users.messages.send({
    userId:      'me',
    requestBody: { raw },
  });
}

// ── CORS headers ───────────────────────────────────────────────────────────
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

// ── Handler ────────────────────────────────────────────────────────────────
exports.handler = async (event) => {
  const method = event.requestContext?.http?.method || event.httpMethod;
  if (method === 'OPTIONS') return respond(200, {});

  // Auth
  const authHeader = event.headers?.authorization || event.headers?.Authorization;
  if (!authHeader?.startsWith('Bearer '))
    return respond(401, { message: 'Unauthorized' });

  const { data: { user }, error: authErr } =
    await supabase.auth.getUser(authHeader.split(' ')[1]);
  if (authErr || !user) return respond(401, { message: 'Invalid token' });

  // Parse body
  let body;
  try { body = JSON.parse(event.body || '{}'); }
  catch { return respond(400, { message: 'Invalid JSON' }); }

  const {
    customer_name, phone, email, product_type,
    material, quantity, unit, sale_cost,
    payment_status, delivery_timeline,
  } = body;

  const missing = Object.entries({ customer_name, phone, email, product_type, material, quantity, sale_cost })
    .filter(([, v]) => v === undefined || v === null || v === '')
    .map(([k]) => k);
  if (missing.length)
    return respond(400, { message: `Missing required fields: ${missing.join(', ')}` });

  // Insert order
  const { data: order, error: insertErr } = await supabase
    .from('orders')
    .insert({
      customer_name:     customer_name.trim(),
      phone:             phone.trim(),
      email:             email.trim().toLowerCase(),
      product_type,
      material,
      quantity:          Number(quantity),
      unit:              unit || 'Pieces',
      sale_cost:         Number(sale_cost),
      payment_status:    payment_status || 'Pending',
      delivery_timeline: delivery_timeline || null,
      status:            'Order Received',
      created_by:        user.id,
    })
    .select()
    .single();

  if (insertErr) {
    console.error('Insert error:', insertErr);
    return respond(500, { message: 'Failed to create order', detail: insertErr.message });
  }

  // Send confirmation email — non-blocking
  try {
    const { subject, html, text } = buildOrderConfirmationEmail(order);
    await sendEmail({ to: order.email, subject, html, text });
  } catch (e) {
    console.error('Confirmation email error (non-fatal):', e.message);
  }

  return respond(201, order);
};
