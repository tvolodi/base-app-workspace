import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import Profile from './Profile';

// Mock Keycloak
jest.mock('keycloak-js', () => {
  return jest.fn().mockImplementation(() => ({
    init: jest.fn().mockResolvedValue(true),
    login: jest.fn(),
    logout: jest.fn(),
    register: jest.fn(),
    tokenParsed: {
      name: 'Test User',
      email: 'test@example.com',
      preferred_username: 'testuser',
    },
  }));
});

const renderWithProviders = (component) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        {component}
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Profile Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders profile information when authenticated', async () => {
    renderWithProviders(<Profile />);

    await waitFor(() => {
      expect(screen.getByText('Profile')).toBeInTheDocument();
    });

    expect(screen.getByText('Name: Test User')).toBeInTheDocument();
    expect(screen.getByText('Email: test@example.com')).toBeInTheDocument();
    expect(screen.getByText('Username: testuser')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  test('shows login prompt when not authenticated', async () => {
    // Mock unauthenticated
    const KeycloakMock = require('keycloak-js');
    KeycloakMock.mockImplementation(() => ({
      init: jest.fn().mockResolvedValue(false),
      login: jest.fn(),
      logout: jest.fn(),
      register: jest.fn(),
      tokenParsed: null,
    }));

    renderWithProviders(<Profile />);

    await waitFor(() => {
      expect(screen.getByText('Please log in to view your profile.')).toBeInTheDocument();
    });
  });

  test('calls logout function when logout button is clicked', async () => {
    const mockLogout = jest.fn();
    const KeycloakMock = require('keycloak-js');
    KeycloakMock.mockImplementation(() => ({
      init: jest.fn().mockResolvedValue(true),
      login: jest.fn(),
      logout: mockLogout,
      register: jest.fn(),
      tokenParsed: {
        name: 'Test User',
        email: 'test@example.com',
        preferred_username: 'testuser',
      },
    }));

    renderWithProviders(<Profile />);

    await waitFor(() => {
      const logoutButton = screen.getByText('Logout');
      fireEvent.click(logoutButton);
    });

    expect(mockLogout).toHaveBeenCalled();
  });
});