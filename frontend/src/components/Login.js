import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { t } from '../translations';

const Login = React.memo(() => {
  const { login, loading, loginLoading, error } = useAuth();

  const handleLogin = () => {
    login();
  };

  if (loading) {
    return <div className="loading">{t('loading')}</div>;
  }

  return (
    <div className="auth-form">
      <h2>Login</h2>
      {error && (
        <div className="error" role="alert" aria-live="polite">
          {error}
          <button onClick={handleLogin} aria-label={t('retryLogin')}>{t('retryLogin')}</button>
        </div>
      )}
      <button onClick={handleLogin} disabled={loginLoading} aria-label={t('loginAria')}>
        {loginLoading ? 'Logging in...' : t('login')}
      </button>
      <p>
        Don't have an account? <Link to="/register">Register here</Link>
      </p>
    </div>
  );
});

export default Login;