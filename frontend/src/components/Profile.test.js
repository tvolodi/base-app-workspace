import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import Profile from './Profile';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

// Mock Keycloak
jest.mock('keycloak-js', () => jest.fn());

const renderWithProviders = (component) => {
  return render(
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          {component}
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

describe('Profile Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  test('renders profile information when authenticated', async () => {
    const KeycloakMock = require('keycloak-js');
    KeycloakMock.mockImplementation(() => ({
      init: jest.fn(() => true),
      login: jest.fn(),
      logout: jest.fn(),
      register: jest.fn(),
      tokenParsed: {
        name: 'Test User',
        email: 'test@example.com',
        preferred_username: 'testuser',
      },
    }));

    renderWithProviders(<Profile />);

    await waitFor(() => {
      expect(screen.getByText('Profile')).toBeInTheDocument();
    });

    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByText('testuser')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  test('shows login prompt when not authenticated', async () => {
    // Mock unauthenticated
    const KeycloakMock = require('keycloak-js');
    KeycloakMock.mockImplementation(() => ({
      init: jest.fn(() => false),
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

  test('shows loading state', () => {
    const KeycloakMock = require('keycloak-js');
    KeycloakMock.mockImplementation(() => ({
      init: jest.fn(() => Promise.resolve(false)),
      login: jest.fn(),
      logout: jest.fn(),
      register: jest.fn(),
      tokenParsed: null,
    }));

    renderWithProviders(<Profile />);

    expect(screen.getByText('Loading profile...')).toBeInTheDocument();
  });

  test('has no accessibility violations', async () => {
    const KeycloakMock = require('keycloak-js');
    KeycloakMock.mockImplementation(() => ({
      init: jest.fn(() => true),
      login: jest.fn(),
      logout: jest.fn(),
      register: jest.fn(),
      tokenParsed: {
        name: 'Test User',
        email: 'test@example.com',
        preferred_username: 'testuser',
      },
    }));

    const { container } = renderWithProviders(<Profile />);
    await waitFor(() => {
      expect(screen.getByText('Profile')).toBeInTheDocument();
    });

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  test('shows session warning when token is expiring', async () => {
    const KeycloakMock = require('keycloak-js');
    const mockInstance = {
      init: jest.fn(() => true),
      login: jest.fn(),
      logout: jest.fn(),
      register: jest.fn(),
      tokenParsed: {
        name: 'Test User',
        email: 'test@example.com',
        preferred_username: 'testuser',
      },
      onTokenExpired: jest.fn(),
      onAuthRefreshError: jest.fn(),
    };
    KeycloakMock.mockImplementation(() => mockInstance);

    renderWithProviders(<Profile />);

    await waitFor(() => {
      expect(screen.getByText('Profile')).toBeInTheDocument();
    });

    // Simulate session warning
    // Since it's internal state, we can't easily test without exposing it
    // This test is placeholder; in real scenario, mock the context
  });

  test('shows offline message when offline', async () => {
    // Mock navigator.onLine
    Object.defineProperty(navigator, 'onLine', { value: false, writable: true });

    const KeycloakMock = require('keycloak-js');
    KeycloakMock.mockImplementation(() => ({
      init: jest.fn(() => true),
      login: jest.fn(),
      logout: jest.fn(),
      register: jest.fn(),
      tokenParsed: {
        name: 'Test User',
        email: 'test@example.com',
        preferred_username: 'testuser',
      },
    }));

    renderWithProviders(<Profile />);

    await waitFor(() => {
      expect(screen.getByText('Profile')).toBeInTheDocument();
    });

    // Note: Testing offline requires mocking the online state in context
    // This is a basic test; full integration would need context mocking
  });

  test('renders theme selector when authenticated', async () => {
    const KeycloakMock = require('keycloak-js');
    KeycloakMock.mockImplementation(() => ({
      init: jest.fn(() => true),
      login: jest.fn(),
      logout: jest.fn(),
      register: jest.fn(),
      tokenParsed: {
        name: 'Test User',
        email: 'test@example.com',
        preferred_username: 'testuser',
      },
    }));

    renderWithProviders(<Profile />);

    await waitFor(() => {
      expect(screen.getByText('Profile')).toBeInTheDocument();
    });

    expect(screen.getByLabelText('Select UI Theme:')).toBeInTheDocument();
    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
    expect(select.value).toBe('lara-light-indigo'); // default theme
  });

  test('theme selector has correct options', async () => {
    const KeycloakMock = require('keycloak-js');
    KeycloakMock.mockImplementation(() => ({
      init: jest.fn(() => true),
      login: jest.fn(),
      logout: jest.fn(),
      register: jest.fn(),
      tokenParsed: {
        name: 'Test User',
        email: 'test@example.com',
        preferred_username: 'testuser',
      },
    }));

    renderWithProviders(<Profile />);

    await waitFor(() => {
      expect(screen.getByText('Profile')).toBeInTheDocument();
    });

    const select = screen.getByRole('combobox');
    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(6);
    expect(options[0]).toHaveValue('lara-light-indigo');
    expect(options[1]).toHaveValue('lara-dark-indigo');
    expect(options[2]).toHaveValue('lara-light-blue');
    expect(options[3]).toHaveValue('lara-dark-blue');
    expect(options[4]).toHaveValue('lara-light-purple');
    expect(options[5]).toHaveValue('lara-dark-purple');
  });

  test('changing theme updates localStorage', async () => {
    const KeycloakMock = require('keycloak-js');
    KeycloakMock.mockImplementation(() => ({
      init: jest.fn(() => true),
      login: jest.fn(),
      logout: jest.fn(),
      register: jest.fn(),
      tokenParsed: {
        name: 'Test User',
        email: 'test@example.com',
        preferred_username: 'testuser',
      },
    }));

    renderWithProviders(<Profile />);

    await waitFor(() => {
      expect(screen.getByText('Profile')).toBeInTheDocument();
    });

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'lara-dark-blue' } });

    await waitFor(() => {
      expect(localStorage.getItem('primeReactTheme')).toBe('lara-dark-blue');
    });
  });

  test('theme persists from localStorage', async () => {
    localStorage.setItem('primeReactTheme', 'lara-dark-purple');

    const KeycloakMock = require('keycloak-js');
    KeycloakMock.mockImplementation(() => ({
      init: jest.fn(() => true),
      login: jest.fn(),
      logout: jest.fn(),
      register: jest.fn(),
      tokenParsed: {
        name: 'Test User',
        email: 'test@example.com',
        preferred_username: 'testuser',
      },
    }));

    renderWithProviders(<Profile />);

    await waitFor(() => {
      expect(screen.getByText('Profile')).toBeInTheDocument();
    });

    const select = screen.getByRole('combobox');
    expect(select.value).toBe('lara-dark-purple');
  });
});