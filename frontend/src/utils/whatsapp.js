import { format } from 'date-fns';

const BUSINESS_NUMBER = process.env.REACT_APP_WHATSAPP_NUMBER || '919637655556';

export function buildWhatsAppMessage(order) {
  const deliveryDate = order.delivery_timeline
    ? format(new Date(order.delivery_timeline), 'dd MMM yyyy')
    : 'TBD';

  const lines = [
    `\u{1F31F} *Stellar Global Supplies - Order Update*`,
    ``,
    `Dear *${order.customer_name}*,`,
    ``,
    `Your order details are as follows:`,
    ``,
    `\u{1F4E6} *Order ID:* #${order.id.slice(0, 8).toUpperCase()}`,
    `\u{1F529} *Product:* ${order.product_type}`,
    `\u{1F3D7}\u{FE0F} *Material:* ${order.material}`,
    `\u{1F4D0} *Quantity:* ${order.quantity} ${order.unit}`,
    `\u{1F4B0} *Sale Cost:* \u{20B9}${Number(order.sale_cost).toLocaleString('en-IN')}`,
    `\u{1F4B3} *Payment Status:* ${order.payment_status}`,
    `\u{1F69A} *Delivery Timeline:* ${deliveryDate}`,
    `\u{1F4CB} *Order Status:* ${order.status}`,
    ``,
    `For any queries, call us at +91 96376 55556.`,
    ``,
    `Thank you for choosing Stellar Global Supplies! \u{1F64F}`,
    `_India's Most Reliable Industrial Supply Partner_`,
  ];

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
    `\u{1F4CB} *New Order Received - Stellar OMS*`,
    ``,
    `*Order ID:* #${order.id.slice(0, 8).toUpperCase()}`,
    `*Customer:* ${order.customer_name}`,
    `*Phone:* ${order.phone}`,
    `*Email:* ${order.email}`,
    ``,
    `*Product:* ${order.product_type}`,
    `*Material:* ${order.material}`,
    `*Quantity:* ${order.quantity} ${order.unit}`,
    `*Sale Cost:* \u{20B9}${Number(order.sale_cost).toLocaleString('en-IN')}`,
    `*Payment:* ${order.payment_status}`,
    `*Delivery:* ${deliveryDate}`,
    ``,
    `*Status:* ${order.status}`,
  ];

  const message = encodeURIComponent(lines.join('\n'));
  return `https://wa.me/${BUSINESS_NUMBER}?text=${message}`;
}
