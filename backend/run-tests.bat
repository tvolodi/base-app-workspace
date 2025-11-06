@echo off
REM Load test environment variables and run integration tests

REM Load environment variables from .env.test file
for /f "tokens=*" %%i in (.env.test) do (
    for /f "tokens=1,2 delims==" %%a in ("%%i") do (
        if not "%%a"=="" if not "%%b"=="" (
            set "%%a=%%b"
        )
    )
)

echo Running integration tests with test environment...
echo DB_HOST: %TEST_DB_HOST%
echo DB_PORT: %TEST_DB_PORT%
echo.

REM Run the tests
go test ./modules/rbac/... -v %*

REM Clean up environment variables (optional)
REM set TEST_DB_HOST=
REM set TEST_DB_PORT=
REM set TEST_DB_USER=
REM set TEST_DB_PASSWORD=
REM set TEST_DB_NAME=
REM set TEST_DB_SSLMODE=
REM set TEST_JWT_SECRET=