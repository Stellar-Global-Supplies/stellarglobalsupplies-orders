# AI Context: stellarglobalsupplies-orders
> **Repo**: Stellar-Global-Supplies/stellarglobalsupplies-orders
> **Generated**: 2026-07-13
> **Source**: ai_context/ folder — do not edit manually

---

## 🏗️ What It Does
This project manages customer orders for B2B wholesale businesses, providing real-time status tracking, automated email notifications, and WhatsApp integration. It centralizes order management to reduce manual tracking efforts and improve customer communication.

## ⚙️ Tech Stack
- **Language**: JavaScript (ES2022), Node.js 20
- **Frontend**: React 18.2.0, React Router 6.21.0, react-datepicker 4.25.0, react-hot-toast 2.4.1, lucide-react 0.303.0, date-fns 3.0.0
- **Backend/API**: AWS Lambda (Node.js 20), API Gateway HTTP API
- **Database & Storage**: PostgreSQL 16 (Supabase), AWS S3
- **AI/ML**: NONE
- **Infra & Cloud**: AWS CloudFront, AWS Route53, Terraform 1.5+
- **CI/CD & Observability**: GitHub Actions, Docker, AWS CloudWatch Logs
- **Auth**: Supabase Auth with Google OAuth, JWT, AWS SSM Parameter Store
- **Key Integrations**: Gmail API (OAuth2), WhatsApp (via wa.me links)

## 🚀 Highlight Features
- **Order Management**: Powered by Supabase PostgreSQL with Row Level Security, enabling multi-product orders.
- **Public Order Tracking**: Utilizes UUID-based tracking tokens for secure, no-auth access to order status.
- **Email Notifications**: Automated notifications using Gmail API with HTML templates for order status changes.
- **WhatsApp Integration**: Sends order updates via WhatsApp using pre-built message templates and shortened URLs.
- **Invoice Management**: Stores invoices in S3 with a 7-day public download link, handling expiration seamlessly.
- **Mobile-Responsive PWA**: Full support for offline capabilities and add-to-home-screen functionality.
- **Dark/Light Mode**: Theme toggle with persistent user preferences using CSS Variables and localStorage.

## 🧠 Architecture & Key Decisions
- Chose a serverless architecture to minimize operational overhead and leverage AWS managed services.
- Selected Supabase for built-in authentication and real-time capabilities, avoiding custom implementations.
- Used the Gmail API for email notifications to leverage existing email reputation and avoid deliverability issues.
- Implemented UUID v4 tokens for public order tracking to enhance security and prevent guessable URLs.

## 📈 Scale & Impact
- Active users: ~10-20 internal staff
- Requests/day: ~100-500 API requests
- Data volume: ~1,000 orders, ~2,000 order items
- API p99 latency: < 500ms
- Uptime: 99.9%
- Team size: 1 developer

## 🔥 Engineering Challenges Solved

### Public Order Tracking Without Authentication
**Problem:** Customers need to track orders without creating accounts, but exposing order data is a security risk.  
**Failed approach:** Initially attempted to use sequential order IDs in URLs, which were easily guessable.  
**Solution:** Implemented UUID v4 tracking tokens stored in the database, accessed via a dedicated Lambda function.

### Invoice Expiration Handling
**Problem:** Invoices should be downloadable for a limited time to ensure security.  
**Failed approach:** Used S3 pre-signed URLs that expired, leading to a poor customer experience.  
**Solution:** Invoices are stored in a public S3 bucket with a timestamp check on the frontend to manage access.

## 🎨 UI & Visual Identity

### Brand Colors
| Role | Name | Hex | Usage |
|------|------|-----|-------|
| Primary | Teal | #00B98E | Buttons, accents, active states |
| Secondary | Darker Teal | #009B76 | Gradients |
| Background | Light Gray | #F4F7FB | Main pages |
| Surface | Dark Navy | #0D1F2D | Dark sections |
| Text Primary | Dark | #1A202C | Main text |
| Text Secondary | Gray | #94A3B4 | Secondary text |
| Success | Green | #10B981 | Success indicators |
| Error | Amber | #F59E0B | Warning indicators |
| Warning | Blue | #3B82F6 | Informational indicators |

### Typography
- **Primary Font**: Inter (weight 400, body text)
- **Secondary Font**: Manrope (weight 800, headings)
- **Monospace Font**: N/A
- **Heading sizes**: h1: 42px, h2: 28px, body text: 14-15px, labels: 11-12px

### Visual Style
- **Design language**: Minimal
- **Border radius**: Rounded (10px for buttons, 20px for cards)
- **Shadows**: Subtle (0 2px 16px rgba(0,0,0,.05))
- **Spacing scale**: 8px
- **Iconography**: Lucide
- **Illustration style**: None

### Logo & Mark
- **Logo type**: Icon + wordmark
- **Logo colors**: Teal, Dark Navy
- **Dark mode variant**: Yes, with adjustments to background colors

### Component Patterns
- **Buttons**: Gradient teal background (#00B98E to #009B76), white text, 10px border radius, subtle shadow, hover lift effect
- **Cards**: White background, 20px border radius, 1px solid border (#EEF2F5), subtle shadow
- **Badges/Tags**: Rounded 20px, colored background based on status, bold text
- **Navigation**: Sidebar with collapsible sections

### Image Generation Prompt
Create a social media image for the Stellar Global Supplies Order Management System featuring a minimal design with a teal (#00B98E) and dark navy (#0D1F2D) color palette. Use Inter for body text and Manrope for headings. Include elements representing order tracking and invoice management, with a clean layout and subtle shadows.

---

## 💡 Post Angles
- **LinkedIn**: "Transforming B2B order management with real-time tracking and automated notifications. Discover how our serverless architecture simplifies operations."
- **X**: "No more guesswork in order tracking! Our UUID-based tokens ensure secure access without authentication. Learn more about our approach."
- **Dev.to**: "Building a serverless order management system with React and Supabase: challenges faced and solutions implemented."
- **Bluesky**: "Say goodbye to manual order tracking! Our system provides automated updates via email and WhatsApp, streamlining customer communication."

## 🏷️ Hashtags
#Serverless, #React, #Supabase, #AWS, #B2B, #OrderManagement, #WebDevelopment, #JavaScript, #CloudComputing, #PWA, #EmailIntegration, #WhatsAppAPI

## 📌 Soundbites
"Implementing UUID tokens for public order tracking was a game-changer for security and user experience. No more guessable URLs."  
"Our serverless architecture not only reduces costs but also enhances scalability and performance. A win-win for B2B operations."

## 🔍 SEO Keywords
B2B order management system, serverless architecture, real-time order tracking, Supabase integration, automated email notifications, WhatsApp order updates, invoice management, cloud-based order tracking, React order management, PostgreSQL order system, UUID tracking tokens, AWS serverless solutions

---
<!-- AUTO-GENERATED | Stellar-Global-Supplies/ai-context-generator | Model: gpt-4o-mini via GitHub Models -->
<!-- Source: Stellar-Global-Supplies/stellarglobalsupplies-orders/ai_context/*.md -->
<!-- Re-run workflow to regenerate — do not edit manually -->