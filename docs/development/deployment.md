# Deployment Guide

## Overview

The template supports multiple deployment scenarios from simple Docker containers to enterprise Kubernetes orchestration.

## Quick Deployment Options

### Option 1: Docker Compose (Recommended for small teams)
```bash
# Production deployment with Docker Compose
git clone <your-repo> production-app
cd production-app

# Create production environment file
cp .env.example .env.production

# Edit configuration
nano .env.production

# Deploy
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### Option 2: Container Registry + Cloud Hosting
```bash
# Build and push images
docker build -t your-registry/intranet-frontend:latest frontend/
docker build -t your-registry/intranet-backend:latest backend/

docker push your-registry/intranet-frontend:latest
docker push your-registry/intranet-backend:latest
```

### Option 3: Platform as a Service (PaaS)
Deploy to platforms like Azure Container Instances, Google Cloud Run, or AWS App Runner using the provided Docker configurations.

## Production Configuration

### Environment Variables (.env.production)
```env
# Application
NODE_ENV=production
ASPNETCORE_ENVIRONMENT=Production

# Database (Production)
POSTGRES_DB=intranet_prod
POSTGRES_USER=intranet_user
POSTGRES_PASSWORD=secure_production_password_123!
CONNECTION_STRING=Host=your-db-server;Database=intranet_prod;Username=intranet_user;Password=secure_production_password_123!

# Authentication (Production)
JWT_AUTHORITY=https://login.microsoftonline.com/your-tenant-id/v2.0
JWT_AUDIENCE=your-production-client-id
ALLOWED_DOMAIN=@yourcompany.com
ADMIN_EMAIL=admin@yourcompany.com

# CORS (Update with your domain)
CORS_ALLOWED_ORIGINS=https://intranet.yourcompany.com

# Email (Production SMTP)
SMTP_HOST=smtp.yourcompany.com
SMTP_PORT=587
SMTP_USERNAME=noreply@yourcompany.com
SMTP_PASSWORD=your_smtp_password
SMTP_FROM=intranet@yourcompany.com

# Security
HANGFIRE_USERNAME=admin
HANGFIRE_PASSWORD=secure_hangfire_password

# Redis (Optional)
REDIS_CONNECTION_STRING=your-redis-server:6379

# SSL/TLS
ASPNETCORE_URLS=http://+:8080
USE_HTTPS_REDIRECTION=true
```

### Production Docker Compose (docker-compose.prod.yml)
```yaml
version: '3.8'

services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.prod
    ports:
      - "80:80"
      - "443:443"
    environment:
      - NODE_ENV=production
    volumes:
      - ./ssl:/etc/ssl/certs  # SSL certificates

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.prod
    ports:
      - "8080:8080"
    environment:
      - ASPNETCORE_ENVIRONMENT=Production
    env_file:
      - .env.production
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: intranet_prod
      POSTGRES_USER: intranet_user
      POSTGRES_PASSWORD: secure_production_password_123!
    volumes:
      - postgres_prod_data:/var/lib/postgresql/data
      - ./backups:/backups  # Database backup location
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    volumes:
      - redis_prod_data:/data
    ports:
      - "6379:6379"

volumes:
  postgres_prod_data:
  redis_prod_data:
```

## Cloud Platform Deployments

### Azure Container Instances (ACI)
```bash
# Create resource group
az group create --name intranet-rg --location eastus

# Create container instance
az container create \
  --resource-group intranet-rg \
  --name intranet-app \
  --image your-registry/intranet-backend:latest \
  --ports 80 443 \
  --environment-variables ASPNETCORE_ENVIRONMENT=Production \
  --secure-environment-variables CONNECTION_STRING="your-connection-string"
```

### Google Cloud Run
```bash
# Deploy backend
gcloud run deploy intranet-backend \
  --image gcr.io/your-project/intranet-backend:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated

# Deploy frontend
gcloud run deploy intranet-frontend \
  --image gcr.io/your-project/intranet-frontend:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

### AWS App Runner
```json
{
  "apprunner.yaml": {
    "version": 1.0,
    "runtime": "docker",
    "build": {
      "commands": {
        "build": [
          "docker build -t intranet-backend ./backend"
        ]
      }
    },
    "run": {
      "runtime-version": "latest",
      "command": "dotnet YourApp.Api.dll",
      "network": {
        "port": 8080,
        "env": "PORT"
      }
    }
  }
}
```

## Database Setup

### Production Database Migration
```bash
# Run migrations on production database
docker exec -it backend_container dotnet ef database update --connection "your-production-connection-string"

# Or run migration script
psql -h your-db-server -U intranet_user -d intranet_prod -f migration.sql
```

### Database Backup Strategy
```bash
# Automated backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -h localhost -U intranet_user intranet_prod > "/backups/backup_$DATE.sql"

# Keep only last 7 days of backups
find /backups -name "backup_*.sql" -mtime +7 -delete
```

## SSL/TLS Configuration

### Using Let's Encrypt (Recommended)
```bash
# Install certbot
apt-get install certbot python3-certbot-nginx

# Generate certificate
certbot --nginx -d intranet.yourcompany.com

# Auto-renewal
echo "0 12 * * * /usr/bin/certbot renew --quiet" | crontab -
```

### Using Custom Certificates
```nginx
# nginx.conf
server {
    listen 443 ssl;
    server_name intranet.yourcompany.com;
    
    ssl_certificate /etc/ssl/certs/your-cert.pem;
    ssl_certificate_key /etc/ssl/private/your-key.pem;
    
    location / {
        proxy_pass http://frontend:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    location /api/ {
        proxy_pass http://backend:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Monitoring & Logging

### Application Monitoring
```yaml
# docker-compose.monitoring.yml
version: '3.8'

services:
  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml

  grafana:
    image: grafana/grafana
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=your_grafana_password
    volumes:
      - grafana_data:/var/lib/grafana

volumes:
  grafana_data:
```

### Log Aggregation
```bash
# Using Docker logging driver
docker-compose -f docker-compose.yml \
               -f docker-compose.prod.yml \
               -f docker-compose.logging.yml up -d
```

## Performance Optimization

### Frontend Optimization
```dockerfile
# Optimized production Dockerfile
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
```

### Backend Optimization
```csharp
// Production optimizations in Program.cs
if (app.Environment.IsProduction())
{
    // Enable response compression
    app.UseResponseCompression();
    
    // Use output caching
    app.UseOutputCache();
    
    // Enable HSTS
    app.UseHsts();
}
```

### Database Optimization
```sql
-- Create indexes for performance
CREATE INDEX CONCURRENTLY idx_users_email ON users(email);
CREATE INDEX CONCURRENTLY idx_projects_created_at ON projects(created_at DESC);
CREATE INDEX CONCURRENTLY idx_files_project_id ON files(project_id);
```

## Security Hardening

### Production Security Checklist
- [ ] **HTTPS Only**: Force SSL/TLS encryption
- [ ] **Security Headers**: Implement CSP, HSTS, X-Frame-Options
- [ ] **Database Security**: Use connection pooling, encrypted connections
- [ ] **API Rate Limiting**: Prevent abuse and DoS attacks
- [ ] **Secrets Management**: Use secure secret storage (Azure Key Vault, AWS Secrets Manager)
- [ ] **Regular Updates**: Keep dependencies up to date
- [ ] **Backup Strategy**: Automated backups with encryption
- [ ] **Monitoring**: Set up alerts for security events

### Docker Security
```dockerfile
# Security best practices
FROM node:18-alpine
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
USER nextjs

# Don't run as root
WORKDIR /app
COPY --chown=nextjs:nodejs . .
```

## Deployment Automation

### GitHub Actions CI/CD
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Build and push Docker images
        run: |
          docker build -t ${{ secrets.REGISTRY }}/intranet-backend:latest backend/
          docker push ${{ secrets.REGISTRY }}/intranet-backend:latest
          
      - name: Deploy to production
        run: |
          ssh ${{ secrets.PRODUCTION_SERVER }} \
            "cd /opt/intranet && docker-compose pull && docker-compose up -d"
```

### Health Checks
```csharp
// Backend health check endpoint
app.MapHealthChecks("/health", new HealthCheckOptions
{
    ResponseWriter = UIResponseWriter.WriteHealthCheckUIResponse
});
```

## Troubleshooting Production Issues

### Common Production Issues
1. **Memory leaks**: Monitor container memory usage
2. **Database connections**: Check connection pool settings
3. **SSL certificate expiry**: Set up monitoring alerts
4. **High CPU usage**: Profile application performance
5. **Disk space**: Monitor log file growth

### Diagnostic Commands
```bash
# Check container status
docker-compose ps
docker-compose logs backend --tail=100

# Monitor resource usage
docker stats

# Database connection test
pg_isready -h your-db-server -p 5432

# Check SSL certificate
openssl s_client -connect intranet.yourcompany.com:443
```

This deployment guide provides multiple paths from simple Docker deployments to enterprise-grade cloud hosting, ensuring your intranet application can scale with your organization's needs.