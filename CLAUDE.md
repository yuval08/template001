# CLAUDE.md - Development Guide

This guide helps developers work effectively with this intranet template. Follow these workflows for optimal development experience.

## 🚀 Template Setup (First Time)

### Initial Setup
```bash
# 1. Get the template and initialize your project
./scripts/setup.sh
# This will:
# - Ask for your project name
# - Rename all files and namespaces  
# - Generate unique ports
# - Setup development environment
```

### Alternative Setup Methods
```bash
# Initialize project only (rename from template)
./scripts/setup.sh --init-only

# Setup development only (if already initialized)
./scripts/setup.sh --dev-setup-only

# Force re-initialization with new ports
./scripts/setup.sh --force-init
```

## Daily Development Workflow

### Essential Commands
```bash
# Check project status
./scripts/dev-status.sh

# View service logs  
./scripts/dev-tools.sh logs <service-name>

# Database operations
./scripts/dev-tools.sh db-shell    # Database access
./scripts/dev-tools.sh db-reset    # Reset database (warning: destroys data)
./scripts/dev-tools.sh db-migrate  # Run migrations

# Service management
./scripts/dev-tools.sh restart <service>
./scripts/dev-tools.sh rebuild     # Rebuild all containers
```

### Development Scripts Reference

#### `./scripts/setup.sh` - Master Setup Script
Complete project initialization and setup:
- `--init-only`: Only rename template files
- `--dev-setup-only`: Only setup development environment  
- `--force-init`: Force re-initialization with new settings

#### `./scripts/dev-status.sh` - Project Status Monitor
View project health and information:
- `--health`: Quick health check
- `--urls`: Display all service URLs
- `--watch`: Real-time monitoring

#### `./scripts/dev-tools.sh` - Development Utilities
Comprehensive development toolkit:
- `db-shell`, `db-reset`, `db-migrate`: Database operations
- `restart <service>`, `logs <service>`: Service management
- `test <TestType>`: Run specific tests
- `fresh`: Complete environment refresh
- `open`: Open all development URLs in browser

## Troubleshooting

### Quick Fixes
1. **Script won't run**: `chmod +x scripts/*.sh`
2. **Port conflicts**: `./scripts/setup.sh --force-init`
3. **Database issues**: `./scripts/dev-tools.sh db-reset` (destroys data)
4. **Docker problems**: `docker system prune -f && ./scripts/dev-tools.sh rebuild`

### Detailed Help
For comprehensive troubleshooting, see: **[docs/setup/troubleshooting.md](docs/setup/troubleshooting.md)**

## Architecture & Development

### Key Documentation
- **[Architecture Overview](docs/development/architecture.md)** - System design and patterns
- **[Adding New Features](docs/development/new-features.md)** - Complete guide for extending the template
- **[Authentication Guide](docs/development/authentication.md)** - OAuth2 setup and user management
- **[Deployment Guide](docs/development/deployment.md)** - Production deployment options
- **[API Documentation](docs/api/endpoints.md)** - Complete API reference

### Technology Stack
- **Backend**: .NET 9, ASP.NET Core, PostgreSQL, Entity Framework
- **Frontend**: React 18, TypeScript, Tailwind CSS, Shadcn/ui
- **Authentication**: OAuth2/OIDC (Azure AD, Google)
- **Real-time**: SignalR for notifications
- **Infrastructure**: Docker, Docker Compose

### Clean Architecture Layers
1. **Domain** - Business entities and rules
2. **Application** - CQRS commands/queries with MediatR
3. **Infrastructure** - Database, external services
4. **API** - REST endpoints, authentication
5. **Frontend** - React components, state management

## Service URLs (Development)
- **Frontend**: http://localhost:5173
- **API**: http://localhost:5000  
- **Swagger**: http://localhost:5000/swagger
- **Database Admin**: http://localhost:5001 (SMTP4Dev)

*Note: Ports are automatically assigned during setup to avoid conflicts*

## Configuration

### Environment Setup
The setup script creates `.env.development` with:
- Database connection settings
- OAuth provider configuration
- CORS and security settings
- Admin user email

### Authentication Providers
**Azure AD** (recommended for enterprise):
```env
JWT_AUTHORITY=https://login.microsoftonline.com/your-tenant/v2.0
JWT_AUDIENCE=your-client-id
```

**Google OAuth**:
```env
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-secret
```

## Development Best Practices

### Adding New Features
1. **Plan**: Define entity, relationships, permissions
2. **Backend**: Domain → Application → Infrastructure → API
3. **Frontend**: Types → Services → Hooks → Components
4. **Test**: Unit tests, integration tests, E2E
5. **Deploy**: Update documentation, test deployment

### Code Organization
- Follow existing patterns and naming conventions
- Use existing components (DataTable, forms, etc.)
- Implement proper error handling and loading states
- Write tests for critical functionality

### Database Changes
```bash
# Create migration
dotnet ef migrations add YourMigrationName -p backend/Infrastructure -s backend/Api

# Apply migration
./scripts/dev-tools.sh db-migrate
```

## Advanced Features

### Internationalization (i18n)
Supports English and Spanish with:
- UI translations
- Email localization  
- Date/number formatting
- Language switcher (configurable)

### Real-time Features
SignalR integration for:
- Live notifications
- Project updates
- User status

### Background Jobs
Hangfire for:
- Report generation
- Email sending
- Scheduled tasks