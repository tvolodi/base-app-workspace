import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { AVAILABLE_THEMES, DEFAULT_THEME, isValidTheme } from '../constants/themes';
import { logger } from '../utils/logger';

// Type definitions
interface ThemeContextType {
  theme: string;
  isLoading: boolean;
  changeTheme: (newTheme: string) => Promise<void>;
  getThemeInfo: () => { value: string; label: string } | null;
  isCustomTheme: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<string>(() => {
    const saved = localStorage.getItem('primeReactTheme');
    if (saved && isValidTheme(saved)) {
      return saved;
    } else if (saved) {
      logger.warn(`Invalid saved theme: ${saved}, falling back to default`);
    }
    return DEFAULT_THEME;
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    // Only run on client side (SSR compatibility)
    if (typeof window === 'undefined') return;

    const loadTheme = async () => {
      try {
        setIsLoading(true);

        // Validate theme before attempting to load
        if (!isValidTheme(theme)) {
          logger.warn(`Invalid theme: ${theme}, falling back to default`);
          setTheme(DEFAULT_THEME);
          return;
        }

        // Check if theme file exists before setting href
        const themePath = `/themes/${theme}/theme.css`;
        const response = await fetch(themePath, { method: 'HEAD' });
        if (!response.ok) {
          logger.warn(`Theme ${theme} not found, falling back to default`);
          toast.warning(`Theme "${theme}" not found. Using default theme.`);
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

        logger.log(`✅ Theme '${theme}' loaded successfully`);
      } catch (error) {
        logger.error('Failed to load theme:', error);
        toast.error(`Failed to load theme "${theme}". Reverting to default.`);
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

  const changeTheme = async (newTheme: string) => {
    if (!isValidTheme(newTheme)) {
      logger.warn(`Invalid theme: ${newTheme}`);
      return;
    }

    if (newTheme === theme) {
      logger.log(`Theme '${newTheme}' is already active`);
      return;
    }

    logger.log(`🎨 Changing theme from '${theme}' to '${newTheme}'`);
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