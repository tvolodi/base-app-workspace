import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Register = () => {
  const { register, loading, registerLoading, error } = useAuth();

  const handleRegister = () => {
    register();
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="auth-form">
      <h2>Register</h2>
      {error && <div className="error">{error}</div>}
      <button onClick={handleRegister} disabled={registerLoading}>
        {registerLoading ? 'Registering...' : 'Register with Keycloak'}
      </button>
      <p>
        Already have an account? <Link to="/login">Login here</Link>
      </p>
    </div>
  );
};

export default Register;