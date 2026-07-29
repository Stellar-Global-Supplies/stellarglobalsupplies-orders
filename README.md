# Stellar Global Supplies - Order Management System (Backend)

Serverless backend for managing customer orders with real-time status tracking, email notifications, and WhatsApp integration. The frontend has been migrated to a separate repository and is deployed via Vercel.

## Features

### Core Functionality
- **Order Management**: Create, track, and manage customer orders through their lifecycle
- **Status Tracking**: Four-stage order flow (Order Received → Processing → Ready to Dispatch → Delivered)
- **Payment Status**: Track payments (Pending/Partial/Paid) with email reminders
- **Delay Orders**: Reschedule delivery dates during processing phase
- **Invoice Upload**: Attach invoices when marking orders as delivered
- **WhatsApp Integration**: Send order updates directly to customers via WhatsApp
- **Email Notifications**: Automated Gmail API-based email notifications at each status change

### Customer Features
- **Public Order Tracking**: Customers can track their orders using a unique URL without authentication
- **Real-time Status Updates**: Order status updates are reflected immediately on tracking page
- **Invoice Download**: Customers can download invoices directly from the tracking page (valid for 7 days)

### Invoice Management
- **S3 Invoice Storage**: Invoices are stored in a dedicated public S3 bucket
- **Direct Download Links**: Invoices are accessible via public URLs
- **Email Attachment**: Invoices are attached to delivery emails
- **7-Day Availability**: Invoices are available for download for 7 days from upload date
- **After Expiration**: Customers are prompted to contact support for invoice re-download

### Technical Features
- **Authentication**: Supabase Auth with Google OAuth
- **Serverless Backend**: AWS Lambda + API Gateway
- **Database**: Supabase (PostgreSQL) with Row Level Security
- **CI/CD**: GitHub Actions for automated deployment

## Tech Stack

### Backend
- AWS Lambda (Node.js 20)
- AWS API Gateway (HTTP API)
- Supabase (PostgreSQL + Auth)
- Gmail API (OAuth2 for emails)

### Infrastructure
- Terraform (Infrastructure as Code)
- AWS S3 (invoice storage)
- AWS CloudWatch (logging)

## Project Structure

```
stellarglobalsupplies-orders/
├── lambda/
│   ├── create-order/
│   │   ├── index.js            # POST /orders - Create order + send email
│   │   └── emailTemplates.js   # HTML email templates
│   ├── update-order-status/
│   │   └── index.js            # PATCH /orders/{id}/status - Update status
│   ├── send-notification/
│   │   └── index.js            # POST /orders/{id}/notify - Resend email
│   ├── get-order-by-token/
│   │   └── index.js            # GET /track/{token} - Public order lookup
│   └── update-order-items/
│       └── index.js            # POST/PATCH/DELETE /orders/{id}/items - Manage products
│
├── supabase/
│   └── migrations/
│       ├── 001_create_orders.sql           # Database schema
│       ├── 002_add_tracking_token.sql      # Add tracking token column
│       ├── 003_add_invoice_url.sql         # Add invoice URL column
│       ├── 004_add_invoice_timestamp.sql   # Add invoice timestamp
│       ├── 005_add_invoice_s3_key.sql      # Add invoice S3 key
│       ├── 006_create_order_items.sql      # Order items table
│       ├── 007_add_after_30_days_payment.sql
│       ├── 008_add_description_to_order_items.sql
│       ├── 009_add_cgst_sgst.sql
│       └── 010_add_order_tax_totals.sql
│
├── terraform/
│   └── main.tf                 # AWS infrastructure definition
│
└── .github/
    └── workflows/
        └── deploy.yml          # CI/CD pipeline
```

> **Note:** The frontend has been migrated to a separate repository and is deployed via Vercel. This repo now contains only the backend (Lambda functions, Supabase migrations, and Terraform infrastructure).

## Getting Started

### Prerequisites

- Node.js 20+ and npm
- Terraform 1.5+
- AWS CLI configured
- Supabase account
- Google Cloud account (for Gmail API)
- GitHub repository with secrets configured

### Environment Variables

#### Backend (AWS SSM Parameter Store)
```bash
# Gmail OAuth credentials (stored in SSM)
/stellar-oms/gmail/client-id
/stellar-oms/gmail/client-secret
/stellar-oms/gmail/refresh-token
```

### Local Development

1. **Clone the repository**
```bash
git clone https://github.com/Prasadpb77/stellarglobalsupplies-orders.git
cd stellarglobalsupplies-orders
```

2. **Install Lambda dependencies**
```bash
cd lambda
npm install
```

3. **Set up Supabase**
   - Create a new Supabase project
   - Run the SQL migrations in `supabase/migrations/`
   - Create the `top_skus` and `material_split` views
   - Enable Google OAuth in Supabase Auth settings
   - Copy your Supabase URL and anon key

4. **Set up Gmail API**
   - Create OAuth2 credentials in Google Cloud Console
   - Enable Gmail API
   - Get refresh token using OAuth2 playground
   - Store credentials in AWS SSM Parameter Store

5. **Deploy infrastructure**
```bash
cd terraform
terraform init
terraform plan
terraform apply
```

## Deployment

### Automated Deployment (GitHub Actions)

The project uses GitHub Actions for CI/CD. Push to `main` branch triggers:

1. **Backend Deployment**
   - Package Lambda functions
   - Deploy via Terraform
   - Update Lambda environment variables

> **Frontend:** The frontend is deployed separately via Vercel from another repository.

### Manual Deployment

#### Backend
```bash
cd terraform
terraform apply
```

## Configuration

### Supabase Views

Create these views in Supabase SQL Editor:

```sql
-- Product types view
CREATE VIEW top_skus AS
SELECT DISTINCT sku FROM orders ORDER BY sku;

-- Materials view
CREATE VIEW material_split AS
SELECT DISTINCT material_type FROM orders ORDER BY material_type;
```

### API Gateway Routes

The application uses these endpoints:

- `POST /orders` - Create new order
- `PATCH /orders/{id}/status` - Update order status
- `PATCH /orders/{id}/delay` - Delay order delivery
- `POST /orders/{id}/deliver` - Mark order as delivered (with invoice upload)
- `POST /orders/{id}/notify` - Send email notification
- `GET /track/{token}` - Public order tracking
- `POST /orders/{id}/items` - Add product to order
- `PATCH /orders/{id}/items/{itemId}` - Update product in order
- `DELETE /orders/{id}/items/{itemId}` - Delete product from order

## Order Status Flow

```
Order Received → Processing → Ready to Dispatch → Delivered
```

### Status Actions

- **Order Received**: Can advance to "Processing" with payment status update
- **Processing**: Can advance to "Ready to Dispatch" or delay delivery date
- **Ready to Dispatch**: Can mark as "Delivered" with invoice upload and payment status
- **Delivered**: Terminal state - invoice can be downloaded

## Payment Status

- **Pending**: No payment received
- **Partial**: Partial payment received
- **Paid**: Full payment received

Payment reminders are automatically included in:
- Email notifications (if not Paid)
- WhatsApp messages (if not Paid)

## Invoice Expiration

- **7-Day Window**: Invoices are available for download for 7 days from the upload date
- **After Expiration**: The tracking page shows a message to contact support
- **Email**: Invoices are attached to delivery emails regardless of expiration

## Security

- Row Level Security (RLS) on Supabase
- JWT-based authentication
- CORS configured on API Gateway
- Service role key for Lambda (bypasses RLS)
- OAuth2 for Gmail API
- Sensitive data stored in AWS SSM Parameter Store

## License

Proprietary - Stellar Global Supplies

## Support

For issues or questions, contact: +91 96376 55556