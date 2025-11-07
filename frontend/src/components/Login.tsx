import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useThemeStyles } from '../hooks/useThemeStyles';
import { t } from '../translations';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import { ProgressSpinner } from 'primereact/progressspinner';

const Login = React.memo(() => {
  const { login, loading, loginLoading, error } = useAuth();
  const themeStyles = useThemeStyles();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirect');

  const handleLogin = () => {
    const redirectUri = redirectTo ? window.location.origin + redirectTo : undefined;
    login(redirectUri);
  };

  if (loading) {
    return (
      <div className="flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
        <Card className="shadow-4 border-round-xl">
          <div className="flex flex-column align-items-center gap-3 p-4">
            <ProgressSpinner style={{ width: '50px', height: '50px' }} strokeWidth="4" />
            <span className="text-lg text-600">{t('loading')}</span>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
      <Card className="shadow-6 border-round-xl p-4" style={{ maxWidth: '500px', width: '100%' }}>
        <div className="text-center mb-5">
          <div className="inline-flex align-items-center justify-content-center bg-primary border-circle mb-3" style={{ width: '80px', height: '80px' }}>
            <i className="pi pi-sign-in text-4xl" style={{ color: 'white' }}></i>
          </div>
          <h2 className="text-3xl font-bold m-0 mb-2" style={themeStyles.gradientText}>
            Welcome Back
          </h2>
          <p className="text-600 mt-0">Sign in to access your account</p>
        </div>

        {error && (
          <div className="mb-4">
            <Message 
              severity="error" 
              text={error}
              className="w-full"
              style={{ animation: 'errorShake 0.5s ease' }}
            />
            <Button 
              label={t('retryLogin')}
              icon="pi pi-refresh"
              onClick={handleLogin}
              className="p-button-danger p-button-outlined mt-2 w-full"
              aria-label={t('retryLogin')}
            />
          </div>
        )}

        <Button 
          label={loginLoading ? 'Logging in...' : t('login')}
          icon={loginLoading ? 'pi pi-spin pi-spinner' : 'pi pi-sign-in'}
          onClick={handleLogin}
          disabled={loginLoading}
          className="w-full p-button-lg"
          style={themeStyles.primaryButton}
          aria-label={t('loginAria')}
        />

        <div className="text-center mt-4">
          <span className="text-600">Don't have an account? </span>
          <Link 
            to="/register" 
            className="text-primary font-semibold no-underline hover:underline"
            style={themeStyles.primaryLink}
          >
            Register here
          </Link>
        </div>
      </Card>
    </div>
  );
});

export default Login;