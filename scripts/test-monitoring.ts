/**
 * Intel Academy Integration - Monitoring Test Script
 * Tests monitoring setup and alert configuration
 */

import * as Sentry from '@sentry/nextjs';
import {
  trackIntegrationEvent,
  trackConnectionAttempt,
  trackTokenRefresh,
  trackSubscriptionSync,
  trackWebhookProcessing,
  trackSignatureVerificationFailure,
  trackApiCall,
  trackSsoRedirect,
  trackSecurityEvent,
  IntegrationEventType,
  sendAlert,
} from '../lib/monitoring/intel-academy-monitoring';

// Initialize Sentry for testing
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: 'test',
  tracesSampleRate: 1.0,
});

console.log('🧪 Intel Academy Integration - Monitoring Test');
console.log('==============================================\n');

async function runTests() {
  let testsPassed = 0;
  let testsFailed = 0;

  // Test 1: Track Connection Event
  console.log('Test 1: Track Connection Event');
  try {
    trackIntegrationEvent(
      IntegrationEventType.CONNECTION_SUCCESS,
      'test_user_123',
      { test: true }
    );
    console.log('✓ Connection event tracked\n');
    testsPassed++;
  } catch (error) {
    console.error('✗ Failed to track connection event:', error);
    testsFailed++;
  }

  // Test 2: Track Connection Attempt (Success)
  console.log('Test 2: Track Connection Attempt (Success)');
  try {
    trackConnectionAttempt('test_user_123', true);
    console.log('✓ Successful connection attempt tracked\n');
    testsPassed++;
  } catch (error) {
    console.error('✗ Failed to track connection attempt:', error);
    testsFailed++;
  }

  // Test 3: Track Connection Attempt (Failure)
  console.log('Test 3: Track Connection Attempt (Failure)');
  try {
    const testError = new Error('Test OAuth connection failure');
    trackConnectionAttempt('test_user_123', false, testError);
    console.log('✓ Failed connection attempt tracked\n');
    testsPassed++;
  } catch (error) {
    console.error('✗ Failed to track connection failure:', error);
    testsFailed++;
  }

  // Test 4: Track Token Refresh
  console.log('Test 4: Track Token Refresh');
  try {
    trackTokenRefresh('test_user_123', true);
    console.log('✓ Token refresh tracked\n');
    testsPassed++;
  } catch (error) {
    console.error('✗ Failed to track token refresh:', error);
    testsFailed++;
  }

  // Test 5: Track Subscription Sync
  console.log('Test 5: Track Subscription Sync');
  try {
    trackSubscriptionSync('test_user_123', 'premium', true, 1500);
    console.log('✓ Subscription sync tracked\n');
    testsPassed++;
  } catch (error) {
    console.error('✗ Failed to track subscription sync:', error);
    testsFailed++;
  }

  // Test 6: Track Webhook Processing
  console.log('Test 6: Track Webhook Processing');
  try {
    trackWebhookProcessing('course.completed', 'event_123', true, 250);
    console.log('✓ Webhook processing tracked\n');
    testsPassed++;
  } catch (error) {
    console.error('✗ Failed to track webhook processing:', error);
    testsFailed++;
  }

  // Test 7: Track Signature Verification Failure
  console.log('Test 7: Track Signature Verification Failure');
  try {
    trackSignatureVerificationFailure('192.168.1.1', 'course.enrolled');
    console.log('✓ Signature verification failure tracked\n');
    testsPassed++;
  } catch (error) {
    console.error('✗ Failed to track signature failure:', error);
    testsFailed++;
  }

  // Test 8: Track API Call
  console.log('Test 8: Track API Call');
  try {
    trackApiCall('/v1/courses', 'GET', 200, 450, 'test_user_123');
    console.log('✓ API call tracked\n');
    testsPassed++;
  } catch (error) {
    console.error('✗ Failed to track API call:', error);
    testsFailed++;
  }

  // Test 9: Track SSO Redirect
  console.log('Test 9: Track SSO Redirect');
  try {
    trackSsoRedirect('test_user_123', true);
    console.log('✓ SSO redirect tracked\n');
    testsPassed++;
  } catch (error) {
    console.error('✗ Failed to track SSO redirect:', error);
    testsFailed++;
  }

  // Test 10: Track Security Event
  console.log('Test 10: Track Security Event');
  try {
    trackSecurityEvent('suspicious', {
      sourceIp: '192.168.1.1',
      userId: 'test_user_123',
      reason: 'Multiple failed attempts',
    });
    console.log('✓ Security event tracked\n');
    testsPassed++;
  } catch (error) {
    console.error('✗ Failed to track security event:', error);
    testsFailed++;
  }

  // Test 11: Send Test Alert
  console.log('Test 11: Send Test Alert');
  try {
    sendAlert(
      'test_alert',
      'This is a test alert from monitoring setup',
      'low',
      { test: true }
    );
    console.log('✓ Test alert sent\n');
    testsPassed++;
  } catch (error) {
    console.error('✗ Failed to send test alert:', error);
    testsFailed++;
  }

  // Test 12: Capture Test Exception
  console.log('Test 12: Capture Test Exception');
  try {
    const testError = new Error('Test exception for monitoring');
    Sentry.captureException(testError, {
      tags: {
        integration: 'intel_academy',
        test: true,
      },
      extra: {
        test_data: 'This is a test exception',
      },
    });
    console.log('✓ Test exception captured\n');
    testsPassed++;
  } catch (error) {
    console.error('✗ Failed to capture test exception:', error);
    testsFailed++;
  }

  // Test 13: Capture Test Message
  console.log('Test 13: Capture Test Message');
  try {
    Sentry.captureMessage(
      '[Test] Intel Academy monitoring is working correctly',
      'info'
    );
    console.log('✓ Test message captured\n');
    testsPassed++;
  } catch (error) {
    console.error('✗ Failed to capture test message:', error);
    testsFailed++;
  }

  // Test 14: Add Test Breadcrumb
  console.log('Test 14: Add Test Breadcrumb');
  try {
    Sentry.addBreadcrumb({
      category: 'intel_academy',
      message: 'Test breadcrumb for monitoring',
      level: 'info',
      data: {
        test: true,
      },
    });
    console.log('✓ Test breadcrumb added\n');
    testsPassed++;
  } catch (error) {
    console.error('✗ Failed to add test breadcrumb:', error);
    testsFailed++;
  }

  // Test 15: Test Performance Transaction
  console.log('Test 15: Test Performance Transaction');
  try {
    const transaction = Sentry.startTransaction({
      name: 'intel_academy.test_operation',
      op: 'test',
    });
    
    // Simulate some work
    await new Promise(resolve => setTimeout(resolve, 100));
    
    transaction.setStatus('ok');
    transaction.finish();
    console.log('✓ Performance transaction completed\n');
    testsPassed++;
  } catch (error) {
    console.error('✗ Failed to complete performance transaction:', error);
    testsFailed++;
  }

  // Summary
  console.log('==============================================');
  console.log('Test Summary:');
  console.log(`  ✓ Passed: ${testsPassed}`);
  console.log(`  ✗ Failed: ${testsFailed}`);
  console.log(`  Total: ${testsPassed + testsFailed}`);
  console.log('==============================================\n');

  if (testsFailed === 0) {
    console.log('✅ All monitoring tests passed!');
    console.log('\nNext steps:');
    console.log('  1. Check Sentry dashboard for test events');
    console.log('  2. Verify alerts are configured correctly');
    console.log('  3. Test notification channels (Slack, email, PagerDuty)');
    console.log('  4. Review monitoring dashboard');
    return 0;
  } else {
    console.log('❌ Some monitoring tests failed');
    console.log('\nPlease review the errors above and:');
    console.log('  1. Verify Sentry DSN is configured correctly');
    console.log('  2. Check network connectivity');
    console.log('  3. Review Sentry configuration files');
    console.log('  4. Ensure monitoring library is imported correctly');
    return 1;
  }
}

// Run tests
runTests()
  .then((exitCode) => {
    // Flush Sentry events before exiting
    Sentry.close(2000).then(() => {
      process.exit(exitCode);
    });
  })
  .catch((error) => {
    console.error('Fatal error running tests:', error);
    process.exit(1);
  });
