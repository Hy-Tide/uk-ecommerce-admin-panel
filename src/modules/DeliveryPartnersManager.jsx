import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Eye, Power, CheckCircle, Clock, Search, MapPin } from 'lucide-react';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Input, { Select } from '../components/Input';
import Table from '../components/Table';
import Badge from '../components/Badge';
import Card from '../components/Card';
import { ShimmerRow } from '../components/ShimmerSkeleton';
import {
  fetchDeliveryPartners,
  createDeliveryPartner,
  updateDeliveryPartner,
  deleteDeliveryPartner,
  getPartnerAssignments,
  getPartnerHistory
} from '../services/api';

const DeliveryPartnersManager = ({ addToast }) => {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Pagination & Filters
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Form State
  const [currentPartnerId, setCurrentPartnerId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    vehicleType: 'Car',
    vehicleNumber: '',
    isActive: true,
    status: 'AVAILABLE'
  });

  // Details State
  const [activePartnerDetails, setActivePartnerDetails] = useState(null);
  const [activeAssignments, setActiveAssignments] = useState([]);
  const [deliveryHistory, setDeliveryHistory] = useState([]);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const loadPartners = async () => {
    setLoading(true);
    try {
      const params = { limit, page };
      if (searchTerm) params.search = searchTerm;
      if (statusFilter) params.status = statusFilter;
      
      const res = await fetchDeliveryPartners(params);
      if (res && res.data) {
        const list = res.data.partners || res.data || [];
        setPartners(list);
        setTotalItems(res.data.meta?.total || list.length);
      }
    } catch (err) {
      addToast('Failed to load delivery partners', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPartners();
  }, [page, limit, searchTerm, statusFilter]);

  const handleOpenModal = (partner = null) => {
    if (partner) {
      setCurrentPartnerId(partner._id || partner.id);
      setFormData({
        name: partner.name || '',
        phone: partner.phone || '',
        email: partner.email || '',
        vehicleType: partner.vehicleType || 'Car',
        vehicleNumber: partner.vehicleNumber || '',
        isActive: partner.isActive !== false,
        status: partner.status || 'AVAILABLE'
      });
    } else {
      setCurrentPartnerId(null);
      setFormData({
        name: '',
        phone: '',
        email: '',
        vehicleType: 'Car',
        vehicleNumber: '',
        isActive: true,
        status: 'AVAILABLE'
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      addToast('Name and phone number are required', 'error');
      return;
    }

    setIsSaving(true);
    try {
      if (currentPartnerId) {
        await updateDeliveryPartner(currentPartnerId, formData);
        addToast('Delivery partner updated successfully', 'success');
      } else {
        await createDeliveryPartner(formData);
        addToast('Delivery partner created successfully', 'success');
      }
      setIsModalOpen(false);
      loadPartners();
    } catch (err) {
      addToast('Failed to save delivery partner', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this delivery partner?')) {
      try {
        await deleteDeliveryPartner(id);
        addToast('Delivery partner deleted successfully', 'success');
        loadPartners();
      } catch (err) {
        addToast('Failed to delete partner', 'error');
      }
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const partner = partners.find(p => (p._id || p.id) === id);
      if (partner) {
        await updateDeliveryPartner(id, { isActive: !currentStatus });
        addToast(`Partner ${!currentStatus ? 'activated' : 'deactivated'} successfully`, 'success');
        loadPartners();
      }
    } catch (err) {
      addToast('Failed to update status', 'error');
    }
  };

  const handleViewDetails = async (partner) => {
    setActivePartnerDetails(partner);
    setIsDetailsModalOpen(true);
    setDetailsLoading(true);
    setActiveAssignments([]);
    setDeliveryHistory([]);
    const id = partner._id || partner.id;
    try {
      const [assignmentsRes, historyRes] = await Promise.allSettled([
        getPartnerAssignments(id),
        getPartnerHistory(id)
      ]);

      if (assignmentsRes.status === 'fulfilled' && assignmentsRes.value) {
        const aRes = assignmentsRes.value;
        const list = aRes?.data?.assignments || aRes?.data || (Array.isArray(aRes) ? aRes : []);
        if (Array.isArray(list)) setActiveAssignments(list);
      }

      if (historyRes.status === 'fulfilled' && historyRes.value) {
        const hRes = historyRes.value;
        const list = hRes?.data?.history || hRes?.data || (Array.isArray(hRes) ? hRes : []);
        if (Array.isArray(list)) setDeliveryHistory(list);
      }
    } catch (err) {
      console.error('Failed to load partner details:', err);
    } finally {
      setDetailsLoading(false);
    }
  };

  const getOrderNumberStr = (orderIdVal) => {
    if (!orderIdVal) return 'N/A';
    if (typeof orderIdVal === 'object') {
      return orderIdVal.orderNumber || orderIdVal.orderId || orderIdVal.id || orderIdVal._id || 'N/A';
    }
    const str = String(orderIdVal);
    return str.length > 6 ? str.slice(-6) : str;
  };

  const formatHistoryDate = (dateVal) => {
    if (!dateVal) return 'Recent';
    try {
      const d = new Date(dateVal);
      return isNaN(d.getTime()) ? 'Recent' : d.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return 'Recent';
    }
  };

  const getStatusBadgeVariant = (status) => {
    const s = String(status || '').toUpperCase();
    switch (s) {
      case 'AVAILABLE': return 'success';
      case 'ON_DELIVERY': return 'warning';
      case 'INACTIVE': return 'danger';
      default: return 'secondary';
    }
  };

  const columns = [
    { key: 'name', label: 'Partner Name', render: (row) => <strong style={{color: 'var(--text-primary)'}}>{row.name || 'Unnamed Partner'}</strong> },
    { key: 'phone', label: 'Contact', render: (row) => (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span>{row.phone || 'N/A'}</span>
        <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{row.email || ''}</span>
      </div>
    )},
    { key: 'vehicle', label: 'Vehicle', render: (row) => <span>{row.vehicleType || 'Car'} ({row.vehicleNumber || 'N/A'})</span> },
    { key: 'status', label: 'Current Status', render: (row) => (
      <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
        <Badge variant={getStatusBadgeVariant(row.status)}>
          {String(row.status || 'AVAILABLE').replace(/_/g, ' ')}
        </Badge>
        {!row.isActive && <Badge variant="danger">Disabled</Badge>}
      </div>
    )},
    { key: 'activeOrders', label: 'Active Orders', render: (row) => <span>{row.activeOrdersCount || 0}</span> },
    { key: 'totalDelivered', label: 'Total Delivered', render: (row) => <span>{row.totalDeliveredOrders || 0}</span> },
    { key: 'actions', label: 'Actions', render: (row) => (
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={() => handleViewDetails(row)}
          title="View Details"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', padding: '4px' }}
        >
          <Eye size={16} />
        </button>
        <button
          onClick={() => handleToggleStatus(row._id || row.id, row.isActive)}
          title={row.isActive ? 'Deactivate' : 'Activate'}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: row.isActive ? 'var(--warning)' : 'var(--success)', padding: '4px' }}
        >
          <Power size={16} />
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
    )}
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-color)', padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '14px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '12px', flex: 1, maxWidth: '540px', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
              <input
                type="text"
                placeholder="Search partners by name or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px 9px 36px',
                  fontSize: '13px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-app)',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            <div style={{ width: '160px' }}>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={[
                  { value: '', label: 'All Statuses' },
                  { value: 'AVAILABLE', label: 'Available' },
                  { value: 'ON_DELIVERY', label: 'On Delivery' },
                  { value: 'INACTIVE', label: 'Inactive' }
                ]}
              />
            </div>
          </div>
          <Button variant="primary" size="sm" icon={Plus} onClick={() => handleOpenModal()}>
            Add Delivery Partner
          </Button>
        </div>

        <Table
          columns={columns}
          data={partners}
          loading={loading}
          initialRowsPerPage={limit}
          serverSideTotal={totalItems}
          serverSidePage={page}
          onServerPageChange={setPage}
          onServerRowsChange={setLimit}
          emptyState={<div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No delivery partners found.</div>}
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={currentPartnerId ? 'Edit Delivery Partner' : 'Create Delivery Partner'}
      >
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Input
            label="Partner Name *"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Input
            label="Phone Number *"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            required
          />
          <Input
            label="Email Address"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <Select
            label="Vehicle Type"
            value={formData.vehicleType}
            onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
            options={['Bike', 'Scooter', 'Car', 'Van', 'Truck']}
          />
          <Input
            label="Vehicle Number"
            value={formData.vehicleNumber}
            onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
          />
          <Select
            label="Current Status"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            options={[
              { value: 'AVAILABLE', label: 'Available' },
              { value: 'ON_DELIVERY', label: 'On Delivery' },
              { value: 'INACTIVE', label: 'Inactive' }
            ]}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
            <input
              type="checkbox"
              id="isActivePartner"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              style={{ width: '16px', height: '16px', cursor: 'pointer' }}
            />
            <label htmlFor="isActivePartner" style={{ fontSize: '14px', cursor: 'pointer', color: 'var(--text-primary)' }}>
              Partner is Active (can be assigned to new orders)
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Partner'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Details Modal */}
      <Modal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        title="Delivery Partner Details"
        size="lg"
      >
        {activePartnerDetails && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--border-color)', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '24px', fontWeight: 'bold', color: 'var(--text-muted)' }}>
                {(activePartnerDetails.name || 'D').charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px' }}>{activePartnerDetails.name || 'Delivery Partner'}</h3>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>
                  {activePartnerDetails.phone || 'No Contact'} • {activePartnerDetails.vehicleType || 'Vehicle'} ({activePartnerDetails.vehicleNumber || 'N/A'})
                </p>
                <div style={{ marginTop: '6px' }}>
                  <Badge variant={getStatusBadgeVariant(activePartnerDetails.status)}>
                    {String(activePartnerDetails.status || 'AVAILABLE').replace(/_/g, ' ')}
                  </Badge>
                </div>
              </div>
            </div>

            {detailsLoading ? (
              <div style={{ padding: '12px 0' }}>
                <ShimmerRow count={3} height="60px" />
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                <Card title="Currently Assigned Orders">
                  {(!activeAssignments || activeAssignments.length === 0) ? (
                    <p style={{ color: 'var(--text-muted)', fontSize: '13px', padding: '12px 0' }}>No active assignments.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
                      {activeAssignments.map((assignment, idx) => {
                        const orderNum = getOrderNumberStr(assignment.orderId || assignment._id || assignment.id);
                        return (
                          <div key={assignment.id || assignment._id || idx} style={{ border: '1px solid var(--border-color)', padding: '10px', borderRadius: '8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                              <strong style={{ fontSize: '13px' }}>Order #{orderNum}</strong>
                              <Badge variant="warning">{assignment.status || 'Assigned'}</Badge>
                            </div>
                            <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>
                              <MapPin size={12} style={{ display: 'inline', marginRight: '4px' }} />
                              {assignment.deliveryAddress || 'Address not specified'}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </Card>

                <Card title="Delivery History">
                  {(!deliveryHistory || deliveryHistory.length === 0) ? (
                    <p style={{ color: 'var(--text-muted)', fontSize: '13px', padding: '12px 0' }}>No delivery history.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
                      {deliveryHistory.slice(0, 10).map((history, idx) => {
                        const orderNum = getOrderNumberStr(history.orderId || history._id || history.id);
                        const isDelivered = String(history.status || '').toUpperCase() === 'DELIVERED';
                        const isFailed = String(history.status || '').toUpperCase() === 'FAILED';
                        const dateText = formatHistoryDate(history.completedAt || history.updatedAt || history.createdAt);
                        return (
                          <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'center', borderBottom: idx < Math.min(deliveryHistory.length, 10) - 1 ? '1px solid var(--border-color)' : 'none', paddingBottom: '8px' }}>
                            <div style={{ color: isDelivered ? 'var(--success)' : (isFailed ? 'var(--danger)' : 'var(--text-secondary)') }}>
                              {isDelivered ? <CheckCircle size={16} /> : <Clock size={16} />}
                            </div>
                            <div>
                              <p style={{ margin: 0, fontSize: '13px', fontWeight: '500' }}>Order #{orderNum}</p>
                              <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-muted)' }}>
                                {dateText} • {history.status || 'Completed'}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </Card>
              </div>
            )}
          </div>
        )}
      </Modal>

    </div>
  );
};

export default DeliveryPartnersManager;
