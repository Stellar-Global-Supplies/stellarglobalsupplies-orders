# Quick Start Guide - Stellar Global Supplies Order Management System

## 🚀 5-Minute Setup

### Step 1: Clone & Install

```bash
git clone https://github.com/Prasadpb77/stellarglobalsupplies-orders.git
cd stellarglobalsupplies-orders
npm install --workspaces
```

### Step 2: Get Your Credentials

**Supabase:**
1. Create account at https://supabase.com
2. Create new project
3. Go to Settings > API Keys
4. Copy `URL` and `anon key`
5. Go to Service Role Secret, copy the key

**SendGrid:**
1. Sign up at https://sendgrid.com
2. Create API key with Mail Send permission
3. Verify sender email

### Step 3: Configure Environment

**Frontend** - `frontend/.env.local`
```env
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_anon_key
REACT_APP_API_ENDPOINT=http://localhost:3001
```

**Backend** - `backend/.env`
```env
PORT=3001
NODE_ENV=development
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SENDGRID_API_KEY=your_sendgrid_key
SENDGRID_FROM_EMAIL=your_verified_email@domain.com
JWT_SECRET=any_random_string_here
FRONTEND_URL=http://localhost:3000
```

### Step 4: Setup Database

1. In Supabase, go to SQL Editor
2. Create new query
3. Copy-paste contents of `database/schema.sql`
4. Click "Run"

### Step 5: Run Locally

```bash
# Terminal 1 - Frontend
cd frontend
npm run dev
# Opens http://localhost:3000

# Terminal 2 - Backend
cd backend
npm run dev
# Runs on http://localhost:3001
```

### Step 6: Create Test User

1. Go to http://localhost:3000
2. In Supabase console, go to Auth > Users
3. Add a test user with email/password
4. Use those credentials to login

## 🎯 Key Features to Test

### Create an Order
1. Click "New Order" button
2. Fill in customer details
3. Add items (SKU, Material, Quantity, Price)
4. Submit
5. Check email for confirmation

### View Orders
1. Go to Dashboard
2. See all your orders with stats
3. Click order to view details
4. Update status (status updates trigger emails)

### WhatsApp Messages
1. Open order detail
2. Click "Generate WhatsApp Message"
3. Click "Open WhatsApp"
4. Message is pre-filled, send manually

## 📊 Production Deployment

See `infrastructure/README.md` for:
- AWS setup with Terraform
- CloudFront CDN configuration
- GitHub Actions CI/CD setup
- Route53 DNS configuration

## 🆘 Troubleshooting

**Port already in use:**
```bash
# Change port in backend/.env
PORT=3002
```

**Supabase connection failed:**
- Check URL format: `https://xxxxx.supabase.co`
- Verify keys are correct
- Ensure project is active

**Emails not sending:**
- Verify SendGrid API key
- Check sender email is verified
- Look at backend logs for errors

**CORS errors:**
- Ensure backend is running on http://localhost:3001
- Check FRONTEND_URL in backend .env

## 📚 Full Documentation

See `COMPLETE_DOCUMENTATION.md` for:
- Architecture overview
- API endpoints reference
- Database schema details
- Security considerations
- Performance optimization

## 🎓 Learning Resources

- [React Documentation](https://react.dev)
- [Supabase Docs](https://supabase.com/docs)
- [Express.js Guide](https://expressjs.com)
- [Tailwind CSS](https://tailwindcss.com)
- [Terraform AWS](https://registry.terraform.io/providers/hashicorp/aws/latest)
