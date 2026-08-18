import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon, Save, Database, ShieldAlert, Store,
  CreditCard, Globe, Share2, DollarSign, Image, Truck, Percent,
  RefreshCw, CheckCircle, Lock, Phone, Mail, MapPin
} from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';
import Input, { Select, Textarea } from '../components/Input';
import Uploader from '../components/Uploader';
import { fetchSettings, updateSettings } from '../services/api';
import { ShimmerRow } from '../components/ShimmerSkeleton';

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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Setting States matching API schema
  const [storeName, setStoreName] = useState('UK E-Commerce');
  const [address, setAddress] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [supportEmail, setSupportEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');

  // Social Media
  const [socialMedia, setSocialMedia] = useState({
    facebook: '',
    twitter: '',
    instagram: '',
    linkedin: ''
  });

  // Financials
  const [currency, setCurrency] = useState('GBP');
  const [taxPercentage, setTaxPercentage] = useState(20);
  const [deliveryCharge, setDeliveryCharge] = useState(5);
  const [minimumOrderAmount, setMinimumOrderAmount] = useState(10);
  const [freeDeliveryAmount, setFreeDeliveryAmount] = useState(50);

  // Payment Keys
  const [stripeKeys, setStripeKeys] = useState({
    publicKey: '',
    secretKey: ''
  });

  const [paypalKeys, setPaypalKeys] = useState({
    clientId: '',
    secret: ''
  });

  const [googlePayMerchantId, setGooglePayMerchantId] = useState('');

  // Branding
  const [logoUrl, setLogoUrl] = useState('');
  const [faviconUrl, setFaviconUrl] = useState('');

  // Load real settings from GET /admin/settings
  const loadSettings = async () => {
    setLoading(true);
    try {
      const res = await fetchSettings();
      if (res && res.success !== false) {
        const s = res.data?.settings || res.data || {};
        if (s.storeName !== undefined) setStoreName(s.storeName);
        if (s.address !== undefined) setAddress(s.address);
        if (s.contactEmail !== undefined) setContactEmail(s.contactEmail);
        if (s.supportEmail !== undefined) setSupportEmail(s.supportEmail);
        if (s.phone !== undefined) setPhone(s.phone);
        if (s.whatsappNumber !== undefined) setWhatsappNumber(s.whatsappNumber);

        if (s.socialMedia) {
          setSocialMedia({
            facebook: s.socialMedia.facebook || '',
            twitter: s.socialMedia.twitter || '',
            instagram: s.socialMedia.instagram || '',
            linkedin: s.socialMedia.linkedin || ''
          });
        }

        if (s.currency !== undefined) setCurrency(s.currency);
        if (s.taxPercentage !== undefined) setTaxPercentage(s.taxPercentage);
        if (s.deliveryCharge !== undefined) setDeliveryCharge(s.deliveryCharge);
        if (s.minimumOrderAmount !== undefined) setMinimumOrderAmount(s.minimumOrderAmount);
        if (s.freeDeliveryAmount !== undefined) setFreeDeliveryAmount(s.freeDeliveryAmount);

        if (s.stripeKeys) {
          setStripeKeys({
            publicKey: s.stripeKeys.publicKey || '',
            secretKey: s.stripeKeys.secretKey || ''
          });
        }

        if (s.paypalKeys) {
          setPaypalKeys({
            clientId: s.paypalKeys.clientId || '',
            secret: s.paypalKeys.secret || ''
          });
        }

        if (s.googlePayMerchantId !== undefined) setGooglePayMerchantId(s.googlePayMerchantId);
        if (s.logoUrl !== undefined) setLogoUrl(s.logoUrl);
        if (s.faviconUrl !== undefined) setFaviconUrl(s.faviconUrl);
      }
    } catch (err) {
      console.error('Error fetching store settings:', err);
      if (addToast) addToast('Failed to load store settings from server', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  // Save Settings via PUT /admin/settings
  const handleSaveSettings = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);

    const payload = {
      storeName,
      address,
      contactEmail,
      supportEmail,
      phone,
      whatsappNumber,
      socialMedia,
      currency,
      taxPercentage: Number(taxPercentage),
      deliveryCharge: Number(deliveryCharge),
      minimumOrderAmount: Number(minimumOrderAmount),
      freeDeliveryAmount: Number(freeDeliveryAmount),
      stripeKeys,
      paypalKeys,
      googlePayMerchantId,
      logoUrl,
      faviconUrl
    };

    try {
      const res = await updateSettings(payload);
      if (res && res.success !== false) {
        if (addToast) addToast(res.message || 'Store settings updated successfully!', 'success');
        
        if (setAuditLogs) {
          setAuditLogs([
            {
              id: `log-${Date.now()}`,
              timestamp: new Date().toISOString(),
              user: 'Admin',
              action: 'Store Settings Updated',
              module: 'Settings',
              detail: `Updated store configuration parameters for ${storeName}`
            },
            ...(auditLogs || [])
          ]);
        }
      } else {
        const msg = res?.error || res?.message || 'Failed to update store settings';
        if (addToast) addToast(msg, 'danger');
      }
    } catch (err) {
      console.error('Error updating store settings:', err);
      if (addToast) addToast(err.message || 'Error updating settings', 'danger');
    } finally {
      setSaving(false);
    }
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
    downloadAnchor.setAttribute('download', `store_db_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    document.body.removeChild(downloadAnchor);

    if (addToast) addToast('Database snapshot downloaded successfully', 'success');
  };

  if (loading) {
    return (
      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <ShimmerRow height="60px" count={2} />
        <ShimmerRow height="180px" count={3} />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '800', letterSpacing: '-0.03em', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <SettingsIcon size={24} style={{ color: 'var(--primary)' }} /> Global Store Settings
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px', margin: 0 }}>
            Configure store branding, payment gateway credentials, delivery rates, and tax rules.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <Button variant="outline" size="sm" icon={RefreshCw} onClick={loadSettings}>
            Reload
          </Button>
          <Button variant="primary" size="sm" icon={Save} loading={saving} onClick={handleSaveSettings}>
            Save All Changes
          </Button>
        </div>
      </div>

      {/* Main Settings Grid */}
      <form onSubmit={handleSaveSettings} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px', alignItems: 'flex-start' }}>
        
        {/* Column 1: Store Contact & General Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <Card title="Store General Profile" icon={Store}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '12px' }}>
              <Input
                label="Store Name"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="e.g. UK E-Commerce"
                required
              />

              <Textarea
                label="Physical Address"
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. 123 High Street, London, UK"
              />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <Input
                  label="Contact Email"
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="contact@store.co.uk"
                />
                <Input
                  label="Support Email"
                  type="email"
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                  placeholder="support@store.co.uk"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <Input
                  label="Contact Phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+44 20 1234 5678"
                />
                <Input
                  label="WhatsApp Helpline"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="+44 7123 456789"
                />
              </div>
            </div>
          </Card>

          {/* Social Media Profiles */}
          <Card title="Social Media Profiles" icon={Share2}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '12px' }}>
              <Input
                label="Facebook Page URL"
                value={socialMedia.facebook}
                onChange={(e) => setSocialMedia({ ...socialMedia, facebook: e.target.value })}
                placeholder="https://facebook.com/yourstore"
              />
              <Input
                label="Twitter / X Profile URL"
                value={socialMedia.twitter}
                onChange={(e) => setSocialMedia({ ...socialMedia, twitter: e.target.value })}
                placeholder="https://twitter.com/yourstore"
              />
              <Input
                label="Instagram Profile URL"
                value={socialMedia.instagram}
                onChange={(e) => setSocialMedia({ ...socialMedia, instagram: e.target.value })}
                placeholder="https://instagram.com/yourstore"
              />
              <Input
                label="LinkedIn Company URL"
                value={socialMedia.linkedin}
                onChange={(e) => setSocialMedia({ ...socialMedia, linkedin: e.target.value })}
                placeholder="https://linkedin.com/company/yourstore"
              />
            </div>
          </Card>
        </div>

        {/* Column 2: Financials & Logistics */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <Card title="Financials & Logistics Defaults" icon={DollarSign}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '12px' }}>
              <Select
                label="Store Base Currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                options={[
                  { label: 'GBP (£) - British Pound', value: 'GBP' },
                  { label: 'USD ($) - US Dollar', value: 'USD' },
                  { label: 'EUR (€) - Euro', value: 'EUR' },
                  { label: 'INR (₹) - Indian Rupee', value: 'INR' }
                ]}
              />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <Input
                  label="VAT / Tax Rate (%)"
                  type="number"
                  value={taxPercentage}
                  onChange={(e) => setTaxPercentage(e.target.value)}
                  placeholder="20"
                />
                <Input
                  label="Standard Shipping Fee"
                  type="number"
                  value={deliveryCharge}
                  onChange={(e) => setDeliveryCharge(e.target.value)}
                  placeholder="5"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <Input
                  label="Minimum Order Amount"
                  type="number"
                  value={minimumOrderAmount}
                  onChange={(e) => setMinimumOrderAmount(e.target.value)}
                  placeholder="10"
                />
                <Input
                  label="Free Shipping Threshold"
                  type="number"
                  value={freeDeliveryAmount}
                  onChange={(e) => setFreeDeliveryAmount(e.target.value)}
                  placeholder="50"
                />
              </div>
            </div>
          </Card>

          {/* Branding & Assets */}
          <Card title="Store Logo & Favicon Branding" icon={Image}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '12px' }}>
              <Uploader
                label="Header Store Logo Image"
                maxFiles={1}
                initialImages={logoUrl ? [logoUrl] : []}
                onFilesChanged={(urls) => setLogoUrl(urls[0] || '')}
              />
              <Input
                label="Or Enter Logo URL directly"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://..."
              />

              <Uploader
                label="Browser Favicon Icon"
                maxFiles={1}
                initialImages={faviconUrl ? [faviconUrl] : []}
                onFilesChanged={(urls) => setFaviconUrl(urls[0] || '')}
              />
              <Input
                label="Or Enter Favicon URL directly"
                value={faviconUrl}
                onChange={(e) => setFaviconUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>
          </Card>
        </div>

        {/* Column 3: Payment Credentials & Data Backup */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <Card title="Payment Gateway Integration Keys" icon={CreditCard}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '12px' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--primary)' }}>Stripe Integration</div>
              <Input
                label="Stripe Public Key"
                value={stripeKeys.publicKey}
                onChange={(e) => setStripeKeys({ ...stripeKeys, publicKey: e.target.value })}
                placeholder="pk_test_..."
              />
              <Input
                label="Stripe Secret Key"
                type="password"
                value={stripeKeys.secretKey}
                onChange={(e) => setStripeKeys({ ...stripeKeys, secretKey: e.target.value })}
                placeholder="sk_test_..."
              />


            </div>
          </Card>

          <Card title="Database Snapshot & Recovery" icon={Database}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.4' }}>
                Download a serialized JSON backup containing active products, orders, categories, and customer records.
              </p>
              <Button variant="outline" size="sm" icon={Database} onClick={handleDownloadBackup} style={{ width: 'fit-content' }}>
                Download JSON Backup
              </Button>
            </div>
          </Card>
        </div>

      </form>

    </div>
  );
};

export default Settings;
