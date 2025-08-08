#!/bin/bash
set -e

# Production deployment script
# This script should be customized for your specific deployment environment

ENVIRONMENT=${1:-production}
BACKUP_DIR="/backup/intranet-starter"
APP_DIR="/app/intranet-starter"

echo "🚀 Starting production deployment for environment: $ENVIRONMENT"

# Validate environment
if [[ ! "$ENVIRONMENT" =~ ^(staging|production)$ ]]; then
    echo "❌ Invalid environment. Use 'staging' or 'production'"
    exit 1
fi

# Check if running as correct user
if [[ "$ENVIRONMENT" == "production" && "$(whoami)" != "deploy" ]]; then
    echo "❌ Production deployments must be run as 'deploy' user"
    exit 1
fi

# Create backup directory
echo "📁 Creating backup directory..."
mkdir -p "$BACKUP_DIR/$(date +%Y%m%d_%H%M%S)"

# Pre-deployment checks
echo "🔍 Running pre-deployment checks..."

# Check if .env file exists
if [[ ! -f "$APP_DIR/.env" ]]; then
    echo "❌ .env file not found in $APP_DIR"
    exit 1
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running"
    exit 1
fi

# Check available disk space (require at least 2GB)
available_space=$(df "$APP_DIR" | tail -1 | awk '{print $4}')
if [[ $available_space -lt 2097152 ]]; then
    echo "❌ Insufficient disk space. At least 2GB required."
    exit 1
fi

# Backup current deployment
echo "💾 Creating backup of current deployment..."
if docker compose ps | grep -q "Up"; then
    docker compose exec postgres pg_dump -U postgres intranet_starter > "$BACKUP_DIR/$(date +%Y%m%d_%H%M%S)/database.sql"
    tar -czf "$BACKUP_DIR/$(date +%Y%m%d_%H%M%S)/uploads.tar.gz" uploads/ || true
    cp -r logs/ "$BACKUP_DIR/$(date +%Y%m%d_%H%M%S)/" || true
    echo "✅ Backup completed"
else
    echo "⚠️ No running services found, skipping backup"
fi

# Pull latest code
echo "📥 Pulling latest code..."
git fetch origin
git checkout main
git pull origin main

# Pull latest images
echo "🐳 Pulling latest Docker images..."
if [[ "$ENVIRONMENT" == "production" ]]; then
    docker compose -f docker-compose.yml -f docker-compose.prod.yml pull
else
    docker compose pull
fi

# Run database migrations (if needed)
echo "🗄️ Running database migrations..."
# This would typically run your migration commands
# docker compose run --rm api dotnet ef database update

# Deploy with zero-downtime strategy
echo "🔄 Deploying with rolling update..."

if [[ "$ENVIRONMENT" == "production" ]]; then
    # Production deployment with scaling
    docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --scale api=2 --no-deps api
    
    # Wait for new instances to be healthy
    sleep 30
    
    # Check health
    if ! curl -f http://localhost:8080/health > /dev/null 2>&1; then
        echo "❌ Health check failed, rolling back..."
        # Rollback logic here
        exit 1
    fi
    
    # Update other services
    docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --no-deps frontend hangfire
else
    # Staging deployment
    docker compose up -d
fi

# Post-deployment verification
echo "🏥 Running post-deployment health checks..."

# Wait for services to be ready
sleep 15

# Check API health
if curl -f http://localhost:8080/health > /dev/null 2>&1; then
    echo "✅ API health check passed"
else
    echo "❌ API health check failed"
    exit 1
fi

# Check Frontend
if curl -f http://localhost:3000/health > /dev/null 2>&1; then
    echo "✅ Frontend health check passed"
else
    echo "❌ Frontend health check failed"
    exit 1
fi

# Check database connectivity
if docker compose exec postgres pg_isready -U postgres > /dev/null 2>&1; then
    echo "✅ Database connectivity check passed"
else
    echo "❌ Database connectivity check failed"
    exit 1
fi

# Cleanup old images
echo "🧹 Cleaning up old Docker images..."
docker image prune -f

# Log deployment
echo "$(date): Successful deployment to $ENVIRONMENT" >> /var/log/intranet-deployments.log

echo "🎉 Deployment completed successfully!"
echo ""
echo "Service URLs:"
if [[ "$ENVIRONMENT" == "production" ]]; then
    echo "  • Frontend: https://intranet.yourdomain.com"
    echo "  • API: https://api.intranet.yourdomain.com"
else
    echo "  • Frontend: https://staging.intranet.yourdomain.com"
    echo "  • API: https://api.staging.intranet.yourdomain.com"
fi

echo ""
echo "Next steps:"
echo "  • Monitor application logs: docker compose logs -f"
echo "  • Check application metrics"
echo "  • Verify all functionality is working"
echo "  • Update monitoring alerts if needed"