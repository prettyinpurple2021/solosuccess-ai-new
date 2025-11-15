/**
 * K6 Load Testing Script
 * Run with: k6 run tests/performance/load-test.js
 * 
 * This script tests the API endpoints under various load conditions
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');

// Test configuration
export const options = {
  stages: [
    { duration: '30s', target: 10 },  // Ramp up to 10 users
    { duration: '1m', target: 50 },   // Ramp up to 50 users
    { duration: '2m', target: 50 },   // Stay at 50 users
    { duration: '30s', target: 100 }, // Spike to 100 users
    { duration: '1m', target: 100 },  // Stay at 100 users
    { duration: '30s', target: 0 },   // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
    http_req_failed: ['rate<0.01'],   // Error rate should be less than 1%
    errors: ['rate<0.1'],             // Custom error rate should be less than 10%
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  // Test 1: Home page load
  let response = http.get(`${BASE_URL}/`);
  check(response, {
    'home page status is 200': (r) => r.status === 200,
    'home page loads in < 3s': (r) => r.timings.duration < 3000,
  }) || errorRate.add(1);

  sleep(1);

  // Test 2: Dashboard API endpoint
  response = http.get(`${BASE_URL}/api/dashboard/metrics`, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  check(response, {
    'dashboard API responds': (r) => r.status === 200 || r.status === 401,
    'dashboard API responds in < 200ms': (r) => r.timings.duration < 200,
  }) || errorRate.add(1);

  sleep(1);

  // Test 3: Static assets
  response = http.get(`${BASE_URL}/_next/static/css/app/layout.css`);
  check(response, {
    'static assets load': (r) => r.status === 200 || r.status === 404,
  });

  sleep(2);
}

export function handleSummary(data) {
  return {
    'performance-summary.json': JSON.stringify(data),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}

function textSummary(data, options) {
  const indent = options.indent || '';
  const enableColors = options.enableColors || false;
  
  let summary = `\n${indent}Performance Test Summary\n`;
  summary += `${indent}========================\n\n`;
  
  // HTTP metrics
  if (data.metrics.http_req_duration) {
    summary += `${indent}HTTP Request Duration:\n`;
    summary += `${indent}  avg: ${data.metrics.http_req_duration.values.avg.toFixed(2)}ms\n`;
    summary += `${indent}  min: ${data.metrics.http_req_duration.values.min.toFixed(2)}ms\n`;
    summary += `${indent}  max: ${data.metrics.http_req_duration.values.max.toFixed(2)}ms\n`;
    summary += `${indent}  p(95): ${data.metrics.http_req_duration.values['p(95)'].toFixed(2)}ms\n\n`;
  }
  
  // Request rate
  if (data.metrics.http_reqs) {
    summary += `${indent}HTTP Requests:\n`;
    summary += `${indent}  total: ${data.metrics.http_reqs.values.count}\n`;
    summary += `${indent}  rate: ${data.metrics.http_reqs.values.rate.toFixed(2)}/s\n\n`;
  }
  
  // Error rate
  if (data.metrics.http_req_failed) {
    summary += `${indent}Failed Requests:\n`;
    summary += `${indent}  rate: ${(data.metrics.http_req_failed.values.rate * 100).toFixed(2)}%\n\n`;
  }
  
  return summary;
}
