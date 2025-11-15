# CI/CD Workflows

This directory contains GitHub Actions workflows for continuous integration and deployment of the SoloSuccess AI platform.

## Workflows

### CI Pipeline (`ci.yml`)
Runs on every push and pull request to `main` and `develop` branches.

**Jobs:**
- **Lint**: ESLint, Prettier, and TypeScript type checking
- **Test Frontend**: Unit tests with coverage reporting
- **Test Backend**: Integration tests with PostgreSQL and Redis
- **Test E2E**: End-to-end tests with Playwright
- **Security**: npm audit and Snyk security scanning
- **Build**: Verifies production build succeeds

**Required Secrets:**
- `SNYK_TOKEN` (optional): Snyk API token for security scanning

### Production Deployment (`cd-production.yml`)
Deploys to production on push to `main` branch or manual trigger.

**Jobs:**
- **Deploy Frontend**: Deploys Next.js app to Vercel
- **Deploy Backend**: Builds and deploys AI service to AWS ECS
- **Migrate Database**: Runs Prisma migrations on production database
- **Smoke Tests**: Validates deployment health
- **Rollback**: Automatically rolls back on failure

**Required Secrets:**
- `VERCEL_TOKEN`: Vercel deployment token
- `AWS_ACCESS_KEY_ID`: AWS access key
- `AWS_SECRET_ACCESS_KEY`: AWS secret key
- `DATABASE_URL`: Production database connection string
- `PRODUCTION_URL`: Production frontend URL
- `BACKEND_URL`: Production backend URL

### Staging Deployment (`cd-staging.yml`)
Deploys to staging on push to `develop` branch or manual trigger.

**Jobs:**
- **Deploy Frontend Staging**: Deploys to Vercel preview environment
- **Deploy Backend Staging**: Deploys to AWS ECS staging cluster
- **Migrate Database Staging**: Runs migrations on staging database
- **Smoke Tests Staging**: Validates staging deployment

**Required Secrets:**
- `VERCEL_TOKEN`: Vercel deployment token
- `AWS_ACCESS_KEY_ID`: AWS access key
- `AWS_SECRET_ACCESS_KEY`: AWS secret key
- `STAGING_DATABASE_URL`: Staging database connection string
- `STAGING_URL`: Staging frontend URL
- `STAGING_BACKEND_URL`: Staging backend URL

### Code Quality (`code-quality.yml`)
Runs on pull requests and pushes to enforce code quality standards.

**Jobs:**
- **Code Quality**: ESLint, Prettier, TypeScript checks
- **Complexity Analysis**: Analyzes code complexity
- **Security Scan**: npm audit for vulnerabilities
- **PR Size Check**: Warns about large PRs

### Dependency Updates (`dependency-update.yml`)
Runs weekly on Mondays to update dependencies.

**Jobs:**
- **Update Dependencies**: Updates patch and minor versions
- **Dependabot Auto-merge**: Auto-merges safe Dependabot PRs

## Setup Instructions

### 1. Configure GitHub Secrets

Navigate to your repository settings → Secrets and variables → Actions, and add:

#### Vercel Secrets
```bash
# Get your Vercel token from https://vercel.com/account/tokens
VERCEL_TOKEN=your_vercel_token
```

#### AWS Secrets
```bash
# Create an IAM user with ECS and ECR permissions
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
```

#### Database Secrets
```bash
# Production database
DATABASE_URL=postgresql://user:password@host:5432/database

# Staging database
STAGING_DATABASE_URL=postgresql://user:password@host:5432/staging_database
```

#### Application URLs
```bash
PRODUCTION_URL=https://solosuccess.ai
BACKEND_URL=https://api.solosuccess.ai
STAGING_URL=https://staging.solosuccess.ai
STAGING_BACKEND_URL=https://api-staging.solosuccess.ai
```

#### Optional Secrets
```bash
# For security scanning
SNYK_TOKEN=your_snyk_token
```

### 2. Configure Vercel

1. Install Vercel CLI: `npm install -g vercel`
2. Link your project: `vercel link`
3. Configure environment variables in Vercel dashboard
4. Set up production and preview environments

### 3. Configure AWS ECS

#### Create ECR Repositories
```bash
aws ecr create-repository --repository-name solosuccess-ai-service
aws ecr create-repository --repository-name solosuccess-ai-service-staging
```

#### Create ECS Clusters
```bash
aws ecs create-cluster --cluster-name solosuccess-production
aws ecs create-cluster --cluster-name solosuccess-staging
```

#### Create Task Definitions
Create task definitions for your AI service with appropriate CPU, memory, and environment variables.

#### Create Services
```bash
aws ecs create-service \
  --cluster solosuccess-production \
  --service-name solosuccess-ai-service \
  --task-definition solosuccess-ai-service:1 \
  --desired-count 2 \
  --launch-type FARGATE
```

### 4. Configure Database

Set up RDS PostgreSQL instances for production and staging:

```bash
# Production
aws rds create-db-instance \
  --db-instance-identifier solosuccess-prod \
  --db-instance-class db.t3.medium \
  --engine postgres \
  --master-username admin \
  --master-user-password <password> \
  --allocated-storage 100

# Staging
aws rds create-db-instance \
  --db-instance-identifier solosuccess-staging \
  --db-instance-class db.t3.small \
  --engine postgres \
  --master-username admin \
  --master-user-password <password> \
  --allocated-storage 50
```

### 5. Enable Workflows

Workflows are automatically enabled when you push them to your repository. You can also manually trigger workflows from the Actions tab.

## Running Workflows Locally

### Test CI Pipeline Locally
```bash
# Install act (GitHub Actions local runner)
# https://github.com/nektos/act

# Run the CI workflow
act -j lint
act -j test-frontend
act -j test-backend
```

### Test Build Locally
```bash
cd solosuccess-ai
npm run ci:build
```

### Test All Checks
```bash
cd solosuccess-ai
npm run ci:lint
npm run ci:test
npm run ci:build
```

## Monitoring and Debugging

### View Workflow Runs
- Go to the Actions tab in your GitHub repository
- Click on a workflow to see its runs
- Click on a run to see job details and logs

### Debug Failed Workflows
1. Check the job logs for error messages
2. Review the step that failed
3. Run the same commands locally to reproduce
4. Fix the issue and push again

### Workflow Notifications
Configure notifications in GitHub settings:
- Settings → Notifications → Actions
- Enable email or Slack notifications for workflow failures

## Best Practices

1. **Always run tests locally** before pushing
2. **Keep workflows fast** - optimize test execution
3. **Use caching** for dependencies to speed up builds
4. **Monitor workflow costs** - GitHub Actions has usage limits
5. **Review security alerts** from dependency scans
6. **Keep secrets secure** - never commit secrets to code
7. **Use environment protection rules** for production deployments
8. **Enable branch protection** to require CI checks before merging

## Troubleshooting

### Common Issues

**Issue: Workflow fails with "Resource not accessible by integration"**
- Solution: Check repository permissions and GitHub token scopes

**Issue: Vercel deployment fails**
- Solution: Verify VERCEL_TOKEN is valid and has correct permissions

**Issue: AWS deployment fails**
- Solution: Check IAM permissions and AWS credentials

**Issue: Database migration fails**
- Solution: Verify DATABASE_URL is correct and database is accessible

**Issue: Tests fail in CI but pass locally**
- Solution: Check environment variables and service dependencies

## Support

For issues with CI/CD workflows:
1. Check workflow logs in GitHub Actions
2. Review this documentation
3. Contact the DevOps team
4. Create an issue in the repository
