import React, { useState, useRef, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { ProtectedRoute, PublicRoute } from './components/ConditionalRoute';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';
import './theme/primeReactOverrides.css';
import { t } from './translations';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import { Button } from 'primereact/button';
import { ProgressSpinner } from 'primereact/progressspinner';

// Lazy load components for code splitting
const Login = lazy(() => import('./components/Login'));
const Register = lazy(() => import('./components/Register'));
const Profile = lazy(() => import('./components/Profile'));
const PrimeReactProfile = lazy(() => import('./components/PrimeReactProfile'));
const PrimeReactUserManagement = lazy(() => import('./components/PrimeReactUserManagement'));
const Dashboard = lazy(() => import('./components/Dashboard'));
const Sidebar = lazy(() => import('./components/Sidebar'));

// Loading fallback component
const LoadingFallback = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    background: 'var(--surface-ground)'
  }}>
    <div style={{ textAlign: 'center' }}>
      <ProgressSpinner 
        style={{ width: '50px', height: '50px' }}
        strokeWidth="4"
        animationDuration="1s"
      />
      <p style={{ marginTop: '1rem', color: 'var(--text-color-secondary)' }}>
        Loading...
      </p>
    </div>
  </div>
);

// Main page route - shows Dashboard if authenticated, otherwise Home
const MainPageRoute = () => {
  const { authenticated, loading } = useAuth();

  if (loading) {
    return <LoadingFallback />;
  }

  return authenticated ? <Dashboard /> : <Home />;
};

// Header component
const Header = () => {
  const { authenticated } = useAuth();
  const { getThemeInfo } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [showThemeIndicator, setShowThemeIndicator] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const dropdownRef = useRef(null);
  const themeInfo = getThemeInfo();

  // Show theme indicator when theme changes
  useEffect(() => {
    setShowThemeIndicator(true);
    const timer = setTimeout(() => setShowThemeIndicator(false), 3000);
    return () => clearTimeout(timer);
  }, [themeInfo?.value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
        setFocusedIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setDropdownOpen(!dropdownOpen);
      setFocusedIndex(-1);
    } else if (dropdownOpen) {
      const links = dropdownRef.current.querySelectorAll('a');
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setFocusedIndex((prev) => Math.min(prev + 1, links.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setFocusedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter' && focusedIndex >= 0) {
        links[focusedIndex]?.click();
      } else if (e.key === 'Escape') {
        setDropdownOpen(false);
        setFocusedIndex(-1);
      }
    }
  };

  return (
    <>
      {authenticated && <Sidebar visible={sidebarVisible} onHide={() => setSidebarVisible(false)} />}
      <header className="App-header">
        {authenticated && (
          <Button
            icon="pi pi-bars"
            className="p-button-text p-button-plain mobile-menu-button"
            onClick={() => setSidebarVisible(!sidebarVisible)}
          />
        )}
        <h1>Base-Application</h1>
        <nav>
          <div className="nav-left">
            <Link to="/">Home</Link>
          </div>
          <div className="nav-right">
            <div className="profile-menu" ref={dropdownRef}>
              <button onClick={() => setDropdownOpen(!dropdownOpen)} onKeyDown={handleKeyDown} aria-expanded={dropdownOpen} aria-haspopup="menu">Profile</button>
              {dropdownOpen && (
                <div className="dropdown">
                  {authenticated ? (
                    <Link to="/profile" onClick={() => setDropdownOpen(false)}>{t('viewProfile')}</Link>
                  ) : (
                    <>
                      <Link to="/login" onClick={() => setDropdownOpen(false)}>{t('loginLinkDropdown')}</Link>
                      <Link to="/register" onClick={() => setDropdownOpen(false)}>{t('registerLinkDropdown')}</Link>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </nav>
      </header>
      
      {/* Theme Indicator */}
      {showThemeIndicator && themeInfo && (
        <div className="theme-indicator">
          🎨 {themeInfo.label}
        </div>
      )}
    </>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="App">
            <Header />
            <main>
              <Suspense fallback={<LoadingFallback />}>
                <Routes>
                  <Route path="/" element={<MainPageRoute />} />
                  <Route
                    path="/login"
                    element={
                      <PublicRoute>
                        <Login />
                      </PublicRoute>
                    }
                  />
                  <Route
                    path="/register"
                    element={
                      <PublicRoute>
                        <Register />
                      </PublicRoute>
                    }
                  />
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/prime-profile"
                    element={
                      <ProtectedRoute>
                        <PrimeReactProfile />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/prime-users"
                    element={
                      <ProtectedRoute>
                        <PrimeReactUserManagement />
                      </ProtectedRoute>
                    }
                  />
                </Routes>
              </Suspense>
            </main>
            <ToastContainer 
              position="top-right"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="light"
            />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}const Home = () => {
  const { authenticated, user } = useAuth();

  return (
    <div className="home-container">
      <h2>{t('welcome')}</h2>
      <p>{t('description')}</p>
      {authenticated ? (
        <div>
          <div className="welcome-card">
            <p>
              <strong>{t('welcomeBack')}</strong> {user?.name}! 🎉
            </p>
            <p>You're logged in and ready to explore the application.</p>
          </div>
          <div className="demo-links">
            <h3>Component Demos</h3>
            <ul>
              <li><Link to="/dashboard">📊 Dashboard (New!)</Link></li>
              <li><Link to="/profile">Original Profile Component</Link></li>
              <li><Link to="/prime-profile">PrimeReact Profile Component</Link></li>
              <li><Link to="/prime-users">PrimeReact User Management</Link></li>
            </ul>
          </div>
        </div>
      ) : (
        <div>
          <div className="welcome-card">
            <p>Experience a modern, feature-rich application built with React and PrimeReact.</p>
          </div>
          <div className="cta-links">
            <Link to="/login">{t('loginLink')}</Link>
            <Link to="/register">{t('registerLink')}</Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;