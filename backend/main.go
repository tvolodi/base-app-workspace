package main

import (
	"database/sql"
	"encoding/json"
	"log"
	"net/http"
	"os"

	"base-app/modules/rbac"
	"base-app/modules/user_management"

	"github.com/gorilla/mux"
	_ "github.com/lib/pq"
	"github.com/sirupsen/logrus"
)

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func loadKeycloakConfig() (user_management.KeycloakConfig, error) {
	file, err := os.Open("keycloak.json")
	if err != nil {
		return user_management.KeycloakConfig{}, err
	}
	defer file.Close()

	var config user_management.KeycloakConfig
	err = json.NewDecoder(file).Decode(&config)
	return config, err
}

func main() {
	// DB connection from env
	dbHost := getEnv("DB_HOST", "localhost")
	dbPort := getEnv("DB_PORT", "5432")
	dbUser := getEnv("DB_USER", "postgres")
	dbPassword := getEnv("DB_PASSWORD", "postgres")
	dbName := getEnv("DB_NAME", "baseapp")
	dbSSLMode := getEnv("DB_SSLMODE", "disable")

	connStr := "host=" + dbHost + " port=" + dbPort + " user=" + dbUser + " password=" + dbPassword + " dbname=" + dbName + " sslmode=" + dbSSLMode

	db, err := sql.Open("postgres", connStr)
	if err != nil {
		log.Fatal("DB connection failed:", err)
	}
	defer db.Close()

	if err := db.Ping(); err != nil {
		log.Fatal("DB ping failed:", err)
	}

	// Create table if not exists
	db.Exec(`CREATE TABLE IF NOT EXISTS users (
		id UUID PRIMARY KEY,
		keycloak_id VARCHAR UNIQUE,
		username VARCHAR UNIQUE,
		email VARCHAR UNIQUE,
		first_name VARCHAR,
		last_name VARCHAR,
		is_active BOOLEAN,
		created_at TIMESTAMP,
		updated_at TIMESTAMP
	)`)

	// Create RBAC tables
	db.Exec(`CREATE TABLE IF NOT EXISTS roles (
		id UUID PRIMARY KEY,
		name VARCHAR UNIQUE NOT NULL,
		description TEXT,
		created_at TIMESTAMP NOT NULL
	)`)

	db.Exec(`CREATE TABLE IF NOT EXISTS permissions (
		id UUID PRIMARY KEY,
		name VARCHAR UNIQUE NOT NULL,
		resource VARCHAR NOT NULL,
		action VARCHAR NOT NULL
	)`)

	db.Exec(`CREATE TABLE IF NOT EXISTS role_permissions (
		role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
		permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
		PRIMARY KEY (role_id, permission_id)
	)`)

	db.Exec(`CREATE TABLE IF NOT EXISTS role_groups (
		id UUID PRIMARY KEY,
		name VARCHAR UNIQUE NOT NULL,
		description TEXT,
		created_at TIMESTAMP NOT NULL
	)`)

	db.Exec(`CREATE TABLE IF NOT EXISTS group_roles (
		group_id UUID REFERENCES role_groups(id) ON DELETE CASCADE,
		role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
		PRIMARY KEY (group_id, role_id)
	)`)

	db.Exec(`CREATE TABLE IF NOT EXISTS user_group_memberships (
		user_id UUID REFERENCES users(id) ON DELETE CASCADE,
		group_id UUID REFERENCES role_groups(id) ON DELETE CASCADE,
		assigned_at TIMESTAMP NOT NULL,
		PRIMARY KEY (user_id, group_id)
	)`)

	// Create indexes for better performance
	db.Exec(`CREATE INDEX IF NOT EXISTS idx_user_group_memberships_user_id ON user_group_memberships(user_id)`)
	db.Exec(`CREATE INDEX IF NOT EXISTS idx_group_roles_group_id ON group_roles(group_id)`)
	db.Exec(`CREATE INDEX IF NOT EXISTS idx_role_permissions_role_id ON role_permissions(role_id)`)

	// Insert default permissions
	db.Exec(`INSERT INTO permissions (id, name, resource, action) VALUES
		('550e8400-e29b-41d4-a716-446655440001', 'create_user', 'user', 'create'),
		('550e8400-e29b-41d4-a716-446655440002', 'read_user', 'user', 'read'),
		('550e8400-e29b-41d4-a716-446655440003', 'update_user', 'user', 'update'),
		('550e8400-e29b-41d4-a716-446655440004', 'delete_user', 'user', 'delete'),
		('550e8400-e29b-41d4-a716-446655440005', 'manage_roles', 'rbac', 'manage'),
		('550e8400-e29b-41d4-a716-446655440006', 'view_reports', 'reports', 'read'),
		('550e8400-e29b-41d4-a716-446655440007', 'manage_config', 'config', 'manage'),
		('550e8400-e29b-41d4-a716-446655440008', 'create_role', 'role', 'create'),
		('550e8400-e29b-41d4-a716-446655440009', 'read_role', 'role', 'read'),
		('550e8400-e29b-41d4-a716-446655440010', 'update_role', 'role', 'update'),
		('550e8400-e29b-41d4-a716-446655440011', 'delete_role', 'role', 'delete'),
		('550e8400-e29b-41d4-a716-446655440012', 'create_group', 'group', 'create'),
		('550e8400-e29b-41d4-a716-446655440013', 'read_group', 'group', 'read'),
		('550e8400-e29b-41d4-a716-446655440014', 'update_group', 'group', 'update'),
		('550e8400-e29b-41d4-a716-446655440015', 'delete_group', 'group', 'delete'),
		('550e8400-e29b-41d4-a716-446655440016', 'manage_group_membership', 'group_membership', 'manage'),
		('550e8400-e29b-41d4-a716-446655440017', 'manage_group_roles', 'group_roles', 'manage'),
		('550e8400-e29b-41d4-a716-446655440018', 'read_permission', 'permission', 'read')
		ON CONFLICT (id) DO NOTHING`)

	// Load Keycloak config
	keycloakConfig, err := loadKeycloakConfig()
	if err != nil {
		log.Fatal("Failed to load Keycloak config:", err)
	}

	// Create logger
	logger := logrus.New()
	logger.SetLevel(logrus.InfoLevel)

	// Create user repository and service
	repo := user_management.NewUserRepository(db)
	service := user_management.NewUserService(repo, keycloakConfig, logger)

	// Create RBAC repository and service
	rbacRepo := rbac.NewRBACRepository(db)
	rbacService := rbac.NewRBACService(rbacRepo, logger)

	r := mux.NewRouter()

	r.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("Base-Application API"))
	})

	user_management.SetupRoutes(r, service)
	rbac.SetupRoutes(r, rbacService)

	port := getEnv("PORT", "8090")
	log.Printf("Server starting on port %s", port)
	log.Fatal(http.ListenAndServe(":"+port, r))
}
