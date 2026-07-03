import { format } from 'date-fns';

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

  // Add tracking URL
  if (order.tracking_token) {
    lines.push(`*Track your order:* https://orders.stellarglobalsupplies.com/track/${order.tracking_token}`);
    lines.push(``);
  }

  // Add invoice link if available (with 7-day expiration note)
  if (order.invoice_url) {
    const invoiceNote = order.invoice_uploaded_at && new Date(order.invoice_uploaded_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      ? `*Invoice (valid for 7 days):* ${order.invoice_url}`
      : `*Invoice:* Contact us to get your invoice (link expired after 7 days)`;
    lines.push(invoiceNote);
    lines.push(``);
  }

  // Add payment reminder if not fully paid
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

  const message = encodeURIComponent(lines.join('\n'));
  return `https://wa.me/${BUSINESS_NUMBER}?text=${message}`;
}
