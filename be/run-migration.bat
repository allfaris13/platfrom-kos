@echo off
REM ===========================================
REM Migration Script Helper (Windows Batch)
REM Automatically runs database migrations
REM ===========================================

echo ========================================
echo   Database Migration Runner
echo ========================================
echo.

REM PostgreSQL Configuration (edit these if needed)
set PSQL_PATH=C:\Program Files\PostgreSql\18\bin\psql.exe
set DB_USER=postgres
set DB_NAME=koskosan_db
set DB_HOST=localhost
set DB_PORT=5432

REM Migration file
set MIGRATION_FILE=migrations\add_role_to_penyewa.sql

REM Check if migration file exists
if not exist "%MIGRATION_FILE%" (
    echo Error: Migration file not found at %MIGRATION_FILE%
    pause
    exit /b 1
)

echo [OK] Migration file found: %MIGRATION_FILE%
echo.

REM Display configuration
echo Database Configuration:
echo   Host: %DB_HOST%
echo   Port: %DB_PORT%
echo   Database: %DB_NAME%
echo   User: %DB_USER%
echo.

REM Ask for confirmation
set /p CONFIRM="Continue with migration? (y/n): "
if /i not "%CONFIRM%"=="y" (
    echo Migration cancelled.
    pause
    exit /b 0
)

echo.
echo Running migration...
echo.

REM Run migration
"%PSQL_PATH%" -U %DB_USER% -d %DB_NAME% -h %DB_HOST% -p %DB_PORT% -f "%MIGRATION_FILE%"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo Migration completed successfully!
    echo ========================================
    echo.
    
    REM Verify the migration
    echo Verifying migration...
    echo.
    
    "%PSQL_PATH%" -U %DB_USER% -d %DB_NAME% -h %DB_HOST% -p %DB_PORT% -c "\d+ penyewa"
    
    echo.
    echo Checking user roles...
    "%PSQL_PATH%" -U %DB_USER% -d %DB_NAME% -h %DB_HOST% -p %DB_PORT% -c "SELECT id, nama_lengkap, email, role FROM penyewa LIMIT 5;"
    
    echo.
    echo All done!
) else (
    echo.
    echo ========================================
    echo Migration failed!
    echo ========================================
    echo.
    echo Please check the error message above.
)

echo.
pause
