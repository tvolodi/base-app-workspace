# Test Environment Setup

This directory contains scripts and configurations for running integration tests with the proper environment variables.

## Quick Start Options

### Option 1: Use the Test Runner Scripts (Recommended)

**Windows Batch:**
```cmd
run-tests.bat
```

**PowerShell:**
```powershell
.\run-tests.ps1
```

These scripts automatically load environment variables from `.env.test` and run the tests.

### Option 2: Load Environment Variables for Current Session

**PowerShell:**
```powershell
.\set-test-env.ps1
go test ./modules/rbac/... -v
```

This sets the variables for your current PowerShell session.

### Option 3: Set Persistent Environment Variables (System-wide)

**Windows Environment Variables:**
1. Press `Win + R`, type `sysdm.cpl`, press Enter
2. Go to "Advanced" tab → "Environment Variables"
3. Add the following User variables:
   - `TEST_DB_HOST=localhost`
   - `TEST_DB_PORT=5433`
   - `TEST_DB_USER=postgres`
   - `TEST_DB_PASSWORD=postgres`
   - `TEST_DB_NAME=rbac_test`
   - `TEST_DB_SSLMODE=disable`
   - `TEST_JWT_SECRET=test-jwt-secret-key-for-integration-tests`

### Option 4: PowerShell Profile (Per-session)

Add to your PowerShell profile (`$PROFILE`):

```powershell
# Test environment variables for RBAC integration tests
$env:TEST_DB_HOST = "localhost"
$env:TEST_DB_PORT = "5433"
$env:TEST_DB_USER = "postgres"
$env:TEST_DB_PASSWORD = "postgres"
$env:TEST_DB_NAME = "rbac_test"
$env:TEST_DB_SSLMODE = "disable"
$env:TEST_JWT_SECRET = "test-jwt-secret-key-for-integration-tests"
```

To edit your profile:
```powershell
notepad $PROFILE
```

### Option 5: Manual Command Line

```cmd
set TEST_DB_HOST=localhost&& set TEST_DB_PORT=5433&& go test ./modules/rbac/... -v
```

Or in PowerShell:
```powershell
$env:TEST_DB_HOST="localhost"; $env:TEST_DB_PORT="5433"; go test ./modules/rbac/... -v
```

## Files

- `.env.test` - Environment variables configuration
- `run-tests.bat` - Windows batch script to run tests with env vars
- `run-tests.ps1` - PowerShell script to run tests with env vars
- `set-test-env.ps1` - PowerShell script to set env vars for current session

## Environment Variables

| Variable | Value | Description |
|----------|-------|-------------|
| TEST_DB_HOST | localhost | PostgreSQL host |
| TEST_DB_PORT | 5433 | PostgreSQL port (different from dev DB) |
| TEST_DB_USER | postgres | Database username |
| TEST_DB_PASSWORD | postgres | Database password |
| TEST_DB_NAME | rbac_test | Test database name |
| TEST_DB_SSLMODE | disable | SSL mode for database connection |
| TEST_JWT_SECRET | test-jwt-secret-key-for-integration-tests | JWT signing secret |

## Prerequisites

Make sure the test Docker services are running:

```bash
cd ../docker
test-env.bat start
```

Wait for services to be healthy before running tests.