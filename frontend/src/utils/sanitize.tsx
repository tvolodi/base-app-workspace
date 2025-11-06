import DOMPurify from 'dompurify';
import React from 'react';

/**
 * Input sanitization utilities to prevent XSS attacks
 * Uses DOMPurify to clean user input before rendering
 */

/**
 * Sanitize HTML string
 * @param {string} dirty - The potentially unsafe HTML string
 * @param {Object} config - DOMPurify configuration options
 * @returns {string} Sanitized HTML string
 */
export const sanitizeHtml = (dirty, config = {}) => {
  if (!dirty || typeof dirty !== 'string') {
    return '';
  }

  const defaultConfig = {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li', 'span'],
    ALLOWED_ATTR: ['href', 'title', 'target', 'rel'],
    ALLOW_DATA_ATTR: false,
    ...config,
  };

  return DOMPurify.sanitize(dirty, defaultConfig);
};

/**
 * Sanitize plain text - strips all HTML tags
 * @param {string} dirty - The potentially unsafe string
 * @returns {string} Sanitized plain text
 */
export const sanitizeText = (dirty) => {
  if (!dirty || typeof dirty !== 'string') {
    return '';
  }

  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });
};

/**
 * Sanitize URL to prevent javascript: and data: protocols
 * @param {string} url - The URL to sanitize
 * @returns {string} Sanitized URL or empty string if invalid
 */
export const sanitizeUrl = (url) => {
  if (!url || typeof url !== 'string') {
    return '';
  }

  // Remove whitespace
  const trimmed = url.trim();

  // Block dangerous protocols
  const dangerousProtocols = /^(javascript|data|vbscript|file):/i;
  if (dangerousProtocols.test(trimmed)) {
    console.warn('Blocked potentially dangerous URL:', trimmed);
    return '';
  }

  // Only allow http, https, mailto, tel
  const allowedProtocols = /^(https?|mailto|tel):/i;
  if (!allowedProtocols.test(trimmed) && trimmed.includes(':')) {
    console.warn('Blocked URL with unsupported protocol:', trimmed);
    return '';
  }

  return DOMPurify.sanitize(trimmed, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });
};

/**
 * Sanitize user input for safe display
 * Handles common input types
 * @param {any} input - The input to sanitize
 * @param {string} type - The type of input ('html', 'text', 'url', 'json')
 * @returns {any} Sanitized input
 */
export const sanitizeInput = (input, type = 'text') => {
  if (input === null || input === undefined) {
    return '';
  }

  switch (type) {
    case 'html':
      return sanitizeHtml(input);
    
    case 'url':
      return sanitizeUrl(input);
    
    case 'json':
      if (typeof input === 'object') {
        return sanitizeObject(input);
      }
      return input;
    
    case 'text':
    default:
      return sanitizeText(String(input));
  }
};

/**
 * Recursively sanitize all string values in an object
 * @param {Object} obj - The object to sanitize
 * @param {Array} skipKeys - Keys to skip sanitization
 * @returns {Object} Sanitized object
 */
export const sanitizeObject = (obj, skipKeys = []) => {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item, skipKeys));
  }

  const sanitized = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (skipKeys.includes(key)) {
      sanitized[key] = value;
      continue;
    }

    if (typeof value === 'string') {
      sanitized[key] = sanitizeText(value);
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value, skipKeys);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
};

/**
 * Sanitize form data before submission
 * @param {Object} formData - Form data object
 * @param {Array} skipFields - Fields to skip sanitization (e.g., passwords)
 * @returns {Object} Sanitized form data
 */
export const sanitizeFormData = (formData, skipFields = ['password', 'confirmPassword']) => {
  return sanitizeObject(formData, skipFields);
};

/**
 * Create a safe React component for rendering sanitized HTML
 * Usage: <SafeHtml html={userInput} />
 */
export const SafeHtml = ({ html, config = {}, className = '', ...props }) => {
  const sanitized = sanitizeHtml(html, config);
  
  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitized }}
      {...props}
    />
  );
};

/**
 * React hook for sanitizing input values
 * @param {string} initialValue - Initial input value
 * @param {string} type - Sanitization type
 * @returns {[string, Function]} [value, setValue]
 */
export const useSanitizedInput = (initialValue = '', type = 'text') => {
  const [value, setValue] = React.useState(sanitizeInput(initialValue, type));

  const setSanitizedValue = (newValue) => {
    setValue(sanitizeInput(newValue, type));
  };

  return [value, setSanitizedValue];
};

/**
 * Validate and sanitize email address
 * @param {string} email - Email address to validate
 * @returns {string} Sanitized email or empty string if invalid
 */
export const sanitizeEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return '';
  }

  const sanitized = sanitizeText(email.trim().toLowerCase());
  
  // Basic email validation
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(sanitized)) {
    return '';
  }

  return sanitized;
};

/**
 * Sanitize filename to prevent path traversal
 * @param {string} filename - Filename to sanitize
 * @returns {string} Safe filename
 */
export const sanitizeFilename = (filename) => {
  if (!filename || typeof filename !== 'string') {
    return '';
  }

  // Remove path characters and keep only safe characters
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/^\.+/, '') // Remove leading dots
    .substring(0, 255); // Limit length
};

export default {
  sanitizeHtml,
  sanitizeText,
  sanitizeUrl,
  sanitizeInput,
  sanitizeObject,
  sanitizeFormData,
  sanitizeEmail,
  sanitizeFilename,
  SafeHtml,
  useSanitizedInput,
};
