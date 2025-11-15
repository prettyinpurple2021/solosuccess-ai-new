# Staging Environment Configuration

environment = "staging"
aws_region  = "us-east-1"

# Domain Configuration
domain_name         = "staging.solosuccess.ai"
acm_certificate_arn = "arn:aws:acm:us-east-1:ACCOUNT_ID:certificate/CERTIFICATE_ID"

# VPC Configuration
vpc_cidr             = "10.1.0.0/16"
availability_zones   = ["us-east-1a", "us-east-1b"]
public_subnet_cidrs  = ["10.1.1.0/24", "10.1.2.0/24"]
private_subnet_cidrs = ["10.1.11.0/24", "10.1.12.0/24"]

# Database Configuration
db_instance_class       = "db.t3.medium"
db_allocated_storage    = 50
db_name                 = "solosuccess_staging"
db_username             = "solosuccess_admin"
backup_retention_period = 7
multi_az                = false

# Redis Configuration
redis_node_type  = "cache.t3.small"
redis_num_nodes  = 1

# ECS Configuration
ai_service_image         = "ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/solosuccess-ai-service-staging:latest"
ai_service_desired_count = 1
ai_service_cpu           = 1024
ai_service_memory        = 2048
