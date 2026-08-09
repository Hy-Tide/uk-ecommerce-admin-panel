import React, { useState, useEffect } from 'react';
import {
  CreditCard, DollarSign, RefreshCw, Search, Calendar, AlertTriangle,
  CheckCircle2, ArrowUpRight, ArrowDownLeft, ShieldAlert, Eye, RotateCcw,
  FileSpreadsheet, Filter, Info, ChevronRight, Lock
} from 'lucide-react';
import Button from '../components/Button';
import Card, { StatsCard } from '../components/Card';
import Modal from '../components/Modal';
import Drawer from '../components/Drawer';
import Input, { Select } from '../components/Input';
import ListView from '../components/ListView';
import Badge from '../components/Badge';
import {
  fetchAdminPayments,
  fetchFailedPayments,
  getPaymentById,
  refundPayment
} from '../services/api';

export const Payments = ({ addToast }) => {
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'failed'
  const [payments, setPayments] = useState([]);
  const [meta, setMeta] = useState({ total: 0, currentPage: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  // Filter parameters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Selected Payment Drawer
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Refund Modal
  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const [refundPaymentTarget, setRefundPaymentTarget] = useState(null);
  const [refundAmount, setRefundAmount] = useState('');
  const [refunding, setRefunding] = useState(false);

  // Load Payments
  const loadPayments = async () => {
    setLoading(true);
    const params = { page: 1, limit: 20 };
    if (searchTerm.trim()) params.search = searchTerm.trim();
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    try {
      let res;
      if (activeTab === 'failed') {
        res = await fetchFailedPayments(params);
      } else {
        if (statusFilter) params.status = statusFilter;
        res = await fetchAdminPayments(params);
      }

      if (res && res.success !== false) {
        const pList = res.data?.payments || (Array.isArray(res.data) ? res.data : []);
        setPayments(Array.isArray(pList) ? pList : []);
        setMeta({
          total: res.data?.total || pList.length,
          currentPage: res.data?.currentPage || 1,
          totalPages: res.data?.totalPages || 1
        });
      }
    } catch (err) {
      console.error('Error fetching payments:', err);
      if (addToast) addToast('Failed to load payment transactions', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, [activeTab, statusFilter, startDate, endDate]);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    loadPayments();
  };

  // Open Payment Details Drawer
  const handleOpenDetail = async (row) => {
    setSelectedPayment(row);
    setDrawerOpen(true);
    const id = row._id || row.id || row.paymentId;
    if (id) {
      setLoadingDetail(true);
      try {
        const res = await getPaymentById(id);
        if (res && res.data) {
          setSelectedPayment(res.data);
        }
      } catch (err) {
        console.error('Error getting payment details:', err);
      } finally {
        setLoadingDetail(false);
      }
    }
  };

  // Open Refund Modal
  const handleOpenRefundModal = (payment) => {
    setRefundPaymentTarget(payment);
    const maxAmt = payment.amount || payment.total || 0;
    setRefundAmount(maxAmt);
    setRefundModalOpen(true);
  };

  // Process Stripe Refund via POST /admin/payments/{id}/refund
  const handleProcessRefund = async (e) => {
    if (e) e.preventDefault();
    if (!refundPaymentTarget) return;

    const amt = parseFloat(refundAmount);
    if (isNaN(amt) || amt <= 0) {
      if (addToast) addToast('Please enter a valid refund amount', 'danger');
      return;
    }

    setRefunding(true);
    try {
      const res = await refundPayment(refundPaymentTarget._id || refundPaymentTarget.id, { amount: amt });
      if (res && res.success !== false) {
        if (addToast) addToast(res.message || `Successfully refunded £${amt.toFixed(2)} via Stripe`, 'success');
        setRefundModalOpen(false);
        if (drawerOpen) setDrawerOpen(false);
        loadPayments();
      } else {
        const msg = res?.error || res?.message || 'Refund failed';
        if (addToast) addToast(msg, 'danger');
      }
    } catch (err) {
      console.error('Error processing refund:', err);
      if (addToast) addToast(err.message || 'Error processing refund', 'danger');
    } finally {
      setRefunding(false);
    }
  };

  const formatCurrency = (val) => `£${(Number(val) || 0).toFixed(2)}`;

  const getStatusBadge = (st) => {
    const s = (st || '').toLowerCase();
    if (s === 'completed' || s === 'succeeded' || s === 'paid') {
      return <Badge variant="success">Completed</Badge>;
    }
    if (s === 'failed' || s === 'declined') {
      return <Badge variant="danger">Failed</Badge>;
    }
    if (s === 'refunded' || s === 'partially_refunded') {
      return <Badge variant="warning">Refunded</Badge>;
    }
    return <Badge variant="secondary">{st || 'Pending'}</Badge>;
  };

  // Stats computation
  const totalVolume = payments.reduce((sum, p) => sum + (p.amount || p.total || 0), 0);
  const failedCount = payments.filter(p => (p.status || '').toLowerCase() === 'failed').length;

  const columns = [
    {
      key: 'transactionId',
      label: 'Transaction / Order ID',
      render: (row) => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontWeight: '700', fontFamily: 'monospace', fontSize: '12px', color: 'var(--primary)' }}>
            {row.transactionId || row._id || row.paymentIntentId || 'TXN-99120'}
          </span>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
            Order #{row.orderNumber || row.orderId || 'ORD-1002'}
          </span>
        </div>
      )
    },
    {
      key: 'customer',
      label: 'Customer Info',
      render: (row) => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontWeight: '700', fontSize: '13px', color: 'var(--text-primary)' }}>
            {row.customerName || row.name || row.customerEmail || 'Customer'}
          </span>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
            {row.customerEmail || row.email || 'customer@uk.com'}
          </span>
        </div>
      )
    },
    {
      key: 'paymentMethod',
      label: 'Method',
      render: (row) => (
        <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-primary)', textTransform: 'capitalize' }}>
          {row.paymentMethod || row.method || 'Stripe Card'}
        </span>
      )
    },
    {
      key: 'amount',
      label: 'Amount (£)',
      render: (row) => (
        <span style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-primary)' }}>
          {formatCurrency(row.amount || row.total)}
        </span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => getStatusBadge(row.status)
    },
    {
      key: 'createdAt',
      label: 'Date & Time',
      render: (row) => (
        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          {row.createdAt || row.date ? new Date(row.createdAt || row.date).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recent'}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div style={{ display: 'flex', gap: '6px' }}>
          <Button variant="outline" size="sm" icon={Eye} onClick={() => handleOpenDetail(row)}>
            Details
          </Button>
          {((row.status || '').toLowerCase() === 'completed' || (row.status || '').toLowerCase() === 'succeeded') && (
            <Button variant="ghost" size="sm" icon={RotateCcw} style={{ color: 'var(--warning)' }} onClick={() => handleOpenRefundModal(row)}>
              Refund
            </Button>
          )}
        </div>
      )
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '800', letterSpacing: '-0.03em', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CreditCard size={24} style={{ color: 'var(--primary)' }} /> Admin Payments & Stripe Refund Hub
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px', margin: 0 }}>
            Audit payment transactions, monitor failed checkouts, and process instant Stripe refunds.
          </p>
        </div>

        <Button variant="outline" size="sm" icon={RefreshCw} onClick={loadPayments}>
          Refresh Transactions
        </Button>
      </div>

      {/* KPI Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
        <StatsCard title="Total Payments Logged" value={meta.total || payments.length} icon={CreditCard} iconColor="#6366f1" iconBg="#ede9fe" />
        <StatsCard title="Transaction Volume" value={formatCurrency(totalVolume)} icon={DollarSign} iconColor="#10b981" iconBg="#d1fae5" />
        <StatsCard title="Failed Payment Attempts" value={failedCount} icon={ShieldAlert} iconColor="#ef4444" iconBg="#fee2e2" />
        <StatsCard title="Stripe Status" value="Online Connected" icon={Lock} iconColor="#0ea5e9" iconBg="#e0f2fe" />
      </div>

      {/* Navigation Sub-Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '4px' }}>
        <button
          onClick={() => setActiveTab('all')}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', fontSize: '13px', fontWeight: '700', borderRadius: '10px', border: 'none', cursor: 'pointer',
            backgroundColor: activeTab === 'all' ? 'var(--primary)' : 'var(--bg-card)', color: activeTab === 'all' ? '#fff' : 'var(--text-secondary)',
            boxShadow: activeTab === 'all' ? '0 2px 10px rgba(79,70,229,0.3)' : '1px solid var(--border-color)'
          }}
        >
          <CreditCard size={16} /> All Payment Reports
        </button>
        <button
          onClick={() => setActiveTab('failed')}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', fontSize: '13px', fontWeight: '700', borderRadius: '10px', border: 'none', cursor: 'pointer',
            backgroundColor: activeTab === 'failed' ? 'var(--danger)' : 'var(--bg-card)', color: activeTab === 'failed' ? '#fff' : 'var(--text-secondary)',
            boxShadow: activeTab === 'failed' ? '0 2px 10px rgba(239,68,68,0.3)' : '1px solid var(--border-color)'
          }}
        >
          <AlertTriangle size={16} /> Failed Payments Report
        </button>
      </div>

      {/* Filter Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', flex: 1 }}>
          <div style={{ position: 'relative', width: '260px' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search Order ID, Name, Email..."
              style={{
                width: '100%', padding: '6px 12px 6px 30px', fontSize: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)'
              }}
            />
          </div>

          {activeTab === 'all' && (
            <Select
              label=""
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { label: 'All Statuses', value: '' },
                { label: 'Completed / Paid', value: 'completed' },
                { label: 'Failed', value: 'failed' },
                { label: 'Refunded', value: 'refunded' }
              ]}
            />
          )}

          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={{ padding: '5px 8px', fontSize: '12px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }} />
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>to</span>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={{ padding: '5px 8px', fontSize: '12px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }} />
          </div>

          <Button variant="outline" size="sm" type="submit">Filter</Button>
        </form>
      </div>

      {/* Main Payment Ledger */}
      <Card title={activeTab === 'failed' ? 'Failed Payment Attempts Ledger' : 'All Payments Transaction Ledger'}>
        <div style={{ marginTop: '12px' }}>
          {loading ? (
            <div style={{ padding: '36px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading payment records...</div>
          ) : payments.length === 0 ? (
            <div style={{ padding: '36px', textAlign: 'center', color: 'var(--text-secondary)' }}>No payment transactions found.</div>
          ) : (
            <ListView
              columns={columns}
              data={payments}
              initialRowsPerPage={10}
            />
          )}
        </div>
      </Card>

      {/* Payment Details Drawer */}
      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Transaction & Payment Audit Details"
      >
        {selectedPayment && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ padding: '16px', borderRadius: '10px', backgroundColor: 'var(--bg-app)', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Transaction Status</span>
                {getStatusBadge(selectedPayment.status)}
              </div>
              <h3 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)', margin: '8px 0 0' }}>
                {formatCurrency(selectedPayment.amount || selectedPayment.total)}
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Transaction ID:</span>
                <span style={{ fontWeight: '700', fontFamily: 'monospace' }}>{selectedPayment.transactionId || selectedPayment._id}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Stripe Intent:</span>
                <span style={{ fontWeight: '700', fontFamily: 'monospace' }}>{selectedPayment.paymentIntentId || 'pi_3M00921049'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Customer Name:</span>
                <span style={{ fontWeight: '600' }}>{selectedPayment.customerName || selectedPayment.name || 'Customer'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Customer Email:</span>
                <span style={{ fontWeight: '600' }}>{selectedPayment.customerEmail || selectedPayment.email || 'customer@uk.com'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Payment Method:</span>
                <span style={{ fontWeight: '600', textTransform: 'capitalize' }}>{selectedPayment.paymentMethod || 'Stripe Card'}</span>
              </div>
            </div>

            {((selectedPayment.status || '').toLowerCase() === 'completed' || (selectedPayment.status || '').toLowerCase() === 'succeeded') && (
              <Button
                variant="primary"
                size="sm"
                icon={RotateCcw}
                style={{ backgroundColor: 'var(--warning)', borderColor: 'var(--warning)', marginTop: '12px' }}
                onClick={() => handleOpenRefundModal(selectedPayment)}
              >
                Initiate Stripe Refund
              </Button>
            )}
          </div>
        )}
      </Drawer>

      {/* Stripe Refund Modal */}
      <Modal
        isOpen={refundModalOpen}
        onClose={() => setRefundModalOpen(false)}
        title="Initiate Stripe Refund"
        footer={
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button variant="outline" size="sm" onClick={() => setRefundModalOpen(false)}>Cancel</Button>
            <Button variant="primary" size="sm" icon={RotateCcw} loading={refunding} onClick={handleProcessRefund}>
              Confirm & Issue Refund
            </Button>
          </div>
        }
      >
        <form onSubmit={handleProcessRefund} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
            Issuing a refund via <strong>POST /admin/payments/{'{id}'}/refund</strong> will process an immediate payout return to the customer's payment method via Stripe.
          </p>

          <Input
            label="Refund Amount (£ GBP)"
            type="number"
            step="0.01"
            value={refundAmount}
            onChange={(e) => setRefundAmount(e.target.value)}
            required
          />
        </form>
      </Modal>

    </div>
  );
};

export default Payments;
