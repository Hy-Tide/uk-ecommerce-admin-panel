import { useState, useEffect } from 'react';
import { Settings, Trash2, X, ZoomIn, Plus, Table as TableIcon, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Input, { Select, Textarea } from '../components/Input';
import Badge from '../components/Badge';
import ListView from '../components/ListView';
import ViewToggle from '../components/ViewToggle';
import { getData, postData, putData, deleteData, showSnackbar } from '../services/api';

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
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [lightboxSrc, setLightboxSrc] = useState(null);
  const [lightboxAlt, setLightboxAlt] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('view-mode-brands') || 'list';
  });

  const handleViewChange = (newView) => {
    setViewMode(newView);
    localStorage.setItem('view-mode-brands', newView);
  };

  // Form fields
  const [name, setName] = useState('');
  const [logo, setLogo] = useState('');
  const [logoFile, setLogoFile] = useState(null);
  const [imageMode, setImageMode] = useState('url');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('Active');

  const openModal = (brand = null) => {
    setEditingBrand(brand);
    setLogoFile(null);
    if (brand) {
      setName(brand.name);
      setLogo(brand.logo || '');
      setDescription(brand.description || '');
      setStatus(brand.status || 'Active');
    } else {
      setName('');
      setLogo('');
      setDescription('');
      setStatus('Active');
    }
    setModalOpen(true);
  };

  const [loading, setLoading] = useState(false);

  const handleSaveSubmit = async (e) => {
    e.preventDefault();
    if (!name) { addToast('Brand name is required', 'danger'); return; }

    setLoading(true);

    try {
      let response;
      if (logoFile) {
        const formData = new FormData();
        formData.append('name', name);
        formData.append('description', description || '');
        formData.append('is_active', status === 'Active');
        formData.append('image', logoFile);

        if (editingBrand && editingBrand.id && !editingBrand.id.startsWith('br-')) {
          response = await putData(`admin/brands/${editingBrand.id}`, formData);
        } else {
          response = await postData('admin/brands', formData);
        }
      } else {
        const apiPayload = {
          name,
          description: description || '',
          image_url: logo || '',
          is_active: status === 'Active'
        };

        if (editingBrand && editingBrand.id && !editingBrand.id.startsWith('br-')) {
          response = await putData(`admin/brands/${editingBrand.id}`, apiPayload);
        } else {
          response = await postData('admin/brands', apiPayload);
        }
      }

      const bData = response?.data?.brand || response?.data || {};
      const savedBrand = {
        id: editingBrand ? editingBrand.id : (bData._id || bData.id || `br-${Date.now()}`),
        name: bData.name || name,
        logo: bData.image_url || bData.logo || logo || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=100',
        description: bData.description || description,
        status: bData.is_active !== undefined ? (bData.is_active ? 'Active' : 'Inactive') : status
      };

      if (editingBrand) {
        setBrands(brands.map(b => b.id === editingBrand.id ? savedBrand : b));
        addToast('Brand updated successfully', 'success');
        showSnackbar('Brand updated successfully!', 'success');
      } else {
        setBrands([...brands, savedBrand]);
        addToast('Brand created successfully', 'success');
        showSnackbar('Brand created successfully!', 'success');
      }

      setAuditLogs([{
        id: `log-${Date.now()}`, timestamp: new Date().toISOString(),
        user: 'Mugesh',
        action: editingBrand ? 'Brand Settings Edited' : 'Brand Added',
        module: 'Brands',
        detail: `${editingBrand ? 'Updated' : 'Created'} brand: ${name}`
      }, ...auditLogs]);

      setModalOpen(false);
    } catch (err) {
      showSnackbar(err.message || 'Error saving brand', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchLiveBrands = async () => {
      try {
        const queryParams = { limit: limit, page: currentPage };
        if (searchTerm.trim()) queryParams.search = searchTerm.trim();
        if (filterStatus !== 'all') queryParams.status = filterStatus;

        let response = await getData('admin/brands', queryParams);
        let apiBrandsList = response?.data?.brands || (Array.isArray(response?.data) ? response.data : []);

        if (!Array.isArray(apiBrandsList) || apiBrandsList.length === 0) {
          response = await getData('website/brands', queryParams);
          apiBrandsList = response?.data?.brands || (Array.isArray(response?.data) ? response.data : []);
        }

        const apiTotalPages = response?.data?.meta?.totalPages || 1;
        setTotalPages(apiTotalPages);
        setTotalItems(response?.data?.meta?.total || 0);

        if (Array.isArray(apiBrandsList)) {
          const formatted = apiBrandsList.map(b => ({
            id: b._id || b.id,
            name: b.name,
            slug: b.slug || '',
            logo: b.image_url || b.logo || '',
            description: b.description || '',
            status: b.is_active !== false ? 'Active' : 'Inactive'
          }));
          setBrands(formatted);
        }
      } catch (err) {
        console.warn('Using fallback brands matrix:', err);
      }
    };

    fetchLiveBrands();
  }, [searchTerm, filterStatus, currentPage, limit]);

  const handleDelete = async (id) => {
    const deleted = brands.find(b => b.id === id);
    setBrands(brands.filter(b => b.id !== id));

    try {
      if (id && !id.startsWith('br-')) {
        const response = await deleteData(`admin/brands/${id}`);
        if (response?.success || response?.statusCode === 200) {
          showSnackbar('Brand deleted successfully', 'success');
        }
      }
    } catch {
      // Quiet fallback
    }

    addToast('Brand deleted successfully', 'warning');
    setAuditLogs([{
      id: `log-${Date.now()}`, timestamp: new Date().toISOString(),
      user: 'Mugesh', action: 'Brand Deleted',
      module: 'Brands', detail: `Removed brand: ${deleted?.name}`
    }, ...auditLogs]);
  };

  // Derived
  const activeCount = (brands || []).filter(b => (b?.status || 'Active') === 'Active').length;

  const filtered = (brands || []).filter(b => {
    if (filterStatus === 'active') return (b?.status || 'Active') === 'Active';
    if (filterStatus === 'inactive') return (b?.status || 'Active') !== 'Active';
    return true;
  });

  const TABS = [
    { id: 'all', label: `All (${(brands || []).length})` },
    { id: 'active', label: `Active (${activeCount})` },
    { id: 'inactive', label: `Inactive (${(brands || []).length - activeCount})` },
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

      {/* Filter & Live Search Toolbar */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'space-between' }}>
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

        {/* Search input with live API query support */}
        <div style={{ position: 'relative', minWidth: '260px', flex: '0 1 320px' }}>
          <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search brands (e.g. Aachi)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px 8px 36px',
              fontSize: '13px',
              borderRadius: '10px',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-card)',
              color: 'var(--text-primary)',
              outline: 'none'
            }}
          />
        </div>
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
                  <img
                    src={row.logo || '/logo.png'}
                    alt={row.name}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = '/logo.png';
                      e.currentTarget.style.opacity = '0.35';
                    }}
                    style={{ width: '36px', height: '36px', borderRadius: '6px', objectFit: 'contain', backgroundColor: 'var(--bg-app)', border: '1px solid var(--border-color)' }}
                  />
                </div>
              )
            },
            { key: 'name', label: 'Brand Name', render: row => <span style={{ fontWeight: '700' }}>{row.name}</span> },
            {
              key: 'description',
              label: 'Description',
              render: row => (
                <div
                  title={row.description}
                  style={{
                    color: 'var(--text-secondary)',
                    fontSize: '13px',
                    maxWidth: '300px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {row.description || '—'}
                </div>
              )
            },
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
          externalVisibleColumns={['logo', 'name', 'description', 'status', 'actions']}
          serverSideTotal={totalItems}
          serverSidePage={currentPage}
          onServerPageChange={setCurrentPage}
          onServerRowsChange={setLimit}
          initialRowsPerPage={limit}
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

      {/* Pagination Controls (Only for Grid View) */}
      {viewMode === 'grid' && totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginTop: '24px' }}>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          >
            <ChevronLeft size={16} style={{ marginRight: '4px' }} /> Previous
          </Button>
          <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)' }}>
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
          >
            Next <ChevronRight size={16} style={{ marginLeft: '4px' }} />
          </Button>
        </div>
      )}

      {/* Edit / Create Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingBrand ? 'Edit Brand' : 'Add Partner Brand'}
        footer={
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button variant="outline" size="sm" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary" size="sm" loading={loading} onClick={handleSaveSubmit}>Save Changes</Button>
          </div>
        }
      >
        <form style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Input label="Brand Name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Organic Groves" />

          {/* Logo Choice: URL vs File Upload */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>Brand Logo</label>
              <div style={{ display: 'flex', gap: '4px', backgroundColor: 'var(--bg-app)', padding: '2px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <button
                  type="button"
                  onClick={() => setImageMode('url')}
                  style={{
                    padding: '4px 10px', fontSize: '11px', fontWeight: '600', borderRadius: '6px', border: 'none', cursor: 'pointer',
                    backgroundColor: imageMode === 'url' ? 'var(--primary)' : 'transparent',
                    color: imageMode === 'url' ? '#fff' : 'var(--text-secondary)'
                  }}
                >
                  Logo URL
                </button>
                <button
                  type="button"
                  onClick={() => setImageMode('upload')}
                  style={{
                    padding: '4px 10px', fontSize: '11px', fontWeight: '600', borderRadius: '6px', border: 'none', cursor: 'pointer',
                    backgroundColor: imageMode === 'upload' ? 'var(--primary)' : 'transparent',
                    color: imageMode === 'upload' ? '#fff' : 'var(--text-secondary)'
                  }}
                >
                  Upload File
                </button>
              </div>
            </div>

            {imageMode === 'url' ? (
              <Input
                placeholder="https://images.unsplash.com/... or logo image link"
                value={logo}
                onChange={(e) => {
                  setLogo(e.target.value);
                  setLogoFile(null);
                }}
              />
            ) : (
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    const file = e.target.files[0];
                    setLogoFile(file);
                    setLogo(URL.createObjectURL(file));
                  }
                }}
              />
            )}

            {logo && (
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 14px', borderRadius: '10px',
                backgroundColor: 'var(--bg-app)', border: '1px solid var(--border-color)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <img
                    src={logo}
                    alt="Brand logo preview"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    style={{ height: '48px', maxWidth: '140px', objectFit: 'contain', borderRadius: '8px' }}
                  />
                  <span style={{ fontSize: '12px', fontWeight: '500', color: 'var(--text-primary)' }}>
                    Logo Preview
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => { setLogo(''); setLogoFile(null); }}
                  style={{ border: 'none', background: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: '12px' }}
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          <Textarea label="Brand Description" value={description} onChange={e => setDescription(e.target.value)} />
          <Select label="Status" value={status} onChange={e => setStatus(e.target.value)} options={['Active', 'Inactive']} />
        </form>
      </Modal>

    </div>
  );
};
export default Brands;
