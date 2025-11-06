import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Card } from 'primereact/card';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { useAuth } from '../contexts/AuthContext';

const PrimeReactUserManagement = () => {
  const { authenticated, user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userDialog, setUserDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [globalFilter, setGlobalFilter] = useState('');
  const toast = React.useRef(null);

  // Mock user data - in real app this would come from API
  const mockUsers = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'Active' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User', status: 'Active' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'User', status: 'Inactive' },
    { id: 4, name: 'Alice Brown', email: 'alice@example.com', role: 'Moderator', status: 'Active' },
  ];

  useEffect(() => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setUsers(mockUsers);
      setLoading(false);
    }, 1000);
  }, []);

  const openNew = () => {
    setSelectedUser({ name: '', email: '', role: 'User', status: 'Active' });
    setUserDialog(true);
  };

  const editUser = (user) => {
    setSelectedUser({...user});
    setUserDialog(true);
  };

  const confirmDeleteUser = (user) => {
    confirmDialog({
      message: `Are you sure you want to delete ${user.name}?`,
      header: 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      accept: () => deleteUser(user)
    });
  };

  const deleteUser = (user) => {
    setUsers(users.filter(u => u.id !== user.id));
    toast.current.show({
      severity: 'success',
      summary: 'Success',
      detail: 'User deleted successfully',
      life: 3000
    });
  };

  const saveUser = () => {
    if (selectedUser.id) {
      // Update existing user
      setUsers(users.map(u => u.id === selectedUser.id ? selectedUser : u));
      toast.current.show({
        severity: 'success',
        summary: 'Success',
        detail: 'User updated successfully',
        life: 3000
      });
    } else {
      // Add new user
      const newUser = {...selectedUser, id: Math.max(...users.map(u => u.id)) + 1};
      setUsers([...users, newUser]);
      toast.current.show({
        severity: 'success',
        summary: 'Success',
        detail: 'User created successfully',
        life: 3000
      });
    }
    setUserDialog(false);
    setSelectedUser(null);
  };

  const statusBodyTemplate = (rowData) => {
    return (
      <span className={`badge ${rowData.status === 'Active' ? 'bg-green-500' : 'bg-red-500'} text-white px-2 py-1 border-round`}>
        {rowData.status}
      </span>
    );
  };

  const actionBodyTemplate = (rowData) => {
    return (
      <div className="flex gap-2">
        <Button
          icon="pi pi-pencil"
          className="p-button-rounded p-button-success p-button-text"
          onClick={() => editUser(rowData)}
        />
        <Button
          icon="pi pi-trash"
          className="p-button-rounded p-button-danger p-button-text"
          onClick={() => confirmDeleteUser(rowData)}
        />
      </div>
    );
  };

  const header = (
    <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
      <h3 className="m-0">User Management</h3>
      <div className="flex gap-2">
        <span className="p-input-icon-left">
          <i className="pi pi-search" />
          <InputText
            type="search"
            onInput={(e) => setGlobalFilter(e.target.value)}
            placeholder="Search users..."
          />
        </span>
        <Button
          label="New User"
          icon="pi pi-plus"
          className="p-button-primary"
          onClick={openNew}
        />
      </div>
    </div>
  );

  const userDialogFooter = (
    <div>
      <Button
        label="Cancel"
        icon="pi pi-times"
        className="p-button-text"
        onClick={() => setUserDialog(false)}
      />
      <Button
        label="Save"
        icon="pi pi-check"
        className="p-button-primary"
        onClick={saveUser}
      />
    </div>
  );

  const roles = [
    { label: 'Admin', value: 'Admin' },
    { label: 'Moderator', value: 'Moderator' },
    { label: 'User', value: 'User' }
  ];

  const statuses = [
    { label: 'Active', value: 'Active' },
    { label: 'Inactive', value: 'Inactive' }
  ];

  if (!authenticated) {
    return (
      <Card className="shadow-4">
        <div className="text-center">
          <i className="pi pi-lock text-4xl text-red-500 mb-3"></i>
          <h3>Access Denied</h3>
          <p>You need to be logged in to access user management.</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="p-4">
      <Toast ref={toast} />
      <ConfirmDialog />

      <Card className="shadow-4">
        <DataTable
          value={users}
          paginator
          rows={10}
          rowsPerPageOptions={[5, 10, 25]}
          loading={loading}
          globalFilter={globalFilter}
          header={header}
          emptyMessage="No users found."
          responsiveLayout="scroll"
        >
          <Column field="name" header="Name" sortable style={{ minWidth: '12rem' }} />
          <Column field="email" header="Email" sortable style={{ minWidth: '15rem' }} />
          <Column field="role" header="Role" sortable style={{ minWidth: '10rem' }} />
          <Column
            field="status"
            header="Status"
            body={statusBodyTemplate}
            sortable
            style={{ minWidth: '8rem' }}
          />
          <Column
            body={actionBodyTemplate}
            exportable={false}
            style={{ minWidth: '8rem' }}
          />
        </DataTable>
      </Card>

      <Dialog
        visible={userDialog}
        style={{ width: '450px' }}
        header={selectedUser?.id ? 'Edit User' : 'New User'}
        modal
        className="p-fluid"
        footer={userDialogFooter}
        onHide={() => setUserDialog(false)}
      >
        <div className="field mb-3">
          <label htmlFor="name" className="block text-900 font-medium mb-2">Name</label>
          <InputText
            id="name"
            value={selectedUser?.name || ''}
            onChange={(e) => setSelectedUser({...selectedUser, name: e.target.value})}
            required
            autoFocus
          />
        </div>

        <div className="field mb-3">
          <label htmlFor="email" className="block text-900 font-medium mb-2">Email</label>
          <InputText
            id="email"
            value={selectedUser?.email || ''}
            onChange={(e) => setSelectedUser({...selectedUser, email: e.target.value})}
            required
          />
        </div>

        <div className="field mb-3">
          <label htmlFor="role" className="block text-900 font-medium mb-2">Role</label>
          <Dropdown
            id="role"
            value={selectedUser?.role}
            options={roles}
            onChange={(e) => setSelectedUser({...selectedUser, role: e.value})}
            placeholder="Select a role"
          />
        </div>

        <div className="field mb-3">
          <label htmlFor="status" className="block text-900 font-medium mb-2">Status</label>
          <Dropdown
            id="status"
            value={selectedUser?.status}
            options={statuses}
            onChange={(e) => setSelectedUser({...selectedUser, status: e.value})}
            placeholder="Select status"
          />
        </div>
      </Dialog>
    </div>
  );
};

export default PrimeReactUserManagement;