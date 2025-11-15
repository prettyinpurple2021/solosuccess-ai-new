# Mission Control Endpoints

## Create Mission Control Session

Initiate a new Mission Control session where multiple AI agents collaborate on a complex objective.

**Endpoint:** `POST /mission-control`

**Authentication:** Required

**Subscription:** Premium tier required

**Request Body:**
```json
{
  "objective": "Create a comprehensive go-to-market strategy for launching my new SaaS product in Q1 2026",
  "context": {
    "businessType": "B2B SaaS",
    "industry": "Marketing Technology",
    "targetMarket": "Small to medium businesses",
    "budget": "$50,000",
    "timeline": "90 days",
    "constraints": [
      "Limited marketing team",
      "No existing brand presence"
    ]
  },
  "priority": "high"
}
```

**Parameters:**
- `objective`: Clear description of the goal (required, 10-1000 characters)
- `context`: Additional business context (optional)
- `priority`: Session priority (`low`, `medium`, `high`) (default: `medium`)

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "session": {
      "id": "mc_abc123",
      "objective": "Create a comprehensive go-to-market strategy...",
      "status": "in_progress",
      "agentsInvolved": ["roxy", "echo", "blaze", "nova"],
      "progress": 0,
      "estimatedCompletion": "2025-11-15T11:00:00Z",
      "createdAt": "2025-11-15T10:30:00Z"
    }
  }
}
```

**Error Responses:**
- `400 Bad Request` - Invalid objective or parameters
- `402 Payment Required` - Premium subscription required
- `429 Too Many Requests` - Session limit exceeded

---

## Get Mission Control Session

Get the current status and results of a Mission Control session.

**Endpoint:** `GET /mission-control/:sessionId`

**Authentication:** Required

**Path Parameters:**
- `sessionId`: Session identifier

**Response:** `200 OK`

**In Progress:**
```json
{
  "success": true,
  "data": {
    "session": {
      "id": "mc_abc123",
      "objective": "Create a comprehensive go-to-market strategy...",
      "status": "in_progress",
      "agentsInvolved": ["roxy", "echo", "blaze", "nova"],
      "progress": 65,
      "currentPhase": "Strategy synthesis",
      "agentActivity": [
        {
          "agentId": "echo",
          "status": "working",
          "task": "Analyzing market opportunities"
        },
        {
          "agentId": "blaze",
          "status": "completed",
          "task": "Sales funnel blueprint"
        }
      ],
      "estimatedCompletion": "2025-11-15T11:00:00Z",
      "createdAt": "2025-11-15T10:30:00Z"
    }
  }
}
```

**Completed:**
```json
{
  "success": true,
  "data": {
    "session": {
      "id": "mc_abc123",
      "objective": "Create a comprehensive go-to-market strategy...",
      "status": "completed",
      "agentsInvolved": ["roxy", "echo", "blaze", "nova"],
      "progress": 100,
      "results": {
        "executiveSummary": "Your go-to-market strategy focuses on three key pillars...",
        "detailedPlan": {
          "phase1": {
            "title": "Foundation (Days 1-30)",
            "objectives": ["Build brand identity", "Create content library"],
            "deliverables": ["Brand guidelines", "10 blog posts", "Landing page"],
            "budget": "$15,000"
          },
          "phase2": {
            "title": "Launch (Days 31-60)",
            "objectives": ["Execute launch campaign", "Build initial customer base"],
            "deliverables": ["Launch event", "50 beta customers", "PR coverage"],
            "budget": "$20,000"
          },
          "phase3": {
            "title": "Growth (Days 61-90)",
            "objectives": ["Scale customer acquisition", "Optimize conversion"],
            "deliverables": ["200 paying customers", "Referral program"],
            "budget": "$15,000"
          }
        },
        "actionItems": [
          {
            "id": "action_001",
            "title": "Finalize brand identity and messaging",
            "description": "Work with designer to create brand guidelines",
            "priority": "high",
            "assignedTo": "Founder",
            "dueDate": "2025-11-22",
            "estimatedHours": 20
          },
          {
            "id": "action_002",
            "title": "Set up marketing automation",
            "description": "Configure email sequences and lead nurturing",
            "priority": "medium",
            "assignedTo": "Marketing",
            "dueDate": "2025-11-29",
            "estimatedHours": 15
          }
        ],
        "resources": [
          {
            "type": "tool",
            "name": "HubSpot",
            "purpose": "Marketing automation and CRM",
            "cost": "$800/month",
            "url": "https://hubspot.com"
          },
          {
            "type": "service",
            "name": "Content writer",
            "purpose": "Blog and landing page content",
            "cost": "$2,000",
            "url": null
          }
        ],
        "risks": [
          {
            "risk": "Limited budget may constrain paid advertising",
            "mitigation": "Focus on organic content and partnerships",
            "severity": "medium"
          }
        ],
        "successMetrics": [
          {
            "metric": "Beta signups",
            "target": "50 users by Day 60",
            "measurement": "Signup form submissions"
          },
          {
            "metric": "Paying customers",
            "target": "200 customers by Day 90",
            "measurement": "Stripe subscriptions"
          }
        ]
      },
      "completedAt": "2025-11-15T10:55:00Z",
      "createdAt": "2025-11-15T10:30:00Z"
    }
  }
}
```

**Error Responses:**
- `404 Not Found` - Session not found
- `403 Forbidden` - Not authorized to access this session

---

## List Mission Control Sessions

Get all Mission Control sessions for the current user.

**Endpoint:** `GET /mission-control`

**Authentication:** Required

**Query Parameters:**
- `status`: Filter by status (`in_progress`, `completed`, `failed`) (optional)
- `limit`: Number of sessions to return (default: 20, max: 100)
- `offset`: Pagination offset (default: 0)
- `sortBy`: Sort field (`createdAt`, `completedAt`) (default: `createdAt`)
- `order`: Sort order (`asc`, `desc`) (default: `desc`)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "sessions": [
      {
        "id": "mc_abc123",
        "objective": "Create a comprehensive go-to-market strategy...",
        "status": "completed",
        "agentsInvolved": ["roxy", "echo", "blaze", "nova"],
        "completedAt": "2025-11-15T10:55:00Z",
        "createdAt": "2025-11-15T10:30:00Z"
      },
      {
        "id": "mc_def456",
        "objective": "Develop a content marketing plan for Q1",
        "status": "in_progress",
        "agentsInvolved": ["echo", "nova"],
        "progress": 45,
        "createdAt": "2025-11-15T09:00:00Z"
      }
    ],
    "pagination": {
      "total": 12,
      "limit": 20,
      "offset": 0,
      "hasMore": false
    }
  }
}
```

---

## Export Mission Control Session

Export session results in various formats.

**Endpoint:** `POST /mission-control/:sessionId/export`

**Authentication:** Required

**Path Parameters:**
- `sessionId`: Session identifier

**Request Body:**
```json
{
  "format": "pdf",
  "sections": ["executiveSummary", "detailedPlan", "actionItems", "resources"],
  "includeCharts": true
}
```

**Parameters:**
- `format`: Export format (`pdf`, `docx`, `json`, `markdown`) (default: `pdf`)
- `sections`: Sections to include (optional, includes all by default)
- `includeCharts`: Include visual charts and diagrams (default: `true`)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "exportId": "exp_xyz789",
    "format": "pdf",
    "downloadUrl": "https://cdn.solosuccess.ai/exports/exp_xyz789.pdf",
    "expiresAt": "2025-11-22T10:30:00Z",
    "fileSize": 2457600
  }
}
```

**Error Responses:**
- `404 Not Found` - Session not found
- `400 Bad Request` - Session not completed yet

---

## Cancel Mission Control Session

Cancel an in-progress Mission Control session.

**Endpoint:** `DELETE /mission-control/:sessionId`

**Authentication:** Required

**Path Parameters:**
- `sessionId`: Session identifier

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "message": "Session cancelled successfully",
    "partialResults": {
      "completedAgents": ["roxy", "echo"],
      "availableInsights": "Partial market analysis available"
    }
  }
}
```

**Error Responses:**
- `404 Not Found` - Session not found
- `400 Bad Request` - Session already completed

---

## Share Mission Control Session

Generate a shareable link for a session.

**Endpoint:** `POST /mission-control/:sessionId/share`

**Authentication:** Required

**Path Parameters:**
- `sessionId`: Session identifier

**Request Body:**
```json
{
  "expiresIn": 604800,
  "password": "optional_password",
  "allowDownload": true
}
```

**Parameters:**
- `expiresIn`: Link expiration in seconds (default: 604800 = 7 days, max: 2592000 = 30 days)
- `password`: Optional password protection
- `allowDownload`: Allow downloading results (default: `true`)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "shareId": "share_abc123",
    "shareUrl": "https://solosuccess.ai/share/share_abc123",
    "expiresAt": "2025-11-22T10:30:00Z",
    "passwordProtected": true
  }
}
```
