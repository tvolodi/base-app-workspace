import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const { login, loading } = useAuth();

  const handleLogin = () => {
    login();
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="auth-form">
      <h2>Login</h2>
      <button onClick={handleLogin}>Login with Keycloak</button>
      <p>
        Don't have an account? <Link to="/register">Register here</Link>
      </p>
    </div>
  );
};

export default Login;