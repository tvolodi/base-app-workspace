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
        const themePath = `/themes/${theme}/theme.css`;
        const response = await fetch(themePath, { method: 'HEAD' });
        if (!response.ok) {
          console.warn(`Theme ${theme} not found, falling back to default`);
          setTheme(DEFAULT_THEME);
          return;
        }

        // Remove existing theme link
        const existingLink = document.querySelector('link[data-theme]');
        if (existingLink) {
          existingLink.remove();
        }

        // Create new theme link
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = themePath;
        link.setAttribute('data-theme', 'primereact');
        
        // Wait for the stylesheet to load
        await new Promise((resolve, reject) => {
          link.onload = resolve;
          link.onerror = reject;
          document.head.appendChild(link);
        });

        // Save to localStorage
        localStorage.setItem('primeReactTheme', theme);

        // Add theme-specific class to body for custom styling
        document.body.className = document.body.className.replace(/theme-\S+/g, '');
        document.body.classList.add(`theme-${theme}`);

        // Special handling for custom theme
        if (theme === 'custom-purple-gradient') {
          document.body.classList.add('custom-theme-active');
        } else {
          document.body.classList.remove('custom-theme-active');
        }

        console.log(`✅ Theme '${theme}' loaded successfully`);
      } catch (error) {
        console.error('Failed to load theme:', error);
        // Fallback to default theme
        if (theme !== DEFAULT_THEME) {
          setTheme(DEFAULT_THEME);
        }
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

    if (newTheme === theme) {
      console.log(`Theme '${newTheme}' is already active`);
      return;
    }

    console.log(`🎨 Changing theme from '${theme}' to '${newTheme}'`);
    setTheme(newTheme);
  };

  const getThemeInfo = () => {
    return AVAILABLE_THEMES.find(t => t.value === theme) || null;
  };

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      changeTheme, 
      isLoading,
      getThemeInfo,
      isCustomTheme: theme === 'custom-purple-gradient'
    }}>
      {children}
    </ThemeContext.Provider>
  );
};