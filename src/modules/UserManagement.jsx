import React, { useState } from 'react';
import { Shield, ShieldAlert, ShieldCheck, UserPlus, Users } from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';
import Modal from '../components/Modal';
import Input, { Select } from '../components/Input';
import Table from '../components/Table';
import Badge from '../components/Badge';

export const UserManagement = ({
  users = [],
  setUsers,
  rolePermissions = {},
  setRolePermissions,
  addToast,
  auditLogs = [],
  setAuditLogs
}) => {
  const [inviteModal, setInviteModal] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Store Manager');

  // List of all accessible modules
  const modulesKeys = [
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'products', label: 'Products' },
    { key: 'categories', label: 'Categories' },
    { key: 'brands', label: 'Brands' },
    { key: 'inventory', label: 'Inventory' },
    { key: 'orders', label: 'Orders' },
    { key: 'customers', label: 'Customers' },
    { key: 'coupons', label: 'Coupons' },
    { key: 'delivery', label: 'Delivery' },
    { key: 'cms', label: 'CMS' },
    { key: 'blogs', label: 'Blogs' },
    { key: 'recipes', label: 'Recipes' },
    { key: 'whatsapp', label: 'WhatsApp' },
    { key: 'reports', label: 'Reports' },
    { key: 'settings', label: 'Settings' },
    { key: 'user_management', label: 'Users' },
    { key: 'security', label: 'Security' }
  ];

  const handleInviteSubmit = (e) => {
    e.preventDefault();
    if (!inviteName || !inviteEmail) {
      addToast('Name and email are required', 'danger');
      return;
    }

    const newUser = {
      id: `usr-${Date.now()}`,
      name: inviteName,
      email: inviteEmail,
      role: inviteRole,
      status: 'Active',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
    };

    setUsers([...users, newUser]);
    addToast(`Invitation link sent to ${inviteEmail}`, 'success');

    setAuditLogs([
      {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        user: 'Director David',
        action: 'User Invited',
        module: 'User Management',
        detail: `Invited new team member: ${inviteName} (${inviteRole})`
      },
      ...auditLogs
    ]);

    setInviteModal(false);
    setInviteName('');
    setInviteEmail('');
  };

  const handleTogglePermission = (roleName, modKey) => {
    const updated = {
      ...rolePermissions,
      [roleName]: {
        ...rolePermissions[roleName],
        [modKey]: !rolePermissions[roleName][modKey]
      }
    };
    setRolePermissions(updated);
    addToast(`Permission for ${roleName} - ${modKey} toggled`, 'info');

    setAuditLogs([
      {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        user: 'Director David',
        action: 'Permission Rule Altered',
        module: 'User Management',
        detail: `Toggled module permission: ${modKey} for role ${roleName}`
      },
      ...auditLogs
    ]);
  };

  const toggleUserStatus = (id) => {
    setUsers(users.map(u => {
      if (u.id === id) {
        const nextStatus = u.status === 'Active' ? 'Inactive' : 'Active';
        addToast(`User ${u.name} marked as ${nextStatus}`, 'warning');
        return { ...u, status: nextStatus };
      }
      return u;
    }));
  };

  const userCols = [
    {
      key: 'name',
      label: 'Staff Member',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src={row.avatar} alt={row.name} style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontWeight: '600' }}>{row.name}</span>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{row.email}</span>
          </div>
        </div>
      )
    },
    { key: 'role', label: 'Assigned Role' },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <Badge variant={row.status === 'Active' ? 'success' : 'secondary'}>{row.status}</Badge>
    },
    {
      key: 'actions',
      label: '',
      render: (row) => (
        <Button variant="outline" size="sm" onClick={() => toggleUserStatus(row.id)}>
          Toggle Status
        </Button>
      )
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '700', letterSpacing: '-0.02em', margin: 0 }}>User Roles & Access Control (RBAC)</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Invite storefront operators, adjust role categories, and enforce module permission matrix filters.</p>
        </div>
        <Button variant="primary" size="sm" icon={UserPlus} onClick={() => setInviteModal(true)}>
          Invite Team User
        </Button>
      </div>

      {/* Staff directory */}
      <Card title="FreshCart Operating Staff Directory" icon={Users}>
        <div style={{ marginTop: '12px' }}>
          <Table
            columns={userCols}
            data={users}
            initialRowsPerPage={5}
          />
        </div>
      </Card>

      {/* Permissions Matrix sheet */}
      <Card title="Enterprise Module Permissions Matrix" actions={<span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Changes apply immediately to sidebar navigation rules</span>}>
        <div style={{ overflowX: 'auto', marginTop: '12px' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              textAlign: 'left',
              fontSize: '13px'
            }}
          >
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-app)' }}>
                <th style={{ padding: '12px 16px', fontWeight: 'bold' }}>System Module</th>
                {Object.keys(rolePermissions).map(role => (
                  <th key={role} style={{ padding: '12px 16px', fontWeight: 'bold', textAlign: 'center' }}>{role}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {modulesKeys.map((mod) => (
                <tr key={mod.key} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '10px 16px', fontWeight: '600' }}>{mod.label}</td>
                  {Object.keys(rolePermissions).map((role) => {
                    const hasPerm = rolePermissions[role][mod.key];
                    return (
                      <td key={role} style={{ padding: '10px 16px', textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={!!hasPerm}
                          onChange={() => handleTogglePermission(role, mod.key)}
                          style={{
                            accentColor: 'var(--primary)',
                            cursor: 'pointer',
                            width: '16px',
                            height: '16px'
                          }}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Invite Modal dialog */}
      <Modal
        isOpen={inviteModal}
        onClose={() => setInviteModal(false)}
        title="Invite New Staff Operator"
        footer={
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button variant="outline" size="sm" onClick={() => setInviteModal(false)}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={handleInviteSubmit}>Send Invite Link</Button>
          </div>
        }
      >
        <form onSubmit={handleInviteSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Input label="Full Name" value={inviteName} onChange={(e) => setInviteName(e.target.value)} placeholder="e.g. Rachel Adams" />
          <Input label="Business Email" type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="rachel@freshcart.com" />
          <Select label="Role Assignment" value={inviteRole} onChange={(e) => setInviteRole(e.target.value)} options={Object.keys(rolePermissions)} />
        </form>
      </Modal>

    </div>
  );
};
export default UserManagement;
