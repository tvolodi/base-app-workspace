import React, { createContext, useContext, useState, useEffect } from 'react';

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
    return localStorage.getItem('primeReactTheme') || 'lara-light-indigo';
  });

  useEffect(() => {
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
  }, [theme]);

  const changeTheme = (newTheme) => {
    setTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, changeTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};