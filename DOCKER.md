# Docker & DevOps Setup Guide

This guide covers the complete Docker and DevOps setup for the Intranet Starter project.

## Quick Start

### Prerequisites

- Docker 24.0+ and Docker Compose 2.0+
- Git
- At least 4GB RAM and 10GB free disk space

### Development Setup

```bash
# Clone and navigate to project
git clone <repository-url>
cd intranet-starter

# Quick setup (automated)
./scripts/dev-setup.sh

# Manual setup
cp .env.development .env
docker compose up -d
```

Access your development environment:
- **Frontend**: http://localhost:5173
- **API**: http://localhost:5001
- **API Docs**: http://localhost:5001/swagger
- **Hangfire Dashboard**: http://localhost:5002/hangfire

## Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Server    │    │   Background    │
│   (React/Nginx) │───▶│   (.NET 9)      │───▶│   Jobs          │
│   Port: 3000    │    │   Port: 8080    │    │   (Hangfire)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
    ┌─────────────────┐    ┌─────────────────┐
    │   PostgreSQL    │    │     Redis       │
    │   Port: 5432    │    │   Port: 6379    │
    └─────────────────┘    └─────────────────┘
```

## Docker Configuration

### Services

| Service    | Description                | Port    | Health Check |
|------------|----------------------------|---------|--------------|
| `frontend` | React app with Nginx       | 3000    | `/health`    |
| `api`      | .NET 9 Web API            | 8080    | `/health`    |
| `hangfire` | Background job processor   | 8081    | `/hangfire`  |
| `postgres` | PostgreSQL 16 database     | 5432    | `pg_isready` |
| `redis`    | Redis cache/session store  | 6379    | `redis-cli`  |

### Environment Files

- **`.env.example`**: Template with all configuration options
- **`.env.development`**: Development-specific settings
- **`.env`**: Your local configuration (created from template)

### Docker Compose Files

- **`docker-compose.yml`**: Base configuration
- **`docker-compose.override.yml`**: Development overrides (auto-loaded)
- **`docker-compose.prod.yml`**: Production-specific settings

## Environment Configuration

### Required Variables

```bash
# Database
POSTGRES_DB=intranet_starter
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password

# Application
ASPNETCORE_ENVIRONMENT=Development
JWT_AUTHORITY=http://localhost:8080
JWT_AUDIENCE=intranet-api

# Frontend
VITE_API_URL=http://localhost:8080
VITE_SIGNALR_URL=http://localhost:8080
```

### Optional Variables

```bash
# Email (SMTP)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USERNAME=noreply@company.com
SMTP_PASSWORD=password

# Admin Setup
ADMIN_EMAIL=admin@company.com
ALLOWED_DOMAIN=company.com

# File Storage (Cloud)
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
S3_BUCKET_NAME=intranet-files
```

## Development Workflows

### Starting the Development Environment

```bash
# Start all services
docker compose up -d

# Start specific services
docker compose up -d postgres redis api

# View logs
docker compose logs -f api
docker compose logs -f frontend

# Check service health
docker compose ps
```

### Development Commands

```bash
# Rebuild services after code changes
docker compose build api frontend
docker compose up -d

# Reset database (remove all data)
docker compose down -v
docker compose up -d

# Access database
docker compose exec postgres psql -U postgres -d intranet_starter

# Access Redis
docker compose exec redis redis-cli

# Run backend tests
docker compose exec api dotnet test

# Install new npm packages (frontend)
docker compose exec frontend npm install package-name
```

### Debugging

```bash
# View detailed logs
docker compose logs --tail=100 api

# Exec into containers
docker compose exec api bash
docker compose exec frontend sh

# Monitor resource usage
docker stats

# Inspect networks
docker network ls
docker network inspect intranet-starter_intranet-network
```

## Production Deployment

### Production Setup

1. **Prepare environment**:
   ```bash
   cp .env.example .env
   # Edit .env with production values
   ```

2. **Deploy**:
   ```bash
   # Using production compose
   docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
   
   # Or use deployment script
   ./scripts/prod-deploy.sh production
   ```

### Production Considerations

- **Security**: All services run as non-root users
- **Scaling**: API service can be scaled horizontally
- **Monitoring**: Health checks on all services
- **Logging**: JSON structured logs with rotation
- **Backups**: Automated database and file backups

### Load Balancing

For production, place a reverse proxy/load balancer in front:

```nginx
upstream api_backend {
    server app-server-1:8080;
    server app-server-2:8080;
}

server {
    listen 443 ssl;
    server_name api.yourdomain.com;
    
    location / {
        proxy_pass http://api_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## CI/CD Pipeline

The project includes comprehensive GitHub Actions workflows:

### Workflows

1. **CI Pipeline** (`.github/workflows/ci.yml`):
   - Backend: Build, test, security scan
   - Frontend: Build, lint, test
   - Docker: Build and test containers
   - Security: Vulnerability scanning

2. **Deployment** (`.github/workflows/deploy.yml`):
   - Staging deployment
   - Production deployment with approvals
   - Blue-green deployment strategy

3. **Security** (`.github/workflows/security.yml`):
   - Daily vulnerability scans
   - Container security analysis
   - Dependency checking
   - SAST/DAST scanning

### Pipeline Features

- **Automated Testing**: Unit, integration, and E2E tests
- **Security Scanning**: Multiple security tools integrated
- **Code Quality**: Linting, formatting, and code coverage
- **Container Security**: Image vulnerability scanning
- **Secrets Detection**: Prevent credential leaks
- **Dependency Management**: Automated updates via Dependabot

## Monitoring & Observability

### Health Checks

All services include health check endpoints:

```bash
# Check service health
curl http://localhost:8080/health  # API
curl http://localhost:3000/health  # Frontend

# Docker health status
docker compose ps
```

### Logging

- **Structured Logging**: JSON format with correlation IDs
- **Log Aggregation**: Centralized logging via Docker
- **Log Rotation**: Automatic cleanup of old logs

### Optional Monitoring Stack

Uncomment in `docker-compose.yml` to enable:

```bash
# Enable monitoring
vim docker-compose.yml  # Uncomment monitoring services
docker compose up -d prometheus grafana

# Access dashboards
open http://localhost:9090  # Prometheus
open http://localhost:3001  # Grafana
```

## Troubleshooting

### Common Issues

1. **Port Conflicts**:
   ```bash
   # Check port usage
   lsof -i :5432
   
   # Change ports in docker-compose.yml
   ports:
     - "5433:5432"  # Use different external port
   ```

2. **Permission Issues**:
   ```bash
   # Fix file permissions
   sudo chown -R $(whoami):$(whoami) uploads/ logs/
   ```

3. **Database Connection**:
   ```bash
   # Reset database
   docker compose down -v postgres
   docker compose up -d postgres
   ```

4. **Memory Issues**:
   ```bash
   # Increase Docker memory limit
   # Docker Desktop: Settings > Resources > Memory
   
   # Check container memory usage
   docker stats
   ```

### Performance Optimization

1. **Docker Layer Caching**:
   - Multi-stage builds optimize image size
   - Build cache reuse speeds up builds

2. **Resource Limits**:
   - Production compose includes resource limits
   - Prevents containers from consuming all resources

3. **Database Optimization**:
   - Connection pooling configured
   - Indexes applied via migrations

## Security Considerations

### Container Security

- **Non-root Users**: All containers run as non-root
- **Minimal Base Images**: Alpine Linux for smaller attack surface
- **Security Scanning**: Integrated vulnerability scanning
- **Secrets Management**: Environment variables for configuration

### Network Security

- **Isolated Networks**: Services communicate via Docker networks
- **No Exposed Internals**: Only necessary ports exposed
- **TLS Termination**: HTTPS handled by reverse proxy

### Application Security

- **JWT Authentication**: Secure token-based auth
- **CORS Configuration**: Proper cross-origin settings
- **Input Validation**: All inputs validated and sanitized
- **Security Headers**: Comprehensive HTTP security headers

## Migration Guide

### From Development to Production

1. **Environment Variables**: Update all production values
2. **Secrets Management**: Use proper secret management
3. **SSL/TLS**: Configure HTTPS termination
4. **Monitoring**: Set up monitoring and alerting
5. **Backups**: Configure automated backups
6. **Scaling**: Configure load balancing if needed

### Database Migrations

```bash
# Run migrations manually
docker compose exec api dotnet ef database update

# Check migration status
docker compose exec api dotnet ef migrations list
```

For additional help, see the main project README or open an issue.