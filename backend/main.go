package main

import (
	"database/sql"
	"encoding/json"
	"log"
	"net/http"
	"os"

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

	r := mux.NewRouter()

	r.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("Base-Application API"))
	})

	user_management.SetupRoutes(r, service)

	port := getEnv("PORT", "8090")
	log.Printf("Server starting on port %s", port)
	log.Fatal(http.ListenAndServe(":"+port, r))
}
