package rbac

import (
	"database/sql"
	"time"

	"github.com/go-playground/validator/v10"
)

// Role represents a role in the system
type Role struct {
	ID          string    `json:"id" db:"id"`
	Name        string    `json:"name" db:"name" validate:"required,min=2,max=50"`
	Description string    `json:"description" db:"description"`
	CreatedAt   time.Time `json:"created_at" db:"created_at"`
}

// Permission represents a permission that can be assigned to roles
type Permission struct {
	ID       string `json:"id" db:"id"`
	Name     string `json:"name" db:"name" validate:"required,min=2,max=100"`
	Resource string `json:"resource" db:"resource" validate:"required"`
	Action   string `json:"action" db:"action" validate:"required"`
}

// RoleGroup represents a group of roles for easier user assignment
type RoleGroup struct {
	ID          string    `json:"id" db:"id"`
	Name        string    `json:"name" db:"name" validate:"required,min=2,max=50"`
	Description string    `json:"description" db:"description"`
	CreatedAt   time.Time `json:"created_at" db:"created_at"`
}

// UserGroupMembership represents the assignment of users to role groups
type UserGroupMembership struct {
	UserID     string    `json:"user_id" db:"user_id"`
	GroupID    string    `json:"group_id" db:"group_id"`
	AssignedAt time.Time `json:"assigned_at" db:"assigned_at"`
}

// RolePermission represents the many-to-many relationship between roles and permissions
type RolePermission struct {
	RoleID       string `json:"role_id" db:"role_id"`
	PermissionID string `json:"permission_id" db:"permission_id"`
}

// GroupRole represents the many-to-many relationship between role groups and roles
type GroupRole struct {
	GroupID string `json:"group_id" db:"group_id"`
	RoleID  string `json:"role_id" db:"role_id"`
}

// CreateRoleRequest represents the request to create a new role
type CreateRoleRequest struct {
	Name        string `json:"name" validate:"required,min=2,max=50"`
	Description string `json:"description"`
}

// UpdateRoleRequest represents the request to update an existing role
type UpdateRoleRequest struct {
	Name        string `json:"name" validate:"required,min=2,max=50"`
	Description string `json:"description"`
}

// CreateRoleGroupRequest represents the request to create a new role group
type CreateRoleGroupRequest struct {
	Name        string `json:"name" validate:"required,min=2,max=50"`
	Description string `json:"description"`
}

// UpdateRoleGroupRequest represents the request to update an existing role group
type UpdateRoleGroupRequest struct {
	Name        string `json:"name" validate:"required,min=2,max=50"`
	Description string `json:"description"`
}

// AssignUserToGroupRequest represents the request to assign a user to a role group
type AssignUserToGroupRequest struct {
	UserID string `json:"user_id" validate:"required"`
}

// AssignPermissionsToRoleRequest represents the request to assign permissions to a role
type AssignPermissionsToRoleRequest struct {
	PermissionIDs []string `json:"permission_ids" validate:"required,min=1"`
}

// AssignRolesToGroupRequest represents the request to assign roles to a group
type AssignRolesToGroupRequest struct {
	RoleIDs []string `json:"role_ids" validate:"required,min=1"`
}

// UserPermissions represents the permissions a user has through their role groups
type UserPermissions struct {
	UserID      string       `json:"user_id"`
	Permissions []Permission `json:"permissions"`
	Roles       []Role       `json:"roles"`
	Groups      []RoleGroup  `json:"groups"`
}

// ValidationError represents a validation error
type ValidationError struct {
	Field   string
	Message string
}

func (e *ValidationError) Error() string {
	return e.Field + ": " + e.Message
}

var validate *validator.Validate

func init() {
	validate = validator.New()
}

// RoleRepository interface defines methods for role data access
type RoleRepository interface {
	Create(role *Role) error
	GetByID(id string) (*Role, error)
	GetByName(name string) (*Role, error)
	List() ([]*Role, error)
	Update(role *Role) error
	Delete(id string) error
}

// PermissionRepository interface defines methods for permission data access
type PermissionRepository interface {
	Create(permission *Permission) error
	GetByID(id string) (*Permission, error)
	List() ([]*Permission, error)
	GetByRoleID(roleID string) ([]*Permission, error)
}

// RoleGroupRepository interface defines methods for role group data access
type RoleGroupRepository interface {
	Create(group *RoleGroup) error
	GetByID(id string) (*RoleGroup, error)
	GetByName(name string) (*RoleGroup, error)
	List() ([]*RoleGroup, error)
	Update(group *RoleGroup) error
	Delete(id string) error
}

// UserGroupMembershipRepository interface defines methods for user-group membership data access
type UserGroupMembershipRepository interface {
	Create(membership *UserGroupMembership) error
	Delete(userID, groupID string) error
	GetUserGroups(userID string) ([]*RoleGroup, error)
	GetGroupUsers(groupID string) ([]string, error) // Returns user IDs
	IsUserInGroup(userID, groupID string) (bool, error)
}

// RolePermissionRepository interface defines methods for role-permission relationships
type RolePermissionRepository interface {
	AssignPermissionsToRole(roleID string, permissionIDs []string) error
	RemovePermissionsFromRole(roleID string, permissionIDs []string) error
	GetRolePermissions(roleID string) ([]*Permission, error)
	ClearRolePermissions(roleID string) error
}

// GroupRoleRepository interface defines methods for group-role relationships
type GroupRoleRepository interface {
	AssignRolesToGroup(groupID string, roleIDs []string) error
	RemoveRolesFromGroup(groupID string, roleIDs []string) error
	GetGroupRoles(groupID string) ([]*Role, error)
	ClearGroupRoles(groupID string) error
}

// RBACRepository combines all repository interfaces
type RBACRepository struct {
	RoleRepo       RoleRepository
	PermissionRepo PermissionRepository
	GroupRepo      RoleGroupRepository
	MembershipRepo UserGroupMembershipRepository
	RolePermRepo   RolePermissionRepository
	GroupRoleRepo  GroupRoleRepository
}

// NewRBACRepository creates a new RBAC repository
func NewRBACRepository(db *sql.DB) *RBACRepository {
	return &RBACRepository{
		RoleRepo:       NewRoleRepository(db),
		PermissionRepo: NewPermissionRepository(db),
		GroupRepo:      NewRoleGroupRepository(db),
		MembershipRepo: NewUserGroupMembershipRepository(db),
		RolePermRepo:   NewRolePermissionRepository(db),
		GroupRoleRepo:  NewGroupRoleRepository(db),
	}
}

// roleRepository implements RoleRepository
type roleRepository struct {
	db *sql.DB
}

func NewRoleRepository(db *sql.DB) RoleRepository {
	return &roleRepository{db: db}
}

func (r *roleRepository) Create(role *Role) error {
	query := `INSERT INTO roles (id, name, description, created_at)
	          VALUES ($1, $2, $3, $4)`
	_, err := r.db.Exec(query, role.ID, role.Name, role.Description, role.CreatedAt)
	return err
}

func (r *roleRepository) GetByID(id string) (*Role, error) {
	role := &Role{}
	query := `SELECT id, name, description, created_at FROM roles WHERE id = $1`
	err := r.db.QueryRow(query, id).Scan(&role.ID, &role.Name, &role.Description, &role.CreatedAt)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	return role, err
}

func (r *roleRepository) GetByName(name string) (*Role, error) {
	role := &Role{}
	query := `SELECT id, name, description, created_at FROM roles WHERE name = $1`
	err := r.db.QueryRow(query, name).Scan(&role.ID, &role.Name, &role.Description, &role.CreatedAt)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	return role, err
}

func (r *roleRepository) List() ([]*Role, error) {
	query := `SELECT id, name, description, created_at FROM roles ORDER BY name`
	rows, err := r.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var roles []*Role
	for rows.Next() {
		role := &Role{}
		err := rows.Scan(&role.ID, &role.Name, &role.Description, &role.CreatedAt)
		if err != nil {
			return nil, err
		}
		roles = append(roles, role)
	}
	return roles, nil
}

func (r *roleRepository) Update(role *Role) error {
	query := `UPDATE roles SET name = $2, description = $3 WHERE id = $1`
	_, err := r.db.Exec(query, role.ID, role.Name, role.Description)
	return err
}

func (r *roleRepository) Delete(id string) error {
	query := `DELETE FROM roles WHERE id = $1`
	_, err := r.db.Exec(query, id)
	return err
}

func (r *roleRepository) DeleteWithTransaction(tx *sql.Tx, id string) error {
	query := `DELETE FROM roles WHERE id = $1`
	_, err := tx.Exec(query, id)
	return err
}

// permissionRepository implements PermissionRepository
type permissionRepository struct {
	db *sql.DB
}

func NewPermissionRepository(db *sql.DB) PermissionRepository {
	return &permissionRepository{db: db}
}

func (r *permissionRepository) Create(permission *Permission) error {
	query := `INSERT INTO permissions (id, name, resource, action) VALUES ($1, $2, $3, $4)`
	_, err := r.db.Exec(query, permission.ID, permission.Name, permission.Resource, permission.Action)
	return err
}

func (r *permissionRepository) GetByID(id string) (*Permission, error) {
	permission := &Permission{}
	query := `SELECT id, name, resource, action FROM permissions WHERE id = $1`
	err := r.db.QueryRow(query, id).Scan(&permission.ID, &permission.Name, &permission.Resource, &permission.Action)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	return permission, err
}

func (r *permissionRepository) List() ([]*Permission, error) {
	query := `SELECT id, name, resource, action FROM permissions ORDER BY resource, action`
	rows, err := r.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var permissions []*Permission
	for rows.Next() {
		permission := &Permission{}
		err := rows.Scan(&permission.ID, &permission.Name, &permission.Resource, &permission.Action)
		if err != nil {
			return nil, err
		}
		permissions = append(permissions, permission)
	}
	return permissions, nil
}

func (r *permissionRepository) GetByRoleID(roleID string) ([]*Permission, error) {
	query := `SELECT p.id, p.name, p.resource, p.action
	          FROM permissions p
	          JOIN role_permissions rp ON p.id = rp.permission_id
	          WHERE rp.role_id = $1
	          ORDER BY p.resource, p.action`
	rows, err := r.db.Query(query, roleID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var permissions []*Permission
	for rows.Next() {
		permission := &Permission{}
		err := rows.Scan(&permission.ID, &permission.Name, &permission.Resource, &permission.Action)
		if err != nil {
			return nil, err
		}
		permissions = append(permissions, permission)
	}
	return permissions, nil
}

// roleGroupRepository implements RoleGroupRepository
type roleGroupRepository struct {
	db *sql.DB
}

func NewRoleGroupRepository(db *sql.DB) RoleGroupRepository {
	return &roleGroupRepository{db: db}
}

func (r *roleGroupRepository) Create(group *RoleGroup) error {
	query := `INSERT INTO role_groups (id, name, description, created_at)
	          VALUES ($1, $2, $3, $4)`
	_, err := r.db.Exec(query, group.ID, group.Name, group.Description, group.CreatedAt)
	return err
}

func (r *roleGroupRepository) GetByID(id string) (*RoleGroup, error) {
	group := &RoleGroup{}
	query := `SELECT id, name, description, created_at FROM role_groups WHERE id = $1`
	err := r.db.QueryRow(query, id).Scan(&group.ID, &group.Name, &group.Description, &group.CreatedAt)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	return group, err
}

func (r *roleGroupRepository) GetByName(name string) (*RoleGroup, error) {
	group := &RoleGroup{}
	query := `SELECT id, name, description, created_at FROM role_groups WHERE name = $1`
	err := r.db.QueryRow(query, name).Scan(&group.ID, &group.Name, &group.Description, &group.CreatedAt)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	return group, err
}

func (r *roleGroupRepository) List() ([]*RoleGroup, error) {
	query := `SELECT id, name, description, created_at FROM role_groups ORDER BY name`
	rows, err := r.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var groups []*RoleGroup
	for rows.Next() {
		group := &RoleGroup{}
		err := rows.Scan(&group.ID, &group.Name, &group.Description, &group.CreatedAt)
		if err != nil {
			return nil, err
		}
		groups = append(groups, group)
	}
	return groups, nil
}

func (r *roleGroupRepository) Update(group *RoleGroup) error {
	query := `UPDATE role_groups SET name = $2, description = $3 WHERE id = $1`
	_, err := r.db.Exec(query, group.ID, group.Name, group.Description)
	return err
}

func (r *roleGroupRepository) Delete(id string) error {
	query := `DELETE FROM role_groups WHERE id = $1`
	_, err := r.db.Exec(query, id)
	return err
}

func (r *roleGroupRepository) DeleteWithTransaction(tx *sql.Tx, id string) error {
	query := `DELETE FROM role_groups WHERE id = $1`
	_, err := tx.Exec(query, id)
	return err
}

// userGroupMembershipRepository implements UserGroupMembershipRepository
type userGroupMembershipRepository struct {
	db *sql.DB
}

func NewUserGroupMembershipRepository(db *sql.DB) UserGroupMembershipRepository {
	return &userGroupMembershipRepository{db: db}
}

func (r *userGroupMembershipRepository) Create(membership *UserGroupMembership) error {
	query := `INSERT INTO user_group_memberships (user_id, group_id, assigned_at)
	          VALUES ($1, $2, $3)`
	_, err := r.db.Exec(query, membership.UserID, membership.GroupID, membership.AssignedAt)
	return err
}

func (r *userGroupMembershipRepository) Delete(userID, groupID string) error {
	query := `DELETE FROM user_group_memberships WHERE user_id = $1 AND group_id = $2`
	_, err := r.db.Exec(query, userID, groupID)
	return err
}

func (r *userGroupMembershipRepository) GetUserGroups(userID string) ([]*RoleGroup, error) {
	query := `SELECT g.id, g.name, g.description, g.created_at
	          FROM role_groups g
	          JOIN user_group_memberships ugm ON g.id = ugm.group_id
	          WHERE ugm.user_id = $1
	          ORDER BY g.name`
	rows, err := r.db.Query(query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var groups []*RoleGroup
	for rows.Next() {
		group := &RoleGroup{}
		err := rows.Scan(&group.ID, &group.Name, &group.Description, &group.CreatedAt)
		if err != nil {
			return nil, err
		}
		groups = append(groups, group)
	}
	return groups, nil
}

func (r *userGroupMembershipRepository) GetGroupUsers(groupID string) ([]string, error) {
	query := `SELECT user_id FROM user_group_memberships WHERE group_id = $1`
	rows, err := r.db.Query(query, groupID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var userIDs []string
	for rows.Next() {
		var userID string
		err := rows.Scan(&userID)
		if err != nil {
			return nil, err
		}
		userIDs = append(userIDs, userID)
	}
	return userIDs, nil
}

func (r *userGroupMembershipRepository) IsUserInGroup(userID, groupID string) (bool, error) {
	var count int
	query := `SELECT COUNT(*) FROM user_group_memberships WHERE user_id = $1 AND group_id = $2`
	err := r.db.QueryRow(query, userID, groupID).Scan(&count)
	return count > 0, err
}

func (r *userGroupMembershipRepository) ClearGroupMembershipsWithTransaction(tx *sql.Tx, groupID string) error {
	query := `DELETE FROM user_group_memberships WHERE group_id = $1`
	_, err := tx.Exec(query, groupID)
	return err
}

// rolePermissionRepository implements RolePermissionRepository
type rolePermissionRepository struct {
	db *sql.DB
}

func NewRolePermissionRepository(db *sql.DB) RolePermissionRepository {
	return &rolePermissionRepository{db: db}
}

func (r *rolePermissionRepository) AssignPermissionsToRole(roleID string, permissionIDs []string) error {
	tx, err := r.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	for _, permissionID := range permissionIDs {
		query := `INSERT INTO role_permissions (role_id, permission_id)
		          VALUES ($1, $2) ON CONFLICT DO NOTHING`
		_, err = tx.Exec(query, roleID, permissionID)
		if err != nil {
			return err
		}
	}

	return tx.Commit()
}

func (r *rolePermissionRepository) RemovePermissionsFromRole(roleID string, permissionIDs []string) error {
	tx, err := r.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	for _, permissionID := range permissionIDs {
		query := `DELETE FROM role_permissions WHERE role_id = $1 AND permission_id = $2`
		_, err = tx.Exec(query, roleID, permissionID)
		if err != nil {
			return err
		}
	}

	return tx.Commit()
}

func (r *rolePermissionRepository) GetRolePermissions(roleID string) ([]*Permission, error) {
	query := `SELECT p.id, p.name, p.resource, p.action
	          FROM permissions p
	          JOIN role_permissions rp ON p.id = rp.permission_id
	          WHERE rp.role_id = $1
	          ORDER BY p.resource, p.action`
	rows, err := r.db.Query(query, roleID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var permissions []*Permission
	for rows.Next() {
		permission := &Permission{}
		err := rows.Scan(&permission.ID, &permission.Name, &permission.Resource, &permission.Action)
		if err != nil {
			return nil, err
		}
		permissions = append(permissions, permission)
	}
	return permissions, nil
}

func (r *rolePermissionRepository) ClearRolePermissions(roleID string) error {
	query := `DELETE FROM role_permissions WHERE role_id = $1`
	_, err := r.db.Exec(query, roleID)
	return err
}

func (r *rolePermissionRepository) ClearRolePermissionsWithTransaction(tx *sql.Tx, roleID string) error {
	query := `DELETE FROM role_permissions WHERE role_id = $1`
	_, err := tx.Exec(query, roleID)
	return err
}

// groupRoleRepository implements GroupRoleRepository
type groupRoleRepository struct {
	db *sql.DB
}

func NewGroupRoleRepository(db *sql.DB) GroupRoleRepository {
	return &groupRoleRepository{db: db}
}

func (r *groupRoleRepository) AssignRolesToGroup(groupID string, roleIDs []string) error {
	tx, err := r.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	for _, roleID := range roleIDs {
		query := `INSERT INTO group_roles (group_id, role_id)
		          VALUES ($1, $2) ON CONFLICT DO NOTHING`
		_, err = tx.Exec(query, groupID, roleID)
		if err != nil {
			return err
		}
	}

	return tx.Commit()
}

func (r *groupRoleRepository) RemoveRolesFromGroup(groupID string, roleIDs []string) error {
	tx, err := r.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	for _, roleID := range roleIDs {
		query := `DELETE FROM group_roles WHERE group_id = $1 AND role_id = $2`
		_, err = tx.Exec(query, groupID, roleID)
		if err != nil {
			return err
		}
	}

	return tx.Commit()
}

func (r *groupRoleRepository) GetGroupRoles(groupID string) ([]*Role, error) {
	query := `SELECT r.id, r.name, r.description, r.created_at
	          FROM roles r
	          JOIN group_roles gr ON r.id = gr.role_id
	          WHERE gr.group_id = $1
	          ORDER BY r.name`
	rows, err := r.db.Query(query, groupID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var roles []*Role
	for rows.Next() {
		role := &Role{}
		err := rows.Scan(&role.ID, &role.Name, &role.Description, &role.CreatedAt)
		if err != nil {
			return nil, err
		}
		roles = append(roles, role)
	}
	return roles, nil
}

func (r *groupRoleRepository) ClearGroupRoles(groupID string) error {
	query := `DELETE FROM group_roles WHERE group_id = $1`
	_, err := r.db.Exec(query, groupID)
	return err
}

func (r *groupRoleRepository) ClearGroupRolesWithTransaction(tx *sql.Tx, groupID string) error {
	query := `DELETE FROM group_roles WHERE group_id = $1`
	_, err := tx.Exec(query, groupID)
	return err
}

func (r *groupRoleRepository) RemoveRoleFromAllGroupsWithTransaction(tx *sql.Tx, roleID string) error {
	query := `DELETE FROM group_roles WHERE role_id = $1`
	_, err := tx.Exec(query, roleID)
	return err
}
