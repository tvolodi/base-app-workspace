import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import Keycloak from 'keycloak-js';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const KEYCLOAK_CONFIG = {
  url: process.env.REACT_APP_KEYCLOAK_URL || 'http://localhost:8080',
  realm: process.env.REACT_APP_KEYCLOAK_REALM || 'base-app',
  clientId: process.env.REACT_APP_KEYCLOAK_CLIENT_ID || 'base-app-frontend',
};

export const AuthProvider = ({ children }) => {
  const [keycloak, setKeycloak] = useState(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sessionWarning, setSessionWarning] = useState(false);
  const [online, setOnline] = useState(navigator.onLine);

  const initialized = useRef(false);

  const logout = useCallback(() => {
    if (keycloak) {
      keycloak.logout();
      console.log('User logged out');
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
        
        const keycloakInstance = new Keycloak({
          url: KEYCLOAK_CONFIG.url,
          realm: KEYCLOAK_CONFIG.realm,
          clientId: KEYCLOAK_CONFIG.clientId,
        });
        try {
          const authenticated = await keycloakInstance.init({
            onLoad: 'check-sso',
            silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
            checkLoginIframe: false,
          });
          setKeycloak(keycloakInstance);
          setAuthenticated(authenticated);
          if (authenticated) {
            setUser({
              name: keycloakInstance.tokenParsed?.name,
              email: keycloakInstance.tokenParsed?.email,
              preferred_username: keycloakInstance.tokenParsed?.preferred_username,
            });
            // Set up token refresh
            keycloakInstance.onTokenExpired = () => {
              setSessionWarning(true);
              let retryCount = 0;
              const maxRetries = 3;
              
              const attemptRefresh = (attempt) => {
                keycloakInstance.updateToken(70).then(() => {
                  console.log('Token refreshed successfully');
                  setSessionWarning(false);
                  retryCount = 0;
                }).catch(() => {
                  if (attempt < maxRetries) {
                    const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
                    console.warn(`Token refresh failed, retrying in ${delay}ms`);
                    setTimeout(() => attemptRefresh(attempt + 1), delay);
                  } else {
                    console.error('Token refresh failed after retries, logging out');
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
          }
        } catch (err) {
          if (err.message.includes('Network') || err.message.includes('fetch')) {
            setError('Network error: Unable to connect to authentication server. Please check your internet connection and try again.');
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
      console.log('User initiated login');
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
      console.log('User initiated registration');
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

  const value = {
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
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};