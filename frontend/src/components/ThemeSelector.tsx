import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { AVAILABLE_THEMES } from '../constants/themes';
import { Dropdown } from 'primereact/dropdown';
import { ProgressSpinner } from 'primereact/progressspinner';

const ThemeSelector = React.memo(() => {
  const { theme, changeTheme, isLoading } = useTheme();

  const handleThemeChange = (e) => {
    changeTheme(e.value);
  };

  // Group themes by category
  const groupedThemes = AVAILABLE_THEMES.reduce((acc, theme) => {
    const category = theme.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(theme);
    return acc;
  }, {});

  // Convert to PrimeReact optionGroup format
  const themeGroups = Object.keys(groupedThemes).map(category => ({
    label: category,
    items: groupedThemes[category]
  }));

  // Custom template for theme options
  const themeOptionTemplate = (option) => {
    if (!option) return null;
    
    return (
      <div className="flex items-center gap-2">
        {option.value === 'custom-purple-gradient' && (
          <i className="pi pi-star-fill text-yellow-500"></i>
        )}
        <span>{option.label}</span>
      </div>
    );
  };

  // Custom template for selected value
  const selectedThemeTemplate = (option) => {
    if (!option) return <span>Select a theme</span>;
    
    return (
      <div className="flex items-center gap-2">
        {option.value === 'custom-purple-gradient' && (
          <i className="pi pi-star-fill text-yellow-500"></i>
        )}
        <span>{option.label}</span>
      </div>
    );
  };

  const selectedTheme = AVAILABLE_THEMES.find(t => t.value === theme);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <i className="pi pi-palette text-purple-500"></i>
        <label htmlFor="theme-select" className="text-sm font-medium text-gray-700">
          Select UI Theme
        </label>
        {isLoading && (
          <ProgressSpinner
            style={{ width: '20px', height: '20px' }}
            strokeWidth="4"
            className="ml-2"
            aria-label="Applying theme"
          />
        )}
      </div>

      <Dropdown
        id="theme-select"
        value={selectedTheme}
        options={themeGroups}
        onChange={handleThemeChange}
        disabled={isLoading}
        optionLabel="label"
        optionGroupLabel="label"
        optionGroupChildren="items"
        placeholder="Choose a theme"
        className="w-full"
        aria-label="Select user interface theme"
        aria-describedby="theme-description"
        panelClassName="shadow-lg border-0"
        itemTemplate={themeOptionTemplate}
        valueTemplate={selectedThemeTemplate}
        filter
        filterPlaceholder="Search themes..."
        emptyFilterMessage="No themes found"
      />

      <p id="theme-description" className="text-xs text-gray-500 mt-2">
        {selectedTheme?.value === 'custom-purple-gradient' ? (
          <>
            ⭐ <strong>Custom Theme Active:</strong> Using our beautifully designed purple gradient theme with enhanced components
          </>
        ) : (
          'Changing the theme will update the appearance of PrimeReact components throughout the application'
        )}
      </p>

      {isLoading && (
        <div className="flex items-center gap-2 text-sm text-gray-600" aria-live="polite">
          <i className="pi pi-spin pi-spinner"></i>
          Applying theme...
        </div>
      )}
    </div>
  );
});

export default ThemeSelector;