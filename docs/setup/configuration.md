# Configuration Guide

## Environment Variables

The template uses environment variables for configuration. Key files:
- `.env.development` - Development environment (auto-created by setup script)
- `.env.production` - Production environment (create manually)

### Core Configuration

```env
# Database
POSTGRES_DB=your_project_name
POSTGRES_USER=devuser
POSTGRES_PASSWORD=secure_password

# Authentication (Choose one)
JWT_AUTHORITY=https://login.microsoftonline.com/your-tenant-id/v2.0
JWT_AUDIENCE=your-client-id

# Or Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# CORS & Security
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
ALLOWED_DOMAIN=@yourcompany.com

# Admin Setup
ADMIN_EMAIL=admin@yourcompany.com
```

### Port Configuration

Setup script automatically assigns ports to avoid conflicts:
- **Frontend**: Usually 5173 (dev) / 3000 (prod)
- **Backend API**: Usually 5000
- **Database**: Usually 5433 (dev) / 5432 (prod)
- **Email Dev**: Usually 5001

View assigned ports: `./scripts/dev-status.sh --urls`

### Language Settings (i18n)

#### Single Language (e.g., Spanish only)
```env
VITE_MULTI_LANGUAGE_ENABLED=false
VITE_DEFAULT_LANGUAGE=es
VITE_AVAILABLE_LANGUAGES=es
```

#### Multi-Language Support
```env
VITE_MULTI_LANGUAGE_ENABLED=true
VITE_DEFAULT_LANGUAGE=en
VITE_AVAILABLE_LANGUAGES=en,es
```

### Authentication Providers

#### Azure AD (Recommended for Enterprise)
1. Register app in Azure Portal
2. Set redirect URI: `http://localhost:5000/signin-oidc`
3. Configure in `.env.development`:
```env
JWT_AUTHORITY=https://login.microsoftonline.com/YOUR_TENANT_ID/v2.0
JWT_AUDIENCE=YOUR_CLIENT_ID
```

#### Google OAuth
1. Create OAuth client in Google Cloud Console
2. Add authorized origins and redirect URIs
3. Configure in `.env.development`:
```env
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
```

### Email Configuration

For development (auto-configured):
```env
SMTP_HOST=smtp4dev
SMTP_PORT=25
SMTP_FROM=noreply@localhost
```

For production:
```env
SMTP_HOST=your-smtp-server.com
SMTP_PORT=587
SMTP_USERNAME=your-email@company.com
SMTP_PASSWORD=your-email-password
SMTP_FROM=noreply@yourcompany.com
```

### Database Configuration

#### Development (Docker - auto-configured)
```env
POSTGRES_DB=YourProjectName
POSTGRES_USER=devuser
POSTGRES_PASSWORD=randomly-generated
CONNECTION_STRING=Host=postgres;Database=YourProjectName;Username=devuser;Password=password
```

#### Production
```env
CONNECTION_STRING=Host=your-db-server;Database=prod_db;Username=prod_user;Password=secure_password;SSL Mode=Require
```

### Background Jobs (Hangfire)

```env
HANGFIRE_DASHBOARD_ENABLED=true
HANGFIRE_USERNAME=admin
HANGFIRE_PASSWORD=secure-password
```

### Redis (Optional - for caching)

```env
REDIS_CONNECTION_STRING=localhost:6379
CACHE_ENABLED=true
```

## Configuration Files

### Backend Configuration (`appsettings.json`)

The setup script creates environment-specific configuration:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=postgres;Database=YourProject;Username=devuser;Password=devpass"
  },
  "Authentication": {
    "JwtBearer": {
      "Authority": "https://login.microsoftonline.com/tenant-id/v2.0",
      "Audience": "client-id"
    }
  },
  "Authorization": {
    "AllowedDomain": "@yourcompany.com",
    "AdminEmail": "admin@yourcompany.com"
  },
  "Localization": {
    "DefaultLanguage": "en-US",
    "SupportedLanguages": ["en-US", "es-ES"],
    "EnableMultiLanguage": true
  }
}
```

### Frontend Configuration

Configuration is handled through environment variables and built-in during compilation.

## Customization Tips

### Changing Project Branding
1. Update `frontend/src/assets/` with your logos
2. Modify `frontend/tailwind.config.js` for colors
3. Update `frontend/public/favicon.ico`

### Adding Custom Environment Variables
1. Add to `.env.development`
2. For frontend variables, prefix with `VITE_`
3. For backend, add to `appsettings.json` or environment variables

### Port Conflicts Resolution
```bash
# View current port assignments
./scripts/dev-status.sh --urls

# Regenerate ports (if conflicts occur)
./scripts/setup.sh --force-init
```

## Security Best Practices

1. **Never commit secrets** - Use environment variables
2. **Rotate secrets regularly** - Especially in production
3. **Use HTTPS in production** - Update CORS origins accordingly
4. **Restrict allowed domains** - Set ALLOWED_DOMAIN appropriately
5. **Enable 2FA** - For admin accounts

## Troubleshooting Configuration

### Common Issues

**Authentication fails:**
- Verify OAuth client configuration
- Check redirect URIs match exactly
- Ensure domain restrictions are correct

**Database connection issues:**
- Verify connection string format
- Check database server availability
- Ensure credentials are correct

**Port conflicts:**
- Use `./scripts/setup.sh --force-init` to regenerate ports
- Manually check what's using conflicting ports: `netstat -tulpn | grep :5000`

**Configuration not loading:**
- Restart services after environment changes
- Check for typos in variable names
- Verify file permissions