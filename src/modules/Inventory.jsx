import React, { useState, useEffect } from 'react';
import { AlertCircle, ArrowDownRight, ArrowUpRight, History, PackageCheck, ShieldCheck, Sliders, Warehouse, Search, RefreshCw } from 'lucide-react';
import Button from '../components/Button';
import Card, { StatsCard } from '../components/Card';
import Modal from '../components/Modal';
import Input, { Select } from '../components/Input';
import Table from '../components/Table';
import Badge from '../components/Badge';
import { fetchInventory } from '../services/api';

export const Inventory = ({
  products = [],
  setProducts,
  auditLogs = [],
  setAuditLogs,
  addToast
}) => {
  const [liveInventory, setLiveInventory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [stockStatusFilter, setStockStatusFilter] = useState('all');
  const [adjustmentModal, setAdjustmentModal] = useState(false);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  // Adjustment Form States
  const [selectedProdId, setSelectedProdId] = useState('');
  const [adjustQty, setAdjustQty] = useState(0);
  const [reason, setReason] = useState('Stocktaking Correction');

  const [movements, setMovements] = useState([
    { id: 'm-1', time: '2026-07-01T15:30:00Z', name: 'Almond Breeze Almond Milk', sku: 'DY-ALM-005', type: 'Addition', qty: 20, reason: 'Purchase Order Recv', operator: 'Steve Loader' },
    { id: 'm-2', time: '2026-07-01T14:32:00Z', name: 'Organic Hass Avocados', sku: 'GR-AVO-001', type: 'Deduction', qty: 2, reason: 'Order #ord-1001 Checkout', operator: 'System checkout' },
    { id: 'm-3', time: '2026-06-30T16:15:00Z', name: 'Freshly Baked Sourdough Bread', sku: 'BK-SOU-004', type: 'Deduction', qty: 5, reason: 'Damaged Goods / Stale', operator: 'Melissa Manager' }
  ]);

  // Load Inventory from backend API
  const loadLiveInventory = async () => {
    setLoading(true);
    try {
      const params = { limit, page };
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (stockStatusFilter !== 'all') params.stockStatus = stockStatusFilter;

      const res = await fetchInventory(params);
      if (res && res.success !== false) {
        const rawList = res.data?.inventory || (Array.isArray(res.data) ? res.data : []);
        if (Array.isArray(rawList) && rawList.length > 0) {
          const formatted = rawList.map(item => ({
            id: item._id || item.id,
            _id: item._id || item.id,
            productName: item.productName || item.name || 'Unnamed Product',
            name: item.productName || item.name || 'Unnamed Product',
            sku: item.sku || 'N/A',
            category: item.category || 'General',
            brand: item.brand || 'N/A',
            stock: Number(item.stock) || 0,
            status: item.status || (Number(item.stock) === 0 ? 'Out of Stock' : (Number(item.stock) <= (item.lowStockThreshold || 10) ? 'Low Stock' : 'In Stock')),
            lowStockThreshold: item.lowStockThreshold || 10,
            price: Number(item.price) || 0,
            updatedAt: item.updatedAt || new Date().toISOString()
          }));
          setLiveInventory(formatted);
          if (res.data?.meta?.total) {
            setTotalItems(res.data.meta.total);
          } else {
            setTotalItems(formatted.length);
          }
        } else {
          setLiveInventory([]);
          setTotalItems(0);
        }
      }
    } catch (err) {
      console.error('Failed to fetch inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLiveInventory();
  }, [searchTerm, stockStatusFilter, page, limit]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, stockStatusFilter]);

  // Fallback to local products array if liveInventory is empty
  const activeInventoryList = liveInventory.length > 0
    ? liveInventory
    : products.map(p => ({
      id: p.id,
      _id: p.id,
      productName: p.name,
      name: p.name,
      sku: p.sku || 'N/A',
      category: p.category || 'General',
      brand: p.brand || 'N/A',
      stock: p.stock || 0,
      status: p.stock === 0 ? 'Out of Stock' : (p.stock <= (p.minStock || 10) ? 'Low Stock' : 'In Stock'),
      lowStockThreshold: p.minStock || 10,
      price: p.price || p.costPrice || 0,
      updatedAt: new Date().toISOString()
    }));

  // Calculations
  const totalStockItems = activeInventoryList.reduce((sum, item) => sum + (item.stock || 0), 0);
  const lowStockProducts = activeInventoryList.filter(item => item.stock > 0 && item.stock <= (item.lowStockThreshold || 10));
  const outOfStockProducts = activeInventoryList.filter(item => item.stock === 0);
  const stockValuation = activeInventoryList.reduce((sum, item) => sum + ((item.stock || 0) * (item.price || 0)), 0);

  const handleAdjustSubmit = (e) => {
    e.preventDefault();
    const targetItem = activeInventoryList.find(p => p.id === selectedProdId || p._id === selectedProdId);
    if (!targetItem) return;

    const qtyNumber = Number(adjustQty);
    if (qtyNumber === 0) {
      if (addToast) addToast('Please input non-zero adjustment quantity', 'warning');
      return;
    }

    const nextStock = Math.max(0, targetItem.stock + qtyNumber);

    // Update liveInventory list locally
    setLiveInventory(liveInventory.map(item =>
      (item.id === selectedProdId || item._id === selectedProdId)
        ? {
          ...item,
          stock: nextStock,
          status: nextStock === 0 ? 'Out of Stock' : (nextStock <= item.lowStockThreshold ? 'Low Stock' : 'In Stock')
        }
        : item
    ));

    if (typeof setProducts === 'function') {
      setProducts(products.map(p => p.id === selectedProdId ? { ...p, stock: nextStock } : p));
    }

    // Log Movement Entry
    const isAddition = qtyNumber > 0;
    const movementEntry = {
      id: `mov-${Date.now()}`,
      time: new Date().toISOString(),
      name: targetItem.productName || targetItem.name,
      sku: targetItem.sku,
      type: isAddition ? 'Addition' : 'Deduction',
      qty: Math.abs(qtyNumber),
      reason: reason,
      operator: 'Admin'
    };

    setMovements([movementEntry, ...movements]);

    if (setAuditLogs) {
      setAuditLogs([
        {
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString(),
          user: 'Admin',
          action: 'Inventory Level Adjusted',
          module: 'Inventory',
          detail: `Stock for ${targetItem.productName || targetItem.name} altered by ${qtyNumber} (${reason}). Next level: ${nextStock}`
        },
        ...auditLogs
      ]);
    }

    if (addToast) addToast(`Inventory adjusted successfully for ${targetItem.productName || targetItem.name}`, 'success');
    setAdjustmentModal(false);
    setAdjustQty(0);
  };

  const inventoryColumns = [
    {
      key: 'productName',
      label: 'Product Info',
      render: (row) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{row.productName || row.name}</span>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>SKU: {row.sku} | Brand: {row.brand || 'N/A'}</span>
        </div>
      )
    },
    { key: 'category', label: 'Category', render: (row) => <span>{row.category || 'General'}</span> },
    {
      key: 'stock',
      label: 'Units Available',
      render: (row) => (
        <span style={{ fontWeight: '700', color: row.stock === 0 ? 'var(--danger)' : (row.stock <= row.lowStockThreshold ? 'var(--warning)' : 'var(--text-primary)') }}>
          {row.stock} units
        </span>
      )
    },
    {
      key: 'status',
      label: 'Stock Status',
      render: (row) => {
        let variant = 'success';
        if (row.status === 'Out of Stock' || row.stock === 0) variant = 'danger';
        else if (row.status === 'Low Stock' || row.stock <= row.lowStockThreshold) variant = 'warning';
        return <Badge variant={variant}>{row.status}</Badge>;
      }
    },
    {
      key: 'price',
      label: 'Unit Price',
      render: (row) => <span>£{Number(row.price || 0).toFixed(2)}</span>
    }
  ];

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
          <Button variant="outline" size="sm" icon={RefreshCw} onClick={loadLiveInventory}>
            Refresh
          </Button>
          <Button variant="primary" size="sm" icon={Sliders} onClick={() => setAdjustmentModal(true)}>
            Manual Audit Check
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <StatsCard title="Total Pack Units" value={totalStockItems} icon={PackageCheck} iconBg="var(--primary-light)" iconColor="var(--primary)" />
        <StatsCard title="Stock Valuation (Price)" value={`£${stockValuation.toFixed(2)}`} icon={ShieldCheck} iconBg="var(--success-light)" iconColor="var(--success)" />
        <StatsCard title="Low Stock Warnings" value={lowStockProducts.length} icon={AlertCircle} iconBg="var(--warning-light)" iconColor="var(--warning)" />
        <StatsCard title="Out of Stock Items" value={outOfStockProducts.length} icon={AlertCircle} iconBg="var(--danger-light)" iconColor="var(--danger)" />
      </div>

      {/* Live Inventory Master Table */}
      <Card title="Live Inventory Catalog">
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', marginTop: '12px' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Input
              placeholder="Search by product name, SKU or brand..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div style={{ width: '180px' }}>
            <Select
              value={stockStatusFilter}
              onChange={(e) => setStockStatusFilter(e.target.value)}
              options={[
                { value: 'all', label: 'All Statuses' },
                { value: 'In Stock', label: 'In Stock' },
                { value: 'Low Stock', label: 'Low Stock' },
                { value: 'Out of Stock', label: 'Out of Stock' }
              ]}
            />
          </div>
        </div>
        <Table
          columns={inventoryColumns}
          data={activeInventoryList}
          initialRowsPerPage={limit}
          serverSideTotal={totalItems}
          serverSidePage={page}
          onServerPageChange={setPage}
          onServerRowsChange={setLimit}
          loading={loading}
        />
      </Card>

      {/* Low Stock Alerts and Movements log grid split */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>

        {/* Alerts card list */}
        <Card title="Critical Stock Alerts">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
            {lowStockProducts.length === 0 && outOfStockProducts.length === 0 && (
              <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>Warehouse levels are healthy. No alerts triggered.</div>
            )}
            {[...outOfStockProducts, ...lowStockProducts].map((item) => {
              const isOut = item.stock === 0;
              return (
                <div
                  key={item.id || item._id}
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
                    <span style={{ fontSize: '13px', fontWeight: '700' }}>{item.productName || item.name}</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>SKU: {item.sku} • Brand: {item.brand}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                    <Badge variant={isOut ? 'danger' : 'warning'}>{isOut ? 'Out of Stock' : 'Low Stock'}</Badge>
                    <span style={{ fontSize: '12px', fontWeight: 'bold' }}>Current: {item.stock}</span>
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
        <form style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} onSubmit={handleAdjustSubmit}>
          <Select
            label="Select Product Item"
            value={selectedProdId}
            onChange={(e) => setSelectedProdId(e.target.value)}
            options={activeInventoryList.map(p => ({ value: p.id || p._id, label: `${p.productName || p.name} (${p.sku}) [Stock: ${p.stock}]` }))}
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

