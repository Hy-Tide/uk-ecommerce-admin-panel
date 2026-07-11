import React from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  Clock,
  DollarSign,
  Package,
  Plus,
  Send,
  ShoppingBag,
  TrendingUp,
  Users,
  XCircle
} from 'lucide-react';
import Button from '../components/Button';
import Card, { StatsCard } from '../components/Card';
import { AreaChartWidget, DonutChartWidget, HeatmapWidget } from '../components/Charts';

export const Dashboard = ({
  products = [],
  orders = [],
  customers = [],
  auditLogs = [],
  onNavigate, // function to change tabs
  onQuickAction // function to trigger modals/drawers
}) => {
  // Dynamic Calculations from shared state
  const pendingOrders = orders.filter(o => ['New Order', 'Confirmed', 'Picking', 'Packing'].includes(o.deliveryStatus)).length;
  const packedOrders = orders.filter(o => o.deliveryStatus === 'Ready for Dispatch').length;
  const deliveredOrders = orders.filter(o => o.deliveryStatus === 'Delivered').length;
  const cancelledOrders = orders.filter(o => o.deliveryStatus === 'Cancelled').length;

  const totalRevenue = orders.filter(o => o.paymentStatus === 'Paid').reduce((sum, o) => sum + o.total, 0);
  const revenueToday = orders.filter(o => o.paymentStatus === 'Paid' && o.date.includes('2026-07-01')).reduce((sum, o) => sum + o.total, 0);

  const lowStockCount = products.filter(p => p.stock > 0 && p.stock <= p.minStock).length;
  const outOfStockCount = products.filter(p => p.stock === 0).length;

  // Chart data calculations
  // Daily Sales: group orders by date
  const salesMap = {};
  orders.forEach(o => {
    const day = new Date(o.date).toLocaleDateString([], { month: 'short', day: 'numeric' });
    salesMap[day] = (salesMap[day] || 0) + o.total;
  });
  const salesData = Object.keys(salesMap).map(day => ({ name: day, revenue: salesMap[day] })).reverse();

  // Orders status distribution
  const orderStatusData = [
    { name: 'Delivered', value: deliveredOrders, color: 'var(--success)' },
    { name: 'Pending', value: pendingOrders, color: 'var(--warning)' },
    { name: 'Cancelled', value: cancelledOrders, color: 'var(--danger)' },
    { name: 'Packed/Staged', value: packedOrders, color: 'var(--primary)' }
  ].filter(item => item.value > 0);

  // Best selling products placeholder
  const bestSellers = products.slice(0, 3);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '700', letterSpacing: '-0.03em', margin: 0 }}>Dashboard Analytics</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
            Real-time activity overview for FreshCart Organic Grocer.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button variant="outline" size="sm" onClick={() => onNavigate('reports')}>
            View Reports
          </Button>
          <Button variant="primary" size="sm" icon={Plus} onClick={() => onQuickAction('add-product')}>
            Add Product
          </Button>
        </div>
      </div>

      {/* KPI Stats widgets grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <StatsCard
          title="Revenue Today"
          value={`$${revenueToday.toFixed(2)}`}
          trend={12.4}
          trendLabel="vs yesterday"
          icon={DollarSign}
          iconColor="var(--primary)"
          iconBg="var(--primary-light)"
        />
        <StatsCard
          title="Total Customers"
          value={customers.length}
          trend={4.2}
          trendLabel="this week"
          icon={Users}
          iconColor="var(--accent)"
          iconBg="var(--accent-light)"
        />
        <StatsCard
          title="Fulfillment Queue"
          value={`${pendingOrders} Pending`}
          subvalue={`${packedOrders} Packed & Staged`}
          trend={0}
          icon={ShoppingBag}
          iconColor="var(--warning)"
          iconBg="var(--warning-light)"
        />
        <StatsCard
          title="Stock Alerts"
          value={`${lowStockCount} Low`}
          subvalue={`${outOfStockCount} Out of stock`}
          trend={0}
          icon={Package}
          iconColor="var(--danger)"
          iconBg="var(--danger-light)"
        />
      </div>

      {/* Quick Action Grid */}
      <Card title="Quick Actions Console">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginTop: '8px' }}>
          <Button variant="secondary" size="sm" icon={Plus} onClick={() => onQuickAction('add-product')} style={{ justifyContent: 'flex-start' }}>
            New Product
          </Button>
          <Button variant="secondary" size="sm" icon={ShoppingBag} onClick={() => onNavigate('orders')} style={{ justifyContent: 'flex-start' }}>
            Fulfill Orders
          </Button>
          <Button variant="secondary" size="sm" icon={Send} onClick={() => onQuickAction('whatsapp-campaign')} style={{ justifyContent: 'flex-start' }}>
            WhatsApp Broadcast
          </Button>
          <Button variant="secondary" size="sm" icon={AlertTriangle} onClick={() => onNavigate('inventory')} style={{ justifyContent: 'flex-start' }}>
            Review Stock Checks
          </Button>
        </div>
      </Card>

      {/* Main Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 2fr))', gap: '20px' }}>
        {/* Revenue Area Chart */}
        <Card title="Checkout Revenue Trend" actions={<span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Daily Gross sales</span>}>
          <div style={{ height: '300px', marginTop: '16px' }}>
            {salesData.length > 0 ? (
              <AreaChartWidget data={salesData} xKey="name" yKeys={['revenue']} height={280} />
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                Insufficient transaction histories to render trend.
              </div>
            )}
          </div>
        </Card>

        {/* Order Status Donut Chart */}
        <Card title="Orders Fulfillment Share" style={{ maxWidth: '380px', margin: '0 auto', width: '100%' }}>
          <div style={{ height: '300px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            {orderStatusData.length > 0 ? (
              <DonutChartWidget data={orderStatusData} height={240} />
            ) : (
              <div style={{ color: 'var(--text-muted)' }}>No orders in queue.</div>
            )}
          </div>
        </Card>
      </div>

      {/* Secondary Analytics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {/* Heatmap block */}
        <Card title="Order Density Hotspots (Hourly)">
          <div style={{ marginTop: '16px' }}>
            <HeatmapWidget height={220} />
          </div>
        </Card>

        {/* Best sellers & Activity Feed */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <Card title="Best Sellers this Week">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
              {bestSellers.map((prod, idx) => (
                <div key={prod.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', borderBottom: idx === bestSellers.length - 1 ? 'none' : '1px solid var(--border-color)', paddingBottom: '10px' }}>
                  <img src={prod.images[0]} alt={prod.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '8px' }} />
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span style={{ fontSize: '13px', fontWeight: '600' }}>{prod.name}</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{prod.category} • SKU: {prod.sku}</span>
                  </div>
                  <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--primary)' }}>${prod.salePrice.toFixed(2)}</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{prod.stock} units left</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Audit Activity Feed" actions={<Button variant="ghost" size="sm" onClick={() => onNavigate('security')} style={{ fontSize: '12px', padding: 0 }}>View All <ArrowRight size={14} /></Button>}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
              {auditLogs.slice(0, 3).map((log) => (
                <div key={log.id} style={{ display: 'flex', gap: '8px', fontSize: '13px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--primary)', marginTop: '6px' }} />
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span style={{ fontWeight: '500' }}>{log.detail}</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{log.user} • {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
export default Dashboard;
