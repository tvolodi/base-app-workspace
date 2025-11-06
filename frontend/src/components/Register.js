import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { t } from '../translations';

const Register = React.memo(() => {
  const { register, loading, registerLoading, error } = useAuth();

  const handleRegister = () => {
    register();
  };

  if (loading) {
    return <div className="loading">{t('loading')}</div>;
  }

  return (
    <div className="auth-form">
      <h2>Register</h2>
      {error && (
        <div className="error" role="alert" aria-live="polite">
          {error}
          <button onClick={handleRegister} aria-label={t('retryRegister')}>{t('retryRegister')}</button>
        </div>
      )}
      <button onClick={handleRegister} disabled={registerLoading} aria-label={t('registerAria')}>
        {registerLoading ? 'Registering...' : t('register')}
      </button>
      <p>
        Already have an account? <Link to="/login">Login here</Link>
      </p>
    </div>
  );
});

export default Register;