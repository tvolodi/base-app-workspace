import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
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
  url: 'http://localhost:8080',
  realm: 'base-app',
  clientId: 'base-app-frontend',
};

export const AuthProvider = ({ children }) => {
  const [keycloak, setKeycloak] = useState(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [error, setError] = useState(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      const initKeycloak = async () => {
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
              keycloakInstance.updateToken(70).catch(() => {
                // Token refresh failed, logout
                logout();
              });
            };
          }
        } catch (error) {
          setError('Failed to initialize authentication. Please try again.');
        } finally {
          setLoading(false);
        }
      };

      initKeycloak();
    }
  }, []);

  const login = async () => {
    if (!keycloak) return;
    setLoginLoading(true);
    setError(null);
    try {
      await keycloak.login({ redirectUri: window.location.origin + '/profile' });
    } catch (err) {
      setError('Login failed. Please try again.');
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
    } catch (err) {
      setError('Registration failed. Please try again.');
    } finally {
      setRegisterLoading(false);
    }
  };

  const logout = () => {
    if (keycloak) {
      keycloak.logout();
    }
    setAuthenticated(false);
    setUser(null);
    setError(null);
  };

  const value = {
    keycloak,
    authenticated,
    user,
    loading,
    loginLoading,
    registerLoading,
    error,
    login,
    register,
    logout,
    isAuthenticated: authenticated,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};