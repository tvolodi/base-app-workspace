import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { t } from '../translations';
import ThemeSelector from './ThemeSelector';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Avatar } from 'primereact/avatar';
import { Badge } from 'primereact/badge';
import { Dialog } from 'primereact/dialog';
import { Divider } from 'primereact/divider';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Message } from 'primereact/message';

const Profile = React.memo(() => {
  const { user, logout, authenticated, loading, sessionWarning, online } = useAuth();
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
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Card className="p-6 shadow-lg">
          <div className="flex flex-col items-center gap-4">
            <ProgressSpinner />
            <span className="text-lg text-gray-600">{t('loadingProfile')}</span>
          </div>
        </Card>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Card className="p-6 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-100">
          <div className="text-center">
            <i className="pi pi-lock text-4xl text-blue-500 mb-4"></i>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">{t('loginPrompt')}</h3>
            <p className="text-gray-600">Please log in to view your profile</p>
          </div>
        </Card>
      </div>
    );
  }

  const header = (
    <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
      <Avatar
        label={user?.name?.charAt(0)?.toUpperCase() || 'U'}
        size="xlarge"
        shape="circle"
        className="bg-white text-blue-600 font-bold text-xl"
      />
      <div>
        <h2 className="text-2xl font-bold m-0">{user?.name || 'User'}</h2>
        <p className="text-blue-100 m-0">@{user?.preferred_username}</p>
      </div>
      <div className="ml-auto">
        <Badge value={online ? 'Online' : 'Offline'} severity={online ? 'success' : 'danger'} />
      </div>
    </div>
  );

  const footer = (
    <div className="flex justify-end gap-2 p-4 border-t border-gray-200">
      <Button
        label={t('logoutAria')}
        icon="pi pi-sign-out"
        onClick={handleLogoutClick}
        className="p-button-danger p-button-outlined"
        aria-label={t('logoutAria')}
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Card
          header={header}
          footer={footer}
          className="shadow-xl border-0 overflow-hidden"
        >
          <div className="p-6">
            {/* Status Messages */}
            <div className="mb-6 space-y-3">
              {!online && (
                <Message
                  severity="warn"
                  text={t('offlineMessage')}
                  className="w-full"
                />
              )}
              {sessionWarning && (
                <Message
                  severity="error"
                  text={t('sessionWarning')}
                  className="w-full"
                />
              )}
            </div>

            {/* Profile Information */}
            <div className="space-y-4 mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <i className="pi pi-user text-blue-500"></i>
                Profile Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <i className="pi pi-user text-blue-600"></i>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Full Name</p>
                      <p className="text-gray-800 font-semibold">{user?.name || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <i className="pi pi-envelope text-green-600"></i>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Email</p>
                      <p className="text-gray-800 font-semibold">{user?.email || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <i className="pi pi-at text-purple-600"></i>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Username</p>
                      <p className="text-gray-800 font-semibold">@{user?.preferred_username || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                      <i className="pi pi-shield text-orange-600"></i>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Status</p>
                      <p className="text-gray-800 font-semibold flex items-center gap-2">
                        <Badge value="Active" severity="success" />
                        Verified
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Divider />

            {/* Theme Selector */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <i className="pi pi-palette text-purple-500"></i>
                Appearance Settings
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <ThemeSelector />
              </div>
            </div>
          </div>
        </Card>

        {/* Logout Confirmation Dialog */}
        <Dialog
          header="Confirm Logout"
          visible={showLogoutConfirm}
          onHide={cancelLogout}
          footer={
            <div className="flex justify-end gap-2">
              <Button
                label={t('no')}
                icon="pi pi-times"
                onClick={cancelLogout}
                className="p-button-text"
              />
              <Button
                label={t('yes')}
                icon="pi pi-check"
                onClick={confirmLogout}
                className="p-button-danger"
                autoFocus
              />
            </div>
          }
          className="w-full max-w-md"
        >
          <div className="text-center py-4">
            <i className="pi pi-question-circle text-4xl text-orange-500 mb-4"></i>
            <h3 className="text-lg font-semibold mb-2">{t('confirmLogout')}</h3>
            <p className="text-gray-600">{t('confirmLogoutMessage')}</p>
          </div>
        </Dialog>
      </div>
    </div>
  );
});

export default Profile;