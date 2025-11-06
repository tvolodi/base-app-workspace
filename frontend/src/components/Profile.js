import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { t } from '../translations';

const Profile = React.memo(() => {
  const { user, logout, authenticated, loading, sessionWarning, online } = useAuth();
  const { theme, changeTheme } = useTheme();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    logout();
    setShowLogoutConfirm(false);
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  if (loading) {
    return <div className="loading">{t('loadingProfile')}</div>;
  }

  if (!authenticated) {
    return <div>{t('loginPrompt')}</div>;
  }

  return (
    <div className="profile">
      <h2>{t('profile')}</h2>
      {!online && <div className="warning">{t('offlineMessage')}</div>}
      {sessionWarning && <div className="warning">{t('sessionWarning')}</div>}
      <div className="profile-info">
        <p><strong>{t('name')}</strong> {user?.name}</p>
        <p><strong>{t('email')}</strong> {user?.email}</p>
        <p><strong>{t('username')}</strong> {user?.preferred_username}</p>
      </div>
      <div className="theme-selector">
        <label htmlFor="theme-select">Select UI Theme:</label>
        <select id="theme-select" value={theme} onChange={(e) => changeTheme(e.target.value)}>
          <option value="lara-light-indigo">Light Indigo</option>
          <option value="lara-dark-indigo">Dark Indigo</option>
          <option value="lara-light-blue">Light Blue</option>
          <option value="lara-dark-blue">Dark Blue</option>
          <option value="lara-light-purple">Light Purple</option>
          <option value="lara-dark-purple">Dark Purple</option>
        </select>
      </div>
      <button onClick={handleLogoutClick} aria-label={t('logoutAria')}>{t('logoutAria')}</button>

      {showLogoutConfirm && (
        <div className="modal-overlay" onClick={cancelLogout}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>{t('confirmLogout')}</h3>
            <p>{t('confirmLogoutMessage')}</p>
            <div className="modal-buttons">
              <button onClick={confirmLogout}>{t('yes')}</button>
              <button onClick={cancelLogout}>{t('no')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default Profile;