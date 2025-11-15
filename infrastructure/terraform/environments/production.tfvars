# Production Environment Configuration

environment = "production"
aws_region  = "us-east-1"

# Domain Configuration
domain_name         = "solosuccess.ai"
acm_certificate_arn = "arn:aws:acm:us-east-1:ACCOUNT_ID:certificate/CERTIFICATE_ID"

# VPC Configuration
vpc_cidr             = "10.0.0.0/16"
availability_zones   = ["us-east-1a", "us-east-1b", "us-east-1c"]
public_subnet_cidrs  = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
private_subnet_cidrs = ["10.0.11.0/24", "10.0.12.0/24", "10.0.13.0/24"]

# Database Configuration
db_instance_class       = "db.t3.large"
db_allocated_storage    = 200
db_name                 = "solosuccess_prod"
db_username             = "solosuccess_admin"
backup_retention_period = 30
multi_az                = true

# Redis Configuration
redis_node_type  = "cache.t3.medium"
redis_num_nodes  = 3

# ECS Configuration
ai_service_image         = "ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/solosuccess-ai-service:latest"
ai_service_desired_count = 3
ai_service_cpu           = 2048
ai_service_memory        = 4096
