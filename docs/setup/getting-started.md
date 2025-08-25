# Getting Started Guide

## Prerequisites
- **Docker & Docker Compose** (required)
- **Git** (required)
- **Node.js 18+** (optional - for local frontend development)
- **.NET 9 SDK** (optional - for local backend development)

## Quick Setup (Recommended)

### 1. Get the Template
```bash
# Clone this template repository
git clone <your-template-url> my-intranet-app
cd my-intranet-app
```

### 2. Initialize Your Project
```bash
# One-command setup - this will:
# 1. Ask for your project name (e.g., "CompanyPortal")
# 2. Rename all files and namespaces
# 3. Generate random ports to avoid conflicts
# 4. Set up development environment
./scripts/setup.sh
```

### 3. Access Your Application
After setup completes, your services will be available at:
- **Frontend**: http://localhost:5173
- **API**: http://localhost:5000
- **Swagger Documentation**: http://localhost:5000/swagger
- **Database Admin**: http://localhost:5001 (SMTP4Dev for email testing)

## Alternative Setup Options

### Manual Step-by-Step Setup
```bash
# Initialize project only (rename from template)
./scripts/setup.sh --init-only

# Setup development environment only (if already initialized)
./scripts/setup.sh --dev-setup-only

# Force re-initialization with new ports
./scripts/setup.sh --force-init
```

### Traditional Setup (Advanced Users)
```bash
# Initialize project
./scripts/init.sh

# Setup development environment
./scripts/dev-setup.sh

# View status
./scripts/dev-status.sh
```

## Environment Configuration

The setup script will create configuration files, but you may need to customize:

### Authentication Setup
1. **Azure AD** (recommended for enterprise):
   - Register app in Azure Portal
   - Update `JWT_AUTHORITY` and `JWT_AUDIENCE` in `.env.development`

2. **Google OAuth** (alternative):
   - Create OAuth client in Google Cloud Console
   - Update authentication settings

### Database Configuration
- PostgreSQL connection is auto-configured
- Default database name matches your project name
- Ports are automatically assigned to avoid conflicts

## Troubleshooting

### Port Conflicts
The setup script automatically handles port conflicts by:
- Detecting occupied ports
- Generating alternative port numbers
- Updating all configuration files

### Docker Issues
```bash
# Ensure Docker is running
docker --version
docker-compose --version

# If issues persist, try:
docker system prune -f
./scripts/setup.sh --force-init
```

### Authentication Issues
- Verify OAuth provider configuration
- Check domain restrictions in `.env.development`
- Ensure redirect URLs match your local ports

## Next Steps
1. **Customize Authentication**: Configure your OAuth provider
2. **Add Features**: See [New Features Guide](../development/new-features.md)
3. **Deploy**: Review [Deployment Guide](../development/deployment.md)
4. **Architecture**: Understand the [System Architecture](../development/architecture.md)