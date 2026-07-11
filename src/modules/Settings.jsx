import React, { useState } from 'react';
import { Database, Save, ShieldAlert } from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';
import Input, { Select, Switch } from '../components/Input';

export const Settings = ({
  products = [],
  categories = [],
  brands = [],
  orders = [],
  customers = [],
  addToast,
  auditLogs = [],
  setAuditLogs
}) => {
  const [storeName, setStoreName] = useState('FreshCart Organic Enterprise');
  const [storeEmail, setStoreEmail] = useState('operations@freshcart.com');
  const [currency, setCurrency] = useState('USD ($)');
  const [timezone, setTimezone] = useState('GMT-5 (EST)');
  
  // Payment Gates
  const [sandboxMode, setSandboxMode] = useState(true);
  const [stripeKey, setStripeKey] = useState('pk_test_892301aa893ff');
  const [razorpayId, setRazorpayId] = useState('rzp_test_901aa8');

  const handleSaveStoreSettings = (e) => {
    e.preventDefault();
    addToast('General store settings successfully updated', 'success');

    setAuditLogs([
      {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        user: 'Director David',
        action: 'Store Settings Updated',
        module: 'Settings',
        detail: `Modified general parameters for store: ${storeName}`
      },
      ...auditLogs
    ]);
  };

  // Serialize and download all active state database records
  const handleDownloadBackup = () => {
    const backupPayload = {
      timestamp: new Date().toISOString(),
      store: storeName,
      databases: {
        products,
        categories,
        brands,
        orders,
        customers
      }
    };

    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(backupPayload, null, 2)
    )}`;
    
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `freshcart_db_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    document.body.removeChild(downloadAnchor);

    addToast('Database snapshot downloaded successfully', 'success');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '700', letterSpacing: '-0.02em', margin: 0 }}>System Settings</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Modify store operations preferences, Stripe checkout keys, and serialize records backups.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', alignItems: 'flex-start' }}>
        
        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <Card title="General Parameters" actions={<Button variant="primary" size="sm" icon={Save} onClick={handleSaveStoreSettings}>Save General</Button>}>
            <form style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '12px' }}>
              <Input label="Store Name String" value={storeName} onChange={(e) => setStoreName(e.target.value)} />
              <Input label="Contact Email" type="email" value={storeEmail} onChange={(e) => setStoreEmail(e.target.value)} />
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <Select label="Base Currency" value={currency} onChange={(e) => setCurrency(e.target.value)} options={['USD ($)', 'EUR (€)', 'INR (₹)', 'GBP (£)']} />
                <Select label="System Timezone" value={timezone} onChange={(e) => setTimezone(e.target.value)} options={['GMT-5 (EST)', 'GMT+0 (UTC)', 'GMT+5.5 (IST)', 'GMT+1 (CET)']} />
              </div>
            </form>
          </Card>

          <Card title="Database Snapshot & Recovery" icon={Database}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                Download a serialized JSON backup containing all active catalog items, orders timelines, categories, and customer records.
              </p>
              <Button variant="outline" size="sm" icon={Database} onClick={handleDownloadBackup} style={{ width: 'fit-content' }}>
                Download Backup (.json)
              </Button>
            </div>
          </Card>

        </div>

        {/* Right column */}
        <Card title="Stripe & Razorpay Integration" icon={ShieldAlert}>
          <form style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '12px' }}>
            <Switch label="Sandbox Checkout Sandbox Mode" checked={sandboxMode} onChange={(e) => setSandboxMode(e.target.checked)} />
            
            <Input label="Stripe Publishable Key" value={stripeKey} onChange={(e) => setStripeKey(e.target.value)} />
            <Input label="Razorpay Account ID Key" value={razorpayId} onChange={(e) => setRazorpayId(e.target.value)} />
          </form>
        </Card>

      </div>

    </div>
  );
};
export default Settings;
