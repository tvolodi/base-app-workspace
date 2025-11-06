import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import { validateEnvironment, logEnvironmentInfo, checkConfigurationIssues } from './config/validateEnv';

// Validate environment variables before app starts
try {
  validateEnvironment();
  logEnvironmentInfo();
  checkConfigurationIssues();
} catch (error) {
  console.error('Application cannot start due to configuration errors:', error);
  document.getElementById('root').innerHTML = `
    <div style="
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      font-family: system-ui, -apple-system, sans-serif;
      background: #f3f4f6;
    ">
      <div style="
        background: white;
        padding: 2rem;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        max-width: 600px;
      ">
        <h1 style="color: #dc2626; margin-top: 0;">⚠️ Configuration Error</h1>
        <p style="color: #374151;">The application cannot start due to missing environment configuration.</p>
        <p style="color: #374151;">Please ensure all required environment variables are set in your <code>.env</code> file.</p>
        <pre style="
          background: #f3f4f6;
          padding: 1rem;
          border-radius: 4px;
          overflow-x: auto;
          color: #dc2626;
        ">${error.message}</pre>
        <p style="color: #6b7280; font-size: 0.875rem;">
          See <code>.env.example</code> for required configuration.
        </p>
      </div>
    </div>
  `;
  throw error;
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);