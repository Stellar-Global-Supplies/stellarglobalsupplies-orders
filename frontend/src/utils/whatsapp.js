import { format } from 'date-fns';
import { isInvoiceValid } from './api';

const BUSINESS_NUMBER = process.env.REACT_APP_WHATSAPP_NUMBER || '919637655556';
const TRACK_BASE      = 'https://orders.stellarglobalsupplies.com/track';

/**
 * FIX: Invoice pre-signed S3 URLs are 500+ characters -- far too long for WhatsApp.
 * Solution: Never send the raw S3 URL via WhatsApp. Instead:
 *  - Send the tracking page URL (always short: /track/{token})
 *  - The tracking page already shows the Download Invoice button
 *  - If no tracking token, tell the customer to check their email
 */

function fmt(n) {
  return Number(n).toLocaleString('en-IN');
}

export function buildWhatsAppMessage(order) {
  const orderId     = order.id.slice(0, 8).toUpperCase();
  const trackingUrl = order.tracking_token ? `${TRACK_BASE}/${order.tracking_token}` : null;
  const delivDate   = order.delivery_timeline
    ? format(new Date(order.delivery_timeline), 'dd MMM yyyy')
    : 'TBD';
  const invoiceOk = isInvoiceValid(order);

  const lines = [
    `*Stellar Global Supplies*`,
    `Order Update \u{1F4E6}`,
    ``,
    `Hello *${order.customer_name}*,`,
    ``,
    `Here's your order summary:`,
    ``,
    `\u{1F516} *#${orderId}*`,
    `\u{1F4E6} ${order.product_type} -- ${order.material}`,
    `\u{1F4D0} ${order.quantity} ${order.unit}`,
    `\u{1F4B0} \u20B9${fmt(order.sale_cost)} - ${order.payment_status}`,
    `\u{1F69A} ${delivDate}`,
    `\u{2705} *${order.status}*`,
  ];

  if (trackingUrl) {
    lines.push(``);
    lines.push(`\u{1F517} *Track your order:*`);
    lines.push(trackingUrl);
  }

  // FIX: instead of the raw S3 URL, point to the tracking page where
  // the invoice button lives. The URL stays short and always works.
  if (order.invoice_url) {
    lines.push(``);
    if (invoiceOk && trackingUrl) {
      lines.push(`\u{1F4C4} *Invoice:* Download from your tracking page above`);
    } else if (invoiceOk && !trackingUrl) {
      lines.push(`\u{1F4C4} *Invoice:* Check your email for the download link`);
    } else {
      lines.push(`\u{1F4C4} *Invoice:* Link expired -- reply here to request a new copy`);
    }
  }

  if (order.payment_status !== 'Paid') {
    lines.push(``);
    lines.push(`\u26A0\u26A0 *Payment Reminder*`);
    lines.push(`Your payment status: *${order.payment_status}*`);
    lines.push(`We'd appreciate it if you could complete your payment at the earliest. We're here to help if you have any questions!`);
  }

  lines.push(``);
  lines.push(`\u{1F4DE} +91 96376 55556`);
  lines.push(`\u{1F310} stellarglobalsupplies.com`);

  const phone = order.phone.replace(/\D/g, '');
  const wa    = phone.startsWith('91') ? phone : `91${phone}`;
  return `https://wa.me/${wa}?text=${encodeURIComponent(lines.join('\n'))}`;
}

export function buildBusinessWhatsAppMessage(order) {
  const orderId     = order.id.slice(0, 8).toUpperCase();
  const trackingUrl = order.tracking_token ? `${TRACK_BASE}/${order.tracking_token}` : null;
  const delivDate   = order.delivery_timeline
    ? format(new Date(order.delivery_timeline), 'dd MMM yyyy')
    : 'TBD';

  const lines = [
    `*New Order -- Stellar OMS*`,
    ``,
    `\u{1F516} *#${orderId}*`,
    `\u{1F464} ${order.customer_name}`,
    `\u{1F4F1} ${order.phone}`,
    `\u{1F4E7} ${order.email}`,
    ``,
    `\u{1F4E6} ${order.product_type} - ${order.material}`,
    `\u{1F4D0} ${order.quantity} ${order.unit}`,
    `\u{1F4B0} \u20B9${fmt(order.sale_cost)} - ${order.payment_status}`,
    `\u{1F69A} ${delivDate}`,
    `\u{1F4CD} ${order.status}`,
  ];

  if (trackingUrl) {
    lines.push(``);
    lines.push(`\u{1F517} ${trackingUrl}`);
  }

  return `https://wa.me/${BUSINESS_NUMBER}?text=${encodeURIComponent(lines.join('\n'))}`;
}