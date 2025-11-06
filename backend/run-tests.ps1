# Load test environment variables and run integration tests
param(
    [Parameter(ValueFromRemainingArguments=$true)]
    [string[]]$TestArgs
)

# Load environment variables from .env.test file
if (Test-Path ".env.test") {
    Get-Content ".env.test" | ForEach-Object {
        if ($_ -match '^([^=]+)=(.*)$') {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()
            if ($key -and $value) {
                [Environment]::SetEnvironmentVariable($key, $value, "Process")
                Write-Host "Set $key=$value"
            }
        }
    }
}

Write-Host "Running integration tests with test environment..."
Write-Host "DB_HOST: $env:TEST_DB_HOST"
Write-Host "DB_PORT: $env:TEST_DB_PORT"
Write-Host ""

# Run the tests
& go test ./modules/rbac/... -v @TestArgs