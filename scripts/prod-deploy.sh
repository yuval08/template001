#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Environment parameter (default to staging if not provided)
ENVIRONMENT=${1:-staging}

echo -e "${BLUE}🚀 Deploying Intranet Starter to $ENVIRONMENT environment...${NC}"

# Function to check prerequisites
check_prerequisites() {
    echo -e "${BLUE}🔍 Checking prerequisites...${NC}"
    
    # Check if Docker is installed and running
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}❌ Docker is not installed.${NC}"
        exit 1
    fi
    
    if ! docker info &> /dev/null; then
        echo -e "${RED}❌ Docker daemon is not running.${NC}"
        exit 1
    fi
    
    # Check if environment-specific .env exists
    env_file=".env"
    if [ "$ENVIRONMENT" != "development" ]; then
        env_file=".env.${ENVIRONMENT}"
    fi
    
    if [[ ! -f "$env_file" ]]; then
        echo -e "${RED}❌ Environment file $env_file not found.${NC}"
        echo -e "${YELLOW}💡 Create it from .env.example template${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Prerequisites met${NC}"
}

# Function to validate environment configuration
validate_config() {
    echo -e "${BLUE}🔍 Validating configuration...${NC}"
    
    # Load environment variables
    env_file=".env"
    if [ "$ENVIRONMENT" != "development" ]; then
        env_file=".env.${ENVIRONMENT}"
    fi
    
    source "$env_file"
    
    # Check required variables
    required_vars=(
        "POSTGRES_DB"
        "POSTGRES_USER"
        "POSTGRES_PASSWORD"
        "JWT_AUTHORITY"
        "JWT_AUDIENCE"
    )
    
    missing_vars=()
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            missing_vars+=("$var")
        fi
    done
    
    if [ ${#missing_vars[@]} -gt 0 ]; then
        echo -e "${RED}❌ Missing required environment variables:${NC}"
        for var in "${missing_vars[@]}"; do
            echo -e "  • $var"
        done
        exit 1
    fi
    
    # Validate production-specific settings
    if [ "$ENVIRONMENT" = "production" ]; then
        if [ "$JWT_REQUIRE_HTTPS" != "true" ]; then
            echo -e "${YELLOW}⚠️  Warning: JWT_REQUIRE_HTTPS should be true in production${NC}"
        fi
        
        if [ "$ASPNETCORE_ENVIRONMENT" != "Production" ]; then
            echo -e "${YELLOW}⚠️  Warning: ASPNETCORE_ENVIRONMENT should be Production${NC}"
        fi
        
        # Check for strong passwords
        if [ ${#POSTGRES_PASSWORD} -lt 12 ]; then
            echo -e "${YELLOW}⚠️  Warning: Consider using a stronger database password${NC}"
        fi
    fi
    
    echo -e "${GREEN}✅ Configuration validated${NC}"
}

# Function to perform backup (production only)
backup_data() {
    if [ "$ENVIRONMENT" = "production" ]; then
        echo -e "${BLUE}💾 Creating backup...${NC}"
        
        timestamp=$(date +%Y%m%d_%H%M%S)
        backup_dir="backups/$timestamp"
        mkdir -p "$backup_dir"
        
        # Backup database
        if docker compose ps postgres | grep -q "Up"; then
            echo -e "  Creating database backup..."
            docker compose exec -T postgres pg_dump -U ${POSTGRES_USER} ${POSTGRES_DB} > "$backup_dir/database.sql"
        fi
        
        # Backup uploads
        if [ -d "uploads" ]; then
            echo -e "  Creating uploads backup..."
            tar -czf "$backup_dir/uploads.tar.gz" uploads/
        fi
        
        echo -e "${GREEN}✅ Backup created at $backup_dir${NC}"
    fi
}

# Function to deploy
deploy() {
    echo -e "${BLUE}🏗️  Building and deploying services...${NC}"
    
    # Determine compose files
    compose_files="-f docker-compose.yml"
    if [ "$ENVIRONMENT" = "production" ]; then
        compose_files="$compose_files -f docker-compose.prod.yml"
    elif [ "$ENVIRONMENT" = "development" ]; then
        compose_files="$compose_files -f docker-compose.override.yml"
    fi
    
    # Build images
    echo -e "${BLUE}🔨 Building images...${NC}"
    if ! docker compose $compose_files build --parallel; then
        echo -e "${RED}❌ Build failed.${NC}"
        exit 1
    fi
    
    # Deploy with rolling update
    echo -e "${BLUE}📦 Deploying services...${NC}"
    
    # Deploy infrastructure services first (postgres, redis)
    docker compose $compose_files up -d postgres redis
    
    # Wait for infrastructure to be ready
    echo -e "${BLUE}⏳ Waiting for infrastructure services...${NC}"
    timeout=120
    elapsed=0
    while [ $elapsed -lt $timeout ]; do
        if docker compose $compose_files ps postgres | grep -q "healthy" && \
           docker compose $compose_files ps redis | grep -q "healthy"; then
            break
        fi
        sleep 5
        elapsed=$((elapsed + 5))
    done
    
    if [ $elapsed -ge $timeout ]; then
        echo -e "${RED}❌ Infrastructure services failed to start${NC}"
        docker compose $compose_files logs postgres redis
        exit 1
    fi
    
    # Deploy application services
    docker compose $compose_files up -d api hangfire
    
    # Wait for API to be healthy
    echo -e "${BLUE}⏳ Waiting for API service...${NC}"
    timeout=180
    elapsed=0
    while [ $elapsed -lt $timeout ]; do
        if docker compose $compose_files ps api | grep -q "healthy"; then
            break
        fi
        sleep 5
        elapsed=$((elapsed + 5))
    done
    
    if [ $elapsed -ge $timeout ]; then
        echo -e "${RED}❌ API service failed to start${NC}"
        docker compose $compose_files logs api
        exit 1
    fi
    
    # Deploy frontend last
    docker compose $compose_files up -d frontend
    
    echo -e "${GREEN}✅ Deployment completed${NC}"
}

# Function to run health checks
health_check() {
    echo -e "${BLUE}🏥 Running health checks...${NC}"
    
    compose_files="-f docker-compose.yml"
    if [ "$ENVIRONMENT" = "production" ]; then
        compose_files="$compose_files -f docker-compose.prod.yml"
    elif [ "$ENVIRONMENT" = "development" ]; then
        compose_files="$compose_files -f docker-compose.override.yml"
    fi
    
    # Check service status
    echo -e "${BLUE}📊 Service Status:${NC}"
    docker compose $compose_files ps
    
    # Check individual services
    services=("postgres" "redis" "api" "frontend")
    failed_services=()
    
    for service in "${services[@]}"; do
        if ! docker compose $compose_files ps "$service" | grep -q "Up"; then
            failed_services+=("$service")
        fi
    done
    
    if [ ${#failed_services[@]} -gt 0 ]; then
        echo -e "${RED}❌ Failed services: ${failed_services[*]}${NC}"
        return 1
    fi
    
    # Test API endpoint
    api_port=8080
    if [ "$ENVIRONMENT" = "development" ]; then
        api_port=5001
    fi
    
    if curl -f "http://localhost:$api_port/health" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ API health check passed${NC}"
    else
        echo -e "${RED}❌ API health check failed${NC}"
        return 1
    fi
    
    echo -e "${GREEN}✅ All health checks passed${NC}"
    return 0
}

# Function to show deployment info
show_info() {
    echo ""
    echo -e "${GREEN}🎉 Deployment to $ENVIRONMENT completed successfully!${NC}"
    echo ""
    
    if [ "$ENVIRONMENT" = "production" ]; then
        echo -e "${BLUE}Production URLs:${NC}"
        echo -e "  • ${GREEN}Frontend:${NC} http://localhost:3000"
        echo -e "  • ${GREEN}API:${NC} http://localhost:8080"
        echo -e "  • ${GREEN}Hangfire:${NC} http://localhost:8081/hangfire"
    elif [ "$ENVIRONMENT" = "staging" ]; then
        echo -e "${BLUE}Staging URLs:${NC}"
        echo -e "  • ${GREEN}Frontend:${NC} http://localhost:3000"
        echo -e "  • ${GREEN}API:${NC} http://localhost:8080"
        echo -e "  • ${GREEN}Hangfire:${NC} http://localhost:8081/hangfire"
    else
        echo -e "${BLUE}Development URLs:${NC}"
        echo -e "  • ${GREEN}Frontend:${NC} http://localhost:5173"
        echo -e "  • ${GREEN}API:${NC} http://localhost:5000"
        echo -e "  • ${GREEN}Hangfire:${NC} http://localhost:5002/hangfire"
    fi
    
    echo ""
    echo -e "${BLUE}Management Commands:${NC}"
    echo -e "  • ${YELLOW}View logs:${NC} docker compose logs -f [service]"
    echo -e "  • ${YELLOW}Scale service:${NC} docker compose up -d --scale api=3"
    echo -e "  • ${YELLOW}Update service:${NC} docker compose up -d --force-recreate [service]"
    echo -e "  • ${YELLOW}Stop deployment:${NC} docker compose down"
    
    if [ "$ENVIRONMENT" = "production" ]; then
        echo ""
        echo -e "${BLUE}🔒 Security Reminders:${NC}"
        echo -e "  • Update passwords regularly"
        echo -e "  • Monitor logs for suspicious activity" 
        echo -e "  • Keep Docker images updated"
        echo -e "  • Regular backups are created automatically"
    fi
}

# Main deployment flow
main() {
    check_prerequisites
    validate_config
    backup_data
    deploy
    
    # Give services time to fully start
    sleep 10
    
    if health_check; then
        show_info
    else
        echo -e "${RED}❌ Deployment completed but health checks failed${NC}"
        echo -e "${YELLOW}💡 Check logs with: docker compose logs${NC}"
        exit 1
    fi
}

# Show help
if [[ "$1" == "--help" || "$1" == "-h" ]]; then
    echo "Production Deployment Script for Intranet Starter"
    echo ""
    echo "Usage: $0 [ENVIRONMENT]"
    echo ""
    echo "Environments:"
    echo "  development    Deploy to development environment"
    echo "  staging        Deploy to staging environment (default)"
    echo "  production     Deploy to production environment"
    echo ""
    echo "Examples:"
    echo "  $0                    # Deploy to staging"
    echo "  $0 production         # Deploy to production"
    echo "  $0 development        # Deploy to development"
    echo ""
    echo "Prerequisites:"
    echo "  • Docker and Docker Compose installed"
    echo "  • Environment-specific .env file (.env.production, .env.staging)"
    echo "  • Sufficient disk space and memory"
    exit 0
fi

# Validate environment parameter
if [[ ! "$ENVIRONMENT" =~ ^(development|staging|production)$ ]]; then
    echo -e "${RED}❌ Invalid environment: $ENVIRONMENT${NC}"
    echo -e "${YELLOW}Valid environments: development, staging, production${NC}"
    exit 1
fi

# Run main deployment
main