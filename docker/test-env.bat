@echo off
REM Test Environment Management Script for Windows

if "%1"=="start" goto start
if "%1"=="stop" goto stop
if "%1"=="restart" goto restart
if "%1"=="logs" goto logs
if "%1"=="status" goto status
goto help

:start
echo Starting test environment...
docker-compose -f docker-compose.test.yml up -d
echo Test environment started!
echo PostgreSQL: localhost:5433
echo Keycloak Admin: http://localhost:8081
goto end

:stop
echo Stopping test environment...
docker-compose -f docker-compose.test.yml down
echo Test environment stopped!
goto end

:restart
echo Restarting test environment...
docker-compose -f docker-compose.test.yml down
docker-compose -f docker-compose.test.yml up -d
echo Test environment restarted!
goto end

:logs
docker-compose -f docker-compose.test.yml logs -f
goto end

:status
echo Test environment status:
docker-compose -f docker-compose.test.yml ps
goto end

:help
echo Test Environment Management Script
echo.
echo Usage: test-env.bat [command]
echo.
echo Commands:
echo   start   - Start PostgreSQL and Keycloak test services
echo   stop    - Stop test services
echo   restart - Restart test services
echo   logs    - Show logs from test services
echo   status  - Show status of test services
echo.
echo Example: test-env.bat start
goto end

:end