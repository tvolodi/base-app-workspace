package rbac

import (
	"context"
	"encoding/json"
	"net/http"
	"os"
	"strings"
	"sync"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/gorilla/mux"
	"github.com/sirupsen/logrus"
)

// ErrorResponse represents a standardized error response
type ErrorResponse struct {
	Error   string            `json:"error"`
	Code    string            `json:"code"`
	Details map[string]string `json:"details,omitempty"`
}

// writeErrorResponse writes a standardized error response
func writeErrorResponse(w http.ResponseWriter, statusCode int, message, code string, details map[string]string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	json.NewEncoder(w).Encode(ErrorResponse{
		Error:   message,
		Code:    code,
		Details: details,
	})
}

// getEnv gets an environment variable with a default fallback value
func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

// RateLimiter implements a simple in-memory rate limiter
type RateLimiter struct {
	mu       sync.RWMutex
	requests map[string][]time.Time
	limit    int
	window   time.Duration
}

// NewRateLimiter creates a new rate limiter
func NewRateLimiter(limit int, window time.Duration) *RateLimiter {
	return &RateLimiter{
		requests: make(map[string][]time.Time),
		limit:    limit,
		window:   window,
	}
}

// Allow checks if a request from the given key is allowed
func (rl *RateLimiter) Allow(key string) bool {
	rl.mu.Lock()
	defer rl.mu.Unlock()

	now := time.Now()
	windowStart := now.Add(-rl.window)

	// Clean old requests
	if requests, exists := rl.requests[key]; exists {
		validRequests := make([]time.Time, 0, len(requests))
		for _, reqTime := range requests {
			if reqTime.After(windowStart) {
				validRequests = append(validRequests, reqTime)
			}
		}
		rl.requests[key] = validRequests
	}

	// Check if under limit
	if len(rl.requests[key]) < rl.limit {
		rl.requests[key] = append(rl.requests[key], now)
		return true
	}

	return false
}

// RateLimitMiddleware creates rate limiting middleware
func RateLimitMiddleware(limit int, window time.Duration) mux.MiddlewareFunc {
	limiter := NewRateLimiter(limit, window)
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// Use client IP as the rate limiting key
			clientIP := getClientIP(r)
			if !limiter.Allow(clientIP) {
				writeErrorResponse(w, http.StatusTooManyRequests, "Rate limit exceeded", "RATE_LIMIT_EXCEEDED", map[string]string{
					"retry_after": "60", // Suggest retry after 60 seconds
				})
				return
			}
			next.ServeHTTP(w, r)
		})
	}
}

// getClientIP extracts the client IP address from the request
func getClientIP(r *http.Request) string {
	// Check X-Forwarded-For header first (for proxies/load balancers)
	xForwardedFor := r.Header.Get("X-Forwarded-For")
	if xForwardedFor != "" {
		// Take the first IP if multiple are present
		ips := strings.Split(xForwardedFor, ",")
		return strings.TrimSpace(ips[0])
	}

	// Check X-Real-IP header
	xRealIP := r.Header.Get("X-Real-IP")
	if xRealIP != "" {
		return xRealIP
	}

	// Fall back to RemoteAddr
	ip := r.RemoteAddr
	// Remove port if present
	if strings.Contains(ip, ":") {
		ip, _, _ = strings.Cut(ip, ":")
	}
	return ip
}

// JWTClaims represents the JWT token claims from Keycloak
type JWTClaims struct {
	UserID   string   `json:"sub"`                    // Keycloak user ID
	Username string   `json:"preferred_username"`     // Keycloak username
	Email    string   `json:"email"`                  // Keycloak email
	Groups   []string `json:"groups"`                 // Keycloak groups
	Roles    []string `json:"realm_access,omitempty"` // Keycloak realm roles (nested structure)
	jwt.RegisteredClaims
}

// RealmAccess represents the nested realm_access structure in Keycloak JWT
type RealmAccess struct {
	Roles []string `json:"roles"`
}

// UserContextKey is used to store user information in request context
type UserContextKey string

const UserIDKey UserContextKey = "user_id"
const UsernameKey UserContextKey = "username"
const UserPermissionsKey UserContextKey = "user_permissions"

// withAuth wraps a handler with authentication middleware requiring specific permission
func withAuth(permission string, service *RBACService, handler http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Extract token from Authorization header
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			writeErrorResponse(w, http.StatusUnauthorized, "Authorization header required", "AUTH_HEADER_MISSING", nil)
			return
		}

		// Check Bearer token format
		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			writeErrorResponse(w, http.StatusUnauthorized, "Invalid authorization format. Expected 'Bearer <token>'", "INVALID_AUTH_FORMAT", nil)
			return
		}

		tokenString := parts[1]
		if tokenString == "" {
			writeErrorResponse(w, http.StatusUnauthorized, "Token is required", "TOKEN_MISSING", nil)
			return
		}

		// Parse and validate JWT token
		token, err := jwt.ParseWithClaims(tokenString, &JWTClaims{}, func(token *jwt.Token) (interface{}, error) {
			// Validate signing method
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, jwt.ErrSignatureInvalid
			}
			// Use JWT secret from environment or default for development
			// Use TEST_JWT_SECRET for testing, otherwise JWT_SECRET
			jwtSecret := getEnv("TEST_JWT_SECRET", getEnv("JWT_SECRET", "your-secret-key-change-in-production"))
			return []byte(jwtSecret), nil
		})

		if err != nil {
			writeErrorResponse(w, http.StatusUnauthorized, "Invalid token", "INVALID_TOKEN", nil)
			return
		}

		// Extract claims
		claims, ok := token.Claims.(*JWTClaims)
		if !ok || !token.Valid {
			writeErrorResponse(w, http.StatusUnauthorized, "Invalid token claims", "INVALID_CLAIMS", nil)
			return
		}

		// Check token expiration
		if claims.ExpiresAt != nil && claims.ExpiresAt.Before(time.Now()) {
			writeErrorResponse(w, http.StatusUnauthorized, "Token has expired", "TOKEN_EXPIRED", nil)
			return
		}

		// Get user permissions from database based on groups
		userPerms, err := service.GetUserPermissions(r.Context(), claims.UserID)
		if err != nil {
			service.logger.WithError(err).Error("Failed to get user permissions from database")
			writeErrorResponse(w, http.StatusInternalServerError, "Failed to load user permissions", "PERMISSION_LOAD_ERROR", nil)
			return
		}

		// Extract permission names for checking
		var permissionNames []string
		for _, perm := range userPerms.Permissions {
			permissionNames = append(permissionNames, perm.Name)
		}

		// Check if user has required permission
		if permission != "" {
			hasPermission := false
			for _, perm := range permissionNames {
				if perm == permission {
					hasPermission = true
					break
				}
			}
			if !hasPermission {
				writeErrorResponse(w, http.StatusForbidden, "Insufficient permissions", "INSUFFICIENT_PERMISSIONS", map[string]string{"required": permission})
				return
			}
		}

		// Add user information to request context
		ctx := context.WithValue(r.Context(), UserIDKey, claims.UserID)
		ctx = context.WithValue(ctx, UsernameKey, claims.Username)
		ctx = context.WithValue(ctx, UserPermissionsKey, permissionNames)
		r = r.WithContext(ctx)

		handler(w, r)
	}
}

// getUserIDFromContext extracts user ID from request context
func getUserIDFromContext(ctx context.Context) string {
	if userID, ok := ctx.Value(UserIDKey).(string); ok {
		return userID
	}
	return ""
}

// getUserPermissionsFromContext extracts user permissions from request context
func getUserPermissionsFromContext(ctx context.Context) []string {
	if permissions, ok := ctx.Value(UserPermissionsKey).([]string); ok {
		return permissions
	}
	return []string{}
}

// hasPermission checks if the user has a specific permission
func hasPermission(userPermissions []string, requiredPermission string) bool {
	for _, perm := range userPermissions {
		if perm == requiredPermission {
			return true
		}
	}
	return false
}

// RBACService provides business logic for RBAC operations
type RBACService struct {
	repo   *RBACRepository
	logger *logrus.Logger
}

// NewRBACService creates a new RBAC service
func NewRBACService(repo *RBACRepository, logger *logrus.Logger) *RBACService {
	return &RBACService{
		repo:   repo,
		logger: logger,
	}
}

// CreateRole creates a new role
func (s *RBACService) CreateRole(ctx context.Context, req CreateRoleRequest) (*Role, error) {
	// Validate input
	if err := validate.Struct(req); err != nil {
		s.logger.WithError(err).Warn("Role creation validation failed")
		return nil, err
	}

	// Check if role name already exists
	if existing, _ := s.repo.RoleRepo.GetByName(req.Name); existing != nil {
		return nil, &ValidationError{Field: "name", Message: "already exists"}
	}

	role := &Role{
		ID:          uuid.New().String(),
		Name:        req.Name,
		Description: req.Description,
		CreatedAt:   time.Now(),
	}

	err := s.repo.RoleRepo.Create(role)
	if err != nil {
		s.logger.WithError(err).Error("Failed to create role")
		return nil, err
	}

	// Log with user context if available
	userID := getUserIDFromContext(ctx)
	logger := s.logger.WithField("role_id", role.ID)
	if userID != "" {
		logger = logger.WithField("user_id", userID)
	}
	logger.Info("Role created successfully")
	return role, nil
}

// GetRole retrieves a role by ID
func (s *RBACService) GetRole(id string) (*Role, error) {
	role, err := s.repo.RoleRepo.GetByID(id)
	if err != nil {
		s.logger.WithError(err).Error("Failed to get role")
		return nil, err
	}
	return role, nil
}

// ListRoles retrieves all roles
func (s *RBACService) ListRoles() ([]*Role, error) {
	roles, err := s.repo.RoleRepo.List()
	if err != nil {
		s.logger.WithError(err).Error("Failed to list roles")
		return nil, err
	}
	return roles, nil
}

// UpdateRole updates an existing role
func (s *RBACService) UpdateRole(id string, req UpdateRoleRequest) (*Role, error) {
	// Validate input
	if err := validate.Struct(req); err != nil {
		s.logger.WithError(err).Warn("Role update validation failed")
		return nil, err
	}

	// Get existing role
	role, err := s.repo.RoleRepo.GetByID(id)
	if err != nil {
		return nil, err
	}
	if role == nil {
		return nil, &ValidationError{Field: "id", Message: "role not found"}
	}

	// Check if name conflicts with another role
	if existing, _ := s.repo.RoleRepo.GetByName(req.Name); existing != nil && existing.ID != id {
		return nil, &ValidationError{Field: "name", Message: "already exists"}
	}

	role.Name = req.Name
	role.Description = req.Description

	err = s.repo.RoleRepo.Update(role)
	if err != nil {
		s.logger.WithError(err).Error("Failed to update role")
		return nil, err
	}

	s.logger.WithField("role_id", id).Info("Role updated successfully")
	return role, nil
}

// DeleteRole deletes a role
func (s *RBACService) DeleteRole(id string) error {
	// Check if role exists
	role, err := s.repo.RoleRepo.GetByID(id)
	if err != nil {
		return err
	}
	if role == nil {
		return &ValidationError{Field: "id", Message: "role not found"}
	}

	// Start transaction
	tx, err := s.repo.RoleRepo.(*roleRepository).db.Begin()
	if err != nil {
		s.logger.WithError(err).Error("Failed to begin transaction")
		return err
	}
	defer tx.Rollback()

	// Clear role permissions within transaction
	err = s.repo.RolePermRepo.(*rolePermissionRepository).ClearRolePermissionsWithTransaction(tx, id)
	if err != nil {
		s.logger.WithError(err).Error("Failed to clear role permissions in transaction")
		return err
	}

	// Remove role from all groups within transaction
	err = s.repo.GroupRoleRepo.(*groupRoleRepository).RemoveRoleFromAllGroupsWithTransaction(tx, id)
	if err != nil {
		s.logger.WithError(err).Error("Failed to remove role from groups in transaction")
		return err
	}

	// Delete the role within transaction
	err = s.repo.RoleRepo.(*roleRepository).DeleteWithTransaction(tx, id)
	if err != nil {
		s.logger.WithError(err).Error("Failed to delete role in transaction")
		return err
	}

	// Commit transaction
	err = tx.Commit()
	if err != nil {
		s.logger.WithError(err).Error("Failed to commit transaction")
		return err
	}

	s.logger.WithField("role_id", id).Info("Role deleted successfully")
	return nil
}

// AssignPermissionsToRole assigns permissions to a role
func (s *RBACService) AssignPermissionsToRole(roleID string, req AssignPermissionsToRoleRequest) error {
	// Validate input
	if err := validate.Struct(req); err != nil {
		s.logger.WithError(err).Warn("Permission assignment validation failed")
		return err
	}

	// Check if role exists
	role, err := s.repo.RoleRepo.GetByID(roleID)
	if err != nil {
		return err
	}
	if role == nil {
		return &ValidationError{Field: "role_id", Message: "role not found"}
	}

	// Validate all permissions exist
	for _, permID := range req.PermissionIDs {
		perm, err := s.repo.PermissionRepo.GetByID(permID)
		if err != nil {
			return err
		}
		if perm == nil {
			return &ValidationError{Field: "permission_ids", Message: "permission not found: " + permID}
		}
	}

	err = s.repo.RolePermRepo.AssignPermissionsToRole(roleID, req.PermissionIDs)
	if err != nil {
		s.logger.WithError(err).Error("Failed to assign permissions to role")
		return err
	}

	s.logger.WithFields(logrus.Fields{
		"role_id":     roleID,
		"permissions": req.PermissionIDs,
	}).Info("Permissions assigned to role successfully")
	return nil
}

// GetRolePermissions retrieves permissions for a role
func (s *RBACService) GetRolePermissions(roleID string) ([]*Permission, error) {
	permissions, err := s.repo.RolePermRepo.GetRolePermissions(roleID)
	if err != nil {
		s.logger.WithError(err).Error("Failed to get role permissions")
		return nil, err
	}
	return permissions, nil
}

// CreateRoleGroup creates a new role group
func (s *RBACService) CreateRoleGroup(req CreateRoleGroupRequest) (*RoleGroup, error) {
	// Validate input
	if err := validate.Struct(req); err != nil {
		s.logger.WithError(err).Warn("Role group creation validation failed")
		return nil, err
	}

	// Check if group name already exists
	if existing, _ := s.repo.GroupRepo.GetByName(req.Name); existing != nil {
		return nil, &ValidationError{Field: "name", Message: "already exists"}
	}

	group := &RoleGroup{
		ID:          uuid.New().String(),
		Name:        req.Name,
		Description: req.Description,
		CreatedAt:   time.Now(),
	}

	err := s.repo.GroupRepo.Create(group)
	if err != nil {
		s.logger.WithError(err).Error("Failed to create role group")
		return nil, err
	}

	s.logger.WithField("group_id", group.ID).Info("Role group created successfully")
	return group, nil
}

// GetRoleGroup retrieves a role group by ID
func (s *RBACService) GetRoleGroup(id string) (*RoleGroup, error) {
	group, err := s.repo.GroupRepo.GetByID(id)
	if err != nil {
		s.logger.WithError(err).Error("Failed to get role group")
		return nil, err
	}
	return group, nil
}

// ListRoleGroups retrieves all role groups
func (s *RBACService) ListRoleGroups() ([]*RoleGroup, error) {
	groups, err := s.repo.GroupRepo.List()
	if err != nil {
		s.logger.WithError(err).Error("Failed to list role groups")
		return nil, err
	}
	return groups, nil
}

// UpdateRoleGroup updates an existing role group
func (s *RBACService) UpdateRoleGroup(id string, req UpdateRoleGroupRequest) (*RoleGroup, error) {
	// Validate input
	if err := validate.Struct(req); err != nil {
		s.logger.WithError(err).Warn("Role group update validation failed")
		return nil, err
	}

	// Get existing group
	group, err := s.repo.GroupRepo.GetByID(id)
	if err != nil {
		return nil, err
	}
	if group == nil {
		return nil, &ValidationError{Field: "id", Message: "role group not found"}
	}

	// Check if name conflicts with another group
	if existing, _ := s.repo.GroupRepo.GetByName(req.Name); existing != nil && existing.ID != id {
		return nil, &ValidationError{Field: "name", Message: "already exists"}
	}

	group.Name = req.Name
	group.Description = req.Description

	err = s.repo.GroupRepo.Update(group)
	if err != nil {
		s.logger.WithError(err).Error("Failed to update role group")
		return nil, err
	}

	s.logger.WithField("group_id", id).Info("Role group updated successfully")
	return group, nil
}

// DeleteRoleGroup deletes a role group
func (s *RBACService) DeleteRoleGroup(id string) error {
	// Check if group exists
	group, err := s.repo.GroupRepo.GetByID(id)
	if err != nil {
		return err
	}
	if group == nil {
		return &ValidationError{Field: "id", Message: "role group not found"}
	}

	// Start transaction
	tx, err := s.repo.GroupRepo.(*roleGroupRepository).db.Begin()
	if err != nil {
		s.logger.WithError(err).Error("Failed to begin transaction")
		return err
	}
	defer tx.Rollback()

	// Clear group roles within transaction
	err = s.repo.GroupRoleRepo.(*groupRoleRepository).ClearGroupRolesWithTransaction(tx, id)
	if err != nil {
		s.logger.WithError(err).Error("Failed to clear group roles in transaction")
		return err
	}

	// Remove all users from group within transaction
	err = s.repo.MembershipRepo.(*userGroupMembershipRepository).ClearGroupMembershipsWithTransaction(tx, id)
	if err != nil {
		s.logger.WithError(err).Error("Failed to clear group memberships in transaction")
		return err
	}

	// Delete the group within transaction
	err = s.repo.GroupRepo.(*roleGroupRepository).DeleteWithTransaction(tx, id)
	if err != nil {
		s.logger.WithError(err).Error("Failed to delete role group in transaction")
		return err
	}

	// Commit transaction
	err = tx.Commit()
	if err != nil {
		s.logger.WithError(err).Error("Failed to commit transaction")
		return err
	}

	s.logger.WithField("group_id", id).Info("Role group deleted successfully")
	return nil
}

// AssignUserToGroup assigns a user to a role group
func (s *RBACService) AssignUserToGroup(groupID string, req AssignUserToGroupRequest) error {
	// Validate input
	if err := validate.Struct(req); err != nil {
		s.logger.WithError(err).Warn("User assignment validation failed")
		return err
	}

	// Check if group exists
	group, err := s.repo.GroupRepo.GetByID(groupID)
	if err != nil {
		return err
	}
	if group == nil {
		return &ValidationError{Field: "group_id", Message: "group not found"}
	}

	// Check if user is already in group
	isMember, err := s.repo.MembershipRepo.IsUserInGroup(req.UserID, groupID)
	if err != nil {
		return err
	}
	if isMember {
		return &ValidationError{Field: "user_id", Message: "user already in group"}
	}

	membership := &UserGroupMembership{
		UserID:     req.UserID,
		GroupID:    groupID,
		AssignedAt: time.Now(),
	}

	err = s.repo.MembershipRepo.Create(membership)
	if err != nil {
		s.logger.WithError(err).Error("Failed to assign user to group")
		return err
	}

	s.logger.WithFields(logrus.Fields{
		"user_id":  req.UserID,
		"group_id": groupID,
	}).Info("User assigned to group successfully")
	return nil
}

// RemoveUserFromGroup removes a user from a role group
func (s *RBACService) RemoveUserFromGroup(groupID, userID string) error {
	// Check if membership exists
	isMember, err := s.repo.MembershipRepo.IsUserInGroup(userID, groupID)
	if err != nil {
		return err
	}
	if !isMember {
		return &ValidationError{Field: "user_id", Message: "user not in group"}
	}

	err = s.repo.MembershipRepo.Delete(userID, groupID)
	if err != nil {
		s.logger.WithError(err).Error("Failed to remove user from group")
		return err
	}

	s.logger.WithFields(logrus.Fields{
		"user_id":  userID,
		"group_id": groupID,
	}).Info("User removed from group successfully")
	return nil
}

// GetUserGroups retrieves all groups for a user
func (s *RBACService) GetUserGroups(userID string) ([]*RoleGroup, error) {
	groups, err := s.repo.MembershipRepo.GetUserGroups(userID)
	if err != nil {
		s.logger.WithError(err).Error("Failed to get user groups")
		return nil, err
	}
	return groups, nil
}

// GetGroupUsers retrieves all users in a group
func (s *RBACService) GetGroupUsers(groupID string) ([]string, error) {
	userIDs, err := s.repo.MembershipRepo.GetGroupUsers(groupID)
	if err != nil {
		s.logger.WithError(err).Error("Failed to get group users")
		return nil, err
	}
	return userIDs, nil
}

// AssignRolesToGroup assigns roles to a group
func (s *RBACService) AssignRolesToGroup(groupID string, req AssignRolesToGroupRequest) error {
	// Validate input
	if err := validate.Struct(req); err != nil {
		s.logger.WithError(err).Warn("Role assignment validation failed")
		return err
	}

	// Check if group exists
	group, err := s.repo.GroupRepo.GetByID(groupID)
	if err != nil {
		return err
	}
	if group == nil {
		return &ValidationError{Field: "group_id", Message: "group not found"}
	}

	// Validate all roles exist
	for _, roleID := range req.RoleIDs {
		role, err := s.repo.RoleRepo.GetByID(roleID)
		if err != nil {
			return err
		}
		if role == nil {
			return &ValidationError{Field: "role_ids", Message: "role not found: " + roleID}
		}
	}

	err = s.repo.GroupRoleRepo.AssignRolesToGroup(groupID, req.RoleIDs)
	if err != nil {
		s.logger.WithError(err).Error("Failed to assign roles to group")
		return err
	}

	s.logger.WithFields(logrus.Fields{
		"group_id": groupID,
		"roles":    req.RoleIDs,
	}).Info("Roles assigned to group successfully")
	return nil
}

// GetGroupRoles retrieves roles for a group
func (s *RBACService) GetGroupRoles(groupID string) ([]*Role, error) {
	roles, err := s.repo.GroupRoleRepo.GetGroupRoles(groupID)
	if err != nil {
		s.logger.WithError(err).Error("Failed to get group roles")
		return nil, err
	}
	return roles, nil
}

// GetUserPermissions retrieves all permissions for a user through their groups using a single optimized query
func (s *RBACService) GetUserPermissions(ctx context.Context, userID string) (*UserPermissions, error) {
	// Use single optimized query with JOINs to get all user permissions
	query := `
		SELECT DISTINCT
			p.id, p.name, p.resource, p.action,
			r.id, r.name, r.description, r.created_at,
			rg.id, rg.name, rg.description, rg.created_at
		FROM permissions p
		JOIN role_permissions rp ON p.id = rp.permission_id
		JOIN group_roles gr ON rp.role_id = gr.role_id
		JOIN user_group_memberships ugm ON gr.group_id = ugm.group_id
		JOIN roles r ON rp.role_id = r.id
		JOIN role_groups rg ON gr.group_id = rg.id
		WHERE ugm.user_id = $1
		ORDER BY rg.name, r.name, p.resource, p.action
	`

	rows, err := s.repo.RoleRepo.(*roleRepository).db.Query(query, userID)
	if err != nil {
		s.logger.WithError(err).Error("Failed to get user permissions")
		return nil, err
	}
	defer rows.Close()

	// Use maps to deduplicate results
	permissionMap := make(map[string]*Permission)
	roleMap := make(map[string]*Role)
	groupMap := make(map[string]*RoleGroup)

	for rows.Next() {
		var perm Permission
		var role Role
		var group RoleGroup

		err := rows.Scan(
			&perm.ID, &perm.Name, &perm.Resource, &perm.Action,
			&role.ID, &role.Name, &role.Description, &role.CreatedAt,
			&group.ID, &group.Name, &group.Description, &group.CreatedAt,
		)
		if err != nil {
			s.logger.WithError(err).Error("Failed to scan user permissions")
			return nil, err
		}

		// Store in maps to deduplicate
		permissionMap[perm.ID] = &perm
		roleMap[role.ID] = &role
		groupMap[group.ID] = &group
	}

	// Convert maps to slices
	var permissions []Permission
	for _, perm := range permissionMap {
		permissions = append(permissions, *perm)
	}

	var roles []Role
	for _, role := range roleMap {
		roles = append(roles, *role)
	}

	var groups []RoleGroup
	for _, group := range groupMap {
		groups = append(groups, *group)
	}

	return &UserPermissions{
		UserID:      userID,
		Permissions: permissions,
		Roles:       roles,
		Groups:      groups,
	}, nil
}

// ListPermissions retrieves all available permissions
func (s *RBACService) ListPermissions() ([]*Permission, error) {
	permissions, err := s.repo.PermissionRepo.List()
	if err != nil {
		s.logger.WithError(err).Error("Failed to list permissions")
		return nil, err
	}
	return permissions, nil
}

// HTTP Handlers

// CreateRoleHandler handles POST /api/rbac/roles
func CreateRoleHandler(service *RBACService) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			writeErrorResponse(w, http.StatusMethodNotAllowed, "Method not allowed", "METHOD_NOT_ALLOWED", nil)
			return
		}

		var req CreateRoleRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			writeErrorResponse(w, http.StatusBadRequest, "Invalid request body", "INVALID_REQUEST", nil)
			return
		}

		role, err := service.CreateRole(r.Context(), req)
		if err != nil {
			if ve, ok := err.(*ValidationError); ok {
				writeErrorResponse(w, http.StatusBadRequest, ve.Error(), "VALIDATION_ERROR", map[string]string{ve.Field: ve.Message})
				return
			}
			writeErrorResponse(w, http.StatusInternalServerError, "Failed to create role", "INTERNAL_ERROR", nil)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(role)
	}
}

// GetRolesHandler handles GET /api/rbac/roles
func GetRolesHandler(service *RBACService) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		roles, err := service.ListRoles()
		if err != nil {
			http.Error(w, "Failed to get roles", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(roles)
	}
}

// UpdateRoleHandler handles PUT /api/rbac/roles/{id}
func UpdateRoleHandler(service *RBACService) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPut {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		vars := mux.Vars(r)
		roleID := vars["id"]
		if roleID == "" {
			http.Error(w, "Role ID required", http.StatusBadRequest)
			return
		}

		var req UpdateRoleRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Invalid request", http.StatusBadRequest)
			return
		}

		role, err := service.UpdateRole(roleID, req)
		if err != nil {
			if ve, ok := err.(*ValidationError); ok {
				http.Error(w, ve.Error(), http.StatusBadRequest)
				return
			}
			http.Error(w, "Failed to update role", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(role)
	}
}

// DeleteRoleHandler handles DELETE /api/rbac/roles/{id}
func DeleteRoleHandler(service *RBACService) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodDelete {
			writeErrorResponse(w, http.StatusMethodNotAllowed, "Method not allowed", "METHOD_NOT_ALLOWED", nil)
			return
		}

		vars := mux.Vars(r)
		roleID := vars["id"]
		if roleID == "" {
			writeErrorResponse(w, http.StatusBadRequest, "Role ID required", "MISSING_ROLE_ID", nil)
			return
		}

		err := service.DeleteRole(roleID)
		if err != nil {
			if ve, ok := err.(*ValidationError); ok {
				writeErrorResponse(w, http.StatusBadRequest, ve.Error(), "VALIDATION_ERROR", map[string]string{ve.Field: ve.Message})
				return
			}
			writeErrorResponse(w, http.StatusInternalServerError, "Failed to delete role", "INTERNAL_ERROR", nil)
			return
		}

		w.WriteHeader(http.StatusNoContent)
	}
}

// CreateRoleGroupHandler handles POST /api/rbac/groups
func CreateRoleGroupHandler(service *RBACService) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		var req CreateRoleGroupRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Invalid request", http.StatusBadRequest)
			return
		}

		group, err := service.CreateRoleGroup(req)
		if err != nil {
			if ve, ok := err.(*ValidationError); ok {
				http.Error(w, ve.Error(), http.StatusBadRequest)
				return
			}
			http.Error(w, "Failed to create role group", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(group)
	}
}

// GetRoleGroupsHandler handles GET /api/rbac/groups
func GetRoleGroupsHandler(service *RBACService) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			writeErrorResponse(w, http.StatusMethodNotAllowed, "Method not allowed", "METHOD_NOT_ALLOWED", nil)
			return
		}

		groups, err := service.ListRoleGroups()
		if err != nil {
			writeErrorResponse(w, http.StatusInternalServerError, "Failed to get role groups", "INTERNAL_ERROR", nil)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(groups)
	}
}

// GetRoleGroupHandler handles GET /api/rbac/groups/{id}
func GetRoleGroupHandler(service *RBACService) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			writeErrorResponse(w, http.StatusMethodNotAllowed, "Method not allowed", "METHOD_NOT_ALLOWED", nil)
			return
		}

		vars := mux.Vars(r)
		groupID := vars["id"]
		if groupID == "" {
			writeErrorResponse(w, http.StatusBadRequest, "Group ID required", "MISSING_GROUP_ID", nil)
			return
		}

		group, err := service.GetRoleGroup(groupID)
		if err != nil {
			writeErrorResponse(w, http.StatusInternalServerError, "Failed to get role group", "INTERNAL_ERROR", nil)
			return
		}
		if group == nil {
			writeErrorResponse(w, http.StatusNotFound, "Role group not found", "GROUP_NOT_FOUND", nil)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(group)
	}
}

// UpdateRoleGroupHandler handles PUT /api/rbac/groups/{id}
func UpdateRoleGroupHandler(service *RBACService) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPut {
			writeErrorResponse(w, http.StatusMethodNotAllowed, "Method not allowed", "METHOD_NOT_ALLOWED", nil)
			return
		}

		vars := mux.Vars(r)
		groupID := vars["id"]
		if groupID == "" {
			writeErrorResponse(w, http.StatusBadRequest, "Group ID required", "MISSING_GROUP_ID", nil)
			return
		}

		var req UpdateRoleGroupRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			writeErrorResponse(w, http.StatusBadRequest, "Invalid request body", "INVALID_REQUEST", nil)
			return
		}

		group, err := service.UpdateRoleGroup(groupID, req)
		if err != nil {
			if ve, ok := err.(*ValidationError); ok {
				writeErrorResponse(w, http.StatusBadRequest, ve.Error(), "VALIDATION_ERROR", map[string]string{ve.Field: ve.Message})
				return
			}
			writeErrorResponse(w, http.StatusInternalServerError, "Failed to update role group", "INTERNAL_ERROR", nil)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(group)
	}
}

// DeleteRoleGroupHandler handles DELETE /api/rbac/groups/{id}
func DeleteRoleGroupHandler(service *RBACService) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodDelete {
			writeErrorResponse(w, http.StatusMethodNotAllowed, "Method not allowed", "METHOD_NOT_ALLOWED", nil)
			return
		}

		vars := mux.Vars(r)
		groupID := vars["id"]
		if groupID == "" {
			writeErrorResponse(w, http.StatusBadRequest, "Group ID required", "MISSING_GROUP_ID", nil)
			return
		}

		err := service.DeleteRoleGroup(groupID)
		if err != nil {
			if ve, ok := err.(*ValidationError); ok {
				writeErrorResponse(w, http.StatusBadRequest, ve.Error(), "VALIDATION_ERROR", map[string]string{ve.Field: ve.Message})
				return
			}
			writeErrorResponse(w, http.StatusInternalServerError, "Failed to delete role group", "INTERNAL_ERROR", nil)
			return
		}

		w.WriteHeader(http.StatusNoContent)
	}
}

// AssignUserToGroupHandler handles PUT /api/rbac/groups/{id}/assign-user
func AssignUserToGroupHandler(service *RBACService) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPut {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		vars := mux.Vars(r)
		groupID := vars["id"]
		if groupID == "" {
			http.Error(w, "Group ID required", http.StatusBadRequest)
			return
		}

		var req AssignUserToGroupRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Invalid request", http.StatusBadRequest)
			return
		}

		err := service.AssignUserToGroup(groupID, req)
		if err != nil {
			if ve, ok := err.(*ValidationError); ok {
				http.Error(w, ve.Error(), http.StatusBadRequest)
				return
			}
			http.Error(w, "Failed to assign user to group", http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]string{"message": "User assigned to group successfully"})
	}
}

// RemoveUserFromGroupHandler handles DELETE /api/rbac/groups/{id}/users/{userId}
func RemoveUserFromGroupHandler(service *RBACService) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodDelete {
			writeErrorResponse(w, http.StatusMethodNotAllowed, "Method not allowed", "METHOD_NOT_ALLOWED", nil)
			return
		}

		vars := mux.Vars(r)
		groupID := vars["id"]
		userID := vars["userId"]
		if groupID == "" || userID == "" {
			writeErrorResponse(w, http.StatusBadRequest, "Group ID and User ID required", "MISSING_IDS", nil)
			return
		}

		err := service.RemoveUserFromGroup(groupID, userID)
		if err != nil {
			if ve, ok := err.(*ValidationError); ok {
				writeErrorResponse(w, http.StatusBadRequest, ve.Error(), "VALIDATION_ERROR", map[string]string{ve.Field: ve.Message})
				return
			}
			writeErrorResponse(w, http.StatusInternalServerError, "Failed to remove user from group", "INTERNAL_ERROR", nil)
			return
		}

		w.WriteHeader(http.StatusNoContent)
	}
}

// GetGroupUsersHandler handles GET /api/rbac/groups/{id}/users
func GetGroupUsersHandler(service *RBACService) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			writeErrorResponse(w, http.StatusMethodNotAllowed, "Method not allowed", "METHOD_NOT_ALLOWED", nil)
			return
		}

		vars := mux.Vars(r)
		groupID := vars["id"]
		if groupID == "" {
			writeErrorResponse(w, http.StatusBadRequest, "Group ID required", "MISSING_GROUP_ID", nil)
			return
		}

		userIDs, err := service.GetGroupUsers(groupID)
		if err != nil {
			writeErrorResponse(w, http.StatusInternalServerError, "Failed to get group users", "INTERNAL_ERROR", nil)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{"user_ids": userIDs})
	}
}

// AssignRolesToGroupHandler handles POST /api/rbac/groups/{id}/roles
func AssignRolesToGroupHandler(service *RBACService) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			writeErrorResponse(w, http.StatusMethodNotAllowed, "Method not allowed", "METHOD_NOT_ALLOWED", nil)
			return
		}

		vars := mux.Vars(r)
		groupID := vars["id"]
		if groupID == "" {
			writeErrorResponse(w, http.StatusBadRequest, "Group ID required", "MISSING_GROUP_ID", nil)
			return
		}

		var req AssignRolesToGroupRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			writeErrorResponse(w, http.StatusBadRequest, "Invalid request body", "INVALID_REQUEST", nil)
			return
		}

		err := service.AssignRolesToGroup(groupID, req)
		if err != nil {
			if ve, ok := err.(*ValidationError); ok {
				writeErrorResponse(w, http.StatusBadRequest, ve.Error(), "VALIDATION_ERROR", map[string]string{ve.Field: ve.Message})
				return
			}
			writeErrorResponse(w, http.StatusInternalServerError, "Failed to assign roles to group", "INTERNAL_ERROR", nil)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]string{"message": "Roles assigned to group successfully"})
	}
}

// GetGroupRolesHandler handles GET /api/rbac/groups/{id}/roles
func GetGroupRolesHandler(service *RBACService) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			writeErrorResponse(w, http.StatusMethodNotAllowed, "Method not allowed", "METHOD_NOT_ALLOWED", nil)
			return
		}

		vars := mux.Vars(r)
		groupID := vars["id"]
		if groupID == "" {
			writeErrorResponse(w, http.StatusBadRequest, "Group ID required", "MISSING_GROUP_ID", nil)
			return
		}

		roles, err := service.GetGroupRoles(groupID)
		if err != nil {
			writeErrorResponse(w, http.StatusInternalServerError, "Failed to get group roles", "INTERNAL_ERROR", nil)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(roles)
	}
}

// GetUserGroupsHandler handles GET /api/rbac/users/{id}/groups
func GetUserGroupsHandler(service *RBACService) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			writeErrorResponse(w, http.StatusMethodNotAllowed, "Method not allowed", "METHOD_NOT_ALLOWED", nil)
			return
		}

		vars := mux.Vars(r)
		userID := vars["id"]
		if userID == "" {
			writeErrorResponse(w, http.StatusBadRequest, "User ID required", "MISSING_USER_ID", nil)
			return
		}

		groups, err := service.GetUserGroups(userID)
		if err != nil {
			writeErrorResponse(w, http.StatusInternalServerError, "Failed to get user groups", "INTERNAL_ERROR", nil)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(groups)
	}
}

// GetPermissionsHandler handles GET /api/rbac/permissions
func GetPermissionsHandler(service *RBACService) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		permissions, err := service.ListPermissions()
		if err != nil {
			http.Error(w, "Failed to get permissions", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(permissions)
	}
}

// GetUserPermissionsHandler handles GET /api/rbac/users/{id}/permissions
func GetUserPermissionsHandler(service *RBACService) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			writeErrorResponse(w, http.StatusMethodNotAllowed, "Method not allowed", "METHOD_NOT_ALLOWED", nil)
			return
		}

		vars := mux.Vars(r)
		userID := vars["id"]
		if userID == "" {
			writeErrorResponse(w, http.StatusBadRequest, "User ID required", "MISSING_USER_ID", nil)
			return
		}

		userPerms, err := service.GetUserPermissions(r.Context(), userID)
		if err != nil {
			writeErrorResponse(w, http.StatusInternalServerError, "Failed to get user permissions", "INTERNAL_ERROR", nil)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(userPerms)
	}
}

// SetupRoutes configures the RBAC routes with authentication and rate limiting middleware
func SetupRoutes(r *mux.Router, service *RBACService) {
	// Create a subrouter for RBAC endpoints with rate limiting
	rbacRouter := r.PathPrefix("/api/rbac").Subrouter()

	// Apply rate limiting first (100 requests per minute per IP)
	rbacRouter.Use(RateLimitMiddleware(100, time.Minute))

	// Role routes with specific permissions
	rbacRouter.HandleFunc("/roles", withAuth("create_role", service, CreateRoleHandler(service))).Methods("POST")
	rbacRouter.HandleFunc("/roles", withAuth("read_role", service, GetRolesHandler(service))).Methods("GET")
	rbacRouter.HandleFunc("/roles/{id}", withAuth("update_role", service, UpdateRoleHandler(service))).Methods("PUT")
	rbacRouter.HandleFunc("/roles/{id}", withAuth("delete_role", service, DeleteRoleHandler(service))).Methods("DELETE")

	// Role group routes with specific permissions
	rbacRouter.HandleFunc("/groups", withAuth("create_group", service, CreateRoleGroupHandler(service))).Methods("POST")
	rbacRouter.HandleFunc("/groups", withAuth("read_group", service, GetRoleGroupsHandler(service))).Methods("GET")
	rbacRouter.HandleFunc("/groups/{id}", withAuth("read_group", service, GetRoleGroupHandler(service))).Methods("GET")
	rbacRouter.HandleFunc("/groups/{id}", withAuth("update_group", service, UpdateRoleGroupHandler(service))).Methods("PUT")
	rbacRouter.HandleFunc("/groups/{id}", withAuth("delete_group", service, DeleteRoleGroupHandler(service))).Methods("DELETE")

	// User-Group relationship routes
	rbacRouter.HandleFunc("/groups/{id}/assign-user", withAuth("manage_group_membership", service, AssignUserToGroupHandler(service))).Methods("PUT")
	rbacRouter.HandleFunc("/groups/{id}/users/{userId}", withAuth("manage_group_membership", service, RemoveUserFromGroupHandler(service))).Methods("DELETE")
	rbacRouter.HandleFunc("/groups/{id}/users", withAuth("read_group", service, GetGroupUsersHandler(service))).Methods("GET")

	// Role-Group relationship routes
	rbacRouter.HandleFunc("/groups/{id}/roles", withAuth("manage_group_roles", service, AssignRolesToGroupHandler(service))).Methods("POST")
	rbacRouter.HandleFunc("/groups/{id}/roles", withAuth("read_group", service, GetGroupRolesHandler(service))).Methods("GET")

	// User routes
	rbacRouter.HandleFunc("/users/{id}/groups", withAuth("read_user", service, GetUserGroupsHandler(service))).Methods("GET")
	rbacRouter.HandleFunc("/users/{id}/permissions", withAuth("read_user", service, GetUserPermissionsHandler(service))).Methods("GET")

	// Permission routes
	rbacRouter.HandleFunc("/permissions", withAuth("read_permission", service, GetPermissionsHandler(service))).Methods("GET")
}
