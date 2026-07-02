# SendGrid Email Setup Guide

## Prerequisites

- SendGrid account (https://sendgrid.com)
- Verified sender email address
- API key with Mail Send permission

## Step 1: Create SendGrid Account

1. Go to https://sendgrid.com/pricing/
2. Sign up for Free or Essentials plan
3. Verify email and phone
4. Choose "Send Marketing Emails" (or custom)

## Step 2: Verify Sender Email

### Single Sender Verification

1. Go to Settings > Sender Authentication > Single Sender Verification
2. Click "Create New Sender"
3. Fill in details:
   - From Email: `noreply@stellarglobalsupplies.com`
   - From Name: `Stellar Global Supplies`
   - Reply-To Email: `support@stellarglobalsupplies.com`
4. Click "Create"
5. Go to your email and click verification link
6. Wait for verification (usually instant)

### Domain Authentication (Recommended)

For better deliverability:

1. Go to Settings > Sender Authentication > Domain Authentication
2. Add domain: `stellarglobalsupplies.com`
3. Add DNS records (CNAME):
   - Name: `sendgrid._domainkey`
   - Value: `sendgrid.net`
4. Add another CNAME for email authentication
5. DNS verification takes 5-30 minutes

## Step 3: Create API Key

1. Go to Settings > API Keys
2. Click "Create API Key"
3. Fill in details:
   - API Key Name: `stellar-orders-api`
   - Permissions: Select "Restricted Access"
   - Mail Send: Enable (toggle on)
4. Click "Create & Close"
5. **Copy the API key immediately** (you won't see it again)

## Step 4: Add to Environment

**Backend** `.env`:
```env
SENDGRID_API_KEY=SG.xxxxx_your_api_key_xxxxx
SENDGRID_FROM_EMAIL=noreply@stellarglobalsupplies.com
```

## Step 5: Test Email Sending

### Using SendGrid Web API

```bash
curl --request POST \
  --url https://api.sendgrid.com/v3/mail/send \
  --header 'Authorization: Bearer SG.xxxxx' \
  --header 'Content-Type: application/json' \
  --data '{
    "personalizations": [{"to": [{"email": "test@example.com"}]}],
    "from": {"email": "noreply@stellarglobalsupplies.com"},
    "subject": "Test Email",
    "content": [{"type": "text/html", "value": "<p>Hello World</p>"}]
  }'
```

### Using Application

1. Start backend: `npm run dev`
2. Create an order in frontend
3. Check your email for confirmation
4. Check SendGrid dashboard for activity

## Step 6: Monitor Email Activity

1. Go to Dashboard
2. View stats:
   - Bounce rates
   - Click-through rates
   - Unsubscribe rates
3. Check for any errors

## Email Templates

### Order Confirmation Email

Sent when order is created:

```html
Subject: Order Confirmation - #[ORDER_ID]

Dear [CUSTOMER_NAME],

Thank you for your order! Here are the details:

Order ID: [ORDER_ID]
Total Amount: ₹[AMOUNT]
Delivery Timeline: [DELIVERY_DATE]

[ORDER_ITEMS_TABLE]

Track your order at: https://orders.stellarglobalsupplies.com
```

### Order Status Update Email

Sent when status changes:

```html
Subject: Order Status Updated - #[ORDER_ID]

Dear [CUSTOMER_NAME],

Your order status has been updated:

[PREVIOUS_STATUS] → [NEW_STATUS]

You can track your order at: https://orders.stellarglobalsupplies.com
```

## Troubleshooting

### "Invalid API Key"

```
Error: 401 Unauthorized
```

**Solution:**
- Verify API key is correct
- Check API key has Mail Send permission
- Regenerate key if needed

### "Email blocked: Bounce"

```
Error: 550 User does not exist
```

**Solution:**
- Verify recipient email is valid
- Check email is not on bounce list
- Ask recipient to whitelist sender

### "Emails going to spam"

**Solution:**
- Verify sender email domain
- Add SPF and DKIM records
- Use domain authentication
- Include unsubscribe link
- Keep bounce rate low

### "Rate limiting"

```
Error: 429 Too Many Requests
```

**Solution:**
- Upgrade SendGrid plan
- Reduce email sending frequency
- Use SendGrid's queue system

## Best Practices

1. **Verify domain** for better deliverability
2. **Use transactional emails** API (not marketing)
3. **Add unsubscribe links** in emails
4. **Monitor bounce rates** - keep below 1%
5. **Use templates** for consistency
6. **Test emails** before production
7. **Keep API keys secure** - never commit to git
8. **Rotate API keys** quarterly

## Performance Optimization

### Batch Sending

Send multiple emails in one request:

```javascript
const msg = {
  personalizations: [
    { to: [{ email: 'customer1@example.com' }] },
    { to: [{ email: 'customer2@example.com' }] },
  ],
  from: { email: 'noreply@stellarglobalsupplies.com' },
  subject: 'Order Confirmation',
  html: emailTemplate,
};
```

### Queue System

The backend automatically queues emails. Check `order_notifications` table for status.

## Advanced Features

### A/B Testing

Test subject lines:

```javascript
const personalizations = [
  { to: [{ email: 'user@example.com' }], subject: 'Subject A' },
  { to: [{ email: 'user2@example.com' }], subject: 'Subject B' },
];
```

### Dynamic Templates

Create templates in SendGrid UI and use template ID:

```javascript
const msg = {
  personalizations: [{ to: [{ email: 'user@example.com' }] }],
  from: { email: 'noreply@stellarglobalsupplies.com' },
  template_id: 'd-xxxxxx',
};
```

### Scheduled Sending

Schedule emails for later:

```javascript
const msg = {
  // ...
  send_at: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
};
```

## Resources

- [SendGrid Docs](https://docs.sendgrid.com)
- [SMTP Relay Setup](https://docs.sendgrid.com/for-developers/sending-email/integrating-with-the-sendgrid-smtp-api)
- [API Reference](https://docs.sendgrid.com/api-reference/mail-send/mail-send)
- [Troubleshooting Guide](https://docs.sendgrid.com/ui/account-and-settings/troubleshooting)
