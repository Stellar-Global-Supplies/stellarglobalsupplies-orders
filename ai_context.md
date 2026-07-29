# AI Context: stellarglobalsupplies-orders
> **Repo**: Stellar-Global-Supplies/stellarglobalsupplies-orders
> **Generated**: 2026-07-29
> **Source**: ai_context/ folder — do not edit manually

---

## 🏗️ What It Does
Stellar Global Supplies - Order Management System backend centralizes and automates order management for B2B wholesale businesses, providing real-time status tracking, email notifications, and WhatsApp integration. This serverless backend (AWS Lambda + API Gateway + Supabase) reduces manual overhead, improves customer communication, and ensures secure invoice management. The frontend is maintained in a separate repository and deployed via Vercel.

## ⚙️ Tech Stack
- **Language**: JavaScript (ES2022) · Node.js 20
- **Frontend**: NONE — migrated to a separate repo, deployed via Vercel
- **Backend/API**: AWS Lambda (Node.js 20) · API Gateway HTTP API · REST API
- **Database & Storage**: PostgreSQL 16 (Supabase) · S3-compatible (AWS S3 — invoices)
- **AI/ML**: NONE
- **Infra & Cloud**: AWS S3 (invoices) · Terraform 1.5+
- **CI/CD & Observability**: GitHub Actions · esbuild (Lambda bundling) · AWS CloudWatch Logs
- **Auth**: Supabase Auth with Google OAuth · JWT · AWS SSM Parameter Store
- **Key Integrations**: Gmail API (OAuth2) · WhatsApp (via wa.me links)

## 🚀 Highlight Features
- **Order Management**: Create, track, and manage customer orders through a four-stage lifecycle, powered by Supabase PostgreSQL with Row Level Security and AWS Lambda functions.
- **Public Order Tracking**: Customers can track their orders using a unique URL without authentication, powered by UUID-based tracking tokens and a Lambda function.
- **Email Notifications**: Automated email notifications at each order status change, powered by Gmail API with OAuth2 and custom MIME message builder.
- **WhatsApp Integration**: Send order updates directly to customers via WhatsApp with shortened tracking links, powered by wa.me URL scheme and pre-built message templates.
- **Invoice Management**: Upload and store invoices in S3 with 7-day public download links, powered by AWS S3 with CORS configuration.

## 🧠 Architecture & Key Decisions
- **Serverless Architecture**: Chose a serverless pattern to leverage AWS managed services for scalability and cost efficiency.
- **Supabase Over Raw PostgreSQL**: Selected Supabase to get built-in auth, realtime, and RLS without custom development.
- **Gmail API for Email**: Used Gmail API instead of AWS SES to avoid deliverability issues and leverage existing business email reputation.
- **Public S3 Bucket for Invoices**: Stored invoices in a public S3 bucket to enable direct download links without Lambda proxy, with automatic expiration handling.
- **UUID-based Tracking Tokens**: Implemented UUID v4 tracking tokens for public order lookup to avoid exposing internal order IDs.
- **Frontend Migration to Vercel**: Decoupled frontend deployment from backend infrastructure by migrating the frontend to a separate repository deployed via Vercel.

## 📈 Scale & Impact
- **Active users**: ~10-20 internal staff
- **Requests/day**: ~100-500 API requests
- **Data volume**: ~1,000 orders, ~2,000 order items
- **API p99 latency**: < 500ms
- **Uptime**: 99.9% (AWS managed services)
- **GitHub stars**: 0 (private repo)
- **Team size**: 1 developer

## 🔥 Engineering Challenges Solved

### Public Order Tracking Without Authentication
**Problem**: Customers need to track orders without creating accounts, but we can't expose all order data publicly.
**Failed approach**: Initially tried using order ID in URL, but that's easily guessable and exposes sequential order numbers.
**Solution**: UUID v4 tracking tokens stored in database, with dedicated Lambda function that only returns data for valid tokens.

### Invoice Expiration Handling
**Problem**: Invoices need to be downloadable for customers but shouldn't be permanently public for security.
**Failed approach**: First version used S3 pre-signed URLs in emails, but they expired and broke the customer experience.
**Solution**: Store invoices in public S3 bucket with invoice_timestamp, check expiration on frontend, show "contact support" message after 7 days while still including invoice in delivery emails.

### Multi-Product Order Support
**Problem**: B2B orders often contain multiple products, but the original schema only supported single product per order.
**Failed approach**: Considered denormalizing products into JSON column, but that breaks querying and reporting.
**Solution**: Created order_items table with foreign key to orders, kept first product in main orders table for backward compatibility, calculate total cost from sum of all items.

## 🔍 SEO Keywords
B2B order management, serverless architecture, AWS Lambda, Supabase, email notifications, WhatsApp integration, invoice management, real-time tracking, public order tracking, multi-product orders, UUID tracking tokens, S3 invoice storage, automated notifications, API Gateway.