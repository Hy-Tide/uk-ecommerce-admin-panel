import React, { useState, useEffect } from 'react';
import {
  MessageSquare, Star, Plus, Trash2, Edit, CheckCircle, RefreshCw,
  Search, Filter, Info, Eye, EyeOff, User, Sparkles
} from 'lucide-react';
import Button from '../components/Button';
import Card, { StatsCard } from '../components/Card';
import Modal from '../components/Modal';
import Input, { Select, Textarea, Checkbox } from '../components/Input';
import ListView from '../components/ListView';
import GridView from '../components/GridView';
import ViewToggle from '../components/ViewToggle';
import Badge from '../components/Badge';
import Uploader from '../components/Uploader';
import {
  fetchTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial
} from '../services/api';

export const Testimonials = ({ addToast }) => {
  const [testimonials, setTestimonials] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState(() => localStorage.getItem('view-mode-testimonials') || 'list');

  // Create / Edit Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [customerName, setCustomerName] = useState('');
  const [content, setContent] = useState('');
  const [rating, setRating] = useState(5);
  const [imageUrl, setImageUrl] = useState('');
  const [isActive, setIsActive] = useState(true);

  const handleViewChange = (newView) => {
    setViewMode(newView);
    localStorage.setItem('view-mode-testimonials', newView);
  };

  // Load testimonials from GET /admin/testimonials
  const loadTestimonials = async () => {
    setLoading(true);
    const params = {};
    if (searchTerm.trim()) params.search = searchTerm.trim();
    if (statusFilter !== 'all') params.status = statusFilter;

    try {
      const res = await fetchTestimonials(params);
      if (res && res.success !== false) {
        const list = res.data?.testimonials || (Array.isArray(res.data) ? res.data : []);
        if (Array.isArray(list)) {
          setTestimonials(list);
        }
        if (res.data?.meta) {
          setMeta(res.data.meta);
        }
      }
    } catch (err) {
      console.error('Error fetching testimonials:', err);
      if (addToast) addToast('Failed to load customer testimonials', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTestimonials();
  }, [statusFilter]);

  // Handle Search submit / refresh
  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    loadTestimonials();
  };

  // Open modal for New Testimonial
  const handleOpenCreateModal = () => {
    setEditingItem(null);
    setCustomerName('');
    setContent('');
    setRating(5);
    setImageUrl('');
    setIsActive(true);
    setModalOpen(true);
  };

  // Open modal for Edit Testimonial
  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    setCustomerName(item.customerName || item.name || '');
    setContent(item.content || item.testimonial || '');
    setRating(item.rating || 5);
    setImageUrl(item.image_url || item.image || item.avatar || '');
    setIsActive(item.is_active !== false && item.isActive !== false);
    setModalOpen(true);
  };

  // Save Testimonial via POST or PUT /admin/testimonials/{id}
  const handleSaveTestimonial = async (e) => {
    if (e) e.preventDefault();
    if (!customerName.trim()) {
      if (addToast) addToast('Customer name is required', 'danger');
      return;
    }
    if (!content.trim()) {
      if (addToast) addToast('Testimonial content is required', 'danger');
      return;
    }

    setSubmitting(true);
    const payload = {
      customerName: customerName.trim(),
      content: content.trim(),
      rating: Number(rating),
      image_url: imageUrl.trim(),
      is_active: Boolean(isActive)
    };

    try {
      let res;
      if (editingItem) {
        res = await updateTestimonial(editingItem._id || editingItem.id, payload);
      } else {
        res = await createTestimonial(payload);
      }

      if (res && res.success !== false) {
        if (addToast) addToast(res.message || `Testimonial ${editingItem ? 'updated' : 'created'} successfully!`, 'success');
        setModalOpen(false);
        loadTestimonials();
      } else {
        const msg = res?.error || res?.message || 'Failed to save testimonial';
        if (addToast) addToast(msg, 'danger');
      }
    } catch (err) {
      console.error('Error saving testimonial:', err);
      if (addToast) addToast(err.message || 'Error saving testimonial', 'danger');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Testimonial via DELETE /admin/testimonials/{id}
  const handleDeleteTestimonial = async (item) => {
    if (!window.confirm(`Are you sure you want to delete testimonial by "${item.customerName || item.name}"?`)) {
      return;
    }

    try {
      const res = await deleteTestimonial(item._id || item.id);
      if (res && res.success !== false) {
        if (addToast) addToast(res.message || 'Testimonial deleted successfully', 'success');
        loadTestimonials();
      } else {
        const msg = res?.error || res?.message || 'Failed to delete testimonial';
        if (addToast) addToast(msg, 'danger');
      }
    } catch (err) {
      console.error('Error deleting testimonial:', err);
      if (addToast) addToast(err.message || 'Error deleting testimonial', 'danger');
    }
  };

  // Toggle active status
  const handleToggleStatus = async (item) => {
    const nextStatus = !(item.is_active !== false && item.isActive !== false);
    const payload = {
      customerName: item.customerName || item.name || '',
      content: item.content || item.testimonial || '',
      rating: item.rating || 5,
      image_url: item.image_url || item.image || '',
      is_active: nextStatus
    };

    try {
      const res = await updateTestimonial(item._id || item.id, payload);
      if (res && res.success !== false) {
        if (addToast) addToast(`Testimonial status marked as ${nextStatus ? 'Active' : 'Inactive'}`, 'warning');
        loadTestimonials();
      } else {
        if (addToast) addToast('Failed to toggle status', 'danger');
      }
    } catch (err) {
      console.error('Error toggling status:', err);
      if (addToast) addToast(err.message || 'Error toggling status', 'danger');
    }
  };

  // Star Rating renderer helper
  const renderStars = (num) => {
    const r = Math.min(5, Math.max(1, Number(num) || 5));
    return (
      <div style={{ display: 'flex', gap: '2px', color: '#f59e0b', alignItems: 'center' }}>
        {[...Array(5)].map((_, i) => (
          <Star key={i} size={14} fill={i < r ? '#f59e0b' : 'none'} stroke="#f59e0b" />
        ))}
        <span style={{ fontSize: '11px', fontWeight: '700', marginLeft: '4px', color: 'var(--text-secondary)' }}>({r}.0)</span>
      </div>
    );
  };

  const activeCount = testimonials.filter(t => t.is_active !== false && t.isActive !== false).length;
  const avgRating = testimonials.length > 0
    ? (testimonials.reduce((sum, t) => sum + (t.rating || 5), 0) / testimonials.length).toFixed(1)
    : '5.0';

  const testimonialCols = [
    {
      key: 'customerName',
      label: 'Customer Reviewer',
      render: (row) => {
        const img = row.image_url || row.image || row.avatar;
        const name = row.customerName || row.name || 'Customer';
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {img ? (
              <img
                src={img}
                alt={name}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/logo.png';
                  e.target.style.opacity = '0.35';
                  e.target.style.objectFit = 'contain';
                }}
                style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border-color)' }}
              />
            ) : (
              <div style={{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px' }}>
                {name.charAt(0).toUpperCase()}
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '13px' }}>{name}</span>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : 'Verified Customer'}
              </span>
            </div>
          </div>
        );
      }
    },
    {
      key: 'content',
      label: 'Testimonial Review Content',
      render: (row) => (
        <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)', maxWidth: '380px', lineHeight: '1.4' }}>
          "{row.content || row.testimonial}"
        </p>
      )
    },
    {
      key: 'rating',
      label: 'Star Rating',
      render: (row) => renderStars(row.rating)
    },
    {
      key: 'is_active',
      label: 'Status',
      render: (row) => {
        const isAct = row.is_active !== false && row.isActive !== false;
        return <Badge variant={isAct ? 'success' : 'secondary'}>{isAct ? 'Active' : 'Inactive'}</Badge>;
      }
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div style={{ display: 'flex', gap: '6px' }}>
          <Button variant="outline" size="sm" icon={Edit} onClick={() => handleOpenEditModal(row)}>
            Edit
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleToggleStatus(row)}>
            Toggle
          </Button>
          <Button variant="ghost" size="sm" icon={Trash2} style={{ color: 'var(--danger)' }} onClick={() => handleDeleteTestimonial(row)}>
            Delete
          </Button>
        </div>
      )
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '800', letterSpacing: '-0.03em', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MessageSquare size={24} style={{ color: 'var(--primary)' }} /> Customer Testimonials & Reviews
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px', margin: 0 }}>
            Manage customer feedback, star ratings, and active testimonials displayed on the storefront.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <ViewToggle currentView={viewMode} onViewChange={handleViewChange} />
          <Button variant="outline" size="sm" icon={RefreshCw} onClick={loadTestimonials}>
            Refresh
          </Button>
          {/* <Button variant="primary" size="sm" icon={Plus} onClick={handleOpenCreateModal}>
            Add Testimonial
          </Button> */}
        </div>
      </div>

      {/* KPI Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
        <StatsCard title="Total Testimonials" value={testimonials.length} icon={MessageSquare} iconColor="#6366f1" iconBg="#ede9fe" />
        <StatsCard title="Active Storefront Reviews" value={activeCount} icon={CheckCircle} iconColor="#10b981" iconBg="#d1fae5" />
        <StatsCard title="Average Star Rating" value={`${avgRating} ★`} icon={Star} iconColor="#f59e0b" iconBg="#fef3c7" />
      </div>

      {/* Search & Filter Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        {/* <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {[
            { id: 'all', label: 'All Reviews' },
            { id: 'active', label: 'Active Only' },
            { id: 'inactive', label: 'Inactive' }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setStatusFilter(t.id)}
              style={{
                padding: '6px 14px',
                fontSize: '12px',
                fontWeight: '700',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: statusFilter === t.id ? 'var(--primary)' : 'var(--bg-card)',
                color: statusFilter === t.id ? '#fff' : 'var(--text-secondary)',
                boxShadow: statusFilter === t.id ? '0 2px 8px rgba(79,70,229,0.3)' : '1px solid var(--border-color)'
              }}
            >
              {t.label}
            </button>
          ))}
        </div> */}

        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: '240px' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search customer, content..."
              style={{
                width: '100%',
                padding: '6px 12px 6px 30px',
                fontSize: '12px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-card)',
                color: 'var(--text-primary)'
              }}
            />
          </div>
          <Button variant="outline" size="sm" type="submit">
            Search
          </Button>
        </form>
      </div>

      {/* Main Listing View */}
      <Card title={`Testimonials Ledger (${testimonials.length})`}>
        <div style={{ marginTop: '12px' }}>
          {loading ? (
            <div style={{ padding: '36px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading customer testimonials...</div>
          ) : testimonials.length === 0 ? (
            <div style={{ padding: '36px', textAlign: 'center', color: 'var(--text-secondary)' }}>No customer testimonials found.</div>
          ) : viewMode === 'list' ? (
            <ListView
              columns={testimonialCols}
              data={testimonials}
              initialRowsPerPage={10}
            />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
              {testimonials.map(item => {
                const isAct = item.is_active !== false && item.isActive !== false;
                return (
                  <div key={item._id || item.id} style={{ border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px', backgroundColor: 'var(--bg-card)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {item.image_url || item.image ? (
                          <img
                            src={item.image_url || item.image}
                            alt={item.customerName || item.name}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = '/logo.png';
                              e.target.style.opacity = '0.35';
                              e.target.style.objectFit = 'contain';
                            }}
                            style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                          />
                        ) : (
                          <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {(item.customerName || item.name || 'C').charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', display: 'block' }}>
                            {item.customerName || item.name}
                          </span>
                          {renderStars(item.rating)}
                        </div>
                      </div>
                      <Badge variant={isAct ? 'success' : 'secondary'}>{isAct ? 'Active' : 'Inactive'}</Badge>
                    </div>

                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.4' }}>
                      "{item.content || item.testimonial}"
                    </p>

                    <div style={{ marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                      <Button variant="outline" size="sm" icon={Edit} onClick={() => handleOpenEditModal(item)}>Edit</Button>
                      <Button variant="ghost" size="sm" icon={Trash2} style={{ color: 'var(--danger)' }} onClick={() => handleDeleteTestimonial(item)}>Delete</Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Card>

      {/* Create / Edit Testimonial Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingItem ? 'Edit Testimonial' : 'Create New Customer Testimonial'}
        footer={
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button variant="outline" size="sm" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary" size="sm" icon={CheckCircle} loading={submitting} onClick={handleSaveTestimonial}>
              {editingItem ? 'Update Testimonial' : 'Publish Testimonial'}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSaveTestimonial} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Input
            label="Customer Name"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="e.g. Sarah Jenkins"
            required
          />

          <Select
            label="Star Rating"
            value={rating}
            onChange={(e) => setRating(e.target.value)}
            options={[
              { label: '5 Stars (★★★★★) - Excellent', value: 5 },
              { label: '4 Stars (★★★★☆) - Good', value: 4 },
              { label: '3 Stars (★★★☆☆) - Average', value: 3 },
              { label: '2 Stars (★★☆☆☆) - Poor', value: 2 },
              { label: '1 Star (★☆☆☆☆) - Bad', value: 1 }
            ]}
          />

          <Textarea
            label="Testimonial Review Content"
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write customer review..."
            required
          />

          <Uploader
            label="Customer Photo / Avatar Image"
            maxFiles={1}
            initialImages={imageUrl ? [imageUrl] : []}
            onFilesChanged={(urls) => setImageUrl(urls[0] || '')}
          />

          <Input
            label="Or Enter Image URL"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://images.unsplash.com/..."
          />

          <div style={{ marginTop: '6px' }}>
            <Checkbox
              label="Status (Active for storefront display)"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
          </div>
        </form>
      </Modal>

    </div>
  );
};

export default Testimonials;
