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
echo

# Confirm before proceeding
read -p "This will replace all occurrences of 'myapp' with '$SOLUTION_NAME'. Continue? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_warning "Operation cancelled"
    exit 0
fi

echo
print_info "Starting replacement process..."

# Find all files containing myapp
FILES=$(grep -rl "myapp" . \
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
    2>/dev/null || true)

if [ -z "$FILES" ]; then
    print_warning "No files found containing 'myapp'"
else
    FILE_COUNT=$(echo "$FILES" | wc -l)
    print_info "Found $FILE_COUNT files containing 'myapp'"
    
    # Replace in all files
    echo "$FILES" | while IFS= read -r file; do
        print_info "Modifying: $file"
        
        # Use sed to replace all occurrences
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            sed -i '' "s/myapp/$SOLUTION_NAME/g" "$file"
        else
            # Linux/WSL
            sed -i "s/myapp/$SOLUTION_NAME/g" "$file"
        fi
        
        if [ $? -eq 0 ]; then
            print_success "✓ $file"
        else
            print_error "✗ Failed to modify $file"
        fi
    done
fi

# Rename solution file if it exists
if [ -f "backend/IntranetStarter.sln" ]; then
    # Convert solution name to PascalCase for .sln file
    # First letter uppercase, rest as-is but with underscores removed and following letters capitalized
    PASCAL_NAME=$(echo "$SOLUTION_NAME" | sed 's/_\(.\)/\U\1/g' | sed 's/^./\U&/')
    NEW_SLN_NAME="backend/${PASCAL_NAME}.sln"
    
    mv "backend/IntranetStarter.sln" "$NEW_SLN_NAME"
    print_success "Renamed solution file to: $NEW_SLN_NAME"
else
    print_warning "Solution file backend/IntranetStarter.sln not found, skipping rename"
fi

echo
print_success "======================================"
print_success "  Initialization Complete!"
print_success "======================================"
print_info "Solution name changed to: $SOLUTION_NAME"
echo
print_info "Next steps:"
print_info "1. Review the changes using 'git diff'"
print_info "2. Run './scripts/dev-setup.sh' to set up the development environment"
print_info "3. Commit the changes when satisfied"