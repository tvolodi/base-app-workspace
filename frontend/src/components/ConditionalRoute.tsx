import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ProgressSpinner } from 'primereact/progressspinner';

/**
 * Conditional Route Component
 * Handles both protected (authenticated) and public (non-authenticated) routes
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components to render
 * @param {boolean} props.requireAuth - If true, requires authentication; if false, redirects authenticated users
 * @param {string} props.redirectTo - Where to redirect if condition not met
 * @param {Array<string>} props.allowedRoles - Optional: Array of roles allowed to access this route
 */
const ConditionalRoute = ({ 
  children, 
  requireAuth = true,
  redirectTo = null,
  allowedRoles = null 
}) => {
  const { authenticated, loading, user } = useAuth();
  const location = useLocation();

  // Show loading spinner while authentication status is being determined
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'var(--surface-ground)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <ProgressSpinner 
            style={{ width: '50px', height: '50px' }}
            strokeWidth="4"
            animationDuration="1s"
          />
          <p style={{ marginTop: '1rem', color: 'var(--text-color-secondary)' }}>
            Loading...
          </p>
        </div>
      </div>
    );
  }

  // Handle protected routes (requireAuth = true)
  if (requireAuth) {
    if (!authenticated) {
      // Not authenticated, redirect to login with return URL
      const loginUrl = redirectTo || '/login';
      const returnUrl = `${loginUrl}?redirect=${encodeURIComponent(location.pathname + location.search)}`;
      return <Navigate to={returnUrl} replace />;
    }

    // Check role-based access if roles are specified
    if (allowedRoles && allowedRoles.length > 0) {
      const userRoles = user?.roles || user?.realmRoles || [];
      const hasRequiredRole = allowedRoles.some(role => 
        userRoles.includes(role)
      );

      if (!hasRequiredRole) {
        // User doesn't have required role, redirect to unauthorized page
        return <Navigate to="/unauthorized" replace />;
      }
    }

    // Authenticated and authorized, render children
    return <>{children}</>;
  }

  // Handle public routes (requireAuth = false)
  if (!requireAuth && authenticated) {
    // Already authenticated, redirect to default authenticated page
    return <Navigate to={redirectTo || '/profile'} replace />;
  }

  // Not authenticated, render public page
  return <>{children}</>;
};

/**
 * Shorthand component for protected routes
 * Usage: <ProtectedRoute><Component /></ProtectedRoute>
 */
export const ProtectedRoute = ({ children, allowedRoles = null }) => (
  <ConditionalRoute requireAuth={true} allowedRoles={allowedRoles}>
    {children}
  </ConditionalRoute>
);

/**
 * Shorthand component for public routes (redirects if authenticated)
 * Usage: <PublicRoute><Login /></PublicRoute>
 */
export const PublicRoute = ({ children, redirectTo = '/profile' }) => (
  <ConditionalRoute requireAuth={false} redirectTo={redirectTo}>
    {children}
  </ConditionalRoute>
);

/**
 * Role-based route component
 * Usage: <RoleRoute roles={['admin', 'moderator']}><AdminPanel /></RoleRoute>
 */
export const RoleRoute = ({ children, roles }) => (
  <ConditionalRoute requireAuth={true} allowedRoles={roles}>
    {children}
  </ConditionalRoute>
);

export default ConditionalRoute;
