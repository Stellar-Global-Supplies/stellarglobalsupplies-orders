# Gmail OAuth2 Email Setup Guide

## Overview

This guide walks you through setting up Gmail with OAuth2 authentication for sending emails from your Stellar Global Supplies order system.

## Prerequisites

- Google Cloud Project (free)
- Gmail account
- OAuth2 Client ID and Secret (you already have these)
- Node.js 18+

## What You Already Have

You mentioned you have:
- ✅ Google OAuth Client ID
- ✅ Google OAuth Client Secret

Great! We'll use these to authenticate with Gmail API.

## Step 1: Prepare Your OAuth Credentials

You should already have:

```
Google OAuth Client ID: your_client_id.apps.googleusercontent.com
Google OAuth Client Secret: your_client_secret
```

If you need to find these:
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project
3. Go to Credentials
4. Find your OAuth 2.0 Client (type: Web application)
5. Click it to see ID and Secret

## Step 2: Setup Gmail API

### Enable Gmail API

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project
3. Go to APIs & Services > Library
4. Search for "Gmail API"
5. Click "Gmail API"
6. Click "Enable"

### Configure OAuth Consent Screen

1. Go to APIs & Services > OAuth consent screen
2. Select "External" user type
3. Click "Create"
4. Fill in Application name: `Stellar Global Supplies Orders`
5. Add User support email
6. Add Developer contact: your-email@gmail.com
7. Click "Save and Continue"
8. Click "Save and Continue" on Scopes page
9. Click "Save and Continue" on Test users page
10. Review summary and click "Back to Dashboard"

### Add Test User (if not in production)

1. Go to OAuth consent screen
2. Under "Test users", click "Add users"
3. Add your Gmail address
4. This allows testing without publishing

## Step 3: Get Gmail OAuth Tokens

### Get Refresh Token (One-time setup)

Run this Node.js script to get your refresh token:

```javascript
// get-gmail-token.js
const { google } = require('googleapis');
const readline = require('readline');

const oauth2Client = new google.auth.OAuth2(
  'YOUR_CLIENT_ID.apps.googleusercontent.com',
  'YOUR_CLIENT_SECRET',
  'http://localhost:3000/auth/callback' // Your redirect URI
);

const SCOPES = ['https://www.googleapis.com/auth/gmail.send'];

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Generate auth URL
const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: SCOPES,
});

console.log('Authorize this app by visiting this url:', authUrl);

rl.question('Enter the code from that page here: ', async (code) => {
  try {
    const { tokens } = await oauth2Client.getToken(code);
    console.log('\n✅ Success! Add these to your .env file:\n');
    console.log(`GMAIL_REFRESH_TOKEN=${tokens.refresh_token}`);
    console.log(`GMAIL_ACCESS_TOKEN=${tokens.access_token}`);
    console.log(`\nAccess token expires in: ${tokens.expiry_date}`);
  } catch (err) {
    console.error('Error:', err.message);
  }
  rl.close();
});
```

**How to use:**

```bash
# Install dependencies first
npm install googleapis

# Replace YOUR_CLIENT_ID and YOUR_CLIENT_SECRET in the script above
node get-gmail-token.js
```

1. It will output a Google authorization URL
2. Visit that URL in your browser
3. Sign in with your Gmail account
4. Allow access to Gmail API
5. Copy the authorization code
6. Paste it in the terminal
7. You'll get your REFRESH TOKEN and ACCESS TOKEN

### Store in Environment

**Backend** `.env`:
```env
# Gmail OAuth Credentials
GMAIL_CLIENT_ID=your_client_id.apps.googleusercontent.com
GMAIL_CLIENT_SECRET=your_client_secret
GMAIL_REFRESH_TOKEN=1//0gXXXXXXXXXXXXXXXXX (from above script)

# Email Configuration
GMAIL_FROM_EMAIL=your-email@gmail.com
GMAIL_FROM_NAME=Stellar Global Supplies
```

## Step 4: Install Email Package

```bash
cd backend
npm install nodemailer googleapis
```

## Step 5: Update Backend Email Service

Create or update `backend/src/services/emailService.js`:

```javascript
const nodemailer = require('nodemailer');
const { google } = require('googleapis');

const oauth2Client = new google.auth.OAuth2(
  process.env.GMAIL_CLIENT_ID,
  process.env.GMAIL_CLIENT_SECRET,
  'http://localhost:3000/auth/callback'
);

// Set credentials
oauth2Client.setCredentials({
  refresh_token: process.env.GMAIL_REFRESH_TOKEN,
});

// Create transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: process.env.GMAIL_FROM_EMAIL,
    clientId: process.env.GMAIL_CLIENT_ID,
    clientSecret: process.env.GMAIL_CLIENT_SECRET,
    refreshToken: process.env.GMAIL_REFRESH_TOKEN,
  },
});

/**
 * Send order confirmation email
 */
const sendOrderConfirmation = async (orderData) => {
  const mailOptions = {
    from: `"${process.env.GMAIL_FROM_NAME}" <${process.env.GMAIL_FROM_EMAIL}>`,
    to: orderData.customerEmail,
    subject: `Order Confirmation - #${orderData.orderId}`,
    html: `
      <h2>Order Confirmation</h2>
      <p>Hi ${orderData.customerName},</p>
      <p>Thank you for your order!</p>
      
      <h3>Order Details</h3>
      <ul>
        <li><strong>Order ID:</strong> ${orderData.orderId}</li>
        <li><strong>Date:</strong> ${new Date().toLocaleDateString()}</li>
        <li><strong>Total:</strong> $${orderData.total}</li>
      </ul>
      
      <h3>Items</h3>
      <table style="border-collapse: collapse; width: 100%;">
        <tr style="background-color: #f2f2f2;">
          <th style="border: 1px solid #ddd; padding: 8px;">SKU</th>
          <th style="border: 1px solid #ddd; padding: 8px;">Material</th>
          <th style="border: 1px solid #ddd; padding: 8px;">Quantity</th>
          <th style="border: 1px solid #ddd; padding: 8px;">Price</th>
        </tr>
        ${orderData.items
          .map(
            (item) => `
          <tr>
            <td style="border: 1px solid #ddd; padding: 8px;">${item.sku}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${item.material}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${item.quantity}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">$${item.price}</td>
          </tr>
        `
          )
          .join('')}
      </table>
      
      <p>We will process your order shortly.</p>
      <p>Best regards,<br/>Stellar Global Supplies Team</p>
    `,
  };

  try {
    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent:', result.messageId);
    return result;
  } catch (error) {
    console.error('❌ Email error:', error);
    throw error;
  }
};

/**
 * Send order status update email
 */
const sendStatusUpdate = async (orderData, oldStatus, newStatus) => {
  const statusMessages = {
    pending: 'Your order has been received and is being processed.',
    confirmed: 'Your order has been confirmed and is being prepared.',
    shipped: 'Your order has been shipped! Track it using your order ID.',
    delivered: 'Your order has been delivered.',
    cancelled: 'Your order has been cancelled.',
  };

  const mailOptions = {
    from: `"${process.env.GMAIL_FROM_NAME}" <${process.env.GMAIL_FROM_EMAIL}>`,
    to: orderData.customerEmail,
    subject: `Order #${orderData.orderId} - Status: ${newStatus.toUpperCase()}`,
    html: `
      <h2>Order Status Update</h2>
      <p>Hi ${orderData.customerName},</p>
      <p>${statusMessages[newStatus]}</p>
      
      <h3>Order Details</h3>
      <ul>
        <li><strong>Order ID:</strong> ${orderData.orderId}</li>
        <li><strong>Previous Status:</strong> ${oldStatus}</li>
        <li><strong>Current Status:</strong> ${newStatus}</li>
        <li><strong>Updated At:</strong> ${new Date().toLocaleString()}</li>
      </ul>
      
      <p>Thank you for your business!</p>
      <p>Best regards,<br/>Stellar Global Supplies Team</p>
    `,
  };

  try {
    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Status update email sent:', result.messageId);
    return result;
  } catch (error) {
    console.error('❌ Email error:', error);
    throw error;
  }
};

module.exports = {
  sendOrderConfirmation,
  sendStatusUpdate,
};
```

## Step 6: Update Order Creation Endpoint

In `backend/src/routes/orders.js`:

```javascript
const express = require('express');
const { sendOrderConfirmation } = require('../services/emailService');

const router = express.Router();

router.post('/orders', async (req, res) => {
  try {
    const { customerName, customerEmail, items } = req.body;

    // Create order in database
    const order = await createOrder(req.body);

    // Send confirmation email
    await sendOrderConfirmation({
      orderId: order.id,
      customerName,
      customerEmail,
      items,
      total: calculateTotal(items),
    });

    res.json({ success: true, order });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

## Step 7: Update Status Change Endpoint

```javascript
router.patch('/orders/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const order = await getOrder(req.params.id);
    const oldStatus = order.status;

    // Update status in database
    const updatedOrder = await updateOrderStatus(req.params.id, status);

    // Send status update email
    const customer = await getCustomer(order.customerId);
    await sendStatusUpdate(
      {
        orderId: order.id,
        customerName: customer.name,
        customerEmail: customer.email,
      },
      oldStatus,
      status
    );

    res.json({ success: true, order: updatedOrder });
  } catch (error) {
    console.error('Status update error:', error);
    res.status(500).json({ error: error.message });
  }
});
```

## Step 8: Test Email Sending

### Run Backend

```bash
cd backend
npm run dev
```

### Create Test Order

```bash
curl -X POST http://localhost:3001/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "John Doe",
    "customerEmail": "your-email@gmail.com",
    "items": [
      {
        "sku": "SKU-001",
        "material": "Plastic",
        "quantity": 10,
        "price": 25.00
      }
    ]
  }'
```

### Check Your Email

Look in your inbox for the order confirmation email. If not found, check Spam folder.

## Step 9: Monitor Email Activity

### Gmail Activity in Google Account

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Check "Recent activity on your Google Account"
3. Look for API usage logs

### Application Logs

Check backend logs:

```bash
# Look for successful sends
grep "Email sent" backend.log

# Look for errors
grep "Email error" backend.log
```

## Troubleshooting

### "Failed to authenticate user"

**Causes:**
- Invalid refresh token
- Gmail API not enabled
- Test user not authorized

**Solutions:**
```bash
# Re-run the token generation script
node get-gmail-token.js

# Verify Gmail API is enabled in Google Cloud Console
```

### "Invalid credentials"

**Causes:**
- Client ID/Secret mismatch
- Credentials copied incorrectly

**Solutions:**
```bash
# Verify in .env file
echo $GMAIL_CLIENT_ID
echo $GMAIL_CLIENT_SECRET

# Make sure no extra spaces
```

### "Access denied (401)"

**Causes:**
- Refresh token expired
- User not added to test users (if app not published)

**Solutions:**
1. If app is not published, add your email to test users in OAuth consent screen
2. If refresh token expired, regenerate it:
   ```bash
   node get-gmail-token.js
   ```

### "Email not received"

**Causes:**
- Marked as spam
- Email address typo
- Gmail blocking suspicious activity

**Solutions:**
1. Check spam folder
2. Add sender email to contacts
3. Verify email address in request
4. Wait a few minutes (sometimes delayed)

### "Too many failed login attempts"

**Solution:**
- Wait 24 hours
- Use an app-specific password if using 2FA
- Check [Less secure app access](https://myaccount.google.com/lesssecureapps) is allowed

## Production Considerations

### For Production Deployment

1. **Store refresh token securely:**
   ```bash
   # Use AWS Secrets Manager or similar
   # Never commit .env to version control
   ```

2. **Monitor email quota:**
   - Gmail API allows up to 100 emails per minute
   - For higher volume, consider SendGrid

3. **Use environment-specific credentials:**
   ```bash
   # .env.production
   GMAIL_FROM_EMAIL=production-email@domain.com
   GMAIL_FROM_NAME=Stellar Global Supplies
   ```

4. **Add error handling and retry logic:**
   ```javascript
   const sendWithRetry = async (mailOptions, maxRetries = 3) => {
     for (let i = 0; i < maxRetries; i++) {
       try {
         return await transporter.sendMail(mailOptions);
       } catch (error) {
         if (i === maxRetries - 1) throw error;
         await new Promise(r => setTimeout(r, 1000 * (i + 1)));
       }
     }
   };
   ```

5. **Log all email activity:**
   ```javascript
   const emailLog = {
     recipient: email,
     subject,
     timestamp: new Date(),
     status: 'sent',
     messageId,
   };
   ```

## Resources

- [Google OAuth2 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Gmail API Guide](https://developers.google.com/gmail/api/guides)
- [Nodemailer Documentation](https://nodemailer.com/)
- [Gmail Limits](https://support.google.com/a/answer/166852?hl=en)
