# Deployment Guide — Stellar Orders

End-to-end steps to deploy the complete solution: database, Gmail email, AWS infra, and the single CI/CD pipeline.

---

## 0. SQL compatibility check (`database/schema.sql`)

**Verified — safe to run.** `schema.sql` only *references* your existing `top_sku` and `material_spilt` views as foreign-key targets; it does not `CREATE`, `CREATE OR REPLACE`, `ALTER`, or `DROP` either of them, and it never touches the `sku` or `material_type` columns. Only one new object is added: the `order_summary` view (`CREATE OR REPLACE VIEW order_summary`), which is unrelated to yours. So your two existing views and their columns are untouched.

**One real risk to check before running it, though:**

```sql
sku_id UUID NOT NULL REFERENCES public.top_sku(id),
material_id UUID NOT NULL REFERENCES public.material_spilt(id),
```

PostgreSQL foreign keys can only reference a **table** (or a materialized view with a unique index) — not a plain `VIEW`. If `top_sku` / `material_spilt` are ordinary views (`SELECT ... FROM ...`), this `CREATE TABLE order_items` statement will fail with an error like `there is no unique constraint matching given keys for referenced table "top_sku"`.

Run this in the Supabase SQL editor first to confirm what they actually are:

```sql
SELECT table_name, table_type
FROM information_schema.tables
WHERE table_name IN ('top_sku', 'material_spilt');
```

- If `table_type = 'BASE TABLE'` → you're fine, run `schema.sql` as-is.
- If `table_type = 'VIEW'` → the FK will fail. Fix by dropping the two `REFERENCES` clauses (keep the columns, just remove the FK) and relying on application-level lookups instead:
  ```sql
  sku_id UUID NOT NULL,
  material_id UUID NOT NULL,
  ```
  This does not touch `top_sku`/`material_spilt` at all, so both views and their `sku` / `material_type` columns remain exactly as they are today either way.

---

## 1. Prerequisites

- Node.js 20+, npm
- AWS CLI configured with an account that can create IAM/S3/CloudFront/Lambda/API Gateway/Route53 resources
- Terraform ≥ 1.5
- A Supabase project
- A Google Cloud project with OAuth consent screen configured
- GitHub repo with Actions enabled

---

## 2. Database (Supabase)

1. Open Supabase → SQL Editor.
2. Run the compatibility check query in **Step 0** above.
3. Adjust `database/schema.sql` if needed (per Step 0), then run it.
4. Confirm `orders`, `order_items`, `order_status_history`, `order_notifications` were created and RLS policies are active (Table Editor → each table → RLS toggle should be ON).
5. Copy your Project URL, `anon` key, and `service_role` key (Settings → API) — needed in Step 5.

---

## 3. Gmail OAuth2 (replaces SendGrid)

Follow `docs/GMAIL_OAUTH_SETUP.md` in full. Summary:

1. In Google Cloud Console, enable the **Gmail API**.
2. Create an **OAuth 2.0 Client ID** (type: Web application), add `https://developers.google.com/oauthplayground` as an authorized redirect URI.
3. Note the **Client ID** and **Client Secret**.
4. Go to [OAuth Playground](https://developers.google.com/oauthplayground) → gear icon → check "Use your own OAuth credentials" → paste your Client ID/Secret.
5. Authorize scope `https://mail.google.com/`, sign in with the Gmail account that will send order emails (e.g. `stellarglobalsupplies@gmail.com`).
6. Exchange the authorization code for tokens → copy the **Refresh Token**.
7. You now have: `GMAIL_USER`, `GMAIL_CLIENT_ID`, `GMAIL_CLIENT_SECRET`, `GMAIL_REFRESH_TOKEN` — needed in Step 5.

---

## 4. AWS infrastructure (Terraform)

```bash
cd infrastructure
terraform init
terraform plan   # review resources: S3, CloudFront, Lambda, API Gateway, Route53, IAM/OIDC role
terraform apply
```

After apply, capture the outputs — you'll need them for GitHub secrets:

```bash
terraform output s3_bucket_name
terraform output cloudfront_distribution_id
terraform output api_gateway_url
terraform output github_actions_role_arn
```

Confirm the GitHub OIDC provider exists (Terraform creates it, this just verifies):

```bash
aws iam list-open-id-connect-providers
```

---

## 5. GitHub repository secrets

Settings → Secrets and variables → Actions → New repository secret. Add all of these:

| Secret | Value source |
|---|---|
| `AWS_ROLE_TO_ASSUME` | `terraform output github_actions_role_arn` |
| `CLOUDFRONT_DISTRIBUTION_ID` | `terraform output cloudfront_distribution_id` |
| `S3_BUCKET_NAME` | `terraform output s3_bucket_name` |
| `API_ENDPOINT` | `terraform output api_gateway_url` |
| `SUPABASE_URL` | Supabase → Settings → API |
| `SUPABASE_ANON_KEY` | Supabase → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API |
| `JWT_SECRET` | any long random string (`openssl rand -hex 32`) |
| `FRONTEND_URL` | `https://orders.stellarglobalsupplies.com` (your `domain_name`) |
| `GMAIL_USER` | the Gmail address from Step 3 |
| `GMAIL_CLIENT_ID` | from Step 3 |
| `GMAIL_CLIENT_SECRET` | from Step 3 |
| `GMAIL_REFRESH_TOKEN` | from Step 3 |
| `SLACK_WEBHOOK` | optional, for deploy notifications |

Double-check `infrastructure/terraform.tfvars` → `aws_region` matches the `AWS_REGION` env value at the top of `.github/workflows/deploy.yml` (both default to `us-east-1`).

---

## 6. Run the pipeline

The whole app deploys through **one** workflow: `.github/workflows/deploy.yml`.

- Push to `main` → runs automatically, or
- Actions tab → "Deploy Stellar Orders" → **Run workflow** (manual trigger)

What it does, in order:
1. Checks out code, assumes the AWS role via OIDC
2. `backend`: install → test → build → zip → `aws lambda update-function-code`
3. Updates Lambda environment variables (Supabase, JWT, Gmail OAuth creds)
4. `frontend`: install → build (with Supabase/API env vars baked in) → `aws s3 sync` → CloudFront invalidation
5. Posts a Slack notification with the result (if `SLACK_WEBHOOK` is set)

Watch it under the **Actions** tab. A failed step stops the job — no partial deploys of secrets.

---

## 7. Post-deploy verification

1. Visit `https://<your domain>` — frontend should load with the teal/amber Stellar branding.
2. Log in, create a test order.
3. Confirm the confirmation email arrives from the `GMAIL_USER` address with the branded template.
4. Change the order status and confirm the status-update email is sent.
5. Check `order_notifications` table in Supabase — rows should show `status = 'sent'`.
6. `aws lambda get-function --function-name stellar-orders` → confirm `LastUpdateStatus: Successful`.

---

## 8. Rollback

- **Frontend**: re-run the workflow against a previous commit (`workflow_dispatch` from an older ref), or `aws s3 sync` a previous `dist/` build manually, then invalidate CloudFront.
- **Backend**: keep the previous `function.zip` as a GitHub Actions artifact, or re-deploy from the last-good commit; Lambda versions/aliases can also be enabled in `infrastructure/lambda_api_gateway.tf` for one-command rollback if you want that later.