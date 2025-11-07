import React, { useState, useEffect, useCallback } from 'react';
import { Card } from 'primereact/card';
import { Splitter, SplitterPanel } from 'primereact/splitter';
import { ScrollPanel } from 'primereact/scrollpanel';
import { Message } from 'primereact/message';
import { MasterList } from './MasterList';
import { DetailsView } from './DetailsView';
import {
  DynamicMasterDetailsProps
} from '../types/master-details-types';
import api from '../services/api';

interface DynamicMasterDetailsState {
  masterData: any[];
  selectedItem: any;
  loading: boolean;
  error: string | null;
  masterLoading: boolean;
  detailsLoading: boolean;
  modifiedData: Record<string, any>;
}

export const DynamicMasterDetails: React.FC<DynamicMasterDetailsProps> = ({
  masterSchema,
  detailsSchema,
  className
}) => {
  const [state, setState] = useState<DynamicMasterDetailsState>({
    masterData: [],
    selectedItem: null,
    loading: false,
    error: null,
    masterLoading: false,
    detailsLoading: false,
    modifiedData: {}
  });

  const loadMasterData = useCallback(async () => {
    setState(prev => ({ ...prev, masterLoading: true, error: null }));

    try {
      let data: any[] = [];

      switch (masterSchema.dataSource.type) {
        case 'api':
          // TODO: Implement API data loading
          data = await loadFromApi(masterSchema.dataSource);
          break;
        case 'static':
          data = masterSchema.dataSource.data || [];
          break;
        case 'mock':
          data = generateMockData(masterSchema);
          break;
        default:
          throw new Error(`Unsupported data source type: ${masterSchema.dataSource.type}`);
      }

      setState(prev => ({
        ...prev,
        masterData: data,
        masterLoading: false
      }));
    } catch (error) {
      console.error('Error loading master data:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load data',
        masterLoading: false
      }));
    }
  }, [masterSchema]);

  // Load master data on component mount
  useEffect(() => {
    loadMasterData();
  }, [loadMasterData]);

  const loadData = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, masterLoading: true, error: null }));

      let data: any[] = [];
      const { type } = masterSchema.dataSource;

      switch (type) {
        case 'api':
          data = await loadFromApi(masterSchema.dataSource);
          break;
        case 'static':
          data = masterSchema.dataSource.data || [];
          break;
        case 'mock':
        default:
          data = generateMockData(masterSchema);
          break;
      }

      setState(prev => ({
        ...prev,
        masterData: data,
        masterLoading: false
      }));
    } catch (error) {
      console.error('Failed to load data:', error);
      setState(prev => ({
        ...prev,
        error: error.message || 'Failed to load data',
        masterLoading: false
      }));
    }
  }, [masterSchema]);

  const loadFromApi = async (dataSource: any): Promise<any[]> => {
    try {
      const { endpoint, method = 'GET', params = {} } = dataSource;

      let response;
      switch (method.toUpperCase()) {
        case 'GET':
          response = await api.get(endpoint, { params });
          break;
        case 'POST':
          response = await api.post(endpoint, params);
          break;
        case 'PUT':
          response = await api.put(endpoint, params);
          break;
        case 'DELETE':
          response = await api.delete(endpoint, { params });
          break;
        default:
          throw new Error(`Unsupported HTTP method: ${method}`);
      }

      // Assume the response data is an array or has a data property that is an array
      const data = response.data;
      return Array.isArray(data) ? data : data.data || [];
    } catch (error) {
      console.error('API call failed:', error);
      throw new Error(`Failed to load data from API: ${error.message || 'Unknown error'}`);
    }
  };

  const generateMockData = (schema: any): any[] => {
    const mockData: any[] = [];
    const count = 25; // Generate 25 mock items

    for (let i = 1; i <= count; i++) {
      const item: any = { id: i };

      // Generate mock data based on column definitions
      schema.columns.forEach((column: any) => {
        switch (column.type) {
          case 'text':
            item[column.key] = `${column.title} ${i}`;
            break;
          case 'number':
            item[column.key] = i;
            break;
          case 'email':
            item[column.key] = `user${i}@example.com`;
            break;
          case 'date':
            item[column.key] = new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            break;
          case 'datetime':
            item[column.key] = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString();
            break;
          case 'boolean':
            item[column.key] = Math.random() > 0.5;
            break;
          case 'badge':
            const badges = ['Active', 'Inactive', 'Pending', 'Suspended'];
            item[column.key] = badges[Math.floor(Math.random() * badges.length)];
            break;
          case 'avatar':
            item[column.key] = `https://i.pravatar.cc/40?u=${i}`;
            break;
          default:
            item[column.key] = `${column.key} ${i}`;
        }
      });

      mockData.push(item);
    }

    return mockData;
  };

  const handleItemSelect = (item: any) => {
    setState(prev => ({ ...prev, selectedItem: item, detailsLoading: true }));

    // Simulate loading details
    setTimeout(() => {
      setState(prev => ({ ...prev, detailsLoading: false }));
    }, 500);
  };

  const handleAction = async (actionId: string) => {
    if (!state.selectedItem) {
      console.warn('No item selected for action:', actionId);
      return;
    }

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      switch (actionId) {
        case 'save':
          await handleSave();
          break;
        case 'delete':
          await handleDelete();
          break;
        case 'create':
          await handleCreate();
          break;
        case 'refresh':
          await loadData();
          break;
        default:
          // Check if it's a custom action defined in the schema
          const action = detailsSchema.actions?.find(a => a.id === actionId);
          if (action) {
            await handleCustomAction(action);
          } else {
            console.warn(`Unknown action: ${actionId}`);
          }
      }
    } catch (error) {
      console.error(`Action ${actionId} failed:`, error);
      setState(prev => ({
        ...prev,
        error: error.message || `Failed to ${actionId} item`,
        loading: false
      }));
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const handleSave = async () => {
    const { endpoint } = masterSchema.dataSource;
    if (!endpoint) {
      throw new Error('No endpoint configured for save action');
    }

    const dataToSave = { ...state.selectedItem, ...state.modifiedData };
    const url = endpoint.replace(':id', state.selectedItem.id);

    const response = await api.put(url, dataToSave);

    // Update the item in the master data
    setState(prev => ({
      ...prev,
      masterData: prev.masterData.map(item =>
        item.id === state.selectedItem.id ? response.data : item
      ),
      selectedItem: response.data,
      modifiedData: {}
    }));
  };

  const handleDelete = async () => {
    const { endpoint } = masterSchema.dataSource;
    if (!endpoint) {
      throw new Error('No endpoint configured for delete action');
    }

    const url = endpoint.replace(':id', state.selectedItem.id);

    await api.delete(url);

    // Remove the item from master data
    setState(prev => ({
      ...prev,
      masterData: prev.masterData.filter(item => item.id !== state.selectedItem.id),
      selectedItem: null,
      modifiedData: {}
    }));
  };

  const handleCreate = async () => {
    const { endpoint } = masterSchema.dataSource;
    if (!endpoint) {
      throw new Error('No endpoint configured for create action');
    }

    const dataToCreate = state.modifiedData;
    const response = await api.post(endpoint, dataToCreate);

    // Add the new item to master data
    setState(prev => ({
      ...prev,
      masterData: [response.data, ...prev.masterData],
      selectedItem: response.data,
      modifiedData: {}
    }));
  };

  const handleCustomAction = async (action: any) => {
    if (action.href) {
      // Handle navigation actions
      if (action.target === '_blank') {
        window.open(action.href.replace(':id', state.selectedItem.id), '_blank');
      } else {
        window.location.href = action.href.replace(':id', state.selectedItem.id);
      }
    } else if (action.action) {
      // Handle custom actions (could be API calls or other logic)
      console.log('Custom action:', action.action, state.selectedItem);
      // TODO: Implement custom action logic based on action.action
    }
  };

  const handleDetailsChange = (field: string, value: any) => {
    setState(prev => ({
      ...prev,
      modifiedData: {
        ...prev.modifiedData,
        [field]: value
      }
    }));
  };

  const renderContent = () => {
    if (state.error) {
      return (
        <Message
          severity="error"
          text={state.error}
          className="w-full"
        />
      );
    }

    return (
      <Splitter style={{ height: '100%' }} className="border-round-lg overflow-hidden">
        <SplitterPanel size={40} minSize={30} className="p-0">
          <Card
            title={masterSchema.title}
            subTitle={masterSchema.description}
            className="h-full border-round-none border-right-1 border-300"
          >
            <ScrollPanel style={{ height: 'calc(100% - 80px)' }}>
              <MasterList
                schema={masterSchema}
                data={state.masterData}
                loading={state.masterLoading}
                onSelect={handleItemSelect}
              />
            </ScrollPanel>
          </Card>
        </SplitterPanel>

        <SplitterPanel size={60} minSize={40} className="p-0">
          <Card
            title={state.selectedItem ? detailsSchema.title : 'Select an item'}
            subTitle={state.selectedItem ? detailsSchema.description : 'Choose an item from the list to view details'}
            className="h-full border-round-none"
          >
            <ScrollPanel style={{ height: 'calc(100% - 80px)' }}>
              {state.selectedItem ? (
                <DetailsView
                  schema={detailsSchema}
                  data={state.selectedItem}
                  loading={state.detailsLoading}
                  onChange={handleDetailsChange}
                  onAction={handleAction}
                />
              ) : (
                <div className="flex align-items-center justify-content-center h-full text-500">
                  <div className="text-center">
                    <i className="pi pi-info-circle text-4xl mb-3 block"></i>
                    <p>Select an item from the list to view its details</p>
                  </div>
                </div>
              )}
            </ScrollPanel>
          </Card>
        </SplitterPanel>
      </Splitter>
    );
  };

  return (
    <div className={`dynamic-master-details ${className || ''}`} style={{ height: '100vh' }}>
      {renderContent()}
    </div>
  );
};

export default DynamicMasterDetails;