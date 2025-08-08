#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default ports
DEFAULT_POSTGRES_PORT=5432
DEFAULT_REDIS_PORT=6379
DEFAULT_API_PORT=8080
DEFAULT_FRONTEND_DEV_PORT=5173
DEFAULT_FRONTEND_PROD_PORT=3000

# Function to check if a port is in use
check_port() {
    local port=$1
    if command -v lsof &> /dev/null; then
        lsof -i ":$port" &> /dev/null
    elif command -v netstat &> /dev/null; then
        netstat -ln | grep -q ":$port "
    elif command -v ss &> /dev/null; then
        ss -ln | grep -q ":$port "
    else
        # Fallback: try to bind to the port
        (echo >/dev/tcp/localhost/$port) &>/dev/null
    fi
}

# Function to find next available port
find_available_port() {
    local start_port=$1
    local port=$start_port
    
    while check_port $port; do
        ((port++))
        if [ $port -gt 65535 ]; then
            echo "Error: No available ports found" >&2
            return 1
        fi
    done
    
    echo $port
}

# Function to update .env file with port configuration
update_env_file() {
    local env_file=".env"
    local postgres_port=$1
    local redis_port=$2
    
    # Create .env from .env.development if it doesn't exist
    if [[ ! -f "$env_file" ]]; then
        cp .env.development "$env_file"
        echo -e "${GREEN}Created $env_file from .env.development template${NC}"
    fi
    
    # Update or add port configurations
    if grep -q "POSTGRES_HOST_PORT=" "$env_file"; then
        sed -i "s/POSTGRES_HOST_PORT=.*/POSTGRES_HOST_PORT=$postgres_port/" "$env_file"
    else
        echo "POSTGRES_HOST_PORT=$postgres_port" >> "$env_file"
    fi
    
    if grep -q "REDIS_HOST_PORT=" "$env_file"; then
        sed -i "s/REDIS_HOST_PORT=.*/REDIS_HOST_PORT=$redis_port/" "$env_file"
    else
        echo "REDIS_HOST_PORT=$redis_port" >> "$env_file"
    fi
    
    echo -e "${GREEN}Updated $env_file with port configurations${NC}"
}

# Function to display port status
display_port_status() {
    local postgres_port=$1
    local redis_port=$2
    
    echo -e "${BLUE}Port Configuration:${NC}"
    echo -e "  PostgreSQL: ${GREEN}$postgres_port${NC} $(check_port $postgres_port && echo -e "${RED}(in use)${NC}" || echo -e "${GREEN}(available)${NC}")"
    echo -e "  Redis: ${GREEN}$redis_port${NC} $(check_port $redis_port && echo -e "${RED}(in use)${NC}" || echo -e "${GREEN}(available)${NC}")"
    echo -e "  API: ${GREEN}8080${NC} $(check_port 8080 && echo -e "${RED}(in use)${NC}" || echo -e "${GREEN}(available)${NC}")"
    echo -e "  Frontend (dev): ${GREEN}5173${NC} $(check_port 5173 && echo -e "${RED}(in use)${NC}" || echo -e "${GREEN}(available)${NC}")"
    echo -e "  Frontend (prod): ${GREEN}3000${NC} $(check_port 3000 && echo -e "${RED}(in use)${NC}" || echo -e "${GREEN}(available)${NC}")"
}

# Main function
main() {
    echo -e "${BLUE}🔍 Checking for port conflicts...${NC}"
    
    # Check PostgreSQL port
    postgres_port=$DEFAULT_POSTGRES_PORT
    if check_port $postgres_port; then
        echo -e "${YELLOW}⚠️  Port $postgres_port is in use, finding alternative...${NC}"
        postgres_port=$(find_available_port $((postgres_port + 1)))
        echo -e "${GREEN}✅ Found available port for PostgreSQL: $postgres_port${NC}"
    else
        echo -e "${GREEN}✅ PostgreSQL port $postgres_port is available${NC}"
    fi
    
    # Check Redis port
    redis_port=$DEFAULT_REDIS_PORT
    if check_port $redis_port; then
        echo -e "${YELLOW}⚠️  Port $redis_port is in use, finding alternative...${NC}"
        redis_port=$(find_available_port $((redis_port + 1)))
        echo -e "${GREEN}✅ Found available port for Redis: $redis_port${NC}"
    else
        echo -e "${GREEN}✅ Redis port $redis_port is available${NC}"
    fi
    
    # Display current port status
    display_port_status $postgres_port $redis_port
    
    # Update .env file if ports are different from defaults
    if [ $postgres_port -ne $DEFAULT_POSTGRES_PORT ] || [ $redis_port -ne $DEFAULT_REDIS_PORT ]; then
        update_env_file $postgres_port $redis_port
    fi
    
    # Export ports for docker compose
    export POSTGRES_HOST_PORT=$postgres_port
    export REDIS_HOST_PORT=$redis_port
    
    echo -e "${GREEN}🎉 Port configuration complete!${NC}"
}

# Show help if requested
if [[ "$1" == "--help" || "$1" == "-h" ]]; then
    echo "Port Manager - Dynamic port conflict resolution for Intranet Starter"
    echo ""
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -h, --help     Show this help message"
    echo "  --check-only   Only check port status, don't update files"
    echo ""
    echo "This script automatically detects port conflicts and finds"
    echo "available alternatives for PostgreSQL and Redis services."
    echo ""
    echo "Default ports:"
    echo "  PostgreSQL: $DEFAULT_POSTGRES_PORT"
    echo "  Redis: $DEFAULT_REDIS_PORT"
    exit 0
fi

# Check only mode
if [[ "$1" == "--check-only" ]]; then
    postgres_port=$DEFAULT_POSTGRES_PORT
    redis_port=$DEFAULT_REDIS_PORT
    
    if check_port $postgres_port; then
        postgres_port=$(find_available_port $((postgres_port + 1)))
    fi
    
    if check_port $redis_port; then
        redis_port=$(find_available_port $((redis_port + 1)))
    fi
    
    display_port_status $postgres_port $redis_port
    exit 0
fi

# Run main function
main