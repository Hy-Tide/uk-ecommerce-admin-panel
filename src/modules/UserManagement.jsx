import React, { useState, useEffect } from 'react';
import {
  Shield, ShieldAlert, ShieldCheck, UserPlus, Users, Plus, Trash2, Edit,
  Lock, CheckCircle, Info, RefreshCw, Key, Mail, Calendar, UserCheck,
  Search, Sliders, Layers, Award
} from 'lucide-react';
import Button from '../components/Button';
import Card, { StatsCard } from '../components/Card';
import Modal from '../components/Modal';
import Input, { Select, Textarea } from '../components/Input';
import ListView from '../components/ListView';
import GridView from '../components/GridView';
import ViewToggle from '../components/ViewToggle';
import Badge from '../components/Badge';
import {
  fetchRoles,
  createRole,
  updateRole,
  deleteRole,
  fetchAdminUsers,
  updateAdminUser,
  deleteAdminUser
} from '../services/api';

const AVAILABLE_PERMISSIONS = [
  { key: '*', label: 'Full Access (* All Permissions)' },
  { key: 'manage_products', label: 'Manage Products' },
  { key: 'manage_categories', label: 'Manage Categories' },
  { key: 'manage_brands', label: 'Manage Brands' },
  { key: 'manage_inventory', label: 'Manage Inventory' },
  { key: 'manage_orders', label: 'Manage Orders' },
  { key: 'manage_customers', label: 'Manage Customers' },
  { key: 'manage_enquiries', label: 'Manage Enquiries' },
  { key: 'manage_coupons', label: 'Manage Coupons' },
  { key: 'manage_offers', label: 'Manage Offers & Deals' },
  { key: 'manage_notifications', label: 'Manage Push Notifications' },
  { key: 'manage_deliveries', label: 'Manage Deliveries' },
  { key: 'manage_cms', label: 'Manage CMS & Home Config' },
  { key: 'manage_banners', label: 'Manage Website Banners' },
  { key: 'manage_blogs', label: 'Manage Blog Posts' },
  { key: 'manage_testimonials', label: 'Manage Customer Testimonials' },
  { key: 'manage_recipes', label: 'Manage Recipes' },
  { key: 'manage_whatsapp', label: 'Manage WhatsApp Campaigns' },
  { key: 'view_reports', label: 'View Analytics Reports' },
  { key: 'manage_payments', label: 'Manage Admin Payments & Stripe Refunds' },
  { key: 'manage_settings', label: 'Manage System Settings' },
  { key: 'manage_users', label: 'Manage Operating Staff Users' }
];

export const UserManagement = ({
  users: propUsers = [],
  setUsers: setPropUsers,
  addToast,
  auditLogs = [],
  setAuditLogs
}) => {
  const [activeTab, setActiveTab] = useState('users');
  const [adminUsers, setAdminUsers] = useState(propUsers);
  const [roles, setRoles] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [submittingRole, setSubmittingRole] = useState(false);
  const [submittingUser, setSubmittingUser] = useState(false);
  const [userSearch, setUserSearch] = useState('');

  // View Mode
  const [viewMode, setViewMode] = useState(() => localStorage.getItem('view-mode-users') || 'list');

  // Create / Edit Role Modal
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [roleName, setRoleName] = useState('');
  const [roleDescription, setRoleDescription] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState([]);

  // Edit Staff User Modal
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [uName, setUName] = useState('');
  const [uEmail, setUEmail] = useState('');
  const [uStatus, setUStatus] = useState('active');
  const [uRoleId, setURoleId] = useState('');

  const handleViewChange = (newView) => {
    setViewMode(newView);
    localStorage.setItem('view-mode-users', newView);
  };

  // Load live admin users from GET /admin/users
  const loadAdminUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await fetchAdminUsers();
      if (res && res.success !== false) {
        const uList = res.data || (Array.isArray(res) ? res : []);
        if (Array.isArray(uList) && uList.length > 0) {
          setAdminUsers(uList);
          if (setPropUsers) setPropUsers(uList);
        }
      }
    } catch (err) {
      console.error('Error loading admin users:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Load live backend roles from GET /admin/roles
  const loadRoles = async () => {
    setLoadingRoles(true);
    try {
      const res = await fetchRoles();
      if (res && res.success !== false) {
        const roleList = res.data?.roles || (Array.isArray(res.data) ? res.data : []);
        if (Array.isArray(roleList)) {
          setRoles(roleList);
        }
      }
    } catch (err) {
      console.error('Error loading RBAC roles:', err);
    } finally {
      setLoadingRoles(false);
    }
  };

  useEffect(() => {
    loadAdminUsers();
    loadRoles();
  }, []);

  // Open Edit User Modal
  const handleOpenEditUser = (user) => {
    setEditingUser(user);
    setUName(user.name || '');
    setUEmail(user.email || '');
    setUStatus(user.status || 'active');
    setURoleId(user.role_id || (roles[0]?._id || ''));
    setUserModalOpen(true);
  };

  // Save / Update Admin User via PATCH /admin/users/{id}
  const handleSaveUser = async (e) => {
    if (e) e.preventDefault();
    if (!editingUser) return;
    if (!uName.trim()) {
      if (addToast) addToast('User name is required', 'danger');
      return;
    }
    if (!uEmail.trim()) {
      if (addToast) addToast('User email is required', 'danger');
      return;
    }

    setSubmittingUser(true);
    const payload = {
      name: uName.trim(),
      email: uEmail.trim(),
      status: uStatus,
      role_id: uRoleId
    };

    try {
      const res = await updateAdminUser(editingUser._id || editingUser.id, payload);
      if (res && res.success !== false) {
        if (addToast) addToast(res.message || 'Admin user updated successfully!', 'success');
        setUserModalOpen(false);
        loadAdminUsers();
      } else {
        const msg = res?.error || res?.message || 'Failed to update user';
        if (addToast) addToast(msg, 'danger');
      }
    } catch (err) {
      console.error('Error updating admin user:', err);
      if (addToast) addToast(err.message || 'Error updating user', 'danger');
    } finally {
      setSubmittingUser(false);
    }
  };

  // Toggle user active/inactive status
  const handleToggleUserStatus = async (user) => {
    const nextStatus = (user.status || 'active').toLowerCase() === 'active' ? 'inactive' : 'active';
    try {
      const res = await updateAdminUser(user._id || user.id, { status: nextStatus });
      if (res && res.success !== false) {
        if (addToast) addToast(`User ${user.name} status marked as ${nextStatus}`, 'warning');
        loadAdminUsers();
      } else {
        if (addToast) addToast('Failed to update status', 'danger');
      }
    } catch (err) {
      console.error('Error toggling user status:', err);
      if (addToast) addToast(err.message || 'Error toggling user status', 'danger');
    }
  };

  // Delete Admin User via DELETE /admin/users/{id}
  const handleDeleteAdminUser = async (user) => {
    if (!window.confirm(`Are you sure you want to delete admin user "${user.name}"?`)) {
      return;
    }

    try {
      const res = await deleteAdminUser(user._id || user.id);
      if (res && res.success !== false) {
        if (addToast) addToast(res.message || 'Admin user deleted successfully', 'success');
        loadAdminUsers();
      } else {
        const msg = res?.error || res?.message || 'Failed to delete user';
        if (addToast) addToast(msg, 'danger');
      }
    } catch (err) {
      console.error('Error deleting admin user:', err);
      if (addToast) addToast(err.message || 'Error deleting admin user', 'danger');
    }
  };

  // Open Create Role modal
  const handleOpenCreateRole = () => {
    setEditingRole(null);
    setRoleName('');
    setRoleDescription('');
    setSelectedPermissions([]);
    setRoleModalOpen(true);
  };

  // Open Edit Role modal
  const handleOpenEditRole = (role) => {
    setEditingRole(role);
    setRoleName(role.name || '');
    setRoleDescription(role.description || '');
    setSelectedPermissions(Array.isArray(role.permissions) ? role.permissions : []);
    setRoleModalOpen(true);
  };

  // Toggle permission selection in form
  const handleTogglePermSelection = (permKey) => {
    if (permKey === '*') {
      setSelectedPermissions(selectedPermissions.includes('*') ? [] : ['*']);
    } else {
      let updated = selectedPermissions.filter(p => p !== '*');
      if (updated.includes(permKey)) {
        updated = updated.filter(p => p !== permKey);
      } else {
        updated.push(permKey);
      }
      setSelectedPermissions(updated);
    }
  };

  // Save Role via POST /admin/roles or PUT /admin/roles/{id}
  const handleSaveRole = async (e) => {
    if (e) e.preventDefault();
    if (!roleName.trim()) {
      if (addToast) addToast('Role name is required', 'danger');
      return;
    }

    setSubmittingRole(true);
    const payload = {
      name: roleName.trim(),
      description: roleDescription.trim(),
      permissions: selectedPermissions
    };

    try {
      let res;
      if (editingRole) {
        res = await updateRole(editingRole._id || editingRole.id, payload);
      } else {
        res = await createRole(payload);
      }

      if (res && res.success !== false) {
        if (addToast) addToast(res.message || `Role ${editingRole ? 'updated' : 'created'} successfully!`, 'success');
        setRoleModalOpen(false);
        loadRoles();
      } else {
        const msg = res?.error || res?.message || 'Failed to save role';
        if (addToast) addToast(msg, 'danger');
      }
    } catch (err) {
      console.error('Error saving role:', err);
      if (addToast) addToast(err.message || 'Error saving role', 'danger');
    } finally {
      setSubmittingRole(false);
    }
  };

  // Delete Role via DELETE /admin/roles/{id}
  const handleDeleteRole = async (role) => {
    if (role.isSystem) {
      if (addToast) addToast('System default roles cannot be deleted', 'danger');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete the "${role.name}" role?`)) {
      return;
    }

    try {
      const res = await deleteRole(role._id || role.id);
      if (res && res.success !== false) {
        if (addToast) addToast(res.message || 'Role deleted successfully', 'success');
        loadRoles();
      } else {
        const msg = res?.error || res?.message || 'Failed to delete role';
        if (addToast) addToast(msg, 'danger');
      }
    } catch (err) {
      console.error('Error deleting role:', err);
      if (addToast) addToast(err.message || 'Error deleting role', 'danger');
    }
  };

  // Helper to resolve role name from role_id
  const getRoleName = (roleId) => {
    if (!roleId) return 'Admin';
    const match = roles.find(r => (r._id === roleId || r.id === roleId));
    return match ? match.name : 'Admin';
  };

  // Filtered Users List
  const filteredUsers = (adminUsers || []).filter(u => {
    if (!userSearch.trim()) return true;
    const term = userSearch.toLowerCase();
    return String(u?.name || '').toLowerCase().includes(term) || String(u?.email || '').toLowerCase().includes(term);
  });

  const activeUsersCount = (adminUsers || []).filter(u => String(u?.status || 'active').toLowerCase() === 'active').length;
  const adminRoleCount = (roles || []).filter(r => r?.name === 'Admin' || (r?.permissions || []).includes('*')).length;

  const userCols = [
    {
      key: 'name',
      label: 'Operating Staff Member',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', border: '1px solid var(--primary)' }}>
            {(row.name || 'A').charAt(0).toUpperCase()}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '13px' }}>{row.name}</span>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{row.email}</span>
          </div>
        </div>
      )
    },
    {
      key: 'role_id',
      label: 'Assigned Role',
      render: (row) => (
        <Badge variant="info" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <Shield size={12} /> {getRoleName(row.role_id)}
        </Badge>
      )
    },
    {
      key: 'status',
      label: 'Account Status',
      render: (row) => {
        const isAct = (row.status || 'active').toLowerCase() === 'active';
        return <Badge variant={isAct ? 'success' : 'secondary'}>{isAct ? 'Active' : 'Inactive'}</Badge>;
      }
    },
    {
      key: 'last_login',
      label: 'Last Login Timestamp',
      render: (row) => (
        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          {row.last_login ? new Date(row.last_login).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recent'}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div style={{ display: 'flex', gap: '6px' }}>
          <Button variant="outline" size="sm" icon={Edit} onClick={() => handleOpenEditUser(row)}>
            Edit
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleToggleUserStatus(row)}>
            Toggle Status
          </Button>
          <Button variant="ghost" size="sm" icon={Trash2} style={{ color: 'var(--danger)' }} onClick={() => handleDeleteAdminUser(row)}>
            Delete
          </Button>
        </div>
      )
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '800', letterSpacing: '-0.03em', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={24} style={{ color: 'var(--primary)' }} /> RBAC Roles & Operating Staff Users
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px', margin: 0 }}>
            Manage administrative team accounts, configure custom RBAC access roles, and assign granular permissions.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <ViewToggle currentView={viewMode} onViewChange={handleViewChange} />
          <Button variant="outline" size="sm" icon={Plus} onClick={handleOpenCreateRole}>
            Create New Role
          </Button>
          <Button variant="primary" size="sm" icon={RefreshCw} onClick={() => { loadAdminUsers(); loadRoles(); }}>
            Refresh Data
          </Button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
        <StatsCard title="Total Operating Staff" value={adminUsers.length} icon={Users} iconColor="#6366f1" iconBg="#ede9fe" />
        <StatsCard title="Active Accounts" value={activeUsersCount} icon={UserCheck} iconColor="#10b981" iconBg="#d1fae5" />
        <StatsCard title="Configured RBAC Roles" value={roles.length} icon={Shield} iconColor="#0ea5e9" iconBg="#e0f2fe" />
        <StatsCard title="Super Admin Roles" value={adminRoleCount} icon={Award} iconColor="#f59e0b" iconBg="#fef3c7" />
      </div>

      {/* Navigation Sub-Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '4px' }}>
        {[
          { key: 'users', label: `Staff Users (${adminUsers.length})`, icon: Users },
          { key: 'roles', label: `RBAC Roles (${roles.length})`, icon: Shield },
          { key: 'permissions', label: 'System Permissions Matrix', icon: Layers }
        ].map(t => {
          const Icon = t.icon;
          const isActive = activeTab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: '700',
                borderRadius: '10px',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                backgroundColor: isActive ? 'var(--primary)' : 'var(--bg-card)',
                color: isActive ? '#fff' : 'var(--text-secondary)',
                boxShadow: isActive ? '0 2px 10px rgba(79,70,229,0.3)' : '1px solid var(--border-color)'
              }}
            >
              <Icon size={16} /> {t.label}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Admin Users */}
      {activeTab === 'users' && (
        <Card title={`Operating Staff Members (${filteredUsers.length})`} icon={Users} actions={
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div style={{ position: 'relative', width: '220px' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search staff name, email..."
                style={{
                  width: '100%',
                  padding: '6px 12px 6px 30px',
                  fontSize: '12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-card)',
                  color: 'var(--text-primary)'
                }}
              />
            </div>
            <Button variant="ghost" size="sm" icon={RefreshCw} onClick={loadAdminUsers}>Refresh</Button>
          </div>
        }>
          <div style={{ marginTop: '12px' }}>
            {loadingUsers ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading admin users...</div>
            ) : filteredUsers.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>No admin users found matching filter.</div>
            ) : viewMode === 'list' ? (
              <ListView
                columns={userCols}
                data={filteredUsers}
                initialRowsPerPage={10}
              />
            ) : (
              <GridView
                data={filteredUsers}
                idKey="_id"
                titleKey="name"
                subtitleKey="email"
                statusKey="status"
                renderActions={item => (
                  <>
                    <Badge variant={item.status === 'active' ? 'success' : 'secondary'}>{item.status}</Badge>
                    <Button variant="outline" size="sm" icon={Edit} onClick={() => handleOpenEditUser(item)}>Edit</Button>
                  </>
                )}
                initialRowsPerPage={8}
              />
            )}
          </div>
        </Card>
      )}

      {/* Tab 2: RBAC Roles Listing Card */}
      {activeTab === 'roles' && (
        <Card title={`Configured RBAC Roles (${roles.length})`} icon={Shield} actions={
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button variant="primary" size="sm" icon={Plus} onClick={handleOpenCreateRole}>Create New Role</Button>
            <Button variant="ghost" size="sm" icon={RefreshCw} onClick={loadRoles}>Refresh</Button>
          </div>
        }>
          <div style={{ marginTop: '12px' }}>
            {loadingRoles ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading system roles...</div>
            ) : roles.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>No roles configured.</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>
                {roles.map(role => (
                  <div key={role._id || role.id} style={{ border: '1px solid var(--border-color)', borderRadius: '12px', padding: '18px', backgroundColor: 'var(--bg-card)', display: 'flex', flexDirection: 'column', gap: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Shield size={20} style={{ color: 'var(--primary)' }} />
                        <span style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-primary)' }}>{role.name}</span>
                      </div>
                      {role.isSystem ? (
                        <Badge variant="info">System Default</Badge>
                      ) : (
                        <Badge variant="secondary">Custom Role</Badge>
                      )}
                    </div>

                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.4' }}>
                      {role.description || 'No description provided.'}
                    </p>

                    {/* Permissions Chips */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                      {Array.isArray(role.permissions) && role.permissions.length > 0 ? (
                        role.permissions.map((p, idx) => (
                          <span key={idx} style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '700', backgroundColor: p === '*' ? 'var(--primary-light)' : 'var(--bg-app)', color: p === '*' ? 'var(--primary)' : 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>
                            {p === '*' ? '★ Full Access (*)' : p}
                          </span>
                        ))
                      ) : (
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>No permissions assigned</span>
                      )}
                    </div>

                    {/* Role Actions */}
                    <div style={{ marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                      <Button variant="ghost" size="sm" icon={Edit} onClick={() => handleOpenEditRole(role)}>
                        Edit Role
                      </Button>
                      {!role.isSystem && (
                        <Button variant="ghost" size="sm" icon={Trash2} style={{ color: 'var(--danger)' }} onClick={() => handleDeleteRole(role)}>
                          Delete
                        </Button>
                      )}
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Tab 3: Permissions Matrix Overview */}
      {activeTab === 'permissions' && (
        <Card title="Live System Permissions Matrix" icon={Layers}>
          <div style={{ overflowX: 'auto', marginTop: '12px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-app)', borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ padding: '10px 14px', fontWeight: '700' }}>Permission Key</th>
                  <th style={{ padding: '10px 14px', fontWeight: '700' }}>Permission Module Description</th>
                  {roles.map(r => (
                    <th key={r._id || r.id} style={{ padding: '10px 14px', fontWeight: '700', textAlign: 'center' }}>{r.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {AVAILABLE_PERMISSIONS.map(p => (
                  <tr key={p.key} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '8px 14px', fontFamily: 'monospace', fontWeight: '700', color: 'var(--primary)' }}>{p.key}</td>
                    <td style={{ padding: '8px 14px', color: 'var(--text-secondary)' }}>{p.label}</td>
                    {roles.map(r => {
                      const perms = Array.isArray(r.permissions) ? r.permissions : [];
                      const hasAccess = perms.includes('*') || perms.includes(p.key);
                      return (
                        <td key={r._id || r.id} style={{ padding: '8px 14px', textAlign: 'center' }}>
                          {hasAccess ? (
                            <CheckCircle size={16} style={{ color: 'var(--success)', display: 'inline-block' }} />
                          ) : (
                            <span style={{ color: 'var(--text-muted)' }}>-</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Edit Admin User Modal */}
      <Modal
        isOpen={userModalOpen}
        onClose={() => setUserModalOpen(false)}
        title={editingUser ? `Edit Admin User: ${editingUser.name}` : 'Edit Admin User'}
        footer={
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button variant="outline" size="sm" onClick={() => setUserModalOpen(false)}>Cancel</Button>
            <Button variant="primary" size="sm" icon={UserCheck} loading={submittingUser} onClick={handleSaveUser}>
              Save User Changes
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSaveUser} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Input
            label="Full Name"
            value={uName}
            onChange={(e) => setUName(e.target.value)}
            placeholder="e.g. Admin User"
            required
          />

          <Input
            label="Email Address"
            type="email"
            value={uEmail}
            onChange={(e) => setUEmail(e.target.value)}
            placeholder="example@gmail.com"
            required
          />

          <Select
            label="Account Status"
            value={uStatus}
            onChange={(e) => setUStatus(e.target.value)}
            options={[
              { label: 'Active', value: 'active' },
              { label: 'Inactive', value: 'inactive' }
            ]}
          />

          <Select
            label="Assigned RBAC Role"
            value={uRoleId}
            onChange={(e) => setURoleId(e.target.value)}
            options={roles.map(r => ({
              label: `${r.name} - ${r.description || ''}`,
              value: r._id || r.id
            }))}
          />
        </form>
      </Modal>

      {/* Create / Edit Role Modal */}
      <Modal
        isOpen={roleModalOpen}
        onClose={() => setRoleModalOpen(false)}
        title={editingRole ? `Edit Role: ${editingRole.name}` : 'Create New RBAC Role'}
        footer={
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button variant="outline" size="sm" onClick={() => setRoleModalOpen(false)}>Cancel</Button>
            <Button variant="primary" size="sm" icon={ShieldCheck} loading={submittingRole} onClick={handleSaveRole}>
              {editingRole ? 'Update Role' : 'Create Role'}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSaveRole} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Input
            label="Role Name"
            value={roleName}
            onChange={(e) => setRoleName(e.target.value)}
            placeholder="e.g. Content Editor, Support Agent"
            required
          />

          <Textarea
            label="Role Description"
            rows={2}
            value={roleDescription}
            onChange={(e) => setRoleDescription(e.target.value)}
            placeholder="Can manage blog posts, support tickets, and view catalog items."
          />

          <div>
            <label style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)', display: 'block', marginBottom: '8px' }}>
              Assign Permissions ({selectedPermissions.length} selected)
            </label>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '240px', overflowY: 'auto', border: '1px solid var(--border-color)', padding: '12px', borderRadius: '8px', backgroundColor: 'var(--bg-app)' }}>
              {AVAILABLE_PERMISSIONS.map(p => {
                const checked = selectedPermissions.includes(p.key);
                return (
                  <label key={p.key} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: checked ? '700' : '400', color: 'var(--text-primary)' }}>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handleTogglePermSelection(p.key)}
                      style={{ accentColor: 'var(--primary)', width: '15px', height: '15px', cursor: 'pointer' }}
                    />
                    <span>{p.label} <code style={{ fontSize: '11px', color: 'var(--text-muted)' }}>({p.key})</code></span>
                  </label>
                );
              })}
            </div>
          </div>
        </form>
      </Modal>

    </div>
  );
};

export default UserManagement;
