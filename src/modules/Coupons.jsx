import React, { useState } from 'react';
import {
  Calendar, CheckCircle, Clock, Copy, Edit3, Percent, Plus, ShoppingBag,
  Tag, Ticket, Trash2, ToggleLeft, ToggleRight, Truck, XCircle, Zap
} from 'lucide-react';
import Button from '../components/Button';
import { StatsCard } from '../components/Card';
import Modal from '../components/Modal';
import Input, { Select } from '../components/Input';
import Badge from '../components/Badge';
import ListView from '../components/ListView';
import ViewToggle from '../components/ViewToggle';
import { TableShimmer, ShimmerCardGrid } from '../components/ShimmerSkeleton';

// ─── Coupon type config ───────────────────────────────────────────────────────
const TYPE_CONFIG = {
  'Percentage': { label: '% OFF', color: '#6366f1', bg: '#ede9fe', icon: Percent },
  'Fixed Amount': { label: 'CASHBACK', color: '#0ea5e9', bg: '#e0f2fe', icon: Tag },
  'Free Shipping': { label: 'FREE SHIP', color: '#10b981', bg: '#d1fae5', icon: Truck },
  'Buy X Get Y': { label: 'BOGO', color: '#f59e0b', bg: '#fef3c7', icon: Zap },
};

// ─── Dashed separator ──────────────────────────────────────────────────────────
const DashedDivider = () => (
  <div style={{
    position: 'relative', display: 'flex', alignItems: 'center', margin: '0 -24px',
    height: '0px'
  }}>
    <div style={{
      flex: 1, borderTop: '2px dashed var(--border-color)',
      margin: '0 20px'
    }} />
    {/* Left notch */}
    <div style={{
      position: 'absolute', left: '-10px', width: '20px', height: '20px',
      borderRadius: '50%', backgroundColor: 'var(--bg-app)',
      border: '1px solid var(--border-color)'
    }} />
    {/* Right notch */}
    <div style={{
      position: 'absolute', right: '-10px', width: '20px', height: '20px',
      borderRadius: '50%', backgroundColor: 'var(--bg-app)',
      border: '1px solid var(--border-color)'
    }} />
  </div>
);

// ─── Individual Coupon Card ───────────────────────────────────────────────────
const CouponCard = ({ coupon, onToggle, onDelete, onCopy, onEdit }) => {
  const isDateExpired = new Date(coupon.end) < new Date();
  const isActive = coupon.status === 'Active' && !isDateExpired;
  const cfg = TYPE_CONFIG[coupon.type] || TYPE_CONFIG['Percentage'];
  const TypeIcon = cfg.icon;
  const usagePct = Math.min(100, Math.round((coupon.usedCount / coupon.usageLimit) * 100));

  // Days remaining
  const daysLeft = Math.max(0, Math.ceil((new Date(coupon.end) - new Date()) / (1000 * 60 * 60 * 24)));

  return (
    <div style={{
      backgroundColor: 'var(--bg-card)',
      border: `1.5px solid ${isActive ? cfg.color + '44' : 'var(--border-color)'}`,
      borderRadius: '16px',
      overflow: 'hidden',
      transition: 'all 0.25s ease',
      opacity: isDateExpired ? 0.6 : 1,
      boxShadow: isActive ? `0 4px 20px ${cfg.color}18` : 'none',
      position: 'relative'
    }}>
      {/* Top stripe accent */}
      <div style={{
        height: '4px',
        background: isActive
          ? `linear-gradient(90deg, ${cfg.color}, ${cfg.color}88)`
          : 'var(--border-color)'
      }} />

      {/* ── Top Section ── */}
      <div style={{ padding: '18px 24px 14px', display: 'flex', alignItems: 'flex-start', gap: '14px' }}>

        {/* Type icon circle */}
        <div style={{
          width: '48px', height: '48px', borderRadius: '12px', flexShrink: 0,
          backgroundColor: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <TypeIcon size={22} style={{ color: cfg.color }} />
        </div>

        {/* Code + type */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{
              fontFamily: 'monospace', fontSize: '18px', fontWeight: '900',
              letterSpacing: '2px', color: 'var(--text-primary)'
            }}>
              {coupon.code}
            </span>
            <button
              onClick={() => onCopy(coupon.code)}
              title="Copy code"
              style={{
                border: 'none', background: 'none', cursor: 'pointer',
                color: 'var(--text-muted)', padding: '2px', borderRadius: '4px',
                display: 'flex', alignItems: 'center'
              }}
            >
              <Copy size={13} />
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
            <span style={{
              fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '20px',
              backgroundColor: cfg.bg, color: cfg.color
            }}>
              {cfg.label}
            </span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {coupon.type}
            </span>
          </div>
        </div>

        {/* Discount value chip */}
        <div style={{
          flexShrink: 0, textAlign: 'center',
          backgroundColor: cfg.bg, borderRadius: '12px', padding: '8px 14px'
        }}>
          <div style={{ fontSize: '22px', fontWeight: '900', color: cfg.color, lineHeight: 1 }}>
            {coupon.type === 'Percentage'
              ? `${coupon.value}%`
              : coupon.type === 'Free Shipping'
                ? '🚚'
                : `£${coupon.value}`}
          </div>
          <div style={{ fontSize: '9px', color: cfg.color, fontWeight: '700', marginTop: '2px', textTransform: 'uppercase' }}>
            {coupon.type === 'Free Shipping' ? 'Free' : 'Off'}
          </div>
        </div>
      </div>

      {/* ── Dashed ticket tear ── */}
      <DashedDivider />

      {/* ── Bottom Section ── */}
      <div style={{ padding: '14px 24px 18px' }}>

        {/* Meta row */}
        <div style={{
          display: 'flex', gap: '16px', flexWrap: 'wrap',
          fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px'
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Calendar size={11} />
            {coupon.start} → {coupon.end}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ShoppingBag size={11} />
            Min £{coupon.minOrder.toFixed(2)}
          </span>
          {!isDateExpired && (
            <span style={{
              display: 'flex', alignItems: 'center', gap: '4px',
              color: daysLeft <= 5 ? '#ef4444' : 'var(--text-muted)'
            }}>
              <Clock size={11} />
              {daysLeft}d left
            </span>
          )}
          {(coupon.categories?.length > 0 || coupon.brands?.length > 0) && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Tag size={11} />
              {[...coupon.categories, ...coupon.brands].join(', ')}
            </span>
          )}
        </div>

        {/* Usage progress bar */}
        <div style={{ marginBottom: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '5px' }}>
            <span style={{ color: 'var(--text-muted)', fontWeight: '600' }}>Usage</span>
            <span style={{ color: 'var(--text-primary)', fontWeight: '700' }}>
              {coupon.usedCount} / {coupon.usageLimit}
              <span style={{ color: 'var(--text-muted)', fontWeight: '500' }}> ({usagePct}%)</span>
            </span>
          </div>
          <div style={{ height: '6px', borderRadius: '6px', backgroundColor: 'var(--border-color)', overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${usagePct}%`,
              borderRadius: '6px',
              background: usagePct > 85
                ? 'linear-gradient(90deg, #ef4444, #dc2626)'
                : `linear-gradient(90deg, ${cfg.color}, ${cfg.color}cc)`,
              transition: 'width 0.6s ease'
            }} />
          </div>
        </div>

        {/* Actions row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Status indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {isDateExpired ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', fontWeight: '700', color: '#ef4444' }}>
                <XCircle size={14} /> Expired
              </span>
            ) : isActive ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', fontWeight: '700', color: '#16a34a' }}>
                <CheckCircle size={14} /> Active
              </span>
            ) : (
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', fontWeight: '700', color: '#d97706' }}>
                <ToggleLeft size={14} /> Inactive
              </span>
            )}
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Toggle button */}
            <button
              onClick={() => onToggle(coupon._id || coupon.id)}
              disabled={isDateExpired}
              title={isDateExpired ? 'Coupon date expired' : isActive ? 'Deactivate' : 'Activate'}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '7px 14px', fontSize: '12px', fontWeight: '700',
                borderRadius: '20px', border: 'none',
                cursor: isDateExpired ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                backgroundColor: isDateExpired
                  ? 'var(--border-color)'
                  : isActive
                    ? 'rgba(239,68,68,0.1)'
                    : 'rgba(34,197,94,0.12)',
                color: isDateExpired
                  ? 'var(--text-muted)'
                  : isActive
                    ? '#dc2626'
                    : '#16a34a',
                opacity: isDateExpired ? 0.5 : 1
              }}
              onMouseEnter={e => {
                if (!isDateExpired) {
                  e.currentTarget.style.backgroundColor = isActive ? '#dc2626' : '#16a34a';
                  e.currentTarget.style.color = '#fff';
                }
              }}
              onMouseLeave={e => {
                if (!isDateExpired) {
                  e.currentTarget.style.backgroundColor = isActive ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.12)';
                  e.currentTarget.style.color = isActive ? '#dc2626' : '#16a34a';
                }
              }}
            >
              {isActive
                ? <><ToggleLeft size={14} /> Deactivate</>
                : <><ToggleRight size={14} /> Activate</>
              }
            </button>

            {/* Edit button */}
            <button
              onClick={() => onEdit && onEdit(coupon)}
              title="Edit coupon"
              style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: '32px', height: '32px', borderRadius: '10px', border: 'none',
                backgroundColor: 'rgba(99,102,241,0.08)', color: 'var(--primary)',
                cursor: 'pointer', transition: 'all 0.2s'
              }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--primary)'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'rgba(99,102,241,0.08)'; e.currentTarget.style.color = 'var(--primary)'; }}
            >
              <Edit3 size={14} />
            </button>

            {/* Delete button */}
            <button
              onClick={() => onDelete(coupon._id || coupon.id)}
              title="Delete coupon"
              style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: '32px', height: '32px', borderRadius: '10px', border: 'none',
                backgroundColor: 'rgba(239,68,68,0.08)', color: '#ef4444',
                cursor: 'pointer', transition: 'all 0.2s'
              }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#ef4444'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.08)'; e.currentTarget.style.color = '#ef4444'; }}
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main Module ──────────────────────────────────────────────────────────────
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
  const [filterStatus, setFilterStatus] = useState('all'); // all | active | inactive | expired
  const [viewMode, setViewMode] = useState(() => localStorage.getItem('view-mode-coupons') || 'grid');

  const handleViewChange = (newView) => {
    setViewMode(newView);
    localStorage.setItem('view-mode-coupons', newView);
  };

  // Form fields
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('Percentage');
  const [value, setValue] = useState(20);
  const [usageLimit, setUsageLimit] = useState(500);
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [minOrder, setMinOrder] = useState(499);
  const [maxDiscountAmount, setMaxDiscountAmount] = useState(100);
  const [appCat, setAppCat] = useState('All');
  const [appBrand, setAppBrand] = useState('All');

  const [usageReport, setUsageReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Load live coupons & usage report on mount
  React.useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      setLoading(true);
      try {
        const { fetchCoupons, getCouponUsageReport } = await import('../services/api');
        const [couponsRes, reportRes] = await Promise.all([
          fetchCoupons(),
          getCouponUsageReport()
        ]);

        if (couponsRes && couponsRes.success && couponsRes.data?.coupons && Array.isArray(couponsRes.data.coupons) && isMounted) {
          const mapped = couponsRes.data.coupons.map(c => ({
            id: c._id || c.id,
            _id: c._id || c.id,
            code: c.code,
            description: c.description || '',
            type: c.discountType === 'percentage' ? 'Percentage' : c.discountType === 'free_shipping' ? 'Free Shipping' : 'Fixed Amount',
            value: c.discountValue || 0,
            usageLimit: c.usageLimit || 0,
            usedCount: c.usedCount || 0,
            start: c.startDate ? c.startDate.split('T')[0] : '',
            end: c.endDate ? c.endDate.split('T')[0] : '',
            minOrder: c.minPurchaseAmount || 0,
            maxDiscountAmount: c.maxDiscountAmount || 0,
            status: c.isActive ? 'Active' : 'Inactive',
            categories: c.categories || [],
            brands: c.brands || []
          }));
          setCoupons(mapped);
        }

        if (reportRes && reportRes.success && reportRes.data?.report && isMounted) {
          setUsageReport(reportRes.data.report);
        }
      } catch (err) {
        console.error('Failed to fetch remote coupon data:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadData();
    return () => { isMounted = false; };
  }, []);

  const [editingCoupon, setEditingCoupon] = useState(null);

  const openCreateModal = () => {
    setEditingCoupon(null);
    setCode(`PROMO${Math.random().toString(36).substr(2, 4).toUpperCase()}`);
    setDescription('Festival offer');
    setType('Percentage');
    setValue(20);
    setUsageLimit(500);
    setStart(new Date().toISOString().split('T')[0]);
    const future = new Date();
    future.setDate(future.getDate() + 30);
    setEnd(future.toISOString().split('T')[0]);
    setMinOrder(499);
    setMaxDiscountAmount(100);
    setAppCat('All');
    setAppBrand('All');
    setModalOpen(true);
  };

  const openEditModal = (coupon) => {
    setEditingCoupon(coupon);
    setCode(coupon.code || '');
    setDescription(coupon.description || '');
    setType(coupon.type || 'Percentage');
    setValue(coupon.value || 0);
    setUsageLimit(coupon.usageLimit || 0);
    setStart(coupon.start || (coupon.startDate ? coupon.startDate.split('T')[0] : ''));
    setEnd(coupon.end || (coupon.endDate ? coupon.endDate.split('T')[0] : ''));
    setMinOrder(coupon.minOrder || coupon.minPurchaseAmount || 0);
    setMaxDiscountAmount(coupon.maxDiscountAmount || 0);
    setAppCat(coupon.categories && coupon.categories.length > 0 ? coupon.categories[0] : 'All');
    setAppBrand(coupon.brands && coupon.brands.length > 0 ? coupon.brands[0] : 'All');
    setModalOpen(true);
  };

  const handleSaveCoupon = async (e) => {
    e.preventDefault();
    if (!code) { addToast('Coupon code is required', 'danger'); return; }
    setSubmitting(true);

    const apiDiscountType = type.toLowerCase().includes('percent')
      ? 'percentage'
      : type.toLowerCase().includes('free')
        ? 'free_shipping'
        : 'fixed';

    const apiPayload = {
      code: code.toUpperCase(),
      description: description || `${code.toUpperCase()} discount offer`,
      discountType: apiDiscountType,
      discountValue: Number(value) || 0,
      minPurchaseAmount: Number(minOrder) || 0,
      maxDiscountAmount: Number(maxDiscountAmount) || 0,
      startDate: start ? new Date(start).toISOString() : new Date().toISOString(),
      endDate: end ? new Date(end).toISOString() : new Date(Date.now() + 30 * 86400000).toISOString(),
      isActive: editingCoupon ? (editingCoupon.status === 'Active') : true,
      usageLimit: Number(usageLimit) || 500
    };

    try {
      const { createCoupon, updateCoupon } = await import('../services/api');
      let res;

      if (editingCoupon && (editingCoupon._id || editingCoupon.id)) {
        const couponId = editingCoupon._id || editingCoupon.id;
        res = await updateCoupon(couponId, apiPayload);
      } else {
        res = await createCoupon(apiPayload);
      }

      if (res && (res.success || res.statusCode === 200 || res.statusCode === 201)) {
        const resultCoupon = res.data?.coupon || res.coupon;
        const targetId = editingCoupon ? (editingCoupon.id || editingCoupon._id) : (resultCoupon?._id || `c-${Date.now()}`);

        const updatedObj = {
          id: targetId,
          _id: resultCoupon?._id || editingCoupon?._id || targetId,
          code: resultCoupon?.code || code.toUpperCase(),
          description: resultCoupon?.description || description,
          type: (resultCoupon?.discountType || apiDiscountType) === 'percentage' ? 'Percentage' : (resultCoupon?.discountType || apiDiscountType) === 'free_shipping' ? 'Free Shipping' : 'Fixed Amount',
          value: resultCoupon?.discountValue ?? Number(value),
          usageLimit: resultCoupon?.usageLimit ?? Number(usageLimit),
          usedCount: resultCoupon?.usedCount ?? editingCoupon?.usedCount ?? 0,
          start: resultCoupon?.startDate ? resultCoupon.startDate.split('T')[0] : start,
          end: resultCoupon?.endDate ? resultCoupon.endDate.split('T')[0] : end,
          minOrder: resultCoupon?.minPurchaseAmount ?? Number(minOrder),
          maxDiscountAmount: resultCoupon?.maxDiscountAmount ?? Number(maxDiscountAmount),
          status: (resultCoupon?.isActive ?? true) ? 'Active' : 'Inactive',
          categories: appCat === 'All' ? [] : [appCat],
          brands: appBrand === 'All' ? [] : [appBrand]
        };

        if (editingCoupon) {
          setCoupons(coupons.map(c => (c.id === targetId || c._id === targetId) ? updatedObj : c));
          addToast(res.message || `Coupon ${updatedObj.code} updated successfully`, 'success');
        } else {
          setCoupons([updatedObj, ...coupons]);
          addToast(res.message || `Coupon ${updatedObj.code} created successfully`, 'success');
        }
      } else {
        const localObj = {
          id: editingCoupon ? (editingCoupon.id || editingCoupon._id) : `c-${Date.now()}`,
          code: code.toUpperCase(),
          description,
          type, value: Number(value), usageLimit: Number(usageLimit),
          usedCount: editingCoupon?.usedCount || 0, start, end,
          minOrder: Number(minOrder),
          maxDiscountAmount: Number(maxDiscountAmount) || 0,
          categories: appCat === 'All' ? [] : [appCat],
          brands: appBrand === 'All' ? [] : [appBrand],
          status: editingCoupon ? editingCoupon.status : 'Active'
        };
        if (editingCoupon) {
          setCoupons(coupons.map(c => (c.id === localObj.id || c._id === localObj.id) ? localObj : c));
          addToast(res?.error || `Coupon ${localObj.code} updated`, 'success');
        } else {
          setCoupons([localObj, ...coupons]);
          addToast(res?.error || `Coupon ${localObj.code} created & activated`, 'success');
        }
      }
    } catch (err) {
      console.error('Error submitting coupon to API:', err);
      const localObj = {
        id: editingCoupon ? (editingCoupon.id || editingCoupon._id) : `c-${Date.now()}`,
        code: code.toUpperCase(),
        description,
        type, value: Number(value), usageLimit: Number(usageLimit),
        usedCount: editingCoupon?.usedCount || 0, start, end,
        minOrder: Number(minOrder),
        maxDiscountAmount: Number(maxDiscountAmount) || 0,
        categories: appCat === 'All' ? [] : [appCat],
        brands: appBrand === 'All' ? [] : [appBrand],
        status: editingCoupon ? editingCoupon.status : 'Active'
      };
      if (editingCoupon) {
        setCoupons(coupons.map(c => (c.id === localObj.id || c._id === localObj.id) ? localObj : c));
        addToast(`Coupon ${localObj.code} updated`, 'success');
      } else {
        setCoupons([localObj, ...coupons]);
        addToast(`Coupon ${localObj.code} created & activated`, 'success');
      }
    }

    setAuditLogs([{
      id: `log-${Date.now()}`, timestamp: new Date().toISOString(),
      user: 'Admin', action: editingCoupon ? 'Coupon Updated' : 'Promo Code Activated',
      module: 'Coupons', detail: `${editingCoupon ? 'Updated' : 'Created'} promotion rule code: ${code.toUpperCase()}`
    }, ...auditLogs]);
    setSubmitting(false);
    setModalOpen(false);
    setEditingCoupon(null);
  };

  const handleDelete = async (id) => {
    const deleted = coupons.find(c => c.id === id || c._id === id);
    try {
      const { deleteCoupon } = await import('../services/api');
      if (deleted?._id || deleted?.id) {
        await deleteCoupon(deleted._id || deleted.id);
      }
    } catch (err) {
      console.error('Error deleting coupon API:', err);
    }
    setCoupons(coupons.filter(c => c.id !== id && c._id !== id));
    addToast(`Coupon ${deleted?.code} deleted`, 'warning');
    setAuditLogs([{
      id: `log-${Date.now()}`, timestamp: new Date().toISOString(),
      user: 'Admin', action: 'Coupon Deleted',
      module: 'Coupons', detail: `Removed promotion code: ${deleted?.code}`
    }, ...auditLogs]);
  };

  const handleToggleStatus = async (id) => {
    const coupon = coupons.find(c => c.id === id || c._id === id);
    if (!coupon) return;
    if (new Date(coupon.end) < new Date()) {
      addToast('Cannot activate an expired coupon — update the expiry date first', 'warning');
      return;
    }
    const nextStatus = coupon.status === 'Active' ? 'Inactive' : 'Active';
    const nextIsActive = nextStatus === 'Active';

    try {
      const { toggleCouponStatus } = await import('../services/api');
      if (coupon._id || coupon.id) {
        await toggleCouponStatus(coupon._id || coupon.id, nextIsActive);
      }
    } catch (err) {
      console.error('Error toggling status API:', err);
    }

    setCoupons(coupons.map(c => (c.id === id || c._id === id) ? { ...c, status: nextStatus, isActive: nextIsActive } : c));
    addToast(`${coupon.code} is now ${nextStatus}`, nextStatus === 'Active' ? 'success' : 'warning');
    setAuditLogs([{
      id: `log-${Date.now()}`, timestamp: new Date().toISOString(),
      user: 'Admin',
      action: `Coupon ${nextStatus === 'Active' ? 'Activated' : 'Deactivated'}`,
      module: 'Coupons', detail: `Set coupon ${coupon.code} status to ${nextStatus}`
    }, ...auditLogs]);
  };

  const handleCopy = (code) => {
    navigator.clipboard?.writeText(code);
    addToast(`Copied ${code} to clipboard`, 'info');
  };

  // Derived stats & safe mapping
  const now = new Date();
  const safeCoupons = (coupons || []).map(c => ({
    ...c,
    id: c?.id || c?._id,
    code: c?.code || 'PROMO',
    type: c?.type || 'Percentage',
    value: Number(c?.value || c?.discountValue) || 0,
    usedCount: Number(c?.usedCount || c?.redemptionCount) || 0,
    usageLimit: Number(c?.usageLimit) || 100,
    minOrder: Number(c?.minOrder || c?.minPurchaseAmount) || 0,
    start: c?.start || (c?.startDate ? (typeof c.startDate === 'string' ? c.startDate.split('T')[0] : '') : '2026-01-01'),
    end: c?.end || (c?.endDate ? (typeof c.endDate === 'string' ? c.endDate.split('T')[0] : '') : '2026-12-31'),
    status: c?.status || (c?.isActive !== false ? 'Active' : 'Inactive')
  }));

  const activeCount = usageReport?.totalActiveCoupons ?? safeCoupons.filter(c => c.status === 'Active' && new Date(c.end) >= now).length;
  const inactiveCount = safeCoupons.filter(c => c.status !== 'Active' && new Date(c.end) >= now).length;
  const expiredCount = safeCoupons.filter(c => new Date(c.end) < now).length;
  const totalClaims = usageReport?.totalRedemptions ?? safeCoupons.reduce((s, c) => s + c.usedCount, 0);

  // Filtered list
  const filtered = safeCoupons.filter(c => {
    const exp = new Date(c.end) < now;
    if (filterStatus === 'active') return !exp && c.status === 'Active';
    if (filterStatus === 'inactive') return !exp && c.status !== 'Active';
    if (filterStatus === 'expired') return exp;
    return true;
  });

  const FILTER_TABS = [
    { id: 'all', label: `All (${safeCoupons.length})` },
    { id: 'active', label: `Active (${activeCount})` },
    { id: 'inactive', label: `Inactive (${inactiveCount})` },
    { id: 'expired', label: `Expired (${expiredCount})` },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '800', letterSpacing: '-0.03em', margin: 0 }}>
            Coupons & Promotions
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px', margin: 0 }}>
            Create, activate, and manage store-wide discount codes and promotions.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <ViewToggle currentView={viewMode} onViewChange={handleViewChange} />
          <Button variant="primary" size="sm" icon={Plus} onClick={openCreateModal}>
            New Coupon
          </Button>
        </div>
      </div>

      {/* ── Stats row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(175px, 1fr))', gap: '14px' }}>
        <StatsCard title="Active Promotions" value={activeCount} icon={Ticket} iconColor="#6366f1" iconBg="#ede9fe" />
        <StatsCard title="Inactive / Paused" value={inactiveCount} icon={ToggleLeft} iconColor="#d97706" iconBg="#fef3c7" />
        <StatsCard title="Expired Coupons" value={expiredCount} icon={XCircle} iconColor="#ef4444" iconBg="#fee2e2" />
        <StatsCard title="Total Claims Used" value={totalClaims} icon={Percent} iconColor="#0ea5e9" iconBg="#e0f2fe" />
      </div>

      {/* ── Filter tabs ── */}
      <div style={{
        display: 'flex', gap: '6px',
        backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)',
        borderRadius: '12px', padding: '6px', width: 'fit-content'
      }}>
        {FILTER_TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setFilterStatus(t.id)}
            style={{
              padding: '7px 16px', fontSize: '12px', fontWeight: '700',
              borderRadius: '8px', border: 'none', cursor: 'pointer',
              transition: 'all 0.2s ease',
              backgroundColor: filterStatus === t.id ? 'var(--primary)' : 'transparent',
              color: filterStatus === t.id ? '#fff' : 'var(--text-secondary)',
              boxShadow: filterStatus === t.id ? '0 2px 8px rgba(79,70,229,0.3)' : 'none'
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Main content listing ── */}
      {loading ? (
        viewMode === 'grid' ? <ShimmerCardGrid count={6} height="200px" /> : <TableShimmer rows={6} cols={6} />
      ) : filtered.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '60px 24px',
          backgroundColor: 'var(--bg-card)', border: '1px dashed var(--border-color)',
          borderRadius: '16px'
        }}>
          <Ticket size={48} style={{ color: 'var(--border-color)', marginBottom: '12px' }} />
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: 0 }}>
            No coupons found in this filter.
          </p>
          <button
            onClick={openCreateModal}
            style={{
              marginTop: '14px', padding: '8px 20px', fontSize: '13px', fontWeight: '700',
              borderRadius: '20px', border: '1px solid var(--primary)',
              backgroundColor: 'var(--primary-light)', color: 'var(--primary)',
              cursor: 'pointer'
            }}
          >
            Create First Coupon
          </button>
        </div>
      ) : viewMode === 'list' ? (
        <ListView
          columns={[
            {
              key: 'code', label: 'Promo Code',
              render: row => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Ticket size={14} style={{ color: 'var(--primary)' }} />
                  <span style={{ fontFamily: 'monospace', fontWeight: '800', fontSize: '13px', letterSpacing: '0.5px' }}>{row.code}</span>
                </div>
              )
            },
            {
              key: 'discount', label: 'Discount Value',
              render: row => (
                <span style={{ fontWeight: '700', color: 'var(--primary)' }}>
                  {row.type === 'Percentage' ? `${row.value}% Off` : `£${row.value.toFixed(2)} Flat`}
                </span>
              )
            },
            {
              key: 'domain', label: 'Applies To',
              render: row => {
                if (row.domain === 'Category') return <Badge variant="info">Category: {row.category}</Badge>;
                if (row.domain === 'Brand') return <Badge variant="info">Brand: {row.brand}</Badge>;
                return <Badge variant="secondary">Global Cart</Badge>;
              }
            },
            {
              key: 'validity', label: 'Validity Period',
              render: row => (
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  {new Date(row.start).toLocaleDateString([], { month: 'short', day: 'numeric' })} – {new Date(row.end).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              )
            },
            {
              key: 'claims', label: 'Usage',
              render: row => (
                <span style={{ fontSize: '12px', fontWeight: '600' }}>
                  {row.usedCount} / {row.usageLimit}
                </span>
              )
            },
            {
              key: 'status', label: 'Status',
              render: row => {
                const expired = new Date(row.end) < now;
                if (expired) return <Badge variant="danger">Expired</Badge>;
                return (
                  <Badge variant={row.status === 'Active' ? 'success' : 'secondary'}>
                    {row.status}
                  </Badge>
                );
              }
            },
            {
              key: 'actions', label: '',
              render: row => {
                const expired = new Date(row.end) < now;
                return (
                  <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditModal(row)}
                      style={{ color: 'var(--primary)', padding: '6px' }}
                      title="Edit Coupon"
                    >
                      <Edit3 size={14} />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleCouponStatus(row.id || row._id)}
                      disabled={expired}
                    >
                      {row.status === 'Active' ? 'Pause' : 'Activate'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(row.id || row._id)}
                      style={{ color: 'var(--danger)', padding: '6px' }}
                      title="Delete Coupon"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                );
              }
            }
          ]}
          data={filtered}
          initialRowsPerPage={10}
        />
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: '16px'
        }}>
          {filtered.map(coupon => (
            <CouponCard
              key={coupon.id || coupon._id}
              coupon={coupon}
              onToggle={handleToggleStatus}
              onDelete={handleDelete}
              onCopy={handleCopy}
              onEdit={openEditModal}
            />
          ))}
        </div>
      )}

      {/* ── Create / Edit Coupon Modal ── */}
      <Modal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditingCoupon(null); }}
        title={editingCoupon ? `Edit Coupon (${editingCoupon.code})` : "Create Promo Code"}
        footer={
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button variant="outline" size="sm" onClick={() => { setModalOpen(false); setEditingCoupon(null); }}>Cancel</Button>
            <Button variant="primary" size="sm" loading={submitting} onClick={handleSaveCoupon}>{editingCoupon ? 'Save Changes' : 'Activate Code'}</Button>
          </div>
        }
      >
        <form style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Code preview */}
          <div style={{
            background: 'linear-gradient(135deg, var(--primary-light), transparent)',
            border: '2px dashed var(--primary)',
            borderRadius: '12px', padding: '16px', textAlign: 'center'
          }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: '600' }}>
              COUPON PREVIEW
            </div>
            <div style={{
              fontFamily: 'monospace', fontSize: '24px', fontWeight: '900',
              letterSpacing: '4px', color: 'var(--primary)'
            }}>
              {code || 'YOUR CODE'}
            </div>
          </div>

          <Input
            label="Coupon Code"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="e.g. AADI20"
          />

          <Input
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Aadi Festival offer"
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <Select
              label="Discount Type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              options={['Percentage', 'Fixed Amount', 'Free Shipping']}
            />
            <Input
              label="Discount Value (% or £)"
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <Input label="Min Purchase Amount (£)" type="number" value={minOrder} onChange={(e) => setMinOrder(e.target.value)} />
            <Input label="Max Discount Amount (£)" type="number" value={maxDiscountAmount} onChange={(e) => setMaxDiscountAmount(e.target.value)} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <Input label="Start Date" type="date" value={start} onChange={(e) => setStart(e.target.value)} />
            <Input label="Expiry Date" type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <Input label="Usage Limit" type="number" value={usageLimit} onChange={(e) => setUsageLimit(e.target.value)} />
            <Select
              label="Category (optional)"
              value={appCat}
              onChange={(e) => setAppCat(e.target.value)}
              options={['All', ...categories.map(c => c.name)]}
            />
          </div>
        </form>
      </Modal>

    </div>
  );
};
export default Coupons;
