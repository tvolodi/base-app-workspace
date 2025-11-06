import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useThemeStyles } from '../hooks/useThemeStyles';
import { t } from '../translations';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import { ProgressSpinner } from 'primereact/progressspinner';

const Register = React.memo(() => {
  const { register, loading, registerLoading, error } = useAuth();
  const themeStyles = useThemeStyles();

  const handleRegister = () => {
    register();
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
            <i className="pi pi-user-plus text-4xl" style={{ color: 'white' }}></i>
          </div>
          <h2 className="text-3xl font-bold m-0 mb-2" style={themeStyles.gradientText}>
            Create Account
          </h2>
          <p className="text-600 mt-0">Join us and start your journey</p>
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
              label={t('retryRegister')}
              icon="pi pi-refresh"
              onClick={handleRegister}
              className="p-button-danger p-button-outlined mt-2 w-full"
              aria-label={t('retryRegister')}
            />
          </div>
        )}

        <Button 
          label={registerLoading ? 'Registering...' : t('register')}
          icon={registerLoading ? 'pi pi-spin pi-spinner' : 'pi pi-user-plus'}
          onClick={handleRegister}
          disabled={registerLoading}
          className="w-full p-button-lg"
          style={themeStyles.primaryButton}
          aria-label={t('registerAria')}
        />

        <div className="text-center mt-4">
          <span className="text-600">Already have an account? </span>
          <Link 
            to="/login" 
            className="text-primary font-semibold no-underline hover:underline"
            style={themeStyles.primaryLink}
          >
            Login here
          </Link>
        </div>
      </Card>
    </div>
  );
});

export default Register;