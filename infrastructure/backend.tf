# Terraform state configuration
terraform {
  backend "s3" {
    bucket         = "stellarglobalsupplies-backend-config"
    key            = "stellarglobalsupplies-orders/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "stellarglobalsupplies-backend-db-config"
  }
}
