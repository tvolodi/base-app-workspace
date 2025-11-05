package user_management

import (
	"context"
	"encoding/json"
	"net/http"
	"time"

	"github.com/Nerzal/gocloak/v13"
	"github.com/google/uuid"
	"github.com/gorilla/mux"
	"github.com/sirupsen/logrus"
)

type KeycloakConfig struct {
	URL           string `json:"url"`
	Realm         string `json:"realm"`
	ClientID      string `json:"client_id"`
	ClientSecret  string `json:"client_secret"`
	AdminUsername string `json:"admin_username"`
	AdminPassword string `json:"admin_password"`
}

type UserService struct {
	repo     UserRepository
	keycloak *gocloak.GoCloak
	config   KeycloakConfig
	logger   *logrus.Logger
}

func NewUserService(repo UserRepository, config KeycloakConfig, logger *logrus.Logger) *UserService {
	return &UserService{
		repo:     repo,
		keycloak: gocloak.NewClient(config.URL),
		config:   config,
		logger:   logger,
	}
}

func (s *UserService) RegisterUser(ctx context.Context, req RegisterRequest) (*User, error) {
	// Validate input
	if err := validate.Struct(req); err != nil {
		s.logger.WithError(err).Warn("Validation failed")
		return nil, err
	}

	// Check if username or email exists locally
	if existing, _ := s.repo.GetByUsername(req.Username); existing != nil {
		return nil, &ValidationError{Field: "username", Message: "already exists"}
	}
	if existing, _ := s.repo.GetByEmail(req.Email); existing != nil {
		return nil, &ValidationError{Field: "email", Message: "already exists"}
	}

	// Register in Keycloak
	token, err := s.keycloak.LoginAdmin(ctx, s.config.AdminUsername, s.config.AdminPassword, s.config.Realm)
	if err != nil {
		s.logger.WithError(err).Error("Failed to login to Keycloak")
		return nil, err
	}

	user := gocloak.User{
		Username:      &req.Username,
		Email:         &req.Email,
		FirstName:     &req.FirstName,
		LastName:      &req.LastName,
		EmailVerified: gocloak.BoolP(true),
		Enabled:       gocloak.BoolP(true),
	}

	keycloakID, err := s.keycloak.CreateUser(ctx, token.AccessToken, s.config.Realm, user)
	if err != nil {
		s.logger.WithError(err).Error("Failed to create user in Keycloak")
		return nil, err
	}

	// Set password in Keycloak
	err = s.keycloak.SetPassword(ctx, token.AccessToken, keycloakID, s.config.Realm, req.Password, false)
	if err != nil {
		s.logger.WithError(err).Error("Failed to set password in Keycloak")
		// Optionally delete the user from Keycloak
		return nil, err
	}

	// Create local user
	localUser := &User{
		ID:         uuid.New().String(),
		KeycloakID: keycloakID,
		Username:   req.Username,
		Email:      req.Email,
		FirstName:  req.FirstName,
		LastName:   req.LastName,
		IsActive:   true,
		CreatedAt:  time.Now(),
		UpdatedAt:  time.Now(),
	}

	err = s.repo.Create(localUser)
	if err != nil {
		s.logger.WithError(err).Error("Failed to create user locally")
		// Optionally delete from Keycloak
		return nil, err
	}

	s.logger.WithField("user_id", localUser.ID).Info("User registered successfully")
	return localUser, nil
}

type LoginRequest struct {
	Username string `json:"username" validate:"required"`
	Password string `json:"password" validate:"required"`
}

type LoginResponse struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
	User         *User  `json:"user"`
}

func (s *UserService) LoginUser(ctx context.Context, req LoginRequest) (*LoginResponse, error) {
	// Validate input
	if err := validate.Struct(req); err != nil {
		s.logger.WithError(err).Warn("Login validation failed")
		return nil, err
	}

	// Authenticate with Keycloak
	token, err := s.keycloak.Login(ctx, s.config.ClientID, s.config.ClientSecret, s.config.Realm, req.Username, req.Password)
	if err != nil {
		s.logger.WithError(err).Warn("Login failed")
		return nil, &ValidationError{Field: "credentials", Message: "invalid"}
	}

	// Get user info from local DB
	user, err := s.repo.GetByUsername(req.Username)
	if err != nil {
		s.logger.WithError(err).Error("Failed to get user from DB")
		return nil, err
	}

	return &LoginResponse{
		AccessToken:  token.AccessToken,
		RefreshToken: token.RefreshToken,
		User:         user,
	}, nil
}

type ProfileUpdateRequest struct {
	FirstName string `json:"first_name" validate:"required"`
	LastName  string `json:"last_name" validate:"required"`
	Email     string `json:"email" validate:"required,email"`
}

func (s *UserService) GetProfile(ctx context.Context, userID string) (*User, error) {
	user, err := s.repo.GetByID(userID)
	if err != nil {
		s.logger.WithError(err).Error("Failed to get profile")
		return nil, err
	}
	return user, nil
}

func (s *UserService) UpdateProfile(ctx context.Context, userID string, req ProfileUpdateRequest) (*User, error) {
	// Validate input
	if err := validate.Struct(req); err != nil {
		s.logger.WithError(err).Warn("Profile update validation failed")
		return nil, err
	}

	// Get current user
	user, err := s.repo.GetByID(userID)
	if err != nil {
		return nil, err
	}

	// Check if email is taken by another user
	if existing, _ := s.repo.GetByEmail(req.Email); existing != nil && existing.ID != userID {
		return nil, &ValidationError{Field: "email", Message: "already exists"}
	}

	// Update in Keycloak
	keycloakUser := gocloak.User{
		FirstName: &req.FirstName,
		LastName:  &req.LastName,
		Email:     &req.Email,
	}

	token, err := s.keycloak.LoginAdmin(ctx, s.config.AdminUsername, s.config.AdminPassword, s.config.Realm)
	if err != nil {
		s.logger.WithError(err).Error("Failed to login to Keycloak for update")
		return nil, err
	}

	err = s.keycloak.UpdateUser(ctx, token.AccessToken, s.config.Realm, keycloakUser)
	if err != nil {
		s.logger.WithError(err).Error("Failed to update user in Keycloak")
		return nil, err
	}

	// Update local
	user.FirstName = req.FirstName
	user.LastName = req.LastName
	user.Email = req.Email
	user.UpdatedAt = time.Now()

	err = s.repo.Update(user)
	if err != nil {
		s.logger.WithError(err).Error("Failed to update user locally")
		return nil, err
	}

	s.logger.WithField("user_id", userID).Info("Profile updated successfully")
	return user, nil
}

type ValidationError struct {
	Field   string
	Message string
}

func (e *ValidationError) Error() string {
	return e.Field + ": " + e.Message
}

func RegisterHandler(service *UserService) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		var req RegisterRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Invalid request", http.StatusBadRequest)
			return
		}

		user, err := service.RegisterUser(r.Context(), req)
		if err != nil {
			if ve, ok := err.(*ValidationError); ok {
				http.Error(w, ve.Error(), http.StatusBadRequest)
				return
			}
			http.Error(w, "Registration failed", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(user)
	}
}

func LoginHandler(service *UserService) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		var req LoginRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Invalid request", http.StatusBadRequest)
			return
		}

		response, err := service.LoginUser(r.Context(), req)
		if err != nil {
			if ve, ok := err.(*ValidationError); ok {
				http.Error(w, ve.Error(), http.StatusUnauthorized)
				return
			}
			http.Error(w, "Login failed", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(response)
	}
}

func GetProfileHandler(service *UserService) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		// Assume user ID from context or token, for simplicity, from query param
		userID := r.URL.Query().Get("user_id")
		if userID == "" {
			http.Error(w, "User ID required", http.StatusBadRequest)
			return
		}

		user, err := service.GetProfile(r.Context(), userID)
		if err != nil {
			http.Error(w, "Failed to get profile", http.StatusInternalServerError)
			return
		}
		if user == nil {
			http.Error(w, "User not found", http.StatusNotFound)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(user)
	}
}

func UpdateProfileHandler(service *UserService) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPut {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		// Assume user ID from context
		userID := r.URL.Query().Get("user_id")
		if userID == "" {
			http.Error(w, "User ID required", http.StatusBadRequest)
			return
		}

		var req ProfileUpdateRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Invalid request", http.StatusBadRequest)
			return
		}

		user, err := service.UpdateProfile(r.Context(), userID, req)
		if err != nil {
			if ve, ok := err.(*ValidationError); ok {
				http.Error(w, ve.Error(), http.StatusBadRequest)
				return
			}
			http.Error(w, "Update failed", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(user)
	}
}

func SetupRoutes(r *mux.Router, service *UserService) {
	r.HandleFunc("/api/users/register", RegisterHandler(service)).Methods("POST")
	r.HandleFunc("/api/users/login", LoginHandler(service)).Methods("POST")
	r.HandleFunc("/api/users/profile", GetProfileHandler(service)).Methods("GET")
	r.HandleFunc("/api/users/profile", UpdateProfileHandler(service)).Methods("PUT")
}
