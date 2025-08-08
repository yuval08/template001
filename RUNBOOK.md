# Production Deployment Runbook

This runbook provides step-by-step procedures for deploying, monitoring, and troubleshooting the Intranet Starter application in production environments.

## Emergency Contacts

| Role | Contact | Phone | Email |
|------|---------|-------|-------|
| Lead Developer | [Name] | [Phone] | [Email] |
| DevOps Engineer | [Name] | [Phone] | [Email] |
| Database Admin | [Name] | [Phone] | [Email] |
| System Administrator | [Name] | [Phone] | [Email] |

## Service Overview

| Service | Purpose | Critical | Port | Health Check |
|---------|---------|----------|------|--------------|
| Frontend | Web UI | Yes | 3000 | `/health` |
| API | Backend API | Yes | 8080 | `/health` |
| Hangfire | Background Jobs | Medium | 8081 | `/hangfire` |
| PostgreSQL | Database | Yes | 5432 | `pg_isready` |
| Redis | Cache/Sessions | Medium | 6379 | `redis-cli ping` |

## Deployment Procedures

### Pre-Deployment Checklist

- [ ] Verify all tests pass in CI/CD pipeline
- [ ] Confirm staging environment is working correctly  
- [ ] Schedule deployment during low-traffic hours
- [ ] Notify team via communication channels
- [ ] Ensure backup systems are operational
- [ ] Verify rollback procedure is ready

### Standard Deployment

```bash
# 1. Connect to production server
ssh deploy@production-server

# 2. Navigate to application directory
cd /app/intranet-starter

# 3. Run deployment script
./scripts/prod-deploy.sh production

# 4. Monitor deployment logs
docker compose logs -f

# 5. Verify health checks pass
curl -f http://localhost:8080/health
curl -f http://localhost:3000/health
```

### Blue-Green Deployment

```bash
# 1. Deploy to green environment
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --scale api=0

# 2. Start new API instances
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --scale api=2

# 3. Wait for health checks
sleep 30

# 4. Verify green environment
./scripts/health-check.sh green

# 5. Switch load balancer traffic
./scripts/switch-traffic.sh green

# 6. Monitor for 5 minutes
sleep 300

# 7. Scale down blue environment if successful
docker compose scale api-blue=0
```

### Database Migration Deployment

```bash
# 1. Create database backup
docker compose exec postgres pg_dump -U postgres intranet_starter > backup_$(date +%Y%m%d_%H%M%S).sql

# 2. Run migrations in transaction
docker compose run --rm api dotnet ef database update

# 3. Verify data integrity
docker compose exec postgres psql -U postgres -d intranet_starter -c "SELECT COUNT(*) FROM Users;"

# 4. Deploy application
./scripts/prod-deploy.sh production
```

## Monitoring and Alerting

### Health Check Endpoints

| Endpoint | Expected Response | Timeout |
|----------|-------------------|---------|
| `GET /health` | `200 OK` | 5s |
| `GET /health/ready` | `200 OK` | 10s |
| `GET /health/live` | `200 OK` | 3s |

### Key Metrics to Monitor

#### Application Metrics
- Response time (< 500ms p95)
- Error rate (< 1%)
- Request throughput
- Active user sessions

#### Infrastructure Metrics
- CPU usage (< 80%)
- Memory usage (< 85%)
- Disk usage (< 90%)
- Network I/O

#### Database Metrics
- Connection count
- Query execution time
- Lock wait time
- Database size

### Monitoring Commands

```bash
# Check service status
docker compose ps

# Monitor resource usage
docker stats

# Check application logs
docker compose logs -f --tail=100 api

# Monitor database connections
docker compose exec postgres psql -U postgres -c "SELECT count(*) FROM pg_stat_activity;"

# Check Redis memory usage
docker compose exec redis redis-cli info memory

# Monitor disk space
df -h

# Check network connectivity
curl -f http://localhost:8080/health
```

## Troubleshooting Procedures

### Service Startup Issues

#### API Won't Start

```bash
# 1. Check logs
docker compose logs api

# 2. Common issues:
# - Database connection failure
# - Configuration errors
# - Port conflicts

# 3. Verify database connectivity
docker compose exec postgres pg_isready -U postgres

# 4. Check configuration
docker compose exec api env | grep ConnectionStrings

# 5. Restart service
docker compose restart api
```

#### Database Connection Issues

```bash
# 1. Check PostgreSQL status
docker compose exec postgres pg_isready -U postgres

# 2. Check connection string
echo $ConnectionStrings__DefaultConnection

# 3. Verify network connectivity
docker compose exec api ping postgres

# 4. Check PostgreSQL logs
docker compose logs postgres

# 5. Restart PostgreSQL if needed
docker compose restart postgres
```

#### Memory Issues

```bash
# 1. Check memory usage
docker stats

# 2. Check for memory leaks
docker compose exec api dotnet-dump collect -p 1 -o memory.dmp

# 3. Increase memory limits in docker-compose.prod.yml
# 4. Restart services with new limits
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### Performance Issues

#### High CPU Usage

```bash
# 1. Identify resource-heavy containers
docker stats

# 2. Check application metrics
curl http://localhost:8080/metrics

# 3. Scale API horizontally
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --scale api=3

# 4. Check for inefficient database queries
docker compose exec postgres pg_stat_statements
```

#### High Database Load

```bash
# 1. Check active connections
docker compose exec postgres psql -U postgres -c "SELECT count(*) FROM pg_stat_activity;"

# 2. Find slow queries
docker compose exec postgres psql -U postgres -c "SELECT query, mean_time FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;"

# 3. Check for locks
docker compose exec postgres psql -U postgres -c "SELECT * FROM pg_locks WHERE granted = false;"

# 4. Restart database if necessary
docker compose restart postgres
```

## Rollback Procedures

### Immediate Rollback (< 5 minutes)

```bash
# 1. Scale down new deployment
docker compose scale api=0

# 2. Restore previous containers
docker compose up -d --scale api=2 api:previous-tag

# 3. Switch load balancer back
./scripts/switch-traffic.sh blue

# 4. Monitor health
./scripts/health-check.sh blue
```

### Database Rollback

```bash
# 1. Stop all services
docker compose down

# 2. Restore database from backup
docker compose up -d postgres
docker compose exec postgres psql -U postgres -d intranet_starter < backup_YYYYMMDD_HHMMSS.sql

# 3. Restore previous application version
git checkout previous-stable-tag
docker compose build
docker compose up -d

# 4. Verify functionality
./scripts/health-check.sh
```

### Full System Rollback

```bash
# 1. Document current issue
echo "Rollback initiated at $(date): [REASON]" >> /var/log/rollback.log

# 2. Stop current services
docker compose down

# 3. Checkout previous version
git checkout [PREVIOUS_STABLE_TAG]

# 4. Restore database if needed
# (See Database Rollback section)

# 5. Deploy previous version
./scripts/prod-deploy.sh production

# 6. Verify all services
./scripts/health-check.sh

# 7. Update monitoring
# Notify team of rollback completion
```

## Maintenance Procedures

### Scheduled Maintenance Window

```bash
# 1. Pre-maintenance (15 minutes before)
# - Notify users of upcoming maintenance
# - Create database backup
# - Verify rollback procedures

# 2. Start maintenance
# - Put site in maintenance mode
docker compose scale frontend=0
# - Display maintenance page

# 3. Perform maintenance
# - Apply updates
# - Run database migrations
# - Update configurations

# 4. End maintenance
# - Start services
docker compose up -d
# - Verify functionality
# - Remove maintenance mode
# - Notify users
```

### Database Maintenance

```bash
# 1. Create backup
docker compose exec postgres pg_dump -U postgres intranet_starter > maint_backup_$(date +%Y%m%d).sql

# 2. Run VACUUM and ANALYZE
docker compose exec postgres psql -U postgres -d intranet_starter -c "VACUUM ANALYZE;"

# 3. Check database integrity
docker compose exec postgres psql -U postgres -d intranet_starter -c "SELECT pg_database_size('intranet_starter');"

# 4. Update statistics
docker compose exec postgres psql -U postgres -d intranet_starter -c "ANALYZE;"
```

### Log Rotation and Cleanup

```bash
# 1. Archive old logs
tar -czf logs_archive_$(date +%Y%m%d).tar.gz logs/
mv logs_archive_*.tar.gz /backup/logs/

# 2. Clean up old log files
find logs/ -name "*.log" -mtime +30 -delete

# 3. Clean up old Docker images
docker image prune -a --filter "until=720h"

# 4. Clean up old backups
find /backup -name "*.sql" -mtime +90 -delete
```

## Security Incident Response

### Suspected Security Breach

1. **Immediate Response**:
   ```bash
   # Isolate affected systems
   docker network disconnect intranet-network api
   
   # Stop external access
   docker compose scale frontend=0
   
   # Capture logs
   docker compose logs > security_incident_$(date +%Y%m%d_%H%M%S).log
   ```

2. **Investigation**:
   - Review access logs
   - Check for unauthorized changes
   - Analyze network traffic
   - Document findings

3. **Recovery**:
   - Restore from clean backup
   - Update security configurations
   - Patch vulnerabilities
   - Resume operations

### Data Breach Response

1. **Containment**: Stop all services immediately
2. **Assessment**: Determine scope of breach
3. **Notification**: Follow legal requirements
4. **Recovery**: Restore from clean state
5. **Prevention**: Implement additional controls

## Disaster Recovery

### Site Failure

1. **Activate DR site**
2. **Restore data from backups**
3. **Update DNS records**
4. **Verify functionality**
5. **Monitor performance**

### Data Center Outage

1. **Switch to backup data center**
2. **Restore services from images**
3. **Sync data from replicas**
4. **Test all functionality**
5. **Update monitoring**

## Contact Information

### Escalation Path

1. **Level 1**: On-call developer
2. **Level 2**: DevOps team lead
3. **Level 3**: Engineering manager
4. **Level 4**: CTO

### External Services

| Service | Contact | Purpose |
|---------|---------|---------|
| Cloud Provider | [Support] | Infrastructure issues |
| DNS Provider | [Support] | Domain/DNS issues |
| CDN Provider | [Support] | Content delivery |
| Monitoring Service | [Support] | Alerting issues |

---

**Last Updated**: [DATE]  
**Version**: 1.0  
**Next Review**: [DATE]