# FinConnectAI 2.0 Deployment Guide

This guide provides step-by-step instructions for deploying FinConnectAI 2.0 in different environments.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Local Development](#local-development)
4. [Staging Environment](#staging-environment)
5. [Production Environment](#production-environment)
6. [Configuration Management](#configuration-management)
7. [Scaling](#scaling)
8. [Monitoring](#monitoring)
9. [Backup and Recovery](#backup-and-recovery)
10. [Troubleshooting](#troubleshooting)

## Prerequisites

### Hardware Requirements

| Component       | Minimum | Recommended |
|----------------|---------|-------------|
| CPU            | 2 cores | 4+ cores    |
| Memory         | 2GB     | 8GB         |
| Storage        | 10GB    | 50GB        |
| Network        | 100Mbps | 1Gbps       |


### Software Requirements

- Node.js 18+
- npm 9+ or Yarn 1.22+
- Docker 20.10+
- Kubernetes 1.21+ (for production)
- PostgreSQL 13+ (for production)
- Redis 6+ (for caching)

## Environment Setup

### 1. Clone the Repository

```bash
git clone https://github.com/VIKAS9793/FinConnectAI-2.0.git
cd FinConnectAI-2.0
```

### 2. Install Dependencies

```bash
# Using npm
npm ci --only=production

# Or using Yarn
yarn install --production
```

### 3. Environment Configuration

Copy the example environment file and update the values:

```bash
cp .env.example .env
```

Update the following required environment variables:

```env
# Server Configuration
NODE_ENV=production
PORT=3001

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/finconnect

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=15m

# AI Provider (at least one required)
AI_PROVIDER=google  # or openai
GOOGLE_AI_KEY=your-google-ai-key
# OR
OPENAI_API_KEY=your-openai-api-key
```

## Local Development

### 1. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3001`

### 2. Running Tests

```bash
# Unit tests
npm test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e
```

## Staging Environment

### 1. Build Docker Image

```bash
docker build -t finconnectai/staging:latest .
```

### 2. Run with Docker Compose

```bash
docker-compose -f docker-compose.staging.yml up -d
```

### 3. Verify Deployment

```bash
curl http://localhost:3001/health
```

## Production Environment

### 1. Kubernetes Deployment

1. Create a Kubernetes cluster
2. Apply the Kubernetes manifests:

```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/ingress.yaml
```

### 2. Database Setup

```bash
# Create database
createdb finconnect_prod

# Run migrations
npm run db:migrate

# Seed initial data (if needed)
npm run db:seed
```

### 3. Enable HTTPS

1. Obtain SSL certificates (e.g., using Let's Encrypt)
2. Configure the web server (Nginx/Apache) with SSL termination

## Configuration Management

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| NODE_ENV | Yes | - | Environment (development, test, production) |
| PORT | No | 3001 | Application port |
| DATABASE_URL | Yes | - | PostgreSQL connection string |
| REDIS_URL | Yes | - | Redis connection string |
| JWT_SECRET | Yes | - | Secret for JWT signing |
| JWT_EXPIRES_IN | No | 15m | JWT expiration time |
| AI_PROVIDER | Yes | - | AI provider (google or openai) |
| GOOGLE_AI_KEY | Conditional | - | Google AI API key |
| OPENAI_API_KEY | Conditional | - | OpenAI API key |

## Scaling

### Horizontal Scaling

1. **Kubernetes**
   - Enable Horizontal Pod Autoscaler (HPA)
   - Configure resource requests/limits

2. **Database**
   - Set up read replicas
   - Implement connection pooling

3. **Caching**
   - Use Redis for session storage
   - Implement response caching

## Monitoring

### Required Monitoring

1. **Application Metrics**
   - Response times
   - Error rates
   - Request rates

2. **Infrastructure Metrics**
   - CPU/Memory usage
   - Disk I/O
   - Network I/O

3. **Logging**
   - Centralized logging with ELK stack
   - Structured JSON logs
   - Log rotation

### Recommended Tools

- **APM**: New Relic, Datadog, or OpenTelemetry
- **Logging**: ELK Stack or Loki
- **Alerting**: Prometheus with Alertmanager

## Backup and Recovery

### Database Backups

```bash
# Daily backup
pg_dump finconnect_prod > finconnect_backup_$(date +%Y%m%d).sql

# Restore from backup
psql finconnect_prod < backup_file.sql
```

### Configuration Backups

1. Back up all `.env` files
2. Back up Kubernetes manifests
3. Back up SSL certificates

## Troubleshooting

### Common Issues

1. **Application Won't Start**
   - Check logs: `docker logs <container_id>`
   - Verify environment variables
   - Check port availability

2. **Database Connection Issues**
   - Verify database is running
   - Check connection string
   - Check authentication credentials

3. **Performance Issues**
   - Check database queries
   - Monitor resource usage
   - Review application logs

### Getting Help

For additional support, please contact:
- **Email**: support@finconnectai.com
- **Slack**: #finconnectai-support
- **Documentation**: https://docs.finconnectai.com
