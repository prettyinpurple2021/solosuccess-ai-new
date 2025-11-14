# AI Service Quick Start Guide

This guide will help you get the SoloSuccess AI Service up and running quickly.

## Prerequisites

- Python 3.11 or higher
- pip (Python package manager)
- API keys for:
  - OpenAI (required)
  - Anthropic (optional, for fallback)
  - Pinecone (required for vector database)

## Installation

1. **Create a virtual environment:**
   ```bash
   python -m venv venv
   
   # On Windows:
   venv\Scripts\activate
   
   # On macOS/Linux:
   source venv/bin/activate
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure environment variables:**
   ```bash
   # Copy the example environment file
   copy .env.example .env
   
   # Edit .env and add your API keys
   ```

   Required variables:
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `ANTHROPIC_API_KEY`: Your Anthropic API key
   - `PINECONE_API_KEY`: Your Pinecone API key
   - `PINECONE_ENVIRONMENT`: Your Pinecone environment (e.g., "us-west1-gcp")

## Running the Service

### Development Mode

```bash
python -m app.main
```

Or with uvicorn directly:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The service will be available at:
- API: http://localhost:8000
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### Production Mode

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

## Testing the API

### Health Check

```bash
curl http://localhost:8000/api/health
```

### Generate LLM Completion

```bash
curl -X POST http://localhost:8000/api/llm/completions \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "What are the key challenges for solo founders?"}
    ],
    "provider": "openai"
  }'
```

### Generate Embedding

```bash
curl -X POST http://localhost:8000/api/vectors/embeddings \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Solo founders need strategic guidance"
  }'
```

### Store Text with Embedding

```bash
curl -X POST http://localhost:8000/api/vectors/store \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Focus on product-market fit before scaling",
    "metadata": {"category": "advice", "topic": "growth"}
  }'
```

### Semantic Search

```bash
curl -X POST http://localhost:8000/api/vectors/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "How should I grow my business?",
    "top_k": 3
  }'
```

### List Available Agents

```bash
curl http://localhost:8000/api/agents/
```

### Process Message with Agent

```bash
curl -X POST http://localhost:8000/api/agents/process \
  -H "Content-Type: application/json" \
  -d '{
    "agent_id": "sample",
    "message": "I need help with my business strategy",
    "context_id": "user123"
  }'
```

## Docker Deployment

### Build the Docker image:

```bash
docker build -t solosuccess-ai-service .
```

### Run the container:

```bash
docker run -p 8000:8000 --env-file .env solosuccess-ai-service
```

## Next Steps

1. **Implement Core Agents**: Create the seven core agents (Roxy, Echo, Blaze, Lumi, Vex, Lexi, Nova) by extending the `BaseAgent` class
2. **Add Authentication**: Integrate with the Next.js frontend authentication system
3. **Implement Mission Control**: Build the agent orchestration system for collaborative sessions
4. **Add Caching**: Implement Redis caching for improved performance
5. **Set up Monitoring**: Configure Sentry and DataDog for production monitoring

## Troubleshooting

### Import Errors
Make sure you're in the virtual environment and all dependencies are installed:
```bash
pip install -r requirements.txt
```

### API Key Errors
Verify your `.env` file has all required API keys set correctly.

### Pinecone Connection Issues
Ensure your Pinecone environment matches your account region. Check the Pinecone dashboard for the correct environment name.

### Port Already in Use
If port 8000 is already in use, specify a different port:
```bash
uvicorn app.main:app --port 8001
```

## Support

For issues or questions, refer to:
- Main README.md for detailed documentation
- API documentation at `/docs` when running the service
- Design document at `.kiro/specs/solosuccess-ai/design.md`
