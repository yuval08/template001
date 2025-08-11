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

# Show banner
show_banner() {
    echo -e "${CYAN}"
    echo "╔═══════════════════════════════════════════════════════════════════════════════╗"
    echo "║                      📊 INTRANET STARTER STATUS DASHBOARD 📊                ║"
    echo "╚═══════════════════════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

# Function to show help
show_help() {
    echo -e "${BLUE}Intranet Starter Status Dashboard${NC}"
    echo ""
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo -e "${YELLOW}Options:${NC}"
    echo "  --services, -s     Show service status only"
    echo "  --ports, -p        Show port configuration only"
    echo "  --urls, -u         Show service URLs only"
    echo "  --logs SERVICE     Show logs for specific service"
    echo "  --health, -h       Run health checks"
    echo "  --watch, -w        Watch mode (refresh every 5 seconds)"
    echo "  --help             Show this help message"
    echo ""
    echo -e "${YELLOW}Examples:${NC}"
    echo "  $0                 # Show full dashboard"
    echo "  $0 --services      # Show only service status"
    echo "  $0 --logs api      # Show API logs"
    echo "  $0 --watch         # Watch mode with live updates"
}

# Check if services are running
check_services_running() {
    docker compose ps -q &> /dev/null
}

# Get service status with colors
get_service_status() {
    echo -e "${BLUE}📊 Service Status:${NC}"
    
    if ! check_services_running; then
        echo -e "${RED}❌ No services are running${NC}"
        echo -e "${BLUE}💡 Run './scripts/dev-setup.sh' to start the development environment${NC}"
        return 1
    fi
    
    # Show detailed service status
    docker compose ps --format "table {{.Name}}\\t{{.Status}}\\t{{.Ports}}" 2>/dev/null || \
    docker compose ps
    
    # Count healthy services
    local healthy_count=0
    local total_count=0
    
    while read -r line; do
        if [[ $line == *"healthy"* ]]; then
            ((healthy_count++))
        fi
        if [[ $line == *"Up"* ]] || [[ $line == *"healthy"* ]]; then
            ((total_count++))
        fi
    done < <(docker compose ps 2>/dev/null | grep -E "(Up|healthy)" || echo "")
    
    echo
    if [ $healthy_count -gt 0 ]; then
        echo -e "${GREEN}✅ Healthy services: $healthy_count/$total_count${NC}"
    else
        echo -e "${YELLOW}⚠️  Services starting up or unhealthy${NC}"
    fi
}

# Show service URLs
show_service_urls() {
    local postgres_port=${POSTGRES_HOST_PORT:-5433}
    local redis_port=${REDIS_HOST_PORT:-6380}
    
    echo -e "${BLUE}🌐 Service URLs:${NC}"
    echo -e "  ${GREEN}┌─ Frontend (Dev):${NC}     http://localhost:5173"
    echo -e "  ${GREEN}├─ API:${NC}               http://localhost:5000"
    echo -e "  ${GREEN}├─ API Documentation:${NC} http://localhost:5000/swagger"
    echo -e "  ${GREEN}├─ Hangfire Dashboard:${NC} http://localhost:5002/hangfire"
    echo -e "  ${GREEN}├─ Database:${NC}          localhost:$postgres_port"
    echo -e "  ${GREEN}└─ Redis:${NC}             localhost:$redis_port"
}

# Show port configuration
show_port_config() {
    echo -e "${BLUE}🔌 Port Configuration:${NC}"
    
    # Source environment variables
    if [[ -f ".env" ]]; then
        source .env 2>/dev/null || true
    fi
    
    local postgres_port=${POSTGRES_HOST_PORT:-5433}
    local redis_port=${REDIS_HOST_PORT:-6380}
    
    # Function to check if port is in use
    check_port_status() {
        local port=$1
        if command -v lsof &> /dev/null; then
            lsof -i ":$port" &> /dev/null && echo -e "${GREEN}(active)${NC}" || echo -e "${RED}(inactive)${NC}"
        else
            echo -e "${BLUE}(unknown)${NC}"
        fi
    }
    
    echo -e "  Frontend (dev):  5173    $(check_port_status 5173)"
    echo -e "  API:             5001    $(check_port_status 5001)"
    echo -e "  Hangfire:        5002    $(check_port_status 5002)"
    echo -e "  PostgreSQL:      $postgres_port    $(check_port_status $postgres_port)"
    echo -e "  Redis:           $redis_port     $(check_port_status $redis_port)"
}

# Run health checks
run_health_checks() {
    echo -e "${BLUE}🏥 Health Checks:${NC}"
    
    if ! check_services_running; then
        echo -e "${RED}❌ Services not running${NC}"
        return 1
    fi
    
    local failed_checks=0
    
    # Database check
    echo -n -e "${BLUE}  PostgreSQL: ${NC}"
    if docker compose exec -T postgres pg_isready -U postgres &> /dev/null; then
        echo -e "${GREEN}✅ Ready${NC}"
    else
        echo -e "${RED}❌ Not ready${NC}"
        ((failed_checks++))
    fi
    
    # Redis check
    echo -n -e "${BLUE}  Redis: ${NC}"
    if docker compose exec -T redis redis-cli ping 2>/dev/null | grep -q "PONG"; then
        echo -e "${GREEN}✅ Ready${NC}"
    else
        echo -e "${RED}❌ Not ready${NC}"
        ((failed_checks++))
    fi
    
    # API check
    echo -n -e "${BLUE}  API Health: ${NC}"
    if timeout 5 curl -f "http://localhost:5000/health" &> /dev/null; then
        echo -e "${GREEN}✅ Responding${NC}"
    else
        echo -e "${RED}❌ Not responding${NC}"
        ((failed_checks++))
    fi
    
    # Frontend check
    echo -n -e "${BLUE}  Frontend: ${NC}"
    if timeout 5 curl -f "http://localhost:5173" &> /dev/null; then
        echo -e "${GREEN}✅ Accessible${NC}"
    else
        echo -e "${RED}❌ Not accessible${NC}"
        ((failed_checks++))
    fi
    
    echo
    if [ $failed_checks -eq 0 ]; then
        echo -e "${GREEN}🎉 All health checks passed!${NC}"
    else
        echo -e "${RED}❌ $failed_checks health checks failed${NC}"
    fi
}

# Show service logs
show_service_logs() {
    local service=$1
    if [ -z "$service" ]; then
        echo -e "${RED}❌ Service name required${NC}"
        echo -e "${BLUE}Available services: api, frontend, postgres, redis, hangfire${NC}"
        return 1
    fi
    
    echo -e "${BLUE}📋 Logs for service: $service${NC}"
    docker compose logs -f "$service"
}

# Quick management commands
show_quick_commands() {
    echo -e "${BLUE}🛠️  Quick Commands:${NC}"
    echo -e "  ${CYAN}Monitor logs:${NC}         docker compose logs -f [service-name]"
    echo -e "  ${CYAN}Restart service:${NC}     docker compose restart [service-name]"
    echo -e "  ${CYAN}Stop all:${NC}            docker compose down"
    echo -e "  ${CYAN}Full reset:${NC}          ./scripts/dev-setup.sh --reset"
    echo -e "  ${CYAN}Interactive setup:${NC}   ./scripts/dev-setup.sh --interactive"
}

# Watch mode - refresh every 5 seconds
watch_mode() {
    echo -e "${YELLOW}⏱️  Watch mode active - press Ctrl+C to exit${NC}"
    echo
    
    while true; do
        clear
        show_banner
        get_service_status
        echo
        run_health_checks
        echo
        show_service_urls
        echo
        echo -e "${YELLOW}📱 Refreshing in 5 seconds... (Ctrl+C to exit)${NC}"
        sleep 5
    done
}

# Main dashboard
show_full_dashboard() {
    show_banner
    get_service_status
    echo
    show_service_urls
    echo
    show_port_config
    echo
    show_quick_commands
}

# Parse arguments and execute
case "${1:-}" in
    --services|-s)
        get_service_status
        ;;
    --ports|-p)
        show_port_config
        ;;
    --urls|-u)
        show_service_urls
        ;;
    --health|-h)
        run_health_checks
        ;;
    --logs)
        show_service_logs "$2"
        ;;
    --watch|-w)
        watch_mode
        ;;
    --help)
        show_help
        ;;
    "")
        show_full_dashboard
        ;;
    *)
        echo -e "${RED}❌ Unknown option: $1${NC}"
        show_help
        exit 1
        ;;
esac