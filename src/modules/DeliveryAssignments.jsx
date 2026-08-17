import React, { useState, useEffect } from 'react';
import { Truck, CheckCircle, Clock, XCircle, ChevronRight, UserCheck } from 'lucide-react';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Input, { Select } from '../components/Input';
import Table from '../components/Table';
import Badge from '../components/Badge';
import {
  fetchOrders,
  fetchAvailablePartners,
  assignOrderToPartner,
  reassignOrderToPartner
} from '../services/api';

const DeliveryAssignments = ({ type = 'unassigned', addToast }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [availablePartners, setAvailablePartners] = useState([]);
  
  // Modal states
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [activeOrder, setActiveOrder] = useState(null);
  const [selectedPartner, setSelectedPartner] = useState('');
  const [assignNotes, setAssignNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pagination & Filtering
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  const loadData = async () => {
    setLoading(true);
    try {
      // In a real scenario, the backend would support ?deliveryStatus=NOT_ASSIGNED
      // For now, we'll fetch orders and filter if the API doesn't filter perfectly
      // We pass some params based on type if the API supports it.
      const params = { limit, page };
      if (type === 'unassigned') {
        params.deliveryStatus = 'Not Assigned'; // Adjust to backend expected param
      } else {
        params.deliveryStatus = 'Assigned'; // Adjust to backend expected param
      }
      
      const res = await fetchOrders(params);
      if (res && res.data && res.data.orders) {
        let fetchedOrders = res.data.orders;
        
        // Manual filter fallback if backend doesn't filter
        if (type === 'unassigned') {
          fetchedOrders = fetchedOrders.filter(o => !o.deliveryStatus || o.deliveryStatus === 'Not Assigned');
        } else {
          fetchedOrders = fetchedOrders.filter(o => o.deliveryStatus && o.deliveryStatus !== 'Not Assigned' && o.deliveryStatus !== 'Delivered');
        }
        
        setOrders(fetchedOrders);
        setTotalItems(res.data.meta?.total || fetchedOrders.length);
      }
    } catch (err) {
      addToast('Failed to load orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadPartners = async () => {
    try {
      const res = await fetchAvailablePartners();
      if (res && res.data) {
        setAvailablePartners(res.data.partners || res.data || []);
      }
    } catch (err) {
      console.error('Failed to load available partners', err);
    }
  };

  useEffect(() => {
    loadData();
    loadPartners();
  }, [type, page, limit]);

  const handleOpenAssignModal = (order) => {
    setActiveOrder(order);
    setSelectedPartner('');
    setAssignNotes('');
    setIsAssignModalOpen(true);
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPartner) {
      addToast('Please select a delivery partner', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        orderId: activeOrder.id || activeOrder._id,
        deliveryPartnerId: selectedPartner,
        notes: assignNotes
      };

      if (type === 'unassigned') {
        await assignOrderToPartner(payload);
        addToast(`Order #${payload.orderId.slice(-6)} assigned successfully`, 'success');
      } else {
        await reassignOrderToPartner(payload);
        addToast(`Order #${payload.orderId.slice(-6)} reassigned successfully`, 'success');
      }
      
      setIsAssignModalOpen(false);
      loadData();
    } catch (err) {
      addToast('Failed to assign order', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = [
    { key: 'orderId', label: 'Order #', render: (row) => <strong>{row.id?.slice(-6) || row._id?.slice(-6)}</strong> },
    { key: 'customer', label: 'Customer', render: (row) => <span>{row.shippingAddress?.firstName || row.customerName || 'Unknown'}</span> },
    { key: 'postcode', label: 'Postcode', render: (row) => <span>{row.shippingAddress?.zipcode || 'N/A'}</span> },
    { key: 'amount', label: 'Amount', render: (row) => <span>£{Number(row.total || 0).toFixed(2)}</span> },
    { key: 'orderDate', label: 'Date', render: (row) => <span>{new Date(row.createdAt || Date.now()).toLocaleDateString()}</span> },
    { key: 'orderStatus', label: 'Order Status', render: (row) => <Badge variant="primary">{row.orderStatus || 'Pending'}</Badge> },
    { key: 'deliveryStatus', label: 'Delivery Status', render: (row) => <Badge variant={type === 'unassigned' ? 'secondary' : 'warning'}>{row.deliveryStatus || 'Not Assigned'}</Badge> },
    { key: 'actions', label: 'Action', render: (row) => (
      <Button variant="outline" size="sm" onClick={() => handleOpenAssignModal(row)}>
        {type === 'unassigned' ? 'Assign Partner' : 'Reassign Partner'}
      </Button>
    )}
  ];

  return (
    <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-color)', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '18px', margin: 0 }}>
          {type === 'unassigned' ? 'Unassigned Orders' : 'Active Assigned Orders'}
        </h3>
        <Button variant="outline" size="sm" onClick={loadData}>Refresh</Button>
      </div>

      <Table
        columns={columns}
        data={orders}
        loading={loading}
        initialRowsPerPage={limit}
        serverSideTotal={totalItems}
        serverSidePage={page}
        onServerPageChange={setPage}
        onServerRowsChange={setLimit}
        emptyState={<div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No orders found for this view.</div>}
      />

      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title={type === 'unassigned' ? 'Assign Delivery Partner' : 'Reassign Delivery Partner'}
      >
        {activeOrder && (
          <form onSubmit={handleAssignSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ backgroundColor: 'var(--bg-app)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <strong style={{ fontSize: '16px' }}>Order #{activeOrder.id?.slice(-6) || activeOrder._id?.slice(-6)}</strong>
                <Badge variant="primary">£{Number(activeOrder.total || 0).toFixed(2)}</Badge>
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                <strong>Customer:</strong> {activeOrder.shippingAddress?.firstName || activeOrder.customerName || 'Unknown'}<br />
                <strong>Postcode:</strong> {activeOrder.shippingAddress?.zipcode || 'N/A'}<br />
                <strong>Address:</strong> {activeOrder.shippingAddress?.address1 || 'N/A'}
              </div>
            </div>

            <Select
              label="Select Delivery Partner *"
              value={selectedPartner}
              onChange={(e) => setSelectedPartner(e.target.value)}
              options={[
                { value: '', label: 'Select a partner...' },
                ...availablePartners.map(p => ({
                  value: p.id || p._id,
                  label: `${p.name} - ${p.vehicleType} (${p.vehicleNumber})`
                }))
              ]}
              required
            />

            <Input
              label="Delivery Notes (Optional)"
              placeholder="E.g. Handle with care, call on arrival"
              value={assignNotes}
              onChange={(e) => setAssignNotes(e.target.value)}
            />

            {type !== 'unassigned' && (
              <p style={{ fontSize: '12px', color: 'var(--warning)', margin: 0 }}>
                Note: Reassigning an order will keep the previous assignment history intact.
              </p>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
              <Button type="button" variant="outline" onClick={() => setIsAssignModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={isSubmitting}>
                {isSubmitting ? 'Assigning...' : (type === 'unassigned' ? 'Assign Order' : 'Reassign Order')}
              </Button>
            </div>
          </form>
        )}
      </Modal>

    </div>
  );
};

export default DeliveryAssignments;
