# AI Agents Endpoints

## List Agents

Get all available AI agents.

**Endpoint:** `GET /agents`

**Authentication:** Required

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "agents": [
      {
        "id": "roxy",
        "name": "Roxy",
        "title": "Strategic Operator",
        "description": "Your executive assistant for strategic planning and operations",
        "personality": "Professional, strategic, detail-oriented",
        "capabilities": [
          "Strategic planning",
          "Schedule optimization",
          "Workflow management",
          "Executive assistance"
        ],
        "avatarUrl": "https://cdn.solosuccess.ai/agents/roxy.png",
        "available": true
      },
      {
        "id": "echo",
        "name": "Echo",
        "title": "Growth Catalyst",
        "description": "Market intelligence and growth strategy expert",
        "personality": "Analytical, insightful, opportunity-focused",
        "capabilities": [
          "Market analysis",
          "Growth strategies",
          "Opportunity identification",
          "Competitive insights"
        ],
        "avatarUrl": "https://cdn.solosuccess.ai/agents/echo.png",
        "available": true
      }
    ]
  }
}
```

---

## Get Agent Details

Get detailed information about a specific agent.

**Endpoint:** `GET /agents/:agentId`

**Authentication:** Required

**Path Parameters:**
- `agentId`: Agent identifier (e.g., `roxy`, `echo`, `blaze`)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "agent": {
      "id": "roxy",
      "name": "Roxy",
      "title": "Strategic Operator",
      "description": "Your executive assistant for strategic planning and operations",
      "personality": "Professional, strategic, detail-oriented",
      "capabilities": [
        "Strategic planning",
        "Schedule optimization",
        "Workflow management",
        "Executive assistance"
      ],
      "avatarUrl": "https://cdn.solosuccess.ai/agents/roxy.png",
      "available": true,
      "responseTime": "2-5 seconds",
      "specialties": [
        "Business strategy",
        "Operations management",
        "Time management",
        "Decision support"
      ]
    }
  }
}
```

**Error Responses:**
- `404 Not Found` - Agent not found

---

## Send Message to Agent

Send a message to an AI agent and receive a response.

**Endpoint:** `POST /agents/:agentId/chat`

**Authentication:** Required

**Path Parameters:**
- `agentId`: Agent identifier

**Request Body:**
```json
{
  "message": "Help me create a 90-day growth strategy for my SaaS product",
  "conversationId": "conv_abc123",
  "context": {
    "businessType": "SaaS",
    "industry": "Marketing Technology",
    "currentMRR": 5000
  }
}
```

**Parameters:**
- `message`: User's message to the agent (required)
- `conversationId`: Optional, to continue existing conversation
- `context`: Optional, additional context for the agent

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "message": {
      "id": "msg_xyz789",
      "conversationId": "conv_abc123",
      "agentId": "roxy",
      "role": "agent",
      "content": "I'd be happy to help you create a 90-day growth strategy...",
      "timestamp": "2025-11-15T10:30:00Z",
      "metadata": {
        "confidence": 0.95,
        "processingTime": 3.2,
        "sources": [
          "Growth strategy frameworks",
          "SaaS best practices"
        ],
        "suggestions": [
          "Focus on customer retention",
          "Implement referral program",
          "Optimize pricing strategy"
        ]
      }
    },
    "conversationId": "conv_abc123"
  }
}
```

**Error Responses:**
- `400 Bad Request` - Invalid message or parameters
- `402 Payment Required` - Feature requires paid subscription
- `429 Too Many Requests` - Rate limit exceeded
- `503 Service Unavailable` - AI service temporarily unavailable

---

## List Conversations

Get all conversations with a specific agent.

**Endpoint:** `GET /agents/:agentId/conversations`

**Authentication:** Required

**Path Parameters:**
- `agentId`: Agent identifier

**Query Parameters:**
- `limit`: Number of conversations to return (default: 20, max: 100)
- `offset`: Pagination offset (default: 0)
- `sortBy`: Sort field (`lastMessageAt`, `createdAt`) (default: `lastMessageAt`)
- `order`: Sort order (`asc`, `desc`) (default: `desc`)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "conversations": [
      {
        "id": "conv_abc123",
        "agentId": "roxy",
        "title": "90-day growth strategy",
        "messageCount": 12,
        "lastMessageAt": "2025-11-15T10:30:00Z",
        "createdAt": "2025-11-14T09:00:00Z",
        "preview": "Help me create a 90-day growth strategy..."
      }
    ],
    "pagination": {
      "total": 45,
      "limit": 20,
      "offset": 0,
      "hasMore": true
    }
  }
}
```

---

## Get Conversation History

Get full message history for a conversation.

**Endpoint:** `GET /conversations/:conversationId`

**Authentication:** Required

**Path Parameters:**
- `conversationId`: Conversation identifier

**Query Parameters:**
- `limit`: Number of messages to return (default: 50, max: 200)
- `before`: Get messages before this message ID (for pagination)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "conversation": {
      "id": "conv_abc123",
      "agentId": "roxy",
      "title": "90-day growth strategy",
      "createdAt": "2025-11-14T09:00:00Z",
      "updatedAt": "2025-11-15T10:30:00Z"
    },
    "messages": [
      {
        "id": "msg_001",
        "role": "user",
        "content": "Help me create a 90-day growth strategy",
        "timestamp": "2025-11-14T09:00:00Z"
      },
      {
        "id": "msg_002",
        "role": "agent",
        "content": "I'd be happy to help you create a comprehensive 90-day growth strategy...",
        "timestamp": "2025-11-14T09:00:05Z",
        "metadata": {
          "confidence": 0.95,
          "suggestions": ["Focus on retention", "Implement referrals"]
        }
      }
    ],
    "pagination": {
      "hasMore": false,
      "nextCursor": null
    }
  }
}
```

**Error Responses:**
- `404 Not Found` - Conversation not found
- `403 Forbidden` - Not authorized to access this conversation

---

## Delete Conversation

Delete a conversation and all its messages.

**Endpoint:** `DELETE /conversations/:conversationId`

**Authentication:** Required

**Path Parameters:**
- `conversationId`: Conversation identifier

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "message": "Conversation deleted successfully"
  }
}
```

**Error Responses:**
- `404 Not Found` - Conversation not found
- `403 Forbidden` - Not authorized to delete this conversation

---

## Update Conversation Title

Update the title of a conversation.

**Endpoint:** `PATCH /conversations/:conversationId`

**Authentication:** Required

**Path Parameters:**
- `conversationId`: Conversation identifier

**Request Body:**
```json
{
  "title": "Updated conversation title"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "conversation": {
      "id": "conv_abc123",
      "title": "Updated conversation title",
      "updatedAt": "2025-11-15T10:30:00Z"
    }
  }
}
```
