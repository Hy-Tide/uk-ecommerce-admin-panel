import React, { useState } from 'react';
import { History, ShieldAlert, Monitor, Key, Filter } from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';
import Input, { Switch } from '../components/Input';
import Table from '../components/Table';
import Badge from '../components/Badge';

export const Security = ({
  auditLogs = [],
  setAuditLogs,
  addToast
}) => {
  const [passwordMinLength, setPasswordMinLength] = useState(8);
  const [requireSpecialChar, setRequireSpecialChar] = useState(true);
  const [enable2FA, setEnable2FA] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Active Sessions
  const [sessions, setSessions] = useState([
    { id: 's-1', device: 'macOS Chrome 114', location: 'Portland, OR (USA)', ip: '192.168.1.104', time: 'Active Now', current: true },
    { id: 's-2', device: 'iOS Mobile Web App', location: 'Portland, OR (USA)', ip: '107.12.89.32', time: '3 hours ago', current: false },
    { id: 's-3', device: 'Windows Desktop Edge', location: 'Denver, CO (USA)', ip: '74.120.91.4', time: 'Yesterday', current: false }
  ]);

  const handleRevokeSession = (id) => {
    setSessions(sessions.filter(s => s.id !== id));
    addToast('Device session revoked successfully', 'warning');
  };

  const handleSaveSecurityPolicies = (e) => {
    e.preventDefault();
    addToast('Security credential parameters updated', 'success');
  };

  // Filter logs
  const filteredLogs = auditLogs.filter(log =>
    log.detail.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.module.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const logColumns = [
    {
      key: 'timestamp',
      label: 'Timestamp',
      render: (row) => new Date(row.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    },
    { key: 'user', label: 'Operator' },
    { key: 'action', label: 'Action Type' },
    { key: 'module', label: 'Section' },
    {
      key: 'detail',
      label: 'Activity Details',
      render: (row) => <span style={{ whiteSpace: 'normal', display: 'block', maxWidth: '340px' }}>{row.detail}</span>
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '700', letterSpacing: '-0.02em', margin: 0 }}>Security Operations & Audits</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Configure device session policies, manage password rules, and inspect system audit trails.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', alignItems: 'flex-start' }}>
        
        {/* Left column policies */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <Card title="Enforced Password Policies" actions={<Button variant="primary" size="sm" icon={Key} onClick={handleSaveSecurityPolicies}>Save Policies</Button>}>
            <form style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '12px' }}>
              <Input label="Minimum Character Length" type="number" value={passwordMinLength} onChange={(e) => setPasswordMinLength(e.target.value)} />
              <Switch label="Require special characters" checked={requireSpecialChar} onChange={(e) => setRequireSpecialChar(e.target.checked)} />
              <Switch label="Enforce 2FA verification for admin login" checked={enable2FA} onChange={(e) => setEnable2FA(e.target.checked)} />
            </form>
          </Card>

          {/* Active device trackers */}
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
                    <span style={{ fontSize: '13px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {s.device} {s.current && <Badge variant="success" style={{ fontSize: '8px', padding: '1px 4px' }}>Active</Badge>}
                    </span>
                    <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Location: {s.location} | IP: {s.ip}</p>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{s.time}</span>
                  </div>
                  {!s.current && (
                    <Button variant="ghost" size="sm" onClick={() => handleRevokeSession(s.id)} style={{ color: 'var(--danger)', fontSize: '11px', padding: '4px 8px' }}>
                      Revoke
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </Card>

        </div>

        {/* Audit Logs table */}
        <Card title="System Activity Audit Log Trails" icon={History}>
          
          {/* Audit log Search bar */}
          <div style={{ position: 'relative', margin: '8px 0 16px' }}>
            <span style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }}><Filter size={14} /></span>
            <input
              type="text"
              placeholder="Filter audits by operator, module..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '6px 12px 6px 30px',
                fontSize: '12px',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-app)',
                color: 'var(--text-primary)',
                outline: 'none'
              }}
            />
          </div>

          <Table
            columns={logColumns}
            data={filteredLogs}
            initialRowsPerPage={5}
          />
        </Card>

      </div>

    </div>
  );
};
export default Security;
