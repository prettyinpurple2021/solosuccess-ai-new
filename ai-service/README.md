# SoloSuccess AI Service

Python FastAPI service for AI agent orchestration and LLM integration.

## Setup

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your API keys
```

4. Run the service:
```bash
python -m app.main
# Or with uvicorn directly:
uvicorn app.main:app --reload
```

## API Documentation

When running in development mode, API documentation is available at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Health Checks

- Basic health: `GET /api/health`
- Detailed health: `GET /api/health/detailed`
- Readiness: `GET /api/health/ready`
- Liveness: `GET /api/health/live`

## Docker

Build and run with Docker:
```bash
docker build -t solosuccess-ai-service .
docker run -p 8000:8000 --env-file .env solosuccess-ai-service
```

## Project Structure

```
ai-service/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI application
│   ├── config.py            # Configuration management
│   ├── middleware.py        # Custom middleware
│   ├── routers/             # API route handlers
│   │   ├── health.py        # Health check endpoints
│   │   ├── llm.py           # LLM completion endpoints
│   │   ├── vectors.py       # Vector database endpoints
│   │   └── agents.py        # AI agent endpoints
│   ├── services/            # Business logic services
│   │   ├── llm_service.py   # LLM integration (OpenAI/Anthropic)
│   │   └── vector_service.py # Vector database (Pinecone)
│   ├── agents/              # AI agent implementations
│   │   ├── base_agent.py    # Base agent class
│   │   ├── agent_registry.py # Agent management
│   │   └── sample_agent.py  # Sample agent implementation
│   ├── models/              # Pydantic models
│   │   ├── llm_models.py    # LLM request/response models
│   │   ├── vector_models.py # Vector database models
│   │   └── agent_models.py  # Agent models
│   └── utils/               # Utility functions
│       └── agent_helpers.py # Agent helper utilities
├── requirements.txt         # Python dependencies
├── Dockerfile              # Docker configuration
└── README.md               # This file
```

## Features

### LLM Integration
- OpenAI GPT-4 integration with automatic fallback to Anthropic Claude
- Retry logic with exponential backoff
- Cost tracking and monitoring
- Token usage analytics

### Vector Database
- Pinecone integration for semantic search
- Automatic embedding generation using OpenAI
- Vector storage and retrieval
- Namespace support for organization

### AI Agent System
- Base agent class with conversation context management
- Prompt template system
- Response formatting utilities
- Agent registry for managing multiple agents
- Mission Control contribution interface
