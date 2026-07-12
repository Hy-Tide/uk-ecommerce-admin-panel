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
import { motion } from 'framer-motion';
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

  React.useEffect(() => {
    sessionStorage.setItem('dashboard-has-animated', 'true');
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '700', letterSpacing: '-0.03em', margin: 0 }}>Dashboard Analytics</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
            Real-time activity overview for UK E-commerce.
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '8px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)', letterSpacing: '-0.02em', margin: '4px 0 0' }}>
          Quick Actions Console
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          {[
            {
              id: 'add-product',
              title: 'New Product',
              description: 'Add a new grocery item, set stock counts, and upload images.',
              icon: Plus,
              color: '#10b981',
              bgColor: 'rgba(16, 185, 129, 0.08)',
              action: () => onQuickAction('add-product'),
            },
            {
              id: 'fulfill-orders',
              title: 'Fulfill Orders',
              description: 'Review pending orders, pack items, and dispatch shipments.',
              icon: ShoppingBag,
              color: '#6366f1',
              bgColor: 'rgba(99, 102, 241, 0.08)',
              action: () => onNavigate('orders'),
            },
            {
              id: 'whatsapp-broadcast',
              title: 'WhatsApp Broadcast',
              description: 'Send custom promotional templates and updates to customer list.',
              icon: Send,
              color: '#059669',
              bgColor: 'rgba(5, 150, 105, 0.08)',
              action: () => onQuickAction('whatsapp-campaign'),
            },
            {
              id: 'stock-checks',
              title: 'Review Stock Checks',
              description: 'Scan low-stock and out-of-stock items needing urgent orders.',
              icon: AlertTriangle,
              color: '#f59e0b',
              bgColor: 'rgba(245, 158, 11, 0.08)',
              action: () => onNavigate('inventory'),
            },
          ].map(action => (
            <motion.div
              key={action.id}
              onClick={action.action}
              whileHover="hover"
              whileTap="tap"
              variants={{
                hover: {
                  y: -5,
                  scale: 1.015,
                  boxShadow: 'var(--shadow-md)',
                  borderColor: action.color,
                },
                tap: { scale: 0.98 }
              }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '18px',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                cursor: 'pointer',
                transition: 'border-color var(--transition-normal), background-color var(--transition-normal)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Subtle background glow */}
              <div 
                style={{
                  position: 'absolute',
                  top: '-20px',
                  right: '-20px',
                  width: '120px',
                  height: '120px',
                  background: `radial-gradient(circle, ${action.bgColor} 0%, rgba(255,255,255,0) 70%)`,
                  pointerEvents: 'none',
                  opacity: 0.7,
                }}
              />

              <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '40px',
                    height: '40px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: action.bgColor,
                    color: action.color,
                    flexShrink: 0,
                    boxShadow: `0 4px 10px rgba(0, 0, 0, 0.02)`,
                  }}
                >
                  <action.icon size={20} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', zIndex: 1 }}>
                  <h4 style={{ 
                    fontSize: '14.5px', 
                    fontWeight: '600', 
                    color: 'var(--text-primary)',
                    margin: 0,
                  }}>
                    {action.title}
                  </h4>
                  <p style={{ 
                    fontSize: '12px', 
                    color: 'var(--text-secondary)', 
                    lineHeight: '1.4',
                    margin: 0,
                  }}>
                    {action.description}
                  </p>
                </div>
              </div>

              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '4px', 
                marginTop: '16px',
                fontSize: '12px',
                fontWeight: '600',
                color: action.color,
                alignSelf: 'flex-end',
                zIndex: 1,
              }}>
                <span>Launch</span>
                <motion.span
                  variants={{
                    initial: { x: 0 },
                    hover: { x: 4 }
                  }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  style={{ display: 'inline-flex' }}
                >
                  <ArrowRight size={14} />
                </motion.span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

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

          <Card title="Audit Activity Feed" actions={
            <button
              onClick={() => onNavigate('security')}
              className="audit-view-all-btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '5px 14px',
                fontSize: '12px',
                fontWeight: '600',
                borderRadius: '20px',
                border: '1px solid var(--primary)',
                background: 'linear-gradient(135deg, var(--primary-light) 0%, transparent 100%)',
                color: 'var(--primary)',
                cursor: 'pointer',
                letterSpacing: '0.02em',
                transition: 'all 0.2s ease',
                outline: 'none',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'var(--primary)';
                e.currentTarget.style.color = '#ffffff';
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(var(--primary-rgb, 79, 70, 229), 0.35)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'linear-gradient(135deg, var(--primary-light) 0%, transparent 100%)';
                e.currentTarget.style.color = 'var(--primary)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              View All
              <ArrowRight size={13} style={{ transition: 'transform 0.2s ease' }} />
            </button>
          }>
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
