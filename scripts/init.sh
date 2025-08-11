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
read -p "This will replace all occurrences of 'intranet_starter' with '$SOLUTION_NAME'. Continue? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_warning "Operation cancelled"
    exit 0
fi

echo
print_info "Starting replacement process..."

# Count files that will be modified
FILE_COUNT=0
while IFS= read -r -d '' file; do
    if grep -q "intranet_starter" "$file" 2>/dev/null; then
        ((FILE_COUNT++))
    fi
done < <(find . -type f \( \
    -name "*.cs" -o \
    -name "*.csproj" -o \
    -name "*.sln" -o \
    -name "*.json" -o \
    -name "*.yml" -o \
    -name "*.yaml" -o \
    -name "*.xml" -o \
    -name "*.config" -o \
    -name "*.md" -o \
    -name "*.txt" -o \
    -name "*.sh" -o \
    -name "*.env*" -o \
    -name "Dockerfile*" -o \
    -name "docker-compose*" \
    \) -not -path "./node_modules/*" \
    -not -path "./.git/*" \
    -not -path "./bin/*" \
    -not -path "./obj/*" \
    -not -path "./dist/*" \
    -not -path "./build/*" \
    -not -path "./.vs/*" \
    -not -path "./.vscode/*" \
    -not -path "./frontend/node_modules/*" \
    -not -path "./frontend/dist/*" \
    -not -path "./backend/*/bin/*" \
    -not -path "./backend/*/obj/*" \
    -print0)

print_info "Found $FILE_COUNT files containing 'intranet_starter'"

# Replace in all relevant files
MODIFIED_COUNT=0
while IFS= read -r -d '' file; do
    if grep -q "intranet_starter" "$file" 2>/dev/null; then
        # Create backup
        cp "$file" "$file.bak"
        
        # Replace content
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            sed -i '' "s/intranet_starter/$SOLUTION_NAME/g" "$file"
        else
            # Linux
            sed -i "s/intranet_starter/$SOLUTION_NAME/g" "$file"
        fi
        
        # Remove backup if replacement was successful
        if [ $? -eq 0 ]; then
            rm "$file.bak"
            ((MODIFIED_COUNT++))
            print_success "Modified: $file"
        else
            mv "$file.bak" "$file"
            print_error "Failed to modify: $file"
        fi
    fi
done < <(find . -type f \( \
    -name "*.cs" -o \
    -name "*.csproj" -o \
    -name "*.sln" -o \
    -name "*.json" -o \
    -name "*.yml" -o \
    -name "*.yaml" -o \
    -name "*.xml" -o \
    -name "*.config" -o \
    -name "*.md" -o \
    -name "*.txt" -o \
    -name "*.sh" -o \
    -name "*.env*" -o \
    -name "Dockerfile*" -o \
    -name "docker-compose*" \
    \) -not -path "./node_modules/*" \
    -not -path "./.git/*" \
    -not -path "./bin/*" \
    -not -path "./obj/*" \
    -not -path "./dist/*" \
    -not -path "./build/*" \
    -not -path "./.vs/*" \
    -not -path "./.vscode/*" \
    -not -path "./frontend/node_modules/*" \
    -not -path "./frontend/dist/*" \
    -not -path "./backend/*/bin/*" \
    -not -path "./backend/*/obj/*" \
    -print0)

print_info "Modified $MODIFIED_COUNT files"

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
print_info "Total files modified: $MODIFIED_COUNT"
echo
print_info "Next steps:"
print_info "1. Review the changes using 'git diff'"
print_info "2. Run './scripts/dev-setup.sh' to set up the development environment"
print_info "3. Commit the changes when satisfied"