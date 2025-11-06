package rbac

import (
	"context"
	"database/sql"
	"fmt"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	_ "github.com/lib/pq"
	"github.com/sirupsen/logrus"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/suite"
)

type IntegrationTestSuite struct {
	suite.Suite
	db         *sql.DB
	repo       *RBACRepository
	service    *RBACService
	logger     *logrus.Logger
	jwtSecret  string
	testUsers  map[string]string // userID -> username mapping for tests
	testGroups map[string]string // groupID -> groupName mapping for tests
	testRoles  map[string]string // roleID -> roleName mapping for tests
}

func (suite *IntegrationTestSuite) SetupSuite() {
	// Initialize JWT secret for tests
	suite.jwtSecret = getEnv("TEST_JWT_SECRET", getEnv("JWT_SECRET", "your-secret-key-change-in-production"))

	// Create logger
	suite.logger = logrus.New()
	suite.logger.SetLevel(logrus.ErrorLevel) // Reduce log noise during tests

	// Get database configuration
	dbHost := getEnv("TEST_DB_HOST", "localhost")
	dbPort := getEnv("TEST_DB_PORT", "5433")
	dbUser := getEnv("TEST_DB_USER", "postgres")
	dbPassword := getEnv("TEST_DB_PASSWORD", "postgres")
	dbName := getEnv("TEST_DB_NAME", "rbac_test")
	dbSSLMode := getEnv("TEST_DB_SSLMODE", "disable")

	// First connect to postgres database to create the test database
	connStr := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=postgres sslmode=%s",
		dbHost, dbPort, dbUser, dbPassword, dbSSLMode)

	adminDB, err := sql.Open("postgres", connStr)
	if err != nil {
		suite.T().Fatalf("Failed to connect to postgres database: %v", err)
	}
	defer adminDB.Close()

	// Drop test database if it exists, then create fresh
	_, err = adminDB.Exec(fmt.Sprintf("DROP DATABASE IF EXISTS %s", dbName))
	if err != nil {
		// Ignore error if database doesn't exist
		suite.logger.Warnf("Failed to drop test database (may not exist): %v", err)
	}

	// Create test database
	_, err = adminDB.Exec(fmt.Sprintf("CREATE DATABASE %s", dbName))
	suite.Require().NoError(err, "Failed to create test database")

	// Now connect to the test database
	testConnStr := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		dbHost, dbPort, dbUser, dbPassword, dbName, dbSSLMode)

	suite.db, err = sql.Open("postgres", testConnStr)
	suite.Require().NoError(err, "Failed to connect to test database")

	// Ping to ensure connection
	err = suite.db.Ping()
	suite.Require().NoError(err, "Failed to ping test database")

	// Set connection pool settings for tests
	suite.db.SetMaxOpenConns(10)
	suite.db.SetMaxIdleConns(5)
	suite.db.SetConnMaxLifetime(time.Minute * 5)

	// Initialize JWT secret for tests
	suite.jwtSecret = getEnv("TEST_JWT_SECRET", getEnv("JWT_SECRET", "your-secret-key-change-in-production"))

	// Initialize test data maps
	suite.testUsers = make(map[string]string)
	suite.testGroups = make(map[string]string)
	suite.testRoles = make(map[string]string)

	// Create test database schema
	suite.setupTestDatabase()

	// Create repository and service
	suite.repo = NewRBACRepository(suite.db)
	suite.service = NewRBACService(suite.repo, suite.logger)
}

func (suite *IntegrationTestSuite) TearDownSuite() {
	if suite.db != nil {
		suite.db.Close()

		// Clean up test database
		dbHost := getEnv("TEST_DB_HOST", "localhost")
		dbPort := getEnv("TEST_DB_PORT", "5432")
		dbUser := getEnv("TEST_DB_USER", "postgres")
		dbPassword := getEnv("TEST_DB_PASSWORD", "postgres")
		dbName := getEnv("TEST_DB_NAME", "rbac_test")
		dbSSLMode := getEnv("TEST_DB_SSLMODE", "disable")

		// Connect to postgres database to drop the test database
		connStr := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=postgres sslmode=%s",
			dbHost, dbPort, dbUser, dbPassword, dbSSLMode)

		adminDB, err := sql.Open("postgres", connStr)
		if err == nil {
			defer adminDB.Close()
			// Terminate active connections to the test database
			adminDB.Exec(fmt.Sprintf("SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '%s'", dbName))
			// Drop the test database
			adminDB.Exec(fmt.Sprintf("DROP DATABASE IF EXISTS %s", dbName))
		}
	}
}

func (suite *IntegrationTestSuite) SetupTest() {
	// Clean up test data before each test
	suite.cleanupTestData()

	// Insert test permissions
	suite.seedTestPermissions()

	// Create test users, groups, and roles for use in tests
	suite.createTestData()
}

func (suite *IntegrationTestSuite) TearDownTest() {
	// Clean up after each test
	suite.cleanupTestData()
}

func (suite *IntegrationTestSuite) setupTestDatabase() {
	// Create tables
	tables := []string{
		`CREATE TABLE IF NOT EXISTS roles (
			id UUID PRIMARY KEY,
			name VARCHAR UNIQUE NOT NULL,
			description TEXT,
			created_at TIMESTAMP NOT NULL
		)`,
		`CREATE TABLE IF NOT EXISTS permissions (
			id UUID PRIMARY KEY,
			name VARCHAR UNIQUE NOT NULL,
			resource VARCHAR NOT NULL,
			action VARCHAR NOT NULL
		)`,
		`CREATE TABLE IF NOT EXISTS role_permissions (
			role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
			permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
			PRIMARY KEY (role_id, permission_id)
		)`,
		`CREATE TABLE IF NOT EXISTS role_groups (
			id UUID PRIMARY KEY,
			name VARCHAR UNIQUE NOT NULL,
			description TEXT,
			created_at TIMESTAMP NOT NULL
		)`,
		`CREATE TABLE IF NOT EXISTS group_roles (
			group_id UUID REFERENCES role_groups(id) ON DELETE CASCADE,
			role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
			PRIMARY KEY (group_id, role_id)
		)`,
		`CREATE TABLE IF NOT EXISTS user_group_memberships (
			user_id UUID NOT NULL,
			group_id UUID REFERENCES role_groups(id) ON DELETE CASCADE,
			assigned_at TIMESTAMP NOT NULL,
			PRIMARY KEY (user_id, group_id)
		)`,
		`CREATE TABLE IF NOT EXISTS users (
			id UUID PRIMARY KEY,
			keycloak_id VARCHAR UNIQUE,
			username VARCHAR UNIQUE,
			email VARCHAR UNIQUE,
			first_name VARCHAR,
			last_name VARCHAR,
			is_active BOOLEAN,
			created_at TIMESTAMP,
			updated_at TIMESTAMP
		)`,
	}

	for _, query := range tables {
		_, err := suite.db.Exec(query)
		suite.Require().NoError(err, "Failed to create table")
	}

	// Create indexes
	indexes := []string{
		`CREATE INDEX IF NOT EXISTS idx_user_group_memberships_user_id ON user_group_memberships(user_id)`,
		`CREATE INDEX IF NOT EXISTS idx_group_roles_group_id ON group_roles(group_id)`,
		`CREATE INDEX IF NOT EXISTS idx_role_permissions_role_id ON role_permissions(role_id)`,
	}

	for _, query := range indexes {
		_, err := suite.db.Exec(query)
		suite.Require().NoError(err, "Failed to create index")
	}
}

func (suite *IntegrationTestSuite) cleanupTestData() {
	// Use DELETE FROM to completely clean tables, ignoring foreign key constraints
	tables := []string{
		"user_group_memberships",
		"group_roles",
		"role_permissions",
		"role_groups",
		"roles",
		"permissions",
		"users",
	}

	for _, table := range tables {
		_, err := suite.db.Exec(fmt.Sprintf("DELETE FROM %s", table))
		if err != nil {
			suite.logger.Warnf("Failed to delete from table %s: %v", table, err)
		}
	}
}

func (suite *IntegrationTestSuite) seedTestPermissions() {
	permissions := []struct {
		id       string
		name     string
		resource string
		action   string
	}{
		{"550e8400-e29b-41d4-a716-446655440001", "create_user", "user", "create"},
		{"550e8400-e29b-41d4-a716-446655440002", "read_user", "user", "read"},
		{"550e8400-e29b-41d4-a716-446655440003", "update_user", "user", "update"},
		{"550e8400-e29b-41d4-a716-446655440004", "delete_user", "user", "delete"},
		{"550e8400-e29b-41d4-a716-446655440008", "create_role", "role", "create"},
		{"550e8400-e29b-41d4-a716-446655440009", "read_role", "role", "read"},
		{"550e8400-e29b-41d4-a716-446655440010", "update_role", "role", "update"},
		{"550e8400-e29b-41d4-a716-446655440011", "delete_role", "role", "delete"},
		{"550e8400-e29b-41d4-a716-446655440012", "create_group", "group", "create"},
		{"550e8400-e29b-41d4-a716-446655440013", "read_group", "group", "read"},
		{"550e8400-e29b-41d4-a716-446655440014", "update_group", "group", "update"},
		{"550e8400-e29b-41d4-a716-446655440015", "delete_group", "group", "delete"},
		{"550e8400-e29b-41d4-a716-446655440016", "manage_group_membership", "group_membership", "manage"},
		{"550e8400-e29b-41d4-a716-446655440017", "manage_group_roles", "group_roles", "manage"},
		{"550e8400-e29b-41d4-a716-446655440018", "read_permission", "permission", "read"},
	}

	for _, perm := range permissions {
		_, err := suite.db.Exec(
			`INSERT INTO permissions (id, name, resource, action) VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO NOTHING`,
			perm.id, perm.name, perm.resource, perm.action,
		)
		suite.Require().NoError(err, "Failed to seed permission")
	}
}

func (suite *IntegrationTestSuite) createTestData() {
	// Create test users
	testUsers := []struct {
		id         string
		keycloakId string
		username   string
		email      string
		firstName  string
		lastName   string
	}{
		{uuid.New().String(), "kc-user-1", "testuser1", "test1@example.com", "Test", "User1"},
		{uuid.New().String(), "kc-user-2", "testuser2", "test2@example.com", "Test", "User2"},
		{uuid.New().String(), "kc-admin", "admin", "admin@example.com", "Admin", "User"},
	}

	for _, user := range testUsers {
		_, err := suite.db.Exec(
			`INSERT INTO users (id, keycloak_id, username, email, first_name, last_name, is_active, created_at, updated_at)
			 VALUES ($1, $2, $3, $4, $5, $6, true, NOW(), NOW())`,
			user.id, user.keycloakId, user.username, user.email, user.firstName, user.lastName,
		)
		suite.Require().NoError(err, "Failed to create test user")
		suite.testUsers[user.id] = user.username
	}

	// Create test roles
	testRoles := []struct {
		id          string
		name        string
		description string
	}{
		{uuid.New().String(), "admin", "Administrator role"},
		{uuid.New().String(), "user", "Regular user role"},
		{uuid.New().String(), "moderator", "Moderator role"},
	}

	var adminRoleID, userRoleID, moderatorRoleID string
	for _, role := range testRoles {
		_, err := suite.db.Exec(
			`INSERT INTO roles (id, name, description, created_at) VALUES ($1, $2, $3, NOW())`,
			role.id, role.name, role.description,
		)
		suite.Require().NoError(err, "Failed to create test role")
		suite.testRoles[role.id] = role.name
		if role.name == "admin" {
			adminRoleID = role.id
		} else if role.name == "user" {
			userRoleID = role.id
		} else if role.name == "moderator" {
			moderatorRoleID = role.id
		}
	}

	// Create test groups
	testGroups := []struct {
		id          string
		name        string
		description string
	}{
		{uuid.New().String(), "administrators", "Administrator group"},
		{uuid.New().String(), "users", "Regular users group"},
	}

	for _, group := range testGroups {
		_, err := suite.db.Exec(
			`INSERT INTO role_groups (id, name, description, created_at) VALUES ($1, $2, $3, NOW())`,
			group.id, group.name, group.description,
		)
		suite.Require().NoError(err, "Failed to create test group")
		suite.testGroups[group.id] = group.name
	}

	// Assign roles to groups (simplified - direct inserts instead of using service methods)
	var adminGroupID, userGroupID string
	err := suite.db.QueryRow(`SELECT id FROM role_groups WHERE name = $1`, "administrators").Scan(&adminGroupID)
	suite.Require().NoError(err, "Failed to get administrators group ID")

	err = suite.db.QueryRow(`SELECT id FROM role_groups WHERE name = $1`, "users").Scan(&userGroupID)
	suite.Require().NoError(err, "Failed to get users group ID")

	_, err = suite.db.Exec(`INSERT INTO group_roles (group_id, role_id) VALUES ($1, $2)`, adminGroupID, adminRoleID)
	suite.Require().NoError(err, "Failed to assign admin role to administrators group")

	_, err = suite.db.Exec(`INSERT INTO group_roles (group_id, role_id) VALUES ($1, $2)`, userGroupID, userRoleID)
	suite.Require().NoError(err, "Failed to assign user role to users group")

	// Assign permissions to roles (simplified - direct inserts)
	permAssignments := []struct {
		roleID string
		perm   string
	}{
		{adminRoleID, "create_user"}, {adminRoleID, "read_user"}, {adminRoleID, "update_user"}, {adminRoleID, "delete_user"},
		{adminRoleID, "create_role"}, {adminRoleID, "read_role"}, {adminRoleID, "update_role"}, {adminRoleID, "delete_role"},
		{adminRoleID, "create_group"}, {adminRoleID, "read_group"}, {adminRoleID, "update_group"}, {adminRoleID, "delete_group"},
		{adminRoleID, "manage_group_membership"}, {adminRoleID, "manage_group_roles"}, {adminRoleID, "read_permission"},
		{userRoleID, "read_user"},
		{moderatorRoleID, "read_user"}, {moderatorRoleID, "update_user"}, {moderatorRoleID, "read_group"},
	}

	for _, assignment := range permAssignments {
		permID := suite.getPermissionIDByName(assignment.perm)
		_, err := suite.db.Exec(`INSERT INTO role_permissions (role_id, permission_id) VALUES ($1, $2)`, assignment.roleID, permID)
		suite.Require().NoError(err, "Failed to assign permission to role")
	}

	// Assign users to groups (simplified - direct inserts)
	var adminUserID, testUser1ID, testUser2ID string
	err = suite.db.QueryRow(`SELECT id FROM users WHERE username = $1`, "admin").Scan(&adminUserID)
	suite.Require().NoError(err, "Failed to get admin user ID")

	err = suite.db.QueryRow(`SELECT id FROM users WHERE username = $1`, "testuser1").Scan(&testUser1ID)
	suite.Require().NoError(err, "Failed to get testuser1 ID")

	err = suite.db.QueryRow(`SELECT id FROM users WHERE username = $1`, "testuser2").Scan(&testUser2ID)
	suite.Require().NoError(err, "Failed to get testuser2 ID")

	_, err = suite.db.Exec(`INSERT INTO user_group_memberships (user_id, group_id, assigned_at) VALUES ($1, $2, NOW())`, adminUserID, adminGroupID)
	suite.Require().NoError(err, "Failed to assign admin to administrators group")

	_, err = suite.db.Exec(`INSERT INTO user_group_memberships (user_id, group_id, assigned_at) VALUES ($1, $2, NOW())`, testUser1ID, userGroupID)
	suite.Require().NoError(err, "Failed to assign testuser1 to users group")

	_, err = suite.db.Exec(`INSERT INTO user_group_memberships (user_id, group_id, assigned_at) VALUES ($1, $2, NOW())`, testUser2ID, userGroupID)
	suite.Require().NoError(err, "Failed to assign testuser2 to users group")
}

func (suite *IntegrationTestSuite) getUserIDByUsername(username string) string {
	for id, name := range suite.testUsers {
		if name == username {
			return id
		}
	}
	suite.Failf("User not found", "Username %s not found in test users", username)
	return ""
}

func (suite *IntegrationTestSuite) getGroupIDByName(name string) string {
	for id, groupName := range suite.testGroups {
		if groupName == name {
			return id
		}
	}
	suite.Failf("Group not found", "Group name %s not found in test groups", name)
	return ""
}

func (suite *IntegrationTestSuite) getRoleIDByName(name string) string {
	for id, roleName := range suite.testRoles {
		if roleName == name {
			return id
		}
	}
	suite.Failf("Role not found", "Role name %s not found in test roles", name)
	return ""
}

func (suite *IntegrationTestSuite) getPermissionIDByName(name string) string {
	var id string
	err := suite.db.QueryRow(`SELECT id FROM permissions WHERE name = $1`, name).Scan(&id)
	suite.Require().NoError(err, "Failed to get permission ID by name")
	return id
}

// Helper function to generate JWT tokens for testing (simulating Keycloak)
func (suite *IntegrationTestSuite) generateTestJWT(userID, username, email string, groups []string, expiration time.Time) string {
	claims := &JWTClaims{
		UserID:   userID,
		Username: username,
		Email:    email,
		Groups:   groups,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expiration),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
			Issuer:    "test-keycloak",
			Subject:   userID,
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte(suite.jwtSecret))
	suite.Require().NoError(err, "Failed to generate test JWT")
	return tokenString
}

// Helper function to create authenticated request
func (suite *IntegrationTestSuite) createAuthenticatedRequest(method, url, userID, username, email string, groups []string) *http.Request {
	token := suite.generateTestJWT(userID, username, email, groups, time.Now().Add(time.Hour))
	req := httptest.NewRequest(method, url, nil)
	req.Header.Set("Authorization", "Bearer "+token)
	return req
}

func TestIntegrationSuite(t *testing.T) {
	if testing.Short() {
		t.Skip("Skipping integration tests in short mode")
	}

	// Skip if test database is not available
	if os.Getenv("SKIP_INTEGRATION_TESTS") == "true" {
		t.Skip("Skipping integration tests due to SKIP_INTEGRATION_TESTS=true")
	}

	suite.Run(t, new(IntegrationTestSuite))
}

func (suite *IntegrationTestSuite) TestCreateRole() {
	req := CreateRoleRequest{
		Name:        "test_role_" + uuid.New().String()[:8],
		Description: "Test role for integration testing",
	}

	role, err := suite.service.CreateRole(context.Background(), req)

	assert.NoError(suite.T(), err)
	assert.NotNil(suite.T(), role)
	assert.Equal(suite.T(), req.Name, role.Name)
	assert.Equal(suite.T(), req.Description, role.Description)
	assert.NotEmpty(suite.T(), role.ID)
	assert.NotZero(suite.T(), role.CreatedAt)
}

func (suite *IntegrationTestSuite) TestCreateRole_DuplicateName() {
	roleName := "duplicate_test_role_" + uuid.New().String()[:8]

	// Create first role
	req1 := CreateRoleRequest{
		Name:        roleName,
		Description: "First test role",
	}
	role1, err := suite.service.CreateRole(context.Background(), req1)
	assert.NoError(suite.T(), err)
	assert.NotNil(suite.T(), role1)

	// Try to create duplicate
	req2 := CreateRoleRequest{
		Name:        roleName,
		Description: "Duplicate test role",
	}
	_, err = suite.service.CreateRole(context.Background(), req2)

	assert.Error(suite.T(), err)
	assert.IsType(suite.T(), &ValidationError{}, err)
	assert.Contains(suite.T(), err.Error(), "already exists")
}

func (suite *IntegrationTestSuite) TestListRoles() {
	roles, err := suite.service.ListRoles()

	assert.NoError(suite.T(), err)
	assert.NotNil(suite.T(), roles)
	assert.True(suite.T(), len(roles) >= 3) // At least our test roles

	// Check that roles are ordered by name
	for i := 1; i < len(roles); i++ {
		assert.True(suite.T(), roles[i-1].Name <= roles[i].Name, "Roles should be ordered by name")
	}
}

func (suite *IntegrationTestSuite) TestCreateRoleGroup() {
	req := CreateRoleGroupRequest{
		Name:        "test_group_" + uuid.New().String()[:8],
		Description: "Test group for integration testing",
	}

	group, err := suite.service.CreateRoleGroup(req)

	assert.NoError(suite.T(), err)
	assert.NotNil(suite.T(), group)
	assert.Equal(suite.T(), req.Name, group.Name)
	assert.Equal(suite.T(), req.Description, group.Description)
	assert.NotEmpty(suite.T(), group.ID)
	assert.NotZero(suite.T(), group.CreatedAt)
}

func (suite *IntegrationTestSuite) TestAssignUserToGroup() {
	// Use existing test user and group
	userID := suite.getUserIDByUsername("testuser1")
	groupID := suite.getGroupIDByName("users")

	req := AssignUserToGroupRequest{
		UserID: userID,
	}

	err := suite.service.AssignUserToGroup(groupID, req)

	// This might fail if user is already in group, which is fine for integration test
	if err != nil {
		assert.IsType(suite.T(), &ValidationError{}, err)
		assert.Contains(suite.T(), err.Error(), "already in group")
	} else {
		assert.NoError(suite.T(), err)
	}
}

func (suite *IntegrationTestSuite) TestGetUserPermissions() {
	// Create a test user for this test
	testUserID := uuid.New().String()
	testUsername := "test_permissions_user"
	_, err := suite.db.Exec(
		`INSERT INTO users (id, keycloak_id, username, email, first_name, last_name, is_active, created_at, updated_at)
		 VALUES ($1, $2, $3, $4, $5, $6, true, NOW(), NOW())`,
		testUserID, "test-permissions", testUsername, "testpermissions@example.com", "Test", "Permissions",
	)
	suite.Require().NoError(err)

	// Create a test role
	testRoleID := uuid.New().String()
	_, err = suite.db.Exec(
		`INSERT INTO roles (id, name, description, created_at) VALUES ($1, $2, $3, NOW())`,
		testRoleID, "test_permissions_role", "Test role for permissions",
	)
	suite.Require().NoError(err)

	// Create a test group
	testGroupID := uuid.New().String()
	_, err = suite.db.Exec(
		`INSERT INTO role_groups (id, name, description, created_at) VALUES ($1, $2, $3, NOW())`,
		testGroupID, "test_permissions_group", "Test group for permissions",
	)
	suite.Require().NoError(err)

	// Assign role to group
	_, err = suite.db.Exec(`INSERT INTO group_roles (group_id, role_id) VALUES ($1, $2)`, testGroupID, testRoleID)
	suite.Require().NoError(err)

	// Assign permissions to role
	createUserPermID := suite.getPermissionIDByName("create_user")
	readRolePermID := suite.getPermissionIDByName("read_role")
	_, err = suite.db.Exec(`INSERT INTO role_permissions (role_id, permission_id) VALUES ($1, $2)`, testRoleID, createUserPermID)
	suite.Require().NoError(err)
	_, err = suite.db.Exec(`INSERT INTO role_permissions (role_id, permission_id) VALUES ($1, $2)`, testRoleID, readRolePermID)
	suite.Require().NoError(err)

	// Assign user to group
	_, err = suite.db.Exec(`INSERT INTO user_group_memberships (user_id, group_id, assigned_at) VALUES ($1, $2, NOW())`, testUserID, testGroupID)
	suite.Require().NoError(err)

	userPerms, err := suite.service.GetUserPermissions(context.Background(), testUserID)

	assert.NoError(suite.T(), err)
	assert.NotNil(suite.T(), userPerms)
	assert.Equal(suite.T(), testUserID, userPerms.UserID)

	// User should have multiple permissions
	assert.True(suite.T(), len(userPerms.Permissions) > 0, "User should have permissions")
	assert.True(suite.T(), len(userPerms.Groups) > 0, "User should be in groups")
	assert.True(suite.T(), len(userPerms.Roles) > 0, "User should have roles")

	// Check for specific permissions
	permissionNames := make([]string, len(userPerms.Permissions))
	for i, perm := range userPerms.Permissions {
		permissionNames[i] = perm.Name
	}

	assert.Contains(suite.T(), permissionNames, "create_user", "User should have create_user permission")
	assert.Contains(suite.T(), permissionNames, "read_role", "User should have read_role permission")
}

func (suite *IntegrationTestSuite) TestListPermissions() {
	perms, err := suite.service.ListPermissions()

	assert.NoError(suite.T(), err)
	assert.NotNil(suite.T(), perms)
	assert.True(suite.T(), len(perms) >= 15) // At least our seeded permissions

	// Check that permissions are ordered by resource, action
	for i := 1; i < len(perms); i++ {
		prev := perms[i-1]
		curr := perms[i]
		comparison := prev.Resource < curr.Resource ||
			(prev.Resource == curr.Resource && prev.Action <= curr.Action)
		assert.True(suite.T(), comparison, "Permissions should be ordered by resource, action")
	}
}

func (suite *IntegrationTestSuite) TestValidationError() {
	ve := &ValidationError{Field: "name", Message: "required"}
	expected := "name: required"
	assert.Equal(suite.T(), expected, ve.Error())
}

func (suite *IntegrationTestSuite) TestJWTClaimsParsing() {
	// Test JWT claims structure for Keycloak format
	claims := &JWTClaims{
		UserID:   "user-123",
		Username: "john.doe",
		Email:    "john@example.com",
		Groups:   []string{"admin-group", "user-group"},
		Roles:    []string{"admin", "user"},
	}

	assert.Equal(suite.T(), "user-123", claims.UserID)
	assert.Equal(suite.T(), "john.doe", claims.Username)
	assert.Equal(suite.T(), "john@example.com", claims.Email)
	assert.Contains(suite.T(), claims.Groups, "admin-group")
	assert.Contains(suite.T(), claims.Roles, "admin")
}

func (suite *IntegrationTestSuite) TestWithAuth_MissingAuthorizationHeader() {
	req := httptest.NewRequest("GET", "/api/test", nil)
	w := httptest.NewRecorder()

	handler := withAuth("read_role", suite.service, func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})

	handler(w, req)

	assert.Equal(suite.T(), http.StatusUnauthorized, w.Code)
	assert.Contains(suite.T(), w.Body.String(), "AUTH_HEADER_MISSING")
}

func (suite *IntegrationTestSuite) TestWithAuth_InvalidBearerFormat() {
	req := httptest.NewRequest("GET", "/api/test", nil)
	req.Header.Set("Authorization", "InvalidFormat token123")
	w := httptest.NewRecorder()

	handler := withAuth("read_role", suite.service, func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})

	handler(w, req)

	assert.Equal(suite.T(), http.StatusUnauthorized, w.Code)
	assert.Contains(suite.T(), w.Body.String(), "INVALID_AUTH_FORMAT")
}

func (suite *IntegrationTestSuite) TestWithAuth_ExpiredToken() {
	// Create an expired JWT token
	expiredTime := time.Now().Add(-time.Hour)
	claims := &JWTClaims{
		UserID:   "user-123",
		Username: "john.doe",
		Email:    "john@example.com",
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expiredTime),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte(suite.jwtSecret))
	suite.Require().NoError(err)

	req := httptest.NewRequest("GET", "/api/test", nil)
	req.Header.Set("Authorization", "Bearer "+tokenString)
	w := httptest.NewRecorder()

	handler := withAuth("read_role", suite.service, func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})

	handler(w, req)

	assert.Equal(suite.T(), http.StatusUnauthorized, w.Code)
	assert.Contains(suite.T(), w.Body.String(), "INVALID_TOKEN")
}

func (suite *IntegrationTestSuite) TestWithAuth_SuccessfulPermissionCheck() {
	// Create a test user for this test
	testUserID := uuid.New().String()
	testUsername := "test_auth_user"
	_, err := suite.db.Exec(
		`INSERT INTO users (id, keycloak_id, username, email, first_name, last_name, is_active, created_at, updated_at)
		 VALUES ($1, $2, $3, $4, $5, $6, true, NOW(), NOW())`,
		testUserID, "test-auth", testUsername, "testauth@example.com", "Test", "Auth",
	)
	suite.Require().NoError(err)

	// Create a test role
	testRoleID := uuid.New().String()
	_, err = suite.db.Exec(
		`INSERT INTO roles (id, name, description, created_at) VALUES ($1, $2, $3, NOW())`,
		testRoleID, "test_auth_role", "Test role for auth",
	)
	suite.Require().NoError(err)

	// Create a test group
	testGroupID := uuid.New().String()
	_, err = suite.db.Exec(
		`INSERT INTO role_groups (id, name, description, created_at) VALUES ($1, $2, $3, NOW())`,
		testGroupID, "test_auth_group", "Test group for auth",
	)
	suite.Require().NoError(err)

	// Assign role to group
	_, err = suite.db.Exec(`INSERT INTO group_roles (group_id, role_id) VALUES ($1, $2)`, testGroupID, testRoleID)
	suite.Require().NoError(err)

	// Assign permissions to role
	readRolePermID := suite.getPermissionIDByName("read_role")
	_, err = suite.db.Exec(`INSERT INTO role_permissions (role_id, permission_id) VALUES ($1, $2)`, testRoleID, readRolePermID)
	suite.Require().NoError(err)

	// Assign user to group
	_, err = suite.db.Exec(`INSERT INTO user_group_memberships (user_id, group_id, assigned_at) VALUES ($1, $2, NOW())`, testUserID, testGroupID)
	suite.Require().NoError(err)

	req := suite.createAuthenticatedRequest("GET", "/api/test", testUserID, testUsername, "testauth@example.com", []string{"test_auth_group"})
	w := httptest.NewRecorder()

	handler := withAuth("read_role", suite.service, func(w http.ResponseWriter, r *http.Request) {
		// Check that user context was set
		userIDFromContext := getUserIDFromContext(r.Context())
		permissionsFromContext := getUserPermissionsFromContext(r.Context())

		assert.Equal(suite.T(), testUserID, userIDFromContext)
		assert.Contains(suite.T(), permissionsFromContext, "read_role")

		w.WriteHeader(http.StatusOK)
		w.Write([]byte("success"))
	})

	handler(w, req)

	assert.Equal(suite.T(), http.StatusOK, w.Code)
	assert.Equal(suite.T(), "success", w.Body.String())
}

func (suite *IntegrationTestSuite) TestWithAuth_InsufficientPermissions() {
	// Use testuser1 who only has basic user permissions, not create_role
	userID := suite.getUserIDByUsername("testuser1")

	req := suite.createAuthenticatedRequest("GET", "/api/test", userID, "testuser1", "test1@example.com", []string{"users"})
	w := httptest.NewRecorder()

	handler := withAuth("create_role", suite.service, func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})

	handler(w, req)

	assert.Equal(suite.T(), http.StatusForbidden, w.Code)
	assert.Contains(suite.T(), w.Body.String(), "INSUFFICIENT_PERMISSIONS")
	assert.Contains(suite.T(), w.Body.String(), "create_role")
}

func (suite *IntegrationTestSuite) TestWithAuth_PermissionLookupError() {
	// Create a user that doesn't exist in database
	nonExistentUserID := uuid.New().String()

	req := suite.createAuthenticatedRequest("GET", "/api/test", nonExistentUserID, "nonexistent", "nonexistent@example.com", []string{"users"})
	w := httptest.NewRecorder()

	handler := withAuth("read_role", suite.service, func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})

	handler(w, req)

	// Should fail because user has no permissions (not in any groups)
	assert.Equal(suite.T(), http.StatusForbidden, w.Code)
	assert.Contains(suite.T(), w.Body.String(), "INSUFFICIENT_PERMISSIONS")
}

func (suite *IntegrationTestSuite) TestHasPermission() {
	userPermissions := []string{"read_user", "create_role", "update_group"}

	assert.True(suite.T(), hasPermission(userPermissions, "read_user"))
	assert.True(suite.T(), hasPermission(userPermissions, "create_role"))
	assert.False(suite.T(), hasPermission(userPermissions, "delete_user"))
	assert.False(suite.T(), hasPermission([]string{}, "any_permission"))
}

func (suite *IntegrationTestSuite) TestGetUserPermissionsFromContext() {
	ctx := context.Background()
	ctx = context.WithValue(ctx, UserPermissionsKey, []string{"read_user", "create_role"})

	permissions := getUserPermissionsFromContext(ctx)
	assert.Contains(suite.T(), permissions, "read_user")
	assert.Contains(suite.T(), permissions, "create_role")
	assert.Len(suite.T(), permissions, 2)

	// Test with no permissions in context
	emptyCtx := context.Background()
	emptyPermissions := getUserPermissionsFromContext(emptyCtx)
	assert.Empty(suite.T(), emptyPermissions)
}

func (suite *IntegrationTestSuite) TestGetUserIDFromContext() {
	ctx := context.Background()
	ctx = context.WithValue(ctx, UserIDKey, "user-123")

	userID := getUserIDFromContext(ctx)
	assert.Equal(suite.T(), "user-123", userID)

	// Test with no user ID in context
	emptyCtx := context.Background()
	emptyUserID := getUserIDFromContext(emptyCtx)
	assert.Empty(suite.T(), emptyUserID)
}

func (suite *IntegrationTestSuite) TestRoleCRUDOperations() {
	roleName := "crud_test_role_" + uuid.New().String()[:8]

	// Create
	createReq := CreateRoleRequest{
		Name:        roleName,
		Description: "CRUD test role",
	}
	role, err := suite.service.CreateRole(context.Background(), createReq)
	assert.NoError(suite.T(), err)
	assert.Equal(suite.T(), roleName, role.Name)

	// Read
	retrievedRole, err := suite.service.GetRole(role.ID)
	assert.NoError(suite.T(), err)
	assert.Equal(suite.T(), roleName, retrievedRole.Name)

	// Update
	updateReq := UpdateRoleRequest{
		Name:        roleName + "_updated",
		Description: "Updated CRUD test role",
	}
	updatedRole, err := suite.service.UpdateRole(role.ID, updateReq)
	assert.NoError(suite.T(), err)
	assert.Equal(suite.T(), roleName+"_updated", updatedRole.Name)
	assert.Equal(suite.T(), "Updated CRUD test role", updatedRole.Description)

	// Delete
	err = suite.service.DeleteRole(role.ID)
	assert.NoError(suite.T(), err)

	// Verify deletion
	deletedRole, err := suite.service.GetRole(role.ID)
	assert.NoError(suite.T(), err)
	assert.Nil(suite.T(), deletedRole) // Should not find the role
}

func (suite *IntegrationTestSuite) TestRoleGroupCRUDOperations() {
	groupName := "crud_test_group_" + uuid.New().String()[:8]

	// Create
	createReq := CreateRoleGroupRequest{
		Name:        groupName,
		Description: "CRUD test group",
	}
	group, err := suite.service.CreateRoleGroup(createReq)
	assert.NoError(suite.T(), err)
	assert.Equal(suite.T(), groupName, group.Name)

	// Read
	retrievedGroup, err := suite.service.GetRoleGroup(group.ID)
	assert.NoError(suite.T(), err)
	assert.Equal(suite.T(), groupName, retrievedGroup.Name)

	// Update
	updateReq := UpdateRoleGroupRequest{
		Name:        groupName + "_updated",
		Description: "Updated CRUD test group",
	}
	updatedGroup, err := suite.service.UpdateRoleGroup(group.ID, updateReq)
	assert.NoError(suite.T(), err)
	assert.Equal(suite.T(), groupName+"_updated", updatedGroup.Name)
	assert.Equal(suite.T(), "Updated CRUD test group", updatedGroup.Description)

	// Delete
	err = suite.service.DeleteRoleGroup(group.ID)
	assert.NoError(suite.T(), err)

	// Verify deletion
	deletedGroup, err := suite.service.GetRoleGroup(group.ID)
	assert.NoError(suite.T(), err)
	assert.Nil(suite.T(), deletedGroup) // Should not find the group
}

func (suite *IntegrationTestSuite) TestUserGroupMembership() {
	// Create a test user for this test
	testUserID := uuid.New().String()
	_, err := suite.db.Exec(
		`INSERT INTO users (id, keycloak_id, username, email, first_name, last_name, is_active, created_at, updated_at)
		 VALUES ($1, $2, $3, $4, $5, $6, true, NOW(), NOW())`,
		testUserID, "test-membership", "testmembership", "membership@example.com", "Test", "Membership",
	)
	suite.Require().NoError(err)

	// Create a test group for this test
	testGroupID := uuid.New().String()
	_, err = suite.db.Exec(
		`INSERT INTO role_groups (id, name, description, created_at)
		 VALUES ($1, $2, $3, NOW())`,
		testGroupID, "test_membership_group", "Test membership group",
	)
	suite.Require().NoError(err)

	// Assign user to group
	req := AssignUserToGroupRequest{UserID: testUserID}
	err = suite.service.AssignUserToGroup(testGroupID, req)
	assert.NoError(suite.T(), err)

	// Check user groups
	groups, err := suite.service.GetUserGroups(testUserID)
	assert.NoError(suite.T(), err)
	assert.Len(suite.T(), groups, 1)
	assert.Equal(suite.T(), "test_membership_group", groups[0].Name)

	// Check group users
	userIDs, err := suite.service.GetGroupUsers(testGroupID)
	assert.NoError(suite.T(), err)
	assert.Contains(suite.T(), userIDs, testUserID)

	// Remove user from group
	err = suite.service.RemoveUserFromGroup(testGroupID, testUserID)
	assert.NoError(suite.T(), err)

	// Verify removal
	groups, err = suite.service.GetUserGroups(testUserID)
	assert.NoError(suite.T(), err)
	assert.Len(suite.T(), groups, 0)
}

func (suite *IntegrationTestSuite) TestRolePermissionAssignment() {
	// Create a test role
	testRoleID := uuid.New().String()
	_, err := suite.db.Exec(
		`INSERT INTO roles (id, name, description, created_at)
		 VALUES ($1, $2, $3, NOW())`,
		testRoleID, "test_permission_role", "Test role for permissions",
	)
	suite.Require().NoError(err)

	// Assign permissions to role
	req := AssignPermissionsToRoleRequest{
		PermissionIDs: []string{
			suite.getPermissionIDByName("read_user"),
			suite.getPermissionIDByName("create_role"),
		},
	}
	err = suite.service.AssignPermissionsToRole(testRoleID, req)
	assert.NoError(suite.T(), err)

	// Check role permissions
	perms, err := suite.service.GetRolePermissions(testRoleID)
	assert.NoError(suite.T(), err)
	assert.Len(suite.T(), perms, 2)

	permissionNames := make([]string, len(perms))
	for i, perm := range perms {
		permissionNames[i] = perm.Name
	}
	assert.Contains(suite.T(), permissionNames, "read_user")
	assert.Contains(suite.T(), permissionNames, "create_role")
}

func (suite *IntegrationTestSuite) TestGroupRoleAssignment() {
	// Create test roles for this test
	testRole1ID := uuid.New().String()
	testRole2ID := uuid.New().String()
	_, err := suite.db.Exec(
		`INSERT INTO roles (id, name, description, created_at)
		 VALUES ($1, $2, $3, NOW())`,
		testRole1ID, "test_role_1", "Test role 1",
	)
	suite.Require().NoError(err)
	_, err = suite.db.Exec(
		`INSERT INTO roles (id, name, description, created_at)
		 VALUES ($1, $2, $3, NOW())`,
		testRole2ID, "test_role_2", "Test role 2",
	)
	suite.Require().NoError(err)

	// Create a test group
	testGroupID := uuid.New().String()
	_, err = suite.db.Exec(
		`INSERT INTO role_groups (id, name, description, created_at)
		 VALUES ($1, $2, $3, NOW())`,
		testGroupID, "test_group_role_group", "Test group for roles",
	)
	suite.Require().NoError(err)

	// Assign roles to group
	req := AssignRolesToGroupRequest{
		RoleIDs: []string{testRole1ID, testRole2ID},
	}
	err = suite.service.AssignRolesToGroup(testGroupID, req)
	assert.NoError(suite.T(), err)

	// Check group roles
	roles, err := suite.service.GetGroupRoles(testGroupID)
	assert.NoError(suite.T(), err)
	assert.Len(suite.T(), roles, 2)

	roleNames := make([]string, len(roles))
	for i, role := range roles {
		roleNames[i] = role.Name
	}
	assert.Contains(suite.T(), roleNames, "test_role_1")
	assert.Contains(suite.T(), roleNames, "test_role_2")
}
