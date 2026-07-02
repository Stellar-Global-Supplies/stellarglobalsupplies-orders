# Order Management System - Complete Documentation

## Project Overview

A production-ready Order Management System for Stellar Global Supplies built with:
- **Frontend**: React 18 + TypeScript + Tailwind CSS + Vite
- **Backend**: Node.js Express + AWS Lambda
- **Database**: Supabase PostgreSQL with Auth
- **Infrastructure**: Terraform + AWS (S3, CloudFront, Lambda, API Gateway, Route53)
- **Deployment**: GitHub Actions CI/CD

## Table of Contents

1. [Architecture](#architecture)
2. [Features](#features)
3. [Project Structure](#project-structure)
4. [Installation & Setup](#installation--setup)
5. [Database Schema](#database-schema)
6. [API Endpoints](#api-endpoints)
7. [Deployment](#deployment)
8. [Environment Configuration](#environment-configuration)
9. [Troubleshooting](#troubleshooting)

---

## Architecture

### System Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React)                        │
│              orders.stellarglobalsupplies.com              │
│         S3 + CloudFront + Route53 + ACM                    │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTPS
                         │
        ┌────────────────┴─────────────────┐
        │                                   │
   ┌────▼──────┐                   ┌──────▼────┐
   │ Dashboard │◄──────HTTP───────►│    API    │
   │  Create   │                   │ Gateway   │
   │ Order     │                   └──────┬────┘
   │ History   │                          │
   └──────────┘                    ┌──────▼────┐
                                   │  Lambda   │
                                   │ (Node.js) │
                                   └──────┬────┘
                                          │
                    ┌─────────────────────┼─────────────────────┐
                    │                     │                     │
            ┌───────▼────────┐   ┌───────▼────────┐   ┌────────▼────┐
            │     Supabase   │   │   SendGrid     │   │  Supabase   │
            │  PostgreSQL    │   │   (Email)      │   │   Auth      │
            │  (Database)    │   └────────────────┘   └─────────────┘
            └────────────────┘
```

### Data Flow

1. **User Authentication**: Supabase Auth handles user login/signup
2. **Order Creation**: Frontend sends order data to Lambda via API Gateway
3. **Database**: Lambda stores order in Supabase PostgreSQL
4. **Notifications**: Lambda sends branded emails via SendGrid
5. **WhatsApp**: Frontend generates pre-filled messages for manual sending

---

## Features

### ✅ Order Management
- Create orders with customer details and line items
- Automatic "Order Received" status on creation
- Track order lifecycle: Order Received → Processing → Ready to Dispatch → Delivered
- View order history with filtering and sorting
- Order details with customer info and item breakdown

### 📧 Email Notifications
- Branded email on order creation
- Status update emails at each stage
- HTML templates with company branding
- SendGrid integration for reliable delivery

### 💬 WhatsApp Integration
- Generate pre-filled WhatsApp messages
- Order summary with items and amount
- Delivery timeline information
- One-click "Open WhatsApp" button
- Manual sending capability

### 🔐 Security
- Supabase Auth with email/password
- Row-level security (RLS) on all tables
- JWT token verification on API endpoints
- HTTPS/TLS encryption
- Secure S3 bucket with CloudFront

### 📊 Data Management
- Order status history tracking
- Notification delivery logs
- Payment status tracking (Pending/Partial/Paid)
- Metadata support for custom fields

---

## Project Structure

```
stellarglobalsupplies-orders/
├── frontend/                    # React Application
│   ├── src/
│   │   ├── components/         # Reusable components
│   │   │   └── Navbar.tsx
│   │   ├── pages/              # Page components
│   │   │   ├── Login.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── CreateOrder.tsx
│   │   │   ├── OrderDetail.tsx
│   │   │   └── OrderHistory.tsx
│   │   ├── lib/                # Utilities
│   │   │   ├── supabase.ts    # Supabase client
│   │   │   └── api.ts         # API calls
│   │   ├── stores/             # State management (Zustand)
│   │   │   └── orderStore.ts
│   │   ├── types/              # TypeScript types
│   │   │   └── index.ts
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css           # Tailwind styles
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── postcss.config.js
│
├── backend/                     # Express API
│   ├── src/
│   │   ├── middleware/
│   │   │   ├── authenticate.ts # JWT verification
│   │   │   └── errorHandler.ts # Error handling
│   │   ├── lib/
│   │   │   ├── supabase.ts    # Supabase client
│   │   │   ├── email.ts       # SendGrid integration
│   │   │   └── whatsapp.ts    # WhatsApp templates
│   │   ├── routes/
│   │   │   ├── orders.ts      # Order CRUD endpoints
│   │   │   ├── skus.ts        # Product SKU endpoints
│   │   │   └── materials.ts   # Material endpoints
│   │   └── index.ts           # Express app setup
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── infrastructure/              # Terraform
│   ├── provider.tf             # AWS provider config
│   ├── variables.tf            # Input variables
│   ├── outputs.tf              # Output values
│   ├── s3_cloudfront.tf        # S3 + CloudFront setup
│   ├── route53.tf              # DNS configuration
│   ├── lambda_api_gateway.tf   # Lambda + API Gateway
│   ├── github_actions_iam.tf   # CI/CD IAM roles
│   ├── backend.tf              # Terraform backend config
│   ├── terraform.tfvars        # Variable values
│   └── README.md               # Detailed instructions
│
├── database/                    # Database schema
│   └── schema.sql              # PostgreSQL schema
│
├── docs/                        # Documentation
│   ├── SETUP.md                # Setup guide
│   └── DATABASE.md             # Database schema docs
│
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions CI/CD
│
├── .gitignore
├── package.json                # Monorepo root
└── README.md
```

---

## Installation & Setup

### Prerequisites

- Node.js 18+
- npm or yarn
- AWS Account
- Supabase Account
- SendGrid Account
- Terraform
- Git

### Local Development

#### 1. Clone Repository

```bash
git clone https://github.com/Prasadpb77/stellarglobalsupplies-orders.git
cd stellarglobalsupplies-orders
```

#### 2. Frontend Setup

```bash
cd frontend
npm install

# Create .env.local
cat > .env.local << EOF
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
REACT_APP_API_ENDPOINT=http://localhost:3001
EOF

# Start dev server
npm run dev
# Opens at http://localhost:3000
```

#### 3. Backend Setup

```bash
cd backend
npm install

# Create .env
cat > .env << EOF
PORT=3001
NODE_ENV=development
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SENDGRID_API_KEY=your_sendgrid_key
SENDGRID_FROM_EMAIL=noreply@stellarglobalsupplies.com
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:3000
EOF

# Start dev server
npm run dev
# Runs at http://localhost:3001
```

#### 4. Database Setup

```bash
# In Supabase SQL Editor, run:
# 1. Copy contents of database/schema.sql
# 2. Paste into Supabase SQL Editor
# 3. Execute
```

---

## Database Schema

### Tables

#### `orders`
Main order table with customer and order details.

```sql
{
  id: UUID (PK),
  customer_name: VARCHAR(255),
  phone: VARCHAR(20),
  email: VARCHAR(255),
  delivery_timeline: DATE,
  status: 'Order Received' | 'Processing' | 'Ready to Dispatch' | 'Delivered',
  payment_status: 'Pending' | 'Partial' | 'Paid',
  total_amount: DECIMAL(12,2),
  created_at: TIMESTAMP,
  updated_at: TIMESTAMP,
  created_by: UUID (FK to auth.users),
  metadata: JSONB
}
```

#### `order_items`
Individual items within an order.

```sql
{
  id: UUID (PK),
  order_id: UUID (FK),
  sku_id: UUID (FK to top_sku),
  material_id: UUID (FK to material_spilt),
  quantity: DECIMAL(10,2),
  unit: 'Pieces' | 'Kgs',
  sale_cost: DECIMAL(12,2),
  subtotal: DECIMAL(12,2) (computed),
  created_at: TIMESTAMP
}
```

#### `order_status_history`
Audit trail of order status changes.

```sql
{
  id: UUID (PK),
  order_id: UUID (FK),
  previous_status: VARCHAR(50),
  new_status: VARCHAR(50),
  changed_at: TIMESTAMP,
  changed_by: UUID (FK to auth.users),
  notes: TEXT
}
```

#### `order_notifications`
Email and WhatsApp notification logs.

```sql
{
  id: UUID (PK),
  order_id: UUID (FK),
  type: 'email' | 'whatsapp',
  status: 'pending' | 'sent' | 'failed',
  recipient: VARCHAR(255),
  subject: VARCHAR(255),
  message: TEXT,
  sent_at: TIMESTAMP,
  error_message: TEXT,
  created_at: TIMESTAMP
}
```

### Row Level Security

All tables have RLS enabled:
- Users can only see their own orders
- Backend has insert permissions for notifications
- Status history is audit-only

---

## API Endpoints

### Authentication
All endpoints require `Authorization: Bearer <token>` header with Supabase JWT token.

### Orders

#### Create Order
```
POST /orders
Content-Type: application/json
Authorization: Bearer <token>

{
  "customer_name": "John Doe",
  "phone": "+91 98765 43210",
  "email": "john@example.com",
  "delivery_timeline": "2026-07-15",
  "payment_status": "Pending",
  "items": [
    {
      "sku_id": "uuid",
      "material_id": "uuid",
      "quantity": 10,
      "unit": "Pieces",
      "sale_cost": 500
    }
  ]
}

Response: 201 Created
{
  "message": "Order created successfully",
  "order": { ... }
}
```

#### Get All Orders
```
GET /orders
Authorization: Bearer <token>

Response: 200 OK
[
  {
    "id": "uuid",
    "customer_name": "John Doe",
    "status": "Order Received",
    ...
  }
]
```

#### Get Order by ID
```
GET /orders/{id}
Authorization: Bearer <token>

Response: 200 OK
{
  "id": "uuid",
  "customer_name": "John Doe",
  "items": [ ... ],
  ...
}
```

#### Update Order Status
```
PATCH /orders/{id}/status
Content-Type: application/json
Authorization: Bearer <token>

{
  "status": "Processing"
}

Response: 200 OK
{
  "message": "Order status updated",
  "order": { ... }
}
```

#### Generate WhatsApp Message
```
GET /orders/{id}/whatsapp-message
Authorization: Bearer <token>

Response: 200 OK
{
  "message": "🎉 Hello John!\n\n✅ Your order has been received...\n\n..."
}
```

#### Delete Order
```
DELETE /orders/{id}
Authorization: Bearer <token>

Response: 200 OK
{
  "message": "Order deleted successfully"
}
```

### Products & Materials

#### Get All SKUs
```
GET /skus
Authorization: Bearer <token>

Response: 200 OK
[
  { "id": "uuid", "sku": "SKU-001", "created_at": "..." },
  { "id": "uuid", "sku": "SKU-002", "created_at": "..." }
]
```

#### Get All Materials
```
GET /materials
Authorization: Bearer <token>

Response: 200 OK
[
  { "id": "uuid", "material": "Plastic", "created_at": "..." },
  { "id": "uuid", "material": "Metal", "created_at": "..." }
]
```

---

## Deployment

### Prerequisites

1. **AWS Account** - with appropriate permissions
2. **Route53 Hosted Zone** - for `stellarglobalsupplies.com`
3. **Terraform** - v1.0+
4. **GitHub Repository** - with this code

### Step 1: Infrastructure Setup

```bash
cd infrastructure

# Initialize Terraform
terraform init

# Review changes
terraform plan

# Deploy infrastructure
terraform apply

# Note the outputs (especially AWS_ROLE_TO_ASSUME)
terraform output
```

### Step 2: GitHub Secrets

Add these secrets in GitHub repository settings:

```
AWS_ROLE_TO_ASSUME=arn:aws:iam::ACCOUNT_ID:role/stellar-orders-github-actions
CLOUDFRONT_DISTRIBUTION_ID=<from terraform output>
SUPABASE_URL=<your supabase url>
SUPABASE_ANON_KEY=<your anon key>
SUPABASE_SERVICE_ROLE_KEY=<your service role key>
API_ENDPOINT=<api gateway url from terraform>
SENDGRID_API_KEY=<your sendgrid key>
SLACK_WEBHOOK=<optional slack notifications>
```

### Step 3: Automatic Deployment

Push to main branch to trigger GitHub Actions:

```bash
git add .
git commit -m "Deploy changes"
git push origin main

# Monitor deployment in GitHub Actions tab
```

---

## Environment Configuration

### Frontend (.env.local)

```env
REACT_APP_SUPABASE_URL=https://xxxxx.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGc...
REACT_APP_API_ENDPOINT=https://api.orders.stellarglobalsupplies.com
```

### Backend (.env)

```env
PORT=3001
NODE_ENV=production

# Supabase
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Email
SENDGRID_API_KEY=SG.xxxxx
SENDGRID_FROM_EMAIL=noreply@stellarglobalsupplies.com

# Security
JWT_SECRET=your_strong_secret_key
FRONTEND_URL=https://orders.stellarglobalsupplies.com
```

---

## Troubleshooting

### Frontend Issues

**CORS Error**
```
Access to XMLHttpRequest at 'https://api...' from origin 'https://orders...' has been blocked
```

Solution: Ensure backend CORS includes frontend URL in `FRONTEND_URL` env var.

**Blank Page on Load**
```
Check browser console for errors
- Supabase credentials missing
- API endpoint unreachable
```

### Backend Issues

**Lambda Timeout**
```
"Task timed out after 30 seconds"
```

Solution: Increase Lambda timeout in infrastructure or optimize database queries.

**Database Connection Error**
```
"could not translate host name \"db.supabase.co\" to address"
```

Solution: Verify Supabase URL and service role key in environment.

### Email Issues

**Email Not Sending**
```
Check SendGrid API key and from email address
Verify recipient email domain reputation
Check order_notifications table for error logs
```

### Deployment Issues

**GitHub Actions Fails**
```
Check AWS role trust relationship
Verify GitHub OIDC provider is configured
Review CloudFront distribution permissions
```

---

## Performance Optimization

- **Frontend**: CloudFront caches static assets with 1hr TTL
- **Backend**: Lambda container reuse with warm starts
- **Database**: Indexed queries for fast lookups
- **Email**: Async with SendGrid queuing

---

## Security Considerations

- **Secrets Management**: Use AWS Secrets Manager for production
- **HTTPS**: All endpoints enforce TLS 1.2+
- **RLS**: Database enforces user isolation
- **API Keys**: Rotate SendGrid and Supabase keys quarterly
- **WAF**: Consider adding CloudFront WAF rules

---

## Support

For issues or questions:
1. Check [Troubleshooting](#troubleshooting) section
2. Review relevant documentation files
3. Check GitHub Issues
4. Contact development team
