# Stellar Global Supplies - Order Management System
# Terraform Infrastructure Documentation

## Overview

This directory contains Terraform configurations for the production-ready Order Management System infrastructure on AWS.

## Architecture

```
┌─────────────┐
│   Route53   │ (DNS)
└──────┬──────┘
       │
┌──────▼──────────┐
│   CloudFront    │ (CDN & SSL)
└──────┬──────────┘
       │
┌──────▼──────────┐
│   S3 Bucket     │ (Frontend)
└─────────────────┘

┌─────────────────────┐
│  API Gateway        │ (HTTP)
└──────┬──────────────┘
       │
┌──────▼──────────────┐
│  Lambda Function    │ (Node.js)
└─────────────────────┘
```

## Components

### 1. S3 + CloudFront (Frontend)
- **S3 Bucket**: Hosts React frontend build
- **CloudFront**: CDN distribution with custom domain SSL
- **Route53**: DNS routing to CloudFront
- **ACM Certificate**: SSL/TLS for custom domain

### 2. API Gateway + Lambda (Backend)
- **API Gateway**: HTTP API endpoint
- **Lambda**: Node.js Express application handler
- **IAM Role**: Lambda execution permissions

### 3. GitHub Actions CI/CD
- **OIDC Integration**: Secure token-based authentication
- **IAM Role**: GitHub Actions assume role
- **Permissions**: S3, CloudFront, Lambda deployment

## Prerequisites

1. AWS Account with appropriate permissions
2. Route53 hosted zone for `stellarglobalsupplies.com`
3. Terraform >= 1.0
4. AWS CLI configured

## Setup Instructions

### 1. Initialize Terraform

```bash
cd infrastructure
terraform init
```

### 2. Create Terraform State Backend (One-time)

```bash
# Create S3 bucket for state
aws s3api create-bucket \
  --bucket stellar-orders-terraform-state \
  --region us-east-1

# Enable versioning
aws s3api put-bucket-versioning \
  --bucket stellar-orders-terraform-state \
  --versioning-configuration Status=Enabled

# Enable encryption
aws s3api put-bucket-encryption \
  --bucket stellar-orders-terraform-state \
  --server-side-encryption-configuration '{
    "Rules": [{
      "ApplyServerSideEncryptionByDefault": {
        "SSEAlgorithm": "AES256"
      }
    }]
  }'

# Create DynamoDB table for state locking
aws dynamodb create-table \
  --table-name stellar-orders-terraform-locks \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5
```

### 3. Plan and Apply

```bash
# Review changes
terraform plan

# Apply infrastructure
terraform apply
```

## Configuration

Edit `terraform.tfvars` to customize:

```hcl
aws_region           = "us-east-1"
environment          = "production"
domain_name          = "orders.stellarglobalsupplies.com"
frontend_bucket_name = "stellar-orders-frontend"
lambda_function_name = "stellar-orders"
```

## GitHub Actions Configuration

### 1. Get the OIDC Role ARN

```bash
terraform output github_actions_role_arn
```

### 2. Add GitHub Secrets

In your GitHub repository settings, add:

```
AWS_ROLE_TO_ASSUME=arn:aws:iam::ACCOUNT_ID:role/stellar-orders-github-actions
CLOUDFRONT_DISTRIBUTION_ID=<output from terraform>
SUPABASE_URL=<your supabase url>
SUPABASE_ANON_KEY=<your anon key>
SUPABASE_SERVICE_ROLE_KEY=<your service role key>
SENDGRID_API_KEY=<your sendgrid key>
API_ENDPOINT=<api gateway url>
```

## Outputs

```bash
# Get all outputs
terraform output

# Specific outputs
terraform output s3_bucket_name
terraform output cloudfront_distribution_id
terraform output api_gateway_url
```

## Monitoring and Troubleshooting

### CloudFront Issues

```bash
# Clear cache
aws cloudfront create-invalidation \
  --distribution-id <DISTRIBUTION_ID> \
  --paths "/*"

# View distribution details
aws cloudfront get-distribution \
  --id <DISTRIBUTION_ID>
```

### Lambda Issues

```bash
# View logs
aws logs tail /aws/lambda/stellar-orders --follow

# Test function
aws lambda invoke \
  --function-name stellar-orders \
  --payload '{"test": true}' \
  response.json
```

## Updating Infrastructure

```bash
# Plan changes
terraform plan

# Apply changes
terraform apply

# Destroy infrastructure (use with caution!)
terraform destroy
```

## Security Best Practices

1. **State File**: Keep `terraform.tfstate` secure in S3 with versioning and encryption
2. **Secrets**: Use AWS Secrets Manager for sensitive data
3. **IAM**: Apply principle of least privilege
4. **HTTPS**: All endpoints use HTTPS/TLS
5. **CloudFront**: Enable WAF for additional protection

## Cost Optimization

- CloudFront: ~$0.085/GB data transfer
- Lambda: ~$0.20 per 1M requests
- S3: ~$0.023/GB storage
- Route53: ~$0.40/month per zone

## Support

For issues or questions, refer to:
- [Terraform AWS Provider Docs](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [AWS Lambda Documentation](https://docs.aws.amazon.com/lambda/)
- [GitHub Actions OIDC](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/about-security-hardening-with-openid-connect)
