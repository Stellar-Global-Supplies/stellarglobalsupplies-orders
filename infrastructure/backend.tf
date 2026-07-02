# Terraform state configuration
terraform {
  backend "s3" {
    bucket         = "stellar-orders-terraform-state"
    key            = "prod/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "stellar-orders-terraform-locks"
  }
}
