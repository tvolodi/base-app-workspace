# Dynamic Master-Details Component JSON Schema

This document provides comprehensive JSON schema definitions for implementing a dynamic master-details component that can render itself based on configuration, without hardcoding specific implementations.

## Overview

The dynamic master-details component uses two main schema types:

1. **Master Schema** - Defines the list/table view with columns, data source, and features
2. **Details Schema** - Defines the detailed view with fields, layout, and actions

## Schema Structure

### Master Schema
```json
{
  "id": "unique-identifier",
  "title": "Display Title",
  "description": "Description text",
  "dataSource": {
    "type": "api|static|mock",
    "endpoint": "/api/endpoint",
    "pagination": true,
    "pageSize": 10
  },
  "columns": [...],
  "features": {...}
}
```

### Details Schema
```json
{
  "id": "unique-identifier",
  "title": "Display Title",
  "description": "Description text",
  "layout": {
    "type": "form|card|tabs|accordion",
    "groups": [...]
  },
  "fields": [...],
  "actions": [...]
}
```

## Field Types

### Master List Column Types
- `text` - Plain text
- `number` - Numeric values
- `date` - Date values
- `boolean` - True/false values
- `currency` - Monetary values
- `email` - Email addresses
- `phone` - Phone numbers
- `badge` - Status badges
- `avatar` - User avatars
- `icon` - Icon display
- `image` - Image display
- `custom` - Custom rendering

### Details View Field Types
- `text` - Single line text input
- `textarea` - Multi-line text input
- `number` - Numeric input
- `date` - Date picker
- `datetime` - Date and time picker
- `boolean` - Checkbox
- `select` - Dropdown selection
- `multiselect` - Multiple selection
- `radio` - Radio button group
- `email` - Email input
- `phone` - Phone input
- `url` - URL input
- `password` - Password input
- `file` - File upload
- `image` - Image upload
- `avatar` - Avatar upload
- `badge` - Badge display
- `progress` - Progress bar
- `rating` - Star rating
- `slider` - Range slider
- `color` - Color picker
- `json` - JSON editor
- `code` - Code editor
- `markdown` - Markdown editor
- `html` - HTML editor
- `custom` - Custom component

## Layout Options

### Master Layout Features
- **Pagination** - Server-side or client-side pagination
- **Sorting** - Single or multi-column sorting
- **Filtering** - Column-specific or global filtering
- **Selection** - Single or multi-row selection
- **Export** - CSV, Excel, PDF export options
- **Column Management** - Resize, reorder, show/hide columns

### Details Layout Types
- **Form** - Traditional form layout with field groups
- **Card** - Card-based layout
- **Tabs** - Tabbed interface for organized content
- **Accordion** - Collapsible sections
- **Grid** - Grid-based responsive layout
- **Custom** - Custom layout implementation

## Validation

Fields support comprehensive validation rules:

```json
{
  "validation": {
    "required": true,
    "min": 3,
    "max": 100,
    "pattern": "^[a-zA-Z0-9]+$",
    "custom": "customValidationFunction",
    "messages": {
      "required": "This field is required",
      "pattern": "Invalid format"
    }
  }
}
```

## Conditional Logic

Fields can be shown/hidden based on other field values:

```json
{
  "conditional": {
    "field": "status",
    "operator": "equals",
    "value": "active"
  }
}
```

## Actions

Actions define buttons and their behaviors:

```json
{
  "actions": [
    {
      "id": "save",
      "label": "Save Changes",
      "type": "button",
      "variant": "primary",
      "icon": "pi pi-save",
      "action": "saveFunction",
      "confirm": {
        "title": "Confirm Action",
        "message": "Are you sure?"
      }
    }
  ]
}
```

## Implementation Guide

### 1. Schema Validation
Use the provided JSON schema (`master-details-schema.json`) to validate your configuration files.

### 2. Component Architecture
```javascript
// DynamicMasterDetails component
const DynamicMasterDetails = ({ masterSchema, detailsSchema }) => {
  // Parse schemas and render components dynamically
  return (
    <div className="master-details-container">
      <MasterList schema={masterSchema} onSelect={handleSelect} />
      <DetailsView schema={detailsSchema} selectedItem={selectedItem} />
    </div>
  );
};
```

### 3. Data Flow
1. Load schema configuration
2. Fetch master data based on dataSource
3. Render master list with columns
4. Handle item selection
5. Render details view with fields
6. Handle form submission and actions

### 4. Custom Renderers
For complex field types, implement custom render functions:

```javascript
const customRenderers = {
  avatar: (value) => <Avatar image={value} />,
  currency: (value, format) => new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: format.currency
  }).format(value),
  rating: (value) => <Rating value={value} readOnly />
};
```

## Examples

See the example files:
- `user-management-example.json` - User management interface
- `product-catalog-example.json` - Product catalog interface

## Best Practices

1. **Schema Organization** - Keep schemas in separate files for maintainability
2. **Validation** - Always validate schemas against the main schema
3. **Performance** - Use pagination for large datasets
4. **Accessibility** - Include proper ARIA labels and keyboard navigation
5. **Error Handling** - Implement proper error states and user feedback
6. **Testing** - Test with various data types and edge cases

## Integration

### With React
```jsx
import DynamicMasterDetails from './components/DynamicMasterDetails';
import userSchema from './schemas/user-management.json';

function UserManagement() {
  return (
    <DynamicMasterDetails
      masterSchema={userSchema.masterSchema}
      detailsSchema={userSchema.detailsSchema}
    />
  );
}
```

### With API Integration
```javascript
// API service integration
const apiService = {
  fetchData: (endpoint, params) => axios.get(endpoint, { params }),
  saveData: (endpoint, data) => axios.post(endpoint, data),
  updateData: (endpoint, id, data) => axios.put(`${endpoint}/${id}`, data),
  deleteData: (endpoint, id) => axios.delete(`${endpoint}/${id}`)
};
```

## Security Considerations

1. **Input Validation** - Validate all user inputs on both client and server
2. **XSS Prevention** - Sanitize HTML content and use safe rendering
3. **CSRF Protection** - Include CSRF tokens for state-changing operations
4. **Rate Limiting** - Implement rate limiting for API endpoints
5. **Authentication** - Verify user permissions for data access and modifications

## Future Enhancements

- **Schema Versioning** - Support multiple schema versions
- **Dynamic Imports** - Lazy load components based on schema requirements
- **Real-time Updates** - WebSocket integration for live data updates
- **Offline Support** - Service worker integration for offline functionality
- **Internationalization** - Multi-language support for labels and messages