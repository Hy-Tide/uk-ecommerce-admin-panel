import React, { useState } from 'react';
import {
  Award, Calendar, CheckCircle, Heart, Lock, Mail,
  MapPin, Minus, Package, Phone, Plus, Search,
  ShoppingCart, Star, TrendingUp, User, UserX, ShieldX
} from 'lucide-react';
import Button from '../components/Button';
import Drawer from '../components/Drawer';
import Table, { ColumnsToggle } from '../components/Table';
import ListView from '../components/ListView';
import GridView from '../components/GridView';
import ViewToggle from '../components/ViewToggle';
import Badge from '../components/Badge';

// ─── Tier helper ────────────────────────────────────────────────────────────
const getTier = (pts) => {
  if (pts >= 500) return { label: 'Platinum', color: '#8b5cf6', bg: '#ede9fe', star: '👑' };
  if (pts >= 200) return { label: 'Gold',     color: '#d97706', bg: '#fef3c7', star: '⭐' };
  if (pts >= 100) return { label: 'Silver',   color: '#6b7280', bg: '#f3f4f6', star: '🥈' };
  return             { label: 'Bronze',   color: '#b45309', bg: '#fef9c3', star: '🥉' };
};

const SectionLabel = ({ icon: Icon, label, count }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
    {Icon && (
      <div style={{ width: '26px', height: '26px', borderRadius: '8px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={13} />
      </div>
    )}
    <span style={{ fontSize: '10px', fontWeight: '800', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>{label}</span>
    {count !== undefined && (
      <span style={{ marginLeft: 'auto', fontSize: '11px', fontWeight: '700', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', padding: '2px 8px', borderRadius: '10px' }}>{count}</span>
    )}
  </div>
);

export const Customers = ({
  customers = [],
  setCustomers,
  addToast,
  auditLogs = [],
  setAuditLogs
}) => {
  const [search,         setSearch]         = useState('');
  const [filterStatus,   setFilterStatus]   = useState('all');
  const [drawerOpen,     setDrawerOpen]     = useState(false);
  const [activeCustomer, setActiveCustomer] = useState(null);
  const [activeTab,      setActiveTab]      = useState('overview');
  const [pointsOffset,   setPointsOffset]   = useState('');
  const [pointsReason,   setPointsReason]   = useState('');
  const [adjustMode,     setAdjustMode]     = useState('add');
  const [visibleCols,    setVisibleCols]    = useState(null);
  const [viewMode,       setViewMode]       = useState(() => {
    return localStorage.getItem('view-mode-customers') || 'list';
  });

  const handleViewChange = (newView) => {
    setViewMode(newView);
    localStorage.setItem('view-mode-customers', newView);
  };

  const QUICK_PRESETS = [10, 25, 50, 100];

  const handleAdjustPoints = (e) => {
    e.preventDefault();
    const raw = Number(pointsOffset);
    if (isNaN(raw) || raw <= 0) { addToast('Enter a valid positive number', 'warning'); return; }
    const delta      = adjustMode === 'add' ? raw : -raw;
    const nextPoints = Math.max(0, activeCustomer.rewardsPoints + delta);
    const updated    = { ...activeCustomer, rewardsPoints: nextPoints };
    setCustomers(customers.map(c => c.id === activeCustomer.id ? updated : c));
    setActiveCustomer(updated);
    setPointsOffset('');
    setPointsReason('');
    const verb = adjustMode === 'add' ? 'Added' : 'Deducted';
    addToast(`${verb} ${raw} pts ${adjustMode === 'add' ? 'to' : 'from'} ${activeCustomer.name}`, 'success');
  };

  const handleToggleStatus = () => {
    const next    = activeCustomer.status === 'Active' ? 'Disabled' : 'Active';
    const updated = { ...activeCustomer, status: next };
    setCustomers(customers.map(c => c.id === activeCustomer.id ? updated : c));
    setActiveCustomer(updated);
    addToast(`Account marked as ${next}`, 'warning');
    setAuditLogs([{
      id: `log-${Date.now()}`, timestamp: new Date().toISOString(),
      user: 'Mugesh', action: 'Customer Account Status Changed',
      module: 'Customers', detail: `Set ${activeCustomer.name} to ${next}`
    }, ...auditLogs]);
  };

  const openDrawer = (cust) => {
    setActiveCustomer(cust);
    setActiveTab('overview');
    setPointsOffset('');
    setDrawerOpen(true);
  };

  const activeCount = customers.filter(c => c.status === 'Active').length;
  const tier        = activeCustomer ? getTier(activeCustomer.rewardsPoints) : null;
  const cartTotal   = activeCustomer?.cartItems?.reduce((s, i) => s + i.price * i.qty, 0) ?? 0;

  const filtered = customers.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
                        c.email.toLowerCase().includes(search.toLowerCase()) ||
                        c.phone.includes(search);
    const matchStatus = filterStatus === 'all' ? true
      : filterStatus === 'active' ? c.status === 'Active'
      : c.status !== 'Active';
    return matchSearch && matchStatus;
  });

  const DRAWER_TABS = [
    { id: 'overview',  label: 'Overview' },
    { id: 'rewards',   label: 'Rewards' },
    { id: 'wishlist',  label: `Wishlist (${activeCustomer?.wishlist?.length ?? 0})` },
    { id: 'cart',      label: `Cart (${activeCustomer?.cartItems?.length ?? 0})` },
    { id: 'addresses', label: 'Addresses' },
  ];

  const columns = [
    {
      key: 'name', label: 'Customer',
      render: row => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
            background: `linear-gradient(135deg, ${getTier(row.rewardsPoints).color}, ${getTier(row.rewardsPoints).color}99)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '11px', fontWeight: '900', color: '#fff'
          }}>
            {row.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <div style={{ fontWeight: '700', fontSize: '13px' }}>{row.name}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{row.email}</div>
          </div>
        </div>
      )
    },
    { key: 'phone', label: 'Phone', render: row => <span style={{ fontSize: '12px' }}>{row.phone}</span> },
    {
      key: 'lifetimeValue', label: 'LTV',
      render: row => <span style={{ fontWeight: '700', color: 'var(--primary)' }}>${row.lifetimeValue.toFixed(2)}</span>
    },
    {
      key: 'rewardsPoints', label: 'Points',
      render: row => {
        const t = getTier(row.rewardsPoints);
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '12px', fontWeight: '700', backgroundColor: t.bg, color: t.color, padding: '3px 10px', borderRadius: '12px' }}>
            <Award size={12} /> {row.rewardsPoints} · {t.label}
          </span>
        );
      }
    },
    {
      key: 'status', label: 'Status',
      render: row => <Badge variant={row.status === 'Active' ? 'success' : 'danger'}>{row.status}</Badge>
    },
    {
      key: 'actions', label: '',
      render: row => <Button variant="outline" size="sm" onClick={() => openDrawer(row)}>Profile</Button>
    }
  ];

  const allColKeys = columns.map(c => c.key);
  const resolvedVisible = visibleCols ?? allColKeys;
  const handleToggleCol = (key) => {
    const current = resolvedVisible;
    if (current.includes(key)) {
      if (current.length > 1) setVisibleCols(current.filter(k => k !== key));
    } else {
      setVisibleCols([...current, key]);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Header */}
      <div>
        <h2 style={{ fontSize: '24px', fontWeight: '800', letterSpacing: '-0.03em', margin: 0 }}>Customer Registry</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: '4px 0 0' }}>
          Manage customers, rewards, wishlists, cart activity, and account access.
        </p>
      </div>

      {/* KPI strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
        {[
          { label: 'Total Customers',  value: customers.length,                                                  color: '#6366f1', bg: '#ede9fe' },
          { label: 'Active',           value: activeCount,                                                       color: '#16a34a', bg: '#dcfce7' },
          { label: 'Disabled',         value: customers.length - activeCount,                                    color: '#ef4444', bg: '#fee2e2' },
          { label: 'Total Reward Pts', value: customers.reduce((s, c) => s + c.rewardsPoints, 0).toLocaleString(), color: '#d97706', bg: '#fef3c7' },
        ].map(s => (
          <div key={s.label} style={{ backgroundColor: 'var(--bg-card)', border: `1.5px solid ${s.color}33`, borderRadius: '12px', padding: '14px 16px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', marginBottom: '4px' }}>{s.label}</div>
            <div style={{ fontSize: '20px', fontWeight: '900', color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{
        display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center',
        backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)',
        borderRadius: '12px', padding: '12px 16px'
      }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '200px', maxWidth: '300px' }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Name, email, or phone..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%', padding: '8px 12px 8px 30px', fontSize: '13px',
              borderRadius: '8px', border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-app)', color: 'var(--text-primary)', outline: 'none',
              boxSizing: 'border-box'
            }}
          />
        </div>
        <div style={{ display: 'flex', gap: '4px', padding: '3px', backgroundColor: 'var(--bg-app)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
          {[
            { id: 'all',      label: `All (${customers.length})` },
            { id: 'active',   label: `Active (${activeCount})` },
            { id: 'disabled', label: `Disabled (${customers.length - activeCount})` },
          ].map(t => (
            <button key={t.id} onClick={() => setFilterStatus(t.id)} style={{
              padding: '5px 12px', fontSize: '11px', fontWeight: '700', borderRadius: '7px',
              border: 'none', cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap',
              backgroundColor: filterStatus === t.id ? 'var(--primary)' : 'transparent',
              color: filterStatus === t.id ? '#fff' : 'var(--text-secondary)',
            }}>{t.label}</button>
          ))}
        </div>

        {/* Columns toggle — end of filter bar */}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '12px', alignItems: 'center' }}>
          <ViewToggle currentView={viewMode} onViewChange={handleViewChange} />
          <ColumnsToggle columns={columns} visibleColumns={resolvedVisible} onToggle={handleToggleCol} />
        </div>
      </div>

      {/* Main presentation switcher */}
      {viewMode === 'list' ? (
        <ListView
          columns={columns}
          data={filtered}
          initialRowsPerPage={10}
          externalVisibleColumns={resolvedVisible}
          onToggleColumn={handleToggleCol}
        />
      ) : (
        <GridView
          data={filtered}
          idKey="id"
          imageKey="avatar"
          titleKey="name"
          subtitleKey="email"
          statusKey="status"
          renderActions={item => (
            <>
              <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--primary)' }}>
                ⭐ {item.rewardsPoints} Points
              </span>
              <Button variant="outline" size="sm" onClick={() => openDrawer(item)}>Profile</Button>
            </>
          )}
          initialRowsPerPage={8}
        />
      )}

      {/* ── Customer Profile Drawer ── */}
      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title=""
        size="lg"
        footer={
          activeCustomer ? (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <Button variant={activeCustomer.status === 'Active' ? 'danger' : 'success'} size="sm"
                icon={activeCustomer.status === 'Active' ? UserX : ShieldX} onClick={handleToggleStatus}>
                {activeCustomer.status === 'Active' ? 'Disable Account' : 'Enable Account'}
              </Button>
              <Button variant="outline" size="sm" icon={Lock}
                onClick={() => addToast(`Password reset sent to ${activeCustomer.email}`, 'info')}>
                Reset Password
              </Button>
            </div>
          ) : null
        }
      >
        {activeCustomer && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>

            {/* Hero banner */}
            <div style={{
              background: `linear-gradient(135deg, ${tier.color} 0%, ${tier.color}cc 100%)`,
              borderRadius: '16px', padding: '24px', marginBottom: '20px',
              position: 'relative', overflow: 'hidden'
            }}>
              <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '120px', height: '120px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.08)' }} />
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', position: 'relative', zIndex: 1 }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', flexShrink: 0, backgroundColor: 'rgba(255,255,255,0.2)', border: '3px solid rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: '900', color: '#fff' }}>
                  {activeCustomer.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '4px' }}>
                    <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: '#fff' }}>{activeCustomer.name}</h3>
                    <span style={{ fontSize: '11px', fontWeight: '700', padding: '3px 10px', borderRadius: '20px', backgroundColor: activeCustomer.status === 'Active' ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)', color: activeCustomer.status === 'Active' ? '#bbf7d0' : '#fecaca', border: `1px solid ${activeCustomer.status === 'Active' ? 'rgba(34,197,94,0.5)' : 'rgba(239,68,68,0.5)'}` }}>
                      {activeCustomer.status}
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '12px', color: 'rgba(255,255,255,0.75)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Mail size={11} />{activeCustomer.email}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Phone size={11} />{activeCustomer.phone}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={11} />Joined {activeCustomer.joinedDate}</span>
                  </div>
                </div>
              </div>
              {/* Stat chips */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '16px', flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
                {[
                  { icon: TrendingUp, label: 'Lifetime Value', value: `$${activeCustomer.lifetimeValue.toFixed(2)}` },
                  { icon: Award,      label: 'Points',          value: `${activeCustomer.rewardsPoints.toLocaleString()} pts` },
                  { icon: Star,       label: 'Tier',            value: `${tier.star} ${tier.label}` },
                ].map(s => (
                  <div key={s.label} style={{ backgroundColor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', borderRadius: '10px', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <s.icon size={14} color="#fff" />
                    <div>
                      <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.7)', lineHeight: 1 }}>{s.label}</div>
                      <div style={{ fontSize: '14px', fontWeight: '800', color: '#fff', lineHeight: 1.3 }}>{s.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tab Pills */}
            <div style={{ display: 'flex', gap: '4px', marginBottom: '20px', backgroundColor: 'var(--bg-app)', padding: '4px', borderRadius: '12px', border: '1px solid var(--border-color)', overflowX: 'auto' }}>
              {DRAWER_TABS.map(t => (
                <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
                  padding: '7px 14px', fontSize: '12px', fontWeight: '600', borderRadius: '8px', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s ease',
                  backgroundColor: activeTab === t.id ? 'var(--primary)' : 'transparent',
                  color: activeTab === t.id ? '#fff' : 'var(--text-secondary)',
                  boxShadow: activeTab === t.id ? '0 2px 8px rgba(79,70,229,0.3)' : 'none'
                }}>{t.label}</button>
              ))}
            </div>

            {/* Overview */}
            {activeTab === 'overview' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { icon: Mail,     label: 'Email',    value: activeCustomer.email },
                  { icon: Phone,    label: 'Phone',    value: activeCustomer.phone },
                  { icon: MapPin,   label: 'Address',  value: activeCustomer.address },
                  { icon: Calendar, label: 'Member Since', value: activeCustomer.joinedDate },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: 'var(--bg-app)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '12px 16px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '10px', flexShrink: 0, backgroundColor: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon size={14} /></div>
                    <div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '2px', fontWeight: '600' }}>{label}</div>
                      <div style={{ fontSize: '13px', fontWeight: '600' }}>{value}</div>
                    </div>
                  </div>
                ))}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '4px' }}>
                  <div style={{ backgroundColor: 'var(--bg-app)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                    <Heart size={20} style={{ color: '#f43f5e', marginBottom: '6px' }} />
                    <div style={{ fontSize: '22px', fontWeight: '900' }}>{activeCustomer.wishlist?.length ?? 0}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Wishlist Items</div>
                  </div>
                  <div style={{ backgroundColor: 'var(--bg-app)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                    <ShoppingCart size={20} style={{ color: 'var(--primary)', marginBottom: '6px' }} />
                    <div style={{ fontSize: '22px', fontWeight: '900' }}>{activeCustomer.cartItems?.length ?? 0}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Cart Items</div>
                  </div>
                </div>
              </div>
            )}

            {/* Rewards */}
            {activeTab === 'rewards' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ background: `linear-gradient(135deg, ${tier.bg}, ${tier.color}11)`, border: `2px solid ${tier.color}44`, borderRadius: '16px', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '52px', height: '52px', borderRadius: '50%', backgroundColor: tier.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Award size={24} color="#fff" />
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: tier.color, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{tier.label} Member</div>
                    <div style={{ fontSize: '28px', fontWeight: '900', color: tier.color }}>{activeCustomer.rewardsPoints.toLocaleString()} pts</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{activeCustomer.rewardsPoints >= 500 ? 'Max tier — Platinum! 🎉' : `${500 - activeCustomer.rewardsPoints} pts to Platinum`}</div>
                  </div>
                </div>
                <div style={{ backgroundColor: 'var(--bg-app)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                    <span>Tier Progress</span>
                    <span style={{ fontWeight: '700', color: tier.color }}>{Math.min(100, Math.round((activeCustomer.rewardsPoints / 500) * 100))}%</span>
                  </div>
                  <div style={{ height: '10px', borderRadius: '10px', backgroundColor: 'var(--border-color)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${Math.min(100, (activeCustomer.rewardsPoints / 500) * 100)}%`, background: `linear-gradient(90deg, ${tier.color}, ${tier.color}88)`, borderRadius: '10px', transition: 'width 0.6s ease' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-muted)', marginTop: '6px' }}>
                    <span>Bronze</span><span>Silver (100)</span><span>Gold (200)</span><span>Platinum (500)</span>
                  </div>
                </div>
                {/* Points adjuster */}
                <div style={{ border: '1px solid var(--border-color)', borderRadius: '16px', overflow: 'hidden' }}>
                  <div style={{ padding: '12px 18px', background: 'linear-gradient(135deg, var(--primary-light) 0%, transparent 100%)', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Award size={15} style={{ color: 'var(--primary)' }} />
                    <span style={{ fontSize: '13px', fontWeight: '700' }}>Adjust Reward Points</span>
                  </div>
                  <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{ display: 'flex', backgroundColor: 'var(--bg-app)', borderRadius: '10px', padding: '4px', border: '1px solid var(--border-color)' }}>
                      {['add', 'subtract'].map(m => (
                        <button key={m} onClick={() => setAdjustMode(m)} style={{ flex: 1, padding: '8px', fontSize: '12px', fontWeight: '700', borderRadius: '8px', border: 'none', cursor: 'pointer', transition: 'all 0.2s', backgroundColor: adjustMode === m ? (m === 'add' ? '#22c55e' : '#ef4444') : 'transparent', color: adjustMode === m ? '#fff' : 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                          {m === 'add' ? <Plus size={13} /> : <Minus size={13} />}
                          {m === 'add' ? 'Add Points' : 'Deduct Points'}
                        </button>
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {QUICK_PRESETS.map(p => (
                        <button key={p} onClick={() => setPointsOffset(String(p))} style={{ padding: '6px 16px', fontSize: '12px', fontWeight: '700', borderRadius: '20px', border: '1px solid var(--border-color)', backgroundColor: pointsOffset === String(p) ? 'var(--primary)' : 'var(--bg-app)', color: pointsOffset === String(p) ? '#fff' : 'var(--text-secondary)', cursor: 'pointer', transition: 'all 0.15s' }}>
                          {adjustMode === 'add' ? '+' : '−'}{p}
                        </button>
                      ))}
                    </div>
                    <form onSubmit={handleAdjustPoints} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div style={{ position: 'relative' }}>
                        <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '14px', fontWeight: '900', color: adjustMode === 'add' ? '#22c55e' : '#ef4444' }}>{adjustMode === 'add' ? '+' : '−'}</span>
                        <input type="number" min="1" placeholder="Custom amount..." value={pointsOffset} onChange={e => setPointsOffset(e.target.value)}
                          style={{ width: '100%', padding: '10px 12px 10px 28px', fontSize: '14px', fontWeight: '700', borderRadius: '10px', border: `2px solid ${pointsOffset ? 'var(--primary)' : 'var(--border-color)'}`, backgroundColor: 'var(--bg-app)', color: 'var(--text-primary)', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
                        />
                      </div>
                      <input type="text" placeholder="Reason (optional)..." value={pointsReason} onChange={e => setPointsReason(e.target.value)}
                        style={{ width: '100%', padding: '9px 12px', fontSize: '13px', borderRadius: '10px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-app)', color: 'var(--text-primary)', outline: 'none', boxSizing: 'border-box' }}
                      />
                      <button type="submit" style={{ width: '100%', padding: '11px', fontSize: '13px', fontWeight: '700', borderRadius: '10px', border: 'none', cursor: 'pointer', background: adjustMode === 'add' ? 'linear-gradient(135deg, #22c55e, #16a34a)' : 'linear-gradient(135deg, #ef4444, #dc2626)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: adjustMode === 'add' ? '0 4px 12px rgba(34,197,94,0.3)' : '0 4px 12px rgba(239,68,68,0.3)' }}>
                        <CheckCircle size={15} /> {adjustMode === 'add' ? 'Add' : 'Deduct'} Points
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {/* Wishlist */}
            {activeTab === 'wishlist' && (
              <div>
                <SectionLabel icon={Heart} label="Customer Wishlist" count={activeCustomer.wishlist?.length ?? 0} />
                {!activeCustomer.wishlist?.length ? (
                  <div style={{ textAlign: 'center', padding: '48px 24px', backgroundColor: 'var(--bg-app)', border: '1px dashed var(--border-color)', borderRadius: '16px' }}>
                    <Heart size={40} style={{ color: 'var(--border-color)', marginBottom: '12px' }} />
                    <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: 0 }}>Wishlist is empty.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {activeCustomer.wishlist.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: 'var(--bg-app)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '14px 16px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0, background: 'linear-gradient(135deg, #fce7f3, #fdf2f8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Heart size={16} style={{ color: '#f43f5e' }} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '13px', fontWeight: '600' }}>{item}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>Saved to wishlist</div>
                        </div>
                        <Package size={13} style={{ color: 'var(--text-muted)' }} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Cart */}
            {activeTab === 'cart' && (
              <div>
                <SectionLabel icon={ShoppingCart} label="Active Cart" count={activeCustomer.cartItems?.length ?? 0} />
                {!activeCustomer.cartItems?.length ? (
                  <div style={{ textAlign: 'center', padding: '48px 24px', backgroundColor: 'var(--bg-app)', border: '1px dashed var(--border-color)', borderRadius: '16px' }}>
                    <ShoppingCart size={40} style={{ color: 'var(--border-color)', marginBottom: '12px' }} />
                    <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: 0 }}>Cart is empty.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {activeCustomer.cartItems.map((item, idx) => (
                      <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: 'var(--bg-app)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '14px 16px' }}>
                        <div style={{ width: '26px', height: '26px', borderRadius: '8px', flexShrink: 0, backgroundColor: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '800' }}>{idx + 1}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '13px', fontWeight: '600' }}>{item.name}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                            Qty <strong style={{ color: 'var(--text-primary)' }}>{item.qty}</strong> · ${item.price.toFixed(2)} each
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '15px', fontWeight: '900', color: 'var(--primary)' }}>${(item.price * item.qty).toFixed(2)}</div>
                          <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>subtotal</div>
                        </div>
                      </div>
                    ))}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderRadius: '12px', background: 'linear-gradient(135deg, var(--primary-light) 0%, transparent 100%)', border: '1px solid var(--primary)' }}>
                      <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--primary)' }}>Cart Total</span>
                      <span style={{ fontSize: '20px', fontWeight: '900', color: 'var(--primary)' }}>${cartTotal.toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Addresses */}
            {activeTab === 'addresses' && (
              <div>
                <SectionLabel icon={MapPin} label="Saved Addresses" count={activeCustomer.savedAddresses?.length ?? 0} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {activeCustomer.savedAddresses?.map(addr => (
                    <div key={addr.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', backgroundColor: 'var(--bg-app)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '14px 16px' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '10px', flexShrink: 0, backgroundColor: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <MapPin size={14} />
                      </div>
                      <div>
                        <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--primary)', letterSpacing: '0.05em', marginBottom: '4px' }}>{addr.label}</div>
                        <div style={{ fontSize: '13px', lineHeight: 1.5 }}>{addr.text}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}
      </Drawer>

    </div>
  );
};
export default Customers;
