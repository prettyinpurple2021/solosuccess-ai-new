terraform {
  required_version = ">= 1.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  
  backend "s3" {
    bucket         = "solosuccess-terraform-state"
    key            = "production/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "terraform-state-lock"
  }
}

provider "aws" {
  region = var.aws_region
  
  default_tags {
    tags = {
      Environment = var.environment
      Project     = "SoloSuccess-AI"
      ManagedBy   = "Terraform"
    }
  }
}

# VPC Configuration
module "vpc" {
  source = "./modules/vpc"
  
  environment         = var.environment
  vpc_cidr            = var.vpc_cidr
  availability_zones  = var.availability_zones
  public_subnet_cidrs = var.public_subnet_cidrs
  private_subnet_cidrs = var.private_subnet_cidrs
}

# RDS PostgreSQL Database
module "database" {
  source = "./modules/rds"
  
  environment             = var.environment
  vpc_id                  = module.vpc.vpc_id
  private_subnet_ids      = module.vpc.private_subnet_ids
  db_instance_class       = var.db_instance_class
  db_allocated_storage    = var.db_allocated_storage
  db_name                 = var.db_name
  db_username             = var.db_username
  db_password             = var.db_password
  backup_retention_period = var.backup_retention_period
  multi_az                = var.multi_az
}

# ElastiCache Redis
module "redis" {
  source = "./modules/elasticache"
  
  environment        = var.environment
  vpc_id             = module.vpc.vpc_id
  private_subnet_ids = module.vpc.private_subnet_ids
  node_type          = var.redis_node_type
  num_cache_nodes    = var.redis_num_nodes
}

# ECS Cluster for AI Service
module "ecs" {
  source = "./modules/ecs"
  
  environment        = var.environment
  vpc_id             = module.vpc.vpc_id
  public_subnet_ids  = module.vpc.public_subnet_ids
  private_subnet_ids = module.vpc.private_subnet_ids
  
  # AI Service Configuration
  service_name       = "solosuccess-ai-service"
  container_image    = var.ai_service_image
  container_port     = 8000
  desired_count      = var.ai_service_desired_count
  cpu                = var.ai_service_cpu
  memory             = var.ai_service_memory
  
  # Environment variables
  environment_variables = {
    DATABASE_URL = module.database.connection_string
    REDIS_URL    = module.redis.connection_string
    ENVIRONMENT  = var.environment
  }
  
  # Secrets from AWS Secrets Manager
  secrets = {
    OPENAI_API_KEY     = aws_secretsmanager_secret.openai_api_key.arn
    ANTHROPIC_API_KEY  = aws_secretsmanager_secret.anthropic_api_key.arn
  }
}

# S3 Bucket for File Storage
module "s3" {
  source = "./modules/s3"
  
  environment = var.environment
  bucket_name = "solosuccess-${var.environment}-storage"
}

# CloudFront CDN
module "cloudfront" {
  source = "./modules/cloudfront"
  
  environment     = var.environment
  s3_bucket_id    = module.s3.bucket_id
  s3_bucket_arn   = module.s3.bucket_arn
  domain_name     = var.domain_name
  certificate_arn = var.acm_certificate_arn
}

# Application Load Balancer
module "alb" {
  source = "./modules/alb"
  
  environment       = var.environment
  vpc_id            = module.vpc.vpc_id
  public_subnet_ids = module.vpc.public_subnet_ids
  certificate_arn   = var.acm_certificate_arn
}

# Secrets Manager
resource "aws_secretsmanager_secret" "openai_api_key" {
  name        = "${var.environment}/solosuccess/openai-api-key"
  description = "OpenAI API key for AI service"
}

resource "aws_secretsmanager_secret" "anthropic_api_key" {
  name        = "${var.environment}/solosuccess/anthropic-api-key"
  description = "Anthropic API key for AI service"
}

resource "aws_secretsmanager_secret" "database_password" {
  name        = "${var.environment}/solosuccess/database-password"
  description = "Database master password"
}

# CloudWatch Log Groups
resource "aws_cloudwatch_log_group" "ai_service" {
  name              = "/ecs/${var.environment}/solosuccess-ai-service"
  retention_in_days = 30
}

# Outputs
output "vpc_id" {
  value = module.vpc.vpc_id
}

output "database_endpoint" {
  value     = module.database.endpoint
  sensitive = true
}

output "redis_endpoint" {
  value     = module.redis.endpoint
  sensitive = true
}

output "alb_dns_name" {
  value = module.alb.dns_name
}

output "cloudfront_domain" {
  value = module.cloudfront.domain_name
}

output "s3_bucket_name" {
  value = module.s3.bucket_name
}
