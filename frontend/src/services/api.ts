import axios from 'axios';
import { toast } from 'react-toastify';

// Create axios instance with default config
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8090',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Store keycloak instance reference
let keycloakInstance = null;

/**
 * Set the Keycloak instance for token management
 * Should be called from AuthContext after Keycloak initialization
 */
export const setKeycloakInstance = (keycloak) => {
  keycloakInstance = keycloak;
};

/**
 * Get the current Keycloak instance
 */
export const getKeycloakInstance = () => keycloakInstance;

// Request interceptor - attach JWT token
api.interceptors.request.use(
  async (config) => {
    // Attach Keycloak token if available
    if (keycloakInstance && keycloakInstance.token) {
      try {
        // Refresh token if it expires within 30 seconds
        await keycloakInstance.updateToken(30);
        config.headers.Authorization = `Bearer ${keycloakInstance.token}`;
      } catch (error) {
        console.error('Failed to refresh token:', error);
        // Token refresh failed, user needs to re-authenticate
        keycloakInstance.login();
        return Promise.reject(error);
      }
    }

    // Attach CSRF token if available
    const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content;
    if (csrfToken) {
      config.headers['X-CSRF-Token'] = csrfToken;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors globally
api.interceptors.response.use(
  (response) => {
    // Successfully received response
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle network errors
    if (!error.response) {
      toast.error('Network error. Please check your connection.');
      return Promise.reject(error);
    }

    const { status } = error.response;

    // Handle different error status codes
    switch (status) {
      case 401:
        // Unauthorized - token expired or invalid
        if (!originalRequest._retry && keycloakInstance) {
          originalRequest._retry = true;
          try {
            // Try to refresh the token
            await keycloakInstance.updateToken(-1); // Force refresh
            originalRequest.headers.Authorization = `Bearer ${keycloakInstance.token}`;
            return api(originalRequest);
          } catch (refreshError) {
            // Refresh failed, redirect to login
            toast.error('Session expired. Please login again.');
            keycloakInstance.login();
            return Promise.reject(refreshError);
          }
        }
        break;

      case 403:
        // Forbidden - user doesn't have permission
        toast.error('You do not have permission to perform this action.');
        break;

      case 404:
        // Not found
        toast.error('The requested resource was not found.');
        break;

      case 409:
        // Conflict - e.g., duplicate user
        toast.error(error.response.data?.message || 'A conflict occurred.');
        break;

      case 422:
        // Validation error
        const validationMessage = error.response.data?.message || 'Validation failed.';
        toast.error(validationMessage);
        break;

      case 429:
        // Too many requests
        toast.error('Too many requests. Please try again later.');
        break;

      case 500:
      case 502:
      case 503:
      case 504:
        // Server errors
        toast.error('Server error. Please try again later.');
        break;

      default:
        // Generic error
        const errorMessage = error.response.data?.message || 'An error occurred.';
        toast.error(errorMessage);
    }

    return Promise.reject(error);
  }
);

/**
 * API service methods for common operations
 */
export const apiService = {
  // User management
  users: {
    getAll: (params) => api.get('/api/users', { params }),
    getById: (id) => api.get(`/api/users/${id}`),
    create: (data) => api.post('/api/users', data),
    update: (id, data) => api.put(`/api/users/${id}`, data),
    delete: (id) => api.delete(`/api/users/${id}`),
  },

  // Dashboard
  dashboard: {
    getMetrics: () => api.get('/api/dashboard/metrics'),
    getActivities: (params) => api.get('/api/dashboard/activities', { params }),
    getStats: () => api.get('/api/dashboard/stats'),
  },

  // Profile
  profile: {
    get: () => api.get('/api/profile'),
    update: (data) => api.put('/api/profile', data),
    uploadAvatar: (file) => {
      const formData = new FormData();
      formData.append('avatar', file);
      return api.post('/api/profile/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
  },

  // Groups
  groups: {
    getAll: () => api.get('/api/groups'),
    getById: (id) => api.get(`/api/groups/${id}`),
    create: (data) => api.post('/api/groups', data),
    update: (id, data) => api.put(`/api/groups/${id}`, data),
    delete: (id) => api.delete(`/api/groups/${id}`),
  },

  // Roles
  roles: {
    getAll: () => api.get('/api/roles'),
    assign: (userId, roleId) => api.post(`/api/users/${userId}/roles/${roleId}`),
    revoke: (userId, roleId) => api.delete(`/api/users/${userId}/roles/${roleId}`),
  },
};

export default api;
