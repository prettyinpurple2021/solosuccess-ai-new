# AI Agent Usage Guide

## Quick Start

### Starting the Service

```bash
cd solosuccess-ai/ai-service
python -m uvicorn app.main:app --reload
```

The service will automatically initialize all seven agents on startup.

## Available Agents

| Agent ID | Name | Role | Best For |
|----------|------|------|----------|
| `roxy` | Roxy | Strategic Operator | Schedule optimization, workflow design, priority setting |
| `echo` | Echo | Growth Catalyst | Market intelligence, growth opportunities, marketing strategy |
| `blaze` | Blaze | Sales Strategist | Sales funnels, pitch decks, conversion optimization |
| `lumi` | Lumi | Legal & Docs | Legal documents, contracts, compliance guidance |
| `vex` | Vex | Technical Architect | System architecture, tech stack, technical specifications |
| `lexi` | Lexi | Insight Engine | Data analysis, metrics interpretation, trend identification |
| `nova` | Nova | Product Designer | UI/UX design, wireframes, design systems |

## API Usage

### List All Agents

```bash
curl http://localhost:8000/api/agents/
```

### Get Agent Information

```bash
curl http://localhost:8000/api/agents/roxy
```

### Send a Message to an Agent

```bash
curl -X POST http://localhost:8000/api/agents/process \
  -H "Content-Type: application/json" \
  -d '{
    "agent_id": "roxy",
    "message": "Help me prioritize my tasks for this week",
    "context_id": "user123",
    "temperature": 0.7
  }'
```

### Clear Conversation Context

```bash
curl -X DELETE http://localhost:8000/api/agents/context/roxy/user123
```

## Python Usage Examples

### Basic Conversation

```python
from app.agents import agent_registry

# Get an agent
roxy = agent_registry.get("roxy")

# Create a conversation context
context = roxy.create_context()

# Send a message
result = await roxy.process_message(
    "What should I focus on this week?",
    context
)

print(result["content"])
```

### Using Specialized Methods

Each agent has specialized methods for common tasks:

#### Roxy - Schedule Optimization

```python
roxy = agent_registry.get("roxy")

result = await roxy.optimize_schedule(
    schedule="Monday: Meetings 9-12, Development 1-5...",
    goals="Launch MVP by end of month",
    constraints="No meetings after 4pm"
)
```

#### Echo - Market Analysis

```python
echo = agent_registry.get("echo")

result = await echo.analyze_market(
    market="B2B SaaS for small businesses",
    industry="Software",
    target_audience="Solo founders and small teams",
    trends="AI integration, automation, remote work"
)
```

#### Blaze - Funnel Design

```python
blaze = agent_registry.get("blaze")

result = await blaze.design_funnel(
    offering="Project management SaaS",
    audience="Small business owners",
    conversion_rates="Landing: 5%, Trial: 20%, Paid: 10%",
    goals="Increase trial-to-paid conversion to 25%"
)
```

#### Lumi - Document Generation

```python
lumi = agent_registry.get("lumi")

result = await lumi.generate_document(
    document_type="NDA",
    business_context="Software development services",
    parties="Company and Contractor",
    key_terms="Confidential information, 2-year term",
    jurisdiction="California, USA"
)
```

#### Vex - Technology Recommendations

```python
vex = agent_registry.get("vex")

result = await vex.recommend_technologies(
    use_case="Real-time chat application",
    requirements="WebSocket support, scalable, low latency",
    skills="JavaScript, Python",
    budget="Moderate",
    timeline="3 months"
)
```

#### Lexi - Data Analysis

```python
lexi = agent_registry.get("lexi")

result = await lexi.analyze_data(
    data_summary="Monthly user metrics",
    metrics="MAU: 1000, Churn: 5%, MRR: $5000",
    time_period="Last 3 months",
    context="SaaS product in growth phase"
)
```

#### Nova - UI/UX Guidance

```python
nova = agent_registry.get("nova")

result = await nova.provide_uiux_guidance(
    feature="User onboarding flow",
    user_goals="Complete profile setup quickly",
    context="Mobile-first web application",
    constraints="Must work on slow connections"
)
```

### Mission Control Contribution

Each agent can contribute to collaborative Mission Control sessions:

```python
# Get multiple agents
roxy = agent_registry.get("roxy")
echo = agent_registry.get("echo")
vex = agent_registry.get("vex")

objective = "Launch a new SaaS product in 90 days"
context = {
    "budget": "$10,000",
    "team_size": "1 founder",
    "technical_skills": "Full-stack development"
}

# Get contributions from each agent
roxy_contribution = await roxy.contribute_to_mission(objective, context)
echo_contribution = await echo.contribute_to_mission(objective, context)
vex_contribution = await vex.contribute_to_mission(objective, context)

# Combine insights
print("Strategic Operations:", roxy_contribution["content"])
print("Growth Strategy:", echo_contribution["content"])
print("Technical Architecture:", vex_contribution["content"])
```

## Conversation Context Management

### Creating Context

```python
# Default context (10 message history)
context = agent.create_context()

# Custom history length
context = agent.create_context(max_history=20)
```

### Adding Metadata

```python
context.set_metadata("user_id", "user123")
context.set_metadata("business_type", "SaaS")

# Retrieve metadata
user_id = context.get_metadata("user_id")
```

### Manual Context Management

```python
# Add messages manually
context.add_message("user", "What should I do?")
context.add_message("assistant", "Here's my recommendation...")

# Get message history
messages = context.get_messages()

# Clear context
context.clear()
```

## Temperature Settings

Control response creativity with temperature:

- **0.3-0.4**: Precise, factual (good for technical specs, legal docs)
- **0.5-0.7**: Balanced (good for most use cases)
- **0.8-0.9**: Creative, exploratory (good for brainstorming, ideation)

```python
# More creative response
result = await agent.process_message(
    message="Brainstorm viral marketing ideas",
    context=context,
    temperature=0.9
)

# More precise response
result = await agent.process_message(
    message="Create technical specifications",
    context=context,
    temperature=0.4
)
```

## Best Practices

### 1. Use the Right Agent for the Task

Match your question to the agent's expertise:
- Strategic planning → Roxy
- Marketing strategy → Echo
- Sales optimization → Blaze
- Legal questions → Lumi
- Technical decisions → Vex
- Data insights → Lexi
- Design guidance → Nova

### 2. Provide Context

Give agents relevant context for better responses:

```python
# Good - provides context
result = await roxy.process_message(
    "Help me prioritize tasks. I'm launching a SaaS product, "
    "have $5k budget, and 3 months timeline. Current focus: "
    "building MVP, setting up marketing, and finding first customers.",
    context
)

# Less effective - lacks context
result = await roxy.process_message(
    "Help me prioritize tasks",
    context
)
```

### 3. Maintain Conversation Context

Keep context for related questions:

```python
context = agent.create_context()

# First question
await agent.process_message("What's a good pricing strategy?", context)

# Follow-up (context maintained)
await agent.process_message("How would that work for enterprise customers?", context)
```

### 4. Use Specialized Methods

When available, use agent-specific methods for better results:

```python
# Instead of generic message
result = await lumi.process_message(
    "Generate an NDA for my business",
    context
)

# Use specialized method
result = await lumi.generate_document(
    document_type="NDA",
    business_context="Software consulting",
    parties="Company and Client",
    key_terms="Confidential information, 1-year term",
    jurisdiction="New York, USA"
)
```

### 5. Handle Legal Disclaimers

Lumi always includes legal disclaimers. Always review with a qualified attorney:

```python
result = await lumi.generate_document(...)
# Result includes disclaimer at the end
# Always recommend professional legal review
```

## Error Handling

```python
from fastapi import HTTPException

try:
    agent = agent_registry.get("roxy")
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    result = await agent.process_message(message, context)
    
except Exception as e:
    logger.error("Agent processing failed", error=str(e))
    # Handle error appropriately
```

## Testing

Run the test script to verify all agents:

```bash
python test_agents.py
```

This will:
- Initialize all agents
- List registered agents
- Test agent retrieval
- Process a sample message
- Display response and metadata

## Monitoring

Check agent usage and costs:

```python
from app.services.llm_service import llm_service

# Get cost statistics
stats = llm_service.get_cost_stats()
print(f"Total cost: ${stats['total_cost']}")
print(f"Total requests: {stats['total_requests']}")
```

## Next Steps

- Integrate agents with frontend chat interface
- Implement Mission Control orchestration
- Add agent-specific features (Competitor Stalker, Shadow Self, etc.)
- Set up production monitoring and logging
