import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Award, Calendar, CheckCircle, ExternalLink, Heart, Lock, Mail,
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
const getTier = (pts = 0) => {
  const p = Number(pts) || 0;
  if (p >= 500) return { label: 'Platinum', color: '#8b5cf6', bg: '#ede9fe', star: '👑' };
  if (p >= 200) return { label: 'Gold', color: '#d97706', bg: '#fef3c7', star: '⭐' };
  if (p >= 100) return { label: 'Silver', color: '#6b7280', bg: '#f3f4f6', star: '🥈' };
  return { label: 'Bronze', color: '#b45309', bg: '#fef9c3', star: '🥉' };
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
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const handleGoToProductDetails = (item) => {
    const itemName = typeof item === 'string'
      ? item
      : (item?.name || item?.title || item?.product_name || item?.product?.name || item?.product?.title || '');

    setDrawerOpen(false);
    navigate('/products', {
      state: {
        search: itemName,
        openProduct: typeof item === 'object' ? item : { name: itemName }
      }
    });
  };
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeCustomer, setActiveCustomer] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [pointsOffset, setPointsOffset] = useState('');
  const [pointsReason, setPointsReason] = useState('');
  const [adjustMode, setAdjustMode] = useState('add');
  const [visibleCols, setVisibleCols] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);
  const [viewMode, setViewMode] = useState(() => {
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
    const delta = adjustMode === 'add' ? raw : -raw;
    const nextPoints = Math.max(0, activeCustomer.rewardsPoints + delta);
    const updated = { ...activeCustomer, rewardsPoints: nextPoints };
    setCustomers(customers.map(c => c.id === activeCustomer.id ? updated : c));
    setActiveCustomer(updated);
    setPointsOffset('');
    setPointsReason('');
    const verb = adjustMode === 'add' ? 'Added' : 'Deducted';
    addToast(`${verb} ${raw} pts ${adjustMode === 'add' ? 'to' : 'from'} ${activeCustomer.name}`, 'success');
  };

  const handleToggleStatus = async () => {
    if (!activeCustomer?._id && !activeCustomer?.id) return;
    const custId = activeCustomer._id || activeCustomer.id;
    const isCurrentlyBlocked = activeCustomer.is_blocked || activeCustomer.status === 'Disabled';

    try {
      const { blockCustomer, unblockCustomer } = await import('../services/api');
      const res = isCurrentlyBlocked ? await unblockCustomer(custId) : await blockCustomer(custId);

      if (res && res.success && res.data?.customer) {
        const updatedCust = res.data.customer;
        const nextStatus = updatedCust.is_blocked ? 'Disabled' : (updatedCust.status || 'Active');

        const updated = {
          ...activeCustomer,
          is_blocked: updatedCust.is_blocked,
          status: nextStatus
        };

        setCustomers(customers.map(c => (c.id === custId || c._id === custId) ? updated : c));
        setActiveCustomer(updated);
        addToast(res.message || `Account marked as ${nextStatus}`, 'success');

        setAuditLogs([{
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString(),
          user: 'Admin',
          action: 'Customer Account Block/Unblock',
          module: 'Customers',
          detail: `Set ${activeCustomer.name} status to ${nextStatus}`
        }, ...auditLogs]);
      } else {
        addToast(res?.error || 'Failed to update customer status', 'error');
      }
    } catch (err) {
      console.error('Error toggling customer status:', err);
      addToast('Failed to update customer status', 'error');
    }
  };

  const startEditing = () => {
    setEditFirstName(activeCustomer.first_name || '');
    setEditLastName(activeCustomer.last_name || '');
    setEditEmail(activeCustomer.email || '');
    setEditPhone(activeCustomer.phone_number || activeCustomer.phone || '');
    setIsEditing(true);
  };

  const handleSaveProfile = async (e) => {
    if (e) e.preventDefault();
    if (!activeCustomer?._id && !activeCustomer?.id) return;
    const custId = activeCustomer._id || activeCustomer.id;

    if (!editFirstName.trim() || !editLastName.trim()) {
      addToast('First name and last name are required', 'warning');
      return;
    }
    if (!editEmail.trim()) {
      addToast('Email address is required', 'warning');
      return;
    }

    setSaveLoading(true);
    try {
      const { updateCustomer } = await import('../services/api');
      const payload = {
        first_name: editFirstName.trim(),
        last_name: editLastName.trim(),
        email: editEmail.trim(),
        phone_number: editPhone.trim()
      };

      const res = await updateCustomer(custId, payload);

      if (res && res.success && res.data?.customer) {
        const updatedCust = res.data.customer;
        const newName = `${updatedCust.first_name || ''} ${updatedCust.last_name || ''}`.trim() || 'Customer';

        const updated = {
          ...activeCustomer,
          ...updatedCust,
          name: newName,
          email: updatedCust.email,
          phone: updatedCust.phone_number || 'N/A'
        };

        // Update lists
        setCustomers(customers.map(c => (c.id === custId || c._id === custId) ? {
          ...c,
          name: newName,
          email: updatedCust.email,
          phone: updatedCust.phone_number || 'N/A'
        } : c));

        setActiveCustomer(updated);
        setIsEditing(false);
        addToast(res.message || 'Customer profile updated successfully', 'success');

        // Audit log
        setAuditLogs([{
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString(),
          user: 'Admin',
          action: 'Customer Profile Updated',
          module: 'Customers',
          detail: `Updated profile details for ${newName}`
        }, ...auditLogs]);
      } else {
        addToast(res?.error || 'Failed to update customer profile', 'error');
      }
    } catch (err) {
      console.error('Error updating customer profile:', err);
      addToast('Failed to update customer profile', 'error');
    } finally {
      setSaveLoading(false);
    }
  };

  const openDrawer = async (cust) => {
    setActiveCustomer(cust);
    setActiveTab('overview');
    setPointsOffset('');
    setDrawerOpen(true);

    const custId = cust._id || cust.id;
    if (!custId) return;

    try {
      const { getCustomerById, getCustomerWishlist, getCustomerCart } = await import('../services/api');
      const [detailsRes, wishlistRes, cartRes] = await Promise.all([
        getCustomerById(custId),
        getCustomerWishlist(custId),
        getCustomerCart(custId)
      ]);

      if (detailsRes && detailsRes.success && detailsRes.data?.customer) {
        const remoteCust = detailsRes.data.customer;
        const cartItems = cartRes?.data?.cart?.items || [];
        const remoteAddrs = remoteCust.addresses || [];
        const formattedSavedAddrs = remoteAddrs.length > 0 ? remoteAddrs.map(a => ({
          id: a._id || a.id,
          label: a.is_default ? 'Default Address' : 'Saved Address',
          text: [a.house_number, a.street_address, a.city, a.county, a.postcode, a.country].filter(Boolean).join(', ')
        })) : [];

        const primaryAddrStr = remoteAddrs.length > 0
          ? [remoteAddrs[0].house_number, remoteAddrs[0].street_address, remoteAddrs[0].city, remoteAddrs[0].postcode].filter(Boolean).join(', ')
          : 'N/A';

        const rawWishlistData = wishlistRes?.data?.wishlist?.products
          || wishlistRes?.data?.wishlist?.items
          || (Array.isArray(wishlistRes?.data?.wishlist) ? wishlistRes?.data?.wishlist : null)
          || wishlistRes?.data?.products
          || remoteCust.wishlist
          || prev?.wishlist
          || [];

        const safeWishlist = Array.isArray(rawWishlistData) ? rawWishlistData : [];

        setActiveCustomer(prev => ({
          ...prev,
          ...remoteCust,
          id: remoteCust._id,
          name: `${remoteCust.first_name || ''} ${remoteCust.last_name || ''}`.trim() || prev?.name || 'Customer',
          email: remoteCust.email || prev?.email,
          phone: remoteCust.phone_number || prev?.phone,
          status: remoteCust.is_blocked ? 'Disabled' : (remoteCust.status || 'Active'),
          wishlist: safeWishlist,
          cartItems: Array.isArray(cartItems) ? cartItems : [],
          cartSubTotal: cartRes?.data?.cart?.subTotal ?? 0,
          cartTotalAmount: cartRes?.data?.cart?.totalAmount ?? 0,
          addresses: remoteAddrs,
          savedAddresses: formattedSavedAddrs,
          address: primaryAddrStr
        }));
      }
    } catch (err) {
      console.error('Failed to fetch detailed customer data:', err);
    }
  };

  // ─── Remote API Fetch Integration ─────────────────────────────────────────
  React.useEffect(() => {
    let isMounted = true;
    const loadRemoteCustomers = async () => {
      setLoading(true);
      try {
        const params = {};
        if (search) params.search = search;
        if (filterStatus === 'active') params.status = 'Active';
        if (filterStatus === 'disabled') params.is_blocked = true;

        const response = await import('../services/api').then(m => m.fetchCustomers(params));
        if (response && response.success && response.data?.customers && isMounted) {
          const mapped = response.data.customers.map(c => ({
            id: c._id,
            name: `${c.first_name || ''} ${c.last_name || ''}`.trim() || 'Customer',
            email: c.email || '',
            phone: c.phone_number || 'N/A',
            lifetimeValue: c.lifetimeValue || 0,
            rewardsPoints: c.rewardsPoints || 0,
            status: c.is_blocked ? 'Disabled' : (c.status || (c.is_active ? 'Active' : 'Disabled')),
            wishlist: c.wishlist || [],
            cartItems: c.cartItems || [],
            addresses: c.addresses || [],
            savedAddresses: (c.addresses && c.addresses.length > 0) ? c.addresses.map(a => ({
              id: a._id || a.id,
              label: a.is_default ? 'Default Address' : 'Saved Address',
              text: [a.house_number, a.street_address, a.city, a.county, a.postcode, a.country].filter(Boolean).join(', ')
            })) : [],
            address: (c.addresses && c.addresses[0])
              ? [c.addresses[0].house_number, c.addresses[0].street_address, c.addresses[0].city, c.addresses[0].postcode].filter(Boolean).join(', ')
              : (c.address || 'N/A'),
            joinedDate: c.createdAt ? new Date(c.createdAt).toLocaleDateString() : (c.joinedDate || 'N/A')
          }));
          setCustomers(mapped);
        }
      } catch (err) {
        console.error('Failed to load customers from API:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadRemoteCustomers();
    return () => { isMounted = false; };
  }, [search, filterStatus]);

  const activeCount = customers.filter(c => c.status === 'Active').length;
  const tier = activeCustomer ? getTier(activeCustomer.rewardsPoints) : null;
  const wishlistCount = Array.isArray(activeCustomer?.wishlist) ? activeCustomer.wishlist.length : 0;
  const cartCount = Array.isArray(activeCustomer?.cartItems) ? activeCustomer.cartItems.length : 0;
  const cartTotal = Array.isArray(activeCustomer?.cartItems)
    ? activeCustomer.cartItems.reduce((s, i) => s + (Number(i?.price) || 0) * (Number(i?.qty) || 1), 0)
    : 0;

  const filtered = (customers || []).map(c => {
    const cName = typeof c?.name === 'string' ? c.name : (`${c?.first_name || ''} ${c?.last_name || ''}`.trim() || 'Customer');
    const cEmail = c?.email || '';
    const cPhone = String(c?.phone || c?.phone_number || '');
    const cLtv = Number(c?.lifetimeValue) || 0;
    const cPts = Number(c?.rewardsPoints) || 0;
    const cStatus = c?.is_blocked ? 'Disabled' : (c?.status || (c?.is_active ? 'Active' : 'Disabled'));
    return {
      ...c,
      id: c?.id || c?._id,
      name: cName,
      email: cEmail,
      phone: cPhone,
      lifetimeValue: cLtv,
      rewardsPoints: cPts,
      status: cStatus
    };
  }).filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search);
    const matchStatus = filterStatus === 'all' ? true
      : filterStatus === 'active' ? c.status === 'Active'
        : c.status !== 'Active';
    return matchSearch && matchStatus;
  });

  const DRAWER_TABS = [
    { id: 'overview', label: 'Overview' },
    { id: 'rewards', label: 'Rewards' },
    { id: 'wishlist', label: `Wishlist (${wishlistCount})` },
    { id: 'cart', label: `Cart (${cartCount})` },
    { id: 'addresses', label: 'Addresses' },
  ];

  const columns = [
    {
      key: 'name', label: 'Customer',
      render: row => {
        const nameStr = row?.name || 'Customer';
        const initials = nameStr.split(' ').map(n => n[0]).filter(Boolean).join('').slice(0, 2) || 'C';
        const tierObj = getTier(row?.rewardsPoints);
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
              background: `linear-gradient(135deg, ${tierObj.color}, ${tierObj.color}99)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '11px', fontWeight: '900', color: '#fff'
            }}>
              {initials}
            </div>
            <div>
              <div style={{ fontWeight: '700', fontSize: '13px' }}>{nameStr}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{row?.email || 'N/A'}</div>
            </div>
          </div>
        );
      }
    },
    { key: 'phone', label: 'Phone', render: row => <span style={{ fontSize: '12px' }}>{row?.phone || 'N/A'}</span> },
    {
      key: 'lifetimeValue', label: 'LTV',
      render: row => <span style={{ fontWeight: '700', color: 'var(--primary)' }}>£{(Number(row?.lifetimeValue) || 0).toFixed(2)}</span>
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
          { label: 'Total Customers', value: customers.length, color: '#6366f1', bg: '#ede9fe' },
          { label: 'Active', value: activeCount, color: '#16a34a', bg: '#dcfce7' },
          { label: 'Disabled', value: customers.length - activeCount, color: '#ef4444', bg: '#fee2e2' },
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
            { id: 'all', label: `All (${customers.length})` },
            { id: 'active', label: `Active (${activeCount})` },
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
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', backgroundColor: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
          <div style={{ width: '36px', height: '36px', border: '3px solid var(--border-color)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          <p style={{ marginTop: '16px', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '600' }}>Fetching live customer records...</p>
        </div>
      ) : viewMode === 'list' ? (
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
        onClose={() => { setDrawerOpen(false); setIsEditing(false); }}
        title=""
        size="lg"
        footer={
          activeCustomer ? (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {isEditing ? (
                <>
                  <Button variant="primary" size="sm" onClick={handleSaveProfile} loading={saveLoading}>
                    Save Changes
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="primary" size="sm" onClick={startEditing}>
                    Edit Profile
                  </Button>
                  <Button variant={activeCustomer.status === 'Active' ? 'danger' : 'success'} size="sm"
                    icon={activeCustomer.status === 'Active' ? UserX : ShieldX} onClick={handleToggleStatus}>
                    {activeCustomer.status === 'Active' ? 'Disable Account' : 'Enable Account'}
                  </Button>
                  <Button variant="outline" size="sm" icon={Lock}
                    onClick={() => addToast(`Password reset sent to ${activeCustomer.email}`, 'info')}>
                    Reset Password
                  </Button>
                </>
              )}
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
                  { icon: TrendingUp, label: 'Lifetime Value', value: `£${activeCustomer.lifetimeValue.toFixed(2)}` },
                  { icon: Award, label: 'Points', value: `${activeCustomer.rewardsPoints.toLocaleString()} pts` },
                  { icon: Star, label: 'Tier', value: `${tier.star} ${tier.label}` },
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
                <button key={t.id} onClick={() => { setActiveTab(t.id); setIsEditing(false); }} style={{
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
                {isEditing ? (
                  <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--primary)' }}></div>
                      <span style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>Edit Customer Profile</span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)' }}>First Name</label>
                        <input
                          type="text"
                          value={editFirstName}
                          onChange={e => setEditFirstName(e.target.value)}
                          required
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            fontSize: '13px',
                            borderRadius: '8px',
                            border: '1px solid var(--border-color)',
                            backgroundColor: 'var(--bg-app)',
                            color: 'var(--text-primary)',
                            outline: 'none',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)' }}>Last Name</label>
                        <input
                          type="text"
                          value={editLastName}
                          onChange={e => setEditLastName(e.target.value)}
                          required
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            fontSize: '13px',
                            borderRadius: '8px',
                            border: '1px solid var(--border-color)',
                            backgroundColor: 'var(--bg-app)',
                            color: 'var(--text-primary)',
                            outline: 'none',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)' }}>Email Address</label>
                      <input
                        type="email"
                        value={editEmail}
                        onChange={e => setEditEmail(e.target.value)}
                        required
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          fontSize: '13px',
                          borderRadius: '8px',
                          border: '1px solid var(--border-color)',
                          backgroundColor: 'var(--bg-app)',
                          color: 'var(--text-primary)',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)' }}>Phone Number</label>
                      <input
                        type="text"
                        value={editPhone}
                        onChange={e => setEditPhone(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          fontSize: '13px',
                          borderRadius: '8px',
                          border: '1px solid var(--border-color)',
                          backgroundColor: 'var(--bg-app)',
                          color: 'var(--text-primary)',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                  </form>
                ) : (
                  <>
                    {[
                      { icon: Mail, label: 'Email', value: activeCustomer.email },
                      { icon: Phone, label: 'Phone', value: activeCustomer.phone },
                      { icon: MapPin, label: 'Address', value: activeCustomer.address },
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
                        <div style={{ fontSize: '22px', fontWeight: '900' }}>{wishlistCount}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Wishlist Items</div>
                      </div>
                      <div style={{ backgroundColor: 'var(--bg-app)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                        <ShoppingCart size={20} style={{ color: 'var(--primary)', marginBottom: '6px' }} />
                        <div style={{ fontSize: '22px', fontWeight: '900' }}>{cartCount}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Cart Items</div>
                      </div>
                    </div>
                  </>
                )}
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
            )
            }

            {/* Wishlist */}
            {
              activeTab === 'wishlist' && (
                <div>
                  <SectionLabel icon={Heart} label="Customer Wishlist" count={wishlistCount} />
                  {!wishlistCount ? (
                    <div style={{ textAlign: 'center', padding: '48px 24px', backgroundColor: 'var(--bg-app)', border: '1px dashed var(--border-color)', borderRadius: '16px' }}>
                      <Heart size={40} style={{ color: 'var(--border-color)', marginBottom: '12px' }} />
                      <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: 0 }}>Wishlist is empty.</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {activeCustomer.wishlist.map((item, idx) => {
                        const itemName = typeof item === 'string'
                          ? item
                          : (item?.name || item?.title || item?.product_name || item?.product?.name || item?.product?.title || item?.id || `Wishlist Item ${idx + 1}`);
                        const itemPrice = typeof item === 'object' && (item?.price || item?.product?.price)
                          ? (item?.price || item?.product?.price)
                          : null;

                        return (
                          <div
                            key={item?.id || item?._id || idx}
                            onClick={() => handleGoToProductDetails(item)}
                            style={{
                              display: 'flex', alignItems: 'center', gap: '12px',
                              backgroundColor: 'var(--bg-app)', border: '1px solid var(--border-color)',
                              borderRadius: '12px', padding: '14px 16px', cursor: 'pointer',
                              transition: 'transform 0.15s ease, border-color 0.15s ease'
                            }}
                            title="Click to view product details"
                          >
                            <div style={{ width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0, background: 'linear-gradient(135deg, #fce7f3, #fdf2f8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Heart size={16} style={{ color: '#f43f5e' }} />
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--primary)' }}>{itemName}</div>
                              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                                Saved to wishlist {itemPrice != null ? `· £${Number(itemPrice).toFixed(2)}` : ''}
                              </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: '700', color: 'var(--primary)', backgroundColor: 'var(--primary-light)', padding: '4px 8px', borderRadius: '8px' }}>
                              <span>View</span>
                              <ExternalLink size={12} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )
            }

            {/* Cart */}
            {
              activeTab === 'cart' && (
                <div>
                  <SectionLabel icon={ShoppingCart} label="Active Cart" count={cartCount} />
                  {!cartCount ? (
                    <div style={{ textAlign: 'center', padding: '48px 24px', backgroundColor: 'var(--bg-app)', border: '1px dashed var(--border-color)', borderRadius: '16px' }}>
                      <ShoppingCart size={40} style={{ color: 'var(--border-color)', marginBottom: '12px' }} />
                      <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: 0 }}>Cart is empty.</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {activeCustomer.cartItems.map((item, idx) => {
                        const name = item?.name || item?.product_name || item?.product?.name || `Cart Item ${idx + 1}`;
                        const qty = Number(item?.qty) || 1;
                        const price = Number(item?.price || item?.product?.price) || 0;

                        return (
                          <div
                            key={item?.id || item?._id || idx}
                            onClick={() => handleGoToProductDetails(item)}
                            style={{
                              display: 'flex', alignItems: 'center', gap: '12px',
                              backgroundColor: 'var(--bg-app)', border: '1px solid var(--border-color)',
                              borderRadius: '12px', padding: '14px 16px', cursor: 'pointer',
                              transition: 'transform 0.15s ease, border-color 0.15s ease'
                            }}
                            title="Click to view product details"
                          >
                            <div style={{ width: '26px', height: '26px', borderRadius: '8px', flexShrink: 0, backgroundColor: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '800' }}>{idx + 1}</div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--primary)' }}>{name}</div>
                              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                                Qty <strong style={{ color: 'var(--text-primary)' }}>{qty}</strong> · £{price.toFixed(2)} each
                              </div>
                            </div>
                            <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                              <div style={{ fontSize: '15px', fontWeight: '900', color: 'var(--primary)' }}>£{(price * qty).toFixed(2)}</div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '10px', color: 'var(--text-muted)' }}>
                                <span>View Product</span>
                                <ExternalLink size={10} />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderRadius: '12px', background: 'linear-gradient(135deg, var(--primary-light) 0%, transparent 100%)', border: '1px solid var(--primary)' }}>
                        <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--primary)' }}>Cart Total</span>
                        <span style={{ fontSize: '20px', fontWeight: '900', color: 'var(--primary)' }}>£{cartTotal.toFixed(2)}</span>
                      </div>
                    </div>
                  )}
                </div>
              )
            }

            {/* Addresses */}
            {
              activeTab === 'addresses' && (
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
              )
            }

          </div >
        )}
      </Drawer >

    </div >
  );
};
export default Customers;
