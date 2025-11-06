# Development Environment Setup

This development environment provides PostgreSQL and Keycloak configured with the `base-app` realm for local development.

## Services

- **PostgreSQL** (`dev-postgres`): Port 5432, Database: `baseapp`
- **Keycloak** (`dev-keycloak`): Port 8080, Realm: `base-app`

## Quick Start

### Start the development environment:
```powershell
cd docker
docker-compose -f docker-compose.dev.yml up -d
```

### Check service status:
```powershell
docker-compose -f docker-compose.dev.yml ps
```

### View logs:
```powershell
# All services
docker-compose -f docker-compose.dev.yml logs -f

# Specific service
docker-compose -f docker-compose.dev.yml logs -f dev-keycloak
```

### Stop the environment:
```powershell
docker-compose -f docker-compose.dev.yml down
```

### Stop and remove all data (clean slate):
```powershell
docker-compose -f docker-compose.dev.yml down -v
```

## Keycloak Configuration

### Admin Console
- **URL**: http://localhost:8080
- **Admin Username**: `admin`
- **Admin Password**: `admin`

### Realm: base-app
The `base-app` realm is automatically imported from `keycloak-realm-dev.json` on first startup.

### Clients

#### base-app-frontend (Public Client)
- **Client ID**: `base-app-frontend`
- **Type**: Public (PKCE enabled)
- **Redirect URIs**: http://localhost:3000/*, http://localhost:3001/*
- **Web Origins**: http://localhost:3000, http://localhost:3001

#### base-app-backend (Confidential Client)
- **Client ID**: `base-app-backend`
- **Type**: Confidential
- **Client Secret**: `xregCQ0Nw4Fr31Uy7KmXhDYyWT85TqCZ`
- **Service Accounts**: Enabled

### Pre-configured Users

| Username   | Password  | Email              | Roles               | Groups                      |
|------------|-----------|--------------------|--------------------|----------------------------|
| admin      | admin123  | admin@baseapp.com  | admin              | administrators             |
| developer  | dev123    | dev@baseapp.com    | admin, user        | administrators, users      |
| testuser   | test123   | test@baseapp.com   | user               | users                      |
| moderator  | mod123    | mod@baseapp.com    | moderator, user    | moderators, users          |

### Roles
- **admin**: Administrator role with full access
- **user**: Regular user role
- **moderator**: Moderator role with limited admin access

### Groups
- **administrators**: Maps to `admin` role
- **users**: Maps to `user` role
- **moderators**: Maps to `moderator` role

## PostgreSQL Configuration

### Database Connection
- **Host**: localhost
- **Port**: 5432
- **Database**: baseapp
- **Username**: postgres
- **Password**: postgres

### Connect via psql:
```powershell
docker exec -it dev-postgres psql -U postgres -d baseapp
```

### Connection String:
```
postgresql://postgres:postgres@localhost:5432/baseapp?sslmode=disable
```

## Frontend Configuration

Ensure your frontend `.env` file contains:
```env
REACT_APP_KEYCLOAK_URL=http://localhost:8080
REACT_APP_KEYCLOAK_REALM=base-app
REACT_APP_KEYCLOAK_CLIENT_ID=base-app-frontend
```

## Backend Configuration

Update your `backend/keycloak.json` (should already be configured):
```json
{
  "realm": "base-app",
  "auth-server-url": "http://localhost:8080",
  "ssl-required": "external",
  "resource": "base-app-backend",
  "credentials": {
    "secret": "xregCQ0Nw4Fr31Uy7KmXhDYyWT85TqCZ"
  },
  "confidential-port": 0
}
```

## Healthchecks

Both services have healthchecks configured:
- **PostgreSQL**: Checks `pg_isready` every 10 seconds
- **Keycloak**: Checks `/health/ready` endpoint every 30 seconds (90s start period)

Keycloak depends on PostgreSQL being healthy before starting.

## Troubleshooting

### Keycloak not starting
- Wait for PostgreSQL to be healthy (check with `docker-compose -f docker-compose.dev.yml ps`)
- Keycloak takes 60-90 seconds to fully start
- Check logs: `docker-compose -f docker-compose.dev.yml logs dev-keycloak`

### Realm not imported
- The realm is imported only on first startup
- If you need to re-import, remove volumes: `docker-compose -f docker-compose.dev.yml down -v`
- Then start again: `docker-compose -f docker-compose.dev.yml up -d`

### Port conflicts
- Ensure ports 5432 and 8080 are not in use by other applications
- Check with: `netstat -ano | findstr "5432"` and `netstat -ano | findstr "8080"`

### Database connection issues
- Verify PostgreSQL is running: `docker-compose -f docker-compose.dev.yml ps`
- Check PostgreSQL logs: `docker-compose -f docker-compose.dev.yml logs dev-postgres`
- Test connection: `docker exec -it dev-postgres psql -U postgres -d baseapp`

## Differences from Test Environment

- **Realm**: `base-app` (vs `test-realm`)
- **Client**: `base-app-frontend` (vs `test-client`)
- **PostgreSQL Port**: 5432 (vs 5433)
- **Keycloak Port**: 8080 (vs 8081)
- **Users**: developer/moderator (vs testuser1/testuser2)
- **Database**: baseapp (vs testdb)

## Integration with Application

### Start Development Stack
1. Start infrastructure:
   ```powershell
   cd docker
   docker-compose -f docker-compose.dev.yml up -d
   ```

2. Wait for Keycloak to be ready (~90 seconds)

3. Start backend:
   ```powershell
   cd backend
   go run main.go
   ```

4. Start frontend:
   ```powershell
   cd frontend
   npm start
   ```

5. Access application at http://localhost:3000
   - Login with any of the pre-configured users
   - Test RBAC with different roles

### Stop Development Stack
```powershell
# Stop frontend (Ctrl+C)
# Stop backend (Ctrl+C)

# Stop infrastructure
cd docker
docker-compose -f docker-compose.dev.yml down
```

## Security Notes

⚠️ **WARNING**: This is a development configuration only!

- Passwords are simple and hardcoded
- Client secrets are not rotated
- SSL/TLS is disabled
- Admin credentials are default

**DO NOT use this configuration in production!**

For production:
- Use strong, unique passwords
- Enable SSL/TLS
- Rotate client secrets
- Configure proper authentication flows
- Enable event logging and monitoring
- Use environment variables for secrets
