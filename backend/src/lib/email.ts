import sgMail from '@sendgrid/mail'

sgMail.setApiKey(process.env.SENDGRID_API_KEY || '')

interface EmailOptions {
  to: string
  subject: string
  html: string
  from?: string
}

export async function sendEmail(options: EmailOptions) {
  try {
    const msg = {
      to: options.to,
      from: options.from || process.env.SENDGRID_FROM_EMAIL || 'noreply@stellarglobalsupplies.com',
      subject: options.subject,
      html: options.html,
    }

    await sgMail.send(msg as any)
    console.log(`Email sent to ${options.to}`)
    return true
  } catch (error) {
    console.error('SendGrid error:', error)
    return false
  }
}

export function generateOrderEmailTemplate(orderData: any): string {
  const { customer_name, id, status, total_amount, delivery_timeline, items } = orderData

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 8px; }
          .header { border-bottom: 3px solid #0066cc; padding-bottom: 20px; margin-bottom: 20px; }
          .logo { font-size: 24px; font-weight: bold; color: #0066cc; }
          .order-details { background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .status-badge { display: inline-block; padding: 8px 12px; background-color: #0066cc; color: white; border-radius: 4px; font-weight: bold; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
          th { background-color: #f0f0f0; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">Stellar Global Supplies</div>
            <p style="color: #666; margin: 5px 0 0 0;">Order Management System</p>
          </div>

          <h2>Order Confirmation</h2>
          <p>Dear ${customer_name},</p>
          <p>Thank you for your order! Here are the details:</p>

          <div class="order-details">
            <p><strong>Order ID:</strong> ${id.substring(0, 8)}</p>
            <p><strong>Status:</strong> <span class="status-badge">${status}</span></p>
            <p><strong>Total Amount:</strong> ₹${Number(total_amount).toLocaleString('en-IN')}</p>
            <p><strong>Delivery Timeline:</strong> ${delivery_timeline}</p>
          </div>

          <h3>Order Items</h3>
          <table>
            <thead>
              <tr>
                <th>SKU</th>
                <th>Material</th>
                <th>Quantity</th>
                <th>Unit</th>
                <th>Cost</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${items.map((item: any) => `
                <tr>
                  <td>${item.sku}</td>
                  <td>${item.material}</td>
                  <td>${item.quantity}</td>
                  <td>${item.unit}</td>
                  <td>₹${Number(item.sale_cost).toLocaleString('en-IN')}</td>
                  <td>₹${Number(item.subtotal).toLocaleString('en-IN')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <p>We will keep you updated on your order status. If you have any questions, please contact us.</p>

          <div class="footer">
            <p>&copy; 2026 Stellar Global Supplies. All rights reserved.</p>
            <p><a href="https://stellarglobalsupplies.com" style="color: #0066cc;">Visit our website</a></p>
          </div>
        </div>
      </body>
    </html>
  `
}

export function generateStatusChangeEmailTemplate(orderData: any, newStatus: string): string {
  const { customer_name, id } = orderData

  const statusMessages: Record<string, string> = {
    'Order Received': 'We have received your order and are processing it.',
    'Processing': 'Your order is currently being processed.',
    'Ready to Dispatch': 'Your order is ready for dispatch and will be shipped soon.',
    'Delivered': 'Your order has been delivered. Thank you for your business!',
  }

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 8px; }
          .header { border-bottom: 3px solid #0066cc; padding-bottom: 20px; margin-bottom: 20px; }
          .logo { font-size: 24px; font-weight: bold; color: #0066cc; }
          .status-badge { display: inline-block; padding: 8px 12px; background-color: #0066cc; color: white; border-radius: 4px; font-weight: bold; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">Stellar Global Supplies</div>
          </div>

          <h2>Order Status Update</h2>
          <p>Dear ${customer_name},</p>

          <p>Your order <strong>#${id.substring(0, 8)}</strong> status has been updated to:</p>
          <p style="text-align: center; margin: 20px 0;">
            <span class="status-badge">${newStatus}</span>
          </p>

          <p>${statusMessages[newStatus] || ''}</p>

          <p>Track your order anytime on our dashboard.</p>

          <div class="footer">
            <p>&copy; 2026 Stellar Global Supplies. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `
}
