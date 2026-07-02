variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
}

variable "domain_name" {
  description = "Domain name for the application"
  type        = string
  default     = "orders.stellarglobalsupplies.com"
}

variable "frontend_bucket_name" {
  description = "S3 bucket name for frontend"
  type        = string
  default     = "stellar-orders-frontend"
}

variable "lambda_function_name" {
  description = "Lambda function name"
  type        = string
  default     = "stellar-orders"
}

variable "lambda_runtime" {
  description = "Lambda runtime"
  type        = string
  default     = "nodejs18.x"
}

variable "github_actions_role_name" {
  description = "IAM role name for GitHub Actions"
  type        = string
  default     = "stellar-orders-github-actions"
}

variable "github_repo_owner" {
  description = "GitHub repository owner"
  type        = string
  default     = "Prasadpb77"
}

variable "github_repo_name" {
  description = "GitHub repository name"
  type        = string
  default     = "stellarglobalsupplies-orders"
}
