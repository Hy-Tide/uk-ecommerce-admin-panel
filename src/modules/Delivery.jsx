import React, { useState } from 'react';
import DeliveryZonesManager from './DeliveryZonesManager';
import DeliveryPartnersManager from './DeliveryPartnersManager';
import DeliveryAssignments from './DeliveryAssignments';
import DeliveryDashboard from './DeliveryDashboard';

export const Delivery = ({ addToast }) => {
  const [activeTab, setActiveTab] = useState('Dashboard'); // 'Dashboard', 'Unassigned', 'Assigned', 'Partners', 'Zones'

  const tabs = [
    { key: 'Dashboard', label: 'Dashboard' },
    { key: 'Unassigned', label: 'Unassigned Orders' },
    { key: 'Assigned', label: 'Assigned Orders' },
    { key: 'Partners', label: 'Delivery Partners' },
    { key: 'Zones', label: 'Delivery Zones' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '700', letterSpacing: '-0.02em', margin: 0 }}>Logistics & Delivery</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Manage delivery partners, order assignments, and delivery zones.</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '24px' }}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '12px 4px',
              border: 'none',
              borderBottom: activeTab === tab.key ? '2px solid var(--primary)' : '2px solid transparent',
              backgroundColor: 'transparent',
              color: activeTab === tab.key ? 'var(--primary)' : 'var(--text-secondary)',
              fontWeight: activeTab === tab.key ? '600' : '500',
              cursor: 'pointer',
              fontSize: '14px',
              transition: 'all 0.2s',
              marginBottom: '-1px'
            }}
          >
            {tab.label}
          </button>
        ))}
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
