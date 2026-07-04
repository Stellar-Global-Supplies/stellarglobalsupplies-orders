import { format } from 'date-fns';
import { isInvoiceValid } from './api';

const BUSINESS_NUMBER = process.env.REACT_APP_WHATSAPP_NUMBER || '919637655556';

export function buildWhatsAppMessage(order) {
  const deliveryDate = order.delivery_timeline
    ? format(new Date(order.delivery_timeline), 'dd MMM yyyy')
    : 'TBD';

  const lines = [
    `*Stellar Global Supplies - Order Update*`,
    ``,
    `Dear *${order.customer_name}*,`,
    ``,
    `Your order details are as follows:`,
    ``,
    `*Order ID:* #${order.id.slice(0, 8).toUpperCase()}`,
    `*Product:* ${order.product_type}`,
    `*Material:* ${order.material}`,
    `*Quantity:* ${order.quantity} ${order.unit}`,
    `*Sale Cost:* Rs.${Number(order.sale_cost).toLocaleString('en-IN')}`,
    `*Payment Status:* ${order.payment_status}`,
    `*Delivery Timeline:* ${deliveryDate}`,
    `*Order Status:* ${order.status}`,
    ``,
  ];

  // Tracking URL
  if (order.tracking_token) {
    lines.push(`*Track your order:* https://orders.stellarglobalsupplies.com/track/${order.tracking_token}`);
    lines.push(``);
  }

  // FIX: Use shared isInvoiceValid helper for consistent expiry logic
  if (order.invoice_url) {
    if (isInvoiceValid(order)) {
      lines.push(`*Invoice (valid for 7 days):* ${order.invoice_url}`);
    } else {
      lines.push(`*Invoice:* The download link has expired (valid for 7 days after delivery). Please contact us to request a new copy.`);
    }
    lines.push(``);
  }

  // Payment reminder
  if (order.payment_status !== 'Paid') {
    lines.push(`*Note:* Please pay the remaining amount (if any) before delivery.`);
    lines.push(``);
  }

  lines.push(`For any queries, call us at +91 96376 55556.`);
  lines.push(``);
  lines.push(`Visit: stellarglobalsupplies.com for more products.`);
  lines.push(``);
  lines.push(`Thank you for choosing Stellar Global Supplies!`);
  lines.push(`_India's Most Reliable Industrial Supply Partner_`);

  const message = encodeURIComponent(lines.join('\n'));
  const phone = order.phone.replace(/\D/g, '');
  const whatsappPhone = phone.startsWith('91') ? phone : `91${phone}`;

  return `https://wa.me/${whatsappPhone}?text=${message}`;
}

export function buildBusinessWhatsAppMessage(order) {
  const deliveryDate = order.delivery_timeline
    ? format(new Date(order.delivery_timeline), 'dd MMM yyyy')
    : 'TBD';

  const trackingUrl = order.tracking_token
    ? `https://orders.stellarglobalsupplies.com/track/${order.tracking_token}`
    : null;

  const lines = [
    `*New Order Received - Stellar OMS*`,
    ``,
    `*Order ID:* #${order.id.slice(0, 8).toUpperCase()}`,
    `*Customer:* ${order.customer_name}`,
    `*Phone:* ${order.phone}`,
    `*Email:* ${order.email}`,
    ``,
    `*Product:* ${order.product_type}`,
    `*Material:* ${order.material}`,
    `*Quantity:* ${order.quantity} ${order.unit}`,
    `*Sale Cost:* Rs.${Number(order.sale_cost).toLocaleString('en-IN')}`,
    `*Payment:* ${order.payment_status}`,
    `*Delivery:* ${deliveryDate}`,
    ``,
    `*Status:* ${order.status}`,
  ];

  if (trackingUrl) {
    lines.push(`*Track Order:* ${trackingUrl}`);
    lines.push(``);
  }

  if (order.invoice_url) {
    if (isInvoiceValid(order)) {
      lines.push(`*Invoice:* ${order.invoice_url}`);
    } else {
      lines.push(`*Invoice:* Link expired — contact customer to resend`);
    }
    lines.push(``);
  }

  const message = encodeURIComponent(lines.join('\n'));
  return `https://wa.me/${BUSINESS_NUMBER}?text=${message}`;
}
