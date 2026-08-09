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
import { AreaChartWidget, DonutChartWidget } from '../components/Charts';
import { fetchDashboardData } from '../services/api';

export const Dashboard = ({
  products = [],
  orders = [],
  customers = [],
  auditLogs = [],
  onNavigate, // function to change tabs
  onQuickAction // function to trigger modals/drawers
}) => {
  const [apiDashboardData, setApiDashboardData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    sessionStorage.setItem('dashboard-has-animated', 'true');
    fetchDashboardData().then(res => {
      if (res && res.data) {
        setApiDashboardData(res.data);
      }
    }).catch(err => {
      console.warn('Backend dashboard API returned error. Falling back to live frontend calculations.', err);
    }).finally(() => {
      setLoading(false);
    });
  }, []);

  // Dynamic Calculations strictly from Dashboard API
  const pendingOrders = apiDashboardData?.ordersBreakdown?.pending || 0;
  const packedOrders = apiDashboardData?.ordersBreakdown?.packed || 0;
  const deliveredOrders = apiDashboardData?.ordersBreakdown?.delivered || 0;
  const cancelledOrders = apiDashboardData?.ordersBreakdown?.cancelled || 0;

  const revenueToday = apiDashboardData?.overview?.revenue || 0;
  const totalCustomersCount = apiDashboardData?.overview?.customers || 0;

  const lowStockCount = apiDashboardData?.stockAlerts?.lowStock || 0;
  const outOfStockCount = apiDashboardData?.stockAlerts?.outOfStock || 0;

  const salesData = apiDashboardData?.salesTrend || [];

  // Orders status distribution
  const orderStatusData = [
    { name: 'Delivered', value: deliveredOrders, color: 'var(--success)' },
    { name: 'Pending', value: pendingOrders, color: 'var(--warning)' },
    { name: 'Cancelled', value: cancelledOrders, color: 'var(--danger)' },
    { name: 'Packed/Staged', value: packedOrders, color: 'var(--primary)' }
  ].filter(item => item.value > 0);

  const recentOrdersList = apiDashboardData?.recentOrders || [];
  const topBrandsList = apiDashboardData?.topBrands || [];
  const dashboardAuditLogs = apiDashboardData?.auditLogs || [];

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <style>{`
          @keyframes skeleton-loading {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
          .skeleton-box {
            background: linear-gradient(90deg, var(--bg-card) 25%, var(--border-color) 50%, var(--bg-card) 75%);
            background-size: 200% 100%;
            animation: skeleton-loading 1.5s infinite;
            border-radius: var(--radius-lg);
          }
        `}</style>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div className="skeleton-box" style={{ width: '250px', height: '32px', marginBottom: '8px' }} />
            <div className="skeleton-box" style={{ width: '300px', height: '16px' }} />
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <div className="skeleton-box" style={{ width: '100px', height: '36px', borderRadius: '8px' }} />
            <div className="skeleton-box" style={{ width: '120px', height: '36px', borderRadius: '8px' }} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          {[1, 2, 3, 4].map(i => <div key={i} className="skeleton-box" style={{ height: '110px' }} />)}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="skeleton-box" style={{ width: '150px', height: '20px' }} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            {[1, 2, 3, 4].map(i => <div key={i} className="skeleton-box" style={{ height: '120px' }} />)}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 2fr))', gap: '20px' }}>
          <div className="skeleton-box" style={{ height: '350px' }} />
          <div className="skeleton-box" style={{ height: '350px', maxWidth: '380px', width: '100%', margin: '0 auto' }} />
        </div>
      </div>
    );
  }

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
          value={`£${revenueToday.toFixed(2)}`}
          trend={12.4}
          trendLabel="vs yesterday"
          icon={DollarSign}
          iconColor="var(--primary)"
          iconBg="var(--primary-light)"
        />
        <StatsCard
          title="Total Customers"
          value={totalCustomersCount}
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 2fr))' }}>
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

        {/* Recent Orders & Activity Feed */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <Card title="Recent Orders">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
              {recentOrdersList.length > 0 ? recentOrdersList.slice(0, 4).map((order, idx) => (
                <div key={order._id || idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', borderBottom: idx === Math.min(recentOrdersList.length, 4) - 1 ? 'none' : '1px solid var(--border-color)', paddingBottom: '10px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: 'var(--bg-app)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                    <ShoppingBag size={20} />
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>{order.orderNumber}</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{order.user?.email || order.shippingAddress?.email || 'Guest'}</span>
                  </div>
                  <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--primary)' }}>£{Number(order.totalAmount || 0).toFixed(2)}</span>
                    <span style={{ fontSize: '11px', color: order.paymentStatus === 'completed' ? 'var(--success)' : 'var(--warning)', textTransform: 'capitalize' }}>
                      {order.paymentStatus || 'pending'}
                    </span>
                  </div>
                </div>
              )) : (
                <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No recent orders.</div>
              )}
            </div>
          </Card>

          {topBrandsList.length > 0 && (
            <Card title="Top Brands">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
                {topBrandsList.slice(0, 3).map((brand, idx) => (
                  <div key={brand._id || idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: idx === Math.min(topBrandsList.length, 3) - 1 ? 'none' : '1px solid var(--border-color)', paddingBottom: '10px' }}>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>{brand.name}</span>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{brand.count} items sold</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

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
              {Array.isArray(dashboardAuditLogs) && dashboardAuditLogs.slice(0, 3).map((log, idx) => {
                let detailStr = log?.action || log?.detail || log?.details || 'System audit log entry';
                if (typeof detailStr === 'object') detailStr = log?.action || 'System Activity';
                const userStr = typeof log?.adminId === 'object' ? (log.adminId?.name || log.adminId?.email || 'Admin') : (log?.user || 'Admin');
                const dateVal = log?.timestamp || log?.createdAt;
                const timeStr = dateVal ? new Date(dateVal).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent';

                return (
                  <div key={log?._id || log?.id || idx} style={{ display: 'flex', gap: '8px', fontSize: '13px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--primary)', marginTop: '6px' }} />
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span style={{ fontWeight: '500', color: 'var(--text-primary)' }}>{detailStr}</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{userStr} • {timeStr}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
export default Dashboard;
