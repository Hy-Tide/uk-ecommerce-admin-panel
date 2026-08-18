import React, { useState } from 'react';
import { LayoutDashboard, PackageSearch, Truck, Users, MapPin } from 'lucide-react';
import DeliveryZonesManager from './DeliveryZonesManager';
import DeliveryPartnersManager from './DeliveryPartnersManager';
import DeliveryAssignments from './DeliveryAssignments';
import DeliveryDashboard from './DeliveryDashboard';

export const Delivery = ({ addToast }) => {
  const [activeTab, setActiveTab] = useState('Dashboard'); // 'Dashboard', 'Unassigned', 'Assigned', 'Partners', 'Zones'

  const tabs = [
    { key: 'Dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { key: 'Unassigned', label: 'Unassigned Orders', icon: PackageSearch },
    { key: 'Assigned', label: 'Assigned Orders', icon: Truck },
    { key: 'Partners', label: 'Delivery Partners', icon: Users },
    { key: 'Zones', label: 'Delivery Zones', icon: MapPin }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '800', letterSpacing: '-0.03em', margin: 0 }}>Logistics & Delivery</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px', margin: 0 }}>Manage delivery partners, order assignments, and delivery zones.</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '6px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', overflowX: 'auto' }}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                border: 'none',
                borderRadius: '8px',
                backgroundColor: isActive ? 'var(--primary-light)' : 'transparent',
                color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                fontWeight: isActive ? '700' : '500',
                cursor: 'pointer',
                fontSize: '13px',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap'
              }}
            >
              <Icon size={15} style={{ color: isActive ? 'var(--primary)' : 'var(--text-muted)' }} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div style={{ marginTop: '4px' }}>
        {activeTab === 'Dashboard' && <DeliveryDashboard addToast={addToast} />}
        {activeTab === 'Unassigned' && <DeliveryAssignments type="unassigned" addToast={addToast} />}
        {activeTab === 'Assigned' && <DeliveryAssignments type="assigned" addToast={addToast} />}
        {activeTab === 'Partners' && <DeliveryPartnersManager addToast={addToast} />}
        {activeTab === 'Zones' && <DeliveryZonesManager addToast={addToast} />}
      </div>
    </div>
  );
};

export default Delivery;
