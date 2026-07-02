import nodemailer from 'nodemailer'
import { google } from 'googleapis'

// ---------------------------------------------------------------------------
// Gmail OAuth2 transport (replaces SendGrid)
// Required env vars:
//   GMAIL_CLIENT_ID
//   GMAIL_CLIENT_SECRET
//   GMAIL_REFRESH_TOKEN
//   GMAIL_USER            (the Gmail address sending mail, e.g. stellarglobalsupplies@gmail.com)
// See docs/GMAIL_OAUTH_SETUP.md for how to generate these.
// ---------------------------------------------------------------------------

const OAUTH_REDIRECT_URI = 'https://developers.google.com/oauthplayground'

const oAuth2Client = new google.auth.OAuth2(
  process.env.GMAIL_CLIENT_ID,
  process.env.GMAIL_CLIENT_SECRET,
  OAUTH_REDIRECT_URI
)

oAuth2Client.setCredentials({
  refresh_token: process.env.GMAIL_REFRESH_TOKEN,
})

interface EmailOptions {
  to: string
  subject: string
  html: string
  from?: string
}

async function getTransporter() {
  const accessToken = await oAuth2Client.getAccessToken()

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: process.env.GMAIL_USER,
      clientId: process.env.GMAIL_CLIENT_ID,
      clientSecret: process.env.GMAIL_CLIENT_SECRET,
      refreshToken: process.env.GMAIL_REFRESH_TOKEN,
      accessToken: typeof accessToken === 'string' ? accessToken : accessToken?.token || '',
    },
  })
}

export async function sendEmail(options: EmailOptions) {
  try {
    const transporter = await getTransporter()

    const info = await transporter.sendMail({
      from: options.from || `"Stellar Global Supplies" <${process.env.GMAIL_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
    })

    console.log(`Email sent to ${options.to} (messageId: ${info.messageId})`)
    return true
  } catch (error) {
    console.error('Gmail send error:', error)
    return false
  }
}

// ---------------------------------------------------------------------------
// Brand tokens — sourced from stellarglobalsupplies.com
//   primary teal : #00B98E (site theme-color)
//   dark teal    : #0F2A24 (header/footer)
//   accent amber : #F5A623 (CTAs)
// ---------------------------------------------------------------------------
const BRAND = {
  primary: '#00B98E',
  primaryDark: '#00A17A',
  dark: '#0F2A24',
  amber: '#F5A623',
  bg: '#F4FBF9',
  text: '#1F2A28',
  muted: '#5B6B67',
}

function emailShell(bodyHtml: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>
          body { margin: 0; padding: 0; background-color: ${BRAND.bg}; font-family: -apple-system, 'Segoe UI', Roboto, Arial, sans-serif; color: ${BRAND.text}; }
          .wrapper { width: 100%; padding: 24px 0; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 1px 4px rgba(15,42,36,0.08); }
          .header { background-color: ${BRAND.dark}; padding: 24px 28px; }
          .logo { font-size: 20px; font-weight: 700; color: #ffffff; letter-spacing: 0.2px; }
          .tagline { color: ${BRAND.primary}; font-size: 12px; margin-top: 4px; letter-spacing: 0.4px; text-transform: uppercase; }
          .content { padding: 28px; }
          .order-details { background-color: ${BRAND.bg}; border: 1px solid #DCEFEA; padding: 16px 18px; border-radius: 8px; margin: 20px 0; }
          .order-details p { margin: 6px 0; }
          .status-badge { display: inline-block; padding: 7px 14px; background-color: ${BRAND.primary}; color: #ffffff; border-radius: 999px; font-weight: 600; font-size: 13px; letter-spacing: 0.2px; }
          table { width: 100%; border-collapse: collapse; margin: 18px 0; }
          th, td { padding: 10px; text-align: left; border-bottom: 1px solid #E6EEEC; font-size: 14px; }
          th { background-color: ${BRAND.bg}; font-weight: 600; color: ${BRAND.dark}; }
          .cta { display: inline-block; margin-top: 8px; padding: 12px 22px; background-color: ${BRAND.amber}; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px; }
          .footer { text-align: center; color: ${BRAND.muted}; font-size: 12px; padding: 22px 20px; background-color: ${BRAND.bg}; }
          .footer a { color: ${BRAND.primaryDark}; text-decoration: none; }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="container">
            <div class="header">
              <div class="logo">Stellar Global Supplies</div>
              <div class="tagline">Order Management System</div>
            </div>
            <div class="content">
              ${bodyHtml}
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Stellar Global Supplies &middot; Talawade, Pune &middot; +91 9637655556</p>
              <p><a href="https://stellarglobalsupplies.com">stellarglobalsupplies.com</a></p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `
}

export function generateOrderEmailTemplate(orderData: any): string {
  const { customer_name, id, status, total_amount, delivery_timeline, items } = orderData

  const body = `
    <h2 style="margin-top:0;color:${BRAND.dark};">Order Confirmation</h2>
    <p>Dear ${customer_name},</p>
    <p>Thank you for your order! Here are the details:</p>

    <div class="order-details">
      <p><strong>Order ID:</strong> ${id.substring(0, 8)}</p>
      <p><strong>Status:</strong> <span class="status-badge">${status}</span></p>
      <p><strong>Total Amount:</strong> ₹${Number(total_amount).toLocaleString('en-IN')}</p>
      <p><strong>Delivery Timeline:</strong> ${delivery_timeline}</p>
    </div>

    <h3 style="color:${BRAND.dark};">Order Items</h3>
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

    <p>We will keep you updated on your order status. If you have any questions, just reply to this email or call us.</p>
    <a class="cta" href="https://stellarglobalsupplies.com">Visit Our Website</a>
  `

  return emailShell(body)
}

export function generateStatusChangeEmailTemplate(orderData: any, newStatus: string): string {
  const { customer_name, id } = orderData

  const statusMessages: Record<string, string> = {
    'Order Received': 'We have received your order and are processing it.',
    'Processing': 'Your order is currently being processed.',
    'Ready to Dispatch': 'Your order is ready for dispatch and will be shipped soon.',
    'Delivered': 'Your order has been delivered. Thank you for your business!',
  }

  const body = `
    <h2 style="margin-top:0;color:${BRAND.dark};">Order Status Update</h2>
    <p>Dear ${customer_name},</p>

    <p>Your order <strong>#${id.substring(0, 8)}</strong> status has been updated to:</p>
    <p style="text-align:center;margin:20px 0;">
      <span class="status-badge">${newStatus}</span>
    </p>

    <p>${statusMessages[newStatus] || ''}</p>
    <p>Track your order anytime on our dashboard.</p>
  `

  return emailShell(body)
}
