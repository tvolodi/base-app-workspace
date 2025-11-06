import React from 'react';
import { Card } from 'primereact/card';
import DynamicMasterDetails from '../components/DynamicMasterDetails';
import userManagementSchema from '../schemas/user-management-example.json';

const MasterDetailsDemo: React.FC = () => {
  return (
    <div className="master-details-demo p-4">
      <Card className="shadow-4">
        <DynamicMasterDetails
          masterSchema={userManagementSchema.masterSchema as any}
          detailsSchema={userManagementSchema.detailsSchema as any}
          className="border-round-lg"
        />
      </Card>
    </div>
  );
};

export default MasterDetailsDemo;