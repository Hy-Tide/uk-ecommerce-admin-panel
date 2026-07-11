import React, { useState } from 'react';
import { Percent, Plus, Tag, Ticket, Trash2 } from 'lucide-react';
import Button from '../components/Button';
import Card, { StatsCard } from '../components/Card';
import Modal from '../components/Modal';
import Input, { Select } from '../components/Input';
import Table from '../components/Table';
import Badge from '../components/Badge';

export const Coupons = ({
  coupons = [],
  setCoupons,
  categories = [],
  brands = [],
  addToast,
  auditLogs = [],
  setAuditLogs
}) => {
  const [modalOpen, setModalOpen] = useState(false);

  // Form Fields
  const [code, setCode] = useState('');
  const [type, setType] = useState('Percentage'); // Percentage, Fixed Amount, Free Shipping, Buy X Get Y
  const [value, setValue] = useState(0);
  const [usageLimit, setUsageLimit] = useState(100);
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [minOrder, setMinOrder] = useState(0);
  const [appCat, setAppCat] = useState('All');
  const [appBrand, setAppBrand] = useState('All');

  const openCreateModal = () => {
    setCode(`PROMO-${Math.random().toString(36).substr(2, 5).toUpperCase()}`);
    setType('Percentage');
    setValue(15);
    setUsageLimit(200);
    setStart(new Date().toISOString().split('T')[0]);
    
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);
    setEnd(futureDate.toISOString().split('T')[0]);
    
    setMinOrder(25.00);
    setAppCat('All');
    setAppBrand('All');
    setModalOpen(true);
  };

  const handleSaveCoupon = (e) => {
    e.preventDefault();
    if (!code) {
      addToast('Coupon code is required', 'danger');
      return;
    }

    const payload = {
      id: `c-${Date.now()}`,
      code: code.toUpperCase(),
      type: type,
      value: Number(value),
      usageLimit: Number(usageLimit),
      usedCount: 0,
      start: start,
      end: end,
      minOrder: Number(minOrder),
      categories: appCat === 'All' ? [] : [appCat],
      brands: appBrand === 'All' ? [] : [appBrand],
      status: 'Active'
    };

    setCoupons([payload, ...coupons]);
    addToast(`Coupon code ${payload.code} activated`, 'success');

    setAuditLogs([
      {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        user: 'Director David',
        action: 'Promo Code Activated',
        module: 'Coupons',
        detail: `Created promotion rule code: ${payload.code}`
      },
      ...auditLogs
    ]);

    setModalOpen(false);
  };

  const handleDelete = (id) => {
    const deleted = coupons.find(c => c.id === id);
    setCoupons(coupons.filter(c => c.id !== id));
    addToast('Coupon discount deleted', 'warning');
    
    setAuditLogs([
      {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        user: 'Director David',
        action: 'Coupon Deleted',
        module: 'Coupons',
        detail: `Removed promotion code: ${deleted?.code}`
      },
      ...auditLogs
    ]);
  };

  const getCouponBadge = (type) => {
    switch (type) {
      case 'Percentage': return <Badge variant="primary">20% OFF</Badge>;
      case 'Free Shipping': return <Badge variant="accent">FREE SHIP</Badge>;
      case 'Fixed Amount': return <Badge variant="success">CASHBACK</Badge>;
      case 'Buy X Get Y':
      default: return <Badge variant="warning">BOGO</Badge>;
    }
  };

  const columns = [
    { key: 'code', label: 'Promo Code', render: (row) => <span style={{ fontWeight: '700', letterSpacing: '0.5px' }}>{row.code}</span> },
    { key: 'type', label: 'Offer Type', render: (row) => getCouponBadge(row.type) },
    {
      key: 'value',
      label: 'Value',
      render: (row) => {
        if (row.type === 'Percentage') return `${row.value}%`;
        if (row.type === 'Free Shipping') return 'Free';
        return `$${row.value.toFixed(2)}`;
      }
    },
    {
      key: 'limits',
      label: 'Usage Log',
      render: (row) => <span>{row.usedCount} / {row.usageLimit} times</span>
    },
    {
      key: 'duration',
      label: 'Validity Duration',
      render: (row) => <span style={{ fontSize: '12px' }}>{row.start} to {row.end}</span>
    },
    {
      key: 'minOrder',
      label: 'Threshold',
      render: (row) => <span>Min order: ${row.minOrder.toFixed(2)}</span>
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => {
        const isExp = new Date(row.end) < new Date();
        return <Badge variant={isExp ? 'danger' : 'success'}>{isExp ? 'Expired' : 'Active'}</Badge>;
      }
    },
    {
      key: 'actions',
      label: '',
      render: (row) => (
        <Button variant="ghost" size="sm" onClick={() => handleDelete(row.id)} style={{ padding: '6px', color: 'var(--danger)' }}>
          <Trash2 size={15} />
        </Button>
      )
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '700', letterSpacing: '-0.02em', margin: 0 }}>Coupons & Promotions</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Configure seasonal percentage coupons, flat order credits, and shipping exemptions.</p>
        </div>
        <Button variant="primary" size="sm" icon={Plus} onClick={openCreateModal}>
          New Coupon
        </Button>
      </div>

      {/* Stats Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <StatsCard title="Total Promotions Active" value={coupons.filter(c => new Date(c.end) >= new Date()).length} icon={Ticket} iconColor="var(--primary)" iconBg="var(--primary-light)" />
        <StatsCard title="Cumulative Claims Count" value={coupons.reduce((sum, c) => sum + c.usedCount, 0)} icon={Percent} iconColor="var(--accent)" iconBg="var(--accent-light)" />
      </div>

      {/* Main campaigns split */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', alignItems: 'flex-start' }}>
        
        {/* Coupon details sheet */}
        <Card title="Store Promo Codes Registry">
          <div style={{ marginTop: '12px' }}>
            <Table
              columns={columns}
              data={coupons}
              initialRowsPerPage={5}
            />
          </div>
        </Card>

        {/* Marketing campaign dashboard widgets */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <Card title="Active Marketing Campaigns">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
              
              <div style={{ border: '1px solid var(--border-color)', padding: '12px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ fontSize: '13px' }}>Weekly Organic Deals</h4>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Focus: Fresh Fruits</span>
                </div>
                <Badge variant="success">Active</Badge>
              </div>

              <div style={{ border: '1px solid var(--border-color)', padding: '12px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ fontSize: '13px' }}>Clearance Flash Sale</h4>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Discount: up to 50%</span>
                </div>
                <Badge variant="danger">Paused</Badge>
              </div>

              <div style={{ border: '1px solid var(--border-color)', padding: '12px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ fontSize: '13px' }}>Festival Autumn Feast</h4>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Status: Pre-planning</span>
                </div>
                <Badge variant="secondary">Draft</Badge>
              </div>

            </div>
          </Card>
        </div>
      </div>

      {/* Creation Modal form */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Activate Store Promo Code"
        footer={
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button variant="outline" size="sm" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={handleSaveCoupon}>Activate Code</Button>
          </div>
        }
      >
        <form style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Input label="Coupon Code String" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="e.g. AUTUMN20" />
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Select label="Discount Type" value={type} onChange={(e) => setType(e.target.value)} options={['Percentage', 'Fixed Amount', 'Free Shipping', 'Buy X Get Y']} />
            <Input label="Discount Value (% or $)" type="number" value={value} onChange={(e) => setValue(e.target.value)} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Input label="Start Date" type="date" value={start} onChange={(e) => setStart(e.target.value)} />
            <Input label="Expiration Date" type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Input label="Usage Limit Count" type="number" value={usageLimit} onChange={(e) => setUsageLimit(e.target.value)} />
            <Input label="Minimum Order amount ($)" type="number" value={minOrder} onChange={(e) => setMinOrder(e.target.value)} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Select label="Applicable Category Only" value={appCat} onChange={(e) => setAppCat(e.target.value)} options={['All', ...categories.map(c => c.name)]} />
            <Select label="Applicable Brand Only" value={appBrand} onChange={(e) => setAppBrand(e.target.value)} options={['All', ...brands.map(b => b.name)]} />
          </div>
        </form>
      </Modal>

    </div>
  );
};
export default Coupons;
