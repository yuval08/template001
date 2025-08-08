#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧪 Testing Docker build improvements...${NC}"

# Test 1: Build API service
echo -e "${BLUE}Test 1: Building API service...${NC}"
if docker compose build api; then
    echo -e "${GREEN}✅ API build successful${NC}"
else
    echo -e "${RED}❌ API build failed${NC}"
    exit 1
fi

# Test 2: Build Frontend service
echo -e "${BLUE}Test 2: Building Frontend service...${NC}"
if docker compose build frontend; then
    echo -e "${GREEN}✅ Frontend build successful${NC}"
else
    echo -e "${RED}❌ Frontend build failed${NC}"
    exit 1
fi

# Test 3: Start infrastructure services
echo -e "${BLUE}Test 3: Starting infrastructure services...${NC}"
docker compose up -d postgres redis

# Wait for services to be healthy
echo -e "${BLUE}⏳ Waiting for infrastructure services to be healthy...${NC}"
timeout=60
elapsed=0
while [ $elapsed -lt $timeout ]; do
    if docker compose ps postgres | grep -q "healthy" && \
       docker compose ps redis | grep -q "healthy"; then
        echo -e "${GREEN}✅ Infrastructure services are healthy${NC}"
        break
    fi
    sleep 5
    elapsed=$((elapsed + 5))
done

if [ $elapsed -ge $timeout ]; then
    echo -e "${RED}❌ Infrastructure services failed to become healthy${NC}"
    docker compose ps
    docker compose logs postgres redis
    exit 1
fi

# Test 4: Port manager
echo -e "${BLUE}Test 4: Testing port manager...${NC}"
if ./scripts/port-manager.sh --check-only; then
    echo -e "${GREEN}✅ Port manager working correctly${NC}"
else
    echo -e "${RED}❌ Port manager failed${NC}"
    exit 1
fi

echo -e "${GREEN}🎉 All Docker build tests passed!${NC}"
echo ""
echo -e "${BLUE}Summary of improvements:${NC}"
echo -e "  • ✅ Fixed NuGet package restore issues in backend Dockerfile"
echo -e "  • ✅ Added retry mechanism for package restoration"
echo -e "  • ✅ Fixed frontend dependency conflicts with --legacy-peer-deps"
echo -e "  • ✅ Implemented dynamic port conflict detection"
echo -e "  • ✅ Enhanced development setup script with better error handling"
echo -e "  • ✅ Removed obsolete docker-compose version directives"
echo ""
echo -e "${YELLOW}💡 Next steps:${NC}"
echo -e "  • Run './scripts/dev-setup.sh' for full development environment"
echo -e "  • Run './scripts/prod-deploy.sh production' for production deployment"

# Cleanup
docker compose down