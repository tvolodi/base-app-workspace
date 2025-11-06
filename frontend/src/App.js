import React, { useState, useRef, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Login from './components/Login';
import Register from './components/Register';
import Profile from './components/Profile';
import PrimeReactProfile from './components/PrimeReactProfile';
import PrimeReactUserManagement from './components/PrimeReactUserManagement';
import './App.css';
import { t } from './translations';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { authenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return authenticated ? children : <Navigate to="/login" />;
};

// Public Route component (redirects to profile if authenticated)
const PublicRoute = ({ children }) => {
  const { authenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return authenticated ? <Navigate to="/profile" /> : children;
};

// Header component
const Header = () => {
  const { authenticated } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const dropdownRef = useRef(null);

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
    <header className="App-header">
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
              <Routes>
                <Route path="/" element={<Home />} />
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
            </main>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}const Home = () => {
  const { authenticated, user } = useAuth();

  return (
    <div>
      <h2>{t('welcome')}</h2>
      <p>{t('description')}</p>
      {authenticated ? (
        <div>
          <p>{t('welcomeBack')} {user?.name}!</p>
          <div className="demo-links">
            <h3>Component Demos</h3>
            <ul>
              <li><Link to="/profile">Original Profile Component</Link></li>
              <li><Link to="/prime-profile">PrimeReact Profile Component</Link></li>
              <li><Link to="/prime-users">PrimeReact User Management</Link></li>
            </ul>
          </div>
        </div>
      ) : (
        <p>Please <Link to="/login">{t('loginLink')}</Link> or <Link to="/register">{t('registerLink')}</Link> {t('continueText')}</p>
      )}
    </div>
  );
};

export default App;