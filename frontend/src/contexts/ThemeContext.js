import React, { createContext, useContext, useState, useEffect } from 'react';
import { AVAILABLE_THEMES, DEFAULT_THEME, isValidTheme } from '../constants/themes';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('primeReactTheme');
    if (saved && isValidTheme(saved)) {
      return saved;
    } else if (saved) {
      console.warn(`Invalid saved theme: ${saved}, falling back to default`);
    }
    return DEFAULT_THEME;
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Only run on client side (SSR compatibility)
    if (typeof window === 'undefined') return;

    const loadTheme = async () => {
      try {
        setIsLoading(true);

        // Validate theme before attempting to load
        if (!isValidTheme(theme)) {
          console.warn(`Invalid theme: ${theme}, falling back to default`);
          setTheme(DEFAULT_THEME);
          return;
        }

        // Check if theme file exists before setting href
        const response = await fetch(`/themes/${theme}/theme.css`, { method: 'HEAD' });
        if (!response.ok) {
          console.warn(`Theme ${theme} not found, falling back to default`);
          setTheme(DEFAULT_THEME);
          return;
        }

        let link = document.querySelector('link[data-theme]');
        if (!link) {
          link = document.createElement('link');
          link.rel = 'stylesheet';
          link.setAttribute('data-theme', 'primereact');
          document.head.appendChild(link);
        }
        link.href = `/themes/${theme}/theme.css`;

        // Save to localStorage
        localStorage.setItem('primeReactTheme', theme);
      } catch (error) {
        console.error('Failed to load theme:', error);
        // Fallback to default theme
        setTheme(DEFAULT_THEME);
      } finally {
        setIsLoading(false);
      }
    };

    loadTheme();

    // Cleanup function
    return () => {
      const link = document.querySelector('link[data-theme]');
      if (link) {
        link.remove();
      }
    };
  }, [theme]);

  const changeTheme = async (newTheme) => {
    if (!isValidTheme(newTheme)) {
      console.warn(`Invalid theme: ${newTheme}`);
      return;
    }

    setTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, changeTheme, isLoading }}>
      {children}
    </ThemeContext.Provider>
  );
};