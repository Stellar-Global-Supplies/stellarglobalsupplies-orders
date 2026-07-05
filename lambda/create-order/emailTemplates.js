/**
 * Stellar Global Supplies OMS v2.0
 * Premium HTML email templates — inline CSS for max email-client compatibility
 * Revamped: gradient header, icon badges, clean data rows, strong CTAs
 */

const B = {
  teal:      '#00B98E',
  tealDark:  '#009B76',
  tealLight: '#E8F8F3',
  navy:      '#0D1F2D',
  slate:     '#1E3448',
  white:     '#FFFFFF',
  grey:      '#F4F7FB',
  border:    '#E2E8F0',
  text:      '#1A202C',
  muted:     '#64748B',
  mutedLt:   '#94A3B4',
};

const STATUS = {
  'Order Received':    { bg: '#EFF6FF', text: '#1D4ED8', bar: '#3B82F6', emoji: '📋' },
  'Processing':        { bg: '#FFFBEB', text: '#B45309', bar: '#F59E0B', emoji: '⚙️' },
  'Ready to Dispatch': { bg: '#F5F3FF', text: '#6D28D9', bar: '#8B5CF6', emoji: '📦' },
  'Delivered':         { bg: '#ECFDF5', text: '#065F46', bar: '#10B981', emoji: '✅' },
};

function formatDate(d) {
  if (!d) return 'TBD';
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
}

function formatCurrency(n) {
  return `₹${Number(n).toLocaleString('en-IN')}`;
}

/* ── Base layout ──────────────────────────────────────────────────────────── */
function shell(preheader, headerAccentColor, body) {
  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<meta http-equiv="X-UA-Compatible" content="IE=edge"/>
<title>Stellar Global Supplies</title>
<!--[if mso]><noscript><xml><o:OfficeDocumentSettings>
<o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
<style>
  @media only screen and (max-width:600px){
    .outer{padding:12px!important}
    .card{border-radius:14px!important}
    .hpad{padding:24px 20px!important}
    .bpad{padding:24px 20px!important}
    .btn-row td{display:block!important;padding:0 0 10px!important}
    .stat-row td{display:block!important;padding:8px 0!important;border-bottom:1px solid #E2E8F0!important}
  }
</style>
</head>
<body style="margin:0;padding:0;background:#EEF2F6;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
${preheader ? `<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;">${preheader}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>` : ''}
<table class="outer" width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation" style="background:#EEF2F6;padding:32px 16px;">
  <tr><td align="center">
  <table class="card" width="600" cellpadding="0" cellspacing="0" border="0" role="presentation" style="max-width:600px;width:100%;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 32px rgba(0,0,0,.08);">

    <!-- HEADER -->
    <tr>
      <td style="background:linear-gradient(135deg,${B.navy} 0%,${B.slate} 100%);padding:0;">
        <!-- Accent bar -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation">
          <tr><td style="height:4px;background:linear-gradient(90deg,${headerAccentColor||B.teal},${B.tealDark});font-size:0;line-height:0;">&nbsp;</td></tr>
        </table>
        <table class="hpad" width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation" style="padding:24px 32px;">
          <tr>
            <td>
              <table cellpadding="0" cellspacing="0" border="0" role="presentation">
                <tr>
                  <td style="width:44px;height:44px;background:${B.teal};border-radius:10px;text-align:center;vertical-align:middle;" width="44" height="44">
                    <!-- SGS monogram -->
                    <span style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:17px;font-weight:900;color:#fff;line-height:44px;letter-spacing:-0.5px;display:block;">SG</span>
                  </td>
                  <td style="padding-left:14px;vertical-align:middle;">
                    <div style="font-size:15px;font-weight:700;color:#fff;letter-spacing:0.1px;margin-bottom:2px;">Stellar Global Supplies</div>
                    <div style="font-size:10.5px;color:${B.teal};letter-spacing:1px;text-transform:uppercase;font-weight:700;">Order Management System</div>
                  </td>
                </tr>
              </table>
            </td>
            <td align="right" style="vertical-align:middle;">
              <div style="font-size:11px;color:rgba(255,255,255,0.35);text-align:right;">orders.stellarglobalsupplies.com</div>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- BODY -->
    <tr>
      <td class="bpad" style="background:#fff;padding:32px 36px 0;">
        ${body}
      </td>
    </tr>

    <!-- FOOTER -->
    <tr>
      <td style="background:${B.navy};padding:28px 36px;border-radius:0 0 20px 20px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation">
          <tr>
            <td align="center" style="padding-bottom:16px;">
              <table cellpadding="0" cellspacing="0" border="0" role="presentation">
                <tr>
                  <td style="padding:0 12px;">
                    <a href="tel:+919637655556" style="font-size:12px;color:rgba(255,255,255,0.5);text-decoration:none;">📞 +91 96376 55556</a>
                  </td>
                  <td style="color:rgba(255,255,255,0.15);font-size:12px;">|</td>
                  <td style="padding:0 12px;">
                    <a href="mailto:stellarglobalsupplies@gmail.com" style="font-size:12px;color:rgba(255,255,255,0.5);text-decoration:none;">✉️ Email Us</a>
                  </td>
                  <td style="color:rgba(255,255,255,0.15);font-size:12px;">|</td>
                  <td style="padding:0 12px;">
                    <a href="https://stellarglobalsupplies.com" style="font-size:12px;color:rgba(255,255,255,0.5);text-decoration:none;">🌐 Website</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td align="center">
              <div style="font-size:12px;color:rgba(255,255,255,0.25);">
                © ${new Date().getFullYear()} Stellar Global Supplies &nbsp;·&nbsp; India's Most Reliable Industrial Supply Partner
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>

  </table>
  </td></tr>
</table>
</body>
</html>`;
}

/* ── Order detail rows ────────────────────────────────────────────────────── */
function detailRows(order) {
  const rows = [
    ['Product Type', order.product_type],
    ['Material',     order.material],
    ['Quantity',     `${order.quantity} ${order.unit}`],
    ['Sale Cost',    formatCurrency(order.sale_cost)],
    ['Payment',      order.payment_status],
    ['Expected',     formatDate(order.delivery_timeline)],
  ];
  return `
  <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation"
    style="border:1.5px solid ${B.border};border-radius:12px;overflow:hidden;border-collapse:separate;border-spacing:0;">
    ${rows.map(([label, val], i) => `
    <tr style="background:${i % 2 === 0 ? B.white : B.grey};">
      <td style="padding:11px 18px;font-size:13px;color:${B.muted};font-weight:600;width:42%;border-bottom:1px solid ${B.border};">${label}</td>
      <td style="padding:11px 18px;font-size:13px;color:${B.text};font-weight:700;border-bottom:1px solid ${B.border};">${val}</td>
    </tr>`).join('')}
  </table>`;
}

/* ── Status pill ──────────────────────────────────────────────────────────── */
function pill(status) {
  const s = STATUS[status] || STATUS['Order Received'];
  return `<span style="display:inline-block;background:${s.bg};color:${s.text};padding:5px 16px;border-radius:20px;font-size:12px;font-weight:800;letter-spacing:0.4px;">${s.emoji} ${status}</span>`;
}

/* ── CTA button ───────────────────────────────────────────────────────────── */
function cta(href, label, bg = B.teal) {
  return `<a href="${href}" style="display:inline-block;background:${bg};color:#fff;text-decoration:none;padding:13px 28px;border-radius:10px;font-size:14px;font-weight:700;letter-spacing:0.2px;">${label}</a>`;
}

/* ── Section block ────────────────────────────────────────────────────────── */
function section(icon, title, children) {
  return `
  <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation"
    style="background:${B.grey};border-radius:12px;overflow:hidden;margin-top:20px;">
    <tr>
      <td style="padding:14px 18px;border-bottom:1px solid ${B.border};background:${B.white};">
        <table cellpadding="0" cellspacing="0" border="0" role="presentation">
          <tr>
            <td style="font-size:18px;padding-right:10px;">${icon}</td>
            <td style="font-size:12px;font-weight:800;color:${B.text};text-transform:uppercase;letter-spacing:0.6px;">${title}</td>
          </tr>
        </table>
      </td>
    </tr>
    <tr><td style="padding:18px;">${children}</td></tr>
  </table>`;
}

/* ════════════════════════════════════════════════════════════════════════════
   1. ORDER CONFIRMATION
════════════════════════════════════════════════════════════════════════════ */
function buildOrderConfirmationEmail(order) {
  const orderId     = order.id.slice(0, 8).toUpperCase();
  const trackingUrl = order.tracking_token
    ? `https://orders.stellarglobalsupplies.com/track/${order.tracking_token}`
    : null;
  const subject = `✅ Order Confirmed #${orderId} — Stellar Global Supplies`;

  const body = `
    <!-- Hero -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation"
      style="background:linear-gradient(135deg,${B.tealLight} 0%,#f0fdf8 100%);border-radius:14px;margin-bottom:28px;">
      <tr>
        <td style="padding:28px 28px 24px;text-align:center;">
          <div style="font-size:48px;margin-bottom:12px;">🎉</div>
          <h1 style="margin:0 0 8px;font-size:24px;font-weight:800;color:${B.navy};letter-spacing:-0.3px;">Order Confirmed!</h1>
          <p style="margin:0;font-size:14px;color:${B.muted};line-height:1.7;">
            Hi <strong style="color:${B.text};">${order.customer_name}</strong>, we've received your order and our team is on it.
          </p>
          <div style="margin-top:16px;display:inline-block;background:#fff;border:1.5px solid ${B.teal};border-radius:10px;padding:8px 20px;">
            <span style="font-size:13px;color:${B.muted};font-weight:500;">Order Reference&nbsp;&nbsp;</span>
            <span style="font-size:15px;font-weight:800;color:${B.navy};font-family:monospace;">#${orderId}</span>
          </div>
        </td>
      </tr>
    </table>

    <!-- Order details -->
    ${section('📦', 'Order Summary', detailRows(order))}

    <!-- Status -->
    ${section('📍', 'Current Status', `
      <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation">
        <tr>
          <td style="padding-bottom:12px;">${pill(order.status)}</td>
        </tr>
        <tr>
          <td style="font-size:13px;color:${B.muted};line-height:1.7;">
            We'll send you email updates at every stage of your order.
            Expected delivery by <strong style="color:${B.navy};">${formatDate(order.delivery_timeline)}</strong>.
            ${order.payment_status !== 'Paid'
              ? `<br/><br/><span style="color:#B45309;font-weight:700;">⚠ Payment Reminder:</span> Please ensure payment is completed before delivery.`
              : ''}
          </td>
        </tr>
      </table>
    `)}

    ${trackingUrl ? section('🔗', 'Track Your Order', `
      <p style="margin:0 0 16px;font-size:13px;color:${B.muted};line-height:1.7;">
        Use this link to track your order status in real-time:
      </p>
      ${cta(trackingUrl, `📍 Track Order #${orderId}`)}
    `) : ''}

    <!-- CTA row -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation" style="margin:28px 0;">
      <tr>
        <td align="center" style="padding-bottom:12px;">
          <p style="margin:0 0 16px;font-size:13px;color:${B.muted};">Questions about your order?</p>
        </td>
      </tr>
      <tr class="btn-row">
        <td align="center">
          <table cellpadding="0" cellspacing="0" border="0" role="presentation">
            <tr>
              <td style="padding-right:12px;">${cta('tel:+919637655556', '📞 Call Us')}</td>
              <td>${cta('https://wa.me/919637655556', '💬 WhatsApp', '#25D366')}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;

  const html = shell(
    `Order #${orderId} confirmed! Track at ${trackingUrl || 'orders.stellarglobalsupplies.com'}`,
    B.teal,
    body,
  );

  const text = `Stellar Global Supplies — Order Confirmed\n\nHi ${order.customer_name},\n\nOrder #${orderId} confirmed!\n\nProduct: ${order.product_type}\nMaterial: ${order.material}\nQuantity: ${order.quantity} ${order.unit}\nSale Cost: ${formatCurrency(order.sale_cost)}\nDelivery: ${formatDate(order.delivery_timeline)}\n${trackingUrl ? `\nTrack: ${trackingUrl}` : ''}\n\nContact: +91 96376 55556`.trim();

  return { subject, html, text };
}

/* ════════════════════════════════════════════════════════════════════════════
   2. STATUS UPDATE
════════════════════════════════════════════════════════════════════════════ */
function buildStatusUpdateEmail(order) {
  const orderId     = order.id.slice(0, 8).toUpperCase();
  const s           = STATUS[order.status] || STATUS['Order Received'];
  const trackingUrl = order.tracking_token
    ? `https://orders.stellarglobalsupplies.com/track/${order.tracking_token}`
    : null;
  const subject = `${s.emoji} Order ${order.status} — #${orderId} | Stellar Global Supplies`;

  const MESSAGES = {
    'Processing':        "Great news! Your order is now being processed by our team. We're carefully preparing everything to meet your specifications.",
    'Ready to Dispatch': "Your order is packed and ready to go! It will be dispatched very shortly. Get ready to receive your delivery.",
    'Delivered':         "Your order has been successfully delivered. We hope you're completely satisfied. Thank you for trusting Stellar Global Supplies!",
  };

  const msg = MESSAGES[order.status] || 'Your order status has been updated. We will keep you informed as it progresses.';

  const body = `
    <!-- Status hero -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation"
      style="background:${s.bg};border-radius:14px;border:1.5px solid ${s.bar}33;margin-bottom:28px;">
      <tr><td style="height:4px;background:${s.bar};border-radius:14px 14px 0 0;font-size:0;">&nbsp;</td></tr>
      <tr>
        <td style="padding:28px;text-align:center;">
          <div style="font-size:52px;margin-bottom:14px;">${s.emoji}</div>
          <h1 style="margin:0 0 10px;font-size:23px;font-weight:800;color:${B.navy};letter-spacing:-0.3px;">
            Order ${order.status}
          </h1>
          <p style="margin:0 0 16px;font-size:14px;color:${B.muted};line-height:1.7;max-width:420px;display:inline-block;">
            Hi <strong style="color:${B.text};">${order.customer_name}</strong>, ${msg}
          </p>
          <br/>
          ${pill(order.status)}
        </td>
      </tr>
    </table>

    <!-- Order ref banner -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation"
      style="background:${B.grey};border-radius:10px;margin-bottom:20px;">
      <tr>
        <td style="padding:14px 20px;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation">
            <tr>
              <td style="font-size:12px;color:${B.muted};font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Order Reference</td>
              <td align="right" style="font-size:15px;font-weight:800;color:${B.navy};font-family:monospace;">#${orderId}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    ${section('📋', 'Order Details', detailRows(order))}

    ${order.payment_status !== 'Paid' ? `
    <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation"
      style="background:#FFFBEB;border:1.5px solid #F59E0B;border-radius:10px;margin-top:16px;">
      <tr><td style="padding:14px 18px;font-size:13px;color:#B45309;line-height:1.6;">
        <strong>⚠ Payment Reminder:</strong> Please ensure your payment is completed before or on delivery.
      </td></tr>
    </table>` : ''}

    ${trackingUrl ? section('🔗', 'Live Order Tracking', `
      <p style="margin:0 0 16px;font-size:13px;color:${B.muted};line-height:1.7;">
        Track the latest status of your order anytime:
      </p>
      ${cta(trackingUrl, `📍 Track Order #${orderId}`)}
    `) : ''}

    ${order.invoice_url ? section('📄', 'Invoice', `
      <p style="margin:0 0 16px;font-size:13px;color:${B.muted};line-height:1.7;">
        Your invoice is attached to this email and also available for download for 7 days:
      </p>
      ${cta(order.invoice_url, '📥 Download Invoice')}
    `) : ''}

    <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation"
      style="margin:28px 0;border-top:1px solid ${B.border};padding-top:24px;">
      <tr>
        <td align="center" style="padding-bottom:16px;">
          <p style="margin:0;font-size:13px;color:${B.muted};">Need assistance with your order?</p>
        </td>
      </tr>
      <tr class="btn-row">
        <td align="center">
          <table cellpadding="0" cellspacing="0" border="0" role="presentation">
            <tr>
              <td style="padding-right:12px;">${cta('tel:+919637655556', '📞 Call Us')}</td>
              <td>${cta('https://wa.me/919637655556', '💬 WhatsApp', '#25D366')}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;

  const html = shell(
    `Order #${orderId} is now: ${order.status}. ${trackingUrl ? `Track: ${trackingUrl}` : ''}`,
    s.bar,
    body,
  );

  const text = `Stellar Global Supplies — Order Update\n\nHi ${order.customer_name},\n\nYour order #${orderId} is now: ${order.status}\n\n${msg}\n\nProduct: ${order.product_type}\nQuantity: ${order.quantity} ${order.unit}\nDelivery: ${formatDate(order.delivery_timeline)}\n${trackingUrl ? `\nTrack: ${trackingUrl}` : ''}\n\nContact: +91 96376 55556`.trim();

  return { subject, html, text };
}

/* ════════════════════════════════════════════════════════════════════════════
   3. DELAY NOTIFICATION
════════════════════════════════════════════════════════════════════════════ */
function buildDelayNotificationEmail(order) {
  const orderId     = order.id.slice(0, 8).toUpperCase();
  const trackingUrl = order.tracking_token
    ? `https://orders.stellarglobalsupplies.com/track/${order.tracking_token}`
    : null;
  const subject = `⏳ Delivery Update for Order #${orderId} — Stellar Global Supplies`;

  const body = `
    <!-- Delay hero -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation"
      style="background:#FFFBEB;border-radius:14px;border:1.5px solid #F59E0B33;margin-bottom:28px;">
      <tr><td style="height:4px;background:#F59E0B;border-radius:14px 14px 0 0;font-size:0;">&nbsp;</td></tr>
      <tr>
        <td style="padding:28px;text-align:center;">
          <div style="font-size:52px;margin-bottom:14px;">⏳</div>
          <h1 style="margin:0 0 10px;font-size:23px;font-weight:800;color:${B.navy};">Delivery Rescheduled</h1>
          <p style="margin:0;font-size:14px;color:${B.muted};line-height:1.7;max-width:400px;display:inline-block;">
            Hi <strong style="color:${B.text};">${order.customer_name}</strong>, we sincerely apologise for the delay.
            Your order is still being carefully prepared and we're committed to getting it to you as soon as possible.
          </p>
        </td>
      </tr>
    </table>

    <!-- New date highlight -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation"
      style="background:#fff;border:2px solid #F59E0B;border-radius:12px;margin-bottom:20px;">
      <tr>
        <td style="padding:20px;text-align:center;">
          <div style="font-size:11px;font-weight:800;color:${B.muted};text-transform:uppercase;letter-spacing:0.7px;margin-bottom:6px;">New Delivery Date</div>
          <div style="font-size:26px;font-weight:800;color:#B45309;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">${formatDate(order.delivery_timeline)}</div>
        </td>
      </tr>
    </table>

    ${section('📋', 'Order Details', detailRows(order))}

    ${trackingUrl ? section('🔗', 'Track Your Order', `
      <p style="margin:0 0 16px;font-size:13px;color:${B.muted};line-height:1.7;">
        Monitor your order status in real-time:
      </p>
      ${cta(trackingUrl, `📍 Track Order #${orderId}`)}
    `) : ''}

    <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation" style="margin:28px 0;">
      <tr><td align="center" style="padding-bottom:16px;">
        <p style="margin:0;font-size:13px;color:${B.muted};">We're here to help with any questions.</p>
      </td></tr>
      <tr class="btn-row">
        <td align="center">
          <table cellpadding="0" cellspacing="0" border="0" role="presentation">
            <tr>
              <td style="padding-right:12px;">${cta('tel:+919637655556', '📞 Call Us')}</td>
              <td>${cta('https://wa.me/919637655556', '💬 WhatsApp', '#25D366')}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;

  const html = shell(
    `Delivery for order #${orderId} has been rescheduled to ${formatDate(order.delivery_timeline)}.`,
    '#F59E0B',
    body,
  );

  const text = `Stellar Global Supplies — Delivery Update\n\nHi ${order.customer_name},\n\nWe're sorry — your order #${orderId} delivery has been rescheduled.\n\nNew Delivery Date: ${formatDate(order.delivery_timeline)}\n\nProduct: ${order.product_type}\nQuantity: ${order.quantity} ${order.unit}\n${trackingUrl ? `\nTrack: ${trackingUrl}` : ''}\n\nContact: +91 96376 55556`.trim();

  return { subject, html, text };
}

module.exports = { buildOrderConfirmationEmail, buildStatusUpdateEmail, buildDelayNotificationEmail };