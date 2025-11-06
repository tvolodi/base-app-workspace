/**
 * Theme Usage Examples
 * Demonstrates how to use the custom theme in components
 */

import React from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Message } from 'primereact/message';
import { Avatar } from 'primereact/avatar';
import { Badge } from 'primereact/badge';
import { Panel } from 'primereact/panel';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import theme, { gradient, shadow, radius, themePresets } from '../theme';

// Example 1: Styled Form Component
export const ThemedFormExample = () => {
  return (
    <div style={themePresets.formContainer}>
      <h2 style={themePresets.gradientText}>Styled Form</h2>
      
      <div className="mb-4">
        <label className="block mb-2 font-semibold">Email Address</label>
        <InputText 
          type="email" 
          placeholder="Enter your email"
          className="w-full"
        />
      </div>

      <div className="mb-4">
        <label className="block mb-2 font-semibold">Country</label>
        <Dropdown 
          placeholder="Select a country"
          className="w-full"
          options={[
            { label: 'USA', value: 'usa' },
            { label: 'UK', value: 'uk' },
            { label: 'Canada', value: 'canada' }
          ]}
        />
      </div>

      <Button 
        label="Submit Form"
        icon="pi pi-check"
        className="w-full p-button-lg"
        style={{
          background: gradient('primary'),
          border: 'none',
          boxShadow: shadow('button')
        }}
      />
    </div>
  );
};

// Example 2: Profile Card Component
export const ThemedProfileCard = ({ user }) => {
  const header = (
    <div style={{
      background: gradient('primary'),
      padding: '2rem',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      borderRadius: `${radius('xl')} ${radius('xl')} 0 0`
    }}>
      <Avatar 
        label={user?.name?.charAt(0) || 'U'}
        size="xlarge"
        shape="circle"
        style={{ background: 'white', color: '#667eea' }}
      />
      <div>
        <h2 className="m-0 text-2xl font-bold">{user?.name || 'User'}</h2>
        <p className="m-0 text-sm opacity-90">@{user?.username || 'username'}</p>
      </div>
      <Badge 
        value="Online" 
        severity="success"
        style={{ marginLeft: 'auto' }}
      />
    </div>
  );

  return (
    <Card 
      header={header}
      className="shadow-6 border-round-xl"
      style={{ maxWidth: '600px', margin: '2rem auto' }}
    >
      <div className="grid">
        <div className="col-12 md:col-6 mb-3">
          <div style={themePresets.sectionContainer}>
            <div style={themePresets.iconBadge('lg')} className="mb-3">
              <i className="pi pi-envelope text-xl"></i>
            </div>
            <p className="text-sm text-600 m-0 mb-1">Email</p>
            <p className="font-semibold m-0">{user?.email || 'N/A'}</p>
          </div>
        </div>
        
        <div className="col-12 md:col-6 mb-3">
          <div style={themePresets.sectionContainer}>
            <div style={themePresets.iconBadge('lg')} className="mb-3">
              <i className="pi pi-phone text-xl"></i>
            </div>
            <p className="text-sm text-600 m-0 mb-1">Phone</p>
            <p className="font-semibold m-0">{user?.phone || 'N/A'}</p>
          </div>
        </div>
      </div>

      <Button 
        label="Edit Profile"
        icon="pi pi-pencil"
        className="w-full mt-3"
        style={{
          background: gradient('primary'),
          border: 'none'
        }}
      />
    </Card>
  );
};

// Example 3: Dashboard Stats Component
export const ThemedDashboardStats = () => {
  const stats = [
    { label: 'Total Users', value: '1,234', icon: 'pi-users', color: '#667eea' },
    { label: 'Revenue', value: '$45.2K', icon: 'pi-dollar', color: '#10b981' },
    { label: 'Orders', value: '892', icon: 'pi-shopping-cart', color: '#f59e0b' },
    { label: 'Growth', value: '+23%', icon: 'pi-chart-line', color: '#ec4899' },
  ];

  return (
    <div className="grid">
      {stats.map((stat, index) => (
        <div key={index} className="col-12 md:col-6 lg:col-3 mb-4">
          <Card style={themePresets.elevatedCard}>
            <div className="flex align-items-center justify-content-between">
              <div>
                <p className="text-sm text-600 m-0 mb-2">{stat.label}</p>
                <h3 className="text-3xl font-bold m-0" style={{ color: stat.color }}>
                  {stat.value}
                </h3>
              </div>
              <div style={{
                ...themePresets.iconBadge('2xl'),
                background: `linear-gradient(135deg, ${stat.color}20, ${stat.color}40)`
              }}>
                <i className={`pi ${stat.icon} text-3xl`} style={{ color: stat.color }}></i>
              </div>
            </div>
          </Card>
        </div>
      ))}
    </div>
  );
};

// Example 4: Notification Panel
export const ThemedNotificationPanel = () => {
  const notifications = [
    { type: 'success', message: 'Your profile has been updated successfully!' },
    { type: 'info', message: 'New features are available. Check them out!' },
    { type: 'warn', message: 'Your subscription will expire in 7 days.' },
    { type: 'error', message: 'Failed to process payment. Please try again.' },
  ];

  return (
    <Panel 
      header="Notifications" 
      className="shadow-4 border-round-xl"
      style={{ maxWidth: '600px', margin: '2rem auto' }}
    >
      <div className="flex flex-column gap-3">
        {notifications.map((notif, index) => (
          <Message
            key={index}
            severity={notif.type as "success" | "info" | "warn" | "error"}
            text={notif.message}
            className="w-full"
          />
        ))}
      </div>
    </Panel>
  );
};

// Example 5: Data Table with Theme
export const ThemedDataTable = () => {
  const products = [
    { id: 1, name: 'Product A', category: 'Electronics', price: '$299', status: 'In Stock' },
    { id: 2, name: 'Product B', category: 'Clothing', price: '$49', status: 'Low Stock' },
    { id: 3, name: 'Product C', category: 'Home', price: '$129', status: 'In Stock' },
    { id: 4, name: 'Product D', category: 'Sports', price: '$79', status: 'Out of Stock' },
  ];

  const statusBodyTemplate = (rowData) => {
    const severity = rowData.status === 'In Stock' ? 'success' : 
                     rowData.status === 'Low Stock' ? 'warning' : 'danger';
    return <Badge value={rowData.status} severity={severity} />;
  };

  return (
    <div style={{ maxWidth: '900px', margin: '2rem auto' }}>
      <DataTable 
        value={products} 
        className="shadow-6 border-round-xl"
        paginator 
        rows={10}
      >
        <Column field="id" header="ID" sortable></Column>
        <Column field="name" header="Name" sortable></Column>
        <Column field="category" header="Category" sortable></Column>
        <Column field="price" header="Price" sortable></Column>
        <Column field="status" header="Status" body={statusBodyTemplate}></Column>
      </DataTable>
    </div>
  );
};

// Example 6: Action Buttons Grid
export const ThemedActionButtons = () => {
  const actions = [
    { label: 'Save', icon: 'pi-save', variant: 'primary' },
    { label: 'Delete', icon: 'pi-trash', variant: 'danger' },
    { label: 'Edit', icon: 'pi-pencil', variant: 'info' },
    { label: 'Download', icon: 'pi-download', variant: 'success' },
  ];

  return (
    <div className="flex gap-3 flex-wrap justify-content-center p-4">
      {actions.map((action, index) => (
        <Button
          key={index}
          label={action.label}
          icon={`pi ${action.icon}`}
          className={`p-button-${action.variant}`}
        />
      ))}
    </div>
  );
};

// Example 7: Hero Section
export const ThemedHeroSection = () => {
  return (
    <div style={themePresets.heroSection as React.CSSProperties}>
      <h1 style={{
        ...themePresets.gradientText,
        fontSize: '3.75rem',
        marginBottom: '1rem',
      }}>
        Welcome to Our Platform
      </h1>
      <p style={{
        fontSize: '1.25rem',
        color: theme.tokens.colors.text.secondary,
        marginBottom: '2rem',
        maxWidth: '600px',
        margin: '0 auto 2rem',
      }}>
        Build amazing applications with our comprehensive design system and component library.
      </p>
      <div className="flex gap-3 justify-content-center">
        <Button 
          label="Get Started" 
          icon="pi pi-arrow-right"
          size="large"
          style={{
            background: gradient('primary'),
            border: 'none',
            boxShadow: shadow('buttonHover')
          }}
        />
        <Button 
          label="Learn More" 
          icon="pi pi-book"
          size="large"
          className="p-button-outlined"
        />
      </div>
    </div>
  );
};

// Export all examples
export default {
  ThemedFormExample,
  ThemedProfileCard,
  ThemedDashboardStats,
  ThemedNotificationPanel,
  ThemedDataTable,
  ThemedActionButtons,
  ThemedHeroSection,
};
