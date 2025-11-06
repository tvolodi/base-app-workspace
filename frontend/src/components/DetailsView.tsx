import React, { useState, useMemo } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputNumber } from 'primereact/inputnumber';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { MultiSelect } from 'primereact/multiselect';
import { RadioButton } from 'primereact/radiobutton';
import { Checkbox } from 'primereact/checkbox';
import { Password } from 'primereact/password';
import { FileUpload } from 'primereact/fileupload';
import { Avatar } from 'primereact/avatar';
import { Badge } from 'primereact/badge';
import { ProgressBar } from 'primereact/progressbar';
import { Rating } from 'primereact/rating';
import { Slider } from 'primereact/slider';
import { ColorPicker } from 'primereact/colorpicker';
import { Editor } from 'primereact/editor';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Fieldset } from 'primereact/fieldset';
import { TabView, TabPanel } from 'primereact/tabview';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { DetailsViewProps, FieldDefinition, ActionDefinition, FieldGroup } from '../types/master-details-types';

export const DetailsView: React.FC<DetailsViewProps> = ({
  schema,
  data,
  loading,
  error,
  onChange,
  onAction,
  onSubmit
}) => {
  const [formData, setFormData] = useState<any>(data || {});
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Update form data when data prop changes
  React.useEffect(() => {
    setFormData(data || {});
  }, [data]);

  const layout = schema.layout || { type: 'form' };

  const handleFieldChange = (field: string, value: any) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    onChange(field, value);

    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateField = (field: FieldDefinition, value: any): string | null => {
    if (field.required && (value === null || value === undefined || value === '')) {
      return field.validation?.messages?.required || 'This field is required';
    }

    if (field.validation) {
      const { min, max, pattern } = field.validation;

      if (min !== undefined) {
        if (typeof value === 'string' && typeof min === 'number' && value.length < min) {
          return field.validation.messages?.min || `Minimum length is ${min}`;
        }
        if (typeof value === 'number' && typeof min === 'number' && value < min) {
          return field.validation.messages?.min || `Minimum value is ${min}`;
        }
      }

      if (max !== undefined) {
        if (typeof value === 'string' && typeof max === 'number' && value.length > max) {
          return field.validation.messages?.max || `Maximum length is ${max}`;
        }
        if (typeof value === 'number' && typeof max === 'number' && value > max) {
          return field.validation.messages?.max || `Maximum value is ${max}`;
        }
      }

      if (pattern && typeof value === 'string') {
        const regex = new RegExp(pattern);
        if (!regex.test(value)) {
          return field.validation.messages?.pattern || 'Invalid format';
        }
      }
    }

    return null;
  };

  const handleActionClick = (action: ActionDefinition) => {
    if (action.confirm) {
      confirmDialog({
        message: action.confirm.message,
        header: action.confirm.title,
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: action.confirm.acceptLabel || 'Yes',
        rejectLabel: action.confirm.rejectLabel || 'No',
        accept: () => onAction(action.id),
        reject: () => {}
      });
    } else {
      onAction(action.id);
    }
  };

  const renderField = (field: FieldDefinition) => {
    const value = formData[field.key];
    const error = validationErrors[field.key];
    const isDisabled = field.disabled || loading;
    const isReadonly = field.readonly;

    const fieldProps = {
      id: field.key,
      value,
      disabled: isDisabled,
      readOnly: isReadonly,
      placeholder: field.placeholder,
      className: error ? 'p-invalid' : '',
      onChange: (e: any) => {
        let newValue: any;
        if (e.target) {
          newValue = e.target.value;
        } else if (e.value !== undefined) {
          newValue = e.value;
        } else {
          newValue = e;
        }
        handleFieldChange(field.key, newValue);
      }
    };

    let fieldComponent: React.ReactNode;

    switch (field.component || field.type) {
      case 'input':
      case 'text':
        fieldComponent = <InputText {...fieldProps} />;
        break;

      case 'textarea':
        fieldComponent = <InputTextarea {...fieldProps} rows={3} />;
        break;

      case 'inputnumber':
      case 'number':
        fieldComponent = (
          <InputNumber
            {...fieldProps}
            value={value}
            onChange={(e) => handleFieldChange(field.key, e.value)}
          />
        );
        break;

      case 'calendar':
      case 'date':
        fieldComponent = (
          <Calendar
            {...fieldProps}
            value={value ? new Date(value) : null}
            onChange={(e) => handleFieldChange(field.key, e.value)}
            dateFormat="mm/dd/yy"
          />
        );
        break;

      case 'datetime':
        fieldComponent = (
          <Calendar
            {...fieldProps}
            value={value ? new Date(value) : null}
            onChange={(e) => handleFieldChange(field.key, e.value)}
            showTime
            hourFormat="12"
            dateFormat="mm/dd/yy"
          />
        );
        break;

      case 'dropdown':
      case 'select':
        fieldComponent = (
          <Dropdown
            {...fieldProps}
            value={value}
            onChange={(e) => handleFieldChange(field.key, e.value)}
            options={field.options || []}
            optionLabel="label"
            optionValue="value"
          />
        );
        break;

      case 'multiselect':
        fieldComponent = (
          <MultiSelect
            {...fieldProps}
            value={value || []}
            onChange={(e) => handleFieldChange(field.key, e.value)}
            options={field.options || []}
            optionLabel="label"
            optionValue="value"
            maxSelectedLabels={3}
          />
        );
        break;

      case 'radiobutton':
      case 'radio':
        fieldComponent = (
          <div className="flex flex-wrap gap-3">
            {field.options?.map((option) => (
              <div key={option.value} className="flex align-items-center">
                <RadioButton
                  inputId={`${field.key}-${option.value}`}
                  name={field.key}
                  value={option.value}
                  checked={value === option.value}
                  onChange={(e) => handleFieldChange(field.key, e.value)}
                  disabled={isDisabled}
                />
                <label htmlFor={`${field.key}-${option.value}`} className="ml-2">
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        );
        break;

      case 'checkbox':
        if (field.type === 'boolean') {
          fieldComponent = (
            <Checkbox
              {...fieldProps}
              checked={value || false}
              onChange={(e) => handleFieldChange(field.key, e.checked)}
            />
          );
        } else {
          fieldComponent = (
            <div className="flex flex-wrap gap-3">
              {field.options?.map((option) => (
                <div key={option.value} className="flex align-items-center">
                  <Checkbox
                    inputId={`${field.key}-${option.value}`}
                    value={option.value}
                    checked={Array.isArray(value) && value.includes(option.value)}
                    onChange={(e) => {
                      const currentValues = Array.isArray(value) ? value : [];
                      const newValues = e.checked
                        ? [...currentValues, e.value]
                        : currentValues.filter(v => v !== e.value);
                      handleFieldChange(field.key, newValues);
                    }}
                    disabled={isDisabled}
                  />
                  <label htmlFor={`${field.key}-${option.value}`} className="ml-2">
                    {option.label}
                  </label>
                </div>
              ))}
            </div>
          );
        }
        break;

      case 'password':
        fieldComponent = <Password {...fieldProps} />;
        break;

      case 'fileupload':
        fieldComponent = (
          <FileUpload
            mode="basic"
            chooseLabel="Choose File"
            uploadLabel="Upload"
            cancelLabel="Cancel"
            onSelect={(e) => handleFieldChange(field.key, e.files[0])}
            disabled={isDisabled}
          />
        );
        break;

      case 'avatar':
        fieldComponent = (
          <Avatar
            image={value}
            shape="circle"
            size="xlarge"
            label={value ? undefined : 'U'}
          />
        );
        break;

      case 'badge':
        fieldComponent = <Badge value={value} severity="info" />;
        break;

      case 'progressbar':
        fieldComponent = (
          <ProgressBar
            value={typeof value === 'number' ? value : 0}
            showValue={true}
          />
        );
        break;

      case 'rating':
        fieldComponent = (
          <Rating
            value={value || 0}
            onChange={(e) => handleFieldChange(field.key, e.value)}
            disabled={isDisabled}
          />
        );
        break;

      case 'slider':
        fieldComponent = (
          <Slider
            value={value || 0}
            onChange={(e) => handleFieldChange(field.key, e.value)}
            disabled={isDisabled}
          />
        );
        break;

      case 'colorpicker':
        fieldComponent = (
          <ColorPicker
            value={value}
            onChange={(e) => handleFieldChange(field.key, e.value)}
            disabled={isDisabled}
          />
        );
        break;

      case 'editor':
        fieldComponent = (
          <Editor
            value={value}
            onTextChange={(e) => handleFieldChange(field.key, e.htmlValue)}
            style={{ height: '200px' }}
            readOnly={isReadonly}
          />
        );
        break;

      default:
        fieldComponent = <InputText {...fieldProps} />;
    }

    return (
      <div className={`field mb-4 ${field.layout?.col ? `col-${field.layout.col}` : ''}`}>
        <label htmlFor={field.key} className="block font-medium mb-2">
          {field.label}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {fieldComponent}
        {field.help && (
          <small className="block text-600 mt-1">{field.help}</small>
        )}
        {error && (
          <small className="block text-red-500 mt-1">{error}</small>
        )}
      </div>
    );
  };

  const renderFieldGroup = (group: FieldGroup) => {
    const groupFields = schema.fields.filter(field => field.layout?.group === group.id);

    if (groupFields.length === 0) return null;

    return (
      <Fieldset
        key={group.id}
        legend={
          <div className="flex align-items-center">
            {group.icon && <i className={`pi ${group.icon} mr-2`}></i>}
            {group.title}
          </div>
        }
        toggleable={group.collapsible}
        collapsed={group.collapsed}
        className="mb-4"
      >
        <div className="grid">
          {groupFields
            .sort((a, b) => (a.layout?.order || 0) - (b.layout?.order || 0))
            .map(field => renderField(field))}
        </div>
      </Fieldset>
    );
  };

  const renderFormLayout = () => {
    if (layout.groups && layout.groups.length > 0) {
      return layout.groups.map(group => renderFieldGroup(group));
    }

    // Default grid layout
    return (
      <div className="grid">
        {schema.fields.map(field => renderField(field))}
      </div>
    );
  };

  const renderActions = () => {
    if (!schema.actions || schema.actions.length === 0) return null;

    return (
      <div className="flex justify-content-end gap-2 mt-4 pt-4 border-top-1 border-200">
        {schema.actions.map(action => (
          <Button
            key={action.id}
            label={action.label}
            icon={action.icon ? `pi ${action.icon}` : undefined}
            severity={action.variant as any}
            size="small"
            disabled={action.disabled || loading}
            onClick={() => handleActionClick(action)}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="text-center">
          <i className="pi pi-spin pi-spinner text-2xl mb-2"></i>
          <p>Loading details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-500">
        <i className="pi pi-exclamation-triangle text-2xl mb-2 block"></i>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="details-view">
      <ConfirmDialog />

      {layout.type === 'tabs' && layout.groups ? (
        <TabView>
          {layout.groups.map(group => (
            <TabPanel
              key={group.id}
              header={
                <div className="flex align-items-center">
                  {group.icon && <i className={`pi ${group.icon} mr-2`}></i>}
                  {group.title}
                </div>
              }
            >
              <div className="grid">
                {schema.fields
                  .filter(field => field.layout?.group === group.id)
                  .sort((a, b) => (a.layout?.order || 0) - (b.layout?.order || 0))
                  .map(field => renderField(field))}
              </div>
            </TabPanel>
          ))}
        </TabView>
      ) : layout.type === 'accordion' && layout.groups ? (
        <Accordion>
          {layout.groups.map(group => (
            <AccordionTab
              key={group.id}
              header={
                <div className="flex align-items-center">
                  {group.icon && <i className={`pi ${group.icon} mr-2`}></i>}
                  {group.title}
                </div>
              }
            >
              <div className="grid">
                {schema.fields
                  .filter(field => field.layout?.group === group.id)
                  .sort((a, b) => (a.layout?.order || 0) - (b.layout?.order || 0))
                  .map(field => renderField(field))}
              </div>
            </AccordionTab>
          ))}
        </Accordion>
      ) : (
        renderFormLayout()
      )}

      {renderActions()}
    </div>
  );
};

export default DetailsView;