import { useState } from 'react';
import { Settings, Trash2, X, ZoomIn, Plus, Table as TableIcon } from 'lucide-react';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Input, { Select, Textarea } from '../components/Input';
import Badge from '../components/Badge';
import ListView from '../components/ListView';
import ViewToggle from '../components/ViewToggle';

// ─── Logo Lightbox ────────────────────────────────────────────────────────────
const Lightbox = ({ src, alt, onClose }) => {
  if (!src) return null;
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}
    >
      <button
        onClick={onClose}
        style={{
          position: 'absolute', top: '20px', right: '24px',
          background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: '50%',
          width: '40px', height: '40px', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', transition: 'background 0.2s'
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
      >
        <X size={20} />
      </button>
      <img
        src={src}
        alt={alt}
        onClick={e => e.stopPropagation()}
        style={{
          maxWidth: '90vw', maxHeight: '85vh',
          objectFit: 'contain',
          borderRadius: '16px',
          boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
          animation: 'lb-in 0.2s ease'
        }}
      />
      <style>{`@keyframes lb-in { from { opacity:0; transform:scale(0.9); } to { opacity:1; transform:scale(1); } }`}</style>
    </div>
  );
};

// ─── Brand Card ───────────────────────────────────────────────────────────────
const BrandCard = ({ brand, onEdit, onDelete, onLogoClick }) => {
  const [hover, setHover] = useState(false);
  const isActive = brand.status === 'Active';

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-card)',
        border: `1.5px solid ${hover ? 'var(--primary)' : 'var(--border-color)'}`,
        borderRadius: '16px',
        overflow: 'hidden',
        transition: 'all 0.22s ease',
        boxShadow: hover ? '0 8px 28px rgba(79,70,229,0.12)' : '0 2px 8px rgba(0,0,0,0.04)',
        display: 'flex', flexDirection: 'column'
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* Top accent bar */}
      <div style={{
        height: '3px',
        background: isActive
          ? 'linear-gradient(90deg, var(--primary), var(--accent))'
          : 'var(--border-color)'
      }} />

      {/* Logo area */}
      <div
        style={{
          position: 'relative', cursor: 'zoom-in',
          backgroundColor: 'var(--bg-app)',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '28px 24px', overflow: 'hidden'
        }}
        onClick={() => onLogoClick(brand.logo, brand.name)}
        title="Click to enlarge logo"
      >
        {brand.logo ? (
          <img
            src={brand.logo}
            alt={brand.name}
            style={{
              width: '80px', height: '80px',
              objectFit: 'contain',
              borderRadius: '12px',
              transition: 'transform 0.25s ease',
              transform: hover ? 'scale(1.08)' : 'scale(1)'
            }}
          />
        ) : (
          <div style={{
            width: '80px', height: '80px', borderRadius: '12px',
            background: 'linear-gradient(135deg, var(--primary-light), var(--accent-light))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '28px', fontWeight: '900', color: 'var(--primary)'
          }}>
            {brand.name.charAt(0)}
          </div>
        )}
        {/* Zoom hint overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundColor: 'rgba(79,70,229,0.07)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          opacity: hover ? 1 : 0, transition: 'opacity 0.2s'
        }}>
          <ZoomIn size={22} style={{ color: 'var(--primary)' }} />
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '16px 20px', flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {/* Name + status */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.01em' }}>
            {brand.name}
          </h3>
          <Badge variant={isActive ? 'success' : 'secondary'}>{brand.status}</Badge>
        </div>

        {/* Description */}
        <p style={{
          fontSize: '12px', color: 'var(--text-secondary)',
          lineHeight: 1.6, margin: 0, flex: 1,
          display: '-webkit-box', WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical', overflow: 'hidden'
        }}>
          {brand.description || 'No description provided.'}
        </p>

        {/* Footer */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
          paddingTop: '10px', borderTop: '1px solid var(--border-color)',
          marginTop: '4px'
        }}>
          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '4px' }}>
            {/* Edit */}
            <button
              onClick={() => onEdit(brand)}
              title="Edit brand"
              style={{
                width: '30px', height: '30px', borderRadius: '8px', border: 'none',
                backgroundColor: 'var(--bg-app)', color: 'var(--text-secondary)',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--primary-light)'; e.currentTarget.style.color = 'var(--primary)'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'var(--bg-app)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
            >
              <Settings size={13} />
            </button>
            {/* Delete */}
            <button
              onClick={() => onDelete(brand.id)}
              title="Delete brand"
              style={{
                width: '30px', height: '30px', borderRadius: '8px', border: 'none',
                backgroundColor: 'var(--bg-app)', color: 'var(--text-muted)',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#dc2626'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'var(--bg-app)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main Module ──────────────────────────────────────────────────────────────
export const Brands = ({
  brands = [],
  setBrands,
  addToast,
  auditLogs = [],
  setAuditLogs
}) => {
  const [modalOpen,    setModalOpen]    = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [lightboxSrc,  setLightboxSrc]  = useState(null);
  const [lightboxAlt,  setLightboxAlt]  = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewMode,     setViewMode]     = useState(() => {
    return localStorage.getItem('view-mode-brands') || 'list';
  });

  const handleViewChange = (newView) => {
    setViewMode(newView);
    localStorage.setItem('view-mode-brands', newView);
  };

  // Form fields
  const [name,        setName]        = useState('');
  const [logo,        setLogo]        = useState('');
  const [description, setDescription] = useState('');
  const [status,      setStatus]      = useState('Active');

  const openModal = (brand = null) => {
    setEditingBrand(brand);
    if (brand) {
      setName(brand.name);
      setLogo(brand.logo || '');
      setDescription(brand.description || '');
      setStatus(brand.status || 'Active');
    } else {
      setName('');
      setLogo('https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=100');
      setDescription('');
      setStatus('Active');
    }
    setModalOpen(true);
  };

  const handleSaveSubmit = (e) => {
    e.preventDefault();
    if (!name) { addToast('Brand name is required', 'danger'); return; }
    const payload = {
      id: editingBrand ? editingBrand.id : `br-${Date.now()}`,
      name, logo, description, status
    };
    if (editingBrand) {
      setBrands(brands.map(b => b.id === editingBrand.id ? payload : b));
      addToast('Brand updated successfully', 'success');
    } else {
      setBrands([...brands, payload]);
      addToast('Brand created successfully', 'success');
    }
    setAuditLogs([{
      id: `log-${Date.now()}`, timestamp: new Date().toISOString(),
      user: 'Mugesh',
      action: editingBrand ? 'Brand Settings Edited' : 'Brand Added',
      module: 'Brands',
      detail: `${editingBrand ? 'Updated' : 'Created'} brand: ${payload.name}`
    }, ...auditLogs]);
    setModalOpen(false);
  };

  const handleDelete = (id) => {
    const deleted = brands.find(b => b.id === id);
    setBrands(brands.filter(b => b.id !== id));
    addToast('Brand deleted', 'warning');
    setAuditLogs([{
      id: `log-${Date.now()}`, timestamp: new Date().toISOString(),
      user: 'Mugesh', action: 'Brand Deleted',
      module: 'Brands', detail: `Removed brand: ${deleted?.name}`
    }, ...auditLogs]);
  };

  // Derived
  const activeCount = brands.filter(b => b.status === 'Active').length;

  const filtered = brands.filter(b => {
    if (filterStatus === 'active')   return b.status === 'Active';
    if (filterStatus === 'inactive') return b.status !== 'Active';
    return true;
  });

  const TABS = [
    { id: 'all',      label: `All (${brands.length})` },
    { id: 'active',   label: `Active (${activeCount})` },
    { id: 'inactive', label: `Inactive (${brands.length - activeCount})` },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Lightbox */}
      <Lightbox src={lightboxSrc} alt={lightboxAlt} onClose={() => setLightboxSrc(null)} />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '800', letterSpacing: '-0.03em', margin: 0 }}>Partner Brands</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: '4px 0 0' }}>
            Manage brand listings, logos, descriptions, and featured status.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <ViewToggle currentView={viewMode} onViewChange={handleViewChange} />
          <Button variant="primary" size="sm" icon={Plus} onClick={() => openModal(null)}>
            Add Brand
          </Button>
        </div>
      </div>

      {/* KPI strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
        {[
          { label: 'Total Brands', value: brands.length,              color: '#6366f1', bg: '#ede9fe' },
          { label: 'Active',       value: activeCount,                color: '#16a34a', bg: '#dcfce7' },
          { label: 'Inactive',     value: brands.length - activeCount, color: '#6b7280', bg: '#f3f4f6' },
        ].map(s => (
          <div key={s.label} style={{ backgroundColor: 'var(--bg-card)', border: `1.5px solid ${s.color}33`, borderRadius: '12px', padding: '14px 16px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', marginBottom: '4px' }}>{s.label}</div>
            <div style={{ fontSize: '22px', fontWeight: '900', color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div style={{
        display: 'flex', gap: '6px',
        backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)',
        borderRadius: '12px', padding: '5px', width: 'fit-content'
      }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setFilterStatus(t.id)} style={{
            padding: '6px 16px', fontSize: '12px', fontWeight: '700',
            borderRadius: '8px', border: 'none', cursor: 'pointer',
            transition: 'all 0.2s ease', whiteSpace: 'nowrap',
            backgroundColor: filterStatus === t.id ? 'var(--primary)' : 'transparent',
            color: filterStatus === t.id ? '#fff' : 'var(--text-secondary)',
            boxShadow: filterStatus === t.id ? '0 2px 8px rgba(79,70,229,0.3)' : 'none'
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Brand presentation layer */}
      {viewMode === 'list' ? (
        <ListView
          columns={[
            {
              key: 'logo', label: 'Logo',
              render: row => (
                <div
                  style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                  onClick={() => { setLightboxSrc(row.logo); setLightboxAlt(row.name); }}
                  title="Click to enlarge"
                >
                  <img src={row.logo} alt={row.name} style={{ width: '36px', height: '36px', borderRadius: '6px', objectFit: 'contain', backgroundColor: 'var(--bg-app)', border: '1px solid var(--border-color)' }} />
                </div>
              )
            },
            { key: 'name', label: 'Brand Name', render: row => <span style={{ fontWeight: '700' }}>{row.name}</span> },
            { key: 'description', label: 'Description', render: row => <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{row.description}</span> },
            { key: 'status', label: 'Status', render: row => <Badge variant={row.status === 'Active' ? 'success' : 'secondary'}>{row.status}</Badge> },
            {
              key: 'actions', label: '',
              render: row => (
                <div style={{ display: 'flex', gap: '6px' }}>
                  <Button variant="outline" size="sm" onClick={() => openModal(row)}>Edit</Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(row.id)} style={{ color: 'var(--danger)' }}><Trash2 size={14} /></Button>
                </div>
              )
            }
          ]}
          data={filtered}
          initialRowsPerPage={10}
        />
      ) : (
        filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 24px', backgroundColor: 'var(--bg-card)', border: '1px dashed var(--border-color)', borderRadius: '16px' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: 0 }}>No brands in this filter.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '18px' }}>
            {filtered.map(brand => (
              <BrandCard
                key={brand.id}
                brand={brand}
                onEdit={openModal}
                onDelete={handleDelete}
                onLogoClick={(src, alt) => { setLightboxSrc(src); setLightboxAlt(alt); }}
              />
            ))}
          </div>
        )
      )}

      {/* Edit / Create Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingBrand ? 'Edit Brand' : 'Add Partner Brand'}
        footer={
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button variant="outline" size="sm" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={handleSaveSubmit}>Save Changes</Button>
          </div>
        }
      >
        <form style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Logo preview */}
          {logo && (
            <div style={{
              display: 'flex', justifyContent: 'center', padding: '20px',
              backgroundColor: 'var(--bg-app)', borderRadius: '12px',
              border: '1px solid var(--border-color)'
            }}>
              <img
                src={logo}
                alt="Brand logo preview"
                style={{ height: '72px', maxWidth: '200px', objectFit: 'contain', borderRadius: '8px' }}
              />
            </div>
          )}
          <Input label="Brand Name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Organic Groves" />
          <Input label="Logo Image URL" value={logo} onChange={e => setLogo(e.target.value)} placeholder="https://..." />
          <Textarea label="Brand Description" value={description} onChange={e => setDescription(e.target.value)} />
          <Select label="Status" value={status} onChange={e => setStatus(e.target.value)} options={['Active', 'Inactive']} />
        </form>
      </Modal>

    </div>
  );
};
export default Brands;
