# Set test environment variables for the current session
$env:TEST_DB_HOST = "localhost"
$env:TEST_DB_PORT = "5433"
$env:TEST_DB_USER = "postgres"
$env:TEST_DB_PASSWORD = "postgres"
$env:TEST_DB_NAME = "rbac_test"
$env:TEST_DB_SSLMODE = "disable"
$env:TEST_JWT_SECRET = "test-jwt-secret-key-for-integration-tests"

Write-Host "Test environment variables set for this session:"
Write-Host "TEST_DB_HOST=$env:TEST_DB_HOST"
Write-Host "TEST_DB_PORT=$env:TEST_DB_PORT"
Write-Host "TEST_DB_USER=$env:TEST_DB_USER"
Write-Host "TEST_DB_NAME=$env:TEST_DB_NAME"