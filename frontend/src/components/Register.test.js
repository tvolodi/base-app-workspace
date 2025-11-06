import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import Register from './Register';

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

describe('Register Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders register form', async () => {
    renderWithProviders(<Register />);

    await waitFor(() => {
      expect(screen.getByText('Register')).toBeInTheDocument();
    });

    expect(screen.getByText('Register with Keycloak')).toBeInTheDocument();
    expect(screen.getByText('Login here')).toBeInTheDocument();
  });

  test('calls register function when button is clicked', async () => {
    const mockRegister = jest.fn();
    const KeycloakMock = require('keycloak-js');
    KeycloakMock.mockImplementation(() => ({
      init: jest.fn().mockResolvedValue(false),
      login: jest.fn(),
      logout: jest.fn(),
      register: mockRegister,
      tokenParsed: null,
    }));

    renderWithProviders(<Register />);

    await waitFor(() => {
      const registerButton = screen.getByText('Register with Keycloak');
      fireEvent.click(registerButton);
    });

    expect(mockRegister).toHaveBeenCalledWith({ redirectUri: expect.stringContaining('/profile') });
  });
});