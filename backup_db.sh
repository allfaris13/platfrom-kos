#!/bin/bash

# Configuration
CONTAINER_NAME="koskosan-db"
DB_USER=${DB_USER:-"postgres"}
BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
FILENAME="$BACKUP_DIR/db_backup_$TIMESTAMP.sql.gz"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

echo "Starting backup for container $CONTAINER_NAME..."

# Check if container is running
if [ ! "$(docker ps -q -f name=$CONTAINER_NAME)" ]; then
    echo "Error: Container $CONTAINER_NAME is not running."
    exit 1
fi

# Run pg_dump inside the container and pipe to gzip
docker exec -t "$CONTAINER_NAME" pg_dump -U "$DB_USER" | gzip > "$FILENAME"

if [ ${PIPESTATUS[0]} -eq 0 ]; then
    echo "Backup successful: $FILENAME"
    echo "Size: $(du -h "$FILENAME" | cut -f1)"
else
    echo "Error: Backup failed."
    rm -f "$FILENAME"
    exit 1
fi

# Cleanup old backups (keep last 7 days)
find "$BACKUP_DIR" -name "db_backup_*.sql.gz" -mtime +7 -delete

echo "Backup process completed."
