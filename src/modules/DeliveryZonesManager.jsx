import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, MapPin, Power } from 'lucide-react';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Input, { Select } from '../components/Input';
import Table from '../components/Table';
import Badge from '../components/Badge';
import MapPolygonDrawer from './MapPolygonDrawer';
import { fetchDeliveryZones, createDeliveryZone, updateDeliveryZone, deleteDeliveryZone } from '../services/api';
import { TableShimmer } from '../components/ShimmerSkeleton';

const DeliveryZonesManager = ({ addToast }) => {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [currentZoneId, setCurrentZoneId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    deliveryCharge: 0,
    minimumOrderValue: 0,
    estimatedDeliveryTime: '30-45 mins',
    isActive: true,
    coordinates: []
  });

  const loadZones = async () => {
    setLoading(true);
    try {
      const res = await fetchDeliveryZones();
      if (res && res.data) {
        setZones(res.data.deliveryZones || res.data || []);
      }
    } catch (err) {
      addToast('Failed to load delivery zones', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadZones();
  }, []);

  const isZoneActive = (zone) => {
    if (!zone) return false;
    if (zone.isActive !== undefined) return Boolean(zone.isActive);
    if (zone.is_active !== undefined) return Boolean(zone.is_active);
    if (zone.status) {
      const s = String(zone.status).toLowerCase();
      return s === 'active' || s === 'enabled';
    }
    return true;
  };

  const handleOpenModal = (zone = null) => {
    if (zone) {
      const activeState = isZoneActive(zone);
      setCurrentZoneId(zone._id || zone.id);
      setFormData({
        name: zone.name || '',
        description: zone.description || '',
        deliveryCharge: zone.deliveryCharge || 0,
        minimumOrderValue: zone.minimumOrderValue || 0,
        estimatedDeliveryTime: zone.estimatedDeliveryTime || '',
        isActive: activeState,
        coordinates: zone.coordinates && zone.coordinates[0] ? zone.coordinates[0] : []
      });
    } else {
      setCurrentZoneId(null);
      setFormData({
        name: '',
        description: '',
        deliveryCharge: 0,
        minimumOrderValue: 0,
        estimatedDeliveryTime: '30-45 mins',
        isActive: true,
        coordinates: []
      });
    }
    setIsModalOpen(true);
  };

  const handleCoordinatesChange = (newCoords) => {
    setFormData(prev => ({ ...prev, coordinates: newCoords }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      addToast('Zone name is required', 'error');
      return;
    }
    if (!formData.coordinates || formData.coordinates.length < 3) {
      addToast('Please draw a valid polygon on the map', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        ...formData,
        shapeType: 'polygon',
        coordinates: [formData.coordinates] // Backend expects array of arrays for polygon
      };

      if (currentZoneId) {
        await updateDeliveryZone(currentZoneId, payload);
        addToast('Delivery zone updated successfully', 'success');
      } else {
        await createDeliveryZone(payload);
        addToast('Delivery zone created successfully', 'success');
      }
      setIsModalOpen(false);
      loadZones();
    } catch (err) {
      addToast('Failed to save delivery zone', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this delivery zone?')) {
      try {
        await deleteDeliveryZone(id);
        addToast('Delivery zone deleted successfully', 'success');
        loadZones();
      } catch (err) {
        addToast('Failed to delete delivery zone', 'error');
      }
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const zoneToUpdate = zones.find(z => (z._id || z.id) === id);
      if (zoneToUpdate) {
        const nextActive = !currentStatus;
        const payload = {
          ...zoneToUpdate,
          isActive: nextActive,
          is_active: nextActive,
          status: nextActive ? 'active' : 'inactive'
        };

        // Optimistic UI state update
        setZones(zones.map(z => ((z._id || z.id) === id ? { ...z, ...payload } : z)));

        await updateDeliveryZone(id, payload);
        addToast(`Zone ${nextActive ? 'activated' : 'deactivated'} successfully`, 'success');
        loadZones();
      }
    } catch (err) {
      addToast('Failed to update status', 'error');
      loadZones();
    }
  };

  const columns = [
    { key: 'name', label: 'Zone Name', render: (row) => <strong style={{color: 'var(--text-primary)'}}>{row.name}</strong> },
    { key: 'deliveryCharge', label: 'Delivery Charge', render: (row) => <span>£{Number(row.deliveryCharge || 0).toFixed(2)}</span> },
    { key: 'minimumOrderValue', label: 'Min Order', render: (row) => <span>£{Number(row.minimumOrderValue || 0).toFixed(2)}</span> },
    { key: 'estimatedDeliveryTime', label: 'Est. Time' },
    { key: 'isActive', label: 'Status', render: (row) => {
      const active = isZoneActive(row);
      return (
        <Badge variant={active ? 'success' : 'danger'}>
          {active ? 'Active' : 'Inactive'}
        </Badge>
      );
    }},
    { key: 'actions', label: 'Actions', render: (row) => {
      const active = isZoneActive(row);
      return (
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            onClick={() => handleToggleStatus(row._id || row.id, active)}
            title={active ? 'Deactivate Zone' : 'Activate Zone'}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: active ? '#10b981' : '#9ca3af',
              padding: '4px',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <Power size={18} style={{ strokeWidth: 2.2 }} />
          </button>
          <button
            onClick={() => handleOpenModal(row)}
            title="Edit"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '4px' }}
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={() => handleDelete(row._id || row.id)}
            title="Delete"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', padding: '4px' }}
          >
            <Trash2 size={16} />
          </button>
        </div>
      );
    }}
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: '600', margin: 0, color: 'var(--text-primary)' }}>Delivery Zones</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Manage your own custom delivery areas</p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => handleOpenModal()}>
          Add Delivery Zone
        </Button>
      </div>

      <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-color)', padding: '20px' }}>
        {loading ? (
          <TableShimmer rows={5} cols={5} />
        ) : (
          <Table
            columns={columns}
            data={zones}
            emptyState={<div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No delivery zones found. Click 'Add Delivery Zone' to create one.</div>}
          />
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={currentZoneId ? 'Edit Delivery Zone' : 'Create Delivery Zone'}
        size="lg"
      >
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Input
              label="Zone Name"
              placeholder="e.g. Downtown Area"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <Input
              label="Estimated Delivery Time"
              placeholder="e.g. 30-45 mins"
              value={formData.estimatedDeliveryTime}
              onChange={(e) => setFormData({ ...formData, estimatedDeliveryTime: e.target.value })}
            />
            <Input
              label="Delivery Charge"
              type="number"
              min="0"
              step="0.01"
              value={formData.deliveryCharge}
              onChange={(e) => setFormData({ ...formData, deliveryCharge: parseFloat(e.target.value) || 0 })}
            />
            <Input
              label="Minimum Order Value"
              type="number"
              min="0"
              step="0.01"
              value={formData.minimumOrderValue}
              onChange={(e) => setFormData({ ...formData, minimumOrderValue: parseFloat(e.target.value) || 0 })}
            />
            <div style={{ gridColumn: '1 / -1' }}>
              <Input
                label="Description"
                placeholder="Optional description of this zone"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            
            <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                id="isActiveZone"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                style={{ width: '16px', height: '16px', cursor: 'pointer' }}
              />
              <label htmlFor="isActiveZone" style={{ fontSize: '14px', cursor: 'pointer', color: 'var(--text-primary)' }}>
                Zone is Active
              </label>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: 'var(--text-primary)' }}>
              Draw Map Area (Polygon)
            </label>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
              Use the polygon tool on the left side of the map to draw the boundaries of this delivery zone.
            </p>
            <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '4px', backgroundColor: 'var(--bg-app)' }}>
              {isModalOpen && (
                <MapPolygonDrawer 
                  coordinates={formData.coordinates} 
                  onChange={handleCoordinatesChange} 
                />
              )}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Zone'}
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
};

export default DeliveryZonesManager;
