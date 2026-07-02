# GitHub Actions CI/CD Setup Guide

## Overview

This project uses GitHub Actions for automated deployment:
- Build on every push to main
- Deploy frontend to S3 + CloudFront
- Deploy backend to Lambda
- Invalidate CloudFront cache
- Send Slack notifications

## Prerequisites

1. GitHub repository access
2. AWS Account with permissions
3. GitHub Actions enabled (default)
4. Secrets configured (see below)

## Step 1: AWS Configuration

### Create IAM Role for GitHub Actions

Run this in AWS CloudFormation or use Terraform (already in this project):

```bash
cd infrastructure
terraform apply
terraform output github_actions_role_arn
```

Note the ARN (format: `arn:aws:iam::ACCOUNT_ID:role/stellar-orders-github-actions`)

### Verify OIDC Provider

Ensure GitHub OIDC is configured:

```bash
aws iam list-open-id-connect-providers
```

Should show: `arn:aws:iam::ACCOUNT_ID:oidc-provider/token.actions.githubusercontent.com`

## Step 2: Add GitHub Secrets

In your GitHub repository:
1. Go to Settings > Secrets and variables > Actions
2. Click "New repository secret"
3. Add these secrets:

### Required Secrets

```
AWS_ROLE_TO_ASSUME
# Value: arn:aws:iam::ACCOUNT_ID:role/stellar-orders-github-actions

CLOUDFRONT_DISTRIBUTION_ID
# Value: (from terraform output cloudfront_distribution_id)

SUPABASE_URL
# Value: https://xxxxx.supabase.co

SUPABASE_ANON_KEY
# Value: eyJhbGc... (copy from Supabase)

SUPABASE_SERVICE_ROLE_KEY
# Value: eyJhbGc... (copy from Supabase)

API_ENDPOINT
# Value: https://api.orders.stellarglobalsupplies.com

SENDGRID_API_KEY
# Value: SG.xxxxx (copy from SendGrid)
```

### Optional Secrets

```
SLACK_WEBHOOK
# For deployment notifications
```

## Step 3: Test CI/CD Pipeline

### Make a Small Change

```bash
git checkout -b test-cicd
echo "# Test commit" >> README.md
git add README.md
git commit -m "Test CI/CD pipeline"
git push origin test-cicd
```

### Create Pull Request

1. Go to GitHub
2. Create PR from `test-cicd` to `main`
3. Watch GitHub Actions run tests
4. Merge PR if checks pass
5. Watch deployment workflow

### Monitor Deployment

1. Go to repository > Actions
2. Click the running workflow
3. Watch logs in real-time
4. Check deployment status

## Step 4: Understand Workflow

The `.github/workflows/deploy.yml` does:

```yaml
1. Checkout code
2. Setup Node.js 18
3. Configure AWS credentials (using OIDC)
4. Install dependencies
5. Build frontend (with env vars)
6. Upload frontend to S3
7. Invalidate CloudFront
8. Build backend
9. Deploy to Lambda
10. Send Slack notification
```

## Step 5: Customization

### Change Deployment Branch

Edit `.github/workflows/deploy.yml`:

```yaml
on:
  push:
    branches:
      - main        # Change to your branch
```

### Add New Deployment Steps

Add step after Lambda deployment:

```yaml
- name: Run Integration Tests
  run: npm run test:integration
```

### Add Environment-Specific Deployments

Create `.github/workflows/deploy-staging.yml`:

```yaml
name: Deploy to Staging
on:
  push:
    branches:
      - develop

jobs:
  deploy:
    environment: staging
    runs-on: ubuntu-latest
    # ... similar steps with staging credentials
```

## Troubleshooting

### "Failed to assume role"

```
Error: AssumeRoleUnauthorizedOperation
```

**Solution:**
- Verify GitHub OIDC provider exists
- Check trust relationship in IAM role
- Ensure GitHub repo matches in trust policy

### "Build failed: Node version not found"

**Solution:**
- Update Node version in workflow
- Ensure package.json has correct engines field

### "S3 upload failed: Access Denied"

**Solution:**
- Verify AWS_ROLE_TO_ASSUME is correct
- Check S3 bucket policy
- Ensure Lambda has S3 permissions

### "Deployment takes too long"

**Solution:**
- Optimize build process
- Use artifact caching
- Reduce Lambda package size

## Monitoring

### View Workflow Runs

1. Go to Actions tab
2. Click workflow name
3. See all runs with status
4. Click run for details

### Check Logs

1. Open workflow run
2. Click job
3. Expand steps to see logs
4. Search for errors

### Set Up Notifications

**GitHub Email:**
- Settings > Notifications > GitHub Actions

**Slack Integration:**
- Add SLACK_WEBHOOK secret
- Workflow automatically sends updates

## Best Practices

1. **Always create feature branches** for changes
2. **Test locally** before pushing
3. **Review workflow logs** for failures
4. **Keep secrets updated** quarterly
5. **Monitor costs** - Lambda and S3 usage

## Advanced Configuration

### Matrix Strategy (Multiple Environments)

```yaml
strategy:
  matrix:
    environment: [staging, production]
    node-version: [18.x, 20.x]

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: ${{ matrix.environment }}
    # Use ${{ matrix.environment }} for environment-specific secrets
```

### Conditional Steps

```yaml
- name: Deploy to Production
  if: github.ref == 'refs/heads/main' && github.event_name == 'push'
  run: npm run deploy:prod
```

### Manual Workflow Trigger

```yaml
on:
  workflow_dispatch:
    inputs:
      environment:
        description: 'Deployment environment'
        required: true
        default: staging
```

## Cost Optimization

- GitHub Actions: **Free for public repos**, limited for private
- AWS: Monitor Lambda executions and S3 transfers
- CloudFront: Pay per GB transferred
- Route53: $0.40/month for hosted zone

## Resources

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [AWS OIDC Documentation](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_providers_create_oidc.html)
- [Deploy to AWS Lambda](https://github.com/aws-actions/aws-lambda-deploy-action)
