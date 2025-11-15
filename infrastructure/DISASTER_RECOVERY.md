## Disaster Recovery Plan

This document outlines the disaster recovery procedures for the SoloSuccess AI platform.

## Table of Contents

1. [Overview](#overview)
2. [Recovery Objectives](#recovery-objectives)
3. [Backup Strategy](#backup-strategy)
4. [Recovery Procedures](#recovery-procedures)
5. [Testing](#testing)
6. [Contacts](#contacts)

## Overview

The SoloSuccess AI disaster recovery plan ensures business continuity in the event of system failures, data loss, or catastrophic events. This plan covers all critical components of the platform including databases, application servers, and file storage.

### Scope

- Database (PostgreSQL on RDS)
- Application servers (ECS tasks)
- File storage (S3)
- Cache layer (ElastiCache Redis)
- Configuration and secrets

### Recovery Time Objective (RTO)

- **Critical Systems**: 4 hours
- **Non-Critical Systems**: 24 hours

### Recovery Point Objective (RPO)

- **Database**: 6 hours (automated backups every 6 hours)
- **File Storage**: 24 hours (S3 versioning enabled)
- **Configuration**: Real-time (Infrastructure as Code)

## Recovery Objectives

### Priority Levels

**P0 - Critical (RTO: 1 hour)**
- Database
- Authentication service
- Core API endpoints

**P1 - High (RTO: 4 hours)**
- AI service
- Frontend application
- Payment processing

**P2 - Medium (RTO: 12 hours)**
- Analytics
- Notifications
- Background jobs

**P3 - Low (RTO: 24 hours)**
- Reporting
- Admin tools
- Non-critical features

## Backup Strategy

### Database Backups

#### Automated Backups

1. **RDS Automated Backups**
   - Frequency: Daily
   - Retention: 30 days
   - Type: Full snapshot
   - Storage: AWS RDS backup storage

2. **Logical Backups (pg_dump)**
   - Frequency: Every 6 hours
   - Retention: 30 days
   - Type: SQL dump (compressed)
   - Storage: S3 with Standard-IA storage class

#### Backup Schedule

```
00:00 UTC - Full RDS snapshot + Logical backup
06:00 UTC - Logical backup
12:00 UTC - Logical backup
18:00 UTC - Logical backup
```

#### Backup Verification

- Automated integrity checks after each backup
- Weekly restore tests to staging environment
- Monthly full disaster recovery drills

### File Storage Backups

- **S3 Versioning**: Enabled on all buckets
- **Cross-Region Replication**: Enabled to us-west-2
- **Lifecycle Policies**: 
  - Current versions: Retained indefinitely
  - Non-current versions: 90 days
  - Deleted markers: 30 days

### Configuration Backups

- **Infrastructure as Code**: Terraform state in S3 with versioning
- **Application Config**: Stored in Git repository
- **Secrets**: AWS Secrets Manager with automatic rotation

### Application Backups

- **Docker Images**: Stored in ECR with retention policy
- **Code Repository**: GitHub with multiple redundancy
- **Dependencies**: npm packages cached in S3

## Recovery Procedures

### Database Recovery

#### Scenario 1: Database Corruption or Data Loss

**Detection:**
- Monitoring alerts for database errors
- User reports of missing or incorrect data
- Application errors related to database queries

**Recovery Steps:**

1. **Assess the Situation**
   ```bash
   # Check database status
   aws rds describe-db-instances \
     --db-instance-identifier production-solosuccess-db \
     --region us-east-1
   
   # Check recent backups
   ./infrastructure/scripts/restore-database.sh production list
   ```

2. **Identify Recovery Point**
   - Determine the last known good state
   - Identify the backup to restore from
   - Calculate data loss window

3. **Notify Stakeholders**
   - Alert engineering team
   - Notify customer support
   - Update status page

4. **Perform Restore**
   ```bash
   # Restore from latest backup
   ./infrastructure/scripts/restore-database.sh production latest
   
   # Or restore from specific backup
   ./infrastructure/scripts/restore-database.sh production file solosuccess_production_20240115_120000.sql.gz
   ```

5. **Verify Restore**
   ```bash
   # Run verification queries
   psql $DATABASE_URL -c "SELECT COUNT(*) FROM users"
   psql $DATABASE_URL -c "SELECT MAX(created_at) FROM users"
   
   # Run application health checks
   curl https://solosuccess.ai/api/health
   ```

6. **Resume Operations**
   - Update status page
   - Notify stakeholders
   - Document incident

#### Scenario 2: Complete Database Failure

**Recovery Steps:**

1. **Create New RDS Instance from Snapshot**
   ```bash
   # List available snapshots
   aws rds describe-db-snapshots \
     --db-instance-identifier production-solosuccess-db
   
   # Restore from snapshot
   ./infrastructure/scripts/restore-database.sh production snapshot <snapshot-id>
   ```

2. **Update DNS/Connection Strings**
   - Update DATABASE_URL in Vercel
   - Update ECS task definitions
   - Update secrets in AWS Secrets Manager

3. **Verify and Test**
   - Run smoke tests
   - Verify data integrity
   - Test critical user flows

### Application Server Recovery

#### Scenario: ECS Service Failure

**Recovery Steps:**

1. **Check Service Status**
   ```bash
   aws ecs describe-services \
     --cluster solosuccess-production \
     --services solosuccess-ai-service
   ```

2. **Force New Deployment**
   ```bash
   aws ecs update-service \
     --cluster solosuccess-production \
     --service solosuccess-ai-service \
     --force-new-deployment
   ```

3. **Scale Up if Needed**
   ```bash
   aws ecs update-service \
     --cluster solosuccess-production \
     --service solosuccess-ai-service \
     --desired-count 5
   ```

4. **Check Logs**
   ```bash
   aws logs tail /ecs/production/solosuccess-ai-service --follow
   ```

### Frontend Recovery

#### Scenario: Vercel Deployment Failure

**Recovery Steps:**

1. **Rollback to Previous Deployment**
   ```bash
   vercel ls
   vercel rollback <previous-deployment-url>
   ```

2. **Redeploy if Needed**
   ```bash
   cd solosuccess-ai
   vercel --prod
   ```

3. **Verify Deployment**
   ```bash
   curl https://solosuccess.ai
   ```

### Complete Infrastructure Failure

#### Scenario: AWS Region Outage

**Recovery Steps:**

1. **Activate DR Region (us-west-2)**
   ```bash
   cd infrastructure/terraform
   terraform workspace select dr
   terraform apply -var-file=environments/dr.tfvars
   ```

2. **Restore Database in DR Region**
   - Restore from cross-region replicated backup
   - Update connection strings

3. **Deploy Application**
   - Deploy frontend to Vercel (automatic failover)
   - Deploy backend to DR ECS cluster
   - Update DNS to point to DR region

4. **Verify Services**
   - Run full smoke test suite
   - Verify all integrations
   - Test critical user flows

5. **Update Status**
   - Notify users of region switch
   - Update monitoring dashboards
   - Document incident

## Testing

### Backup Testing Schedule

**Weekly:**
- Restore latest backup to staging environment
- Verify data integrity
- Test application functionality

**Monthly:**
- Full disaster recovery drill
- Test complete infrastructure rebuild
- Verify all recovery procedures

**Quarterly:**
- Cross-region failover test
- Complete DR plan review
- Update procedures based on lessons learned

### Test Procedures

#### Weekly Backup Restore Test

```bash
# 1. Restore to staging
export DATABASE_URL=$STAGING_DATABASE_URL
./infrastructure/scripts/restore-database.sh staging latest

# 2. Run verification queries
psql $DATABASE_URL -f tests/verify-restore.sql

# 3. Run application tests
cd solosuccess-ai
npm run test:integration

# 4. Document results
echo "Restore test completed: $(date)" >> restore-test-log.txt
```

#### Monthly DR Drill

1. Schedule maintenance window
2. Simulate failure scenario
3. Execute recovery procedures
4. Measure RTO and RPO
5. Document lessons learned
6. Update procedures

## Contacts

### Emergency Contacts

**On-Call Engineer**
- Primary: [Phone/Slack]
- Secondary: [Phone/Slack]

**Engineering Lead**
- Name: [Name]
- Phone: [Phone]
- Email: [Email]

**DevOps Team**
- Slack: #devops-emergency
- Email: devops@solosuccess.ai

**AWS Support**
- Support Level: Business/Enterprise
- Phone: [AWS Support Number]
- Case Portal: https://console.aws.amazon.com/support

### Escalation Path

1. On-Call Engineer (0-15 minutes)
2. Engineering Lead (15-30 minutes)
3. CTO (30-60 minutes)
4. CEO (60+ minutes or major incident)

## Incident Response

### Severity Levels

**SEV1 - Critical**
- Complete service outage
- Data loss affecting multiple users
- Security breach
- Response Time: Immediate

**SEV2 - High**
- Partial service outage
- Performance degradation affecting users
- Single component failure
- Response Time: 15 minutes

**SEV3 - Medium**
- Minor service degradation
- Non-critical feature unavailable
- Response Time: 1 hour

**SEV4 - Low**
- Cosmetic issues
- Non-urgent bugs
- Response Time: Next business day

### Incident Response Process

1. **Detection**
   - Monitoring alerts
   - User reports
   - Health check failures

2. **Assessment**
   - Determine severity
   - Identify affected systems
   - Estimate impact

3. **Communication**
   - Alert on-call engineer
   - Update status page
   - Notify stakeholders

4. **Mitigation**
   - Execute recovery procedures
   - Implement workarounds
   - Monitor progress

5. **Resolution**
   - Verify fix
   - Resume normal operations
   - Update status page

6. **Post-Mortem**
   - Document incident
   - Identify root cause
   - Create action items
   - Update procedures

## Runbooks

### Database Backup Runbook

**Frequency:** Every 6 hours (automated)

**Steps:**
1. Backup script runs via cron job
2. Creates RDS snapshot
3. Creates logical backup with pg_dump
4. Uploads to S3
5. Cleans up old backups
6. Sends notification

**Monitoring:**
- CloudWatch metric: BackupStatus
- Alert if backup fails
- Daily backup report

**Troubleshooting:**
- Check CloudWatch logs
- Verify S3 permissions
- Check disk space
- Verify database connectivity

### Database Restore Runbook

**When to Use:**
- Data corruption
- Accidental deletion
- Database failure
- Disaster recovery

**Prerequisites:**
- Backup file or snapshot ID
- Database credentials
- Approval from engineering lead

**Steps:**
1. Identify restore point
2. Notify stakeholders
3. Create safety backup
4. Execute restore script
5. Verify restore
6. Resume operations

**Verification:**
- Check table counts
- Verify recent data
- Run application tests
- Check user reports

## Maintenance

### Regular Maintenance Tasks

**Daily:**
- Review backup logs
- Check monitoring dashboards
- Verify alert functionality

**Weekly:**
- Test backup restore
- Review incident logs
- Update documentation

**Monthly:**
- DR drill
- Review and update contacts
- Test escalation procedures

**Quarterly:**
- Full DR plan review
- Update RTO/RPO targets
- Review and update procedures
- Conduct training

## Documentation

### Required Documentation

- [ ] Current infrastructure diagram
- [ ] Database schema documentation
- [ ] API documentation
- [ ] Deployment procedures
- [ ] Monitoring setup
- [ ] Alert configurations
- [ ] Contact information
- [ ] Vendor contracts

### Document Locations

- **Infrastructure Docs:** `/infrastructure/docs/`
- **Runbooks:** `/infrastructure/runbooks/`
- **Incident Reports:** `/incidents/`
- **DR Plan:** `/infrastructure/DISASTER_RECOVERY.md`

## Compliance

### Regulatory Requirements

- **GDPR:** Data backup and recovery procedures
- **SOC 2:** Backup testing and documentation
- **PCI DSS:** Secure backup storage and encryption

### Audit Trail

- All backup operations logged
- Restore operations require approval
- Incident reports maintained
- DR tests documented

## Appendix

### Useful Commands

```bash
# List backups
./infrastructure/scripts/restore-database.sh production list

# Restore latest backup
./infrastructure/scripts/restore-database.sh production latest

# Restore specific backup
./infrastructure/scripts/restore-database.sh production file <filename>

# Restore from snapshot
./infrastructure/scripts/restore-database.sh production snapshot <snapshot-id>

# Check RDS status
aws rds describe-db-instances --db-instance-identifier production-solosuccess-db

# Check ECS service
aws ecs describe-services --cluster solosuccess-production --services solosuccess-ai-service

# View logs
aws logs tail /ecs/production/solosuccess-ai-service --follow

# Force new deployment
aws ecs update-service --cluster solosuccess-production --service solosuccess-ai-service --force-new-deployment
```

### Recovery Time Estimates

| Component | Recovery Time | Notes |
|-----------|---------------|-------|
| Database (from snapshot) | 30-60 minutes | Depends on size |
| Database (from backup) | 15-30 minutes | Faster for logical restore |
| ECS Service | 5-10 minutes | Force new deployment |
| Frontend | 2-5 minutes | Vercel rollback |
| Complete Infrastructure | 2-4 hours | Full rebuild |
| Cross-Region Failover | 4-6 hours | Includes DNS propagation |

### Change Log

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| 2024-01-15 | 1.0 | Initial version | DevOps Team |
