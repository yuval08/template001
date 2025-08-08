#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Show banner
show_banner() {
    echo -e "${CYAN}"
    echo "╔═══════════════════════════════════════════════════════════════════════════════╗"
    echo "║                        🧰 DEVELOPMENT TOOLS & UTILITIES 🧰                   ║"
    echo "╚═══════════════════════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

# Function to show help
show_help() {
    echo -e "${BLUE}Development Tools & Utilities${NC}"
    echo ""
    echo "Usage: $0 <command> [options]"
    echo ""
    echo -e "${YELLOW}Available Commands:${NC}"
    echo ""
    echo -e "${CYAN}Database Commands:${NC}"
    echo "  db-shell              Open PostgreSQL shell"
    echo "  db-reset              Reset database (remove all data)"
    echo "  db-migrate            Run database migrations"
    echo "  db-seed               Run database seeding"
    echo "  db-backup [file]      Create database backup"
    echo "  db-restore <file>     Restore database from backup"
    echo ""
    echo -e "${CYAN}Service Management:${NC}"
    echo "  restart <service>     Restart specific service"
    echo "  logs <service>        Show logs for service (with follow)"
    echo "  shell <service>       Open shell in service container"
    echo "  rebuild [service]     Rebuild and restart service(s)"
    echo ""
    echo -e "${CYAN}Development Utilities:${NC}"
    echo "  test [project]        Run tests (backend by default)"
    echo "  lint                  Run linting on frontend"
    echo "  build                 Build all services"
    echo "  clean                 Clean Docker resources"
    echo "  ports                 Check and manage port conflicts"
    echo ""
    echo -e "${CYAN}Quick Actions:${NC}"
    echo "  fresh                 Fresh start (reset + setup)"
    echo "  status                Show development status"
    echo "  open                  Open all service URLs in browser"
    echo ""
    echo -e "${YELLOW}Examples:${NC}"
    echo "  $0 db-shell           # Open database shell"
    echo "  $0 logs api           # Show API logs"
    echo "  $0 restart frontend   # Restart frontend service"
    echo "  $0 test Unit          # Run unit tests"
}

# Check if services are running
check_services() {
    if ! docker compose ps -q &> /dev/null; then
        echo -e "${RED}❌ Services not running. Start with: ./scripts/dev-setup.sh${NC}"
        exit 1
    fi
}

# Database shell
db_shell() {
    check_services
    echo -e "${BLUE}🐘 Opening PostgreSQL shell...${NC}"
    docker compose exec postgres psql -U postgres -d intranet_starter_dev
}

# Database reset
db_reset() {
    echo -e "${YELLOW}⚠️  This will delete ALL database data. Are you sure?${NC}"
    read -p "Type 'yes' to confirm: " -r
    if [[ $REPLY == "yes" ]]; then
        echo -e "${BLUE}🗑️  Resetting database...${NC}"
        docker compose stop api hangfire
        docker compose exec postgres psql -U postgres -c "DROP DATABASE IF EXISTS intranet_starter_dev;"
        docker compose exec postgres psql -U postgres -c "CREATE DATABASE intranet_starter_dev;"
        docker compose start api hangfire
        echo -e "${GREEN}✅ Database reset complete${NC}"
    else
        echo -e "${YELLOW}Database reset cancelled${NC}"
    fi
}

# Database migrations
db_migrate() {
    check_services
    echo -e "${BLUE}🔄 Running database migrations...${NC}"
    docker compose exec api dotnet ef database update
    echo -e "${GREEN}✅ Migrations complete${NC}"
}

# Database seeding
db_seed() {
    check_services
    echo -e "${BLUE}🌱 Seeding database...${NC}"
    # Note: Seeding happens automatically on startup, but we can restart API to trigger it
    docker compose restart api
    echo -e "${GREEN}✅ Database seeding triggered${NC}"
}

# Database backup
db_backup() {
    local backup_file=${1:-"backup_$(date +%Y%m%d_%H%M%S).sql"}
    check_services
    echo -e "${BLUE}💾 Creating database backup: $backup_file${NC}"
    docker compose exec -T postgres pg_dump -U postgres -d intranet_starter_dev > "$backup_file"
    echo -e "${GREEN}✅ Backup saved: $backup_file${NC}"
}

# Database restore
db_restore() {
    local backup_file=$1
    if [[ -z "$backup_file" || ! -f "$backup_file" ]]; then
        echo -e "${RED}❌ Backup file required and must exist${NC}"
        exit 1
    fi
    
    check_services
    echo -e "${BLUE}📥 Restoring database from: $backup_file${NC}"
    docker compose exec -T postgres psql -U postgres -d intranet_starter_dev < "$backup_file"
    echo -e "${GREEN}✅ Database restored${NC}"
}

# Restart service
restart_service() {
    local service=$1
    if [[ -z "$service" ]]; then
        echo -e "${RED}❌ Service name required${NC}"
        echo -e "${BLUE}Available: api, frontend, postgres, redis, hangfire${NC}"
        exit 1
    fi
    
    echo -e "${BLUE}🔄 Restarting $service...${NC}"
    docker compose restart "$service"
    echo -e "${GREEN}✅ $service restarted${NC}"
}

# Show logs
show_logs() {
    local service=$1
    if [[ -z "$service" ]]; then
        echo -e "${RED}❌ Service name required${NC}"
        echo -e "${BLUE}Available: api, frontend, postgres, redis, hangfire${NC}"
        exit 1
    fi
    
    check_services
    echo -e "${BLUE}📋 Following logs for $service (Ctrl+C to exit)...${NC}"
    docker compose logs -f "$service"
}

# Open shell in service
open_shell() {
    local service=$1
    if [[ -z "$service" ]]; then
        echo -e "${RED}❌ Service name required${NC}"
        echo -e "${BLUE}Available: api, frontend, postgres, redis${NC}"
        exit 1
    fi
    
    check_services
    echo -e "${BLUE}💻 Opening shell in $service...${NC}"
    
    case $service in
        postgres)
            docker compose exec postgres sh
            ;;
        redis)
            docker compose exec redis sh
            ;;
        api|hangfire)
            docker compose exec "$service" bash
            ;;
        frontend)
            docker compose exec frontend sh
            ;;
        *)
            docker compose exec "$service" sh
            ;;
    esac
}

# Rebuild service
rebuild_service() {
    local service=${1:-}
    
    if [[ -n "$service" ]]; then
        echo -e "${BLUE}🔨 Rebuilding $service...${NC}"
        docker compose build "$service"
        docker compose up -d "$service"
    else
        echo -e "${BLUE}🔨 Rebuilding all services...${NC}"
        docker compose build
        docker compose up -d
    fi
    
    echo -e "${GREEN}✅ Rebuild complete${NC}"
}

# Run tests
run_tests() {
    local project=${1:-}
    
    echo -e "${BLUE}🧪 Running tests...${NC}"
    
    if [[ -n "$project" ]]; then
        # Run specific test project
        (cd backend && dotnet test "Tests.$project/Tests.$project.csproj")
    else
        # Run all tests
        (cd backend && dotnet test)
    fi
}

# Run linting
run_lint() {
    echo -e "${BLUE}🔍 Running frontend linting...${NC}"
    (cd frontend && npm run lint)
}

# Build all services
build_services() {
    echo -e "${BLUE}🏗️  Building all services...${NC}"
    docker compose build
    echo -e "${GREEN}✅ Build complete${NC}"
}

# Clean Docker resources
clean_docker() {
    echo -e "${BLUE}🧹 Cleaning Docker resources...${NC}"
    docker compose down --remove-orphans
    docker system prune -f
    docker volume prune -f
    echo -e "${GREEN}✅ Cleanup complete${NC}"
}

# Check ports
check_ports() {
    echo -e "${BLUE}🔌 Checking port configuration...${NC}"
    ./scripts/port-manager.sh --check-only
}

# Fresh start
fresh_start() {
    echo -e "${BLUE}🌅 Starting fresh development environment...${NC}"
    ./scripts/dev-setup.sh --reset
}

# Show status
show_status() {
    ./scripts/dev-status.sh
}

# Open URLs in browser
open_urls() {
    echo -e "${BLUE}🌐 Opening service URLs...${NC}"
    
    # Detect platform and open URLs
    case "$(uname -s)" in
        Darwin)  # macOS
            open "http://localhost:5173" &  # Frontend
            open "http://localhost:5001/swagger" &  # API Docs
            ;;
        Linux)
            if command -v xdg-open &> /dev/null; then
                xdg-open "http://localhost:5173" &
                xdg-open "http://localhost:5001/swagger" &
            else
                echo -e "${YELLOW}⚠️  xdg-open not available. Please manually open:${NC}"
                echo "  Frontend: http://localhost:5173"
                echo "  API Docs: http://localhost:5001/swagger"
            fi
            ;;
        CYGWIN*|MINGW*|MSYS*)  # Windows
            start "http://localhost:5173" &
            start "http://localhost:5001/swagger" &
            ;;
        *)
            echo -e "${YELLOW}⚠️  Platform not detected. Please manually open:${NC}"
            echo "  Frontend: http://localhost:5173"
            echo "  API Docs: http://localhost:5001/swagger"
            ;;
    esac
    
    echo -e "${GREEN}✅ URLs opened in browser${NC}"
}

# Main command dispatcher
main() {
    case "${1:-}" in
        db-shell)
            db_shell
            ;;
        db-reset)
            db_reset
            ;;
        db-migrate)
            db_migrate
            ;;
        db-seed)
            db_seed
            ;;
        db-backup)
            db_backup "$2"
            ;;
        db-restore)
            db_restore "$2"
            ;;
        restart)
            restart_service "$2"
            ;;
        logs)
            show_logs "$2"
            ;;
        shell)
            open_shell "$2"
            ;;
        rebuild)
            rebuild_service "$2"
            ;;
        test)
            run_tests "$2"
            ;;
        lint)
            run_lint
            ;;
        build)
            build_services
            ;;
        clean)
            clean_docker
            ;;
        ports)
            check_ports
            ;;
        fresh)
            fresh_start
            ;;
        status)
            show_status
            ;;
        open)
            open_urls
            ;;
        --help|-h|help|"")
            show_banner
            show_help
            ;;
        *)
            echo -e "${RED}❌ Unknown command: $1${NC}"
            echo -e "${BLUE}Use '$0 --help' to see available commands${NC}"
            exit 1
            ;;
    esac
}

main "$@"