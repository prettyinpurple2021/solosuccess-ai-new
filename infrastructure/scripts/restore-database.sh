#!/bin/bash

# Database Restore Script for SoloSuccess AI
# This script restores the PostgreSQL database from backups

set -e

# Configuration
ENVIRONMENT=${1:-production}
RESTORE_TYPE=${2:-latest}  # latest, snapshot, or specific backup file
BACKUP_IDENTIFIER=${3:-}   # Optional: specific backup file or snapshot ID

# AWS Configuration
AWS_REGION=${AWS_REGION:-us-east-1}
S3_BUCKET="solosuccess-${ENVIRONMENT}-backups"
DB_INSTANCE_ID="${ENVIRONMENT}-solosuccess-db"
RESTORE_DIR="/tmp/restore"

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
    
    if ! command -v psql &> /dev/null; then
        log_error "psql is not installed"
        exit 1
    fi
    
    if [ -z "$DATABASE_URL" ]; then
        log_error "DATABASE_URL environment variable is not set"
        exit 1
    fi
    
    log_info "Prerequisites check passed"
}

# Confirm restore operation
confirm_restore() {
    log_warn "WARNING: This will restore the database and may overwrite existing data!"
    log_warn "Environment: $ENVIRONMENT"
    log_warn "Restore type: $RESTORE_TYPE"
    
    read -p "Are you sure you want to continue? (yes/no): " CONFIRM
    
    if [ "$CONFIRM" != "yes" ]; then
        log_info "Restore cancelled by user"
        exit 0
    fi
}

# Get latest backup from S3
get_latest_backup() {
    log_info "Finding latest backup in S3..."
    
    LATEST_BACKUP=$(aws s3 ls "s3://${S3_BUCKET}/database/" --region "$AWS_REGION" | \
        grep "solosuccess_${ENVIRONMENT}" | \
        sort | \
        tail -n 1 | \
        awk '{print $4}')
    
    if [ -z "$LATEST_BACKUP" ]; then
        log_error "No backups found in S3"
        exit 1
    fi
    
    log_info "Latest backup: $LATEST_BACKUP"
    echo "$LATEST_BACKUP"
}

# Download backup from S3
download_backup() {
    BACKUP_FILE=$1
    
    log_info "Downloading backup from S3..."
    
    mkdir -p "$RESTORE_DIR"
    LOCAL_FILE="${RESTORE_DIR}/${BACKUP_FILE}"
    
    aws s3 cp "s3://${S3_BUCKET}/database/${BACKUP_FILE}" "$LOCAL_FILE" \
        --region "$AWS_REGION"
    
    if [ $? -eq 0 ]; then
        log_info "Backup downloaded: $LOCAL_FILE"
        echo "$LOCAL_FILE"
    else
        log_error "Failed to download backup"
        exit 1
    fi
}

# Restore from RDS snapshot
restore_from_snapshot() {
    SNAPSHOT_ID=$1
    
    log_info "Restoring from RDS snapshot: $SNAPSHOT_ID"
    
    # Create new DB instance from snapshot
    RESTORE_INSTANCE_ID="${DB_INSTANCE_ID}-restore-$(date +%Y%m%d%H%M%S)"
    
    aws rds restore-db-instance-from-db-snapshot \
        --db-instance-identifier "$RESTORE_INSTANCE_ID" \
        --db-snapshot-identifier "$SNAPSHOT_ID" \
        --region "$AWS_REGION"
    
    log_info "Waiting for restore to complete..."
    aws rds wait db-instance-available \
        --db-instance-identifier "$RESTORE_INSTANCE_ID" \
        --region "$AWS_REGION"
    
    log_info "RDS restore completed"
    log_info "New instance: $RESTORE_INSTANCE_ID"
    log_warn "Please update your DATABASE_URL to point to the new instance"
}

# Restore from logical backup
restore_from_backup() {
    BACKUP_FILE=$1
    
    log_info "Restoring from logical backup..."
    
    # Create a backup of current database before restore
    log_info "Creating safety backup of current database..."
    SAFETY_BACKUP="${RESTORE_DIR}/pre_restore_backup_$(date +%Y%m%d%H%M%S).sql.gz"
    pg_dump "$DATABASE_URL" | gzip > "$SAFETY_BACKUP"
    log_info "Safety backup created: $SAFETY_BACKUP"
    
    # Drop all connections to the database
    log_info "Terminating active connections..."
    psql "$DATABASE_URL" -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = current_database() AND pid <> pg_backend_pid();"
    
    # Restore the backup
    log_info "Restoring database..."
    gunzip -c "$BACKUP_FILE" | psql "$DATABASE_URL"
    
    if [ $? -eq 0 ]; then
        log_info "Database restored successfully"
    else
        log_error "Database restore failed"
        log_warn "Safety backup available at: $SAFETY_BACKUP"
        exit 1
    fi
}

# Verify restore
verify_restore() {
    log_info "Verifying restore..."
    
    # Check database connectivity
    if psql "$DATABASE_URL" -c "SELECT 1" > /dev/null 2>&1; then
        log_info "Database connectivity verified"
    else
        log_error "Database connectivity check failed"
        exit 1
    fi
    
    # Check table count
    TABLE_COUNT=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public'")
    log_info "Table count: $TABLE_COUNT"
    
    # Run Prisma migrations to ensure schema is up to date
    log_info "Running Prisma migrations..."
    cd "$(dirname "$0")/../../solosuccess-ai"
    npx prisma migrate deploy
    
    log_info "Restore verification completed"
}

# Cleanup
cleanup() {
    log_info "Cleaning up temporary files..."
    rm -rf "$RESTORE_DIR"
    log_info "Cleanup completed"
}

# List available backups
list_backups() {
    log_info "Available backups in S3:"
    aws s3 ls "s3://${S3_BUCKET}/database/" --region "$AWS_REGION" | \
        grep "solosuccess_${ENVIRONMENT}"
    
    log_info "\nAvailable RDS snapshots:"
    aws rds describe-db-snapshots \
        --db-instance-identifier "$DB_INSTANCE_ID" \
        --region "$AWS_REGION" \
        --query "DBSnapshots[*].[DBSnapshotIdentifier,SnapshotCreateTime,Status]" \
        --output table
}

# Main execution
main() {
    log_info "Starting database restore for environment: $ENVIRONMENT"
    
    check_prerequisites
    
    # List backups if requested
    if [ "$RESTORE_TYPE" = "list" ]; then
        list_backups
        exit 0
    fi
    
    confirm_restore
    
    case "$RESTORE_TYPE" in
        latest)
            BACKUP_FILE=$(get_latest_backup)
            LOCAL_FILE=$(download_backup "$BACKUP_FILE")
            restore_from_backup "$LOCAL_FILE"
            verify_restore
            ;;
        snapshot)
            if [ -z "$BACKUP_IDENTIFIER" ]; then
                log_error "Snapshot ID required for snapshot restore"
                exit 1
            fi
            restore_from_snapshot "$BACKUP_IDENTIFIER"
            ;;
        file)
            if [ -z "$BACKUP_IDENTIFIER" ]; then
                log_error "Backup file name required for file restore"
                exit 1
            fi
            LOCAL_FILE=$(download_backup "$BACKUP_IDENTIFIER")
            restore_from_backup "$LOCAL_FILE"
            verify_restore
            ;;
        *)
            log_error "Invalid restore type: $RESTORE_TYPE"
            log_info "Valid types: latest, snapshot, file, list"
            exit 1
            ;;
    esac
    
    cleanup
    
    log_info "Database restore completed successfully"
}

# Error handling
trap 'log_error "Restore failed"; cleanup; exit 1' ERR

# Run main function
main
