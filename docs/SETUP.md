# Project Setup Guide

## Prerequisites

### Development Environment
- **Operating Systems**: Windows 10/11, macOS, Linux
- **Software Requirements**:
  - Docker Desktop (20.10+)
  - .NET 8 SDK
  - Node.js 18+ (with npm 9+)
  - Git
  - Visual Studio Code or Visual Studio 2022
  - PostgreSQL Client (optional)

### Required Tools
```bash
# Verify installations
dotnet --version     # .NET SDK
node --version       # Node.js
npm --version        # npm
docker --version     # Docker
docker-compose --version  # Docker Compose
```

## Local Development Setup

### 1. Clone Repository
```bash
git clone https://github.com/your-org/intranet-starter.git
cd intranet-starter
```

### 2. Environment Configuration

#### Backend Configuration
1. Navigate to `backend/Api/`
2. Configure `appsettings.Development.json`:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=IntranetDb;Username=devuser;Password=devpassword"
  },
  "Authentication": {
    "AzureAd": {
      "Instance": "https://login.microsoftonline.com/",
      "ClientId": "YOUR_CLIENT_ID",
      "TenantId": "YOUR_TENANT_ID"
    }
  }
}
```

#### Frontend Configuration
1. Navigate to `frontend/`
2. Copy `.env.example` to `.env.development`
3. Update environment variables:
```
VITE_API_BASE_URL=http://localhost:5000/api
VITE_AUTH_PROVIDER=azuread
```

### 3. Database Setup
```bash
# Using Docker (recommended)
docker-compose up postgres -d

# Or manual PostgreSQL setup
createdb IntranetDb
psql IntranetDb < database/init.sql
```

### 4. Development Startup
```bash
# Backend (from /backend directory)
dotnet restore
dotnet ef database update
dotnet run

# Frontend (from /frontend directory)
npm install
npm run dev
```

### 5. Docker Compose Development
```bash
# Full stack development
docker-compose -f docker-compose.yml -f docker-compose.override.yml up --build
```

## Troubleshooting

### Common Issues
1. **Port Conflicts**
   - Ensure ports 5000 (backend), 3000 (frontend), 5432 (postgres) are available
   - Modify `docker-compose.yml` to change mapped ports if needed

2. **Authentication Failures**
   - Verify Azure AD / Google OAuth configuration
   - Check client secrets and redirect URIs
   - Validate domain restrictions

3. **Database Connection**
   - Confirm connection string matches your PostgreSQL setup
   - Verify network connectivity in Docker environment

4. **Dependency Issues**
   ```bash
   # Restore all dependencies
   dotnet restore
   npm install
   ```

## Recommended Development Workflow
- Use Visual Studio Code for frontend
- Use Visual Studio 2022 for backend
- Commit frequently
- Use feature branches
- Run tests before committing

## Performance Optimization
- Enable Docker BuildKit for faster builds
- Use multi-stage builds
- Leverage Docker layer caching

## Security Recommendations
- Never commit secrets to version control
- Use environment-specific configuration
- Rotate secrets regularly
- Enable two-factor authentication