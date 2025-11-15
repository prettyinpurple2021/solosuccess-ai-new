#!/bin/bash

# Database Backup Script for SoloSuccess AI
# This script creates automated backups of the PostgreSQL database

set -e

# Configuration
ENVIRONMENT=${1:-production}
BACKUP_DIR="/backups/database"
RETENTION_DAYS=30
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="solosuccess_${ENVIRONMENT}_${TIMESTAMP}"

# AWS Configuration
AWS_REGION=${AWS_REGION:-us-east-1}
S3_BUCKET="solosuccess-${ENVIRONMENT}-backups"
DB_INSTANCE_ID="${ENVIRONMENT}-solosuccess-db"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    if ! command -v aws &> /dev/null; then
        log_error "AWS CLI is not installed"
        exit 1
    fi
    
    if ! command -v pg_dump &> /dev/null; then
        log_error "pg_dump is not installed"
        exit 1
    fi
    
    if [ -z "$DATABASE_URL" ]; then
        log_error "DATABASE_URL environment variable is not set"
        exit 1
    fi
    
    log_info "Prerequisites check passed"
}

# Create backup directory
create_backup_dir() {
    log_info "Creating backup directory..."
    mkdir -p "$BACKUP_DIR"
}

# Create RDS snapshot
create_rds_snapshot() {
    log_info "Creating RDS snapshot..."
    
    SNAPSHOT_ID="${DB_INSTANCE_ID}-${TIMESTAMP}"
    
    aws rds create-db-snapshot \
        --db-instance-identifier "$DB_INSTANCE_ID" \
        --db-snapshot-identifier "$SNAPSHOT_ID" \
        --region "$AWS_REGION" \
        --tags Key=Environment,Value="$ENVIRONMENT" Key=Type,Value=automated Key=Timestamp,Value="$TIMESTAMP"
    
    log_info "RDS snapshot created: $SNAPSHOT_ID"
    
    # Wait for snapshot to complete
    log_info "Waiting for snapshot to complete..."
    aws rds wait db-snapshot-completed \
        --db-snapshot-identifier "$SNAPSHOT_ID" \
        --region "$AWS_REGION"
    
    log_info "RDS snapshot completed"
}

# Create logical backup using pg_dump
create_logical_backup() {
    log_info "Creating logical backup with pg_dump..."
    
    BACKUP_FILE="${BACKUP_DIR}/${BACKUP_NAME}.sql.gz"
    
    # Create compressed SQL dump
    pg_dump "$DATABASE_URL" | gzip > "$BACKUP_FILE"
    
    if [ $? -eq 0 ]; then
        log_info "Logical backup created: $BACKUP_FILE"
        
        # Get file size
        FILE_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
        log_info "Backup size: $FILE_SIZE"
    else
        log_error "Failed to create logical backup"
        exit 1
    fi
}

# Upload backup to S3
upload_to_s3() {
    log_info "Uploading backup to S3..."
    
    BACKUP_FILE="${BACKUP_DIR}/${BACKUP_NAME}.sql.gz"
    S3_PATH="s3://${S3_BUCKET}/database/${BACKUP_NAME}.sql.gz"
    
    aws s3 cp "$BACKUP_FILE" "$S3_PATH" \
        --region "$AWS_REGION" \
        --storage-class STANDARD_IA \
        --metadata "environment=$ENVIRONMENT,timestamp=$TIMESTAMP"
    
    if [ $? -eq 0 ]; then
        log_info "Backup uploaded to S3: $S3_PATH"
    else
        log_error "Failed to upload backup to S3"
        exit 1
    fi
}

# Clean up old local backups
cleanup_local_backups() {
    log_info "Cleaning up old local backups..."
    
    find "$BACKUP_DIR" -name "solosuccess_${ENVIRONMENT}_*.sql.gz" -mtime +7 -delete
    
    log_info "Local cleanup completed"
}

# Clean up old S3 backups
cleanup_s3_backups() {
    log_info "Cleaning up old S3 backups..."
    
    # List and delete backups older than retention period
    CUTOFF_DATE=$(date -d "$RETENTION_DAYS days ago" +%Y%m%d)
    
    aws s3 ls "s3://${S3_BUCKET}/database/" --region "$AWS_REGION" | \
    while read -r line; do
        BACKUP_DATE=$(echo "$line" | awk '{print $4}' | grep -oP '\d{8}' | head -1)
        BACKUP_FILE=$(echo "$line" | awk '{print $4}')
        
        if [ ! -z "$BACKUP_DATE" ] && [ "$BACKUP_DATE" -lt "$CUTOFF_DATE" ]; then
            log_info "Deleting old backup: $BACKUP_FILE"
            aws s3 rm "s3://${S3_BUCKET}/database/${BACKUP_FILE}" --region "$AWS_REGION"
        fi
    done
    
    log_info "S3 cleanup completed"
}

# Clean up old RDS snapshots
cleanup_rds_snapshots() {
    log_info "Cleaning up old RDS snapshots..."
    
    CUTOFF_DATE=$(date -d "$RETENTION_DAYS days ago" --iso-8601)
    
    aws rds describe-db-snapshots \
        --db-instance-identifier "$DB_INSTANCE_ID" \
        --region "$AWS_REGION" \
        --query "DBSnapshots[?SnapshotCreateTime<='$CUTOFF_DATE'].DBSnapshotIdentifier" \
        --output text | \
    while read -r snapshot_id; do
        if [ ! -z "$snapshot_id" ]; then
            log_info "Deleting old snapshot: $snapshot_id"
            aws rds delete-db-snapshot \
                --db-snapshot-identifier "$snapshot_id" \
                --region "$AWS_REGION"
        fi
    done
    
    log_info "RDS snapshot cleanup completed"
}

# Verify backup integrity
verify_backup() {
    log_info "Verifying backup integrity..."
    
    BACKUP_FILE="${BACKUP_DIR}/${BACKUP_NAME}.sql.gz"
    
    # Test gzip integrity
    if gzip -t "$BACKUP_FILE"; then
        log_info "Backup file integrity verified"
    else
        log_error "Backup file is corrupted"
        exit 1
    fi
}

# Send notification
send_notification() {
    STATUS=$1
    MESSAGE=$2
    
    log_info "Sending notification..."
    
    # Send to CloudWatch
    aws cloudwatch put-metric-data \
        --namespace "SoloSuccess-AI/Backups" \
        --metric-name "BackupStatus" \
        --value $([ "$STATUS" = "success" ] && echo 1 || echo 0) \
        --dimensions Environment="$ENVIRONMENT" \
        --region "$AWS_REGION"
    
    # TODO: Add Slack/Email notification here
    log_info "Notification sent"
}

# Main execution
main() {
    log_info "Starting database backup for environment: $ENVIRONMENT"
    log_info "Timestamp: $TIMESTAMP"
    
    check_prerequisites
    create_backup_dir
    
    # Create RDS snapshot
    create_rds_snapshot
    
    # Create logical backup
    create_logical_backup
    
    # Verify backup
    verify_backup
    
    # Upload to S3
    upload_to_s3
    
    # Cleanup old backups
    cleanup_local_backups
    cleanup_s3_backups
    cleanup_rds_snapshots
    
    log_info "Database backup completed successfully"
    send_notification "success" "Database backup completed for $ENVIRONMENT"
}

# Error handling
trap 'log_error "Backup failed"; send_notification "failure" "Database backup failed for $ENVIRONMENT"; exit 1' ERR

# Run main function
main
