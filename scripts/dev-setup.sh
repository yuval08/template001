#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

# Global variables
SETUP_START_TIME=$(date +%s)
SETUP_MODE=""
VERBOSE=false
SKIP_HEALTH_CHECKS=false
QUICK_MODE=false
RESET_DATA=false

# Trap to handle script interruption
cleanup() {
    echo -e "${YELLOW}\\n🛑 Setup interrupted. Cleaning up...${NC}"
    docker compose down --remove-orphans 2>/dev/null || true
    exit 1
}
trap cleanup INT TERM

# Function to show banner
show_banner() {
    echo -e "${CYAN}"
    echo "╔═══════════════════════════════════════════════════════════════════════════════╗"
    echo "║                       🚀 INTRANET STARTER DEV SETUP 🚀                      ║"
    echo "║                        Ultimate Single-Command Experience                    ║"
    echo "╚═══════════════════════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

# Function to parse command line arguments
parse_arguments() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            --interactive|-i)
                SETUP_MODE="interactive"
                shift
                ;;
            --quick|-q)
                QUICK_MODE=true
                SETUP_MODE="quick"
                shift
                ;;
            --full|-f)
                SETUP_MODE="full"
                shift
                ;;
            --reset)
                RESET_DATA=true
                shift
                ;;
            --verbose|-v)
                VERBOSE=true
                shift
                ;;
            --skip-health-checks)
                SKIP_HEALTH_CHECKS=true
                shift
                ;;
            --help|-h)
                show_help
                exit 0
                ;;
            *)
                echo -e "${RED}❌ Unknown option: $1${NC}"
                show_help
                exit 1
                ;;
        esac
    done
}

# Function to show help
show_help() {
    echo -e "${BLUE}Intranet Starter Development Setup${NC}"
    echo ""
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo -e "${YELLOW}Setup Modes:${NC}"
    echo "  -i, --interactive     Interactive setup with guided options"
    echo "  -q, --quick          Quick setup with minimal prompts (default)"
    echo "  -f, --full           Full setup with all services and monitoring"
    echo ""
    echo -e "${YELLOW}Options:${NC}"
    echo "  --reset              Reset all data (remove volumes)"
    echo "  -v, --verbose        Verbose output for debugging"
    echo "  --skip-health-checks Skip comprehensive health checks"
    echo "  -h, --help           Show this help message"
    echo ""
    echo -e "${YELLOW}Examples:${NC}"
    echo "  $0                   # Quick setup (default)"
    echo "  $0 --interactive     # Interactive setup with options"
    echo "  $0 --full --verbose  # Full setup with verbose output"
    echo "  $0 --reset --quick   # Reset data and quick setup"
}

show_banner

# Enhanced prerequisite checking
check_prerequisites() {
    echo -e "${BLUE}🔍 Performing comprehensive system check...${NC}"
    
    local issues_found=0
    local warnings=0
    
    # Platform detection
    detect_platform
    
    # Docker checks
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}❌ Docker is not installed${NC}"
        show_docker_install_help
        ((issues_found++))
    else
        echo -e "${GREEN}✅ Docker installed: $(docker --version | cut -d' ' -f3 | tr -d ',')${NC}"
        
        # Check if Docker daemon is running
        if ! docker info &> /dev/null; then
            echo -e "${RED}❌ Docker daemon is not running${NC}"
            show_docker_start_help
            ((issues_found++))
        else
            echo -e "${GREEN}✅ Docker daemon running${NC}"
        fi
    fi
    
    # Docker Compose checks
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        echo -e "${RED}❌ Docker Compose is not available${NC}"
        show_compose_install_help
        ((issues_found++))
    else
        local compose_version=""
        if docker compose version &> /dev/null; then
            compose_version=$(docker compose version --short 2>/dev/null || echo "v2.x")
        elif command -v docker-compose &> /dev/null; then
            compose_version=$(docker-compose --version | cut -d' ' -f3 | tr -d ',')
        fi
        echo -e "${GREEN}✅ Docker Compose available: $compose_version${NC}"
    fi
    
    # System resource checks
    check_system_resources
    
    # Network connectivity
    check_network_connectivity
    
    # Development tools (optional but helpful)
    check_optional_tools
    
    if [ $issues_found -gt 0 ]; then
        echo -e "${RED}❌ Found $issues_found critical issues. Please resolve them before continuing.${NC}"
        exit 1
    fi
    
    if [ $warnings -gt 0 ]; then
        echo -e "${YELLOW}⚠️  Found $warnings warnings. Setup will continue but performance may be affected.${NC}"
        if [ "$SETUP_MODE" = "interactive" ]; then
            read -p "Continue anyway? (y/N): " -n 1 -r
            echo
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                exit 1
            fi
        fi
    fi
    
    echo -e "${GREEN}🎉 System check completed successfully!${NC}"
}

# Platform detection
detect_platform() {
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        PLATFORM="linux"
        if command -v lsb_release &> /dev/null; then
            DISTRO=$(lsb_release -si)
            echo -e "${BLUE}📱 Platform: Linux ($DISTRO)${NC}"
        else
            echo -e "${BLUE}📱 Platform: Linux${NC}"
        fi
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        PLATFORM="macos"
        echo -e "${BLUE}📱 Platform: macOS$(sw_vers -productVersion 2>/dev/null)${NC}"
    elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
        PLATFORM="windows"
        echo -e "${BLUE}📱 Platform: Windows${NC}"
    else
        PLATFORM="unknown"
        echo -e "${YELLOW}📱 Platform: Unknown ($OSTYPE)${NC}"
    fi
}

# System resource checks
check_system_resources() {
    # Memory check
    if command -v free &> /dev/null; then
        local mem_gb=$(free -g | awk 'NR==2{print $2}')
        if [ "$mem_gb" -lt 4 ]; then
            echo -e "${YELLOW}⚠️  RAM: ${mem_gb}GB (recommended: 4GB+)${NC}"
            ((warnings++))
        else
            echo -e "${GREEN}✅ RAM: ${mem_gb}GB${NC}"
        fi
    elif [[ "$PLATFORM" == "macos" ]]; then
        local mem_bytes=$(sysctl -n hw.memsize)
        local mem_gb=$((mem_bytes / 1024 / 1024 / 1024))
        if [ "$mem_gb" -lt 4 ]; then
            echo -e "${YELLOW}⚠️  RAM: ${mem_gb}GB (recommended: 4GB+)${NC}"
            ((warnings++))
        else
            echo -e "${GREEN}✅ RAM: ${mem_gb}GB${NC}"
        fi
    fi
    
    # Disk space check
    if command -v df &> /dev/null; then
        local available_space=$(df . | tail -1 | awk '{print $4}')
        local space_gb=$((available_space / 1024 / 1024))
        if [ $available_space -lt 2097152 ]; then  # 2GB in KB
            echo -e "${YELLOW}⚠️  Disk space: ${space_gb}GB (recommended: 2GB+)${NC}"
            ((warnings++))
        else
            echo -e "${GREEN}✅ Disk space: ${space_gb}GB available${NC}"
        fi
    fi
}

# Network connectivity check
check_network_connectivity() {
    echo -e "${BLUE}🌐 Checking network connectivity...${NC}"
    
    # Test Docker Hub connectivity
    if timeout 10 docker pull hello-world:latest &> /dev/null; then
        echo -e "${GREEN}✅ Docker Hub accessible${NC}"
        docker rmi hello-world:latest &> /dev/null || true
    else
        echo -e "${YELLOW}⚠️  Docker Hub connectivity issues (may affect image pulls)${NC}"
        ((warnings++))
    fi
}

# Check optional development tools
check_optional_tools() {
    local tools_status=""
    
    # Git
    if command -v git &> /dev/null; then
        tools_status+="${GREEN}Git ✅${NC} "
    else
        tools_status+="${YELLOW}Git ❌${NC} "
    fi
    
    # Node.js (for local frontend development)
    if command -v node &> /dev/null; then
        local node_version=$(node --version)
        tools_status+="${GREEN}Node.js $node_version ✅${NC} "
    else
        tools_status+="${YELLOW}Node.js ❌${NC} "
    fi
    
    # .NET SDK (for local backend development)
    if command -v dotnet &> /dev/null; then
        local dotnet_version=$(dotnet --version)
        tools_status+="${GREEN}.NET $dotnet_version ✅${NC} "
    else
        tools_status+="${YELLOW}.NET SDK ❌${NC} "
    fi
    
    # curl
    if command -v curl &> /dev/null; then
        tools_status+="${GREEN}curl ✅${NC} "
    else
        tools_status+="${YELLOW}curl ❌${NC} "
    fi
    
    # jq
    if command -v jq &> /dev/null; then
        tools_status+="${GREEN}jq ✅${NC} "
    else
        tools_status+="${YELLOW}jq ❌${NC} "
    fi
    
    echo -e "${BLUE}🛠️  Development tools: $tools_status${NC}"
}

# Help functions for installation guidance
show_docker_install_help() {
    echo -e "${BLUE}💡 To install Docker:${NC}"
    case $PLATFORM in
        "linux")
            echo "  Ubuntu/Debian: curl -fsSL https://get.docker.com -o get-docker.sh && sh get-docker.sh"
            echo "  Or visit: https://docs.docker.com/engine/install/"
            ;;
        "macos")
            echo "  Download Docker Desktop: https://docs.docker.com/desktop/install/mac-install/"
            echo "  Or via Homebrew: brew install --cask docker"
            ;;
        "windows")
            echo "  Download Docker Desktop: https://docs.docker.com/desktop/install/windows-install/"
            ;;
        *)
            echo "  Visit: https://docs.docker.com/get-docker/"
            ;;
    esac
}

show_docker_start_help() {
    echo -e "${BLUE}💡 To start Docker:${NC}"
    case $PLATFORM in
        "linux")
            echo "  sudo systemctl start docker"
            echo "  sudo systemctl enable docker"
            ;;
        "macos"|"windows")
            echo "  Start Docker Desktop application"
            ;;
        *)
            echo "  Please start the Docker daemon for your system"
            ;;
    esac
}

show_compose_install_help() {
    echo -e "${BLUE}💡 Docker Compose installation:${NC}"
    echo "  Modern Docker installations include Compose V2"
    echo "  Try: docker compose version"
    echo "  Or install separately: https://docs.docker.com/compose/install/"
}

# Interactive mode for setup customization
interactive_setup() {
    echo -e "${CYAN}"
    echo "╔═══════════════════════════════════════════════════════════════════════════════╗"
    echo "║                            🛠️  INTERACTIVE SETUP 🛠️                         ║"
    echo "╚═══════════════════════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    
    # Setup mode selection
    echo -e "${BLUE}📝 Choose your development setup:${NC}"
    echo "  1) 🚀 Quick Start (default services only)"
    echo "  2) 🔧 Full Development (all services + monitoring)"
    echo "  3) 🎯 Custom Setup (choose specific services)"
    echo
    
    while true; do
        read -p "Select option (1-3) [1]: " setup_choice
        setup_choice=${setup_choice:-1}
        
        case $setup_choice in
            1)
                SETUP_MODE="quick"
                echo -e "${GREEN}✅ Quick Start selected${NC}"
                break
                ;;
            2)
                SETUP_MODE="full"
                echo -e "${GREEN}✅ Full Development selected${NC}"
                break
                ;;
            3)
                SETUP_MODE="custom"
                echo -e "${GREEN}✅ Custom Setup selected${NC}"
                custom_service_selection
                break
                ;;
            *)
                echo -e "${RED}❌ Invalid selection. Please choose 1-3.${NC}"
                ;;
        esac
    done
    
    # Data reset option
    echo
    echo -e "${BLUE}🗃️  Database and volumes:${NC}"
    read -p "Reset all data (remove existing volumes)? [y/N]: " -n 1 -r reset_choice
    echo
    if [[ $reset_choice =~ ^[Yy]$ ]]; then
        RESET_DATA=true
        echo -e "${GREEN}✅ Will reset all data${NC}"
    else
        echo -e "${GREEN}✅ Will preserve existing data${NC}"
    fi
    
    # Environment configuration
    echo
    echo -e "${BLUE}⚙️  Environment configuration:${NC}"
    configure_environment_interactive
    
    # Final confirmation
    echo
    echo -e "${CYAN}📋 Setup Summary:${NC}"
    echo "  Mode: $SETUP_MODE"
    echo "  Reset data: $([ "$RESET_DATA" = true ] && echo "Yes" || echo "No")"
    echo "  Platform: $PLATFORM"
    echo
    
    read -p "Proceed with setup? [Y/n]: " -n 1 -r confirm
    echo
    if [[ $confirm =~ ^[Nn]$ ]]; then
        echo -e "${YELLOW}Setup cancelled${NC}"
        exit 0
    fi
}

# Custom service selection for advanced users
custom_service_selection() {
    echo -e "${BLUE}🎯 Select services to include:${NC}"
    
    # Core services (always included)
    echo -e "${GREEN}✅ Core services (postgres, redis, api, frontend)${NC}"
    
    # Optional services
    echo
    read -p "Include Hangfire dashboard? [Y/n]: " -n 1 -r hangfire_choice
    echo
    INCLUDE_HANGFIRE=$([ "$hangfire_choice" != "n" ] && [ "$hangfire_choice" != "N" ] && echo "true" || echo "false")
    
    read -p "Include monitoring (Prometheus/Grafana)? [y/N]: " -n 1 -r monitoring_choice
    echo
    INCLUDE_MONITORING=$([ "$monitoring_choice" = "y" ] || [ "$monitoring_choice" = "Y" ] && echo "true" || echo "false")
    
    echo -e "${GREEN}✅ Service selection completed${NC}"
}

# Interactive environment configuration
configure_environment_interactive() {
    echo -e "${BLUE}🔧 Configure environment settings:${NC}"
    
    # Admin email
    local current_admin=$(grep "ADMIN_EMAIL=" .env.development 2>/dev/null | cut -d'=' -f2 || echo "admin@localhost.com")
    read -p "Admin email [$current_admin]: " admin_email
    admin_email=${admin_email:-$current_admin}
    
    # Allowed domain
    local current_domain=$(grep "ALLOWED_DOMAIN=" .env.development 2>/dev/null | cut -d'=' -f2 || echo "localhost.com")
    read -p "Allowed domain [$current_domain]: " allowed_domain
    allowed_domain=${allowed_domain:-$current_domain}
    
    # Store for later use
    ADMIN_EMAIL_OVERRIDE=$admin_email
    ALLOWED_DOMAIN_OVERRIDE=$allowed_domain
    
    echo -e "${GREEN}✅ Environment configured${NC}"
}

# Main setup coordination
main_setup() {
    # Parse command line arguments
    parse_arguments "$@"
    
    # Set default mode if not specified
    if [ -z "$SETUP_MODE" ]; then
        SETUP_MODE="quick"
    fi
    
    # Run interactive setup if requested
    if [ "$SETUP_MODE" = "interactive" ]; then
        interactive_setup
    fi
    
    # Run system checks
    check_prerequisites
    
    # Configure ports and environment
    configure_ports_and_environment
    
    # Reset data if requested
    if [ "$RESET_DATA" = true ]; then
        reset_development_data
    fi
    
    # Build and start services
    build_and_start_services
    
    # Run comprehensive health checks
    if [ "$SKIP_HEALTH_CHECKS" != true ]; then
        comprehensive_health_checks
    fi
    
    # Show final status dashboard
    show_status_dashboard
    
    # Calculate and show setup time
    local setup_end_time=$(date +%s)
    local setup_duration=$((setup_end_time - SETUP_START_TIME))
    echo -e "${MAGENTA}⏱️  Total setup time: ${setup_duration}s${NC}"
}

# Enhanced port and environment configuration
configure_ports_and_environment() {
    echo -e "${BLUE}🔧 Configuring ports and environment...${NC}"
    
    # Run port management
    if [[ -f "./scripts/port-manager.sh" ]]; then
        ./scripts/port-manager.sh
    else
        echo -e "${YELLOW}⚠️  Port manager not found, using default port configuration${NC}"
    fi
    
    # Create/update environment file
    create_environment_file
    
    # Create necessary directories
    create_directories
}

# Create and configure environment file
create_environment_file() {
    local env_file=".env"
    
    if [[ ! -f "$env_file" ]]; then
        echo -e "${BLUE}📝 Creating .env file from template...${NC}"
        cp .env.development "$env_file"
    fi
    
    # Apply any overrides from interactive setup
    if [ -n "$ADMIN_EMAIL_OVERRIDE" ]; then
        if grep -q "ADMIN_EMAIL=" "$env_file"; then
            sed -i "s/ADMIN_EMAIL=.*/ADMIN_EMAIL=$ADMIN_EMAIL_OVERRIDE/" "$env_file"
        else
            echo "ADMIN_EMAIL=$ADMIN_EMAIL_OVERRIDE" >> "$env_file"
        fi
    fi
    
    if [ -n "$ALLOWED_DOMAIN_OVERRIDE" ]; then
        if grep -q "ALLOWED_DOMAIN=" "$env_file"; then
            sed -i "s/ALLOWED_DOMAIN=.*/ALLOWED_DOMAIN=$ALLOWED_DOMAIN_OVERRIDE/" "$env_file"
        else
            echo "ALLOWED_DOMAIN=$ALLOWED_DOMAIN_OVERRIDE" >> "$env_file"
        fi
    fi
    
    echo -e "${GREEN}✅ Environment file configured${NC}"
}

# Create necessary directories
create_directories() {
    echo -e "${BLUE}📁 Creating required directories...${NC}"
    mkdir -p logs uploads
    
    if [[ "$OSTYPE" != "msys" ]]; then  # Not Windows
        chmod 755 logs uploads 2>/dev/null || true
        chown $(whoami):$(whoami) logs uploads 2>/dev/null || true
    fi
    
    echo -e "${GREEN}✅ Directories created${NC}"
}

# Reset development data
reset_development_data() {
    echo -e "${BLUE}🗑️  Resetting development data...${NC}"
    
    # Stop services first
    docker compose down --remove-orphans &> /dev/null || true
    
    # Remove volumes
    echo -e "${YELLOW}  Removing Docker volumes...${NC}"
    docker compose down -v &> /dev/null || true
    
    # Clean up dangling images and containers
    echo -e "${YELLOW}  Cleaning up Docker resources...${NC}"
    docker system prune -f &> /dev/null || true
    
    echo -e "${GREEN}✅ Development data reset${NC}"
}

# Enhanced build and start services
build_and_start_services() {
    echo -e "${BLUE}🏗️  Building and starting services...${NC}"
    
    # Pull base images first
    pull_base_images
    
    # Build services based on selected mode
    build_services
    
    # Start services
    start_services
    
    # Wait for services to be ready
    wait_for_services
}

# Pull required Docker images
pull_base_images() {
    if [ "$QUICK_MODE" != true ]; then
        echo -e "${BLUE}📥 Pulling base Docker images...${NC}"
        
        local images=(
            "postgres:16-alpine"
            "redis:7-alpine"
            "mcr.microsoft.com/dotnet/sdk:9.0"
            "mcr.microsoft.com/dotnet/aspnet:9.0"
            "node:20-alpine"
            "nginx:alpine"
        )
        
        for image in "${images[@]}"; do
            if [ "$VERBOSE" = true ]; then
                echo -e "  ${BLUE}Pulling ${image}...${NC}"
            fi
            
            if ! docker pull "$image" &> /dev/null; then
                echo -e "${YELLOW}⚠️  Failed to pull $image, will use cached version${NC}"
            fi
        done
        
        echo -e "${GREEN}✅ Base images ready${NC}"
    fi
}

# Build Docker services
build_services() {
    echo -e "${BLUE}🔨 Building services...${NC}"
    
    local build_args=""
    if [ "$VERBOSE" = true ]; then
        build_args="--progress=plain"
    fi
    
    if [ "$QUICK_MODE" = true ]; then
        # Quick build - parallel and use cache aggressively
        if ! docker compose build --parallel $build_args &> /dev/null; then
            echo -e "${YELLOW}⚠️  Quick build failed, trying standard build...${NC}"
            docker compose build $build_args
        fi
    else
        # Standard build
        if ! docker compose build --parallel $build_args; then
            echo -e "${RED}❌ Build failed. Trying without cache...${NC}"
            if ! docker compose build --no-cache $build_args; then
                echo -e "${RED}❌ Build failed completely. Please check the logs above.${NC}"
                exit 1
            fi
        fi
    fi
    
    echo -e "${GREEN}✅ Services built successfully${NC}"
}

# Start services
start_services() {
    echo -e "${BLUE}🚀 Starting services...${NC}"
    
    # Clean up any previous containers
    docker compose down --remove-orphans &> /dev/null || true
    
    # Start services
    if ! docker compose up -d; then
        echo -e "${RED}❌ Failed to start services${NC}"
        echo -e "${BLUE}📋 Container status:${NC}"
        docker compose ps
        echo -e "${BLUE}📋 Recent logs:${NC}"
        docker compose logs --tail=20
        
        echo -e "${BLUE}💡 Troubleshooting steps:${NC}"
        echo "  1. Check if ports are already in use: ./scripts/port-manager.sh --check-only"
        echo "  2. Try resetting: $0 --reset"
        echo "  3. View detailed logs: docker compose logs [service-name]"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Services started${NC}"
}

# Enhanced service waiting with better feedback
wait_for_services() {
    echo -e "${BLUE}⏳ Waiting for services to be ready...${NC}"
    
    local timeout=300
    local elapsed=0
    local check_interval=5
    local last_status_check=0
    
    # Progress indicator
    local spinner=('⠋' '⠙' '⠹' '⠸' '⠼' '⠴' '⠦' '⠧')
    local spinner_idx=0
    
    while [ $elapsed -lt $timeout ]; do
        # Check service health
        local healthy_services=0
        local total_services=0
        local service_status=""
        
        # Get service information
        while read -r line; do
            if [[ $line == *"healthy"* ]]; then
                ((healthy_services++))
            fi
            if [[ $line == *"Up"* ]] || [[ $line == *"healthy"* ]]; then
                ((total_services++))
            fi
        done < <(docker compose ps 2>/dev/null | grep -E "(Up|healthy)" || echo "")
        
        # Check if core services are ready (postgres, redis at minimum)
        if [ $healthy_services -ge 2 ] && [ $total_services -ge 4 ]; then
            echo -e "\\r${GREEN}✅ All services are ready!${NC}                    "
            break
        fi
        
        # Show spinner and status
        printf "\\r${YELLOW}${spinner[$spinner_idx]} Waiting for services... (%ds/%ds) - Ready: %d/%d${NC}" \
               $elapsed $timeout $healthy_services $total_services
        
        # Show detailed status every 30 seconds
        if [ $((elapsed - last_status_check)) -ge 30 ] && [ $elapsed -gt 0 ]; then
            echo
            echo -e "${BLUE}📊 Service Status:${NC}"
            docker compose ps --format "table {{.Name}}\\t{{.Status}}\\t{{.Ports}}" 2>/dev/null || \
            docker compose ps
            last_status_check=$elapsed
        fi
        
        sleep $check_interval
        elapsed=$((elapsed + check_interval))
        spinner_idx=$(((spinner_idx + 1) % ${#spinner[@]}))
    done
    
    if [ $elapsed -ge $timeout ]; then
        echo -e "\\r${RED}❌ Timeout waiting for services (${timeout}s)${NC}                    "
        echo -e "${BLUE}📊 Final service status:${NC}"
        docker compose ps
        echo -e "${BLUE}📋 Service logs (last 50 lines):${NC}"
        docker compose logs --tail=50
        
        echo -e "${BLUE}💡 Recovery suggestions:${NC}"
        echo "  1. Check service logs: docker compose logs [service-name]"
        echo "  2. Restart specific service: docker compose restart [service-name]"
        echo "  3. Reset and try again: $0 --reset"
        exit 1
    fi
    
    echo
}

# Comprehensive health checks
comprehensive_health_checks() {
    echo -e "${BLUE}🏥 Running comprehensive health checks...${NC}"
    
    local failed_checks=0
    
    # Database connectivity
    echo -e "${BLUE}  Checking database connection...${NC}"
    if docker compose exec -T postgres pg_isready -U postgres &> /dev/null; then
        echo -e "${GREEN}  ✅ PostgreSQL is ready${NC}"
    else
        echo -e "${RED}  ❌ PostgreSQL connection failed${NC}"
        ((failed_checks++))
    fi
    
    # Redis connectivity
    echo -e "${BLUE}  Checking Redis connection...${NC}"
    if docker compose exec -T redis redis-cli ping | grep -q "PONG"; then
        echo -e "${GREEN}  ✅ Redis is responding${NC}"
    else
        echo -e "${RED}  ❌ Redis connection failed${NC}"
        ((failed_checks++))
    fi
    
    # API health endpoint
    echo -e "${BLUE}  Checking API health...${NC}"
    local api_url="http://localhost:5001"
    if timeout 10 curl -f "$api_url/health" &> /dev/null; then
        echo -e "${GREEN}  ✅ API health endpoint responding${NC}"
    else
        echo -e "${RED}  ❌ API health check failed${NC}"
        ((failed_checks++))
    fi
    
    # Frontend accessibility
    echo -e "${BLUE}  Checking Frontend accessibility...${NC}"
    local frontend_url="http://localhost:5173"
    if timeout 10 curl -f "$frontend_url" &> /dev/null; then
        echo -e "${GREEN}  ✅ Frontend is accessible${NC}"
    else
        echo -e "${RED}  ❌ Frontend accessibility failed${NC}"
        ((failed_checks++))
    fi
    
    # Database migration status
    echo -e "${BLUE}  Checking database schema...${NC}"
    if docker compose exec -T postgres psql -U postgres -d intranet_starter_dev -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public';" | grep -q "[1-9]"; then
        echo -e "${GREEN}  ✅ Database schema is populated${NC}"
    else
        echo -e "${YELLOW}  ⚠️  Database schema may not be fully migrated${NC}"
    fi
    
    if [ $failed_checks -gt 0 ]; then
        echo -e "${RED}❌ Health checks failed: $failed_checks issues found${NC}"
        echo -e "${BLUE}💡 Try running detailed logs: docker compose logs${NC}"
        
        if [ "$SETUP_MODE" = "interactive" ]; then
            read -p "Continue despite health check failures? [y/N]: " -n 1 -r continue_choice
            echo
            if [[ ! $continue_choice =~ ^[Yy]$ ]]; then
                exit 1
            fi
        fi
    else
        echo -e "${GREEN}🎉 All health checks passed!${NC}"
    fi
}

# Enhanced status dashboard
show_status_dashboard() {
    echo -e "${CYAN}"
    echo "╔═══════════════════════════════════════════════════════════════════════════════╗"
    echo "║                        🎉 DEVELOPMENT ENVIRONMENT READY! 🎉                  ║"
    echo "╚═══════════════════════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    
    # Get actual ports from environment
    local postgres_port=${POSTGRES_HOST_PORT:-5433}
    local redis_port=${REDIS_HOST_PORT:-6380}
    
    # Service URLs section
    echo -e "${BLUE}🌐 Service URLs:${NC}"
    echo -e "  ${GREEN}┌─ Frontend (Dev):${NC}     http://localhost:5173"
    echo -e "  ${GREEN}├─ API:${NC}               http://localhost:5001"
    echo -e "  ${GREEN}├─ API Documentation:${NC} http://localhost:5001/swagger"
    echo -e "  ${GREEN}├─ Hangfire Dashboard:${NC} http://localhost:5002/hangfire"
    echo -e "  ${GREEN}├─ Database:${NC}          localhost:$postgres_port (user: postgres, password: postgres)"
    echo -e "  ${GREEN}└─ Redis:${NC}             localhost:$redis_port"
    
    # Service status section
    echo
    echo -e "${BLUE}📊 Service Status:${NC}"
    docker compose ps --format "table {{.Name}}\\t{{.Status}}\\t{{.Ports}}" 2>/dev/null || \
    docker compose ps --format table
    
    # Quick commands section
    echo
    echo -e "${BLUE}🛠️  Quick Commands:${NC}"
    echo -e "  ${CYAN}Monitor logs:${NC}         docker compose logs -f [service-name]"
    echo -e "  ${CYAN}Restart service:${NC}     docker compose restart [service-name]"
    echo -e "  ${CYAN}Stop all:${NC}            docker compose down"
    echo -e "  ${CYAN}View status:${NC}         docker compose ps"
    echo -e "  ${CYAN}Database shell:${NC}      docker compose exec postgres psql -U postgres intranet_starter_dev"
    echo -e "  ${CYAN}Redis CLI:${NC}           docker compose exec redis redis-cli"
    
    # Development workflow section
    echo
    echo -e "${BLUE}🚀 Development Workflow:${NC}"
    echo -e "  ${YELLOW}Backend (.NET):${NC}      cd backend && dotnet run"
    echo -e "  ${YELLOW}Frontend (React):${NC}    cd frontend && npm run dev"
    echo -e "  ${YELLOW}Run tests:${NC}           cd backend && dotnet test"
    echo -e "  ${YELLOW}Database migration:${NC}  cd backend/Api && dotnet ef database update"
    
    # Troubleshooting section
    echo
    echo -e "${BLUE}🔧 Troubleshooting:${NC}"
    echo -e "  ${RED}Port conflicts:${NC}       ./scripts/port-manager.sh && docker compose up -d"
    echo -e "  ${RED}Reset database:${NC}       docker compose down -v && docker compose up -d"
    echo -e "  ${RED}Clean restart:${NC}        $0 --reset"
    echo -e "  ${RED}Detailed setup:${NC}       $0 --interactive --verbose"
    
    # System information
    echo
    echo -e "${BLUE}ℹ️  System Information:${NC}"
    echo -e "  Platform: $PLATFORM"
    echo -e "  Setup Mode: $SETUP_MODE"
    echo -e "  Docker Compose: $(docker compose version --short 2>/dev/null || echo "v1.x")"
    
    # Success message
    echo
    echo -e "${GREEN}✨ Your development environment is ready for coding! ✨${NC}"
    echo -e "${BLUE}💡 Open http://localhost:5173 in your browser to get started${NC}"
}

# Start the main setup process
main_setup "$@"