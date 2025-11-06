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

export const AuthProvider = ({ children }) => {
  const [keycloak, setKeycloak] = useState(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      const initKeycloak = async () => {
        console.log('Initializing Keycloak...');
        const keycloakInstance = new Keycloak('/keycloak.json');
        try {
          const authenticated = await keycloakInstance.init({
            onLoad: 'check-sso',
            silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
            checkLoginIframe: false,
          });
          console.log('Keycloak initialized, authenticated:', authenticated);
          setKeycloak(keycloakInstance);
          setAuthenticated(authenticated);
          if (authenticated) {
            console.log('User authenticated, setting user info');
            setUser({
              name: keycloakInstance.tokenParsed?.name,
              email: keycloakInstance.tokenParsed?.email,
              preferred_username: keycloakInstance.tokenParsed?.preferred_username,
            });
          }
          console.log('Setting loading to false');
        } catch (error) {
          console.error('Keycloak initialization failed', error);
        } finally {
          setLoading(false);
        }
      };

      initKeycloak();
    }
  }, []);

  const login = () => {
    console.log('Login called, redirecting to Keycloak');
    if (keycloak) {
      keycloak.login({ redirectUri: window.location.origin + '/profile' });
    }
  };

  const register = () => {
    console.log('Register called, redirecting to Keycloak');
    if (keycloak) {
      keycloak.register({ redirectUri: window.location.origin + '/profile' });
    }
  };

  const logout = () => {
    console.log('Logout called');
    if (keycloak) {
      keycloak.logout();
    }
  };

  const value = {
    keycloak,
    authenticated,
    user,
    loading,
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