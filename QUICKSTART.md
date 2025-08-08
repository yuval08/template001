# 🚀 Quick Start Guide

## Prerequisites
- Docker & Docker Compose
- Git
- .NET 9 SDK (for local development)
- Node.js 20+ (for local development)

## 🎯 One-Command Start

```bash
# Clone and start everything
git clone <your-repo-url> intranet-starter
cd intranet-starter
cp .env.example .env
docker compose up
```

The application will be available at:
- 🌐 Frontend: http://localhost:3000
- 🔧 Backend API: http://localhost:5000
- 📊 Swagger: http://localhost:5000/swagger
- 📈 Hangfire Dashboard: http://localhost:5000/hangfire

## 📝 Default Credentials
- Admin Email: admin@yourdomain.com
- Test User: user@yourdomain.com

## 🛠️ Development Setup

### Backend
```bash
cd backend/Api
dotnet restore
dotnet ef database update
dotnet run
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## 🔑 Environment Variables

Essential variables to configure in `.env`:

```env
# Authentication
ALLOWED_DOMAIN=yourdomain.com
ADMIN_EMAIL=admin@yourdomain.com
JWT_SECRET=your-secret-key-min-32-chars

# Database
POSTGRES_PASSWORD=your-secure-password
DATABASE_CONNECTION=Host=postgres;Database=intranet;Username=postgres;Password=your-secure-password

# File Storage (local|s3|azure)
STORAGE_DRIVER=local

# Email (for Hangfire jobs)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                   Frontend (React 19)                │
│         Vite │ TypeScript │ Tailwind │ shadcn       │
└──────────────────────┬──────────────────────────────┘
                       │ HTTPS/WSS
┌──────────────────────▼──────────────────────────────┐
│                 API Gateway (Nginx)                  │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│              Backend API (ASP.NET Core 9)           │
│     Clean Architecture │ CQRS │ Repository          │
├──────────────────────────────────────────────────────┤
│  Auth  │  SignalR  │  Hangfire  │  File Storage    │
└────┬─────────┬──────────┬────────────┬──────────────┘
     │         │          │            │
┌────▼───┐ ┌──▼───┐ ┌───▼───┐ ┌──────▼──────┐
│Postgres│ │Redis │ │Workers│ │S3/Azure/Local│
└────────┘ └──────┘ └───────┘ └──────────────┘
```

## 🎨 Key Features

### Authentication & Authorization
- ✅ Azure AD / Google OAuth integration
- ✅ Role-based access control (Admin, Manager, Employee)
- ✅ Domain restriction for single-tenant

### Core Features
- 📊 **Dashboard**: Real-time charts and statistics
- 📝 **Forms**: Comprehensive form showcase with validation
- 📋 **Tables**: Advanced data grids with filtering/sorting
- 👥 **Users**: User and role management
- 📄 **Reports**: PDF generation and preview
- 🔔 **Real-time**: SignalR notifications
- 📁 **File Storage**: Multi-provider support (Local/S3/Azure)

### Developer Features
- 🏗️ Clean Architecture
- 🧪 Unit & Integration tests
- 📚 Swagger API documentation
- 🐳 Docker Compose setup
- 🔄 CI/CD with GitHub Actions
- 📊 Health checks & monitoring

## 🧪 Testing

```bash
# Backend tests
cd backend
dotnet test

# Frontend tests
cd frontend
npm test
npm run test:e2e
```

## 📦 Production Deployment

```bash
# Use production compose file
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Or deploy to Kubernetes
kubectl apply -f k8s/
```

## 🆘 Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL logs
docker compose logs postgres

# Reset database
docker compose down -v
docker compose up
```

### Authentication Issues
1. Verify ALLOWED_DOMAIN in .env
2. Check Azure AD / Google OAuth configuration
3. Ensure JWT_SECRET is set

### Frontend Can't Connect to API
1. Check CORS settings in backend
2. Verify API_URL in frontend .env
3. Check nginx proxy configuration

## 📚 Documentation

- [Setup Guide](docs/SETUP.md)
- [Architecture](docs/ARCHITECTURE.md)
- [API Documentation](docs/API.md)
- [Authentication](docs/AUTHENTICATION.md)
- [Deployment](docs/DEPLOYMENT.md)
- [Troubleshooting](docs/TROUBLESHOOTING.md)

## 🤝 Support

- Create an issue in GitHub
- Check [Troubleshooting Guide](docs/TROUBLESHOOTING.md)
- Review [FAQ](docs/TROUBLESHOOTING.md#faq)

---

**Ready to customize?** Start by modifying the theme in `frontend/src/styles/theme.css` and adding your business logic to the backend services!