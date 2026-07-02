export function generateWhatsAppMessage(orderData: any): string {
  const { customer_name, id, total_amount, items, delivery_timeline } = orderData

  const itemsSummary = items
    .map((item: any) => `${item.quantity}${item.unit} of ${item.material}`)
    .join(', ')

  return `🎉 *Hello ${customer_name}!*

✅ Your order has been received!

📋 *Order Details:*
Order ID: #${id.substring(0, 8)}
Total: ₹${Number(total_amount).toLocaleString('en-IN')}
Items: ${itemsSummary}
📅 Delivery: ${delivery_timeline}

👉 Track your order at: https://orders.stellarglobalsupplies.com

Thank you for choosing Stellar Global Supplies! 🙏

---
*Stellar Global Supplies*
Quality Products, Reliable Service`
}

export function generateStatusUpdateWhatsApp(customerName: string, orderId: string, newStatus: string): string {
  const statusEmojis: Record<string, string> = {
    'Order Received': '✅',
    'Processing': '⏳',
    'Ready to Dispatch': '📦',
    'Delivered': '🚚',
  }

  const emoji = statusEmojis[newStatus] || '📦'

  return `${emoji} *Order Status Update*

Hello ${customerName},

Your order #${orderId.substring(0, 8)} status has been updated to:

*${newStatus}* ✓

Track your order: https://orders.stellarglobalsupplies.com

Thank you! 🙏`
}
