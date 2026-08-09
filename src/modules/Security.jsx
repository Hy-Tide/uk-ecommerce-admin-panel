import React, { useState, useEffect } from 'react';
import {
  History, ShieldAlert, Monitor, Key, Filter, Search, Calendar, RefreshCw,
  CheckCircle, User, ShieldCheck, Activity, Globe, Info, Clock
} from 'lucide-react';
import Button from '../components/Button';
import Card, { StatsCard } from '../components/Card';
import Input, { Select, Switch } from '../components/Input';
import ListView from '../components/ListView';
import Badge from '../components/Badge';
import { fetchAuditLogs } from '../services/api';

export const Security = ({
  auditLogs: propAuditLogs = [],
  setAuditLogs: setPropAuditLogs,
  addToast
}) => {
  const [logs, setLogs] = useState(propAuditLogs);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [loadingLogs, setLoadingLogs] = useState(true);

  // Filters
  const [actionFilter, setActionFilter] = useState('');
  const [entityFilter, setEntityFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Password & Policy state
  const [passwordMinLength, setPasswordMinLength] = useState(8);
  const [requireSpecialChar, setRequireSpecialChar] = useState(true);
  const [enable2FA, setEnable2FA] = useState(true);

  // Active Sessions
  const [sessions, setSessions] = useState([
    { id: 's-1', device: 'macOS Chrome 114', location: 'London (UK)', ip: '192.168.1.104', time: 'Active Now', current: true },
    { id: 's-2', device: 'iOS Mobile Web App', location: 'Manchester (UK)', ip: '107.12.89.32', time: '3 hours ago', current: false },
    { id: 's-3', device: 'Windows Desktop Edge', location: 'Birmingham (UK)', ip: '74.120.91.4', time: 'Yesterday', current: false }
  ]);

  // Fetch real audit logs from GET /admin/audit-logs
  const loadAuditLogs = async () => {
    setLoadingLogs(true);
    const params = { page: 1, limit: 50 };
    if (actionFilter) params.action = actionFilter;
    if (entityFilter) params.entityType = entityFilter;
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    try {
      const res = await fetchAuditLogs(params);
      if (res && res.success !== false) {
        const logList = res.data?.logs || (Array.isArray(res.data) ? res.data : []);
        setLogs(Array.isArray(logList) ? logList : []);
        if (setPropAuditLogs && Array.isArray(logList) && logList.length > 0) {
          setPropAuditLogs(logList);
        }
        if (res.data?.pagination) {
          setPagination(res.data.pagination);
        }
      }
    } catch (err) {
      console.error('Error fetching audit logs:', err);
      if (addToast) addToast('Failed to load system audit logs', 'danger');
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    loadAuditLogs();
  }, [actionFilter, entityFilter, startDate, endDate]);

  const handleRevokeSession = (id) => {
    setSessions(sessions.filter(s => s.id !== id));
    if (addToast) addToast('Device session revoked successfully', 'warning');
  };

  const handleSaveSecurityPolicies = (e) => {
    if (e) e.preventDefault();
    if (addToast) addToast('Security credential parameters updated', 'success');
  };

  // Filter logs locally by search term
  const filteredLogs = logs.filter(log => {
    if (!searchQuery.trim()) return true;
    const term = searchQuery.toLowerCase();
    const adminName = typeof log.adminId === 'object' ? (log.adminId?.name || log.adminId?.email || '') : (log.user || '');
    const action = log.action || '';
    const entity = log.entityType || log.module || '';
    const details = log.details || log.detail || '';
    return (
      adminName.toLowerCase().includes(term) ||
      action.toLowerCase().includes(term) ||
      entity.toLowerCase().includes(term) ||
      details.toLowerCase().includes(term)
    );
  });

  const getActionBadgeVariant = (act) => {
    const a = (act || '').toUpperCase();
    if (a.includes('LOGIN') || a.includes('AUTH')) return 'info';
    if (a.includes('CREATE') || a.includes('ADD')) return 'success';
    if (a.includes('DELETE') || a.includes('REMOVE')) return 'danger';
    if (a.includes('UPDATE') || a.includes('EDIT')) return 'warning';
    return 'secondary';
  };

  const logColumns = [
    {
      key: 'createdAt',
      label: 'Timestamp',
      render: (row) => {
        const d = row.createdAt || row.timestamp;
        return (
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            {d ? new Date(d).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recent'}
          </span>
        );
      }
    },
    {
      key: 'adminId',
      label: 'Operator / Admin',
      render: (row) => {
        const name = typeof row.adminId === 'object' ? (row.adminId?.name || row.adminId?.email || 'Admin') : (row.user || 'Admin');
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={14} style={{ color: 'var(--primary)' }} />
            <span style={{ fontWeight: '700', fontSize: '12px', color: 'var(--text-primary)' }}>{name}</span>
          </div>
        );
      }
    },
    {
      key: 'action',
      label: 'Action Type',
      render: (row) => (
        <Badge variant={getActionBadgeVariant(row.action)}>{row.action || 'ACTIVITY'}</Badge>
      )
    },
    {
      key: 'entityType',
      label: 'Entity / Section',
      render: (row) => (
        <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--primary)' }}>
          {row.entityType || row.module || 'System'}
        </span>
      )
    },
    {
      key: 'details',
      label: 'Activity Details',
      render: (row) => (
        <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', maxWidth: '340px', lineHeight: '1.4' }}>
          {row.details || row.detail || 'Action logged in audit trail.'}
        </span>
      )
    },
    {
      key: 'ipAddress',
      label: 'IP Address',
      render: (row) => (
        <span style={{ fontSize: '11px', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
          {row.ipAddress || row.ip || '192.168.1.1'}
        </span>
      )
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '800', letterSpacing: '-0.03em', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <History size={24} style={{ color: 'var(--primary)' }} /> Security Operations & Audit Logs
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px', margin: 0 }}>
            Inspect system audit log trails, manage active admin sessions, and enforce security policies.
          </p>
        </div>

        <Button variant="outline" size="sm" icon={RefreshCw} onClick={loadAuditLogs}>
          Refresh Logs
        </Button>
      </div>

      {/* KPI Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
        <StatsCard title="Total Audit Events" value={pagination.total || logs.length} icon={History} iconColor="#6366f1" iconBg="#ede9fe" />
        <StatsCard title="Active Device Sessions" value={sessions.length} icon={Monitor} iconColor="#10b981" iconBg="#d1fae5" />
        <StatsCard title="Enforced Policy Rules" value="Active (2FA)" icon={ShieldCheck} iconColor="#0ea5e9" iconBg="#e0f2fe" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', alignItems: 'flex-start' }}>
        
        {/* Left Column: Security Policies & Sessions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <Card title="Enforced Password Policies" icon={Key} actions={<Button variant="primary" size="sm" icon={Key} onClick={handleSaveSecurityPolicies}>Save Policies</Button>}>
            <form style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '12px' }}>
              <Input
                label="Minimum Character Length"
                type="number"
                value={passwordMinLength}
                onChange={(e) => setPasswordMinLength(e.target.value)}
              />
              <Switch
                label="Require special characters"
                checked={requireSpecialChar}
                onChange={(e) => setRequireSpecialChar(e.target.checked)}
              />
              <Switch
                label="Enforce 2FA verification for admin login"
                checked={enable2FA}
                onChange={(e) => setEnable2FA(e.target.checked)}
              />
            </form>
          </Card>

          {/* Active Device Sessions */}
          <Card title="Active Device Sessions" icon={Monitor}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
              {sessions.map(s => (
                <div
                  key={s.id}
                  style={{
                    border: '1px solid var(--border-color)',
                    padding: '12px',
                    borderRadius: '8px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: 'var(--bg-card)'
                  }}
                >
                  <div>
                    <span style={{ fontSize: '13px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {s.device} {s.current && <Badge variant="success" style={{ fontSize: '9px', padding: '1px 6px' }}>Current Session</Badge>}
                    </span>
                    <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '2px 0' }}>Location: {s.location} | IP: {s.ip}</p>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{s.time}</span>
                  </div>
                  {!s.current && (
                    <Button variant="ghost" size="sm" onClick={() => handleRevokeSession(s.id)} style={{ color: 'var(--danger)', fontSize: '11px' }}>
                      Revoke
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </Card>

        </div>

        {/* Right Column: Audit Logs Table */}
        <Card title={`System Audit Log Trails (${filteredLogs.length})`} icon={History}>
          
          {/* Audit Log Filters */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px', marginBottom: '14px' }}>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', flex: 1, minWidth: '180px' }}>
                <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Search logs by operator, details..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '6px 12px 6px 30px',
                    fontSize: '12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-card)',
                    color: 'var(--text-primary)',
                    outline: 'none'
                  }}
                />
              </div>

              <Select
                label=""
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                options={[
                  { label: 'All Actions', value: '' },
                  { label: 'LOGIN', value: 'LOGIN' },
                  { label: 'CREATE', value: 'CREATE' },
                  { label: 'UPDATE', value: 'UPDATE' },
                  { label: 'DELETE', value: 'DELETE' }
                ]}
              />

              <Select
                label=""
                value={entityFilter}
                onChange={(e) => setEntityFilter(e.target.value)}
                options={[
                  { label: 'All Entities', value: '' },
                  { label: 'Product', value: 'Product' },
                  { label: 'Order', value: 'Order' },
                  { label: 'Customer', value: 'Customer' },
                  { label: 'User', value: 'User' },
                  { label: 'Settings', value: 'Settings' }
                ]}
              />
            </div>
          </div>

          <div style={{ marginTop: '8px' }}>
            {loadingLogs ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading audit log trails...</div>
            ) : filteredLogs.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>No audit log trails found.</div>
            ) : (
              <ListView
                columns={logColumns}
                data={filteredLogs}
                initialRowsPerPage={10}
              />
            )}
          </div>
        </Card>

      </div>

    </div>
  );
};

export default Security;
