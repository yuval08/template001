# CLAUDE.md

This file provides guidance to developers when working with this repository. Our goal is to provide a streamlined, efficient development experience.

## 🚀 Quick Start Guide

### Prerequisites
- Docker
- Docker Compose
- Git
- (Optional) VS Code or JetBrains Rider

### One-Command Setup
```bash
# Start everything - local dev environment in minutes!
./scripts/dev-setup.sh
```

## Development Workflow

### 🔧 Development Scripts Overview

#### `./scripts/dev-setup.sh`
Comprehensive project initialization script with multiple modes:
```bash
# Standard setup (recommended)
./scripts/dev-setup.sh

# Interactive mode with custom configuration
./scripts/dev-setup.sh --interactive

# Quick, minimal output setup
./scripts/dev-setup.sh --quick

# Complete reset (warning: destroys all local data)
./scripts/dev-setup.sh --reset
```

#### `./scripts/dev-status.sh`
Real-time project status and monitoring:
```bash
# Show comprehensive development dashboard
./scripts/dev-status.sh

# Real-time service monitoring
./scripts/dev-status.sh --watch

# Quick system health check
./scripts/dev-status.sh --health

# Display service URLs
./scripts/dev-status.sh --urls
```

#### `./scripts/dev-tools.sh`
Powerful development utility with multiple commands:
```bash
# Database Management
./scripts/dev-tools.sh db-shell     # PostgreSQL interactive shell
./scripts/dev-tools.sh db-reset     # Reset entire database
./scripts/dev-tools.sh db-migrate   # Run pending migrations

# Service Management
./scripts/dev-tools.sh restart api  # Restart specific service
./scripts/dev-tools.sh logs frontend # View service logs
./scripts/dev-tools.sh rebuild      # Rebuild all services

# Development Utilities
./scripts/dev-tools.sh test Unit    # Run unit tests
./scripts/dev-tools.sh fresh        # Complete environment refresh
./scripts/dev-tools.sh open         # Open all development URLs
```

## Troubleshooting

### Common Issues & Solutions

1. **Port Conflicts**
   - Our scripts automatically detect and resolve port conflicts
   - If a port is in use, the system will:
     * Attempt to use an alternative port
     * Provide clear error messages
     * Suggest manual resolution steps

2. **Database Migration Problems**
   - `./scripts/dev-tools.sh db-migrate` handles most migration scenarios
   - Automatic rollback on failed migrations
   - Detailed error logging for debugging

3. **Docker-Related Challenges**
   - Ensure Docker daemon is running
   - Check Docker version compatibility (minimum Docker Compose v2)
   - Verify sufficient system resources

### Debugging Tips
- Always start with `./scripts/dev-status.sh --health`
- Use `./scripts/dev-tools.sh logs [service]` for detailed logs
- Run `./scripts/dev-setup.sh --interactive` for guided troubleshooting

## Manual Commands (Advanced Users)

### Backend (.NET)
```bash
# Build backend
dotnet build backend/

# Run tests
dotnet test backend/Tests.Unit
dotnet test backend/Tests.Integration

# Create migration
dotnet ef migrations add <MigrationName> \
  -p backend/Infrastructure \
  -c ApplicationDbContext \
  -s backend/Api
```

### Frontend (React)
```bash
# Install dependencies
npm install --prefix frontend

# Development server
npm run dev --prefix frontend

# Build for production
npm run build --prefix frontend
```

📌 Pro Tip: Prefer our scripts (`dev-setup.sh`, `dev-tools.sh`) over manual commands when possible!

## Architecture Overview

### Clean Architecture Layers

The application follows Clean Architecture with clear separation of concerns:

1. **Domain Layer** (`backend/Domain/`)
   - Core business entities and value objects
   - Domain events and business rules
   - No external dependencies

2. **Application Layer** (`backend/Application/`)
   - CQRS pattern implementation using MediatR
   - Commands: CreateProjectCommand, UpdateProjectCommand, CreateUserCommand, UpdateUserRoleCommand, UpdateUserProfileCommand, etc.
   - Queries: GetProjectsQuery, GetUsersQuery, GetUserByIdQuery, GetPendingInvitationsQuery, etc.
   - Service interfaces and DTOs
   - Business logic orchestration

3. **Infrastructure Layer** (`backend/Infrastructure/`)
   - Entity Framework Core with PostgreSQL
   - External service integrations (Email, Storage)
   - Background jobs with Hangfire
   - SignalR hub implementations
   - Repository implementations

4. **API Layer** (`backend/Api/`)
   - ASP.NET Core Web API
   - Controllers: AuthController, ProjectsController, ReportsController, FilesController, UsersController
   - Simplified cookie-based OAuth authentication
   - Role-based authorization (Admin, Manager, Employee)
   - SignalR hubs for real-time notifications
   - Program.cs contains service configuration and startup

### Frontend Architecture

- **Pages** (`frontend/src/pages/`): Dashboard, Login, Reports, Users, Tables, Forms
- **Components** (`frontend/src/components/`): Reusable UI components using Shadcn/ui
- **State Management**: Zustand stores in `frontend/src/stores/`
- **API Integration**: React Query with hooks in `frontend/src/hooks/`
- **Routing**: React Router configured in `frontend/src/router.tsx`
- **Real-time**: SignalR client in `frontend/src/hooks/useSignalR.ts`

## Key Technologies & Patterns

### Backend
- **.NET 9** with C# nullable reference types enabled
- **Authentication**: Simplified cookie-based OAuth2/OIDC (Azure AD, Google)
- **User Management**: Pre-provisioning, role assignment, invitation system
- **Database**: PostgreSQL with Entity Framework Core
- **Caching**: Redis
- **Background Jobs**: Hangfire for scheduled tasks
- **Real-time**: SignalR for WebSocket communications
- **Logging**: Serilog with file and console sinks
- **Testing**: xUnit with separate Unit and Integration test projects

### Frontend
- **React 19** with TypeScript
- **Build Tool**: Vite
- **UI Framework**: Tailwind CSS with Shadcn/ui components
- **Forms**: React Hook Form with Zod validation
- **Data Fetching**: TanStack Query (React Query)
- **State Management**: Zustand
- **Tables**: TanStack Table
- **Charts**: Recharts

## Service URLs

### Development
- Frontend: http://localhost:5173
- API: http://localhost:5000
- Swagger: http://localhost:5000/swagger
- Hangfire: http://localhost:5002/hangfire
- PostgreSQL: localhost:5433
- Redis: localhost:6379

### Production (Docker)
- Frontend: http://localhost:3000
- API: http://localhost:8080
- Hangfire: http://localhost:8081/hangfire
- PostgreSQL: localhost:5432

## Environment Configuration

Key environment variables are defined in:
- `.env.development` - Development environment template
- `.env.example` - Production environment template
- `docker-compose.override.yml` - Development overrides

Required configuration:
- `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD` - Database connection
- `JWT_AUTHORITY`, `JWT_AUDIENCE` - Authentication settings
- `CORS_ALLOWED_ORIGINS` - CORS configuration
- `ADMIN_EMAIL`, `ALLOWED_DOMAIN` - Admin and domain restrictions
- `SMTP_*` - Email service configuration

## Database Management

The application uses Code-First migrations with Entity Framework Core:
- Migrations are in `backend/Infrastructure/Migrations/`
- ApplicationDbContext is the main database context
- Automatic migration on startup in development
- Seed data includes admin user if ADMIN_EMAIL is configured

## Authentication & Authorization

- Simplified cookie-based OAuth2/OIDC integration with Azure AD and Google
- Session-based authentication with HTTP-only secure cookies
- Role-based authorization policies: AdminOnly, ManagerOrAdmin, AllUsers
- Domain restriction support via ALLOWED_DOMAIN environment variable
- User pre-provisioning with role assignment
- Automatic admin creation based on ADMIN_EMAIL environment variable
- Custom claims added during token validation

## Real-time Features

SignalR is used for real-time notifications:
- Hub endpoint: `/hubs/notifications`
- Client implementation in `frontend/src/hooks/useSignalR.ts`
- Automatic reconnection handling

## Background Jobs

Hangfire manages background tasks:
- Dashboard available at `/hangfire` (admin-only in production)
- Recurring jobs scheduled in Program.cs
- Project report generation scheduled job