# SoloSuccess AI - API Documentation

## Overview

The SoloSuccess AI API provides programmatic access to all platform features including AI agent interactions, Mission Control sessions, competitive intelligence, and business analytics.

## Base URL

```
Production: https://api.solosuccess.ai/v1
Staging: https://staging-api.solosuccess.ai/v1
Development: http://localhost:3000/api
```

## Authentication

All API requests require authentication using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

### Obtaining a Token

**Endpoint:** `POST /auth/login`

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "usr_123abc",
      "email": "user@example.com",
      "subscriptionTier": "premium"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 86400
  },
  "meta": {
    "timestamp": "2025-11-15T10:30:00Z",
    "requestId": "req_abc123"
  }
}
```

### Token Refresh

**Endpoint:** `POST /auth/refresh`

**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## Rate Limiting

API requests are rate-limited based on subscription tier:

- **Free Tier:** 100 requests per 15 minutes
- **Accelerator Tier:** 500 requests per 15 minutes
- **Premium Tier:** 2000 requests per 15 minutes

Rate limit headers are included in all responses:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1700000000
```

## Response Format

All API responses follow a consistent format:

### Success Response

```json
{
  "success": true,
  "data": { /* response data */ },
  "meta": {
    "timestamp": "2025-11-15T10:30:00Z",
    "requestId": "req_abc123"
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "INVALID_INPUT",
    "message": "Email is required",
    "details": {
      "field": "email",
      "validation": "required"
    }
  },
  "meta": {
    "timestamp": "2025-11-15T10:30:00Z",
    "requestId": "req_abc123"
  }
}
```

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `INVALID_CREDENTIALS` | 401 | Invalid email or password |
| `TOKEN_EXPIRED` | 401 | JWT token has expired |
| `UNAUTHORIZED` | 403 | Insufficient permissions |
| `INVALID_INPUT` | 400 | Request validation failed |
| `RESOURCE_NOT_FOUND` | 404 | Requested resource not found |
| `AI_SERVICE_UNAVAILABLE` | 503 | AI service temporarily unavailable |
| `AI_RATE_LIMIT_EXCEEDED` | 429 | AI usage limit exceeded |
| `SUBSCRIPTION_REQUIRED` | 402 | Feature requires paid subscription |
| `PAYMENT_FAILED` | 402 | Payment processing failed |
| `INTERNAL_SERVER_ERROR` | 500 | Unexpected server error |

## API Endpoints

### Authentication
- [POST /auth/register](./endpoints/auth.md#register) - Create new account
- [POST /auth/login](./endpoints/auth.md#login) - Authenticate user
- [POST /auth/logout](./endpoints/auth.md#logout) - End session
- [POST /auth/refresh](./endpoints/auth.md#refresh) - Refresh token
- [POST /auth/forgot-password](./endpoints/auth.md#forgot-password) - Request password reset
- [POST /auth/reset-password](./endpoints/auth.md#reset-password) - Reset password
- [POST /auth/mfa/setup](./endpoints/auth.md#mfa-setup) - Setup MFA
- [POST /auth/mfa/verify](./endpoints/auth.md#mfa-verify) - Verify MFA code

### User Profile
- [GET /users/me](./endpoints/users.md#get-profile) - Get current user profile
- [PATCH /users/me](./endpoints/users.md#update-profile) - Update profile
- [POST /users/me/avatar](./endpoints/users.md#upload-avatar) - Upload avatar
- [DELETE /users/me](./endpoints/users.md#delete-account) - Delete account

### AI Agents
- [GET /agents](./endpoints/agents.md#list-agents) - List available agents
- [GET /agents/:agentId](./endpoints/agents.md#get-agent) - Get agent details
- [POST /agents/:agentId/chat](./endpoints/agents.md#send-message) - Send message to agent
- [GET /agents/:agentId/conversations](./endpoints/agents.md#list-conversations) - List conversations
- [GET /conversations/:conversationId](./endpoints/agents.md#get-conversation) - Get conversation history

### Mission Control
- [POST /mission-control](./endpoints/mission-control.md#create-session) - Create session
- [GET /mission-control/:sessionId](./endpoints/mission-control.md#get-session) - Get session status
- [GET /mission-control](./endpoints/mission-control.md#list-sessions) - List sessions
- [POST /mission-control/:sessionId/export](./endpoints/mission-control.md#export-session) - Export results

### Competitor Intelligence
- [POST /competitors](./endpoints/competitors.md#create-competitor) - Add competitor
- [GET /competitors](./endpoints/competitors.md#list-competitors) - List competitors
- [GET /competitors/:competitorId](./endpoints/competitors.md#get-competitor) - Get competitor details
- [PATCH /competitors/:competitorId](./endpoints/competitors.md#update-competitor) - Update competitor
- [DELETE /competitors/:competitorId](./endpoints/competitors.md#delete-competitor) - Remove competitor
- [GET /competitors/:competitorId/activities](./endpoints/competitors.md#get-activities) - Get activities
- [GET /competitors/briefing](./endpoints/competitors.md#get-briefing) - Get daily briefing

### Content Generation
- [POST /content/generate](./endpoints/content.md#generate-content) - Generate content
- [GET /content](./endpoints/content.md#list-content) - List generated content
- [GET /content/:contentId](./endpoints/content.md#get-content) - Get content details
- [PATCH /content/:contentId](./endpoints/content.md#update-content) - Update content
- [DELETE /content/:contentId](./endpoints/content.md#delete-content) - Delete content

### Documents
- [POST /documents/generate](./endpoints/documents.md#generate-document) - Generate document
- [GET /documents](./endpoints/documents.md#list-documents) - List documents
- [GET /documents/:documentId](./endpoints/documents.md#get-document) - Get document
- [POST /documents/:documentId/export](./endpoints/documents.md#export-document) - Export document

### Analytics
- [GET /analytics/overview](./endpoints/analytics.md#get-overview) - Get metrics overview
- [GET /analytics/insights](./endpoints/analytics.md#get-insights) - Get AI insights
- [POST /analytics/integrations](./endpoints/analytics.md#add-integration) - Add integration
- [GET /analytics/integrations](./endpoints/analytics.md#list-integrations) - List integrations

### Subscriptions
- [GET /subscriptions/plans](./endpoints/subscriptions.md#list-plans) - List subscription plans
- [POST /subscriptions](./endpoints/subscriptions.md#create-subscription) - Create subscription
- [GET /subscriptions/current](./endpoints/subscriptions.md#get-current) - Get current subscription
- [PATCH /subscriptions/current](./endpoints/subscriptions.md#update-subscription) - Update subscription
- [DELETE /subscriptions/current](./endpoints/subscriptions.md#cancel-subscription) - Cancel subscription
- [GET /subscriptions/invoices](./endpoints/subscriptions.md#list-invoices) - List invoices

### Notifications
- [GET /notifications](./endpoints/notifications.md#list-notifications) - List notifications
- [PATCH /notifications/:notificationId](./endpoints/notifications.md#mark-read) - Mark as read
- [PATCH /notifications/read-all](./endpoints/notifications.md#mark-all-read) - Mark all as read
- [GET /notifications/preferences](./endpoints/notifications.md#get-preferences) - Get preferences
- [PATCH /notifications/preferences](./endpoints/notifications.md#update-preferences) - Update preferences

## Webhooks

SoloSuccess AI can send webhooks to notify your application of events:

- `mission_control.completed` - Mission Control session completed
- `competitor.activity_detected` - New competitor activity detected
- `subscription.updated` - Subscription status changed
- `subscription.payment_failed` - Payment failed
- `content.generated` - Content generation completed

[Learn more about webhooks](./webhooks.md)

## SDKs and Libraries

Official SDKs are available for popular languages:

- [JavaScript/TypeScript SDK](https://github.com/solosuccess-ai/sdk-js)
- [Python SDK](https://github.com/solosuccess-ai/sdk-python)
- [Go SDK](https://github.com/solosuccess-ai/sdk-go)

## Interactive API Explorer

Try out the API in our interactive explorer:

[https://api.solosuccess.ai/explorer](https://api.solosuccess.ai/explorer)

## Support

- **Documentation:** https://docs.solosuccess.ai
- **API Status:** https://status.solosuccess.ai
- **Support Email:** api-support@solosuccess.ai
- **Community:** https://community.solosuccess.ai

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for API version history and breaking changes.
