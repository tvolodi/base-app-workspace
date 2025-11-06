/**
 * Environment variable validation utility
 * Ensures all required environment variables are set before app starts
 */

const requiredEnvVars = [
  'REACT_APP_KEYCLOAK_URL',
  'REACT_APP_KEYCLOAK_REALM',
  'REACT_APP_KEYCLOAK_CLIENT_ID',
];

const optionalEnvVars = [
  'REACT_APP_API_URL',
  'NODE_ENV',
];

/**
 * Validate that all required environment variables are set
 * @throws {Error} If any required environment variable is missing
 */
export const validateEnvironment = () => {
  const missing = requiredEnvVars.filter(
    (varName) => !process.env[varName]
  );

  if (missing.length > 0) {
    const errorMessage = `
╔════════════════════════════════════════════════════════════════╗
║                 ENVIRONMENT CONFIGURATION ERROR                 ║
╠════════════════════════════════════════════════════════════════╣
║                                                                 ║
║  Missing required environment variables:                        ║
║                                                                 ║
${missing.map(v => `║  ❌ ${v.padEnd(58)} ║`).join('\n')}
║                                                                 ║
║  Please check your .env file and ensure all required            ║
║  variables are set. See .env.example for reference.             ║
║                                                                 ║
╚════════════════════════════════════════════════════════════════╝
    `.trim();

    console.error(errorMessage);
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
};

/**
 * Get environment configuration with fallbacks
 */
export const getEnvConfig = () => {
  return {
    // Keycloak configuration
    keycloak: {
      url: process.env.REACT_APP_KEYCLOAK_URL,
      realm: process.env.REACT_APP_KEYCLOAK_REALM,
      clientId: process.env.REACT_APP_KEYCLOAK_CLIENT_ID,
    },
    
    // API configuration
    api: {
      url: process.env.REACT_APP_API_URL || 'http://localhost:8090',
    },
    
    // Environment info
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production',
    isTest: process.env.NODE_ENV === 'test',
  };
};

/**
 * Log environment configuration (without sensitive data)
 */
export const logEnvironmentInfo = () => {
  if (process.env.NODE_ENV === 'development') {
    const config = getEnvConfig();
    
    console.log('%c Environment Configuration ', 'background: #4f46e5; color: white; padding: 4px 8px; border-radius: 4px;');
    console.log('├─ Node Environment:', process.env.NODE_ENV);
    console.log('├─ Keycloak URL:', config.keycloak.url);
    console.log('├─ Keycloak Realm:', config.keycloak.realm);
    console.log('├─ Keycloak Client:', config.keycloak.clientId);
    console.log('└─ API URL:', config.api.url);
  }
};

/**
 * Check for common configuration issues
 */
export const checkConfigurationIssues = () => {
  const warnings = [];
  
  // Check if using default/localhost URLs in production
  if (process.env.NODE_ENV === 'production') {
    if (process.env.REACT_APP_KEYCLOAK_URL?.includes('localhost')) {
      warnings.push('⚠️  Keycloak URL points to localhost in production');
    }
    if (process.env.REACT_APP_API_URL?.includes('localhost')) {
      warnings.push('⚠️  API URL points to localhost in production');
    }
  }
  
  // Check for HTTP in production
  if (process.env.NODE_ENV === 'production') {
    if (process.env.REACT_APP_KEYCLOAK_URL?.startsWith('http://')) {
      warnings.push('⚠️  Keycloak URL uses HTTP instead of HTTPS in production');
    }
    if (process.env.REACT_APP_API_URL?.startsWith('http://')) {
      warnings.push('⚠️  API URL uses HTTP instead of HTTPS in production');
    }
  }
  
  // Check for test realm in production
  if (process.env.NODE_ENV === 'production') {
    if (process.env.REACT_APP_KEYCLOAK_REALM?.toLowerCase().includes('test')) {
      warnings.push('⚠️  Using test realm in production environment');
    }
  }
  
  if (warnings.length > 0) {
    console.warn('\n⚠️  Configuration Warnings:\n' + warnings.join('\n'));
  }
  
  return warnings;
};

export default validateEnvironment;
