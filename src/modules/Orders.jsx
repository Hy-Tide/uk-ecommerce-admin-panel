import React, { useState } from 'react';
import {
  Calendar, CheckCircle, Clock, CreditCard, Mail,
  MapPin, MessageSquare, Package, Printer, Search,
  ShoppingCart, Truck, XCircle
} from 'lucide-react';
import Button from '../components/Button';
import Drawer from '../components/Drawer';
import Table, { ColumnsToggle } from '../components/Table';
import ListView from '../components/ListView';
import GridView from '../components/GridView';
import ViewToggle from '../components/ViewToggle';
import Badge from '../components/Badge';
import Timeline from '../components/Timeline';

// ─── Status configs ─────────────────────────────────────────────────────────
const DELIVERY_CONFIG = {
  'New Order':          { color: '#6366f1', bg: '#ede9fe' },
  'Payment Verified':   { color: '#0ea5e9', bg: '#e0f2fe' },
  'Confirmed':          { color: '#8b5cf6', bg: '#f3e8ff' },
  'Picking':            { color: '#f59e0b', bg: '#fef3c7' },
  'Packing':            { color: '#f59e0b', bg: '#fef3c7' },
  'Ready for Dispatch': { color: '#10b981', bg: '#d1fae5' },
  'Out for Delivery':   { color: '#10b981', bg: '#d1fae5' },
  'Delivered':          { color: '#16a34a', bg: '#dcfce7' },
  'Cancelled':          { color: '#ef4444', bg: '#fee2e2' },
};

const PAYMENT_CONFIG = {
  'Paid':     { color: '#16a34a', bg: '#dcfce7' },
  'Unpaid':   { color: '#ef4444', bg: '#fee2e2' },
  'Refunded': { color: '#d97706', bg: '#fef3c7' },
};

const workflowStatuses = [
  'New Order', 'Payment Verified', 'Confirmed',
  'Picking', 'Packing', 'Ready for Dispatch', 'Out for Delivery', 'Delivered'
];

const StatusPill = ({ label, config }) => (
  <span style={{
    display: 'inline-block',
    fontSize: '11px', fontWeight: '700',
    padding: '3px 10px', borderRadius: '20px',
    backgroundColor: config?.bg || 'var(--border-color)',
    color: config?.color || 'var(--text-muted)',
    whiteSpace: 'nowrap'
  }}>
    {label}
  </span>
);

const SectionLabel = ({ children }) => (
  <div style={{
    fontSize: '10px', fontWeight: '800', letterSpacing: '0.08em',
    textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '10px'
  }}>
    {children}
  </div>
);

export const Orders = ({
  orders = [],
  setOrders,
  auditLogs = [],
  setAuditLogs,
  addToast
}) => {
  const [search,         setSearch]         = useState('');
  const [filterPayment,  setFilterPayment]  = useState('All');
  const [filterDelivery, setFilterDelivery] = useState('All');
  const [drawerOpen,     setDrawerOpen]     = useState(false);
  const [activeOrder,    setActiveOrder]    = useState(null);
  const [visibleCols,    setVisibleCols]    = useState(null); // null = all visible initially
  const [viewMode,       setViewMode]       = useState(() => {
    return localStorage.getItem('view-mode-orders') || 'list';
  });

  const handleViewChange = (newView) => {
    setViewMode(newView);
    localStorage.setItem('view-mode-orders', newView);
  };

  const handleUpdateStatus = (statusValue) => {
    if (!activeOrder) return;
    const newStep = { status: statusValue, time: new Date().toISOString(), desc: `Status updated to: ${statusValue}` };
    const updated = { ...activeOrder, deliveryStatus: statusValue, timeline: [...activeOrder.timeline, newStep] };
    setOrders(orders.map(o => o.id === activeOrder.id ? updated : o));
    setActiveOrder(updated);
    setAuditLogs([{
      id: `log-${Date.now()}`, timestamp: new Date().toISOString(),
      user: 'Mugesh', action: 'Order Status Update',
      module: 'Orders', detail: `Updated order #${activeOrder.id} to ${statusValue}`
    }, ...auditLogs]);
    addToast(`Order status → ${statusValue}`, 'success');
  };

  const handleCancelOrder = () => {
    if (!activeOrder) return;
    const newStep = { status: 'Cancelled', time: new Date().toISOString(), desc: 'Cancelled manually by operator' };
    const updated = { ...activeOrder, deliveryStatus: 'Cancelled', timeline: [...activeOrder.timeline, newStep] };
    setOrders(orders.map(o => o.id === activeOrder.id ? updated : o));
    setActiveOrder(updated);
    addToast('Order cancelled', 'warning');
  };

  const handleRefundOrder = () => {
    if (!activeOrder) return;
    const updated = { ...activeOrder, paymentStatus: 'Refunded' };
    setOrders(orders.map(o => o.id === activeOrder.id ? updated : o));
    setActiveOrder(updated);
    addToast('Refund issued', 'warning');
  };

  const triggerPrintWindow = () => {
    if (!activeOrder) return;
    const printContent = `<html><head><title>Invoice #${activeOrder.id}</title>
      <style>body{font-family:sans-serif;padding:40px;color:#333}.header{display:flex;justify-content:space-between;border-bottom:2px solid #eee;padding-bottom:20px}.items{width:100%;border-collapse:collapse;margin-top:40px}.items th,.items td{border-bottom:1px solid #eee;padding:12px;text-align:left}.items th{background:#f9f9f9}.totals{text-align:right;margin-top:30px}</style>
      </head><body>
      <div class="header"><div><h2>UK E-commerce</h2><p>support@ukecommerce.com</p></div>
      <div><h1>INVOICE</h1><p>Order: <strong>#${activeOrder.id}</strong></p><p>${new Date(activeOrder.date).toLocaleDateString()}</p></div></div>
      <table class="items"><thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Subtotal</th></tr></thead><tbody>
      ${activeOrder.items.map(i => `<tr><td>${i.name}</td><td>${i.qty}</td><td>$${i.price.toFixed(2)}</td><td>$${(i.qty * i.price).toFixed(2)}</td></tr>`).join('')}
      </tbody></table>
      <div class="totals"><p>Subtotal: $${activeOrder.subtotal.toFixed(2)}</p>${activeOrder.discount > 0 ? `<p>Discount: -$${activeOrder.discount.toFixed(2)}</p>` : ''}<p>Delivery: $${activeOrder.deliveryFee.toFixed(2)}</p><p>Tax: $${activeOrder.tax.toFixed(2)}</p><h2>Total: $${activeOrder.total.toFixed(2)}</h2></div>
      <script>window.print();</script></body></html>`;
    const w = window.open('', '_blank');
    w.document.write(printContent);
    w.document.close();
  };

  const openOrderDrawer = (order) => { setActiveOrder(order); setDrawerOpen(true); };

  const filtered = orders.filter(o => {
    const matchSearch   = o.id.toLowerCase().includes(search.toLowerCase()) || o.customerName.toLowerCase().includes(search.toLowerCase());
    const matchPayment  = filterPayment  === 'All' || o.paymentStatus  === filterPayment;
    const matchDelivery = filterDelivery === 'All' || o.deliveryStatus === filterDelivery;
    return matchSearch && matchPayment && matchDelivery;
  });

  // KPI counts
  const newCount       = orders.filter(o => o.deliveryStatus === 'New Order').length;
  const inTransitCount = orders.filter(o => ['Out for Delivery', 'Ready for Dispatch'].includes(o.deliveryStatus)).length;
  const deliveredCount = orders.filter(o => o.deliveryStatus === 'Delivered').length;
  const revenue        = orders.filter(o => o.paymentStatus === 'Paid').reduce((s, o) => s + o.total, 0);

  const activeStepIdx = activeOrder ? workflowStatuses.indexOf(activeOrder.deliveryStatus) : -1;

  const columns = [
    {
      key: 'id', label: 'Order ID',
      render: row => <span style={{ fontFamily: 'monospace', fontWeight: '800', fontSize: '13px' }}>#{row.id}</span>
    },
    {
      key: 'date', label: 'Date',
      render: row => (
        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
          {new Date(row.date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
      )
    },
    {
      key: 'customerName', label: 'Customer',
      render: row => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
            backgroundColor: '#6366f122', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '10px', fontWeight: '800', color: '#6366f1'
          }}>
            {row.customerName.split(' ').map(n => n[0]).join('')}
          </div>
          <span style={{ fontWeight: '600', fontSize: '13px' }}>{row.customerName}</span>
        </div>
      )
    },
    {
      key: 'total', label: 'Total',
      render: row => <span style={{ fontWeight: '700', color: 'var(--primary)' }}>${row.total.toFixed(2)}</span>
    },
    {
      key: 'paymentStatus', label: 'Payment',
      render: row => <StatusPill label={row.paymentStatus} config={PAYMENT_CONFIG[row.paymentStatus]} />
    },
    {
      key: 'deliveryStatus', label: 'Delivery',
      render: row => <StatusPill label={row.deliveryStatus} config={DELIVERY_CONFIG[row.deliveryStatus]} />
    },
    {
      key: 'actions', label: '',
      render: row => (
        <Button variant="outline" size="sm" onClick={() => openOrderDrawer(row)}>Details</Button>
      )
    }
  ];

  // Initialise visible columns once
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
        <h2 style={{ fontSize: '24px', fontWeight: '800', letterSpacing: '-0.03em', margin: 0 }}>Orders Queue</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: '4px 0 0' }}>
          Fulfillment dispatch workflow — track, update, and manage all orders.
        </p>
      </div>

      {/* KPI strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
        {[
          { label: 'Total Orders',   value: orders.length,    color: '#6366f1', bg: '#ede9fe' },
          { label: 'New Orders',     value: newCount,         color: '#0ea5e9', bg: '#e0f2fe' },
          { label: 'In Transit',     value: inTransitCount,   color: '#10b981', bg: '#d1fae5' },
          { label: 'Delivered',      value: deliveredCount,   color: '#16a34a', bg: '#dcfce7' },
          { label: 'Revenue (Paid)', value: `$${revenue.toFixed(0)}`, color: '#8b5cf6', bg: '#f3e8ff' },
        ].map(s => (
          <div key={s.label} style={{
            backgroundColor: 'var(--bg-card)', border: `1.5px solid ${s.color}33`,
            borderRadius: '12px', padding: '14px 16px'
          }}>
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
        <div style={{ position: 'relative', flex: 1, minWidth: '200px', maxWidth: '280px' }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Order ID or customer..."
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

        <select value={filterDelivery} onChange={e => setFilterDelivery(e.target.value)}
          style={{ padding: '8px 12px', fontSize: '12px', fontWeight: '600', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-app)', color: 'var(--text-primary)', cursor: 'pointer' }}>
          <option value="All">All Stages</option>
          {workflowStatuses.map(s => <option key={s} value={s}>{s}</option>)}
          <option value="Cancelled">Cancelled</option>
        </select>

        <select value={filterPayment} onChange={e => setFilterPayment(e.target.value)}
          style={{ padding: '8px 12px', fontSize: '12px', fontWeight: '600', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-app)', color: 'var(--text-primary)', cursor: 'pointer' }}>
          <option value="All">All Payments</option>
          <option value="Paid">Paid</option>
          <option value="Unpaid">Unpaid</option>
          <option value="Refunded">Refunded</option>
        </select>

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
          titleKey={item => `Order #${item.id}`}
          subtitleKey="customerName"
          statusKey="deliveryStatus"
          createdKey="date"
          renderActions={item => (
            <>
              <span style={{ fontWeight: '800', color: 'var(--primary)' }}>${item.total.toFixed(2)}</span>
              <div style={{ display: 'flex', gap: '6px' }}>
                <span style={{
                  backgroundColor: item.paymentStatus === 'Paid' ? 'var(--success-light)' : 'var(--secondary-light)',
                  color: item.paymentStatus === 'Paid' ? 'var(--success)' : 'var(--secondary)',
                  padding: '3px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '700'
                }}>{item.paymentStatus}</span>
                <Button variant="outline" size="sm" onClick={() => openOrderDrawer(item)}>Details</Button>
              </div>
            </>
          )}
          initialRowsPerPage={8}
        />
      )}

      {/* ── Order Detail Drawer ── */}
      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title=""
        size="lg"
        footer={
          activeOrder && activeOrder.deliveryStatus !== 'Cancelled' ? (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <Button variant="danger"  size="sm" onClick={handleCancelOrder}>Cancel Order</Button>
              {activeOrder.paymentStatus === 'Paid' && (
                <Button variant="outline" size="sm" onClick={handleRefundOrder}>Issue Refund</Button>
              )}
              <Button variant="primary" size="sm" icon={Printer} onClick={triggerPrintWindow}>Print Receipt</Button>
            </div>
          ) : null
        }
      >
        {activeOrder && (() => {
          const dCfg = DELIVERY_CONFIG[activeOrder.deliveryStatus] || {};
          const pCfg = PAYMENT_CONFIG[activeOrder.paymentStatus]   || {};
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

              {/* Hero */}
              <div style={{
                background: `linear-gradient(135deg, ${dCfg.color || '#6366f1'} 0%, ${dCfg.color || '#6366f1'}cc 100%)`,
                borderRadius: '16px', padding: '20px 24px', position: 'relative', overflow: 'hidden'
              }}>
                <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.08)' }} />
                <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Order Reference</div>
                    <div style={{ fontFamily: 'monospace', fontSize: '22px', fontWeight: '900', color: '#fff', letterSpacing: '1px' }}>#{activeOrder.id}</div>
                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.75)', marginTop: '4px' }}>
                      {new Date(activeOrder.date).toLocaleDateString()} · {activeOrder.items.length} items
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '28px', fontWeight: '900', color: '#fff' }}>${activeOrder.total.toFixed(2)}</div>
                    <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', backgroundColor: pCfg.bg, color: pCfg.color, marginTop: '4px' }}>
                      {activeOrder.paymentStatus}
                    </span>
                  </div>
                </div>
              </div>

              {/* Customer */}
              <div>
                <SectionLabel>Customer</SectionLabel>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'space-between', backgroundColor: 'var(--bg-app)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0, backgroundColor: '#6366f122', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '800', color: '#6366f1' }}>
                      {activeOrder.customerName.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '700' }}>{activeOrder.customerName}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{activeOrder.customerEmail}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button onClick={() => addToast(`Email sent to ${activeOrder.customerEmail}`, 'success')} style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}><Mail size={14} /></button>
                    <button onClick={() => addToast(`WhatsApp triggered for ${activeOrder.customerName}`, 'success')} style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}><MessageSquare size={14} /></button>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginTop: '8px', padding: '10px 14px', backgroundColor: 'var(--bg-app)', border: '1px solid var(--border-color)', borderRadius: '10px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                  <MapPin size={13} style={{ color: 'var(--primary)', marginTop: '1px', flexShrink: 0 }} />
                  {activeOrder.address}
                </div>
              </div>

              {/* Workflow */}
              {activeOrder.deliveryStatus !== 'Cancelled' && (
                <div>
                  <SectionLabel>Update Transit Stage</SectionLabel>
                  <div style={{ backgroundColor: 'var(--bg-app)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '14px' }}>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {workflowStatuses.map((st, idx) => {
                        const isActive    = activeOrder.deliveryStatus === st;
                        const isCompleted = activeStepIdx > idx;
                        const cfg         = DELIVERY_CONFIG[st] || {};
                        return (
                          <button key={st} onClick={() => handleUpdateStatus(st)} style={{
                            padding: '5px 12px', fontSize: '11px', fontWeight: '700',
                            borderRadius: '20px', border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                            backgroundColor: isActive ? (cfg.color || 'var(--primary)') : isCompleted ? `${cfg.color || 'var(--primary)'}22` : 'var(--border-color)',
                            color: isActive ? '#fff' : isCompleted ? (cfg.color || 'var(--primary)') : 'var(--text-muted)'
                          }}>
                            {isCompleted && !isActive ? '✓ ' : ''}{st}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Timeline */}
              <div>
                <SectionLabel>Fulfillment Trail</SectionLabel>
                <Timeline steps={activeOrder.timeline} />
              </div>

              {/* Items */}
              <div>
                <SectionLabel>Order Items</SectionLabel>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {activeOrder.items.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-app)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '12px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '26px', height: '26px', borderRadius: '7px', flexShrink: 0, backgroundColor: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '800' }}>{idx + 1}</div>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: '600' }}>{item.name}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{item.qty} × ${item.price.toFixed(2)}</div>
                        </div>
                      </div>
                      <span style={{ fontSize: '14px', fontWeight: '800', color: 'var(--primary)' }}>${(item.qty * item.price).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div style={{ backgroundColor: 'var(--bg-app)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  { label: 'Subtotal',      value: `$${activeOrder.subtotal.toFixed(2)}` },
                  ...(activeOrder.discount > 0 ? [{ label: 'Discount', value: `-$${activeOrder.discount.toFixed(2)}`, danger: true }] : []),
                  { label: 'Delivery fee',  value: `$${activeOrder.deliveryFee.toFixed(2)}` },
                  { label: 'Tax / VAT',     value: `$${activeOrder.tax.toFixed(2)}` },
                ].map(r => (
                  <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{r.label}</span>
                    <span style={{ color: r.danger ? '#ef4444' : 'var(--text-primary)', fontWeight: '600' }}>{r.value}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '17px', fontWeight: '900', borderTop: '2px dashed var(--border-color)', paddingTop: '10px', marginTop: '4px' }}>
                  <span>Grand Total</span>
                  <span style={{ color: 'var(--primary)' }}>${activeOrder.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Payment meta */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, backgroundColor: 'var(--bg-app)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '12px', fontSize: '12px' }}>
                  <div style={{ color: 'var(--text-muted)', marginBottom: '4px' }}>Payment Method</div>
                  <div style={{ fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CreditCard size={13} style={{ color: 'var(--primary)' }} /> {activeOrder.paymentMethod}
                  </div>
                </div>
                {activeOrder.trackingNumber && (
                  <div style={{ flex: 1, backgroundColor: 'var(--bg-app)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '12px', fontSize: '12px' }}>
                    <div style={{ color: 'var(--text-muted)', marginBottom: '4px' }}>Tracking Number</div>
                    <div style={{ fontFamily: 'monospace', fontWeight: '700', color: 'var(--primary)' }}>{activeOrder.trackingNumber}</div>
                  </div>
                )}
              </div>

            </div>
          );
        })()}
      </Drawer>

    </div>
  );
};
export default Orders;
