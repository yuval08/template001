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
A modern, enterprise-ready intranet template built with .NET 9 and React 18. Features OAuth2 authentication, role-based access control, real-time notifications, and comprehensive project management capabilities.

## ✨ What's Included

### 🔧 Technology Stack
- **.NET 9** backend with Clean Architecture
- **React 18** frontend with TypeScript  
- **PostgreSQL** database with Entity Framework
- **OAuth2/OIDC** authentication (Azure AD, Google)
- **Docker & Docker Compose** for development
- **Tailwind CSS + Shadcn/ui** for modern UI
- **SignalR** for real-time features

### 🚀 Key Features
- **Secure Authentication** - OAuth2 with role-based access control
- **Project Management** - Create, assign, and track projects
- **File Management** - Upload, organize, and share documents
- **Real-time Notifications** - Live updates via SignalR
- **Reporting System** - Generate and export reports
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Multi-language Support** - English and Spanish included
- **Admin Dashboard** - User and system management

### 🏗️ Architecture Highlights
- **Clean Architecture** - Domain-driven design with CQRS
- **Type-Safe** - Full TypeScript coverage
- **Scalable** - Containerized and cloud-ready
- **Testable** - Comprehensive test coverage
- **Secure** - Industry best practices

## 🚧 Advanced Setup Options

### Prerequisites
- **Docker & Docker Compose** (required)
- **Git** (required)
- **Node.js 18+** (optional, for local development)
- **.NET 9 SDK** (optional, for local development)

### Alternative Setup Commands
```bash
# Initialize project only (rename template files)
./scripts/setup.sh --init-only

# Setup development environment only
./scripts/setup.sh --dev-setup-only

# Force re-initialization with new ports
./scripts/setup.sh --force-init
```

### Development Workflow
```bash
# Check project status
./scripts/dev-status.sh

# View service logs
./scripts/dev-tools.sh logs <service-name>

# Database operations
./scripts/dev-tools.sh db-shell      # Access database
./scripts/dev-tools.sh db-migrate    # Run migrations
./scripts/dev-tools.sh db-reset      # Reset database (destroys data)

# Service management
./scripts/dev-tools.sh restart <service>
./scripts/dev-tools.sh rebuild       # Rebuild containers

# Stop everything
docker compose down
```

## 📚 Documentation

### 🎯 Getting Started
- **[Setup Guide](docs/setup/getting-started.md)** - Complete installation instructions
- **[Configuration](docs/setup/configuration.md)** - Environment setup and customization
- **[Troubleshooting](docs/setup/troubleshooting.md)** - Common issues and solutions

### 🛠️ Development
- **[Architecture Overview](docs/development/architecture.md)** - System design and patterns
- **[Adding New Features](docs/development/new-features.md)** - Step-by-step development guide
- **[Authentication Guide](docs/development/authentication.md)** - OAuth2 setup and user management
- **[Deployment Guide](docs/development/deployment.md)** - Production deployment options

### 📖 Reference
- **[API Documentation](docs/api/endpoints.md)** - Complete REST API reference
- **[Development Workflow](CLAUDE.md)** - Daily development commands and best practices

## 🎨 Template Customization

### Branding & Styling
1. **Update logos**: Replace files in `frontend/src/assets/`
2. **Customize colors**: Edit `frontend/tailwind.config.js`
3. **Modify favicon**: Update `frontend/public/favicon.ico`

### Authentication Setup
1. **Azure AD**: Configure in Azure Portal, update `.env.development`
2. **Google OAuth**: Setup in Google Cloud Console, update environment variables
3. **Domain restrictions**: Set `ALLOWED_DOMAIN` for your organization

### Feature Extensions
- Follow the [Adding New Features](docs/development/new-features.md) guide
- Use existing components and patterns
- Implement proper authentication and authorization

## 🚀 Deployment Options

### Docker Compose (Recommended)
```bash
# Production deployment
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### Cloud Platforms
- **Azure Container Instances**
- **Google Cloud Run** 
- **AWS App Runner**
- **DigitalOcean Apps**

See the [Deployment Guide](docs/development/deployment.md) for detailed instructions.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Happy coding!** 🎉 Need help? Check the [troubleshooting guide](docs/setup/troubleshooting.md) or open an issue.