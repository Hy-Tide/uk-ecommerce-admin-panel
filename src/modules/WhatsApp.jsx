import React, { useState } from 'react';
import { AlertCircle, CheckCircle, MessageSquare, Send, Settings, History } from 'lucide-react';
import Button from '../components/Button';
import Card, { StatsCard } from '../components/Card';
import Input, { Select, Textarea } from '../components/Input';
import Table from '../components/Table';
import Badge from '../components/Badge';

export const WhatsApp = ({
  addToast,
  auditLogs = [],
  setAuditLogs
}) => {
  const [businessNum, setBusinessNum] = useState('+1 (555) 932-1200');
  const [apiKey, setApiKey] = useState('wa_live_sec_8932018aa12ff');
  
  // Campaign builder state
  const [audience, setAudience] = useState('All Customers'); // All, Repeat, Inactive
  const [template, setTemplate] = useState('Welcome Message'); // Welcome, Order Packed, Sale Offer
  const [scheduleTime, setScheduleTime] = useState('');

  // Delivery log
  const [logs, setLogs] = useState([
    { id: 'l-1', time: '2026-07-01T16:15:00Z', customer: 'Sarah Jenkins', phone: '+1 (555) 234-5678', template: 'Out for Delivery', status: 'Delivered' },
    { id: 'l-2', time: '2026-07-01T14:32:00Z', customer: 'Sarah Jenkins', phone: '+1 (555) 234-5678', template: 'Order Confirmation', status: 'Delivered' },
    { id: 'l-3', time: '2026-06-30T10:10:00Z', customer: 'David Miller', phone: '+1 (555) 345-6789', template: 'Abandoned Cart', status: 'Failed' }
  ]);

  const handleLaunchCampaign = (e) => {
    e.preventDefault();
    addToast(`WhatsApp broadcast queued for ${audience} using template "${template}"`, 'success');
    
    // Simulate campaign addition
    const newLog = {
      id: `l-${Date.now()}`,
      time: new Date().toISOString(),
      customer: audience === 'All Customers' ? 'Broadcast' : 'Segment Group',
      phone: 'Multiple',
      template: template,
      status: 'Sent'
    };

    setLogs([newLog, ...logs]);

    setAuditLogs([
      {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        user: 'Director David',
        action: 'WhatsApp Campaign Launched',
        module: 'WhatsApp',
        detail: `Queued broadcast campaign to ${audience} using template: ${template}`
      },
      ...auditLogs
    ]);
  };

  const handleRetrySend = (id) => {
    setLogs(logs.map(log => {
      if (log.id === id) {
        addToast('Retrying message delivery...', 'info');
        setTimeout(() => {
          addToast('Message sent successfully', 'success');
        }, 500);
        return { ...log, status: 'Delivered' };
      }
      return log;
    }));
  };

  const logCols = [
    {
      key: 'time',
      label: 'Date Time',
      render: (row) => new Date(row.time).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    },
    { key: 'customer', label: 'Customer' },
    { key: 'phone', label: 'Phone' },
    { key: 'template', label: 'Template Code' },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <Badge variant={row.status === 'Delivered' || row.status === 'Sent' ? 'success' : 'danger'}>
          {row.status}
        </Badge>
      )
    },
    {
      key: 'actions',
      label: '',
      render: (row) => row.status === 'Failed' && (
        <Button variant="outline" size="sm" onClick={() => handleRetrySend(row.id)}>
          Retry
        </Button>
      )
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '700', letterSpacing: '-0.02em', margin: 0 }}>WhatsApp Business Manager</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Configure client templates, coordinate broadcast campaign logs, and review delivery metrics.</p>
        </div>
      </div>

      {/* Stats Widgets */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <StatsCard title="Total Broadcast Sent" value={logs.length} icon={MessageSquare} iconColor="var(--primary)" iconBg="var(--primary-light)" />
        <StatsCard title="Delivery Success Rate" value="96.8%" icon={CheckCircle} iconColor="var(--success)" iconBg="var(--success-light)" />
        <StatsCard title="Failed/Pending Alerts" value={logs.filter(l=>l.status==='Failed').length} icon={AlertCircle} iconColor="var(--danger)" iconBg="var(--danger-light)" />
      </div>

      {/* Layout Split */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', alignItems: 'flex-start' }}>
        
        {/* Settings & Campaign Builder */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <Card title="API Credentials Configuration" icon={Settings}>
            <form style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '8px' }}>
              <Input label="WhatsApp Business Number" value={businessNum} onChange={(e) => setBusinessNum(e.target.value)} />
              <Input label="Meta Cloud API Token Key" type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} />
            </form>
          </Card>

          <Card title="Launch Broadcast Campaign" icon={Send}>
            <form onSubmit={handleLaunchCampaign} style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '8px' }}>
              <Select
                label="Target Audience Group"
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                options={['All Customers', 'Repeat Customers', 'Inactive Users (30 Days)', 'Cart Abandoners']}
              />
              
              <Select
                label="Template Message Type"
                value={template}
                onChange={(e) => setTemplate(e.target.value)}
                options={['Welcome Message', 'Order Confirmation', 'Out for Delivery Alert', 'Delivered Success', 'Abandoned Cart Reminder', 'Festival Offers Broadcast']}
              />

              <Input label="Scheduled Time (Optional)" type="datetime-local" value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)} />

              <Button type="submit" variant="primary" style={{ width: '100%', marginTop: '8px' }}>
                Queue Campaign
              </Button>
            </form>
          </Card>

        </div>

        {/* Campaign History Log */}
        <Card title="Broadcast Dispatch Logs" icon={History}>
          <div style={{ marginTop: '12px' }}>
            <Table
              columns={logCols}
              data={logs}
              initialRowsPerPage={5}
            />
          </div>
        </Card>

      </div>

    </div>
  );
};
export default WhatsApp;
