import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { logger } from '../utils/logger';
import { PanelMenu } from 'primereact/panelmenu';
import { Button } from 'primereact/button';
import { Avatar } from 'primereact/avatar';
import { Badge } from 'primereact/badge';
import './Sidebar.css';

const Sidebar = ({ visible, onHide }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    {
      label: 'Dashboard',
      icon: 'pi pi-home',
      command: () => navigate('/'),
      className: location.pathname === '/' ? 'active-menu-item' : ''
    },
    {
      label: 'User Management',
      icon: 'pi pi-users',
      items: [
        {
          label: 'All Users',
          icon: 'pi pi-list',
          command: () => navigate('/prime-users'),
          className: location.pathname === '/prime-users' ? 'active-menu-item' : ''
        },
        {
          label: 'User Profile',
          icon: 'pi pi-user',
          command: () => navigate('/prime-profile'),
          className: location.pathname === '/prime-profile' ? 'active-menu-item' : ''
        },
        {
          label: 'Profile (Classic)',
          icon: 'pi pi-id-card',
          command: () => navigate('/profile'),
          className: location.pathname === '/profile' ? 'active-menu-item' : ''
        }
      ]
    },
    {
      label: 'Reports',
      icon: 'pi pi-chart-bar',
      items: [
        {
          label: 'Analytics',
          icon: 'pi pi-chart-line',
          badge: '3',
          command: () => navigate('/reports/analytics')
        },
        {
          label: 'Revenue',
          icon: 'pi pi-dollar',
          command: () => navigate('/reports/revenue')
        },
        {
          label: 'Exports',
          icon: 'pi pi-download',
          command: () => navigate('/reports/exports')
        }
      ]
    },
    {
      separator: true
    },
    {
      label: 'Settings',
      icon: 'pi pi-cog',
      items: [
        {
          label: 'Account',
          icon: 'pi pi-user-edit',
          command: () => navigate('/settings/account')
        },
        {
          label: 'Preferences',
          icon: 'pi pi-sliders-h',
          command: () => navigate('/settings/preferences')
        },
        {
          label: 'Security',
          icon: 'pi pi-shield',
          command: () => navigate('/settings/security')
        }
      ]
    },
    {
      label: 'Help & Support',
      icon: 'pi pi-question-circle',
      items: [
        {
          label: 'Documentation',
          icon: 'pi pi-book',
          command: () => window.open('/documentation', '_blank')
        },
        {
          label: 'Contact Support',
          icon: 'pi pi-envelope',
          badge: '2',
          command: () => navigate('/support')
        }
      ]
    }
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside 
      className={`sidebar-container ${collapsed ? 'collapsed' : ''} ${visible ? 'visible' : ''}`}
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Sidebar Header */}
      <div className="sidebar-header">
        <div className="sidebar-logo" role="banner">
          {!collapsed && <h2>Base App</h2>}
          {collapsed && <i className="pi pi-home" style={{ fontSize: '1.5rem' }} aria-hidden="true"></i>}
        </div>
        <Button
          icon={collapsed ? 'pi pi-angle-right' : 'pi pi-angle-left'}
          className="p-button-text p-button-plain sidebar-collapse-btn"
          onClick={() => setCollapsed(!collapsed)}
          tooltip={collapsed ? 'Expand' : 'Collapse'}
          tooltipOptions={{ position: 'right' }}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-expanded={!collapsed}
        />
      </div>

      {/* User Info Section */}
      {!collapsed && (
        <div className="sidebar-user-info" role="region" aria-label="User information">
          <Avatar
            label={user?.name?.charAt(0).toUpperCase() || 'U'}
            size="large"
            shape="circle"
            className="user-avatar"
            aria-label={`${user?.name || 'User'} avatar`}
          />
          <div className="user-details">
            <span className="user-name">{user?.name || 'User'}</span>
            <span className="user-email">{user?.email || 'user@example.com'}</span>
          </div>
          <Badge value="Pro" severity="success" aria-label="Pro membership" />
        </div>
      )}

      {collapsed && (
        <div className="sidebar-user-info-collapsed">
          <Avatar
            label={user?.name?.charAt(0).toUpperCase() || 'U'}
            size="normal"
            shape="circle"
            className="user-avatar-small"
            aria-label={`${user?.name || 'User'} avatar`}
          />
        </div>
      )}

      {/* Navigation Menu */}
      <nav className="sidebar-menu" aria-label="Primary navigation menu">
        <PanelMenu model={menuItems} className="sidebar-panel-menu" />
      </nav>

      {/* Sidebar Footer */}
      <div className="sidebar-footer" role="contentinfo">
        <Button
          label={collapsed ? '' : 'Logout'}
          icon="pi pi-sign-out"
          className="p-button-danger p-button-text w-full"
          onClick={handleLogout}
          tooltip={collapsed ? 'Logout' : ''}
          tooltipOptions={{ position: 'right' }}
          aria-label="Logout from application"
        />
      </div>

      {/* Mobile Overlay */}
      {visible && (
        <div 
          className="sidebar-overlay" 
          onClick={onHide}
          role="button"
          tabIndex={0}
          aria-label="Close navigation menu"
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              onHide();
            }
          }}
        ></div>
      )}
    </aside>
  );
};

export default Sidebar;
