# Features

## Core Features

### Order Management
**What it does:** Create, track, and manage customer orders through a four-stage lifecycle (Order Received → Processing → Ready to Dispatch → Delivered).
**Powered by:** Supabase PostgreSQL with Row Level Security, AWS Lambda functions with API Gateway HTTP API.
**Why it's notable:** Multi-product orders with order_items table enables complex B2B orders while maintaining backward compatibility with the main orders table.

### Public Order Tracking
**What it does:** Customers can track their orders using a unique URL without authentication.
**Powered by:** UUID-based tracking tokens, API Gateway GET /track/{token} endpoint, Lambda function with public access.
**Why it's notable:** No auth required for customers, but secure token-based access prevents unauthorized lookups.

### Email Notifications
**What it does:** Automated email notifications at each order status change with HTML templates.
**Powered by:** Gmail API with OAuth2, custom MIME message builder, Supabase Realtime triggers.
**Why it's notable:** Uses Gmail API instead of SES to avoid deliverability issues, with proper MIME encoding for international characters.

### WhatsApp Integration
**What it does:** Send order updates directly to customers via WhatsApp with short tracking links.
**Powered by:** wa.me URL scheme, pre-built message templates in Lambda functions.
**Why it's notable:** Shortened tracking URLs instead of long S3 pre-signed URLs improve WhatsApp message readability and reliability.

### Invoice Management
**What it does:** Upload and store invoices in S3 with 7-day public download links.
**Powered by:** AWS S3 with CORS configuration, invoice_timestamp for expiration tracking.
**Why it's notable:** Invoices are stored in a dedicated public bucket with automatic expiration handling, while still being attached to delivery emails.

---

## Recently Shipped
- **[October 2024]**: Multi-product order support with order_items table
- **[September 2024]**: Invoice expiration handling (7-day window)
- **[August 2024]**: WhatsApp message URL shortening

## In Progress / Coming Soon
- NONE

## Developer Experience Features
- GitHub Actions CI/CD with automated Terraform deployments
- Terraform-based infrastructure as code
- Supabase migrations for database schema versioning
- esbuild bundling for Lambda functions (smaller deployment packages)

## Notable Performance Numbers
- Lambda cold start: ~200ms (Node.js 20, 256MB memory)
- API response time: p99 < 500ms
- Invoice download: Direct S3 access

---