// src/constants/themes.js
export const AVAILABLE_THEMES = [
  { value: 'custom-purple-gradient', label: '🎨 Custom Purple Gradient (Recommended)', category: 'Custom' },
  { value: 'custom-warm-earth', label: '🌿 Custom Warm Earth', category: 'Custom' },
  { value: 'lara-light-indigo', label: 'Light Indigo', category: 'Light' },
  { value: 'lara-dark-indigo', label: 'Dark Indigo', category: 'Dark' },
  { value: 'lara-light-blue', label: 'Light Blue', category: 'Light' },
  { value: 'lara-dark-blue', label: 'Dark Blue', category: 'Dark' },
  { value: 'lara-light-purple', label: 'Light Purple', category: 'Light' },
  { value: 'lara-dark-purple', label: 'Dark Purple', category: 'Dark' },
  { value: 'lara-light-teal', label: 'Light Teal', category: 'Light' },
  { value: 'lara-dark-teal', label: 'Dark Teal', category: 'Dark' },
  { value: 'bootstrap4-light-blue', label: 'Bootstrap Light Blue', category: 'Bootstrap' },
  { value: 'bootstrap4-dark-blue', label: 'Bootstrap Dark Blue', category: 'Bootstrap' },
  { value: 'md-light-indigo', label: 'Material Design Light', category: 'Material' },
  { value: 'md-dark-indigo', label: 'Material Design Dark', category: 'Material' },
  { value: 'fluent-light', label: 'Fluent Light', category: 'Fluent' },
  { value: 'viva-light', label: 'Viva Light', category: 'Modern' },
  { value: 'viva-dark', label: 'Viva Dark', category: 'Modern' },
  { value: 'mira', label: 'Mira', category: 'Modern' },
  { value: 'nano', label: 'Nano', category: 'Modern' },
  { value: 'saga-blue', label: 'Saga Blue', category: 'Classic' },
  { value: 'saga-purple', label: 'Saga Purple', category: 'Classic' },
  { value: 'arya-blue', label: 'Arya Blue', category: 'Dark' },
  { value: 'arya-purple', label: 'Arya Purple', category: 'Dark' },
];

export const DEFAULT_THEME = 'custom-purple-gradient';

export const isValidTheme = (theme) =>
  AVAILABLE_THEMES.some(t => t.value === theme);