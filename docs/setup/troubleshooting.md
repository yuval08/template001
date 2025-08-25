# Troubleshooting Guide

## Quick Diagnostic Commands

```bash
# Check overall system health
./scripts/dev-status.sh --health

# View service logs
./scripts/dev-tools.sh logs <service-name>

# Database connection test
./scripts/dev-tools.sh db-shell

# Restart specific service
./scripts/dev-tools.sh restart <service-name>
```

## Common Issues

### 1. Setup Script Issues

**Script won't run / Permission denied:**
```bash
# Make script executable
chmod +x scripts/setup.sh scripts/*.sh

# Run with bash explicitly
bash scripts/setup.sh
```

**Port conflicts during setup:**
- Setup script automatically detects and resolves port conflicts
- If issues persist: `./scripts/setup.sh --force-init`

### 2. Authentication Problems

**OAuth login fails:**
1. **Check redirect URIs** in your OAuth provider:
   - Azure AD: `http://localhost:5000/signin-oidc`
   - Google: `http://localhost:5000/signin-google`
2. **Verify environment variables** in `.env.development`
3. **Domain restrictions**: Check `ALLOWED_DOMAIN` setting

**"Unauthorized" errors:**
1. Check if admin user is properly configured (`ADMIN_EMAIL`)
2. Verify OAuth provider tenant/client settings
3. Check browser console for JWT token issues

### 3. Database Connection Issues

**Database connection failed:**
```bash
# Check if PostgreSQL container is running
docker ps | grep postgres

# View database logs
./scripts/dev-tools.sh logs postgres

# Test connection manually
./scripts/dev-tools.sh db-shell
```

**Migrations won't run:**
```bash
# Run migrations manually
./scripts/dev-tools.sh db-migrate

# Reset database (WARNING: destroys data)
./scripts/dev-tools.sh db-reset
```

### 4. Docker Issues

**Containers won't start:**
```bash
# Check Docker daemon
docker --version
docker-compose --version

# View all container logs
docker-compose logs

# Rebuild everything
./scripts/dev-tools.sh rebuild
```

**"No space left on device":**
```bash
# Clean up Docker
docker system prune -f
docker volume prune -f
```

### 5. Frontend Issues

**Frontend won't load / white screen:**
1. Check browser console for errors
2. Verify API connection: `http://localhost:5000/api/health`
3. Check frontend logs: `./scripts/dev-tools.sh logs frontend`

**API calls fail:**
1. Verify `VITE_API_BASE_URL` in environment
2. Check CORS configuration
3. Ensure backend is running: `./scripts/dev-status.sh`

### 6. Performance Issues

**Slow startup times:**
- First run takes longer (Docker image building)
- Subsequent runs should be faster
- Use `./scripts/dev-status.sh --watch` to monitor

**High memory usage:**
- Normal for development with hot reload
- Production builds use less memory
- Consider increasing Docker memory limits

### 7. Development Workflow Issues

**Changes not reflected:**
1. **Frontend**: Hot reload should work automatically
2. **Backend**: Restart may be needed for some changes
3. **Database**: Run migrations after schema changes

**Tests failing:**
```bash
# Run specific test suites
./scripts/dev-tools.sh test Unit
./scripts/dev-tools.sh test Integration

# Check test logs
./scripts/dev-tools.sh logs test
```

## Environment-Specific Issues

### Development Environment

**Setup script fails:**
- Check Docker is running and you have permissions
- Ensure Git is configured properly
- Verify sufficient disk space (5GB recommended)

### Production Deployment

**Environment variables not loading:**
- Check `.env.production` file exists and is properly formatted
- Verify environment variable names (no typos)
- Ensure sensitive variables are properly secured

## Advanced Troubleshooting

### Enable Debug Logging

**Backend debugging:**
Add to `appsettings.Development.json`:
```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Debug",
      "Microsoft": "Information"
    }
  }
}
```

**Frontend debugging:**
```bash
# Enable verbose logging
VITE_LOG_LEVEL=debug npm run dev
```

### Reset Everything (Nuclear Option)

```bash
# Complete environment reset (WARNING: destroys all data)
./scripts/dev-setup.sh --reset

# Or manual cleanup
docker-compose down -v
docker system prune -f
rm -rf .project-config
./scripts/setup.sh
```

### Health Checks

```bash
# System health overview
./scripts/dev-status.sh --health

# Service URLs
./scripts/dev-status.sh --urls

# Real-time monitoring
./scripts/dev-status.sh --watch
```

## Getting Help

### Check Logs First
1. `./scripts/dev-status.sh` - Overview
2. `./scripts/dev-tools.sh logs [service]` - Specific service
3. Browser Developer Console - Frontend issues
4. `docker-compose logs` - All services

### Common Log Locations
- **Backend**: Container logs via Docker
- **Frontend**: Browser console + container logs  
- **Database**: PostgreSQL container logs
- **Setup**: Terminal output during script execution

### Before Reporting Issues
1. Run `./scripts/dev-status.sh --health`
2. Check recent changes to configuration
3. Try `./scripts/dev-tools.sh fresh` (clean restart)
4. Verify Docker has sufficient resources
5. Check for any recent system updates that might affect Docker/Node.js