import React, { useState, useMemo } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { MultiSelect } from 'primereact/multiselect';
import { Avatar } from 'primereact/avatar';
import { Badge } from 'primereact/badge';
import { ProgressBar } from 'primereact/progressbar';
import { Skeleton } from 'primereact/skeleton';
import { MasterListProps, ColumnDefinition } from '../types/master-details-types';

export const MasterList: React.FC<MasterListProps> = ({
  schema,
  data,
  loading,
  error,
  onSelect,
  onSort,
  onFilter,
  onPageChange
}) => {
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [globalFilter, setGlobalFilter] = useState('');
  const [sortField, setSortField] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<1 | -1 | 0 | null | undefined>(null);
  const [filters, setFilters] = useState<Record<string, any>>({});

  const features = schema.features || {};

  // Render column based on type
  const renderColumn = (column: ColumnDefinition) => {
    const columnProps: any = {
      key: column.key,
      field: column.key,
      header: column.title,
      sortable: features.sortable && column.sortable,
      filter: features.filterable && column.filterable,
      style: column.width ? { width: column.width } : undefined,
      align: column.align || 'left',
      hidden: column.hidden
    };

    // Custom body template based on column type
    if (column.render) {
      // TODO: Implement custom renderers
      columnProps.body = (rowData: any) => (
        <span>{rowData[column.key]}</span>
      );
    } else {
      columnProps.body = (rowData: any) => renderCellValue(rowData[column.key], column);
    }

    return <Column {...columnProps} />;
  };

  const renderCellValue = (value: any, column: ColumnDefinition) => {
    if (value === null || value === undefined) {
      return <span className="text-500">-</span>;
    }

    switch (column.type) {
      case 'text':
      case 'email':
      case 'phone':
        return <span>{value}</span>;

      case 'number':
        return <span>{typeof value === 'number' ? value.toLocaleString() : value}</span>;

      case 'currency':
        const currency = column.format?.currency || 'USD';
        return (
          <span>
            {column.format?.prefix || ''}
            {typeof value === 'number' ? value.toLocaleString('en-US', {
              style: 'currency',
              currency
            }) : value}
            {column.format?.suffix || ''}
          </span>
        );

      case 'date':
        const dateValue = new Date(value);
        const dateFormat = column.format?.dateFormat || 'MM/DD/YYYY';
        return <span>{dateValue.toLocaleDateString()}</span>;

      case 'datetime':
        const datetimeValue = new Date(value);
        return <span>{datetimeValue.toLocaleString()}</span>;

      case 'boolean':
        return (
          <Badge
            value={value ? 'Yes' : 'No'}
            severity={value ? 'success' : 'danger'}
          />
        );

      case 'badge':
        return <Badge value={value} severity="info" />;

      case 'avatar':
        return (
          <Avatar
            image={value}
            shape="circle"
            size="normal"
            label={value ? undefined : 'U'}
          />
        );

      case 'icon':
        return <i className={`pi ${value}`} />;

      case 'progress':
        return (
          <ProgressBar
            value={typeof value === 'number' ? value : 0}
            showValue={false}
            style={{ height: '8px' }}
          />
        );

      default:
        return <span>{String(value)}</span>;
    }
  };

  const handleSelectionChange = (e: any) => {
    setSelectedItem(e.value);
    if (e.value && onSelect) {
      onSelect(e.value);
    }
  };

  const handleSort = (e: any) => {
    setSortField(e.sortField);
    setSortOrder(e.sortOrder);
    if (onSort) {
      onSort(e.sortField, e.sortOrder === 1 ? 'asc' : 'desc');
    }
  };

  const handleFilter = (column: ColumnDefinition, value: any) => {
    const newFilters = { ...filters, [column.key]: value };
    setFilters(newFilters);
    if (onFilter) {
      onFilter(newFilters);
    }
  };

  const clearFilters = () => {
    setFilters({});
    setGlobalFilter('');
    if (onFilter) {
      onFilter({});
    }
  };

  const refreshData = () => {
    // TODO: Implement refresh logic
    console.log('Refreshing data...');
  };

  // Filter data based on global filter and column filters
  const filteredData = useMemo(() => {
    if (!globalFilter && Object.keys(filters).length === 0) {
      return data;
    }

    return data.filter(item => {
      // Global filter
      if (globalFilter) {
        const searchValue = globalFilter.toLowerCase();
        const matchesGlobal = schema.columns.some(column => {
          const value = item[column.key];
          return value && String(value).toLowerCase().includes(searchValue);
        });
        if (!matchesGlobal) return false;
      }

      // Column filters
      for (const [key, filterValue] of Object.entries(filters)) {
        if (filterValue !== null && filterValue !== undefined && filterValue !== '') {
          const itemValue = item[key];
          if (itemValue !== filterValue) {
            return false;
          }
        }
      }

      return true;
    });
  }, [data, globalFilter, filters, schema.columns]);

  if (loading) {
    return (
      <div className="p-4">
        <Skeleton height="2rem" className="mb-3" />
        <Skeleton height="2rem" className="mb-3" />
        <Skeleton height="2rem" className="mb-3" />
        <Skeleton height="2rem" className="mb-3" />
        <Skeleton height="2rem" className="mb-3" />
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
    <div className="master-list">
      {/* Toolbar */}
      {(features.searchable || features.filterable || features.refreshable) && (
        <div className="flex align-items-center justify-content-between mb-3 p-3 bg-gray-50 border-round">
          <div className="flex align-items-center gap-2">
            {features.searchable && (
              <div className="p-input-icon-left">
                <i className="pi pi-search" />
                <InputText
                  value={globalFilter}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  placeholder="Search..."
                  className="w-full"
                  style={{ minWidth: '200px' }}
                />
              </div>
            )}

            {Object.keys(filters).length > 0 && (
              <Button
                icon="pi pi-filter-slash"
                label="Clear Filters"
                size="small"
                text
                onClick={clearFilters}
              />
            )}
          </div>

          <div className="flex align-items-center gap-2">
            {features.refreshable && (
              <Button
                icon="pi pi-refresh"
                size="small"
                text
                onClick={refreshData}
                tooltip="Refresh data"
              />
            )}
          </div>
        </div>
      )}

      {/* Data Table */}
      {React.createElement(DataTable as any, {
        value: filteredData,
        selection: selectedItem,
        onSelectionChange: handleSelectionChange,
        selectionMode: features.multiSelect ? 'multiple' : 'single',
        onSort: handleSort,
        sortField: sortField,
        sortOrder: sortOrder,
        paginator: schema.dataSource.pagination,
        rows: schema.dataSource.pageSize || 10,
        rowsPerPageOptions: [5, 10, 25, 50],
        onPage: onPageChange,
        responsiveLayout: "scroll",
        className: "p-datatable-sm",
        emptyMessage: "No data found",
        loading: loading,
        resizableColumns: features.columnResize,
        reorderableColumns: features.columnReorder,
        scrollable: true,
        scrollHeight: "flex",
        dataKey: "id"
      },
        schema.columns.map(column => renderColumn(column))
      )}

      {/* Footer info */}
      <div className="mt-2 text-sm text-600 text-center">
        {filteredData.length} of {data.length} items
        {globalFilter && ` (filtered from "${globalFilter}")`}
      </div>
    </div>
  );
};

export default MasterList;