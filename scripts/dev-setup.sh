#!/bin/bash
set -e

echo "🚀 Setting up Intranet Starter development environment..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create .env file from example if it doesn't exist
if [[ ! -f .env ]]; then
    echo "📝 Creating .env file from .env.development template..."
    cp .env.development .env
    echo "✅ Created .env file. Please review and update the configuration."
fi

# Create necessary directories
echo "📁 Creating required directories..."
mkdir -p logs uploads

# Pull base images
echo "🐳 Pulling base Docker images..."
docker pull postgres:16-alpine
docker pull redis:7-alpine
docker pull mcr.microsoft.com/dotnet/sdk:9.0
docker pull mcr.microsoft.com/dotnet/aspnet:9.0
docker pull node:20-alpine
docker pull nginx:alpine

# Build and start services
echo "🏗️  Building and starting services..."
docker compose -f docker-compose.yml -f docker-compose.override.yml build
docker compose -f docker-compose.yml -f docker-compose.override.yml up -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be healthy..."
timeout=300
elapsed=0

while [ $elapsed -lt $timeout ]; do
    if docker compose ps | grep -E "(healthy|running).*healthy" | wc -l | grep -q "3"; then
        echo "✅ All services are healthy!"
        break
    fi
    
    echo "⏳ Waiting for services... ($elapsed/$timeout seconds)"
    sleep 10
    elapsed=$((elapsed + 10))
done

if [ $elapsed -ge $timeout ]; then
    echo "❌ Services did not become healthy within $timeout seconds"
    echo "🔍 Service status:"
    docker compose ps
    echo "📋 Service logs:"
    docker compose logs
    exit 1
fi

# Show service URLs
echo ""
echo "🎉 Development environment is ready!"
echo ""
echo "Service URLs:"
echo "  • Frontend: http://localhost:5173"
echo "  • API: http://localhost:5001"
echo "  • API Documentation: http://localhost:5001/swagger"
echo "  • Hangfire Dashboard: http://localhost:5002/hangfire"
echo "  • Database: localhost:5433 (user: postgres, password: postgres)"
echo "  • Redis: localhost:6379"
echo ""
echo "Useful commands:"
echo "  • View logs: docker compose logs -f [service]"
echo "  • Stop services: docker compose down"
echo "  • Restart service: docker compose restart [service]"
echo "  • View service status: docker compose ps"
echo ""
echo "🔧 If you need to reset the database:"
echo "  docker compose down -v && docker compose up -d"