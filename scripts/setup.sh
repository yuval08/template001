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

# Get the script directory and load project configuration
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"

# Load project configuration system
source "$SCRIPT_DIR/project-config.sh"

# Function to show banner
show_banner() {
    echo -e "${CYAN}"
    echo "╔═══════════════════════════════════════════════════════════════════════════════╗"
    echo "║                         🚀 MASTER PROJECT SETUP 🚀                          ║"
    echo "║                         One Command to Rule Them All                        ║"
    echo "╚═══════════════════════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

# Function to show help
show_help() {
    echo -e "${BLUE}Master Project Setup${NC}"
    echo ""
    echo "This script orchestrates the complete project setup process:"
    echo "1. Initializes the project (if not already done)"
    echo "2. Sets up the development environment"
    echo "3. Shows the status dashboard"
    echo ""
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo -e "${YELLOW}Options:${NC}"
    echo "  --init-only        Run only project initialization"
    echo "  --dev-setup-only   Run only development setup"
    echo "  --force-init       Force re-initialization even if already initialized"
    echo "  --verbose          Verbose output"
    echo "  --help            Show this help message"
    echo ""
    echo -e "${YELLOW}Examples:${NC}"
    echo "  $0                 # Complete setup (recommended for new projects)"
    echo "  $0 --init-only     # Initialize project names and ports only"
    echo "  $0 --dev-setup-only # Set up development environment only"
    echo "  $0 --force-init    # Re-initialize project configuration"
}

# Parse command line arguments
INIT_ONLY=false
DEV_SETUP_ONLY=false
FORCE_INIT=false
VERBOSE=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --init-only)
            INIT_ONLY=true
            shift
            ;;
        --dev-setup-only)
            DEV_SETUP_ONLY=true
            shift
            ;;
        --force-init)
            FORCE_INIT=true
            shift
            ;;
        --verbose)
            VERBOSE=true
            shift
            ;;
        --help)
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

show_banner

# Check project initialization status
echo -e "${BLUE}🔍 Checking project initialization status...${NC}"

if is_project_initialized && [ "$FORCE_INIT" != true ]; then
    echo -e "${GREEN}✅ Project is already initialized${NC}"
    show_project_config
    SKIP_INIT=true
    
    if [ "$INIT_ONLY" = true ]; then
        echo -e "${YELLOW}🎯 Project already initialized. Use --force-init to re-initialize.${NC}"
        exit 0
    fi
else
    SKIP_INIT=false
    if [ "$FORCE_INIT" = true ]; then
        echo -e "${YELLOW}🔄 Force re-initialization requested${NC}"
    else
        echo -e "${YELLOW}⚠️  Project not initialized or configuration incomplete${NC}"
    fi
fi

# Step 1: Initialize project (if needed)
if [ "$DEV_SETUP_ONLY" != true ] && [ "$SKIP_INIT" != true ]; then
    echo
    echo -e "${MAGENTA}========================================${NC}"
    echo -e "${MAGENTA}  STEP 1: Project Initialization${NC}"
    echo -e "${MAGENTA}========================================${NC}"
    echo
    
    echo -e "${BLUE}🏗️  Running project initialization...${NC}"
    
    if [ "$VERBOSE" = true ]; then
        "$SCRIPT_DIR/init.sh"
    else
        "$SCRIPT_DIR/init.sh" | grep -E "(INFO|SUCCESS|ERROR|WARNING)"
    fi
    
    echo -e "${GREEN}✅ Project initialization complete${NC}"
    
    if [ "$INIT_ONLY" = true ]; then
        echo
        echo -e "${CYAN}🎉 Project initialization completed successfully!${NC}"
        echo -e "${BLUE}💡 Next step: Run './scripts/setup.sh --dev-setup-only' to set up development environment${NC}"
        exit 0
    fi
fi

# Step 2: Development Environment Setup  
if [ "$INIT_ONLY" != true ]; then
    echo
    echo -e "${MAGENTA}========================================${NC}"
    echo -e "${MAGENTA}  STEP 2: Development Environment Setup${NC}"
    echo -e "${MAGENTA}========================================${NC}"
    echo
    
    echo -e "${BLUE}🛠️  Setting up development environment...${NC}"
    
    # Determine dev-setup arguments
    dev_setup_args=""
    if [ "$VERBOSE" = true ]; then
        dev_setup_args="$dev_setup_args --verbose"
    else
        dev_setup_args="$dev_setup_args --quick"
    fi
    
    # Run dev-setup
    "$SCRIPT_DIR/dev-setup.sh" $dev_setup_args
    
    echo -e "${GREEN}✅ Development environment setup complete${NC}"
fi

# Step 3: Show final status
echo
echo -e "${MAGENTA}========================================${NC}"
echo -e "${MAGENTA}  SETUP COMPLETE - STATUS OVERVIEW${NC}"
echo -e "${MAGENTA}========================================${NC}"
echo

# Run status dashboard
"$SCRIPT_DIR/dev-status.sh" --services --ports --urls

echo
echo -e "${GREEN}🎉 Complete setup finished successfully!${NC}"
echo
echo -e "${BLUE}💡 What's next:${NC}"
echo -e "  ${CYAN}View full status:${NC}     ./scripts/dev-status.sh"
echo -e "  ${CYAN}View logs:${NC}            ./scripts/dev-tools.sh logs <service>"  
echo -e "  ${CYAN}Database shell:${NC}       ./scripts/dev-tools.sh db-shell"
echo -e "  ${CYAN}Restart service:${NC}      ./scripts/dev-tools.sh restart <service>"
echo -e "  ${CYAN}Stop everything:${NC}      docker compose down"
echo
echo -e "${YELLOW}📖 For more commands, run: ./scripts/dev-tools.sh --help${NC}"