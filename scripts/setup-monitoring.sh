#!/bin/bash

# Intel Academy Integration - Monitoring Setup Script
# This script configures monitoring and alerting for the Intel Academy integration

set -e

echo "🔍 Intel Academy Integration - Monitoring Setup"
echo "================================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if required environment variables are set
check_env_var() {
  if [ -z "${!1}" ]; then
    echo -e "${RED}✗${NC} $1 is not set"
    return 1
  else
    echo -e "${GREEN}✓${NC} $1 is set"
    return 0
  fi
}

echo "Step 1: Checking Environment Variables"
echo "---------------------------------------"

ENV_CHECK=0

check_env_var "NEXT_PUBLIC_SENTRY_DSN" || ENV_CHECK=1
check_env_var "SENTRY_AUTH_TOKEN" || ENV_CHECK=1
check_env_var "SENTRY_ORG" || ENV_CHECK=1
check_env_var "SENTRY_PROJECT" || ENV_CHECK=1

echo ""

if [ $ENV_CHECK -eq 1 ]; then
  echo -e "${RED}Error: Missing required environment variables${NC}"
  echo "Please set the following in your .env file:"
  echo "  NEXT_PUBLIC_SENTRY_DSN=https://[key]@[org].ingest.sentry.io/[project]"
  echo "  SENTRY_AUTH_TOKEN=[your_auth_token]"
  echo "  SENTRY_ORG=[your_org_name]"
  echo "  SENTRY_PROJECT=[your_project_name]"
  exit 1
fi

echo "Step 2: Installing Sentry CLI"
echo "------------------------------"

if command -v sentry-cli &> /dev/null; then
  echo -e "${GREEN}✓${NC} Sentry CLI is already installed"
else
  echo "Installing Sentry CLI..."
  npm install -g @sentry/cli
  echo -e "${GREEN}✓${NC} Sentry CLI installed"
fi

echo ""

echo "Step 3: Verifying Sentry Configuration"
echo "---------------------------------------"

if sentry-cli info &> /dev/null; then
  echo -e "${GREEN}✓${NC} Sentry CLI configured correctly"
else
  echo -e "${RED}✗${NC} Sentry CLI configuration failed"
  echo "Please check your SENTRY_AUTH_TOKEN"
  exit 1
fi

echo ""

echo "Step 4: Creating Sentry Alert Rules"
echo "------------------------------------"

# Note: Alert rules are typically created via Sentry UI or API
# This is a placeholder for documentation

echo "Alert rules should be created in Sentry dashboard:"
echo "  1. High API Error Rate"
echo "  2. Webhook Processing Delay"
echo "  3. Security: Multiple Signature Failures"
echo "  4. High Connection Failure Rate"
echo "  5. High Sync Failure Rate"
echo "  6. Token Refresh Failures"
echo ""
echo "See docs/monitoring/intel-academy-alerts.md for detailed configuration"

echo ""

echo "Step 5: Setting up Notification Channels"
echo "-----------------------------------------"

echo "Configure the following notification channels in Sentry:"
echo "  • Slack: #intel-academy-alerts"
echo "  • Slack: #intel-academy-monitoring"
echo "  • Email: engineering@solosuccess.ai"
echo "  • PagerDuty: intel-academy-oncall"

echo ""

echo "Step 6: Creating Monitoring Dashboard"
echo "--------------------------------------"

echo "Dashboard should be created in Sentry with the following widgets:"
echo "  • Active Integrations"
echo "  • Connection Success Rate"
echo "  • Sync Success Rate"
echo "  • Webhook Processing Success Rate"
echo "  • API Response Time"
echo "  • Error Rate by Type"
echo "  • Security Events"
echo ""
echo "See docs/monitoring/intel-academy-alerts.md for complete dashboard configuration"

echo ""

echo "Step 7: Testing Monitoring Setup"
echo "---------------------------------"

echo "Testing error capture..."
node -e "
const Sentry = require('@sentry/nextjs');
Sentry.init({ dsn: process.env.NEXT_PUBLIC_SENTRY_DSN });
Sentry.captureMessage('[Test] Intel Academy monitoring setup', 'info');
console.log('Test message sent to Sentry');
" || echo -e "${YELLOW}⚠${NC} Could not send test message (this is okay if Sentry is not fully configured)"

echo ""

echo "Step 8: Verifying Metrics Endpoint"
echo "-----------------------------------"

if [ -f "app/api/intel-academy/metrics/route.ts" ]; then
  echo -e "${GREEN}✓${NC} Metrics endpoint exists"
else
  echo -e "${RED}✗${NC} Metrics endpoint not found"
  exit 1
fi

echo ""

echo "Step 9: Checking Monitoring Library"
echo "------------------------------------"

if [ -f "lib/monitoring/intel-academy-monitoring.ts" ]; then
  echo -e "${GREEN}✓${NC} Intel Academy monitoring library exists"
else
  echo -e "${RED}✗${NC} Intel Academy monitoring library not found"
  exit 1
fi

echo ""

echo "Step 10: Final Checklist"
echo "------------------------"

echo "Manual steps to complete:"
echo "  [ ] Create Sentry project for Intel Academy integration"
echo "  [ ] Configure alert rules in Sentry dashboard"
echo "  [ ] Set up Slack integration"
echo "  [ ] Set up PagerDuty integration"
echo "  [ ] Create monitoring dashboard in Sentry"
echo "  [ ] Test alert notifications"
echo "  [ ] Document on-call procedures"
echo "  [ ] Train team on monitoring tools"

echo ""
echo -e "${GREEN}✓ Monitoring setup script completed${NC}"
echo ""
echo "Next steps:"
echo "  1. Review docs/monitoring/intel-academy-alerts.md"
echo "  2. Complete manual configuration steps in Sentry"
echo "  3. Test monitoring by triggering sample events"
echo "  4. Verify alerts are received in configured channels"
echo ""
echo "For support, contact: engineering@solosuccess.ai"
