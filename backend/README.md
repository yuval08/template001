# Intranet Starter - Backend

A comprehensive ASP.NET Core 9 backend built with Clean Architecture principles, featuring modern authentication, file storage, PDF generation, background jobs, and real-time communication.

## Architecture Overview

This backend follows Clean Architecture with four distinct layers:

- **Domain**: Core business entities and interfaces
- **Application**: Business logic, CQRS commands/queries, and DTOs
- **Infrastructure**: Data access, external services, and implementations
- **Api**: Controllers, middleware, startup configuration, and SignalR hubs

## Features

### Core Features
- ✅ Clean Architecture with Domain-Driven Design
- ✅ ASP.NET Core 9 with latest C# features
- ✅ Entity Framework Core 9 with PostgreSQL
- ✅ CQRS pattern with MediatR
- ✅ Repository pattern with Unit of Work
- ✅ Comprehensive error handling and logging

### Authentication & Authorization
- ✅ JWT Bearer token authentication
- ✅ Azure AD OpenID Connect integration
- ✅ Google OAuth integration
- ✅ Domain-based access restriction
- ✅ Role-based authorization (Admin, Manager, Employee)
- ✅ Policy-based authorization

### File Storage
- ✅ Multiple storage providers (Local, AWS S3, Azure Blob)
- ✅ Configurable via environment variables
- ✅ File upload/download/delete operations
- ✅ Temporary URL generation
- ✅ File type validation and size limits

### PDF Generation & Background Jobs
- ✅ QuestPDF integration for report generation
- ✅ Hangfire for background job processing
- ✅ PostgreSQL storage for job persistence
- ✅ Email integration with MailKit
- ✅ Automated report generation and emailing

### Real-time Communication
- ✅ SignalR hubs for notifications
- ✅ User status updates
- ✅ Project-based group messaging
- ✅ Typing indicators

### Monitoring & Health
- ✅ Comprehensive health checks
- ✅ Structured logging with Serilog
- ✅ Swagger/OpenAPI documentation
- ✅ CORS configuration

### Testing
- ✅ Unit tests with xUnit and Moq
- ✅ Integration tests with test database
- ✅ Test coverage for commands, queries, and services

## Quick Start

### Prerequisites
- .NET 9 SDK
- PostgreSQL 12+
- Optional: Docker for containerization

### Setup

1. **Clone and navigate to the backend directory**
   ```bash
   cd intranet-starter/backend
   ```

2. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Update connection strings**
   Edit `Api/appsettings.Development.json`:
   ```json
   {
     "ConnectionStrings": {
       "DefaultConnection": "Host=localhost;Port=5432;Database=intranet_starter_dev;Username=postgres;Password=your_password"
     }
   }
   ```

4. **Install dependencies and run migrations**
   ```bash
   dotnet restore
   cd Api
   dotnet ef database update
   ```

5. **Run the application**
   ```bash
   dotnet run
   ```

The API will be available at:
- HTTPS: https://localhost:7001
- HTTP: http://localhost:5000
- Swagger UI: https://localhost:7001 (in development)
- Hangfire Dashboard: https://localhost:7001/hangfire (in development)

## Project Structure

```
backend/
├── Domain/                     # Core business logic and entities
│   ├── Entities/              # Domain entities (User, Project)
│   ├── Interfaces/            # Repository and service interfaces
│   └── Common/                # Base classes and shared types
├── Application/               # Application layer (CQRS, DTOs)
│   ├── Commands/              # Command handlers
│   ├── Queries/               # Query handlers
│   ├── DTOs/                  # Data transfer objects
│   └── Services/              # Application service interfaces
├── Infrastructure/            # Infrastructure implementations
│   ├── Data/                  # EF Core context and repositories
│   ├── Services/              # Service implementations
│   └── BackgroundJobs/        # Hangfire job definitions
├── Api/                       # Web API layer
│   ├── Controllers/           # API controllers
│   ├── Hubs/                  # SignalR hubs
│   ├── Extensions/            # Configuration extensions
│   └── Program.cs             # Application entry point
├── Tests.Unit/                # Unit tests
└── Tests.Integration/         # Integration tests
```

## Configuration

### Environment Variables

Key environment variables (see `.env.example` for complete list):

```bash
# Database
ConnectionStrings__DefaultConnection=Host=localhost;Port=5432;Database=intranet_starter;Username=postgres;Password=your_password

# Authentication
ALLOWED_DOMAIN=company.com
ADMIN_EMAIL=admin@company.com
JWT_AUTHORITY=https://your-identity-server.com
JWT_AUDIENCE=intranet-api

# File Storage
STORAGE_DRIVER=Local  # Options: Local, S3, Azure

# Email (SMTP)
EMAIL_SMTP_HOST=smtp.gmail.com
EMAIL_SMTP_PORT=587
EMAIL_USERNAME=your_email@company.com
EMAIL_PASSWORD=your_app_password
```

### Authentication Providers

#### Google OAuth Setup
1. Create project in Google Cloud Console
2. Configure OAuth consent screen
3. Create OAuth 2.0 Client ID
4. Set environment variables:
   ```bash
   GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   ```

#### Azure AD Setup
1. Register app in Azure AD
2. Configure redirect URIs
3. Set environment variables:
   ```bash
   AZURE_AD_TENANT_ID=your-tenant-id
   AZURE_AD_CLIENT_ID=your-client-id
   AZURE_AD_CLIENT_SECRET=your-client-secret
   ```

## API Endpoints

### Authentication
- `GET /api/auth/login/google` - Initiate Google OAuth
- `GET /api/auth/login/azure` - Initiate Azure AD login
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/logout` - Logout

### Projects
- `GET /api/projects` - Get projects (paginated, searchable)
- `GET /api/projects/{id}` - Get project by ID
- `POST /api/projects` - Create project (Manager/Admin only)
- `PUT /api/projects/{id}` - Update project (Manager/Admin only)
- `DELETE /api/projects/{id}` - Delete project (Manager/Admin only)

### Reports
- `GET /api/reports/sample` - Generate sample PDF report
- `GET /api/reports/project/{id}` - Generate project PDF report
- `POST /api/reports/sample/email` - Email sample report
- `POST /api/reports/project/{id}/email` - Email project report

### Files
- `POST /api/files/upload` - Upload file
- `GET /api/files/{filename}` - Download file
- `GET /api/files/{filename}/url` - Get temporary download URL
- `DELETE /api/files/{filename}` - Delete file (Manager/Admin only)

### SignalR Hubs
- `/hubs/notifications` - Real-time notifications

## Testing

### Run Unit Tests
```bash
dotnet test Tests.Unit
```

### Run Integration Tests
```bash
dotnet test Tests.Integration
```

### Run All Tests with Coverage
```bash
dotnet test --collect:"XPlat Code Coverage"
```

## Deployment

### Docker Support
```dockerfile
# Example Dockerfile structure
FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app
COPY . .
EXPOSE 80 443
ENTRYPOINT ["dotnet", "IntranetStarter.Api.dll"]
```

### Production Considerations
- Configure proper connection strings
- Set up SSL certificates
- Configure reverse proxy (nginx/Apache)
- Set up monitoring and logging
- Configure backup strategies
- Implement rate limiting
- Set up CI/CD pipelines

## Contributing

1. Follow Clean Architecture principles
2. Maintain test coverage above 80%
3. Use consistent naming conventions
4. Document new features and APIs
5. Follow SOLID principles

## Technology Stack

- **Framework**: ASP.NET Core 9
- **Database**: PostgreSQL with Entity Framework Core 9
- **Authentication**: JWT, OAuth 2.0 (Google, Azure AD)
- **PDF Generation**: QuestPDF
- **Background Jobs**: Hangfire
- **File Storage**: Local/S3/Azure Blob
- **Email**: MailKit
- **Real-time**: SignalR
- **Testing**: xUnit, Moq, FluentAssertions
- **Logging**: Serilog
- **Documentation**: Swagger/OpenAPI

## License

This project is licensed under the MIT License - see the LICENSE file for details.