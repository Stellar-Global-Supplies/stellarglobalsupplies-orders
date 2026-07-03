##############################################################################
# Stellar Global Supplies — OMS Infrastructure
# Frontend : S3 + CloudFront  → orders.stellarglobalsupplies.com
# Backend  : API Gateway HTTP API + 3 Lambda functions
# DNS      : Existing Route53 hosted zone  (cert already issued)
# Auth     : Supabase Auth with Google OAuth
##############################################################################

terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.50"
    }
    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.4"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.6"
    }
  }

  # Configure via GitHub Actions secrets or a *.tfbackend file:
  #   terraform init -backend-config=backend.tfbackend
  backend "s3" {
    key            = "stellar-global/terraform.tfstate"
    encrypt        = true
    use_lockfile   = true
  }
}

provider "aws" {
  region = var.aws_region
}

# ACM for CloudFront must live in us-east-1
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"
}

##############################################################################
# Variables
##############################################################################
variable "aws_region"               { default     = "us-east-1" }
variable "domain_name"              { default     = "orders.stellarglobalsupplies.com" }
variable "root_domain"              { default     = "stellarglobalsupplies.com" }
variable "supabase_url"             { sensitive   = true }
variable "supabase_service_key"     { sensitive   = true }
variable "environment"              { default     = "production" }
# Set to the ARN of your already-issued ACM cert (us-east-1) — leave empty to create new
variable "existing_acm_cert_arn"    { default     = "arn:aws:acm:us-east-1:471112840461:certificate/27fa15e5-f9f8-4b5d-a7b2-a6ee4c212ed7" }

locals {
  name_prefix = "stellar-oms"
  common_tags = {
    Project     = "Stellar OMS"
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
  # Use existing cert if ARN provided, otherwise use the one we create
  cert_arn = var.existing_acm_cert_arn != "" ? var.existing_acm_cert_arn: aws_acm_certificate_validation.oms[0].certificate_arn

##############################################################################
# Existing Route53 hosted zone
##############################################################################
data "aws_route53_zone" "main" {
  name         = var.root_domain
  private_zone = false
}

##############################################################################
# ACM Certificate  (skipped when existing_acm_cert_arn is supplied)
##############################################################################
resource "aws_acm_certificate" "oms" {
  count             = var.existing_acm_cert_arn == "" ? 1 : 0
  provider          = aws.us_east_1
  domain_name       = var.domain_name
  validation_method = "DNS"
  tags              = local.common_tags
  lifecycle { create_before_destroy = true }
}

resource "aws_route53_record" "cert_validation" {
  for_each = var.existing_acm_cert_arn == "" ? {
    for dvo in aws_acm_certificate.oms[0].domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      type   = dvo.resource_record_type
      record = dvo.resource_record_value
    }
  } : {}

  zone_id         = data.aws_route53_zone.main.zone_id
  name            = each.value.name
  type            = each.value.type
  records         = [each.value.record]
  ttl             = 60
  allow_overwrite = true
}

resource "aws_acm_certificate_validation" "oms" {
  count                   = var.existing_acm_cert_arn == "" ? 1 : 0
  provider                = aws.us_east_1
  certificate_arn         = aws_acm_certificate.oms[0].arn
  validation_record_fqdns = [for r in aws_route53_record.cert_validation : r.fqdn]
}

##############################################################################
# S3 — Static frontend bucket
##############################################################################
resource "aws_s3_bucket" "frontend" {
  bucket = "${local.name_prefix}-frontend-${var.environment}"
  tags   = local.common_tags
}

resource "aws_s3_bucket_public_access_block" "frontend" {
  bucket                  = aws_s3_bucket.frontend.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_versioning" "frontend" {
  bucket = aws_s3_bucket.frontend.id
  versioning_configuration { status = "Enabled" }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "frontend" {
  bucket = aws_s3_bucket.frontend.id
  rule {
    apply_server_side_encryption_by_default { sse_algorithm = "AES256" }
  }
}

resource "aws_cloudfront_origin_access_control" "frontend" {
  name                              = "${local.name_prefix}-oac"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

resource "aws_s3_bucket_policy" "frontend" {
  bucket     = aws_s3_bucket.frontend.id
  depends_on = [aws_cloudfront_distribution.frontend]
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Sid       = "AllowCloudFrontOAC"
      Effect    = "Allow"
      Principal = { Service = "cloudfront.amazonaws.com" }
      Action    = "s3:GetObject"
      Resource  = "${aws_s3_bucket.frontend.arn}/*"
      Condition = {
        StringEquals = { "AWS:SourceArn" = aws_cloudfront_distribution.frontend.arn }
      }
    }]
  })
}

##############################################################################
# CloudFront Distribution
##############################################################################
resource "aws_cloudfront_distribution" "frontend" {
  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"
  aliases             = [var.domain_name]
  price_class         = "PriceClass_200"
  tags                = local.common_tags

  origin {
    domain_name              = aws_s3_bucket.frontend.bucket_regional_domain_name
    origin_id                = "S3-${aws_s3_bucket.frontend.bucket}"
    origin_access_control_id = aws_cloudfront_origin_access_control.frontend.id
  }

  default_cache_behavior {
    target_origin_id       = "S3-${aws_s3_bucket.frontend.bucket}"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true

    forwarded_values {
      query_string = false
      cookies { forward = "none" }
    }

    min_ttl     = 0
    default_ttl = 3600
    max_ttl     = 86400
  }

  # SPA: serve index.html on 403/404 so React Router works
  custom_error_response {
    error_code            = 403
    response_code         = 200
    response_page_path    = "/index.html"
    error_caching_min_ttl = 0
  }
  custom_error_response {
    error_code            = 404
    response_code         = 200
    response_page_path    = "/index.html"
    error_caching_min_ttl = 0
  }

  restrictions { 
    geo_restriction { restriction_type = "none" } }

  viewer_certificate {
    acm_certificate_arn      = local.cert_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }
  viewer_certificate {
    acm_certificate_arn      = var.acm_certificate_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }
}

##############################################################################
# Route53 — orders.stellarglobalsupplies.com → CloudFront
##############################################################################
resource "aws_route53_record" "oms_a" {
  zone_id = data.aws_route53_zone.main.zone_id
  name    = var.domain_name
  type    = "A"
  alias {
    name                   = aws_cloudfront_distribution.frontend.domain_name
    zone_id                = aws_cloudfront_distribution.frontend.hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "oms_aaaa" {
  zone_id = data.aws_route53_zone.main.zone_id
  name    = var.domain_name
  type    = "AAAA"
  alias {
    name                   = aws_cloudfront_distribution.frontend.domain_name
    zone_id                = aws_cloudfront_distribution.frontend.hosted_zone_id
    evaluate_target_health = false
  }
}

##############################################################################
# IAM — Lambda execution role
##############################################################################
resource "aws_iam_role" "lambda" {
  name = "${local.name_prefix}-lambda-role"
  tags = local.common_tags
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{ Effect = "Allow" Action = "sts:AssumeRole" Principal = { Service = "lambda.amazonaws.com" } }]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_basic" {
  role       = aws_iam_role.lambda.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# No SES policy needed — email is sent via Gmail API using OAuth2 credentials

##############################################################################
# CloudWatch Log Groups for Lambdas
##############################################################################
resource "aws_cloudwatch_log_group" "create_order" {
  name              = "/aws/lambda/${local.name_prefix}-create-order"
  retention_in_days = 30
  tags              = local.common_tags
}
resource "aws_cloudwatch_log_group" "update_status" {
  name              = "/aws/lambda/${local.name_prefix}-update-order-status"
  retention_in_days = 30
  tags              = local.common_tags
}
resource "aws_cloudwatch_log_group" "send_notification" {
  name              = "/aws/lambda/${local.name_prefix}-send-notification"
  retention_in_days = 30
  tags              = local.common_tags
}
resource "aws_cloudwatch_log_group" "api" {
  name              = "/aws/apigateway/${local.name_prefix}"
  retention_in_days = 30
  tags              = local.common_tags
}

##############################################################################
# Lambda — shared env
##############################################################################
variable "gmail_client_id"     { sensitive = true }
variable "gmail_client_secret" { sensitive = true }
variable "gmail_refresh_token" { sensitive = true }
variable "gmail_sender"        { default   = "orders@stellarglobalsupplies.com" }

locals {
  lambda_env = {
    SUPABASE_URL              = var.supabase_url
    SUPABASE_SERVICE_ROLE_KEY = var.supabase_service_key
    NODE_ENV                  = "production"
    GMAIL_CLIENT_ID           = var.gmail_client_id
    GMAIL_CLIENT_SECRET       = var.gmail_client_secret
    GMAIL_REFRESH_TOKEN       = var.gmail_refresh_token
    GMAIL_SENDER              = var.gmail_sender
  }
  lambda_zip_dir = "${path.module}/.lambda_zips"
}

resource "null_resource" "lambda_zips_dir" {
  provisioner "local-exec" { command = "mkdir -p ${local.lambda_zip_dir}" }
}

##############################################################################
# Lambda — create-order
##############################################################################
data "archive_file" "create_order" {
  type        = "zip"
  source_dir  = "${path.module}/../lambda/create-order"
  output_path = "${local.lambda_zip_dir}/create-order.zip"
  depends_on  = [null_resource.lambda_zips_dir]
}

resource "aws_lambda_function" "create_order" {
  filename         = data.archive_file.create_order.output_path
  function_name    = "${local.name_prefix}-create-order"
  role             = aws_iam_role.lambda.arn
  handler          = "index.handler"
  runtime          = "nodejs20.x"
  source_code_hash = data.archive_file.create_order.output_base64sha256
  timeout          = 30
  memory_size      = 256
  depends_on       = [aws_cloudwatch_log_group.create_order]
  environment { variables = local.lambda_env }
  tags = local.common_tags
}

##############################################################################
# Lambda — update-order-status
##############################################################################
data "archive_file" "update_status" {
  type        = "zip"
  source_dir  = "${path.module}/../lambda/update-order-status"
  output_path = "${local.lambda_zip_dir}/update-order-status.zip"
  depends_on  = [null_resource.lambda_zips_dir]
}

resource "aws_lambda_function" "update_status" {
  filename         = data.archive_file.update_status.output_path
  function_name    = "${local.name_prefix}-update-order-status"
  role             = aws_iam_role.lambda.arn
  handler          = "index.handler"
  runtime          = "nodejs20.x"
  source_code_hash = data.archive_file.update_status.output_base64sha256
  timeout          = 30
  memory_size      = 256
  depends_on       = [aws_cloudwatch_log_group.update_status]
  environment { variables = local.lambda_env }
  tags = local.common_tags
}

##############################################################################
# Lambda — send-notification
##############################################################################
data "archive_file" "send_notification" {
  type        = "zip"
  source_dir  = "${path.module}/../lambda/send-notification"
  output_path = "${local.lambda_zip_dir}/send-notification.zip"
  depends_on  = [null_resource.lambda_zips_dir]
}

resource "aws_lambda_function" "send_notification" {
  filename         = data.archive_file.send_notification.output_path
  function_name    = "${local.name_prefix}-send-notification"
  role             = aws_iam_role.lambda.arn
  handler          = "index.handler"
  runtime          = "nodejs20.x"
  source_code_hash = data.archive_file.send_notification.output_base64sha256
  timeout          = 30
  memory_size      = 256
  depends_on       = [aws_cloudwatch_log_group.send_notification]
  environment { variables = local.lambda_env }
  tags = local.common_tags
}

##############################################################################
# API Gateway HTTP API
##############################################################################
resource "aws_apigatewayv2_api" "oms" {
  name          = "${local.name_prefix}-api"
  protocol_type = "HTTP"
  tags          = local.common_tags

  cors_configuration {
    allow_origins = [
      "https://${var.domain_name}",
      "http://localhost:3000"
    ]
    allow_methods = ["GET", "POST", "PATCH", "OPTIONS"]
    allow_headers = ["Content-Type", "Authorization"]
    max_age       = 86400
  }
}

resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.oms.id
  name        = "$default"
  auto_deploy = true
  tags        = local.common_tags

  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.api.arn
    format = jsonencode({
      requestId   = "$context.requestId"
      ip          = "$context.identity.sourceIp"
      method      = "$context.httpMethod"
      path        = "$context.path"
      status      = "$context.status"
      latency     = "$context.responseLatency"
    })
  }
}

# Integrations
resource "aws_apigatewayv2_integration" "create_order" {
  api_id                 = aws_apigatewayv2_api.oms.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.create_order.invoke_arn
  integration_method     = "POST"
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_integration" "update_status" {
  api_id                 = aws_apigatewayv2_api.oms.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.update_status.invoke_arn
  integration_method     = "POST"
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_integration" "send_notification" {
  api_id                 = aws_apigatewayv2_api.oms.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.send_notification.invoke_arn
  integration_method     = "POST"
  payload_format_version = "2.0"
}

# Routes
resource "aws_apigatewayv2_route" "post_orders" {
  api_id    = aws_apigatewayv2_api.oms.id
  route_key = "POST /orders"
  target    = "integrations/${aws_apigatewayv2_integration.create_order.id}"
}

resource "aws_apigatewayv2_route" "patch_status" {
  api_id    = aws_apigatewayv2_api.oms.id
  route_key = "PATCH /orders/{id}/status"
  target    = "integrations/${aws_apigatewayv2_integration.update_status.id}"
}

resource "aws_apigatewayv2_route" "post_notify" {
  api_id    = aws_apigatewayv2_api.oms.id
  route_key = "POST /orders/{id}/notify"
  target    = "integrations/${aws_apigatewayv2_integration.send_notification.id}"
}

# Lambda invoke permissions
resource "aws_lambda_permission" "apigw_create_order" {
  statement_id  = "AllowAPIGW"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.create_order.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.oms.execution_arn}/*/*"
}

resource "aws_lambda_permission" "apigw_update_status" {
  statement_id  = "AllowAPIGW"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.update_status.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.oms.execution_arn}/*/*"
}

resource "aws_lambda_permission" "apigw_send_notification" {
  statement_id  = "AllowAPIGW"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.send_notification.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.oms.execution_arn}/*/*"
}

##############################################################################
# SSM — store outputs for GitHub Actions fallback
##############################################################################
resource "aws_ssm_parameter" "s3_bucket" {
  name  = "/stellar-oms/s3-bucket"
  type  = "String"
  value = aws_s3_bucket.frontend.bucket
  tags  = local.common_tags
}

resource "aws_ssm_parameter" "cf_id" {
  name  = "/stellar-oms/cf-distribution-id"
  type  = "String"
  value = aws_cloudfront_distribution.frontend.id
  tags  = local.common_tags
}

resource "aws_ssm_parameter" "api_url" {
  name  = "/stellar-oms/api-url"
  type  = "String"
  value = aws_apigatewayv2_api.oms.api_endpoint
  tags  = local.common_tags
}

##############################################################################
# Outputs
##############################################################################
output "oms_url"            { value = "https://${var.domain_name}" }
output "cloudfront_id"      { value = aws_cloudfront_distribution.frontend.id }
output "cloudfront_domain"  { value = aws_cloudfront_distribution.frontend.domain_name }
output "s3_bucket_name"     { value = aws_s3_bucket.frontend.bucket }
output "api_gateway_url"    { value = aws_apigatewayv2_api.oms.api_endpoint }
