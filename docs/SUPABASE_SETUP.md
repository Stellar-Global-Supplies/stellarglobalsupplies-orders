# Supabase Integration Guide

## Prerequisites

- Supabase account (https://supabase.com)
- Node.js 18+

## Step 1: Create Supabase Project

1. Sign in to Supabase console
2. Click "New Project"
3. Fill in details:
   - Organization: Select or create
   - Project name: `stellar-orders`
   - Database password: Generate strong password
   - Region: Choose closest to your location
4. Click "Create new project"
5. Wait for database to initialize (2-3 minutes)

## Step 2: Get API Credentials

### Get URL and Anon Key

1. Go to Project Settings > API
2. Copy these values:
   - `Project URL` (e.g., `https://xxxxx.supabase.co`)
   - `anon public` key
   - Service role secret key (under "Service role key")

## Step 3: Enable Realtime (Optional)

1. Go to Database > Realtime
2. Enable for tables: `orders`, `order_items`, `order_status_history`
3. This enables live updates in frontend

## Step 4: Setup Authentication

### Enable Email/Password Auth

1. Go to Authentication > Providers
2. Ensure Email provider is enabled
3. Go to Policies & Constraints
4. Review MFA settings (optional)

### Configure Email Templates

1. Go to Authentication > Email Templates
2. Customize welcome, confirm, reset password emails (optional)
3. Add your branding

## Step 5: Create Storage Buckets (Optional)

If you want to store order attachments:

```sql
-- In Supabase SQL Editor
CREATE BUCKET order_attachments;

-- Make public
CREATE POLICY "Public Access" on storage.objects
  FOR SELECT USING (bucket_id = 'order_attachments');
```

## Step 6: Run Database Schema

1. Go to SQL Editor > New Query
2. Copy-paste entire contents of `database/schema.sql`
3. Click "Run"
4. Schema is now created!

## Step 7: Create Test Data

```sql
-- Add test SKUs
INSERT INTO top_sku (id, sku) VALUES
  (gen_random_uuid(), 'SKU-001-PLASTIC'),
  (gen_random_uuid(), 'SKU-002-METAL'),
  (gen_random_uuid(), 'SKU-003-GLASS');

-- Add test materials
INSERT INTO material_spilt (id, material) VALUES
  (gen_random_uuid(), 'Plastic'),
  (gen_random_uuid(), 'Metal'),
  (gen_random_uuid(), 'Glass'),
  (gen_random_uuid(), 'Rubber');
```

## Step 8: Create Test User

1. Go to Authentication > Users
2. Click "Add user"
3. Fill in:
   - Email: `test@example.com`
   - Password: Strong password
   - Auto-confirm: Yes (check if available)
4. Click "Create user"

## Step 9: Setup Row Level Security (Already Done in Schema)

The schema.sql already includes RLS policies. Verify:

```sql
-- Check RLS is enabled
SELECT tablename, 
       (SELECT COUNT(*) FROM pg_policies WHERE pg_policies.tablename = pg_tables.tablename) as policy_count
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

## Step 10: Connect to Application

Add credentials to your `.env` files:

**Frontend** `.env.local`:
```env
REACT_APP_SUPABASE_URL=https://xxxxx.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGc...
```

**Backend** `.env`:
```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

## Monitoring & Maintenance

### View Database Statistics

```sql
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Monitor Query Performance

```sql
SELECT
  query,
  calls,
  mean_time,
  max_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

### Backup

1. Go to Project Settings > Backups
2. Enable automatic daily backups
3. Download backup if needed

## Troubleshooting

### Connection Refused
```
Error: ECONNREFUSED
```
- Check Supabase project status
- Verify URL format
- Ensure project is not paused

### Authentication Failed
```
Error: Invalid API Key
```
- Verify anon key is used in frontend
- Verify service role key is used in backend
- Keys may have been regenerated

### RLS Policy Blocking Access
```
Error: new row violates row-level security policy
```
- Verify user is authenticated
- Check RLS policies match your use case
- May need to adjust policies

### Database Quota Exceeded
```
Error: Database quota exceeded
```
- Upgrade Supabase plan
- Delete old test data
- Archive old orders

## Advanced Configuration

### Custom Middleware

Add Supabase middleware in backend:

```typescript
import { supabase } from './lib/supabase';

app.use(async (req, res, next) => {
  const token = req.headers.authorization?.split('Bearer ')[1];
  if (token) {
    const user = await supabase.auth.getUser(token);
    req.user = user.data.user;
  }
  next();
});
```

### Webhooks

Supabase can send webhooks for database changes:

1. Go to Database > Webhooks
2. Create webhook for `orders` table
3. Set endpoint URL
4. Events: INSERT, UPDATE, DELETE
5. Will POST changes to your endpoint

### Edge Functions (Optional)

For serverless functions in Supabase:

```bash
supabase functions new handle-order-webhook
```

## Security Best Practices

1. **Never expose service role key** in frontend
2. **Use RLS policies** to enforce data access
3. **Rotate API keys** quarterly
4. **Enable MFA** for admin account
5. **Review logs** in Realtime section
6. **Use JWT tokens** that expire

## Performance Tips

1. **Add indexes** for frequently queried columns
2. **Use select()** to limit columns returned
3. **Paginate** large queries
4. **Cache** static data
5. **Use Realtime** for live updates

## Resources

- [Supabase Docs](https://supabase.com/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Supabase Community](https://github.com/supabase/supabase/discussions)
