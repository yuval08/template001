# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Backend (.NET)
```bash
# Build backend
cd backend && dotnet build

# Run backend API
cd backend/Api && dotnet run

# Run tests
cd backend && dotnet test

# Run specific test project
cd backend/Tests.Unit && dotnet test
cd backend/Tests.Integration && dotnet test

# Apply database migrations
cd backend/Api && dotnet ef database update

# Create new migration
cd backend/Api && dotnet ef migrations add <MigrationName> -p ../Infrastructure -c ApplicationDbContext
```

### Frontend (React/TypeScript)
```bash
# Install dependencies
cd frontend && npm install

# Run development server
cd frontend && npm run dev

# Build for production
cd frontend && npm run build

# Run linting
cd frontend && npm run lint

# Preview production build
cd frontend && npm run preview
```

### Docker Development
```bash
# Start full development environment
docker compose -f docker-compose.yml -f docker-compose.override.yml up --build

# Start in detached mode
docker compose -f docker-compose.yml -f docker-compose.override.yml up -d

# View logs
docker compose logs -f [service]  # services: api, frontend, postgres, redis, hangfire

# Reset database
docker compose down -v && docker compose up -d

# Quick setup script
./scripts/dev-setup.sh
```

### Production Deployment
```bash
# Deploy to production
./scripts/prod-deploy.sh

# Build production images
docker compose -f docker-compose.yml -f docker-compose.prod.yml build

# Start production services
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## Architecture Overview

### Clean Architecture Layers

The application follows Clean Architecture with clear separation of concerns:

1. **Domain Layer** (`backend/Domain/`)
   - Core business entities and value objects
   - Domain events and business rules
   - No external dependencies

2. **Application Layer** (`backend/Application/`)
   - CQRS pattern implementation using MediatR
   - Commands: CreateProjectCommand, UpdateProjectCommand, etc.
   - Queries: GetProjectsQuery, GetUserQuery, etc.
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
   - Controllers: AuthController, ProjectsController, ReportsController, FilesController
   - Authentication/Authorization middleware
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
- **Authentication**: JWT Bearer tokens with OAuth2/OIDC support (Azure AD, Google)
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
- API: http://localhost:5001
- Swagger: http://localhost:5001/swagger
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

- OAuth2/OIDC integration with Azure AD and Google
- JWT Bearer token authentication
- Role-based authorization policies: AdminOnly, ManagerOrAdmin, AllUsers
- Domain restriction support via ALLOWED_DOMAIN environment variable
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