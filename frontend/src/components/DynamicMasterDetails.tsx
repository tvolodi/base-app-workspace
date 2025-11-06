import React, { useState, useEffect, useMemo } from 'react';
import { Card } from 'primereact/card';
import { Splitter, SplitterPanel } from 'primereact/splitter';
import { ScrollPanel } from 'primereact/scrollpanel';
import { Message } from 'primereact/message';
import { MasterList } from './MasterList';
import { DetailsView } from './DetailsView';
import {
  DynamicMasterDetailsProps,
  MasterDetailsSchema,
  ComponentConfig
} from '../types/master-details-types';

interface DynamicMasterDetailsState {
  masterData: any[];
  selectedItem: any;
  loading: boolean;
  error: string | null;
  masterLoading: boolean;
  detailsLoading: boolean;
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
    detailsLoading: false
  });

  // Load master data on component mount
  useEffect(() => {
    loadMasterData();
  }, [masterSchema]);

  const loadMasterData = async () => {
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
  };

  const loadFromApi = async (dataSource: any): Promise<any[]> => {
    // TODO: Implement actual API call using the configured API service
    // For now, return mock data
    return generateMockData(masterSchema);
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

  const handleDetailsChange = (field: string, value: any) => {
    if (state.selectedItem) {
      setState(prev => ({
        ...prev,
        selectedItem: {
          ...prev.selectedItem,
          [field]: value
        }
      }));
    }
  };

  const handleAction = async (actionId: string) => {
    console.log(`Action triggered: ${actionId}`, state.selectedItem);

    // TODO: Implement action handlers based on schema configuration
    switch (actionId) {
      case 'save':
        // TODO: Save changes
        console.log('Saving item:', state.selectedItem);
        break;
      case 'delete':
        // TODO: Delete item
        console.log('Deleting item:', state.selectedItem);
        break;
      default:
        console.log(`Unknown action: ${actionId}`);
    }
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