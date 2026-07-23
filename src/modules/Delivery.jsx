import React, { useState } from 'react';
import { Calendar, MapPin, Navigation, Plus, ShieldCheck, UserCheck } from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';
import Modal from '../components/Modal';
import Input, { Select } from '../components/Input';
import Table from '../components/Table';
import Badge from '../components/Badge';

export const Delivery = ({
  drivers = [],
  setDrivers,
  orders = [],
  setOrders,
  addToast
}) => {
  const [activeZone, setActiveZone] = useState('Zone 1 (Downtown)');
  const [assignModal, setAssignModal] = useState(false);

  // Assign driver form
  const [selectedDriverId, setSelectedDriverId] = useState(drivers[0]?.id || '');
  const [selectedOrderId, setSelectedOrderId] = useState(orders[0]?.id || '');

  // Postcode delivery charges catalog
  const [postcodes, setPostcodes] = useState([
    { code: '97201', zone: 'Zone 1 (Downtown)', charge: 3.99, minOrder: 35.00, status: 'Active' },
    { code: '97205', zone: 'Zone 1 (Downtown)', charge: 3.99, minOrder: 35.00, status: 'Active' },
    { code: '98101', zone: 'Zone 2 (North)', charge: 4.99, minOrder: 45.00, status: 'Active' },
    { code: '78701', zone: 'Zone 3 (East)', charge: 0.00, minOrder: 0.00, status: 'Active' },
    { code: '80202', zone: 'Zone 4 (West)', charge: 5.99, minOrder: 50.00, status: 'Inactive' }
  ]);

  const handleAssignDriverSubmit = (e) => {
    e.preventDefault();
    const drv = drivers.find(d => d.id === selectedDriverId);
    const ord = orders.find(o => o.id === selectedOrderId);

    if (!drv || !ord) return;

    // Update driver activeOrder
    setDrivers(drivers.map(d => d.id === selectedDriverId ? { ...d, activeOrder: ord.id } : d));

    // Update order status & assign driver
    const nextTimeline = [
      ...ord.timeline,
      {
        status: 'Out for Delivery',
        time: new Date().toISOString(),
        desc: `Assigned to driver ${drv.name} (${drv.vehicle}). ETA 30 mins.`
      }
    ];

    setOrders(orders.map(o => o.id === ord.id ? {
      ...o,
      deliveryStatus: 'Out for Delivery',
      trackingNumber: `TRK-${drv.id}-${ord.id}`,
      timeline: nextTimeline
    } : o));

    addToast(`Order #${ord.id} assigned to driver ${drv.name}`, 'success');
    setAssignModal(false);
  };

  const postcodeCols = [
    { key: 'code', label: 'Postcode / ZIP' },
    { key: 'zone', label: 'Assigned Zone' },
    {
      key: 'charge',
      label: 'Delivery Charge',
      render: (row) => <span>${row.charge.toFixed(2)}</span>
    },
    {
      key: 'minOrder',
      label: 'Free Delivery Threshold',
      render: (row) => <span>Min: ${row.minOrder.toFixed(2)}</span>
    },
    {
      key: 'status',
      label: 'Zone Status',
      render: (row) => <Badge variant={row.status === 'Active' ? 'success' : 'danger'}>{row.status}</Badge>
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '700', letterSpacing: '-0.02em', margin: 0 }}>Logistics & Delivery</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Monitor zone grids, assign delivery slot calendars, and coordinate active couriers.</p>
        </div>
        <Button variant="primary" size="sm" icon={UserCheck} onClick={() => setAssignModal(true)}>
          Assign Driver
        </Button>
      </div>

      {/* Grid: Interactive SVG Zone Map vs Drivers Registry */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1.5fr))', gap: '20px' }}>

        {/* Simulated Map */}
        <Card title="Zone Grid Heatmap Matrix" actions={<span style={{ fontSize: '11px', color: 'var(--primary)' }}>Live Dispatch Tracking</span>}>
          <div
            style={{
              position: 'relative',
              height: '300px',
              backgroundColor: 'var(--bg-app)',
              border: '1px dashed var(--border-color)',
              borderRadius: '12px',
              overflow: 'hidden',
              marginTop: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {/* SVG Background representing delivery routes */}
            <svg style={{ position: 'absolute', width: '100%', height: '100%', opacity: 0.25 }} viewBox="0 0 100 100">
              <path d="M10,20 L50,15 L90,30 L80,80 L30,90 Z" fill="none" stroke="var(--text-secondary)" strokeWidth="0.5" strokeDasharray="2" />
              <path d="M30,30 C50,20 70,40 50,70" fill="none" stroke="var(--primary)" strokeWidth="1.5" />
              <path d="M10,50 Q40,65 90,50" fill="none" stroke="var(--accent)" strokeWidth="1" />

              {/* Delivery Zone shapes */}
              <polygon points="15,15 45,10 40,40 10,35" fill="rgba(16, 185, 129, 0.15)" stroke="var(--primary)" strokeWidth="0.5" />
              <polygon points="50,15 85,25 75,55 45,50" fill="rgba(249, 115, 22, 0.1)" stroke="var(--accent)" strokeWidth="0.5" />
              <polygon points="10,40 40,55 30,85 5,75" fill="rgba(239, 68, 68, 0.08)" stroke="var(--danger)" strokeWidth="0.5" />
            </svg>

            {/* Simulated Live Driver Pins */}
            {drivers.map(drv => (
              <div
                key={drv.id}
                style={{
                  position: 'absolute',
                  left: drv.id === 'drv-1' ? '28%' : drv.id === 'drv-2' ? '65%' : '45%',
                  top: drv.id === 'drv-1' ? '34%' : drv.id === 'drv-2' ? '45%' : '75%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  cursor: 'pointer',
                  zIndex: 5
                }}
                title={`${drv.name} in transit`}
              >
                <div style={{ backgroundColor: drv.activeOrder ? 'var(--accent)' : 'var(--primary)', color: 'white', padding: '4px', borderRadius: '50%', boxShadow: 'var(--shadow-md)' }}>
                  <Navigation size={12} style={{ transform: 'rotate(45deg)' }} />
                </div>
                <span style={{ fontSize: '9px', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', padding: '1px 4px', borderRadius: '4px', marginTop: '2px', fontWeight: 'bold' }}>
                  {drv.name.split(' ')[0]}
                </span>
              </div>
            ))}

            <div style={{ position: 'absolute', bottom: '12px', left: '12px', fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '4px', backgroundColor: 'var(--bg-card)', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--primary)' }} /> Available Drivers</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent)' }} /> On Delivery Slot</span>
            </div>
          </div>
        </Card>

        {/* Drivers Directory */}
        <Card title="Active Couriers Registry" actions={<span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--success)' }}>Online: {drivers.filter(d => d.status === 'Active').length}</span>}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
            {drivers.map(drv => (
              <div
                key={drv.id}
                style={{
                  border: '1px solid var(--border-color)',
                  padding: '12px',
                  borderRadius: '10px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  backgroundColor: 'var(--bg-card)'
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  <span style={{ fontWeight: '700', fontSize: '14px' }}>{drv.name}</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Vehicle: {drv.vehicle} • {drv.phone}</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Rating score: {drv.ratings} ★</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                  <Badge variant={drv.status === 'Active' ? 'success' : 'secondary'}>{drv.status}</Badge>
                  {drv.activeOrder ? (
                    <span style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 'bold' }}>Order: #{drv.activeOrder}</span>
                  ) : (
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Idle</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

      </div>

      {/* Postcodes parameters sheet & Calendar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>

        {/* Postcodes rates sheet */}
        <Card title="Regional Delivery Zones & Rates">
          <div style={{ marginTop: '12px' }}>
            <Table
              columns={postcodeCols}
              data={postcodes}
              initialRowsPerPage={5}
            />
          </div>
        </Card>

        {/* Holiday Calendar Mockup */}
        <Card title="Fulfillment Blackout & Holidays">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
            <div style={{ border: '1px solid var(--border-color)', padding: '12px', borderRadius: '8px', display: 'flex', gap: '12px', alignItems: 'center' }}>
              <Calendar style={{ color: 'var(--danger)' }} />
              <div>
                <strong style={{ fontSize: '13px' }}>Independence Day (July 4)</strong>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>No standard morning slots. Express delivery only.</p>
              </div>
            </div>
            <div style={{ border: '1px solid var(--border-color)', padding: '12px', borderRadius: '8px', display: 'flex', gap: '12px', alignItems: 'center' }}>
              <Calendar style={{ color: 'var(--warning)' }} />
              <div>
                <strong style={{ fontSize: '13px' }}>Warehouse Inventory Stocktaking (Aug 15)</strong>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Full system shutdown between 14:00 - 20:00.</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Assign Driver Dialog Modal */}
      <Modal
        isOpen={assignModal}
        onClose={() => setAssignModal(false)}
        title="Dispatch Logistics Driver Assignment"
        footer={
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button variant="outline" size="sm" onClick={() => setAssignModal(false)}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={handleAssignDriverSubmit}>Dispatch Order</Button>
          </div>
        }
      >
        <form onSubmit={handleAssignDriverSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Select
            label="Select Active Courier"
            value={selectedDriverId}
            onChange={(e) => setSelectedDriverId(e.target.value)}
            options={drivers.filter(d => d.status === 'Active').map(d => ({ value: d.id, label: `${d.name} (${d.vehicle})` }))}
          />

          <Select
            label="Select Pending Order reference"
            value={selectedOrderId}
            onChange={(e) => setSelectedOrderId(e.target.value)}
            options={orders.filter(o => o.deliveryStatus !== 'Delivered' && o.deliveryStatus !== 'Cancelled').map(o => ({ value: o.id, label: `Order #${o.id} - ${o.customerName} ($${o.total.toFixed(2)})` }))}
          />
        </form>
      </Modal>

    </div>
  );
};
export default Delivery;
