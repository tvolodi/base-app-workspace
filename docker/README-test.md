# Test Environment Setup

This directory contains Docker configurations for running integration tests with PostgreSQL and Keycloak.

## Files

- `docker-compose.test.yml` - Docker Compose configuration for test services
- `keycloak-realm.json` - Keycloak realm configuration with test users and roles
- `init-test-db.sql` - PostgreSQL initialization script

## Services

### PostgreSQL (test-postgres)
- **Port**: 5433 (mapped from container port 5432)
- **Database**: rbac_test
- **Username**: postgres
- **Password**: postgres

### Keycloak (test-keycloak)
- **Admin Console**: http://localhost:8081
- **Admin User**: admin
- **Admin Password**: admin
- **Realm**: test-realm
- **Test Users**:
  - admin/admin123 (administrators group, admin role)
  - testuser1/password123 (users group, user role)
  - testuser2/password123 (users group, user role)

## Usage

### Start Test Services
```bash
docker-compose -f docker-compose.test.yml up -d
```

### Stop Test Services
```bash
docker-compose -f docker-compose.test.yml down
```

### View Logs
```bash
docker-compose -f docker-compose.test.yml logs -f
```

### Run Integration Tests
Once the services are running, you can run the Go integration tests:

```bash
cd ../backend
TEST_DB_HOST=localhost TEST_DB_PORT=5433 go test ./modules/rbac/... -v
```

## Test Configuration

The integration tests in `backend/modules/rbac/rbac_test.go` are configured to:
- Connect to PostgreSQL on localhost:5433
- Use the test database `rbac_test`
- Generate JWT tokens that simulate Keycloak authentication
- Test with the predefined users and roles from the Keycloak realm

## Troubleshooting

1. **Port conflicts**: If ports 5433 or 8081 are already in use, modify the port mappings in `docker-compose.test.yml`

2. **Keycloak not starting**: Ensure PostgreSQL is healthy before Keycloak starts (it has a health check dependency)

3. **Database connection issues**: Wait for the health checks to pass before running tests

4. **Clean restart**: If you encounter issues, try:
   ```bash
   docker-compose -f docker-compose.test.yml down -v  # Remove volumes too
   docker-compose -f docker-compose.test.yml up -d
   ```