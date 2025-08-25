# Intranet Starter Template

## 🚀 Quick Start - Template Initialization

**This is a project template.** Follow these steps to create your own project:

### Step 1: Get the Template
```bash
# Clone or download this template
git clone <your-template-repo-url> my-new-project
cd my-new-project
```

### Step 2: Initialize Your Project
```bash
# Run the master setup script - this will:
# 1. Ask for your project name (e.g., "company_portal")
# 2. Rename all files and namespaces
# 3. Generate random ports to avoid conflicts
# 4. Set up development environment
./scripts/setup.sh
```

### Step 3: Start Developing
```bash
# Your project is ready! Access:
# - Frontend: http://localhost:5173
# - API: http://localhost:5000
# - Database: localhost:<generated-port>
```

That's it! Your personalized project is ready. Continue reading for detailed information about the technology stack and features.

---

## Overview
A comprehensive, enterprise-ready intranet solution template designed for modern organizations, providing secure, scalable, and feature-rich internal collaboration and management platform.

## Technology Stack
- **Backend**: .NET 9, ASP.NET Core
- **Frontend**: React 18, TypeScript
- **Authentication**: OAuth2/OIDC (Azure AD, Google)
- **Database**: PostgreSQL
- **Infrastructure**: Docker, Docker Compose
- **State Management**: Zustand
- **UI Framework**: Tailwind CSS, Shadcn/ui
- **Real-time Communication**: SignalR

### Architecture
Clean Architecture with separation of concerns:
- Domain-Driven Design
- CQRS Pattern
- Repository Pattern
- Dependency Injection

## Advanced Setup Options

### Prerequisites
- Docker & Docker Compose (required)
- Node.js 18+ (optional - for local frontend development)
- .NET 9 SDK (optional - for local backend development)

### Alternative Setup Commands
```bash
# Initialize project only (rename from template)
./scripts/setup.sh --init-only

# Setup development environment only (if already initialized)
./scripts/setup.sh --dev-setup-only

# Force re-initialization with new ports
./scripts/setup.sh --force-init

# Traditional setup (if you prefer manual control)
./scripts/init.sh        # Initialize project
./scripts/dev-setup.sh   # Setup development environment
```

### Development Workflow
```bash
# View project status
./scripts/dev-status.sh

# View service logs
./scripts/dev-tools.sh logs <service-name>

# Database operations
./scripts/dev-tools.sh db-shell
./scripts/dev-tools.sh db-reset

# Stop everything
docker compose down
```

## Key Features
- Secure OAuth2 Authentication
- Role-Based Access Control
- Real-time Notifications
- Dynamic Dashboard
- File Management
- Project Tracking
- Reporting System
- Responsive Design

## Documentation
Detailed documentation available in the `docs/` directory:
- [Script Optimization Guide](docs/SCRIPT_OPTIMIZATION.md) - New setup system explained
- [Development Setup](CLAUDE.md) - Comprehensive development guide
- [Architecture Overview](docs/ARCHITECTURE.md)
- [API Documentation](docs/API.md)
- [Authentication Guide](docs/AUTHENTICATION.md)
- [Deployment Instructions](docs/DEPLOYMENT.md)

## Roadmap
- [ ] Enhanced reporting capabilities
- [ ] Multi-language support
- [ ] Advanced user management

## License
MIT License

## Contributing
Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.