// TypeScript interfaces for Dynamic Master-Details Component Schema
// Generated from master-details-schema.json

export interface MasterDetailsSchema {
  masterSchema: MasterSchema;
  detailsSchema: DetailsSchema;
}

export interface MasterSchema {
  id: string;
  title: string;
  description?: string;
  dataSource: DataSource;
  columns: ColumnDefinition[];
  features?: MasterFeatures;
  styling?: Styling;
}

export interface DetailsSchema {
  id: string;
  title: string;
  description?: string;
  layout?: Layout;
  fields: FieldDefinition[];
  actions?: ActionDefinition[];
  styling?: Styling;
}

export interface DataSource {
  type: 'api' | 'static' | 'mock';
  endpoint?: string;
  method?: 'GET' | 'POST';
  data?: any[];
  transform?: string;
  pagination?: boolean;
  pageSize?: number;
}

export interface ColumnDefinition {
  key: string;
  title: string;
  type: 'text' | 'number' | 'date' | 'boolean' | 'currency' | 'email' | 'phone' | 'badge' | 'avatar' | 'icon' | 'image' | 'custom';
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  format?: ColumnFormat;
  hidden?: boolean;
  render?: string;
}

export interface ColumnFormat {
  currency?: 'USD' | 'EUR' | 'GBP' | 'JPY';
  dateFormat?: string;
  decimalPlaces?: number;
  prefix?: string;
  suffix?: string;
}

export interface FieldDefinition {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'date' | 'datetime' | 'boolean' | 'select' | 'multiselect' | 'radio' | 'checkbox' | 'email' | 'phone' | 'url' | 'password' | 'file' | 'image' | 'avatar' | 'badge' | 'progress' | 'rating' | 'slider' | 'color' | 'json' | 'code' | 'markdown' | 'html' | 'custom';
  component?: string;
  required?: boolean;
  readonly?: boolean;
  disabled?: boolean;
  placeholder?: string;
  help?: string;
  validation?: ValidationRules;
  options?: SelectOption[];
  layout?: FieldLayout;
  dependencies?: string[];
  conditional?: ConditionalLogic;
  render?: string;
}

export interface ValidationRules {
  min?: number | string;
  max?: number | string;
  pattern?: string;
  custom?: string;
  messages?: {
    required?: string;
    min?: string;
    max?: string;
    pattern?: string;
    custom?: string;
  };
}

export interface SelectOption {
  label: string;
  value: any;
  disabled?: boolean;
}

export interface FieldLayout {
  col?: number;
  offset?: number;
  group?: string;
  order?: number;
}

export interface ConditionalLogic {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'is_empty' | 'is_not_empty';
  value?: any;
}

export interface ActionDefinition {
  id: string;
  label: string;
  type?: 'button' | 'link' | 'icon';
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'help';
  icon?: string;
  action?: string;
  href?: string;
  target?: '_blank' | '_self' | '_parent' | '_top';
  disabled?: boolean;
  visible?: boolean;
  confirm?: ConfirmationDialog;
}

export interface ConfirmationDialog {
  title: string;
  message: string;
  acceptLabel?: string;
  rejectLabel?: string;
}

export interface MasterFeatures {
  searchable?: boolean;
  sortable?: boolean;
  filterable?: boolean;
  exportable?: boolean;
  selectable?: boolean;
  multiSelect?: boolean;
  refreshable?: boolean;
  columnResize?: boolean;
  columnReorder?: boolean;
}

export interface Layout {
  type?: 'form' | 'card' | 'tabs' | 'accordion' | 'grid' | 'custom';
  columns?: number;
  groups?: FieldGroup[];
  spacing?: 'none' | 'small' | 'medium' | 'large';
}

export interface FieldGroup {
  id: string;
  title: string;
  icon?: string;
  collapsible?: boolean;
  collapsed?: boolean;
}

export interface Styling {
  className?: string;
  style?: Record<string, any>;
  theme?: string;
}

// Utility types for component implementation
export interface MasterListProps {
  schema: MasterSchema;
  data: any[];
  loading?: boolean;
  error?: string;
  onSelect: (item: any) => void;
  onSort?: (field: string, direction: 'asc' | 'desc') => void;
  onFilter?: (filters: Record<string, any>) => void;
  onPageChange?: (page: number, pageSize: number) => void;
}

export interface DetailsViewProps {
  schema: DetailsSchema;
  data: any;
  loading?: boolean;
  error?: string;
  onChange: (field: string, value: any) => void;
  onAction: (actionId: string) => void;
  onSubmit?: (data: any) => void;
}

export interface DynamicMasterDetailsProps {
  masterSchema: MasterSchema;
  detailsSchema: DetailsSchema;
  className?: string;
}

// Data transformation utilities
export type DataTransformer = (data: any[]) => any[];
export type FieldRenderer = (value: any, field: FieldDefinition, data: any) => React.ReactNode;
export type ActionHandler = (actionId: string, data: any) => void | Promise<void>;
export type ValidationFunction = (value: any, field: FieldDefinition) => boolean | string;

// Configuration for custom renderers and handlers
export interface ComponentConfig {
  customRenderers?: Record<string, FieldRenderer>;
  customValidators?: Record<string, ValidationFunction>;
  actionHandlers?: Record<string, ActionHandler>;
  dataTransformers?: Record<string, DataTransformer>;
  apiService?: {
    fetch: (endpoint: string, params?: any) => Promise<any>;
    create: (endpoint: string, data: any) => Promise<any>;
    update: (endpoint: string, id: string, data: any) => Promise<any>;
    delete: (endpoint: string, id: string) => Promise<any>;
  };
}