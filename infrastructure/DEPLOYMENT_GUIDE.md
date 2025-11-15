# SoloSuccess AI - Production Deployment Guide

This guide provides step-by-step instructions for deploying the SoloSuccess AI platform to production.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [AWS Infrastructure Setup](#aws-infrastructure-setup)
3. [Vercel Frontend Deployment](#vercel-frontend-deployment)
4. [Database Configuration](#database-configuration)
5. [Environment Variables](#environment-variables)
6. [Deployment Process](#deployment-process)
7. [Post-Deployment Verification](#post-deployment-verification)
8. [Rollback Procedures](#rollback-procedures)

## Prerequisites

### Required Tools

- AWS CLI v2 or later
- Terraform v1.0 or later
- Node.js 20.x or later
- Docker
- Vercel CLI
- Git

### AWS Account Setup

1. Create an AWS account if you don't have one
2. Configure AWS CLI with appropriate credentials:
   ```bash
   aws configure
   ```
3. Ensure you have the following IAM permissions:
   - EC2, ECS, ECR
   - RDS, ElastiCache
   - S3, CloudFront
   - VPC, Route53
   - Secrets Manager
   - CloudWatch

### Domain Configuration

1. Register a domain (e.g., solosuccess.ai)
2. Configure DNS in Route53 or your DNS provider
3. Request SSL certificate in AWS Certificate Manager (ACM)

## AWS Infrastructure Setup

### Step 1: Initialize Terraform

```bash
cd infrastructure/terraform

# Initialize Terraform
terraform init

# Create S3 bucket for state (first time only)
aws s3 mb s3://solosuccess-terraform-state --region us-east-1
aws s3api put-bucket-versioning \
  --bucket solosuccess-terraform-state \
  --versioning-configuration Status=Enabled

# Create DynamoDB table for state locking (first time only)
aws dynamodb create-table \
  --table-name terraform-state-lock \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1
```

### Step 2: Configure Production Variables

Edit `environments/production.tfvars` with your specific values:

```hcl
# Update these values
domain_name         = "solosuccess.ai"
acm_certificate_arn = "arn:aws:acm:us-east-1:YOUR_ACCOUNT:certificate/YOUR_CERT_ID"
ai_service_image    = "YOUR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/solosuccess-ai-service:latest"
```

### Step 3: Create Secrets

```bash
# Database password
aws secretsmanager create-secret \
  --name production/solosuccess/database-password \
  --secret-string "YOUR_SECURE_PASSWORD" \
  --region us-east-1

# OpenAI API Key
aws secretsmanager create-secret \
  --name production/solosuccess/openai-api-key \
  --secret-string "YOUR_OPENAI_KEY" \
  --region us-east-1

# Anthropic API Key
aws secretsmanager create-secret \
  --name production/solosuccess/anthropic-api-key \
  --secret-string "YOUR_ANTHROPIC_KEY" \
  --region us-east-1

# NextAuth Secret
aws secretsmanager create-secret \
  --name production/solosuccess/nextauth-secret \
  --secret-string "$(openssl rand -base64 32)" \
  --region us-east-1

# Stripe API Keys
aws secretsmanager create-secret \
  --name production/solosuccess/stripe-secret-key \
  --secret-string "YOUR_STRIPE_SECRET_KEY" \
  --region us-east-1

aws secretsmanager create-secret \
  --name production/solosuccess/stripe-webhook-secret \
  --secret-string "YOUR_STRIPE_WEBHOOK_SECRET" \
  --region us-east-1
```

### Step 4: Deploy Infrastructure

```bash
# Plan the deployment
terraform plan -var-file=environments/production.tfvars

# Apply the configuration
terraform apply -var-file=environments/production.tfvars

# Save outputs
terraform output > ../outputs.txt
```

### Step 5: Create ECR Repository and Push AI Service Image

```bash
# Create ECR repository
aws ecr create-repository \
  --repository-name solosuccess-ai-service \
  --region us-east-1

# Login to ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin YOUR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com

# Build and push AI service image
cd ../../ai-service
docker build -t solosuccess-ai-service:latest .
docker tag solosuccess-ai-service:latest \
  YOUR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/solosuccess-ai-service:latest
docker push YOUR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/solosuccess-ai-service:latest
```

## Vercel Frontend Deployment

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Link Project

```bash
cd solosuccess-ai
vercel link
```

### Step 3: Configure Environment Variables in Vercel

Go to Vercel Dashboard → Project Settings → Environment Variables and add:

```
# Database
DATABASE_URL=postgresql://user:password@your-rds-endpoint:5432/solosuccess_prod

# Redis
REDIS_URL=redis://your-elasticache-endpoint:6379

# NextAuth
NEXTAUTH_URL=https://solosuccess.ai
NEXTAUTH_SECRET=your-nextauth-secret

# OAuth Providers
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
LINKEDIN_CLIENT_ID=your-linkedin-client-id
LINKEDIN_CLIENT_SECRET=your-linkedin-client-secret

# Stripe
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret

# AI Services
OPENAI_API_KEY=your-openai-key
ANTHROPIC_API_KEY=your-anthropic-key

# Backend API
NEXT_PUBLIC_API_URL=https://api.solosuccess.ai

# Email
SENDGRID_API_KEY=your-sendgrid-key
EMAIL_FROM=noreply@solosuccess.ai

# AWS
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=solosuccess-production-storage

# Monitoring
SENTRY_DSN=your-sentry-dsn
DATADOG_API_KEY=your-datadog-key
```

### Step 4: Deploy to Vercel

```bash
# Deploy to production
vercel --prod
```

## Database Configuration

### Step 1: Run Migrations

```bash
cd solosuccess-ai

# Set DATABASE_URL environment variable
export DATABASE_URL="postgresql://user:password@your-rds-endpoint:5432/solosuccess_prod"

# Run migrations
npx prisma migrate deploy

# Verify schema
npx prisma db pull
```

### Step 2: Seed Initial Data (Optional)

```bash
# Seed database with initial data
npm run prisma:seed
```

### Step 3: Configure Backups

Backups are automatically configured via Terraform with:
- Automated daily backups
- 30-day retention period
- Point-in-time recovery enabled

To create a manual backup:

```bash
aws rds create-db-snapshot \
  --db-instance-identifier production-solosuccess-db \
  --db-snapshot-identifier manual-backup-$(date +%Y%m%d-%H%M%S) \
  --region us-east-1
```

## Environment Variables

### Production Environment Variables

Create a `.env.production` file (DO NOT commit to git):

```bash
# Database
DATABASE_URL=postgresql://user:password@your-rds-endpoint:5432/solosuccess_prod

# Redis
REDIS_URL=redis://your-elasticache-endpoint:6379

# NextAuth
NEXTAUTH_URL=https://solosuccess.ai
NEXTAUTH_SECRET=your-nextauth-secret

# OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
LINKEDIN_CLIENT_ID=your-linkedin-client-id
LINKEDIN_CLIENT_SECRET=your-linkedin-client-secret

# Stripe
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret

# AI Services
OPENAI_API_KEY=your-openai-key
ANTHROPIC_API_KEY=your-anthropic-key

# Email
SENDGRID_API_KEY=your-sendgrid-key
EMAIL_FROM=noreply@solosuccess.ai

# AWS
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=solosuccess-production-storage

# Monitoring
SENTRY_DSN=your-sentry-dsn
DATADOG_API_KEY=your-datadog-key
NODE_ENV=production
```

## Deployment Process

### Automated Deployment (Recommended)

Deployments are automated via GitHub Actions:

1. Push to `main` branch triggers production deployment
2. CI/CD pipeline runs tests
3. Frontend deploys to Vercel
4. Backend deploys to AWS ECS
5. Database migrations run automatically
6. Smoke tests verify deployment

### Manual Deployment

If you need to deploy manually:

```bash
# Frontend
cd solosuccess-ai
vercel --prod

# Backend
cd ai-service
docker build -t solosuccess-ai-service:latest .
docker tag solosuccess-ai-service:latest YOUR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/solosuccess-ai-service:latest
docker push YOUR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/solosuccess-ai-service:latest

# Update ECS service
aws ecs update-service \
  --cluster solosuccess-production \
  --service solosuccess-ai-service \
  --force-new-deployment \
  --region us-east-1
```

## Post-Deployment Verification

### Health Checks

```bash
# Frontend health
curl https://solosuccess.ai

# Backend health
curl https://api.solosuccess.ai/health

# Database connectivity
psql $DATABASE_URL -c "SELECT 1"

# Redis connectivity
redis-cli -h your-elasticache-endpoint ping
```

### Smoke Tests

```bash
# Run automated smoke tests
cd solosuccess-ai
npm run test:e2e -- --grep @smoke
```

### Monitor Logs

```bash
# Frontend logs (Vercel)
vercel logs

# Backend logs (CloudWatch)
aws logs tail /ecs/production/solosuccess-ai-service --follow

# Database logs
aws rds describe-db-log-files \
  --db-instance-identifier production-solosuccess-db
```

## Rollback Procedures

### Frontend Rollback

```bash
# List deployments
vercel ls

# Rollback to previous deployment
vercel rollback [deployment-url]
```

### Backend Rollback

```bash
# Get previous task definition
aws ecs describe-services \
  --cluster solosuccess-production \
  --services solosuccess-ai-service \
  --query 'services[0].deployments[1].taskDefinition'

# Update service to previous task definition
aws ecs update-service \
  --cluster solosuccess-production \
  --service solosuccess-ai-service \
  --task-definition [previous-task-definition]
```

### Database Rollback

```bash
# Restore from snapshot
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier production-solosuccess-db-restored \
  --db-snapshot-identifier [snapshot-id]

# Update DATABASE_URL to point to restored instance
```

## Monitoring and Alerts

### CloudWatch Alarms

Key metrics to monitor:
- ECS CPU/Memory utilization
- RDS connections and CPU
- ElastiCache hit rate
- ALB response times
- Error rates

### Sentry Error Tracking

Configure Sentry for error tracking:
- Frontend errors
- Backend API errors
- AI service errors

### DataDog Metrics

Monitor application metrics:
- Request rates
- Response times
- Database query performance
- Cache hit rates

## Troubleshooting

### Common Issues

**Issue: Database connection timeout**
- Check security group rules
- Verify VPC configuration
- Check database status

**Issue: ECS tasks failing to start**
- Check CloudWatch logs
- Verify environment variables
- Check IAM permissions

**Issue: High latency**
- Check CloudFront cache hit rate
- Review database query performance
- Check ECS task CPU/memory

## Support

For deployment issues:
1. Check CloudWatch logs
2. Review this documentation
3. Contact DevOps team
4. Create incident ticket

## Security Checklist

- [ ] All secrets stored in AWS Secrets Manager
- [ ] Database encryption enabled
- [ ] SSL/TLS certificates configured
- [ ] Security groups properly configured
- [ ] IAM roles follow least privilege
- [ ] Backup and recovery tested
- [ ] Monitoring and alerts configured
- [ ] DDoS protection enabled (AWS Shield)
- [ ] WAF rules configured
- [ ] Audit logging enabled
