import React, { useState } from 'react';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { logger } from '../utils/logger';

const PrimeReactProfile = () => {
  const { authenticated, user, logout, loading, error } = useAuth();
  const navigate = useNavigate();
  const [logoutDialogVisible, setLogoutDialogVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || ''
  });

  const handleLogout = () => {
    setLogoutDialogVisible(true);
  };

  const confirmLogout = () => {
    logout();
    setLogoutDialogVisible(false);
    navigate('/');
  };

  const handleSave = () => {
    // Here you would typically save the updated profile data
    logger.log('Saving profile data:', formData);
    setEditMode(false);
  };

  const logoutDialogFooter = (
    <div>
      <Button
        label="Cancel"
        icon="pi pi-times"
        className="p-button-text"
        onClick={() => setLogoutDialogVisible(false)}
      />
      <Button
        label="Logout"
        icon="pi pi-sign-out"
        className="p-button-danger"
        onClick={confirmLogout}
      />
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-content-center align-items-center min-h-screen">
        <i className="pi pi-spin pi-spinner text-4xl"></i>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <Card className="shadow-4">
        <div className="text-center">
          <i className="pi pi-info-circle text-4xl text-blue-500 mb-3"></i>
          <h3>Please log in to view your profile</h3>
          <Button
            label="Go to Login"
            icon="pi pi-sign-in"
            className="mt-3"
            onClick={() => navigate('/login')}
          />
        </div>
      </Card>
    );
  }

  return (
    <div className="p-4">
      <Card className="shadow-4" title="User Profile">
        <div className="grid">
          <div className="col-12 md:col-6">
            {!editMode ? (
              <div className="mb-4">
                <div className="field mb-3">
                  <label className="block text-900 font-medium mb-2">Name</label>
                  <div className="text-700">{user?.name || 'N/A'}</div>
                </div>
                <div className="field mb-3">
                  <label className="block text-900 font-medium mb-2">Email</label>
                  <div className="text-700">{user?.email || 'N/A'}</div>
                </div>
                <div className="field mb-3">
                  <label className="block text-900 font-medium mb-2">Username</label>
                  <div className="text-700">{user?.preferred_username || 'N/A'}</div>
                </div>
              </div>
            ) : (
              <div className="mb-4">
                <div className="field mb-3">
                  <label htmlFor="name" className="block text-900 font-medium mb-2">Name</label>
                  <InputText
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full"
                  />
                </div>
                <div className="field mb-3">
                  <label htmlFor="email" className="block text-900 font-medium mb-2">Email</label>
                  <InputText
                    id="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="col-12 md:col-6">
            <div className="flex flex-column gap-2">
              {!editMode ? (
                <Button
                  label="Edit Profile"
                  icon="pi pi-pencil"
                  className="p-button-outlined"
                  onClick={() => setEditMode(true)}
                />
              ) : (
                <>
                  <Button
                    label="Save Changes"
                    icon="pi pi-check"
                    className="p-button-success"
                    onClick={handleSave}
                  />
                  <Button
                    label="Cancel"
                    icon="pi pi-times"
                    className="p-button-secondary p-button-outlined"
                    onClick={() => setEditMode(false)}
                  />
                </>
              )}

              <Button
                label="Logout"
                icon="pi pi-sign-out"
                className="p-button-danger"
                onClick={handleLogout}
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-3">
            <div className="p-error bg-red-100 border-round p-3 border-1 border-red-300">
              <i className="pi pi-exclamation-triangle mr-2"></i>
              {error}
            </div>
          </div>
        )}
      </Card>

      <Dialog
        header="Confirm Logout"
        visible={logoutDialogVisible}
        style={{ width: '450px' }}
        modal
        footer={logoutDialogFooter}
        onHide={() => setLogoutDialogVisible(false)}
      >
        <div className="flex align-items-center">
          <i className="pi pi-exclamation-triangle text-3xl text-yellow-500 mr-3"></i>
          <span>Are you sure you want to logout?</span>
        </div>
      </Dialog>
    </div>
  );
};

export default PrimeReactProfile;