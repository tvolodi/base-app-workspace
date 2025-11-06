import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const { login, loading, loginLoading, error } = useAuth();

  const handleLogin = () => {
    login();
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="auth-form">
      <h2>Login</h2>
      {error && <div className="error">{error}</div>}
      <button onClick={handleLogin} disabled={loginLoading}>
        {loginLoading ? 'Logging in...' : 'Login with Keycloak'}
      </button>
      <p>
        Don't have an account? <Link to="/register">Register here</Link>
      </p>
    </div>
  );
};

export default Login;