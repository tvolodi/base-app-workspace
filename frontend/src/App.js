import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <header className="App-header">
            <h1>Base-Application</h1>
            <nav>
              <a href="/">Home</a>
              <a href="/login">Login</a>
              <a href="/register">Register</a>
              <a href="/profile">Profile</a>
            </nav>
          </header>
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
        <p>Welcome back, {user?.first_name}!</p>
      ) : (
        <p>Please <a href="/login">login</a> or <a href="/register">register</a> to continue.</p>
      )}
    </div>
  );
};

export default App;