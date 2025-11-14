# Production Deployment Guide

## Overview

This guide covers deploying the SoloSuccess AI Service to production with all necessary infrastructure and best practices.

## Infrastructure Requirements

### Required Services

1. **Application Server**
   - Python 3.11+
   - 2+ CPU cores
   - 4GB+ RAM
   - HTTPS/TLS enabled

2. **Redis**
   - Redis 7.0+
   - Persistent storage enabled (AOF + RDB)
   - 2GB+ memory
   - Clustering recommended for high availability

3. **External APIs**
   - OpenAI API access
   - Anthropic API access
   - Pinecone vector database
   - Sentry (optional, for error tracking)

## Environment Configuration

### Production Environment Variables

```bash
# Server Configuration
HOST=0.0.0.0
PORT=8000
ENVIRONMENT=production
DEBUG=false

# CORS Configuration
ALLOWED_ORIGINS=https://yourdomain.com,https://app.yourdomain.com

# OpenAI Configuration
OPENAI_API_KEY=sk-prod-xxxxx
OPENAI_MODEL=gpt-4
OPENAI_MAX_TOKENS=2000
OPENAI_TEMPERATURE=0.7

# Anthropic Configuration
ANTHROPIC_API_KEY=sk-ant-xxxxx
ANTHROPIC_MODEL=claude-3-sonnet-20240229
ANTHROPIC_MAX_TOKENS=2000

# Pinecone Configuration
PINECONE_API_KEY=xxxxx
PINECONE_ENVIRONMENT=us-east-1-aws
PINECONE_INDEX_NAME=solosuccess-prod

# Redis Configuration (Production)
REDIS_URL=redis://redis-prod.example.com:6379/0
# Or for Redis with password:
# REDIS_URL=redis://:password@redis-prod.example.com:6379/0
# Or for Redis Cluster:
# REDIS_URL=redis://redis-cluster.example.com:6379/0?cluster=true

# Monitoring
SENTRY_DSN=https://xxxxx@sentry.io/xxxxx

# Rate Limiting
RATE_LIMIT_PER_MINUTE=100
RATE_LIMIT_PER_HOUR=5000

# Cost Tracking
ENABLE_COST_TRACKING=true
COST_ALERT_THRESHOLD=1000.0
```

## Redis Setup

### Option 1: Managed Redis (Recommended)

**AWS ElastiCache:**
```bash
# Create ElastiCache cluster
aws elasticache create-cache-cluster \
  --cache-cluster-id solosuccess-redis \
  --engine redis \
  --cache-node-type cache.t3.medium \
  --num-cache-nodes 1 \
  --engine-version 7.0

# Get endpoint
aws elasticache describe-cache-clusters \
  --cache-cluster-id solosuccess-redis \
  --show-cache-node-info
```

**Redis Cloud:**
- Sign up at https://redis.com/try-free/
- Create a new database
- Copy connection string to REDIS_URL

**DigitalOcean Managed Redis:**
```bash
doctl databases create solosuccess-redis \
  --engine redis \
  --region nyc1 \
  --size db-s-1vcpu-1gb
```

### Option 2: Self-Hosted Redis

**Docker Compose:**
```yaml
version: '3.8'
services:
  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes --requirepass yourpassword
    volumes:
      - redis-data:/data
    ports:
      - "6379:6379"
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 3

volumes:
  redis-data:
```

**Redis Configuration (redis.conf):**
```conf
# Persistence
appendonly yes
appendfsync everysec
save 900 1
save 300 10
save 60 10000

# Memory
maxmemory 2gb
maxmemory-policy allkeys-lru

# Security
requirepass yourpassword
bind 0.0.0.0
protected-mode yes

# Performance
tcp-backlog 511
timeout 300
tcp-keepalive 300
```

## Application Deployment

### Option 1: Docker (Recommended)

**Build and run:**
```bash
# Build image
docker build -t solosuccess-ai:latest .

# Run container
docker run -d \
  --name solosuccess-ai \
  --env-file .env.production \
  -p 8000:8000 \
  --restart unless-stopped \
  solosuccess-ai:latest
```

**Docker Compose (Full Stack):**
```yaml
version: '3.8'

services:
  ai-service:
    build: .
    ports:
      - "8000:8000"
    env_file:
      - .env.production
    depends_on:
      - redis
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 4G

  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    volumes:
      - redis-data:/data
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 3

volumes:
  redis-data:
```

### Option 2: Kubernetes

**Deployment manifest:**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: solosuccess-ai
spec:
  replicas: 3
  selector:
    matchLabels:
      app: solosuccess-ai
  template:
    metadata:
      labels:
        app: solosuccess-ai
    spec:
      containers:
      - name: ai-service
        image: solosuccess-ai:latest
        ports:
        - containerPort: 8000
        envFrom:
        - secretRef:
            name: ai-service-secrets
        resources:
          requests:
            memory: "2Gi"
            cpu: "1"
          limits:
            memory: "4Gi"
            cpu: "2"
        livenessProbe:
          httpGet:
            path: /api/health
            port: 8000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /api/health
            port: 8000
          initialDelaySeconds: 10
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: solosuccess-ai
spec:
  selector:
    app: solosuccess-ai
  ports:
  - port: 80
    targetPort: 8000
  type: LoadBalancer
```

### Option 3: Traditional Server

**Using systemd:**

Create `/etc/systemd/system/solosuccess-ai.service`:
```ini
[Unit]
Description=SoloSuccess AI Service
After=network.target redis.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/solosuccess-ai
Environment="PATH=/opt/solosuccess-ai/venv/bin"
EnvironmentFile=/opt/solosuccess-ai/.env.production
ExecStart=/opt/solosuccess-ai/venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

**Enable and start:**
```bash
sudo systemctl enable solosuccess-ai
sudo systemctl start solosuccess-ai
sudo systemctl status solosuccess-ai
```

## Reverse Proxy Setup

### Nginx Configuration

```nginx
upstream solosuccess_ai {
    server 127.0.0.1:8000;
    # For multiple instances:
    # server 127.0.0.1:8001;
    # server 127.0.0.1:8002;
}

server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
    limit_req zone=api_limit burst=20 nodelay;

    location / {
        proxy_pass http://solosuccess_ai;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket support (if needed)
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Health check endpoint (no rate limiting)
    location /api/health {
        proxy_pass http://solosuccess_ai;
        limit_req off;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name api.yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

## Monitoring and Logging

### Application Logs

**Structured logging is already configured with structlog.**

View logs:
```bash
# Docker
docker logs -f solosuccess-ai

# Systemd
journalctl -u solosuccess-ai -f

# Log to file
uvicorn app.main:app --log-config logging.yaml
```

### Health Checks

**Endpoint:** `GET /api/health`

**Expected response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00Z",
  "version": "0.1.0"
}
```

**Monitoring script:**
```bash
#!/bin/bash
HEALTH_URL="https://api.yourdomain.com/api/health"
ALERT_EMAIL="alerts@yourdomain.com"

if ! curl -sf "$HEALTH_URL" > /dev/null; then
    echo "Health check failed!" | mail -s "AI Service Down" "$ALERT_EMAIL"
fi
```

### Sentry Integration

Already configured in the application. Just set `SENTRY_DSN` in environment variables.

### Metrics Collection

**Prometheus metrics (optional):**
```python
# Add to requirements.txt
prometheus-fastapi-instrumentator==6.1.0

# Add to main.py
from prometheus_fastapi_instrumentator import Instrumentator

Instrumentator().instrument(app).expose(app)
```

## Scaling Considerations

### Horizontal Scaling

1. **Multiple instances behind load balancer**
   - Redis handles shared state
   - No sticky sessions required
   - Scale based on CPU/memory usage

2. **Load balancer configuration**
   ```nginx
   upstream solosuccess_ai {
       least_conn;
       server instance1:8000 max_fails=3 fail_timeout=30s;
       server instance2:8000 max_fails=3 fail_timeout=30s;
       server instance3:8000 max_fails=3 fail_timeout=30s;
   }
   ```

### Redis Scaling

1. **Redis Cluster** for high availability
2. **Read replicas** for read-heavy workloads
3. **Separate Redis instances** for different data types

### Cost Optimization

1. **LLM Provider Fallback**
   - Already implemented
   - OpenAI primary, Anthropic fallback
   - Monitors costs automatically

2. **Context TTL Management**
   - Default 24-hour expiration
   - Adjust based on usage patterns
   - Clear inactive contexts regularly

3. **Rate Limiting**
   - Configured per-user limits
   - Prevents abuse and cost overruns

## Security Checklist

- [ ] HTTPS/TLS enabled
- [ ] API keys stored in environment variables (not code)
- [ ] Redis password protected
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Security headers configured
- [ ] Regular dependency updates
- [ ] Sentry error tracking enabled
- [ ] Access logs monitored
- [ ] Firewall rules configured

## Backup and Recovery

### Redis Backups

**Automated backups:**
```bash
# Cron job for daily backups
0 2 * * * redis-cli --rdb /backup/redis-$(date +\%Y\%m\%d).rdb
```

**Restore from backup:**
```bash
# Stop Redis
systemctl stop redis

# Copy backup
cp /backup/redis-20240101.rdb /var/lib/redis/dump.rdb

# Start Redis
systemctl start redis
```

### Application State

- Agent configurations: Version controlled in Git
- User data: Stored in primary database (not AI service)
- Conversation contexts: Stored in Redis (backed up)

## Troubleshooting

### Common Issues

**1. Redis connection failed**
```bash
# Check Redis is running
redis-cli ping

# Check connection string
echo $REDIS_URL

# Test connection
redis-cli -u $REDIS_URL ping
```

**2. High memory usage**
```bash
# Check Redis memory
redis-cli info memory

# Clear old contexts
curl -X DELETE https://api.yourdomain.com/api/agents/contexts
```

**3. Slow response times**
```bash
# Check LLM provider status
curl https://status.openai.com/api/v2/status.json

# Monitor application logs
docker logs -f solosuccess-ai | grep "duration_ms"
```

**4. Cost alerts**
```bash
# Check cost statistics
curl https://api.yourdomain.com/api/llm/costs

# Review usage patterns
redis-cli keys "context:*" | wc -l
```

## Maintenance

### Regular Tasks

**Daily:**
- Monitor error rates in Sentry
- Check cost tracking dashboard
- Review application logs

**Weekly:**
- Clear old conversation contexts
- Review and optimize slow queries
- Check Redis memory usage

**Monthly:**
- Update dependencies
- Review and optimize costs
- Performance testing
- Security audit

### Updates and Rollbacks

**Zero-downtime deployment:**
```bash
# Build new version
docker build -t solosuccess-ai:v2 .

# Start new container
docker run -d --name solosuccess-ai-v2 solosuccess-ai:v2

# Update load balancer to point to new container
# Monitor for issues

# Stop old container
docker stop solosuccess-ai-v1
```

**Rollback:**
```bash
# Revert load balancer to old container
# Stop new container
docker stop solosuccess-ai-v2
```

## Performance Tuning

### Application

```python
# Increase worker count based on CPU cores
uvicorn app.main:app --workers 4

# Adjust timeouts
uvicorn app.main:app --timeout-keep-alive 30
```

### Redis

```conf
# Increase max connections
maxclients 10000

# Optimize for your workload
maxmemory-policy allkeys-lru
```

### Database Connection Pooling

Already configured in the application with optimal defaults.

## Support and Monitoring

### Key Metrics to Monitor

1. **Application Health**
   - Response time (p50, p95, p99)
   - Error rate
   - Request rate

2. **Redis Health**
   - Memory usage
   - Connection count
   - Hit rate

3. **LLM Usage**
   - API call count
   - Token usage
   - Cost per day
   - Error rate

4. **Business Metrics**
   - Active conversations
   - Messages per agent
   - User engagement

### Alerting Rules

```yaml
# Example Prometheus alerting rules
groups:
  - name: solosuccess_ai
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
        annotations:
          summary: "High error rate detected"
      
      - alert: HighResponseTime
        expr: histogram_quantile(0.95, http_request_duration_seconds) > 2
        annotations:
          summary: "95th percentile response time > 2s"
      
      - alert: RedisDown
        expr: redis_up == 0
        annotations:
          summary: "Redis is down"
```
