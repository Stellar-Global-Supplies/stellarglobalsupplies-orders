/**
 * Branded email templates for Stellar Global Supplies OMS
 * Uses inline CSS for maximum email-client compatibility
 */

const BRAND = {
  teal:  '#00B98E',
  navy:  '#0D1F2D',
  slate: '#1E3448',
  light: '#E6F7F3',
  grey:  '#F8FAFB',
  text:  '#1A202C',
  muted: '#718096',
};

const STATUS_COLORS = {
  'Order Received':    { bg: '#EFF6FF', text: '#1D4ED8', label: 'Order Received' },
  'Processing':        { bg: '#FFFBEB', text: '#B45309', label: 'Processing'     },
  'Ready to Dispatch': { bg: '#F5F3FF', text: '#6D28D9', label: 'Ready to Dispatch' },
  'Delivered':         { bg: '#ECFDF5', text: '#065F46', label: 'Delivered'      },
};

function formatDate(d) {
  if (!d) return 'TBD';
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatCurrency(n) {
  return `₹${Number(n).toLocaleString('en-IN')}`;
}

function baseLayout(content, preheader = '') {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Stellar Global Supplies</title>
  <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
</head>
<body style="margin:0;padding:0;background:#F1F5F9;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  ${preheader ? `<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${preheader}&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;</div>` : ''}

  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F1F5F9;">
    <tr><td align="center" style="padding:32px 16px;">

      <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;">

        <!-- HEADER -->
        <tr>
          <td style="background:${BRAND.navy};border-radius:14px 14px 0 0;padding:28px 36px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td>
                  <table cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td style="background:${BRAND.teal};border-radius:8px;width:44px;height:44px;text-align:center;vertical-align:middle;">
                        <span style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:18px;font-weight:800;color:#fff;letter-spacing:-0.5px;">SG</span>
                      </td>
                      <td style="padding-left:12px;">
                        <div style="font-size:15px;font-weight:700;color:#fff;letter-spacing:0.2px;">Stellar Global Supplies</div>
                        <div style="font-size:11px;color:${BRAND.teal};letter-spacing:0.8px;text-transform:uppercase;font-weight:500;margin-top:2px;">Order Management</div>
                      </td>
                    </tr>
                  </table>
                </td>
                <td align="right">
                  <div style="font-size:12px;color:rgba(255,255,255,0.5);">orders.stellarglobalsupplies.com</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- BODY -->
        <tr>
          <td style="background:#fff;padding:0;">
            ${content}
          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td style="background:${BRAND.navy};border-radius:0 0 14px 14px;padding:24px 36px;text-align:center;">
            <p style="margin:0 0 8px;font-size:13px;color:rgba(255,255,255,0.6);">
              Stellar Global Supplies — India's Most Reliable Industrial Supply Partner
            </p>
            <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.35);">
              📞 +91 96376 55556 &nbsp;|&nbsp; 📧 stellarglobalsupplies@gmail.com &nbsp;|&nbsp; 🌐 stellarglobalsupplies.com
            </p>
            <p style="margin:8px 0 0;font-size:11px;color:rgba(255,255,255,0.25);">
              © ${new Date().getFullYear()} Stellar Global Supplies. All rights reserved.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function orderDetailsTable(order) {
  const rows = [
    ['Product Type', order.product_type],
    ['Material',     order.material],
    ['Quantity',     `${order.quantity} ${order.unit}`],
    ['Sale Cost',    formatCurrency(order.sale_cost)],
    ['Payment',      order.payment_status],
    ['Delivery',     formatDate(order.delivery_timeline)],
  ];

  return `
  <table width="100%" cellpadding="0" cellspacing="0" border="0"
    style="border:1.5px solid #E2E8F0;border-radius:10px;overflow:hidden;margin:20px 0;">
    ${rows.map(([label, val], i) => `
    <tr style="background:${i % 2 === 0 ? '#fff' : '#F8FAFB'};">
      <td style="padding:11px 16px;font-size:13px;color:${BRAND.muted};font-weight:500;width:40%;border-bottom:1px solid #EEF2F5;">${label}</td>
      <td style="padding:11px 16px;font-size:13px;color:${BRAND.text};font-weight:600;border-bottom:1px solid #EEF2F5;">${val}</td>
    </tr>`).join('')}
  </table>`;
}

function statusPill(status) {
  const s = STATUS_COLORS[status] || STATUS_COLORS['Order Received'];
  return `<span style="display:inline-block;background:${s.bg};color:${s.text};padding:4px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:0.3px;">${s.label}</span>`;
}

// ── Order Confirmation (on creation) ─────────────────────────────────────────
function buildOrderConfirmationEmail(order) {
  const orderId = order.id.slice(0, 8).toUpperCase();
  const subject = `Order Confirmed - #${orderId} | Stellar Global Supplies`;
  const trackingUrl = order.tracking_token 
    ? `https://orders.stellarglobalsupplies.com/track/${order.tracking_token}`
    : null;

  const content = `
    <div style="padding:36px 36px 0;border-bottom:3px solid ${BRAND.teal};">
      <div style="background:${BRAND.light};border-radius:10px;padding:20px 24px;display:inline-block;margin-bottom:24px;">
        <span style="font-size:28px;">🎉</span>
        <span style="font-size:17px;font-weight:700;color:${BRAND.teal};margin-left:10px;">Order Confirmed!</span>
      </div>
      <h2 style="margin:0 0 8px;font-size:22px;font-weight:700;color:${BRAND.navy};">
        Thank you, ${order.customer_name}!
      </h2>
      <p style="margin:0 0 20px;font-size:14px;color:${BRAND.muted};line-height:1.7;">
        We've received your order and our team will begin processing it shortly.
        You'll receive updates at every stage of your order's journey.
      </p>
    </div>

    <div style="padding:28px 36px;">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
        <span style="font-size:13px;font-weight:700;color:${BRAND.navy};text-transform:uppercase;letter-spacing:0.5px;">Order Summary</span>
        <span style="font-family:monospace;font-size:13px;background:#F1F5F9;padding:3px 10px;border-radius:6px;color:${BRAND.muted};">#${orderId}</span>
      </div>
      ${orderDetailsTable(order)}

      <div style="background:${BRAND.grey};border-radius:10px;padding:18px 20px;margin-top:20px;">
        <div style="font-size:12px;font-weight:700;color:${BRAND.muted};text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;">Current Status</div>
        ${statusPill(order.status)}
        <p style="margin:10px 0 0;font-size:13px;color:${BRAND.muted};line-height:1.6;">
          We'll notify you as your order progresses. Expected delivery by
          <strong style="color:${BRAND.navy};">${formatDate(order.delivery_timeline)}</strong>.
        </p>
        ${order.payment_status !== 'Paid' ? `
        <p style="margin:8px 0 0;font-size:13px;color:#B45309;line-height:1.6;">
          <strong>Note:</strong> Please pay the remaining amount (if any) before delivery.
        </p>
        ` : ''}
      </div>

      ${trackingUrl ? `
      <div style="margin-top:20px;padding:16px 20px;background:${BRAND.light};border-radius:10px;border:1px solid ${BRAND.teal}22;">
        <div style="font-size:12px;font-weight:700;color:${BRAND.muted};text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;">Track Your Order</div>
        <p style="margin:0 0 12px;font-size:13px;color:${BRAND.text};">
          Use this link to track your order status anytime:
        </p>
        <a href="${trackingUrl}" style="display:inline-block;background:${BRAND.teal};color:#fff;text-decoration:none;padding:10px 20px;border-radius:7px;font-size:13px;font-weight:600;">
          📍 Track Order #${orderId}
        </a>
      </div>
      ` : ''}

      ${order.invoice_url ? `
      <div style="margin-top:20px;padding:16px 20px;background:${BRAND.light};border-radius:10px;border:1px solid ${BRAND.teal}22;">
        <div style="font-size:12px;font-weight:700;color:${BRAND.muted};text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;">Invoice</div>
        <p style="margin:0 0 12px;font-size:13px;color:${BRAND.text};">
          Your invoice is ready for download:
        </p>
        <a href="${order.invoice_url}" style="display:inline-block;background:${BRAND.teal};color:#fff;text-decoration:none;padding:10px 20px;border-radius:7px;font-size:13px;font-weight:600;">
          📥 Download Invoice
        </a>
      </div>
      ` : ''}

      <div style="margin-top:28px;text-align:center;">
        <p style="font-size:13px;color:${BRAND.muted};margin:0 0 16px;">Questions about your order?</p>
        <table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">
          <tr>
            <td style="padding-right:10px;">
              <a href="tel:+919637655556" style="display:inline-block;background:${BRAND.teal};color:#fff;text-decoration:none;padding:11px 22px;border-radius:7px;font-size:13px;font-weight:700;">
                📞 Call Us
              </a>
            </td>
            <td>
              <a href="https://wa.me/919637655556" style="display:inline-block;background:#25D366;color:#fff;text-decoration:none;padding:11px 22px;border-radius:7px;font-size:13px;font-weight:700;">
                💬 WhatsApp
              </a>
            </td>
          </tr>
        </table>
      </div>
    </div>
  `;

  const html = baseLayout(content, `Your order #${orderId} has been confirmed. Track at: ${trackingUrl || 'N/A'}`);

  const text = `
Stellar Global Supplies — Order Confirmed

Hi ${order.customer_name},

Your order #${orderId} has been confirmed!

Order Details:
- Product: ${order.product_type}
- Material: ${order.material}
- Quantity: ${order.quantity} ${order.unit}
- Sale Cost: ${formatCurrency(order.sale_cost)}
- Payment: ${order.payment_status}
- Delivery: ${formatDate(order.delivery_timeline)}
- Status: ${order.status}

Thank you for choosing Stellar Global Supplies.
Contact us: +91 96376 55556
  `.trim();

  return { subject, html, text };
}

// ── Status Update Email ───────────────────────────────────────────────────────
// ── Delay Notification Email ───────────────────────────────────────────────────
function buildDelayNotificationEmail(order) {
  const orderId = order.id.slice(0, 8).toUpperCase();
  const trackingUrl = order.tracking_token 
    ? `https://orders.stellarglobalsupplies.com/track/${order.tracking_token}`
    : null;
  const subject = `Order Delay Notice - #${orderId} | Stellar Global Supplies`;

  const content = `
    <div style="padding:36px 36px 0;border-bottom:3px solid ${BRAND.teal};">
      <div style="background:${BRAND.light};border-radius:10px;padding:20px 24px;display:inline-block;margin-bottom:24px;">
        <span style="font-size:28px;">⏳</span>
        <span style="font-size:17px;font-weight:700;color:${BRAND.teal};margin-left:10px;">Delivery Delayed</span>
      </div>
      <h2 style="margin:0 0 8px;font-size:22px;font-weight:700;color:${BRAND.navy};">
        Order Update, ${order.customer_name}
      </h2>
      <p style="margin:0 0 20px;font-size:14px;color:${BRAND.muted};line-height:1.7;">
        We wanted to inform you that your order delivery has been delayed. We apologize for any inconvenience 
        and are working to get your order to you as soon as possible.
      </p>
    </div>

    <div style="padding:28px 36px;">
      <div style="background:#FFFBEB;border:1.5px solid #F59E0B;border-radius:10px;padding:18px 20px;margin-bottom:24px;">
        <div style="font-size:12px;font-weight:700;color:${BRAND.muted};text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;">
          New Delivery Date
        </div>
        <div style="font-size:18px;font-weight:700;color:#B45309;">
          ${formatDate(order.delivery_timeline)}
        </div>
      </div>

      <div style="margin-bottom:20px;">
        <div style="font-size:13px;font-weight:700;color:${BRAND.navy};text-transform:uppercase;letter-spacing:0.5px;margin-bottom:12px;">Order Details</div>
        ${orderDetailsTable(order)}
      </div>

      ${trackingUrl ? `
      <div style="margin-top:20px;padding:16px 20px;background:${BRAND.light};border-radius:10px;border:1px solid ${BRAND.teal}22;">
        <div style="font-size:12px;font-weight:700;color:${BRAND.muted};text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;">Track Your Order</div>
        <p style="margin:0 0 12px;font-size:13px;color:${BRAND.text};">
          Use this link to track your order status anytime:
        </p>
        <a href="${trackingUrl}" style="display:inline-block;background:${BRAND.teal};color:#fff;text-decoration:none;padding:10px 20px;border-radius:7px;font-size:13px;font-weight:600;">
          📍 Track Order #${orderId}
        </a>
      </div>
      ` : ''}

      <div style="margin-top:28px;text-align:center;">
        <p style="font-size:13px;color:${BRAND.muted};margin:0 0 16px;">Questions about your order?</p>
        <table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">
          <tr>
            <td style="padding-right:10px;">
              <a href="tel:+919637655556" style="display:inline-block;background:${BRAND.teal};color:#fff;text-decoration:none;padding:11px 22px;border-radius:7px;font-size:13px;font-weight:700;">
                📞 Call Us
              </a>
            </td>
            <td>
              <a href="https://wa.me/919637655556" style="display:inline-block;background:#25D366;color:#fff;text-decoration:none;padding:11px 22px;border-radius:7px;font-size:13px;font-weight:700;">
                💬 WhatsApp
              </a>
            </td>
          </tr>
        </table>
      </div>
    </div>
  `;

  const html = baseLayout(content, `Your order #${orderId} delivery has been delayed. New date: ${formatDate(order.delivery_timeline)}`);

  const text = `
Stellar Global Supplies — Order Delay Notice

Hi ${order.customer_name},

Your order #${orderId} delivery has been delayed.

New Delivery Date: ${formatDate(order.delivery_timeline)}

Order Details:
- Product: ${order.product_type}
- Material: ${order.material}
- Quantity: ${order.quantity} ${order.unit}
- Sale Cost: ${formatCurrency(order.sale_cost)}

We apologize for any inconvenience.

Contact us: +91 96376 55556
  `.trim();

  return { subject, html, text };
}

function buildStatusUpdateEmail(order) {
  const orderId = order.id.slice(0, 8).toUpperCase();
  const s = STATUS_COLORS[order.status] || STATUS_COLORS['Order Received'];
  const trackingUrl = order.tracking_token 
    ? `https://orders.stellarglobalsupplies.com/track/${order.tracking_token}`
    : null;

  const statusMessages = {
    'Processing':        { emoji: '⚙️', msg: 'Our team is currently processing your order. We\'re working hard to ensure everything is perfect for you.' },
    'Ready to Dispatch': { emoji: '📦', msg: 'Great news! Your order is packed and ready to be dispatched. It will be on its way to you very soon.' },
    'Delivered':         { emoji: '🎉', msg: 'Your order has been delivered! We hope you\'re satisfied with your purchase. Thank you for choosing Stellar Global Supplies.' },
  };

  const info = statusMessages[order.status] || { emoji: '📋', msg: 'Your order status has been updated.' };
  const subject = `Order Update: ${order.status} - #${orderId} | Stellar Global Supplies`;

  const content = `
    <div style="padding:36px 36px 0;border-bottom:3px solid ${s.text};">
      <div style="margin-bottom:20px;">
        <span style="font-size:36px;">${info.emoji}</span>
      </div>
      <h2 style="margin:0 0 8px;font-size:22px;font-weight:700;color:${BRAND.navy};">
        Order ${order.status}
      </h2>
      <p style="margin:0 0 20px;font-size:14px;color:${BRAND.muted};line-height:1.7;">
        Hi ${order.customer_name}, ${info.msg}
      </p>
    </div>

    <div style="padding:28px 36px;">
      <div style="background:${s.bg};border:1.5px solid ${s.text}22;border-radius:10px;padding:18px 20px;margin-bottom:24px;">
        <div style="font-size:12px;font-weight:700;color:${BRAND.muted};text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;">
          Order #${orderId} — Current Status
        </div>
        ${statusPill(order.status)}
      </div>

      <div style="margin-bottom:20px;">
        <div style="font-size:13px;font-weight:700;color:${BRAND.navy};text-transform:uppercase;letter-spacing:0.5px;margin-bottom:12px;">Order Details</div>
        ${orderDetailsTable(order)}
      </div>

      ${order.payment_status !== 'Paid' ? `
      <div style="margin-top:20px;padding:14px 18px;background:#FFFBEB;border:1px solid #F59E0B;border-radius:8px;">
        <p style="margin:0;font-size:13px;color:#B45309;line-height:1.6;">
          <strong>Payment Reminder:</strong> Please pay the remaining amount (if any) before delivery.
        </p>
      </div>
      ` : ''}

      ${trackingUrl ? `
      <div style="margin-top:20px;padding:16px 20px;background:${BRAND.light};border-radius:10px;border:1px solid ${BRAND.teal}22;">
        <div style="font-size:12px;font-weight:700;color:${BRAND.muted};text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;">Track Your Order</div>
        <p style="margin:0 0 12px;font-size:13px;color:${BRAND.text};">
          Use this link to track your order status anytime:
        </p>
        <a href="${trackingUrl}" style="display:inline-block;background:${BRAND.teal};color:#fff;text-decoration:none;padding:10px 20px;border-radius:7px;font-size:13px;font-weight:600;">
          📍 Track Order #${orderId}
        </a>
      </div>
      ` : ''}

      ${order.invoice_url ? `
      <div style="margin-top:20px;padding:16px 20px;background:${BRAND.light};border-radius:10px;border:1px solid ${BRAND.teal}22;">
        <div style="font-size:12px;font-weight:700;color:${BRAND.muted};text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;">Invoice</div>
        <p style="margin:0 0 12px;font-size:13px;color:${BRAND.text};">
          Your invoice is ready for download:
        </p>
        <a href="${order.invoice_url}" style="display:inline-block;background:${BRAND.teal};color:#fff;text-decoration:none;padding:10px 20px;border-radius:7px;font-size:13px;font-weight:600;">
          📥 Download Invoice
        </a>
      </div>
      ` : ''}

      <div style="margin-top:28px;text-align:center;border-top:1px solid #EEF2F5;padding-top:24px;">
        <p style="font-size:13px;color:${BRAND.muted};margin:0 0 16px;">Need assistance with your order?</p>
        <table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">
          <tr>
            <td style="padding-right:10px;">
              <a href="tel:+919637655556" style="display:inline-block;background:${BRAND.teal};color:#fff;text-decoration:none;padding:11px 22px;border-radius:7px;font-size:13px;font-weight:700;">
                📞 Call Us
              </a>
            </td>
            <td>
              <a href="https://wa.me/919637655556" style="display:inline-block;background:#25D366;color:#fff;text-decoration:none;padding:11px 22px;border-radius:7px;font-size:13px;font-weight:700;">
                💬 WhatsApp
              </a>
            </td>
          </tr>
        </table>
      </div>
    </div>
  `;

  const html = baseLayout(content, `Your order #${orderId} is now: ${order.status}. Track at: ${trackingUrl || 'N/A'}`);

  const text = `
Stellar Global Supplies — Order Update

Hi ${order.customer_name},

Your order #${orderId} status has been updated to: ${order.status}

${info.msg}

Order Details:
- Product: ${order.product_type}
- Material: ${order.material}
- Quantity: ${order.quantity} ${order.unit}
- Sale Cost: ${formatCurrency(order.sale_cost)}
- Delivery: ${formatDate(order.delivery_timeline)}

${trackingUrl ? `Track your order: ${trackingUrl}` : ''}

Contact us: +91 96376 55556
  `.trim();

  return { subject, html, text };
}

module.exports = { buildOrderConfirmationEmail, buildStatusUpdateEmail, buildDelayNotificationEmail };
