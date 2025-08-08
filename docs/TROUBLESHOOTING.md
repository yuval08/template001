# Troubleshooting Guide

## Common Issues & Solutions

### 1. Authentication Problems

#### Azure AD Login Failures
- **Symptoms**: Unable to log in, blank screen after redirect
- **Solutions**:
  1. Verify redirect URI in Azure AD application settings
  2. Check client secret validity
  3. Ensure domain restrictions are configured correctly

```bash
# Verify Azure AD configuration
az ad app list --query "[?displayName=='IntranetStarter']"
```

#### Google OAuth Issues
- **Symptoms**: Google login button non-functional
- **Solutions**:
  1. Validate OAuth consent screen
  2. Check client credentials
  3. Verify allowed domains

### 2. Database Connection

#### Connection String Problems
- **Symptoms**: Database connection errors
- **Diagnostic Commands**:
```bash
# Test PostgreSQL connection
psql -h localhost -U intranetuser -d intranet_db

# Check Docker postgres logs
docker logs postgres_container
```

- **Common Fixes**:
  1. Verify connection string
  2. Check network configuration
  3. Ensure PostgreSQL is running

### 3. Backend Startup Issues

#### Port Conflicts
- **Symptoms**: "Address already in use" error
- **Solutions**:
  1. Stop conflicting services
  2. Change application port
  3. Use different Docker port mapping

```bash
# Find process using port
lsof -i :5000
kill -9 <PID>
```

### 4. Frontend Build Problems

#### Dependency Installation
- **Symptoms**: npm install fails
- **Solutions**:
  1. Clear npm cache
  2. Remove node_modules
  3. Use specific Node.js version

```bash
npm cache clean --force
rm -rf node_modules
npm install
```

### 5. Docker Deployment

#### Container Startup Failures
- **Diagnostic Steps**:
```bash
# View container logs
docker-compose logs backend
docker-compose logs frontend

# Check container status
docker-compose ps
```

- **Common Resolutions**:
  1. Rebuild containers
  2. Check Dockerfile
  3. Verify environment variables

### 6. Performance Issues

#### Slow API Responses
- **Diagnostic Tools**:
  - Postman for API timing
  - Browser Network tab
  - Prometheus metrics

- **Optimization Strategies**:
  1. Database query optimization
  2. Implement caching
  3. Analyze bottlenecks

### 7. Logging & Debugging

#### Enabling Verbose Logging
```csharp
// Appsettings.json
{
  "Logging": {
    "LogLevel": {
      "Default": "Debug",
      "Microsoft": "Warning",
      "System": "Information"
    }
  }
}
```

### 8. Security & Access Control

#### Role-Based Access Issues
- **Troubleshooting**:
  1. Verify user roles
  2. Check token claims
  3. Validate authorization logic

```bash
# Decode JWT to inspect claims
jwt.io
```

### 9. SignalR Real-time Communication

#### Connection Problems
- **Symptoms**: Notifications not working
- **Solutions**:
  1. Check WebSocket connectivity
  2. Verify SignalR hub configuration
  3. Test with simple message

### 10. Environment-Specific Issues

#### Development vs Production Differences
- Use environment-specific configurations
- Maintain separate `.env` files
- Use configuration management tools

## Diagnostic Flowchart

```
Start Troubleshooting
│
├── Authentication Issue?
│   ├── Azure AD Config
│   └── Google OAuth
│
├── Database Problem?
│   ├── Connection String
│   └── Migration Issues
│
├── Backend Startup?
│   ├── Port Conflicts
│   └── Dependency Problems
│
├── Frontend Build?
│   ├── npm Install
│   └── Dependency Conflicts
│
└── Performance Concern?
    ├── API Response Time
    └── Database Query Optimization
```

## Best Practices

### Proactive Measures
- Keep dependencies updated
- Regular security patches
- Comprehensive logging
- Monitoring and alerting

### Recommended Tools
- Postman
- Docker Desktop
- Visual Studio Debugger
- Browser DevTools
- Prometheus/Grafana

## Support Channels
- GitHub Issues
- Community Forum
- Enterprise Support Contract

## When to Escalate
- Persistent authentication failures
- Critical security vulnerabilities
- Data integrity concerns
- Performance degradation

## Documentation Updates
- Report undocumented issues
- Contribute to troubleshooting guide
- Share resolution strategies

## Emergency Contacts
- DevOps Team: devops@company.com
- Security Hotline: +1 (555) SUPPORT