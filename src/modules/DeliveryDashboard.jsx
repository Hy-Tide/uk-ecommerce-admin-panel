import React, { useState, useEffect } from 'react';
import { PackageSearch, Truck, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import Card, { StatsCard } from '../components/Card';
import { fetchOrders } from '../services/api';

const DeliveryDashboard = ({ addToast }) => {
  const [counts, setCounts] = useState({
    unassigned: 0,
    assigned: 0,
    accepted: 0,
    pickedUp: 0,
    outForDelivery: 0,
    delivered: 0,
    failed: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      try {
        // Fetch recent orders or a stats endpoint
        // Since we might not have a dedicated stats endpoint for deliveries, 
        const res = await fetchOrders({ limit: 10, page: 1 });
        if (res && res.data && res.data.orders) {
          const orders = res.data.orders;
          
          let c = {
            unassigned: 0,
            assigned: 0,
            accepted: 0,
            pickedUp: 0,
            outForDelivery: 0,
            delivered: 0,
            failed: 0
          };

          orders.forEach(o => {
            const status = o.deliveryStatus || 'Not Assigned';
            switch (status) {
              case 'Not Assigned': c.unassigned++; break;
              case 'Assigned': c.assigned++; break;
              case 'Accepted': c.accepted++; break;
              case 'Picked Up': c.pickedUp++; break;
              case 'Out for Delivery': c.outForDelivery++; break;
              case 'Delivered': c.delivered++; break;
              case 'Failed': c.failed++; break;
              default: break;
            }
          });
          
          setCounts(c);
        }
      } catch (err) {
        if (addToast) addToast('Failed to load delivery dashboard stats', 'error');
      } finally {
        setLoading(false);
      }
    };
    
    loadStats();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <StatsCard 
          title="Unassigned Orders" 
          value={loading ? '...' : counts.unassigned} 
          icon={PackageSearch} 
          iconBg="var(--bg-app)" 
          iconColor="var(--text-secondary)" 
        />
        <StatsCard 
          title="Assigned to Partners" 
          value={loading ? '...' : counts.assigned} 
          icon={CheckCircle} 
          iconBg="var(--primary-light)" 
          iconColor="var(--primary)" 
        />
        <StatsCard 
          title="Accepted & Picked Up" 
          value={loading ? '...' : (counts.accepted + counts.pickedUp)} 
          icon={PackageSearch} 
          iconBg="var(--warning-light)" 
          iconColor="var(--warning)" 
        />
        <StatsCard 
          title="Out for Delivery" 
          value={loading ? '...' : counts.outForDelivery} 
          icon={Truck} 
          iconBg="var(--accent-light)" 
          iconColor="var(--accent)" 
        />
        <StatsCard 
          title="Successfully Delivered" 
          value={loading ? '...' : counts.delivered} 
          icon={CheckCircle} 
          iconBg="var(--success-light)" 
          iconColor="var(--success)" 
        />
        <StatsCard 
          title="Failed Deliveries" 
          value={loading ? '...' : counts.failed} 
          icon={XCircle} 
          iconBg="var(--danger-light)" 
          iconColor="var(--danger)" 
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
        <Card title="Delivery Operations Overview">
          <div style={{ padding: '20px', color: 'var(--text-secondary)', textAlign: 'center' }}>
            <AlertCircle size={32} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
            <p style={{ margin: 0 }}>This dashboard tracks the status of deliveries assigned to the business's own internal delivery network.</p>
          </div>
        </Card>
      </div>

    </div>
  );
};

export default DeliveryDashboard;
