import React, { useState, useEffect } from 'react';
import { Sparkles, Edit, CheckCircle, XCircle, Grid, List as ListIcon, ImageIcon, ExternalLink, RefreshCw, Search } from 'lucide-react';
import Button from '../components/Button';
import Drawer from '../components/Drawer';
import Input, { Select, Textarea } from '../components/Input';
import Table from '../components/Table';
import Badge from '../components/Badge';
import Card, { StatsCard } from '../components/Card';
import ViewToggle from '../components/ViewToggle';
import ImageWithFallback from '../components/ImageWithFallback';
import { fetchBanners, updateBanner, createBanner } from '../services/api';
import { API_URL } from '../services/url';

const resolveImageUrl = (url) => {
  if (!url) return '';
  let resolved = url;
  if (resolved.startsWith('http://api.grandmasbasket.co.uk') || resolved.startsWith('https://api.grandmasbasket.co.uk')) {
    const currentProtocol = typeof window !== 'undefined' ? window.location.protocol : 'https:';
    resolved = resolved.replace(/^https?:\/\/api\.grandmasbasket\.co\.uk/, `${currentProtocol}//api.grandmasbasket.co.uk`);
  }
  if (resolved.startsWith('http://') || resolved.startsWith('https://') || resolved.startsWith('data:')) {
    return resolved;
  }
  const baseUrl = (API_URL || 'https://api.grandmasbasket.co.uk/api/v1/').replace(/\/api\/v1\/?$/, '');
  const cleanUrl = resolved.startsWith('/') ? resolved.slice(1) : resolved;
  return `${baseUrl}/${cleanUrl}`;
};

// Pre-seeded default 4 banners corresponding to target pages
const DEFAULT_BANNERS = [
  {
    id: 'ban-1',
    _id: 'ban-1',
    title: 'Super Saver Veggie Box Offers',
    description: 'Fresh organic farm vegetables with up to 40% discount this week.',
    pageType: 'offers',
    image_url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800',
    link: '/offers/veggie-special',
    is_active: true,
    createdAt: '2026-08-10T12:00:00.000Z'
  },
  {
    id: 'ban-2',
    _id: 'ban-2',
    title: 'Fresh Homemade Summer Salads',
    description: 'Learn how to make delicious low-calorie seasonal fruit and vegetable salads.',
    pageType: 'recipes',
    image_url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=800',
    link: '/recipes/summer-salads',
    is_active: true,
    createdAt: '2026-08-08T09:15:00.000Z'
  },
  {
    id: 'ban-3',
    _id: 'ban-3',
    title: 'Top 10 Healthy Cooking Hacks',
    description: 'Discover simple cooking tricks to preserve nutrients and enhance organic flavor.',
    pageType: 'blogs',
    image_url: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&q=80&w=800',
    link: '/blogs/cooking-hacks',
    is_active: true,
    createdAt: '2026-08-09T15:30:00.000Z'
  },
  {
    id: 'ban-4',
    _id: 'ban-4',
    title: 'Contact Grandma\'s Basket Care',
    description: 'Get direct live support and answers to delivery timeline questions.',
    pageType: 'contact-us',
    image_url: 'https://images.unsplash.com/photo-1534536281715-e28d76689b4d?auto=format&fit=crop&q=80&w=800',
    link: '/contact',
    is_active: false,
    createdAt: '2026-08-07T14:20:00.000Z'
  }
];

export const Banners = ({
  addToast,
  auditLogs = [],
  setAuditLogs
}) => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('view-mode-banners') || 'grid';
  });

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPageType, setFilterPageType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Drawer Form state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [pageType, setPageType] = useState('offers');
  const [link, setLink] = useState('');
  const [isActive, setIsActive] = useState(true);

  // Image Upload Fields
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [imageUrlInput, setImageUrlInput] = useState('');

  const loadBanners = async () => {
    setLoading(true);
    try {
      const res = await fetchBanners();
      if (res && res.success !== false) {
        const list = res.data?.banners || res.banners || (Array.isArray(res.data) ? res.data : (Array.isArray(res) ? res : []));
        if (Array.isArray(list) && list.length > 0) {
          // Sync backend data, matching by pageType or extending defaults
          const merged = DEFAULT_BANNERS.map(def => {
            const apiMatch = list.find(b => b.pageType === def.pageType);
            return apiMatch ? normalizeBanner(apiMatch) : def;
          });
          setBanners(merged);
        } else {
          setBanners(DEFAULT_BANNERS);
        }
      } else {
        setBanners(DEFAULT_BANNERS);
      }
    } catch (err) {
      console.error('Failed to load banners from API:', err);
      // Seamless offline fallback
      setBanners(DEFAULT_BANNERS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBanners();
  }, []);

  const normalizeBanner = (b) => {
    // Find the default banner matching pageType to inherit description if missing from API
    const defaultMatch = DEFAULT_BANNERS.find(def => def.pageType === b.pageType) || {};
    return {
      id: b._id || b.id || defaultMatch.id || `ban-${Date.now()}`,
      _id: b._id || b.id,
      title: b.title || defaultMatch.title || '',
      description: b.description || defaultMatch.description || '',
      pageType: b.pageType || defaultMatch.pageType || 'offers',
      image_url: b.image_url || b.imageUrl || defaultMatch.image_url || '',
      link: b.link || defaultMatch.link || '',
      is_active: b.is_active !== undefined ? Boolean(b.is_active) : (b.isActive !== undefined ? Boolean(b.isActive) : true),
      createdAt: b.createdAt || defaultMatch.createdAt || new Date().toISOString()
    };
  };

  const handleViewChange = (newView) => {
    setViewMode(newView);
    localStorage.setItem('view-mode-banners', newView);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImageUrlInput('');
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const openEditDrawer = (banner) => {
    setEditingBanner(banner);
    setTitle(banner.title || '');
    setDescription(banner.description || '');
    setPageType(banner.pageType || 'offers');
    setLink(banner.link || '');
    setIsActive(banner.is_active);
    setImageFile(null);
    setImageUrlInput(banner.image_url || '');
    setImagePreview(banner.image_url || '');
    setDrawerOpen(true);
  };

  const handleSaveBanner = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      if (addToast) addToast('Banner title is required', 'danger');
      return;
    }

    if (!imagePreview.trim() && !imageFile) {
      if (addToast) addToast('Banner image is required', 'danger');
      return;
    }

    setIsSubmitting(true);
    const targetId = editingBanner ? (editingBanner._id || editingBanner.id) : null;
    const isMock = !targetId || String(targetId).startsWith('ban-') || String(targetId).length !== 24;

    try {
      let res;
      if (imageFile) {
        const formData = new FormData();
        formData.append('title', title.trim());
        formData.append('description', description.trim());
        formData.append('pageType', pageType);
        formData.append('image_url', imageFile);
        formData.append('is_active', isActive);

        if (isMock) {
          res = await createBanner(formData);
        } else {
          res = await updateBanner(targetId, formData);
        }
      } else {
        const jsonPayload = {
          title: title.trim(),
          description: description.trim(),
          pageType,
          image_url: imageUrlInput.trim() || imagePreview.trim(),
          is_active: isActive
        };

        if (isMock) {
          res = await createBanner(jsonPayload);
        } else {
          res = await updateBanner(targetId, jsonPayload);
        }
      }

      const updatedObj = {
        id: targetId,
        _id: targetId,
        title: title.trim(),
        description: description.trim(),
        pageType,
        image_url: imagePreview || imageUrlInput,
        is_active: isActive,
        createdAt: editingBanner?.createdAt || new Date().toISOString()
      };

      if (res && res.success !== false) {
        const saved = res.data?.banner || res.data || updatedObj;
        const normalized = normalizeBanner(saved);
        setBanners(banners.map(b => (b.pageType === pageType ? normalized : b)));
        if (addToast) addToast(res.message || (isMock ? 'Banner created successfully' : 'Banner updated successfully'), 'success');

        // Add to audit logs
        if (setAuditLogs) {
          setAuditLogs([
            {
              id: `log-${Date.now()}`,
              timestamp: new Date().toISOString(),
              user: 'Mugesh',
              action: isMock ? 'Banner Created' : 'Banner Updated',
              module: 'Banners',
              detail: `${isMock ? 'Created' : 'Updated'} page banner "${title}" for page: ${pageType}`
            },
            ...auditLogs
          ]);
        }

        setDrawerOpen(false);
      } else {
        const errMsg = res?.message || res?.error || 'Failed to save banner on server';
        if (addToast) addToast(errMsg, 'danger');
      }
    } catch (err) {
      console.error('Error saving banner:', err);
      const errMsg = err?.message || 'Error occurred while saving banner';
      if (addToast) addToast(errMsg, 'danger');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (banner) => {
    const updatedStatus = !banner.is_active;
    const isMock = !banner._id || String(banner._id).startsWith('ban-') || String(banner._id).length !== 24;

    try {
      const jsonPayload = {
        title: banner.title || '',
        description: banner.description || '',
        pageType: banner.pageType,
        image_url: banner.image_url || '',
        is_active: updatedStatus
      };

      let res;
      if (isMock) {
        res = await createBanner(jsonPayload);
      } else {
        res = await updateBanner(banner.id, jsonPayload);
      }

      if (res && res.success !== false) {
        const saved = res.data?.banner || res.data || { ...banner, is_active: updatedStatus };
        const normalized = normalizeBanner(saved);
        setBanners(banners.map(b => (b.pageType === banner.pageType ? normalized : b)));
        if (addToast) addToast(res.message || `Banner status set to ${updatedStatus ? 'Active' : 'Inactive'}`, 'info');
      } else {
        const errMsg = res?.message || res?.error || 'Failed to update banner status';
        if (addToast) addToast(errMsg, 'danger');
      }
    } catch (err) {
      console.error('Failed to toggle status:', err);
      const errMsg = err?.message || 'Error toggling banner status';
      if (addToast) addToast(errMsg, 'danger');
    }
  };

  // Filtered banners
  const filteredBanners = banners.filter(b => {
    const matchSearch = !searchTerm.trim() ||
      (b.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.link || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchPage = filterPageType === 'all' || b.pageType === filterPageType;
    const matchStatus = filterStatus === 'all' ||
      (filterStatus === 'active' && b.is_active) ||
      (filterStatus === 'inactive' && !b.is_active);

    return matchSearch && matchPage && matchStatus;
  });

  const activeCount = banners.filter(b => b.is_active).length;
  const inactiveCount = banners.filter(b => !b.is_active).length;

  const columns = [
    {
      key: 'image_url',
      label: 'Image Preview',
      render: (row) => (
        <div style={{ width: '75px', height: '48px', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
          <ImageWithFallback src={resolveImageUrl(row.image_url)} alt={row.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} referrerPolicy="no-referrer" />
        </div>
      )
    },
    {
      key: 'title',
      label: 'Banner Details',
      render: (row) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', maxWidth: '340px' }}>
          <span style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '13.5px' }}>{row.title}</span>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>{row.description}</span>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>Created: {new Date(row.createdAt).toLocaleDateString()}</span>
        </div>
      )
    },
    {
      key: 'pageType',
      label: 'Page Location',
      render: (row) => {
        let variant = 'info';
        if (row.pageType === 'offers') variant = 'success';
        if (row.pageType === 'blogs') variant = 'warning';
        if (row.pageType === 'recipes') variant = 'primary';
        if (row.pageType === 'contact-us') variant = 'secondary';
        return (
          <Badge variant={variant} style={{ textTransform: 'capitalize', fontSize: '11px', padding: '3px 8px' }}>
            {row.pageType.replace('-', ' ')}
          </Badge>
        );
      }
    },

    {
      key: 'is_active',
      label: 'Active Status',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <label style={{ position: 'relative', display: 'inline-block', width: '42px', height: '22px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={row.is_active || false}
              onChange={() => handleToggleActive(row)}
              style={{ opacity: 0, width: 0, height: 0 }}
            />
            <span style={{ position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: row.is_active ? 'var(--success)' : 'rgba(148, 163, 184, 0.3)', transition: 'all 0.3s ease', borderRadius: '22px', border: '1px solid var(--border-color)' }} />
            <span style={{ position: 'absolute', content: '""', height: '16px', width: '16px', left: row.is_active ? '22px' : '3px', bottom: '2px', backgroundColor: '#ffffff', transition: 'all 0.3s ease', borderRadius: '50%', boxShadow: 'var(--shadow-sm)' }} />
          </label>
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Edit Config',
      render: (row) => (
        <Button
          variant="outline"
          size="sm"
          icon={Edit}
          onClick={() => openEditDrawer(row)}
          title="Edit Banner Configuration"
        />
      )
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '800', letterSpacing: '-0.03em', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={24} style={{ color: 'var(--primary)' }} /> Store Page Banners
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px', margin: 0 }}>
            Configure and edit storefront page banners for Offers, Recipes, Blogs, and Contact Us. Banners cannot be deleted or created.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Button variant="outline" size="sm" icon={RefreshCw} onClick={loadBanners} loading={loading} title="Reload Data" />
          <ViewToggle currentView={viewMode} onViewChange={handleViewChange} />
        </div>
      </div>

      {/* Stats Summary Panel */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
        <StatsCard title="Website Page Banners" value={banners.length} icon={Sparkles} iconColor="#6366f1" iconBg="#ede9fe" />
        <StatsCard title="Active Banners" value={activeCount} icon={CheckCircle} iconColor="#10b981" iconBg="#d1fae5" />
        <StatsCard title="Inactive Banners" value={inactiveCount} icon={XCircle} iconColor="#f59e0b" iconBg="#fef3c7" />
      </div>

      {/* Search and Filters */}
      <Card>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', width: '100%', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: '240px' }}>
            <Input
              placeholder="Search by title, description, or redirect link..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={Search}
            />
          </div>
          <div style={{ width: '180px' }}>
            <Select
              label="Page Location"
              value={filterPageType}
              onChange={(e) => setFilterPageType(e.target.value)}
              options={[
                { value: 'all', label: 'All Pages' },
                { value: 'offers', label: 'Offers' },
                { value: 'blogs', label: 'Blogs' },
                { value: 'recipes', label: 'Recipes' },
                { value: 'contact-us', label: 'Contact Us' }
              ]}
            />
          </div>
          <div style={{ width: '160px' }}>
            <Select
              label="Active Status"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              options={[
                { value: 'all', label: 'All Statuses' },
                { value: 'active', label: 'Active Only' },
                { value: 'inactive', label: 'Inactive Only' }
              ]}
            />
          </div>
        </div>
      </Card>

      {/* Content Rendering */}
      {loading && banners.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="shimmer" style={{ height: '80px', borderRadius: '12px' }} />
          <div className="shimmer" style={{ height: '300px', borderRadius: '12px' }} />
        </div>
      ) : filteredBanners.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: '48px 24px' }}>
          <div style={{ padding: '16px', borderRadius: '50%', backgroundColor: 'var(--bg-app)', color: 'var(--text-muted)', display: 'inline-flex', marginBottom: '12px' }}>
            <ImageIcon size={32} />
          </div>
          <h3 style={{ fontSize: '16px', fontWeight: '700', margin: '0 0 4px 0' }}>No Banners Found</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: 0 }}>
            No banners match the selected filters.
          </p>
        </Card>
      ) : viewMode === 'list' ? (
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <Table
            columns={columns}
            data={filteredBanners}
            initialRowsPerPage={5}
          />
        </Card>
      ) : (
        /* Grid View */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {filteredBanners.map(banner => (
            <Card
              key={banner.id}
              style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', padding: 0 }}
            >
              <div style={{ position: 'relative', height: '160px', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-app)' }}>
                <ImageWithFallback src={resolveImageUrl(banner.image_url)} alt={banner.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} referrerPolicy="no-referrer" />
                <div style={{ position: 'absolute', top: '12px', left: '12px' }}>
                  <Badge variant={banner.is_active ? 'success' : 'danger'} style={{ boxShadow: 'var(--shadow-sm)' }}>
                    {banner.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
                  <Badge variant={banner.pageType === 'offers' ? 'success' : banner.pageType === 'blogs' ? 'warning' : banner.pageType === 'recipes' ? 'primary' : 'secondary'} style={{ textTransform: 'capitalize', boxShadow: 'var(--shadow-sm)' }}>
                    {banner.pageType.replace('-', ' ')}
                  </Badge>
                </div>
              </div>
              <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                <div>
                  <h4 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)', margin: '0 0 4px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {banner.title}
                  </h4>
                  <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: '0 0 6px 0', display: '-webkit-box', WebKitLineClamp: 2, WebKitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.4', height: '34px' }}>
                    {banner.description || 'No description provided.'}
                  </p>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Created: {new Date(banner.createdAt).toLocaleDateString()}</span>
                </div>

                
                {/* Switch Active Toggle & Edit Button Footer */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)', fontWeight: '600' }}>Active Status</span>
                    <label style={{ position: 'relative', display: 'inline-block', width: '34px', height: '18px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={banner.is_active || false}
                        onChange={() => handleToggleActive(banner)}
                        style={{ opacity: 0, width: 0, height: 0 }}
                      />
                      <span style={{ position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: banner.is_active ? 'var(--success)' : 'rgba(148, 163, 184, 0.3)', transition: 'all 0.3s ease', borderRadius: '18px' }} />
                      <span style={{ position: 'absolute', content: '""', height: '14px', width: '14px', left: banner.is_active ? '17px' : '3px', bottom: '2px', backgroundColor: '#ffffff', transition: 'all 0.3s ease', borderRadius: '50%' }} />
                    </label>
                  </div>
                  
                  <Button variant="outline" size="sm" icon={Edit} onClick={() => openEditDrawer(banner)} title="Edit Banner Configuration" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Slide-out Drawer */}
      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={`Edit Banner: ${editingBanner?.title}`}
        footer={
          <div style={{ display: 'flex', gap: '10px' }}>
            <Button variant="outline" size="sm" onClick={() => setDrawerOpen(false)}>Cancel</Button>
            <Button variant="primary" size="sm" icon={Edit} loading={isSubmitting} onClick={handleSaveBanner}>
              Save Banner Changes
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSaveBanner} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)' }}>Page Location (Read-Only)</label>
            <div style={{ padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-app)', textTransform: 'capitalize', fontWeight: '700', fontSize: '14px', color: 'var(--text-primary)' }}>
              {pageType.replace('-', ' ')}
            </div>
          </div>

          <Input
            label="Banner Campaign Title *"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Mega Summer Organic Sale Offer"
            required
          />

          <Textarea
            label="Banner Campaign Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter a brief description explaining this banner's content/campaign details..."
            rows={3}
          />



          {/* Premium Image Uploader with File Drop and Preview */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)' }}>Banner Cover Image *</span>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <label
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 16px',
                  backgroundColor: 'var(--bg-app)',
                  border: '1px dashed var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: 'var(--text-primary)',
                  transition: 'background-color 0.2s',
                  whiteSpace: 'nowrap'
                }}
                className="hover-bg-muted"
              >
                <ImageIcon size={16} style={{ color: 'var(--primary)' }} /> Select Local Image File
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
              </label>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>or</span>
              <div style={{ flex: 1 }}>
                <Input
                  placeholder="https://images.unsplash.com/photo-..."
                  value={imageUrlInput}
                  onChange={(e) => {
                    setImageUrlInput(e.target.value);
                    setImageFile(null);
                    setImagePreview(e.target.value);
                  }}
                />
              </div>
            </div>

            {imagePreview && (
              <div style={{ position: 'relative', height: '140px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)', marginTop: '8px' }}>
                <ImageWithFallback src={resolveImageUrl(imagePreview)} alt="Image Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} referrerPolicy="no-referrer" />
                <button
                  type="button"
                  onClick={() => { setImageFile(null); setImagePreview(''); setImageUrlInput(''); }}
                  style={{
                    position: 'absolute',
                    top: '8px', right: '8px',
                    backgroundColor: 'rgba(15, 23, 42, 0.75)',
                    color: 'white', border: 'none',
                    borderRadius: '50%',
                    width: '24px', height: '24px',
                    cursor: 'pointer', fontSize: '11px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'background-color 0.2s'
                  }}
                  title="Remove Image"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          {/* Active status configuration */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              backgroundColor: 'var(--bg-app)',
              borderRadius: '10px',
              border: '1px solid var(--border-color)',
              marginTop: '8px'
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '13.5px', fontWeight: '600', color: 'var(--text-primary)' }}>Visible on Live Website</span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Enable to publish this banner on the storefront.</span>
            </div>
            <label style={{ position: 'relative', display: 'inline-block', width: '44px', height: '24px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                style={{ opacity: 0, width: 0, height: 0 }}
              />
              <span style={{ position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: isActive ? 'var(--success)' : 'rgba(148, 163, 184, 0.3)', transition: 'all 0.3s ease', borderRadius: '24px' }} />
              <span style={{ position: 'absolute', content: '""', height: '18px', width: '18px', left: isActive ? '23px' : '3px', bottom: '3px', backgroundColor: '#ffffff', transition: 'all 0.3s ease', borderRadius: '50%', boxShadow: 'var(--shadow-sm)' }} />
            </label>
          </div>

        </form>
      </Drawer>

    </div>
  );
};

export default Banners;
