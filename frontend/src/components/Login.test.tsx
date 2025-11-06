import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import Login from './Login';

// Mock Keycloak
jest.mock('keycloak-js', () => {
  return jest.fn().mockImplementation(() => ({
    init: jest.fn().mockResolvedValue(false),
    login: jest.fn(),
    logout: jest.fn(),
    register: jest.fn(),
    tokenParsed: null,
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

describe('Login Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders login form', async () => {
    renderWithProviders(<Login />);

    await waitFor(() => {
      expect(screen.getByText('Login')).toBeInTheDocument();
    });

    expect(screen.getByText('Login with Keycloak')).toBeInTheDocument();
    expect(screen.getByText('Register here')).toBeInTheDocument();
  });

  test('calls login function when button is clicked', async () => {
    const mockLogin = jest.fn();
    const KeycloakMock = require('keycloak-js');
    KeycloakMock.mockImplementation(() => ({
      init: jest.fn().mockResolvedValue(false),
      login: mockLogin,
      logout: jest.fn(),
      register: jest.fn(),
      tokenParsed: null,
    }));

    renderWithProviders(<Login />);

    await waitFor(() => {
      const loginButton = screen.getByText('Login with Keycloak');
      fireEvent.click(loginButton);
    });

    expect(mockLogin).toHaveBeenCalledWith({ redirectUri: expect.stringContaining('/profile') });
  });
});