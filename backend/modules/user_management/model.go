package user_management

import (
	"database/sql"
	"time"

	"github.com/go-playground/validator/v10"
)

type User struct {
	ID         string    `json:"id" db:"id"`
	KeycloakID string    `json:"keycloak_id" db:"keycloak_id"`
	Username   string    `json:"username" db:"username" validate:"required,min=3,max=50"`
	Email      string    `json:"email" db:"email" validate:"required,email"`
	FirstName  string    `json:"first_name" db:"first_name" validate:"required"`
	LastName   string    `json:"last_name" db:"last_name" validate:"required"`
	IsActive   bool      `json:"is_active" db:"is_active"`
	CreatedAt  time.Time `json:"created_at" db:"created_at"`
	UpdatedAt  time.Time `json:"updated_at" db:"updated_at"`
}

type RegisterRequest struct {
	Username  string `json:"username" validate:"required,min=3,max=50"`
	Email     string `json:"email" validate:"required,email"`
	FirstName string `json:"first_name" validate:"required"`
	LastName  string `json:"last_name" validate:"required"`
	Password  string `json:"password" validate:"required,min=8"`
}

var validate *validator.Validate

func init() {
	validate = validator.New()
}

type UserRepository interface {
	Create(user *User) error
	GetByID(id string) (*User, error)
	GetByUsername(username string) (*User, error)
	GetByEmail(email string) (*User, error)
	Update(user *User) error
}

type userRepository struct {
	db *sql.DB
}

func NewUserRepository(db *sql.DB) UserRepository {
	return &userRepository{db: db}
}

func (r *userRepository) Create(user *User) error {
	query := `INSERT INTO users (id, keycloak_id, username, email, first_name, last_name, is_active, created_at, updated_at)
	          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`
	_, err := r.db.Exec(query, user.ID, user.KeycloakID, user.Username, user.Email, user.FirstName, user.LastName, user.IsActive, user.CreatedAt, user.UpdatedAt)
	return err
}

func (r *userRepository) GetByID(id string) (*User, error) {
	user := &User{}
	query := `SELECT id, keycloak_id, username, email, first_name, last_name, is_active, created_at, updated_at
	          FROM users WHERE id = $1`
	err := r.db.QueryRow(query, id).Scan(&user.ID, &user.KeycloakID, &user.Username, &user.Email, &user.FirstName, &user.LastName, &user.IsActive, &user.CreatedAt, &user.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	return user, err
}

func (r *userRepository) GetByUsername(username string) (*User, error) {
	user := &User{}
	query := `SELECT id, keycloak_id, username, email, first_name, last_name, is_active, created_at, updated_at
	          FROM users WHERE username = $1`
	err := r.db.QueryRow(query, username).Scan(&user.ID, &user.KeycloakID, &user.Username, &user.Email, &user.FirstName, &user.LastName, &user.IsActive, &user.CreatedAt, &user.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	return user, err
}

func (r *userRepository) GetByEmail(email string) (*User, error) {
	user := &User{}
	query := `SELECT id, keycloak_id, username, email, first_name, last_name, is_active, created_at, updated_at
	          FROM users WHERE email = $1`
	err := r.db.QueryRow(query, email).Scan(&user.ID, &user.KeycloakID, &user.Username, &user.Email, &user.FirstName, &user.LastName, &user.IsActive, &user.CreatedAt, &user.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	return user, err
}

func (r *userRepository) Update(user *User) error {
	query := `UPDATE users SET keycloak_id = $2, username = $3, email = $4, first_name = $5, last_name = $6, is_active = $7, updated_at = $8
	          WHERE id = $1`
	_, err := r.db.Exec(query, user.ID, user.KeycloakID, user.Username, user.Email, user.FirstName, user.LastName, user.IsActive, user.UpdatedAt)
	return err
}
