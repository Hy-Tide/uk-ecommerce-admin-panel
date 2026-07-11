import React, { useState } from 'react';
import { Award, Lock, Mail, Phone, ShieldX, User, UserX } from 'lucide-react';
import Button from '../components/Button';
import Drawer from '../components/Drawer';
import Input from '../components/Input';
import Table from '../components/Table';
import Badge from '../components/Badge';

export const Customers = ({
  customers = [],
  setCustomers,
  addToast,
  auditLogs = [],
  setAuditLogs
}) => {
  const [search, setSearch] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeCustomer, setActiveCustomer] = useState(null);
  
  // Point adjustment field
  const [pointsOffset, setPointsOffset] = useState('');

  const handleAdjustPoints = (e) => {
    e.preventDefault();
    if (!activeCustomer) return;
    const offset = Number(pointsOffset);
    if (isNaN(offset) || offset === 0) {
      addToast('Please enter a valid numeric value', 'warning');
      return;
    }

    const nextPoints = Math.max(0, activeCustomer.rewardsPoints + offset);
    const updatedCustomer = {
      ...activeCustomer,
      rewardsPoints: nextPoints
    };

    setCustomers(customers.map(c => c.id === activeCustomer.id ? updatedCustomer : c));
    setActiveCustomer(updatedCustomer);
    setPointsOffset('');
    addToast(`Successfully adjusted rewards balance by ${offset} points`, 'success');
  };

  const handleToggleStatus = () => {
    if (!activeCustomer) return;
    const nextStatus = activeCustomer.status === 'Active' ? 'Disabled' : 'Active';
    const updatedCustomer = {
      ...activeCustomer,
      status: nextStatus
    };

    setCustomers(customers.map(c => c.id === activeCustomer.id ? updatedCustomer : c));
    setActiveCustomer(updatedCustomer);
    addToast(`Customer account marked as ${nextStatus}`, 'warning');

    setAuditLogs([
      {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        user: 'Director David',
        action: 'Customer Account Blocked',
        module: 'Customers',
        detail: `Set status of customer ${activeCustomer.name} to ${nextStatus}`
      },
      ...auditLogs
    ]);
  };

  const openDetailsDrawer = (cust) => {
    setActiveCustomer(cust);
    setDrawerOpen(true);
  };

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  );

  const columns = [
    { key: 'name', label: 'Full Name', render: (row) => <span style={{ fontWeight: '600' }}>{row.name}</span> },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    {
      key: 'lifetimeValue',
      label: 'LTV Value',
      render: (row) => <span style={{ fontWeight: '600', color: 'var(--primary)' }}>${row.lifetimeValue.toFixed(2)}</span>
    },
    {
      key: 'rewardsPoints',
      label: 'Rewards Points',
      render: (row) => (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 'bold' }}>
          <Award size={14} style={{ color: 'var(--accent)' }} />
          {row.rewardsPoints} pts
        </span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <Badge variant={row.status === 'Active' ? 'success' : 'danger'}>{row.status}</Badge>
    },
    {
      key: 'actions',
      label: '',
      render: (row) => (
        <Button variant="outline" size="sm" onClick={() => openDetailsDrawer(row)}>
          Profile
        </Button>
      )
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '700', letterSpacing: '-0.02em', margin: 0 }}>Customer Registry</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Analyze lifetime value transactions, reward points matrices, and user accessibility.</p>
        </div>
      </div>

      {/* Toolbar filters */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          padding: '12px 16px',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div style={{ position: 'relative', width: '100%', maxWidth: '300px' }}>
          <span style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-muted)' }}><User size={16} /></span>
          <input
            type="text"
            placeholder="Search Customer name, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px 8px 36px',
              fontSize: '13px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-app)',
              color: 'var(--text-primary)',
              outline: 'none'
            }}
          />
        </div>
      </div>

      {/* Table grid */}
      <Table
        columns={columns}
        data={filteredCustomers}
        initialRowsPerPage={10}
      />

      {/* Profile Detail Drawer */}
      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={activeCustomer ? `Customer Profile: ${activeCustomer.name}` : ''}
        size="md"
        footer={
          activeCustomer ? (
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button
                variant={activeCustomer.status === 'Active' ? 'danger' : 'success'}
                size="sm"
                icon={activeCustomer.status === 'Active' ? UserX : ShieldX}
                onClick={handleToggleStatus}
              >
                {activeCustomer.status === 'Active' ? 'Disable Account' : 'Enable Account'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                icon={Lock}
                onClick={() => addToast(`Triggered email instruction to reset password for ${activeCustomer.email}`, 'info')}
              >
                Reset Password
              </Button>
            </div>
          ) : null
        }
      >
        {activeCustomer && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Core Info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '20px' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--primary-light)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: '20px'
                }}
              >
                {activeCustomer.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <h4 style={{ fontSize: '18px', fontWeight: '700' }}>{activeCustomer.name}</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Mail size={12} /> {activeCustomer.email}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Phone size={12} /> {activeCustomer.phone}</span>
                </div>
              </div>
            </div>

            {/* Financial Value details */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ backgroundColor: 'var(--bg-app)', border: '1px solid var(--border-color)', padding: '16px', borderRadius: '12px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Lifetime Value (LTV)</span>
                <span style={{ fontSize: '20px', fontWeight: '700', color: 'var(--primary)' }}>${activeCustomer.lifetimeValue.toFixed(2)}</span>
              </div>
              <div style={{ backgroundColor: 'var(--bg-app)', border: '1px solid var(--border-color)', padding: '16px', borderRadius: '12px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Rewards Balance</span>
                <span style={{ fontSize: '20px', fontWeight: '700', color: 'var(--accent)' }}>{activeCustomer.rewardsPoints} Points</span>
              </div>
            </div>

            {/* Reward adjustments */}
            <div style={{ border: '1px solid var(--border-color)', padding: '16px', borderRadius: '12px' }}>
              <span style={{ fontSize: '13px', fontWeight: 'bold', display: 'block', marginBottom: '10px' }}>Adjust Reward Points</span>
              <form onSubmit={handleAdjustPoints} style={{ display: 'flex', gap: '8px' }}>
                <Input
                  type="number"
                  placeholder="e.g. +50 or -20"
                  value={pointsOffset}
                  onChange={(e) => setPointsOffset(e.target.value)}
                  style={{ flex: 1 }}
                />
                <Button type="submit" variant="outline" size="sm">Adjust</Button>
              </form>
            </div>

            {/* Wishlist items lists */}
            <div>
              <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Active Wishlist</span>
              {activeCustomer.wishlist.length === 0 ? (
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Wishlist is empty.</p>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {activeCustomer.wishlist.map((item, idx) => (
                    <Badge key={idx} variant="primary">{item}</Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Saved Addresses list */}
            <div>
              <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Addresses book</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {activeCustomer.savedAddresses.map((addr) => (
                  <div key={addr.id} style={{ border: '1px solid var(--border-color)', padding: '10px 12px', borderRadius: '8px', fontSize: '13px' }}>
                    <strong>{addr.label}:</strong> {addr.text}
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}
      </Drawer>

    </div>
  );
};
export default Customers;
