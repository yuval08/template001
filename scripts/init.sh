#!/bin/bash

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Get the script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_ROOT"

print_info "======================================"
print_info "  Solution Initialization Script"
print_info "======================================"
echo

# Check if solution file exists
if [ ! -f "backend/IntranetStarter.sln" ]; then
    print_warning "Solution file backend/IntranetStarter.sln not found."
    print_warning "It may have already been renamed or doesn't exist yet."
fi

# Prompt for solution name
while true; do
    read -p "Enter the new solution name (lowercase, no spaces): " SOLUTION_NAME
    
    # Validate input
    if [[ -z "$SOLUTION_NAME" ]]; then
        print_error "Solution name cannot be empty"
        continue
    fi
    
    if [[ "$SOLUTION_NAME" =~ [A-Z] ]]; then
        print_error "Solution name must be lowercase"
        continue
    fi
    
    if [[ "$SOLUTION_NAME" =~ [[:space:]] ]]; then
        print_error "Solution name cannot contain spaces"
        continue
    fi
    
    if [[ ! "$SOLUTION_NAME" =~ ^[a-z][a-z0-9_]*$ ]]; then
        print_error "Solution name must start with a letter and contain only lowercase letters, numbers, and underscores"
        continue
    fi
    
    break
done

print_info "New solution name: $SOLUTION_NAME"

# Convert snake_case/kebab-case to PascalCase for C# namespace
# Examples: apolo_portal -> ApoloPortal, my-project -> MyProject
to_pascal_case() {
    local input="$1"
    # Replace underscores and hyphens with spaces, then capitalize each word
    echo "$input" | sed 's/[-_]/ /g' | awk '{for(i=1;i<=NF;i++) $i=toupper(substr($i,1,1)) tolower(substr($i,2))}1' | tr -d ' '
}

# Convert snake_case/kebab-case to Title Case for display name
# Examples: apolo_portal -> Apolo Portal, my-project -> My Project
to_title_case() {
    local input="$1"
    # Replace underscores and hyphens with spaces, then capitalize each word
    echo "$input" | sed 's/[-_]/ /g' | awk '{for(i=1;i<=NF;i++) $i=toupper(substr($i,1,1)) tolower(substr($i,2))}1'
}

# Generate PascalCase namespace from solution name
NAMESPACE_NAME=$(to_pascal_case "$SOLUTION_NAME")
print_info "C# Namespace will be: $NAMESPACE_NAME"

# Generate Title Case display name from solution name
DISPLAY_NAME=$(to_title_case "$SOLUTION_NAME")
print_info "Display name will be: $DISPLAY_NAME"
echo

# Function to generate random port in a safe range (10000-30000)
generate_random_port() {
    local min_port=10000
    local max_port=30000
    echo $((min_port + RANDOM % (max_port - min_port + 1)))
}

# Function to check if port is available
is_port_available() {
    local port=$1
    if command -v lsof >/dev/null 2>&1; then
        ! lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1
    elif command -v netstat >/dev/null 2>&1; then
        ! netstat -tuln | grep -q ":$port "
    elif command -v ss >/dev/null 2>&1; then
        ! ss -tuln | grep -q ":$port "
    else
        # If we can't check, assume it's available
        true
    fi
}

# Function to get available random port
get_available_port() {
    local port
    local attempts=0
    local max_attempts=50
    
    while [ $attempts -lt $max_attempts ]; do
        port=$(generate_random_port)
        if is_port_available $port; then
            echo $port
            return 0
        fi
        ((attempts++))
    done
    
    # If we couldn't find an available port, just return a random one
    echo $(generate_random_port)
}

print_info "Generating random ports for services..."

# Generate random ports for services
POSTGRES_PORT=$(get_available_port)
REDIS_PORT=$(get_available_port)
SMTP_WEB_PORT=$(get_available_port)
SMTP_PORT=$(get_available_port)

print_success "Generated ports:"
print_info "  PostgreSQL: $POSTGRES_PORT"
print_info "  Redis: $REDIS_PORT"
print_info "  SMTP4Dev Web UI: $SMTP_WEB_PORT"
print_info "  SMTP4Dev SMTP: $SMTP_PORT"
echo

# Confirm before proceeding
read -p "This will replace all occurrences of 'intranet_starter' with '$SOLUTION_NAME' and update service ports. Continue? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_warning "Operation cancelled"
    exit 0
fi

echo
print_info "Starting replacement process..."

# Find all files containing intranet_starter (but exclude this init script)
FILES=$(grep -rl "intranet_starter" . \
    --include="*.cs" \
    --include="*.csproj" \
    --include="*.sln" \
    --include="*.json" \
    --include="*.yml" \
    --include="*.yaml" \
    --include="*.xml" \
    --include="*.config" \
    --include="*.md" \
    --include="*.txt" \
    --include="*.sh" \
    --include="*.env*" \
    --include="Dockerfile*" \
    --include="docker-compose*" \
    --exclude-dir=node_modules \
    --exclude-dir=.git \
    --exclude-dir=bin \
    --exclude-dir=obj \
    --exclude-dir=dist \
    --exclude-dir=build \
    --exclude-dir=.vs \
    --exclude-dir=.vscode \
    2>/dev/null | grep -v "scripts/init.sh" || true)

if [ -z "$FILES" ]; then
    print_warning "No files found containing 'intranet_starter'"
else
    FILE_COUNT=$(echo "$FILES" | wc -l)
    print_info "Found $FILE_COUNT files containing 'intranet_starter'"
    
    # Replace in all files
    echo "$FILES" | while IFS= read -r file; do
        print_info "Modifying: $file"
        
        # Use sed to replace all occurrences
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            sed -i '' "s/intranet_starter/$SOLUTION_NAME/g" "$file"
        else
            # Linux/WSL
            sed -i "s/intranet_starter/$SOLUTION_NAME/g" "$file"
        fi
        
        if [ $? -eq 0 ]; then
            print_success "✓ $file"
        else
            print_error "✗ Failed to modify $file"
        fi
    done
fi

# Replace C# namespace IntranetStarter with new PascalCase namespace
print_info "Replacing C# namespace 'IntranetStarter' with '$NAMESPACE_NAME'..."

# Find all C# and project files containing IntranetStarter namespace
NAMESPACE_FILES=$(grep -rl "IntranetStarter" backend/ \
    --include="*.cs" \
    --include="*.csproj" \
    --include="*.sln" \
    --include="*.json" \
    --include="*.xml" \
    --exclude-dir=bin \
    --exclude-dir=obj \
    --exclude-dir=.vs \
    2>/dev/null || true)

if [ -n "$NAMESPACE_FILES" ]; then
    NAMESPACE_FILE_COUNT=$(echo "$NAMESPACE_FILES" | wc -l)
    print_info "Found $NAMESPACE_FILE_COUNT files containing 'IntranetStarter' namespace"
    
    # Replace IntranetStarter with new namespace in all files
    echo "$NAMESPACE_FILES" | while IFS= read -r file; do
        print_info "Updating namespace in: $file"
        
        # Use sed to replace namespace
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            sed -i '' "s/IntranetStarter/$NAMESPACE_NAME/g" "$file"
        else
            # Linux/WSL
            sed -i "s/IntranetStarter/$NAMESPACE_NAME/g" "$file"
        fi
        
        if [ $? -eq 0 ]; then
            print_success "✓ Updated namespace in $file"
        else
            print_error "✗ Failed to update namespace in $file"
        fi
    done
    
    print_success "Namespace replacement complete"
else
    print_warning "No files found containing 'IntranetStarter' namespace"
fi

# Replace display name "Intranet Starter" with new Title Case display name
print_info "Replacing display name 'Intranet Starter' with '$DISPLAY_NAME'..."

# Find all files containing "Intranet Starter" (exclude this init script)
# Note: --include="*.env*" doesn't work with grep, so we'll handle .env files separately
DISPLAY_FILES=$(grep -rl "Intranet Starter" . \
    --include="*.cs" \
    --include="*.csproj" \
    --include="*.sln" \
    --include="*.json" \
    --include="*.yml" \
    --include="*.yaml" \
    --include="*.xml" \
    --include="*.config" \
    --include="*.md" \
    --include="*.txt" \
    --include="*.tsx" \
    --include="*.ts" \
    --include="*.jsx" \
    --include="*.js" \
    --include="*.html" \
    --include="*.css" \
    --include="Dockerfile*" \
    --include="docker-compose*" \
    --exclude-dir=node_modules \
    --exclude-dir=.git \
    --exclude-dir=bin \
    --exclude-dir=obj \
    --exclude-dir=dist \
    --exclude-dir=build \
    --exclude-dir=.vs \
    --exclude-dir=.vscode \
    2>/dev/null | grep -v "scripts/init.sh" || true)

# Also find .env files containing "Intranet Starter"
ENV_FILES=$(find . -name ".env*" -type f -exec grep -l "Intranet Starter" {} \; 2>/dev/null || true)

# Combine both file lists
if [ -n "$ENV_FILES" ]; then
    if [ -n "$DISPLAY_FILES" ]; then
        DISPLAY_FILES="$DISPLAY_FILES"$'\n'"$ENV_FILES"
    else
        DISPLAY_FILES="$ENV_FILES"
    fi
fi

if [ -n "$DISPLAY_FILES" ]; then
    DISPLAY_FILE_COUNT=$(echo "$DISPLAY_FILES" | wc -l)
    print_info "Found $DISPLAY_FILE_COUNT files containing 'Intranet Starter'"
    
    # Replace "Intranet Starter" with new display name in all files
    echo "$DISPLAY_FILES" | while IFS= read -r file; do
        print_info "Updating display name in: $file"
        
        # Use sed to replace display name
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            sed -i '' "s/Intranet Starter/$DISPLAY_NAME/g" "$file"
        else
            # Linux/WSL
            sed -i "s/Intranet Starter/$DISPLAY_NAME/g" "$file"
        fi
        
        if [ $? -eq 0 ]; then
            print_success "✓ Updated display name in $file"
        else
            print_error "✗ Failed to update display name in $file"
        fi
    done
    
    print_success "Display name replacement complete"
else
    print_warning "No files found containing 'Intranet Starter'"
fi

# Rename solution file if it exists
if [ -f "backend/IntranetStarter.sln" ]; then
    # Keep the solution name exactly as entered (lowercase with underscores)
    NEW_SLN_NAME="backend/${SOLUTION_NAME}.sln"
    
    mv "backend/IntranetStarter.sln" "$NEW_SLN_NAME"
    print_success "Renamed solution file to: $NEW_SLN_NAME"
else
    print_warning "Solution file backend/IntranetStarter.sln not found, skipping rename"
fi

# Update ports in .env.development file
if [ -f ".env.development" ]; then
    print_info "Updating ports in .env.development..."
    
    # Update PostgreSQL port
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s/POSTGRES_HOST_PORT=.*/POSTGRES_HOST_PORT=$POSTGRES_PORT/" ".env.development"
        sed -i '' "s/REDIS_HOST_PORT=.*/REDIS_HOST_PORT=$REDIS_PORT/" ".env.development"
        sed -i '' "s/SMTP_HOST_PORT=.*/SMTP_HOST_PORT=$SMTP_WEB_PORT/" ".env.development"
        sed -i '' "s/SMTP_PORT=.*/SMTP_PORT=$SMTP_PORT/" ".env.development"
    else
        # Linux/WSL
        sed -i "s/POSTGRES_HOST_PORT=.*/POSTGRES_HOST_PORT=$POSTGRES_PORT/" ".env.development"
        sed -i "s/REDIS_HOST_PORT=.*/REDIS_HOST_PORT=$REDIS_PORT/" ".env.development"
        sed -i "s/SMTP_HOST_PORT=.*/SMTP_HOST_PORT=$SMTP_WEB_PORT/" ".env.development"
        sed -i "s/SMTP_PORT=.*/SMTP_PORT=$SMTP_PORT/" ".env.development"
    fi
    
    print_success "Updated service ports in .env.development"
else
    print_warning ".env.development not found, ports will need to be configured manually"
fi

# Update ports in docker-compose.override.yml if it exists
if [ -f "docker-compose.override.yml" ]; then
    print_info "Updating ports in docker-compose.override.yml..."
    
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s/\"[0-9]*:5432\"/\"$POSTGRES_PORT:5432\"/" "docker-compose.override.yml"
        sed -i '' "s/\"[0-9]*:6379\"/\"$REDIS_PORT:6379\"/" "docker-compose.override.yml"
        sed -i '' "s/\"[0-9]*:80\"/\"$SMTP_WEB_PORT:80\"/" "docker-compose.override.yml"
        sed -i '' "s/\"[0-9]*:25\"/\"$SMTP_PORT:25\"/" "docker-compose.override.yml"
    else
        # Linux/WSL
        sed -i "s/\"[0-9]*:5432\"/\"$POSTGRES_PORT:5432\"/" "docker-compose.override.yml"
        sed -i "s/\"[0-9]*:6379\"/\"$REDIS_PORT:6379\"/" "docker-compose.override.yml"
        sed -i "s/\"[0-9]*:80\"/\"$SMTP_WEB_PORT:80\"/" "docker-compose.override.yml"
        sed -i "s/\"[0-9]*:25\"/\"$SMTP_PORT:25\"/" "docker-compose.override.yml"
    fi
    
    print_success "Updated service ports in docker-compose.override.yml"
fi

echo
print_success "======================================"
print_success "  Initialization Complete!"
print_success "======================================"
print_info "Solution name changed to: $SOLUTION_NAME"
print_info "Display name changed to: $DISPLAY_NAME"
print_info "C# Namespace changed to: $NAMESPACE_NAME"
print_info ""
print_success "Service ports configured:"
print_info "  PostgreSQL: localhost:$POSTGRES_PORT"
print_info "  Redis: localhost:$REDIS_PORT"
print_info "  SMTP4Dev Web UI: http://localhost:$SMTP_WEB_PORT"
print_info "  SMTP4Dev SMTP: localhost:$SMTP_PORT"
echo
print_info "Next steps:"
print_info "1. Review the changes using 'git diff'"
print_info "2. Run './scripts/dev-setup.sh' to set up the development environment"
print_info "3. Commit the changes when satisfied"