// src/constants/themes.js
export const AVAILABLE_THEMES = [
  { value: 'lara-light-indigo', label: 'Light Indigo' },
  { value: 'lara-dark-indigo', label: 'Dark Indigo' },
  { value: 'lara-light-blue', label: 'Light Blue' },
  { value: 'lara-dark-blue', label: 'Dark Blue' },
  { value: 'lara-light-purple', label: 'Light Purple' },
  { value: 'lara-dark-purple', label: 'Dark Purple' },
];

export const DEFAULT_THEME = 'lara-light-indigo';

export const isValidTheme = (theme) =>
  AVAILABLE_THEMES.some(t => t.value === theme);