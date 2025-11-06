import React, { createContext, useContext, useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Keycloak from 'keycloak-js';
import { logger } from '../utils/logger';
import { setKeycloakInstance } from '../services/api';

// Type definitions
interface User {
  id?: string;
  name?: string;
  email?: string;
  preferred_username?: string;
  [key: string]: any;
}

interface AuthContextType {
  keycloak: Keycloak.KeycloakInstance | null;
  authenticated: boolean;
  user: User | null;
  loading: boolean;
  loginLoading: boolean;
  registerLoading: boolean;
  error: string | null;
  sessionWarning: boolean;
  online: boolean;
  login: () => Promise<void>;
  register: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const KEYCLOAK_CONFIG = {
  url: process.env.REACT_APP_KEYCLOAK_URL || 'http://localhost:8081',
  realm: process.env.REACT_APP_KEYCLOAK_REALM || 'test-realm',
  clientId: process.env.REACT_APP_KEYCLOAK_CLIENT_ID || 'test-client',
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [keycloak, setKeycloak] = useState<Keycloak.KeycloakInstance | null>(null);
  const [authenticated, setAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [loginLoading, setLoginLoading] = useState<boolean>(false);
  const [registerLoading, setRegisterLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionWarning, setSessionWarning] = useState<boolean>(false);
  const [online, setOnline] = useState<boolean>(navigator.onLine);

  const initialized = useRef(false);

  const logout = useCallback(() => {
    if (keycloak) {
      keycloak.logout();
      logger.log('User logged out');
    }
    setAuthenticated(false);
    setUser(null);
    setError(null);
    setSessionWarning(false);
  }, [keycloak]);

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      const initKeycloak = async () => {
        if (!window.localStorage) {
          setError('Browser storage is disabled. Please enable it for authentication. To enable, go to browser settings > Privacy > Cookies and site data > Allow local data storage.');
          setLoading(false);
          return;
        }
        
        const keycloakInstance = Keycloak({
          url: KEYCLOAK_CONFIG.url,
          realm: KEYCLOAK_CONFIG.realm,
          clientId: KEYCLOAK_CONFIG.clientId,
        });
        try {
          logger.log('Initializing Keycloak...');
          
          // Add timeout to prevent hanging
          const initPromise = keycloakInstance.init({
            onLoad: undefined, // Disable automatic SSO check
            checkLoginIframe: false,
          });
          
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Keycloak initialization timeout')), 10000);
          });
          
          await Promise.race([initPromise, timeoutPromise]);
          
          // Manually check if user is authenticated
          const authenticated = keycloakInstance.authenticated || false;
          setKeycloak(keycloakInstance);
          
          // Set Keycloak instance in API service for token management
          setKeycloakInstance(keycloakInstance);
          
          setAuthenticated(authenticated);
          if (authenticated) {
            setUser({
              name: (keycloakInstance.tokenParsed as any)?.name,
              email: (keycloakInstance.tokenParsed as any)?.email,
              preferred_username: (keycloakInstance.tokenParsed as any)?.preferred_username,
            });
            // Set up token refresh
            keycloakInstance.onTokenExpired = () => {
              setSessionWarning(true);
              let retryCount = 0;
              const maxRetries = 3;
              
              const attemptRefresh = (attempt: number) => {
                keycloakInstance.updateToken(70).success((refreshed: boolean) => {
                  logger.log('Token refreshed successfully');
                  setSessionWarning(false);
                  retryCount = 0;
                }).error(() => {
                  if (attempt < maxRetries) {
                    const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
                    logger.warn(`Token refresh failed, retrying in ${delay}ms`);
                    setTimeout(() => attemptRefresh(attempt + 1), delay);
                  } else {
                    logger.error('Token refresh failed after retries, logging out');
                    logout();
                  }
                });
              };
              attemptRefresh(0);
            };
            // Handle auth refresh error
            keycloakInstance.onAuthRefreshError = () => {
              setSessionWarning(true);
              setTimeout(() => logout(), 5000); // Auto logout after 5 seconds
            };
          };
        } catch (err) {
          logger.error('Keycloak initialization error:', err);
          if (err.message.includes('Network') || err.message.includes('fetch')) {
            setError('Network error: Unable to connect to authentication server. Please check your internet connection and try again.');
          } else if (err.message.includes('timeout')) {
            setError('Authentication server is not responding. Please try again later.');
          } else {
            setError('Authentication initialization failed. Please try refreshing the page.');
          }
        } finally {
          setLoading(false);
        }
      };

      initKeycloak();
    }
  }, [logout]);

  const login = async () => {
    if (!keycloak) return;
    setLoginLoading(true);
    setError(null);
    try {
      await keycloak.login({ redirectUri: window.location.origin + '/profile' });
      logger.log('User initiated login');
    } catch (err) {
      if (err.message.includes('Network') || err.message.includes('fetch')) {
        setError('Network error: Please check your connection and try again.');
      } else {
        setError('Login failed. Please check your credentials.');
      }
    } finally {
      setLoginLoading(false);
    }
  };

  const register = async () => {
    if (!keycloak) return;
    setRegisterLoading(true);
    setError(null);
    try {
      await keycloak.register({ redirectUri: window.location.origin + '/profile' });
      logger.log('User initiated registration');
    } catch (err) {
      if (err.message.includes('Network') || err.message.includes('fetch')) {
        setError('Network error: Please check your connection and try again.');
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setRegisterLoading(false);
    }
  };

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    keycloak,
    authenticated,
    user,
    loading,
    loginLoading,
    registerLoading,
    error,
    sessionWarning,
    online,
    login,
    register,
    logout,
  }), [
    keycloak,
    authenticated,
    user,
    loading,
    loginLoading,
    registerLoading,
    error,
    sessionWarning,
    online,
    login,
    register,
    logout,
  ]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};