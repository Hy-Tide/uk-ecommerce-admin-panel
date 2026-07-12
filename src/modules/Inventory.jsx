import React, { useState } from 'react';
import { AlertCircle, ArrowDownRight, ArrowUpRight, History, PackageCheck, ShieldCheck, Sliders, Warehouse } from 'lucide-react';
import Button from '../components/Button';
import Card, { StatsCard } from '../components/Card';
import Modal from '../components/Modal';
import Input, { Select } from '../components/Input';
import Table from '../components/Table';
import Badge from '../components/Badge';

export const Inventory = ({
  products = [],
  setProducts,
  auditLogs = [],
  setAuditLogs,
  addToast
}) => {
  const [adjustmentModal, setAdjustmentModal] = useState(false);
  
  // Adjustment Form States
  const [selectedProdId, setSelectedProdId] = useState(products[0]?.id || '');
  const [adjustQty, setAdjustQty] = useState(0);
  const [reason, setReason] = useState('Stocktaking Correction'); // Damaged Goods, Returned Goods, Stocktaking Correction, Transfer
  
  // Track inventory movements locally or in state. Let's seed some movements.
  const [movements, setMovements] = useState([
    { id: 'm-1', time: '2026-07-01T15:30:00Z', name: 'Almond Breeze Almond Milk', sku: 'DY-ALM-005', type: 'Addition', qty: 20, reason: 'Purchase Order Recv', operator: 'Steve Loader' },
    { id: 'm-2', time: '2026-07-01T14:32:00Z', name: 'Organic Hass Avocados', sku: 'GR-AVO-001', type: 'Deduction', qty: 2, reason: 'Order #ord-1001 Checkout', operator: 'System checkout' },
    { id: 'm-3', time: '2026-06-30T16:15:00Z', name: 'Freshly Baked Sourdough Bread', sku: 'BK-SOU-004', type: 'Deduction', qty: 5, reason: 'Damaged Goods / Stale', operator: 'Melissa Manager' }
  ]);

  // Calculations
  const totalStockItems = products.reduce((sum, p) => sum + p.stock, 0);
  const lowStockProducts = products.filter(p => p.stock > 0 && p.stock <= p.minStock);
  const outOfStockProducts = products.filter(p => p.stock === 0);
  
  // Total inventory valuation cost
  const stockValuation = products.reduce((sum, p) => sum + (p.stock * p.costPrice), 0);

  const handleAdjustSubmit = (e) => {
    e.preventDefault();
    const prod = products.find(p => p.id === selectedProdId);
    if (!prod) return;

    const qtyNumber = Number(adjustQty);
    if (qtyNumber === 0) {
      addToast('Please input non-zero adjustment quantity', 'warning');
      return;
    }

    const nextStock = Math.max(0, prod.stock + qtyNumber);
    
    // Update product stock levels
    setProducts(products.map(p => p.id === selectedProdId ? { ...p, stock: nextStock } : p));
    
    // Log Movement Entry
    const isAddition = qtyNumber > 0;
    const movementEntry = {
      id: `mov-${Date.now()}`,
      time: new Date().toISOString(),
      name: prod.name,
      sku: prod.sku,
      type: isAddition ? 'Addition' : 'Deduction',
      qty: Math.abs(qtyNumber),
      reason: reason,
      operator: 'Mugesh'
    };

    setMovements([movementEntry, ...movements]);

    // Push into system audit logs
    setAuditLogs([
      {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        user: 'Mugesh',
        action: 'Inventory Level Adjusted',
        module: 'Inventory',
        detail: `Stock for ${prod.name} altered by ${qtyNumber} (${reason}). Next level: ${nextStock}`
      },
      ...auditLogs
    ]);

    addToast(`Inventory adjusted successfully for ${prod.name}`, 'success');
    setAdjustmentModal(false);
    setAdjustQty(0);
  };

  const movementCols = [
    {
      key: 'time',
      label: 'Timestamp',
      render: (row) => new Date(row.time).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    },
    { key: 'name', label: 'Item Name' },
    { key: 'sku', label: 'SKU' },
    {
      key: 'qty',
      label: 'Quantity Change',
      render: (row) => {
        const isAdd = row.type === 'Addition';
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 'bold', color: isAdd ? 'var(--success)' : 'var(--danger)' }}>
            {isAdd ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {isAdd ? '+' : '-'}{row.qty}
          </span>
        );
      }
    },
    { key: 'reason', label: 'Reason' },
    { key: 'operator', label: 'Operator' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '700', letterSpacing: '-0.02em', margin: 0 }}>Stock Operations Dashboard</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Evaluate warehousing zones, adjust stocktaking anomalies, and monitor movement history.</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button variant="outline" size="sm" icon={Warehouse} onClick={() => addToast('Simulating stock reorder sheet email...', 'info')}>
            Purchase Orders
          </Button>
          <Button variant="primary" size="sm" icon={Sliders} onClick={() => setAdjustmentModal(true)}>
            Manual Audit Check
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <StatsCard title="Total Pack Units" value={totalStockItems} icon={PackageCheck} iconBg="var(--primary-light)" iconColor="var(--primary)" />
        <StatsCard title="Stock Valuation (Cost)" value={`$${stockValuation.toFixed(2)}`} icon={ShieldCheck} iconBg="var(--success-light)" iconColor="var(--success)" />
        <StatsCard title="Low Stock Warnings" value={lowStockProducts.length} icon={AlertCircle} iconBg="var(--warning-light)" iconColor="var(--warning)" />
        <StatsCard title="Out of Stock Items" value={outOfStockProducts.length} icon={AlertCircle} iconBg="var(--danger-light)" iconColor="var(--danger)" />
      </div>

      {/* Low Stock Alerts and Movements log grid split */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        
        {/* Alerts card list */}
        <Card title="Critical Stock Alerts">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
            {lowStockProducts.length === 0 && outOfStockProducts.length === 0 && (
              <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>Warehouse levels are healthy. No alerts triggered.</div>
            )}
            {[...outOfStockProducts, ...lowStockProducts].map((prod) => {
              const isOut = prod.stock === 0;
              return (
                <div
                  key={prod.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    border: '1px solid var(--border-color)',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    backgroundColor: isOut ? 'var(--danger-light)' : 'var(--warning-light)'
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span style={{ fontSize: '13px', fontWeight: '700' }}>{prod.name}</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>SKU: {prod.sku} • Location: {prod.warehouseLocation}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                    <Badge variant={isOut ? 'danger' : 'warning'}>{isOut ? 'Out of Stock' : 'Low Stock'}</Badge>
                    <span style={{ fontSize: '12px', fontWeight: 'bold' }}>Current: {prod.stock}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Stock movements sheet */}
        <Card title="Stock Movements Log" icon={History}>
          <div style={{ marginTop: '12px' }}>
            <Table
              columns={movementCols}
              data={movements}
              initialRowsPerPage={5}
            />
          </div>
        </Card>
      </div>

      {/* Manual Audit Check Modal Form */}
      <Modal
        isOpen={adjustmentModal}
        onClose={() => setAdjustmentModal(false)}
        title="Warehouse Inventory Manual Audit Check"
        footer={
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button variant="outline" size="sm" onClick={() => setAdjustmentModal(false)}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={handleAdjustSubmit}>Commit adjustments</Button>
          </div>
        }
      >
        <form style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Select
            label="Select Product Item"
            value={selectedProdId}
            onChange={(e) => setSelectedProdId(e.target.value)}
            options={products.map(p => ({ value: p.id, label: `${p.name} (${p.sku}) [Stock: ${p.stock}]` }))}
          />

          <Input
            label="Adjustment Quantity (Use minus prefix for deductions, e.g. -5, or +10)"
            type="number"
            value={adjustQty}
            onChange={(e) => setAdjustQty(e.target.value)}
          />

          <Select
            label="Audit Reason Category"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            options={['Stocktaking Correction', 'Damaged Goods', 'Returned Goods', 'Transfer Dispatch', 'Waste / Stale Goods']}
          />
        </form>
      </Modal>

    </div>
  );
};
export default Inventory;
