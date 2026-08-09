import React, { useState, useEffect, useMemo } from 'react';
import {
  Bell, Send, Megaphone, Users, User, Clock, CheckCircle,
  AlertCircle, RefreshCw, Search, Info, XCircle, MailCheck
} from 'lucide-react';
import Button from '../components/Button';
import Card, { StatsCard } from '../components/Card';
import Modal from '../components/Modal';
import Input, { Select, Textarea } from '../components/Input';
import Badge from '../components/Badge';
import {
  sendUserNotification,
  broadcastNotification,
  fetchNotificationHistory,
  fetchCustomers
} from '../services/api';

export const Notifications = ({ customers: propCustomers = [], addToast }) => {
  // Raw list from API — individual per-user records
  const [history, setHistory] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 20, totalPages: 1 });
  const [customerList, setCustomerList] = useState(propCustomers);
  const [loading, setLoading] = useState(true);
  const [submittingBroadcast, setSubmittingBroadcast] = useState(false);
  const [submittingDirect, setSubmittingDirect] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [broadcastModalOpen, setBroadcastModalOpen] = useState(false);
  const [directModalOpen, setDirectModalOpen] = useState(false);
  const [detailModal, setDetailModal] = useState(null);

  // Broadcast Form
  const [bTitle, setBTitle] = useState('');
  const [bMessage, setBMessage] = useState('');
  const [bType, setBType] = useState('General');

  // Direct Form
  const [dTitle, setDTitle] = useState('');
  const [dMessage, setDMessage] = useState('');
  const [dType, setDType] = useState('Promotional');
  const [dUserId, setDUserId] = useState('');
  const [customUserIdInput, setCustomUserIdInput] = useState('');

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const getRecipientEmail = (userId) => {
    if (!userId) return null;
    if (typeof userId === 'object' && userId !== null) {
      return userId.email || userId.name || userId._id || 'Direct User';
    }
    return String(userId);
  };

  const getSenderText = (createdBy) => {
    if (!createdBy) return 'Admin';
    if (typeof createdBy === 'object' && createdBy !== null) {
      return createdBy.name || createdBy.email || 'Admin';
    }
    return String(createdBy);
  };

  const getTypeBadgeVariant = (t) => {
    const typeLower = (t || '').toLowerCase();
    if (typeLower === 'promotional') return 'success';
    if (typeLower === 'alert' || typeLower === 'system') return 'danger';
    if (typeLower === 'order') return 'info';
    return 'secondary';
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleString([], {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  // ── Group records: same broadcast title+message+minute = 1 event ─────────────
  const groupedNotifications = useMemo(() => {
    const map = new Map();
    history.forEach(item => {
      const ts = item.createdAt ? new Date(item.createdAt).toISOString().slice(0, 16) : 'no-ts';
      const key = `${item.title || ''}__${ts}`;
      if (!map.has(key)) {
        map.set(key, {
          key,
          title: item.title,
          message: item.message,
          type: item.type,
          isBroadcast: item.isBroadcast,
          createdAt: item.createdAt,
          createdBy: item.createdBy,
          deliveryStats: { ...(item.deliveryStats || { total: 0, sent: 0, failed: 0 }) },
          recipients: [],
        });
      }
      const grp = map.get(key);
      if (item.deliveryStats) {
        grp.deliveryStats.total = Math.max(grp.deliveryStats.total, item.deliveryStats.total || 0);
        grp.deliveryStats.sent = Math.max(grp.deliveryStats.sent, item.deliveryStats.sent || 0);
        grp.deliveryStats.failed = Math.max(grp.deliveryStats.failed, item.deliveryStats.failed || 0);
      }
      if (item.userId) {
        grp.recipients.push({ userId: item.userId, isRead: item.isRead, _id: item._id });
      }
    });
    return Array.from(map.values());
  }, [history]);

  const filteredGroups = useMemo(() => {
    const s = searchTerm.toLowerCase().trim();
    return groupedNotifications.filter(grp => {
      const matchSearch = !s ||
        (grp.title || '').toLowerCase().includes(s) ||
        (grp.message || '').toLowerCase().includes(s) ||
        grp.recipients.some(r => (getRecipientEmail(r.userId) || '').toLowerCase().includes(s));
      if (!matchSearch) return false;
      if (filterType !== 'all') return (grp.type || '').toLowerCase() === filterType.toLowerCase();
      return true;
    });
  }, [groupedNotifications, filterType, searchTerm]);

  // Stats
  const totalRecipientsReached = history.length;
  const readCount = history.filter(h => h.isRead).length;
  const broadcastCount = groupedNotifications.filter(g => g.isBroadcast || g.recipients.length > 1 || g.recipients.length === 0).length;
  const directCount = groupedNotifications.filter(g => !g.isBroadcast && g.recipients.length === 1).length;

  // ── Load ────────────────────────────────────────────────────────────────────
  const loadHistory = async () => {
    setLoading(true);
    try {
      const res = await fetchNotificationHistory({ limit: 100 });
      if (res && res.success !== false) {
        const list = res.data?.notifications || (Array.isArray(res.data) ? res.data : []);
        if (Array.isArray(list)) setHistory(list);
        if (res.data?.meta) setMeta(res.data.meta);
      }
      if (!Array.isArray(propCustomers) || propCustomers.length === 0) {
        const cRes = await fetchCustomers({ limit: 100 });
        if (cRes && cRes.success !== false) {
          const rawCust = cRes.data?.customers || (Array.isArray(cRes.data) ? cRes.data : []);
          if (Array.isArray(rawCust)) setCustomerList(rawCust);
        }
      }
    } catch (err) {
      console.error('Error fetching notification data:', err);
      if (addToast) addToast('Failed to load notification history', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadHistory(); }, []);
  useEffect(() => {
    if (Array.isArray(propCustomers) && propCustomers.length > 0) setCustomerList(propCustomers);
  }, [propCustomers]);

  // ── Send Broadcast ───────────────────────────────────────────────────────────
  const handleSendBroadcast = async (e) => {
    if (e) e.preventDefault();
    if (!bTitle.trim()) { if (addToast) addToast('Notification title is required', 'danger'); return; }
    if (!bMessage.trim()) { if (addToast) addToast('Notification message is required', 'danger'); return; }
    setSubmittingBroadcast(true);
    try {
      const res = await broadcastNotification({ title: bTitle.trim(), message: bMessage.trim(), type: bType });
      if (res && res.success !== false) {
        if (addToast) addToast(res.message || 'Broadcast sent successfully!', 'success');
        setBroadcastModalOpen(false);
        setBTitle(''); setBMessage(''); setBType('General');
        loadHistory();
      } else {
        if (addToast) addToast(res?.error || res?.message || 'Failed to send broadcast', 'danger');
      }
    } catch (err) {
      if (addToast) addToast(err.message || 'Error sending broadcast notification', 'danger');
    } finally {
      setSubmittingBroadcast(false);
    }
  };

  // ── Send Direct ──────────────────────────────────────────────────────────────
  const handleSendDirect = async (e) => {
    if (e) e.preventDefault();
    const finalUserId = customUserIdInput.trim() || dUserId.trim();
    if (!dTitle.trim()) { if (addToast) addToast('Notification title is required', 'danger'); return; }
    if (!dMessage.trim()) { if (addToast) addToast('Notification message is required', 'danger'); return; }
    if (!finalUserId) { if (addToast) addToast('Please select a customer or enter a User ID', 'danger'); return; }
    setSubmittingDirect(true);
    try {
      const res = await sendUserNotification({ title: dTitle.trim(), message: dMessage.trim(), userId: finalUserId, type: dType });
      if (res && res.success !== false) {
        if (addToast) addToast(res.message || 'Direct notification sent successfully!', 'success');
        setDirectModalOpen(false);
        setDTitle(''); setDMessage(''); setDUserId(''); setCustomUserIdInput(''); setDType('Promotional');
        loadHistory();
      } else {
        if (addToast) addToast(res?.error || res?.message || 'Failed to send notification', 'danger');
      }
    } catch (err) {
      if (addToast) addToast(err.message || 'Error sending direct notification', 'danger');
    } finally {
      setSubmittingDirect(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '800', letterSpacing: '-0.03em', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bell size={24} style={{ color: 'var(--primary)' }} /> Push Notifications Center
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px', margin: 0 }}>
            Broadcast announcements to all users or send targeted direct notifications.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <Button variant="outline" size="sm" icon={User} onClick={() => setDirectModalOpen(true)}>
            Send Direct
          </Button>
          <Button variant="primary" size="sm" icon={Megaphone} onClick={() => setBroadcastModalOpen(true)}>
            Broadcast to All Users
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
        <StatsCard title="Unique Send Events" value={groupedNotifications.length} icon={Bell} iconColor="#6366f1" iconBg="#ede9fe" />
        <StatsCard title="Total Recipients Reached" value={totalRecipientsReached} icon={Users} iconColor="#10b981" iconBg="#d1fae5" />
        <StatsCard title="Broadcast Events" value={broadcastCount} icon={Megaphone} iconColor="#f59e0b" iconBg="#fef3c7" />
        <StatsCard title="Direct Notifications" value={directCount} icon={User} iconColor="#0ea5e9" iconBg="#e0f2fe" />
        <StatsCard title="Read by Recipients" value={readCount} icon={MailCheck} iconColor="#8b5cf6" iconBg="#ede9fe" />
      </div>

      {/* Filter & Search */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: 'All Types' },
            { id: 'general', label: 'General' },
            { id: 'promotional', label: 'Promotional' },
            { id: 'order', label: 'Order' },
            { id: 'alert', label: 'Alert / System' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              style={{
                padding: '6px 14px', fontSize: '12px', fontWeight: '700',
                borderRadius: '8px', border: 'none', cursor: 'pointer',
                backgroundColor: filterType === tab.id ? 'var(--primary)' : 'var(--bg-card)',
                color: filterType === tab.id ? '#fff' : 'var(--text-secondary)',
                boxShadow: filterType === tab.id ? '0 2px 8px rgba(79,70,229,0.3)' : 'none'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: '240px' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search title, email..."
              style={{
                width: '100%', padding: '6px 12px 6px 30px', fontSize: '13px',
                borderRadius: '8px', border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)'
              }}
            />
          </div>
          <Button variant="outline" size="sm" icon={RefreshCw} onClick={loadHistory}>Refresh</Button>
        </div>
      </div>

      {/* History Table */}
      <Card title={`Notification History (${filteredGroups.length} send event${filteredGroups.length !== 1 ? 's' : ''} · ${meta.total} total records)`}>
        <div style={{ marginTop: '12px' }}>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              Loading notification history...
            </div>
          ) : filteredGroups.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              No notification records found.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {filteredGroups.map((grp) => {
                const isBcast = grp.isBroadcast || grp.recipients.length > 1 || grp.recipients.length === 0;
                const recipientCount = grp.recipients.length;
                const grpReadCount = grp.recipients.filter(r => r.isRead).length;
                const stats = grp.deliveryStats;

                return (
                  <div
                    key={grp.key}
                    style={{
                      border: '1px solid var(--border-color)', borderRadius: '12px',
                      padding: '14px 16px', backgroundColor: 'var(--bg-card)',
                      display: 'flex', flexDirection: 'column', gap: '10px',
                      transition: 'box-shadow 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}
                    onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
                  >
                    {/* Top: title + badges + date */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                          <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>
                            {grp.title}
                          </span>
                          <Badge variant={getTypeBadgeVariant(grp.type)}>{grp.type || 'General'}</Badge>
                          {isBcast ? (
                            <span style={{
                              display: 'inline-flex', alignItems: 'center', gap: '4px',
                              fontSize: '10px', fontWeight: '700', padding: '2px 8px',
                              borderRadius: '20px', backgroundColor: '#d1fae5', color: '#059669'
                            }}>
                              <Megaphone size={10} /> Broadcast
                            </span>
                          ) : (
                            <span style={{
                              display: 'inline-flex', alignItems: 'center', gap: '4px',
                              fontSize: '10px', fontWeight: '700', padding: '2px 8px',
                              borderRadius: '20px', backgroundColor: '#e0f2fe', color: '#0284c7'
                            }}>
                              <User size={10} /> Direct
                            </span>
                          )}
                        </div>
                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.5' }}>
                          {grp.message}
                        </p>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
                          <Clock size={11} /> {formatDate(grp.createdAt)}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                          By <strong>{getSenderText(grp.createdBy)}</strong>
                        </div>
                      </div>
                    </div>

                    {/* Bottom: delivery stats + recipients */}
                    <div style={{
                      display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap',
                      paddingTop: '10px', borderTop: '1px solid var(--border-color)', fontSize: '11px'
                    }}>
                      {/* Counters */}
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)' }}>
                          <Users size={12} />
                          <strong style={{ color: 'var(--text-primary)' }}>{recipientCount}</strong>
                          &nbsp;recipient{recipientCount !== 1 ? 's' : ''}
                        </span>
                        {(stats.sent > 0 || stats.total > 0) && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#059669' }}>
                            <CheckCircle size={12} /> {stats.sent} sent
                          </span>
                        )}
                        {stats.failed > 0 && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#ef4444' }}>
                            <XCircle size={12} /> {stats.failed} failed
                          </span>
                        )}
                        {recipientCount > 0 && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#8b5cf6' }}>
                            <MailCheck size={12} /> {grpReadCount}/{recipientCount} read
                          </span>
                        )}
                      </div>

                      {/* Recipient email pills */}
                      <div style={{ marginLeft: 'auto', display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'flex-end', alignItems: 'center' }}>
                        {!isBcast && grp.recipients.length > 0 ? (
                          grp.recipients.slice(0, 2).map((r, ri) => (
                            <span key={ri} style={{
                              fontSize: '10px', padding: '2px 8px', borderRadius: '10px',
                              backgroundColor: r.isRead ? 'var(--success-light)' : 'var(--secondary-light)',
                              color: r.isRead ? 'var(--success)' : 'var(--text-secondary)',
                              display: 'flex', alignItems: 'center', gap: '3px'
                            }}>
                              {r.isRead ? <CheckCircle size={9} /> : <Clock size={9} />}
                              {getRecipientEmail(r.userId)}
                            </span>
                          ))
                        ) : isBcast ? (
                          <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '10px', backgroundColor: '#d1fae5', color: '#059669' }}>
                            All active users
                          </span>
                        ) : null}
                        {!isBcast && grp.recipients.length > 2 && (
                          <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                            +{grp.recipients.length - 2} more
                          </span>
                        )}

                        {/* View recipients button */}
                        {grp.recipients.length > 0 && (
                          <button
                            onClick={() => setDetailModal(grp)}
                            style={{
                              fontSize: '11px', fontWeight: '600', color: 'var(--primary)',
                              background: 'none', border: 'none', cursor: 'pointer',
                              padding: '2px 6px', borderRadius: '6px', textDecoration: 'underline'
                            }}
                          >
                            View all recipients
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Card>

      {/* Recipient Detail Modal */}
      {detailModal && (
        <Modal
          isOpen={Boolean(detailModal)}
          onClose={() => setDetailModal(null)}
          title={`Recipients — "${detailModal.title}"`}
          footer={<Button variant="outline" size="sm" onClick={() => setDetailModal(null)}>Close</Button>}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '360px', overflowY: 'auto' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
              {detailModal.recipients.length} recipient{detailModal.recipients.length !== 1 ? 's' : ''} &bull;{' '}
              {detailModal.recipients.filter(r => r.isRead).length} read
            </div>
            {detailModal.recipients.map((r, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '8px 12px', borderRadius: '8px', backgroundColor: 'var(--bg-app)',
                border: '1px solid var(--border-color)', fontSize: '12px'
              }}>
                <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>
                  {getRecipientEmail(r.userId)}
                </span>
                <span style={{
                  display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '700',
                  color: r.isRead ? '#059669' : 'var(--text-muted)'
                }}>
                  {r.isRead ? <CheckCircle size={12} /> : <Clock size={12} />}
                  {r.isRead ? 'Read' : 'Unread'}
                </span>
              </div>
            ))}
          </div>
        </Modal>
      )}

      {/* Broadcast Modal */}
      <Modal
        isOpen={broadcastModalOpen}
        onClose={() => setBroadcastModalOpen(false)}
        title="Broadcast Notification to All Users"
        footer={
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button variant="outline" size="sm" onClick={() => setBroadcastModalOpen(false)}>Cancel</Button>
            <Button variant="primary" size="sm" icon={Megaphone} loading={submittingBroadcast} onClick={handleSendBroadcast}>
              Send Broadcast
            </Button>
          </div>
        }
      >
        <form style={{ display: 'flex', flexDirection: 'column', gap: '14px' }} onSubmit={handleSendBroadcast}>
          <Input
            label="Notification Title"
            value={bTitle}
            onChange={e => setBTitle(e.target.value)}
            placeholder="e.g. New Arrivals Are Here!"
            required
          />
          <Select
            label="Notification Category"
            value={bType}
            onChange={e => setBType(e.target.value)}
            options={['General', 'Promotional', 'System', 'Offer']}
          />
          <Textarea
            label="Notification Message"
            rows={4}
            value={bMessage}
            onChange={e => setBMessage(e.target.value)}
            placeholder="Explore our latest collection of fresh groceries, organic products, and daily essentials. Shop now!"
            required
          />
          <div style={{ backgroundColor: 'var(--bg-app)', padding: '10px', borderRadius: '8px', fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Info size={14} style={{ color: 'var(--primary)', flexShrink: 0 }} />
            <span>This push notification will be broadcast to all active mobile app users. One record will be created per recipient in the history log.</span>
          </div>
        </form>
      </Modal>

      {/* Direct Notification Modal */}
      <Modal
        isOpen={directModalOpen}
        onClose={() => setDirectModalOpen(false)}
        title="Send Direct Notification to Specific Customer"
        footer={
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button variant="outline" size="sm" onClick={() => setDirectModalOpen(false)}>Cancel</Button>
            <Button variant="primary" size="sm" icon={Send} loading={submittingDirect} onClick={handleSendDirect}>
              Send Direct Message
            </Button>
          </div>
        }
      >
        <form style={{ display: 'flex', flexDirection: 'column', gap: '14px' }} onSubmit={handleSendDirect}>
          {Array.isArray(customerList) && customerList.length > 0 ? (
            <Select
              label="Select Target Customer"
              value={dUserId}
              onChange={e => { setDUserId(e.target.value); setCustomUserIdInput(''); }}
              options={[
                { label: '-- Select Customer --', value: '' },
                ...customerList.map(c => ({
                  label: `${c.name || 'Customer'} (${c.email || c._id})`,
                  value: c._id || c.id
                }))
              ]}
            />
          ) : null}
          <Input
            label="Or Enter Custom Target User ID (_id)"
            value={customUserIdInput || dUserId}
            onChange={e => { setCustomUserIdInput(e.target.value); setDUserId(e.target.value); }}
            placeholder="e.g. 6a5cceb8a083634720f67ea8"
            required={!dUserId}
          />
          <Input
            label="Notification Title"
            value={dTitle}
            onChange={e => setDTitle(e.target.value)}
            placeholder="e.g. Weekend Mega Sale!"
            required
          />
          <Select
            label="Notification Category"
            value={dType}
            onChange={e => setDType(e.target.value)}
            options={['Promotional', 'Order', 'General', 'Alert']}
          />
          <Textarea
            label="Notification Message"
            rows={4}
            value={dMessage}
            onChange={e => setDMessage(e.target.value)}
            placeholder="Don't miss out! Enjoy up to 50% off on selected groceries, fresh vegetables, and fruits."
            required
          />
        </form>
      </Modal>

    </div>
  );
};

export default Notifications;
