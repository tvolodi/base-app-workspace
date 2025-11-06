import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { AVAILABLE_THEMES } from '../constants/themes';

const ThemeSelector = React.memo(() => {
  const { theme, changeTheme, isLoading } = useTheme();

  const handleThemeChange = (e) => {
    changeTheme(e.target.value);
  };

  return (
    <div className="theme-selector">
      <label htmlFor="theme-select">Select UI Theme:</label>
      <select
        id="theme-select"
        value={theme}
        onChange={handleThemeChange}
        disabled={isLoading}
        aria-label="Select user interface theme"
        aria-describedby="theme-description"
      >
        {AVAILABLE_THEMES.map(({ value, label }) => (
          <option key={value} value={value}>{label}</option>
        ))}
      </select>
      <p id="theme-description" className="sr-only">
        Changing the theme will update the appearance of PrimeReact components throughout the application
      </p>
      {isLoading && <span className="loading-indicator" aria-live="polite">Applying theme...</span>}
    </div>
  );
});

export default ThemeSelector;