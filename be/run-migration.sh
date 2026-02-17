#!/bin/bash

# ===========================================
# Migration Script Helper
# Automatically runs database migrations
# ===========================================

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}  Database Migration Runner${NC}"
echo -e "${YELLOW}========================================${NC}"
echo ""

# PostgreSQL Configuration (edit these if needed)
PSQL_PATH="/c/Program Files/PostgreSql/18/bin/psql.exe"
DB_USER="postgres"
DB_NAME="koskosan"
DB_HOST="localhost"
DB_PORT="5432"

# Migration file
MIGRATION_FILE="./migrations/add_role_to_penyewa.sql"

# Check if migration file exists
if [ ! -f "$MIGRATION_FILE" ]; then
    echo -e "${RED}❌ Error: Migration file not found at $MIGRATION_FILE${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} Migration file found: $MIGRATION_FILE"
echo ""

# Display configuration
echo -e "${YELLOW}Database Configuration:${NC}"
echo "  Host: $DB_HOST"
echo "  Port: $DB_PORT"
echo "  Database: $DB_NAME"
echo "  User: $DB_USER"
echo ""

# Ask for confirmation
read -p "Continue with migration? (y/n): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Migration cancelled.${NC}"
    exit 0
fi

echo ""
echo -e "${YELLOW}Running migration...${NC}"
echo ""

# Run migration
"$PSQL_PATH" -U "$DB_USER" -d "$DB_NAME" -h "$DB_HOST" -p "$DB_PORT" -f "$MIGRATION_FILE"

# Check exit status
if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}✓ Migration completed successfully!${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""
    
    # Verify the migration
    echo -e "${YELLOW}Verifying migration...${NC}"
    echo ""
    
    "$PSQL_PATH" -U "$DB_USER" -d "$DB_NAME" -h "$DB_HOST" -p "$DB_PORT" -c "\d+ penyewa" | grep "role"
    
    if [ $? -eq 0 ]; then
        echo ""
        echo -e "${GREEN}✓ Column 'role' successfully added to 'penyewa' table${NC}"
    fi
    
    echo ""
    echo -e "${YELLOW}Checking user roles...${NC}"
    "$PSQL_PATH" -U "$DB_USER" -d "$DB_NAME" -h "$DB_HOST" -p "$DB_PORT" -c "SELECT id, nama_lengkap, email, role FROM penyewa LIMIT 5;"
    
else
    echo ""
    echo -e "${RED}========================================${NC}"
    echo -e "${RED}❌ Migration failed!${NC}"
    echo -e "${RED}========================================${NC}"
    echo ""
    echo "Please check the error message above."
    exit 1
fi

echo ""
echo -e "${GREEN}All done! 🎉${NC}"
echo ""
