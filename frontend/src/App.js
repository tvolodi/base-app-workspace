import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import Register from './components/Register';
import Profile from './components/Profile';
import './App.css';

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Public Route component (redirects to profile if authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? <Navigate to="/profile" /> : children;
};

// Header component
const Header = () => {
  const { isAuthenticated } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="App-header">
      <h1>Base-Application</h1>
      <nav>
        <div className="nav-left">
          <Link to="/">Home</Link>
        </div>
        <div className="nav-right">
          <div className="profile-menu">
            <button onClick={() => setDropdownOpen(!dropdownOpen)}>Profile</button>
            {dropdownOpen && (
              <div className="dropdown">
                {isAuthenticated ? (
                  <Link to="/profile" onClick={() => setDropdownOpen(false)}>View Profile</Link>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setDropdownOpen(false)}>Login</Link>
                    <Link to="/register" onClick={() => setDropdownOpen(false)}>Register</Link>
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
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

const Home = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div>
      <h2>Welcome to Base-Application</h2>
      <p>A modular application framework for small teams.</p>
      {isAuthenticated ? (
        <p>Welcome back, {user?.name}!</p>
      ) : (
        <p>Please <Link to="/login">login</Link> or <Link to="/register">register</Link> to continue.</p>
      )}
    </div>
  );
};

export default App;