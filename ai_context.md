# AI Context: stellarglobalsupplies-orders
> **Repo**: Stellar-Global-Supplies/stellarglobalsupplies-orders
> **Generated**: 2026-07-13
> **Source**: ai_context/ folder — do not edit manually

---

## 🏗️ What It Does
This project manages customer orders for B2B wholesale businesses, providing real-time status tracking, automated email notifications, and WhatsApp integration. It addresses the challenges of manual order tracking and customer communication by centralizing order management in a serverless web application.

## ⚙️ Tech Stack
- **Language**: JavaScript (ES2022), Node.js 20
- **Frontend**: React 18.2.0, React Router 6.21.0, react-datepicker 4.25.0, react-hot-toast 2.4.1, lucide-react 0.303.0, date-fns 3.0.0, Custom CSS with CSS Variables
- **Backend/API**: AWS Lambda (Node.js 20), API Gateway HTTP API, REST API
- **Database & Storage**: PostgreSQL 16 (Supabase), S3-compatible (AWS S3)
- **AI/ML**: NONE
- **Infra & Cloud**: AWS S3, AWS CloudFront, AWS Route53, Terraform 1.5+
- **CI/CD & Observability**: GitHub Actions, Docker (for Lambda packaging), AWS CloudWatch Logs
- **Auth**: Supabase Auth with Google OAuth, JWT, AWS SSM Parameter Store
- **Key Integrations**: Gmail API (OAuth2), WhatsApp (via wa.me links)

## 🚀 Highlight Features
- **Order Management**: Powered by Supabase PostgreSQL with Row Level Security, enabling complex B2B orders.
- **Public Order Tracking**: Utilizes UUID-based tracking tokens and a dedicated Lambda function for secure access without authentication.
- **Email Notifications**: Automated notifications using the Gmail API with proper MIME encoding for international characters.
- **WhatsApp Integration**: Sends order updates via WhatsApp using pre-built message templates and shortened tracking URLs.
- **Invoice Management**: Stores invoices in S3 with a 7-day public download link, ensuring security and accessibility.
- **Mobile-Responsive PWA**: Full support for offline capabilities and add-to-home-screen functionality.
- **Dark/Light Mode**: Persistent theme toggling using CSS Variables and localStorage.

## 🧠 Architecture & Key Decisions
- **Serverless Architecture**: Chose a serverless model to reduce operational overhead and leverage AWS managed services.
- **Supabase for Database**: Selected Supabase over raw PostgreSQL for built-in authentication and real-time capabilities.
- **Gmail API over AWS SES**: Used Gmail API to avoid deliverability issues and leverage existing email reputation.
- **UUID Tracking Tokens**: Implemented UUID v4 tokens for public order tracking to enhance security and prevent guessability.
- **S3 for Invoice Storage**: Split invoice storage into a public S3 bucket to enable direct downloads without Lambda proxy.

## 📈 Scale & Impact
- Active users: ~10-20 internal staff
- Requests/day: ~100-500 API requests
- Data volume: ~1,000 orders, ~2,000 order items
- API p99 latency: < 500ms
- Uptime: 99.9% (AWS managed services)
- GitHub stars: 0 (private repo)
- Team size: 1 developer

## 🔥 Engineering Challenges Solved

### Public Order Tracking Without Authentication
**Problem:** Customers need to track orders without creating accounts, but exposing order data publicly is risky.  
**Failed approach:** Initially attempted using order ID in the URL, which was easily guessable.  
**Solution:** Implemented UUID v4 tracking tokens stored in the database, with a dedicated Lambda function returning data for valid tokens only.

### Invoice Expiration Handling
**Problem:** Invoices should be downloadable for a limited time for security reasons.  
**Failed approach:** Used S3 pre-signed URLs that expired, disrupting customer experience.  
**Solution:** Stored invoices in a public S3 bucket with a timestamp for expiration checks, displaying a "contact support" message after 7 days.

### Multi-Product Order Support
**Problem:** Original schema only supported single product orders, limiting B2B capabilities.  
**Failed approach:** Considered denormalizing products into a JSON column, which hindered querying.  
**Solution:** Created an order_items table with a foreign key to orders, maintaining backward compatibility with the main orders table.

## 🎨 UI & Visual Identity

### Brand Colors
| Role | Name | Hex | Usage |
|------|------|-----|-------|
| Primary | Teal | #00B98E | Buttons, accents, active states |
| Secondary | Darker Teal | #009B76 | Gradients |
| Background | Light Gray | #F4F7FB | Main pages |
| Background | Navy | #0D1F2D | Dark sections |
| Text Primary | Dark | #1A202C | Main text |
| Text Secondary | Gray | #94A3B4 | Secondary text |
| Status | Blue | #3B82F6 | Order Received |
| Status | Amber | #F59E0B | Processing |
| Status | Purple | #8B5CF6 | Ready to Dispatch |
| Status | Green | #10B981 | Delivered |

### Typography
- **Primary Font**: Inter (system-ui fallback) - body text
- **Secondary Font**: Manrope - headings
- **Monospace Font**: NONE
- **Heading sizes**: h1: 42px, h2: 28px, body text: 14-15px, labels: 11-12px

### Visual Style
- **Design language**: Flat
- **Border radius**: Rounded (10px for buttons, 20px for cards)
- **Shadows**: Subtle (0 2px 16px rgba(0,0,0,.05))
- **Spacing scale**: 8px
- **Iconography**: Lucide
- **Illustration style**: None

### Logo & Mark
- **Logo type**: Icon + wordmark
- **Logo colors**: Teal (#00B98E), Dark Navy (#0D1F2D)
- **Dark mode variant**: Yes (background changes to dark navy)

### Component Patterns
- **Buttons**: Gradient teal background (#00B98E to #009B76), white text, 10px border radius, subtle shadow, hover lift effect
- **Cards**: White background, 20px border radius, 1px solid border (#EEF2F5), subtle shadow
- **Badges/Tags**: Rounded 20px, colored background based on status, bold text, teal dot indicator
- **Navigation**: Sidebar for main navigation, hamburger menu for mobile

### Image Generation Prompt
Create a social media image for the Stellar Global Supplies Order Management System. Use a flat design style with a primary teal (#00B98E) and dark navy (#0D1F2D) background. Incorporate the Inter font for body text and Manrope for headings. Include elements representing order management, real-time tracking, and integration with email and WhatsApp.

---

## 💡 Post Angles
- **LinkedIn**: Discover how Stellar Global Supplies revolutionizes order management for B2B businesses with real-time tracking and automated notifications.
- **X**: Tired of manual order tracking? Check out how we built a serverless solution that empowers customers with real-time updates!
- **Dev.to**: Dive into our architecture decisions for a serverless order management system that scales effortlessly while maintaining security.
- **Bluesky**: Excited to share our journey building a B2B order management system with public tracking links and seamless integrations!

## 🏷️ Hashtags
#Serverless, #React, #AWS, #Supabase, #OrderManagement, #B2B, #WebDevelopment, #JavaScript, #CloudComputing, #EmailIntegration, #WhatsAppAPI, #ProgressiveWebApp

## 📌 Soundbites
Our serverless order management system leverages UUIDs for secure public tracking, eliminating guessable order IDs. With automated email and WhatsApp notifications, we streamline customer communication and reduce support overhead.

## 🔍 SEO Keywords
order management system, B2B order tracking, serverless architecture, Supabase PostgreSQL, real-time notifications, AWS Lambda, invoice management, public order tracking, WhatsApp integration, email notifications, Progressive Web App, cloud-based solutions

---
<!-- AUTO-GENERATED | Stellar-Global-Supplies/ai-context-generator | Model: gpt-4o-mini via GitHub Models -->
<!-- Source: Stellar-Global-Supplies/stellarglobalsupplies-orders/ai_context/*.md -->
<!-- Re-run workflow to regenerate — do not edit manually -->