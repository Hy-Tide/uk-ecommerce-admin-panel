import React, { useState, useEffect } from 'react';
import {
  HelpCircle, Search, RefreshCw, Mail, Phone, Clock, Send, Reply,
  Trash2, Eye, CheckCircle, AlertCircle, MessageSquare, Tag, User, CornerDownRight
} from 'lucide-react';
import Button from '../components/Button';
import Card, { StatsCard } from '../components/Card';
import Modal from '../components/Modal';
import Input, { Select, Textarea } from '../components/Input';
import Badge from '../components/Badge';
import {
  fetchEnquiries,
  deleteEnquiry,
  replyEnquiry,
  updateEnquiryStatus
} from '../services/api';

export const Enquiries = ({ addToast }) => {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submittingReply, setSubmittingReply] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all | Pending | In Progress | Resolved | Closed

  // Modal states
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [replyText, setReplyText] = useState('');


  // Fetch all enquiries from GET /admin/enquiries
  const loadEnquiries = async () => {
    setLoading(true);
    try {
      const res = await fetchEnquiries({ search: searchTerm });
      if (res && res.success !== false) {
        const rawList = res.data?.enquiries || (Array.isArray(res.data) ? res.data : []);
        if (Array.isArray(rawList)) {
          setEnquiries(rawList);
        }
      }
    } catch (err) {
      console.error('Error loading enquiries:', err);
      if (addToast) addToast('Failed to load enquiries from server', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEnquiries();
  }, []);

  const openReplyModal = (enquiry) => {
    setSelectedEnquiry(enquiry);
    setReplyText(enquiry.replyMessage || '');
    setReplyModalOpen(true);
  };

  // Send Reply via PATCH /admin/enquiries/{id}/reply
  const handleSendReply = async (e) => {
    if (e) e.preventDefault();
    if (!selectedEnquiry) return;
    if (!replyText.trim()) {
      if (addToast) addToast('Reply message cannot be empty', 'danger');
      return;
    }

    setSubmittingReply(true);
    const targetId = selectedEnquiry._id || selectedEnquiry.id;

    try {
      const res = await replyEnquiry(targetId, replyText.trim());
      if (res && res.success !== false) {
        const updated = res.data?.enquiry || {
          ...selectedEnquiry,
          replyMessage: replyText.trim(),
          repliedAt: new Date().toISOString(),
          status: 'Resolved'
        };

        setEnquiries(enquiries.map(e => ((e._id || e.id) === targetId ? { ...e, ...updated } : e)));
        if (addToast) addToast(res.message || 'Reply sent to customer successfully', 'success');
        setReplyModalOpen(false);
      } else {
        const msg = res?.error || res?.message || 'Failed to send reply';
        if (addToast) addToast(msg, 'danger');
      }
    } catch (err) {
      console.error('Error sending reply:', err);
      if (addToast) addToast(err.message || 'Error sending reply', 'danger');
    } finally {
      setSubmittingReply(false);
    }
  };

  // Change Status via PATCH /admin/enquiries/{id}/status
  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await updateEnquiryStatus(id, newStatus);
      if (res && res.success !== false) {
        setEnquiries(enquiries.map(e => ((e._id || e.id) === id ? { ...e, status: newStatus } : e)));
        if (addToast) addToast(res.message || `Status updated to ${newStatus}`, 'info');
      } else {
        setEnquiries(enquiries.map(e => ((e._id || e.id) === id ? { ...e, status: newStatus } : e)));
      }
    } catch (err) {
      setEnquiries(enquiries.map(e => ((e._id || e.id) === id ? { ...e, status: newStatus } : e)));
    }
  };

  // Delete enquiry via DELETE /admin/enquiries/{id}
  const handleDeleteEnquiry = async (id) => {
    try {
      const res = await deleteEnquiry(id);
      if (res && res.success !== false) {
        setEnquiries(enquiries.filter(e => (e._id || e.id) !== id));
        if (addToast) addToast(res.message || 'Enquiry deleted successfully', 'warning');
      } else {
        setEnquiries(enquiries.filter(e => (e._id || e.id) !== id));
      }
    } catch (err) {
      setEnquiries(enquiries.filter(e => (e._id || e.id) !== id));
    }
  };

  // Filtered list
  const filteredEnquiries = enquiries.filter(item => {
    const searchLower = searchTerm.toLowerCase().trim();
    const matchesSearch = !searchLower ||
      (item.fullName || item.name || '').toLowerCase().includes(searchLower) ||
      (item.email || '').toLowerCase().includes(searchLower) ||
      (item.subject || '').toLowerCase().includes(searchLower) ||
      (item.message || '').toLowerCase().includes(searchLower);

    if (!matchesSearch) return false;

    if (filterStatus !== 'all') {
      return (item.status || 'Pending').toLowerCase() === filterStatus.toLowerCase();
    }
    return true;
  });

  const pendingCount = enquiries.filter(e => (e.status || 'Pending').toLowerCase() === 'pending').length;
  const inProgressCount = enquiries.filter(e => (e.status || '').toLowerCase() === 'in progress').length;
  const resolvedCount = enquiries.filter(e => ['resolved', 'closed'].includes((e.status || '').toLowerCase())).length;

  const getBadgeVariant = (st) => {
    const s = (st || 'Pending').toLowerCase();
    if (s === 'resolved' || s === 'closed') return 'success';
    if (s === 'in progress') return 'info';
    return 'warning';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '800', letterSpacing: '-0.03em', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <HelpCircle size={24} style={{ color: 'var(--primary)' }} /> Customer Enquiries & Support
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px', margin: 0 }}>
            Manage customer contact forms, support inquiries, and email response tickets.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Button variant="outline" size="sm" icon={RefreshCw} onClick={loadEnquiries}>
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
        <StatsCard title="Total Enquiries" value={enquiries.length} icon={HelpCircle} iconColor="#6366f1" iconBg="#ede9fe" />
        <StatsCard title="Pending Review" value={pendingCount} icon={AlertCircle} iconColor="#f59e0b" iconBg="#fef3c7" />
        <StatsCard title="In Progress" value={inProgressCount} icon={Clock} iconColor="#0ea5e9" iconBg="#e0f2fe" />
        <StatsCard title="Resolved / Closed" value={resolvedCount} icon={CheckCircle} iconColor="#10b981" iconBg="#d1fae5" />
      </div>

      {/* Search & Status Filters */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {[
            { id: 'all', label: 'All Enquiries' },
            { id: 'pending', label: `Pending (${pendingCount})` },
            { id: 'in progress', label: `In Progress (${inProgressCount})` },
            { id: 'resolved', label: `Resolved (${resolvedCount})` }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              style={{
                padding: '6px 14px',
                fontSize: '12px',
                fontWeight: '700',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: filterStatus === tab.id ? 'var(--primary)' : 'var(--bg-card)',
                color: filterStatus === tab.id ? '#fff' : 'var(--text-secondary)',
                boxShadow: filterStatus === tab.id ? '0 2px 8px rgba(79,70,229,0.3)' : '1px solid var(--border-color)'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative', width: '260px' }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by customer, email..."
            style={{
              width: '100%',
              padding: '6px 12px 6px 30px',
              fontSize: '13px',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-card)',
              color: 'var(--text-primary)'
            }}
          />
        </div>
      </div>

      {/* Main Listing View */}
      <Card title={`Customer Enquiries (${filteredEnquiries.length})`}>
        <div style={{ marginTop: '12px' }}>
          {loading ? (
            <div style={{ padding: '36px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading enquiries...</div>
          ) : filteredEnquiries.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              No enquiries match the current filter or search query.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
              {filteredEnquiries.map(enq => {
                const enqId = enq._id || enq.id;
                const displayName = enq.fullName || enq.name || 'Anonymous User';
                const displayPhone = enq.phoneNumber || enq.phone;
                return (
                  <div key={enqId} style={{ border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px', backgroundColor: 'var(--bg-card)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <span style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)', display: 'block' }}>{displayName}</span>
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{enq.email || 'No email provided'}</span>
                        {displayPhone && <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block' }}>{displayPhone}</span>}
                      </div>
                      <Badge variant={getBadgeVariant(enq.status)}>{enq.status || 'Pending'}</Badge>
                    </div>

                    <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '8px' }}>
                      <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--primary)', display: 'block', marginBottom: '4px' }}>
                        {enq.subject || 'General Inquiry'}
                      </span>
                      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.5' }}>
                        {enq.message}
                      </p>
                    </div>

                    {enq.replyMessage && (
                      <div style={{ backgroundColor: 'var(--bg-app)', padding: '10px', borderRadius: '8px', borderLeft: '3px solid var(--primary)', fontSize: '12px', marginTop: '8px' }}>
                        <span style={{ fontWeight: '700', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                          <CornerDownRight size={14} /> Store Reply:
                        </span>
                        <p style={{ margin: 0, color: 'var(--text-primary)' }}>{enq.replyMessage}</p>
                      </div>
                    )}

                    <div style={{ marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {enq.createdAt ? new Date(enq.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
                      </span>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <Button variant="primary" size="sm" icon={Reply} onClick={() => openReplyModal(enq)}>
                          {enq.replyMessage ? 'Edit Reply' : 'Reply'}
                        </Button>
                        <Button variant="ghost" size="sm" style={{ padding: '6px', color: 'var(--danger)' }} onClick={() => handleDeleteEnquiry(enqId)}>
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Card>

      {/* Reply Modal */}
      <Modal
        isOpen={replyModalOpen}
        onClose={() => { setReplyModalOpen(false); setSelectedEnquiry(null); }}
        title={`Reply to Enquiry — ${selectedEnquiry?.fullName || selectedEnquiry?.name || 'Customer'}`}
        footer={
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button variant="outline" size="sm" onClick={() => { setReplyModalOpen(false); setSelectedEnquiry(null); }}>Cancel</Button>
            <Button variant="primary" size="sm" icon={Send} loading={submittingReply} onClick={handleSendReply}>
              Send Reply
            </Button>
          </div>
        }
      >
        {selectedEnquiry && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Customer info card */}
            <div style={{ backgroundColor: 'var(--bg-app)', padding: '14px', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '8px', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>{selectedEnquiry.fullName || selectedEnquiry.name}</span>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{selectedEnquiry.createdAt ? new Date(selectedEnquiry.createdAt).toLocaleString() : ''}</span>
              </div>
              <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                <span><strong>Email:</strong> {selectedEnquiry.email}</span>
                {selectedEnquiry.phone && <span><strong>Phone:</strong> {selectedEnquiry.phone}</span>}
              </div>
              <div style={{ marginTop: '4px', borderTop: '1px solid var(--border-color)', paddingTop: '8px' }}>
                <strong style={{ fontSize: '12px', color: 'var(--primary)', display: 'block', marginBottom: '2px' }}>
                  Subject: {selectedEnquiry.subject || 'General Enquiry'}
                </strong>
                <p style={{ fontSize: '13px', color: 'var(--text-primary)', margin: 0, whiteSpace: 'pre-wrap' }}>
                  {selectedEnquiry.message}
                </p>
              </div>
            </div>

            {/* Reply Input Form */}
            <form onSubmit={handleSendReply} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Textarea
                label="Your Response / Email Reply"
                rows={5}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Dear customer, thank you for reaching out to Grandma's Basket..."
                required
              />
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Sending a reply will update the enquiry status to "Resolved" and dispatch an email response.
              </span>
            </form>
          </div>
        )}
      </Modal>

    </div>
  );
};

export default Enquiries;
