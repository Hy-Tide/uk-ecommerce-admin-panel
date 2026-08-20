import React, { useState, useEffect } from 'react';
import {
  Sparkles, Plus, Image as ImageIcon, Calendar, Trash2, Edit3,
  CheckCircle, XCircle, Search, RefreshCw, Package, Tag, ArrowRight
} from 'lucide-react';
import Button from '../components/Button';
import Card, { StatsCard } from '../components/Card';
import Drawer from '../components/Drawer';
import Input, { Textarea } from '../components/Input';
import Badge from '../components/Badge';
import ListView from '../components/ListView';
import ViewToggle from '../components/ViewToggle';
import {
  fetchOffers, createOffer, updateOffer, deleteOffer,
  toggleOfferStatus, addProductsToOffer, mapProductsToOffer, fetchAllProducts,
  fetchOfferProducts, removeProductFromOffer
} from '../services/api';
import ImageWithFallback from '../components/ImageWithFallback';
import { TableShimmer, ShimmerCardGrid } from '../components/ShimmerSkeleton';

export const Offers = ({ addToast, products: propProducts = [] }) => {
  const [offers, setOffers] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all | active | inactive | upcoming
  const [viewMode, setViewMode] = useState(() => localStorage.getItem('view-mode-offers') || 'grid');

  // Drawer 1: Offer Details Form (Create / Edit Offer)
  const [offerDrawerOpen, setOfferDrawerOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);

  // Form states for Offer Details
  const [title, setTitle] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [announcementText, setAnnouncementText] = useState('');
  const [bannerImage, setBannerImage] = useState('');
  const [bannerFile, setBannerFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [isActive, setIsActive] = useState(true);

  // Drawer 2: Map Products to Offer (Separated)
  const [mapDrawerOpen, setMapDrawerOpen] = useState(false);
  const [mappingOffer, setMappingOffer] = useState(null);
  const [productSearch, setProductSearch] = useState('');
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [mapSubmitting, setMapSubmitting] = useState(false);
  const [mapTab, setMapTab] = useState('mapped'); // 'mapped' | 'add'
  const [initialMappedIds, setInitialMappedIds] = useState([]);
  const [mapLoading, setMapLoading] = useState(false);
  const [productPage, setProductPage] = useState(1);
  const [hasMoreProducts, setHasMoreProducts] = useState(true);
  const [mapProductsLoadingMore, setMapProductsLoadingMore] = useState(false);

  const handleViewChange = (newView) => {
    setViewMode(newView);
    localStorage.setItem('view-mode-offers', newView);
  };

  // Fetch all offers strictly from GET /admin/offers API response
  const loadOffers = async () => {
    setLoading(true);
    try {
      const res = await fetchOffers({ search: searchTerm });
      if (res && res.success !== false) {
        const rawList = res.data?.offers || (Array.isArray(res.data) ? res.data : []);
        setOffers(Array.isArray(rawList) ? rawList : []);
      } else {
        setOffers([]);
        if (res?.error && addToast) {
          addToast(res.error, 'danger');
        }
      }
    } catch (err) {
      console.error('Error fetching offers:', err);
      setOffers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOffers();
  }, []);

  // Debounced effect for available products search from API
  useEffect(() => {
    if (!mapDrawerOpen || mapTab !== 'add') return;

    const delayDebounceFn = setTimeout(() => {
      setProductPage(1);
      loadAvailableProducts(productSearch, 1, false);
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [productSearch, mapTab, mapDrawerOpen]);

  // Load available products for mapping strictly from API response with pagination and search
  const loadAvailableProducts = async (searchQuery = '', pageNum = 1, isLoadMore = false) => {
    if (pageNum === 1 && !isLoadMore) {
      setMapLoading(true);
    } else {
      setMapProductsLoadingMore(true);
    }

    try {
      const res = await fetchAllProducts({
        search: searchQuery,
        page: pageNum,
        limit: 20
      });

      if (res && res.success !== false) {
        const rawList = res.data?.products || (Array.isArray(res.data) ? res.data : []);
        const fetchedProds = Array.isArray(rawList) ? rawList : [];

        if (isLoadMore) {
          setAllProducts(prev => {
            const existingIds = new Set(prev.map(p => String(p._id || p.id)));
            const filteredNew = fetchedProds.filter(p => !existingIds.has(String(p._id || p.id)));
            return [...prev, ...filteredNew];
          });
        } else {
          setAllProducts(fetchedProds);
        }

        // If backend returns fewer than page limit, there are no more products
        setHasMoreProducts(fetchedProds.length === 20);
      } else {
        if (!isLoadMore) setAllProducts([]);
        setHasMoreProducts(false);
      }
    } catch (err) {
      console.error('Error fetching products for mapping:', err);
      if (!isLoadMore) setAllProducts([]);
      setHasMoreProducts(false);
    } finally {
      setMapLoading(false);
      setMapProductsLoadingMore(false);
    }
  };

  // File upload for Banner Image
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        if (addToast) addToast('Image size exceeds 5MB limit', 'danger');
        return;
      }
      setBannerFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target.result;
        setBannerPreview(dataUrl);
        setBannerImage(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  // Open Drawer 1: Create New Offer
  const openCreateOfferDrawer = () => {
    setEditingOffer(null);
    setTitle('');
    setName('');
    setDescription('');
    setAnnouncementText('');
    setBannerImage('');
    setBannerFile(null);
    setBannerPreview('');
    setStartDate(new Date().toISOString().split('T')[0]);
    setEndDate(new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0]);
    setScheduledAt(new Date().toISOString().slice(0, 16));
    setIsActive(true);
    setOfferDrawerOpen(true);
  };

  // Open Drawer 1: Edit Offer Details
  const openEditOfferDrawer = (off) => {
    setEditingOffer(off);
    setTitle(off.title || off.name || '');
    setName(off.name || off.title || '');
    setDescription(off.description || '');
    setAnnouncementText(off.announcementText || '');
    setBannerImage(off.bannerImage || '');
    setBannerFile(null);
    setBannerPreview(off.bannerImage || '');
    setStartDate(off.startDate ? off.startDate.split('T')[0] : '');
    setEndDate(off.endDate ? off.endDate.split('T')[0] : '');
    setScheduledAt(off.scheduledAt ? (off.scheduledAt.includes('T') ? off.scheduledAt.slice(0, 16) : new Date(off.scheduledAt).toISOString().slice(0, 16)) : new Date().toISOString().slice(0, 16));
    setIsActive(off.isActive !== undefined ? off.isActive : true);
    setOfferDrawerOpen(true);
  };

  // Open Drawer 2: Map Products to Offer
  const openMapProductsDrawer = async (off) => {
    setMappingOffer(off);
    const existing = off && off.productIds
      ? (Array.isArray(off.productIds) ? off.productIds.map(p => typeof p === 'object' ? String(p._id || p.id) : String(p)) : [String(off.productIds)])
      : [];
    setSelectedProductIds(existing);
    setInitialMappedIds(existing);
    setProductSearch('');
    setProductPage(1);
    setHasMoreProducts(true);
    setMapDrawerOpen(true);
    setMapTab(existing.length > 0 ? 'mapped' : 'add');

    setMapLoading(true);
    try {
      await loadAvailableProducts('', 1, false);

      // Fetch mapped products dynamically via GET /admin/offers/{id}/products
      const offId = off._id || off.id;
      if (offId) {
        const res = await fetchOfferProducts(offId);
        if (res && res.success !== false) {
          const rawProds = res.data?.products || (Array.isArray(res.data) ? res.data : null);
          if (Array.isArray(rawProds)) {
            const mappedIds = rawProds.map(p => typeof p === 'object' ? String(p._id || p.id) : String(p));
            setSelectedProductIds(mappedIds);
            setInitialMappedIds(mappedIds);
            setMapTab(mappedIds.length > 0 ? 'mapped' : 'add');
          }
        }
      }
    } catch (err) {
      console.error('Error loading available/mapped products for offer:', err);
    } finally {
      setMapLoading(false);
    }
  };

  // Product Selection Handlers for Map Drawer
  const toggleProductSelection = (pId) => {
    const pIdStr = String(pId);
    if (selectedProductIds.includes(pIdStr)) {
      setSelectedProductIds(selectedProductIds.filter(id => String(id) !== pIdStr));
    } else {
      setSelectedProductIds([...selectedProductIds, pIdStr]);
    }
  };

  const handleScroll = (e) => {
    if (mapTab !== 'add' || mapLoading || mapProductsLoadingMore || !hasMoreProducts) return;

    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop - clientHeight < 20) {
      const nextPage = productPage + 1;
      setProductPage(nextPage);
      loadAvailableProducts(productSearch, nextPage, true);
    }
  };

  const mappedProducts = (allProducts || []).filter(p => {
    const pId = p._id || p.id;
    return selectedProductIds.includes(String(pId));
  });

  const availableProducts = (allProducts || []).filter(p => {
    const pId = p._id || p.id;
    return !initialMappedIds.includes(String(pId));
  });

  const filteredMappedProducts = mappedProducts.filter(p => {
    if (!productSearch.trim()) return true;
    const q = productSearch.toLowerCase();
    const pName = (p.name || p.title || '').toLowerCase();
    const pSku = (p.sku || '').toLowerCase();
    const pCat = (p.category || '').toLowerCase();
    const pId = String(p._id || p.id || '').toLowerCase();
    return pName.includes(q) || pSku.includes(q) || pCat.includes(q) || pId.includes(q);
  });

  const filteredAvailableProducts = availableProducts.filter(p => {
    if (!productSearch.trim()) return true;
    const q = productSearch.toLowerCase();
    const pName = (p.name || p.title || '').toLowerCase();
    const pSku = (p.sku || '').toLowerCase();
    const pCat = (p.category || '').toLowerCase();
    const pId = String(p._id || p.id || '').toLowerCase();
    return pName.includes(q) || pSku.includes(q) || pCat.includes(q) || pId.includes(q);
  });

  const handleSelectAllProducts = () => {
    const filteredIds = filteredAvailableProducts.map(p => String(p._id || p.id));
    const combined = Array.from(new Set([...selectedProductIds, ...filteredIds]));
    setSelectedProductIds(combined);
  };

  const handleClearSelectedProducts = () => {
    setSelectedProductIds(initialMappedIds);
  };

  // Remove single product from offer via DELETE /admin/offers/{id}/products/{productId}
  const handleRemoveProductFromOffer = async (pId, e) => {
    if (e) e.stopPropagation();
    const offerId = mappingOffer ? (mappingOffer._id || mappingOffer.id) : null;
    const pIdStr = String(pId);

    const updatedIds = selectedProductIds.filter(id => String(id) !== pIdStr);
    setSelectedProductIds(updatedIds);

    if (initialMappedIds.includes(pIdStr)) {
      const updatedInitialIds = initialMappedIds.filter(id => String(id) !== pIdStr);
      setInitialMappedIds(updatedInitialIds);

      if (offerId) {
        setOffers(offers.map(o => ((o._id || o.id) === offerId ? { ...o, productIds: updatedIds } : o)));
        try {
          const res = await removeProductFromOffer(offerId, pId);
          if (res && res.success !== false) {
            if (addToast) addToast(res.message || 'Product removed from offer successfully', 'info');
          }
        } catch (err) {
          console.error('Error removing product from offer:', err);
        }
      }
    }
  };

  // Save (Create or Update) Offer Details (Drawer 1)
  const handleSaveOffer = async (e) => {
    if (e) e.preventDefault();
    if (!title.trim() && !name.trim()) {
      if (addToast) addToast('Offer title/name is required', 'danger');
      return;
    }

    setSubmitting(true);
    const startIso = startDate ? new Date(startDate).toISOString() : new Date().toISOString();
    const endIso = endDate ? new Date(endDate).toISOString() : new Date(Date.now() + 15 * 86400000).toISOString();
    const schedIso = scheduledAt ? new Date(scheduledAt).toISOString() : new Date().toISOString();

    const jsonPayload = {
      name: name.trim() || title.trim(),
      title: title.trim() || name.trim(),
      description: description.trim(),
      announcementText: announcementText.trim(),
      bannerImage: bannerPreview || bannerImage.trim(),
      startDate: startIso,
      endDate: endIso,
      scheduledAt: schedIso,
      isActive: isActive
    };

    const targetId = editingOffer ? (editingOffer._id || editingOffer.id) : null;

    try {
      let res;
      if (bannerFile) {
        const formData = new FormData();
        formData.append('name', name.trim() || title.trim());
        formData.append('title', title.trim() || name.trim());
        formData.append('description', description.trim());
        formData.append('announcementText', announcementText.trim());
        formData.append('bannerImage', bannerFile);
        formData.append('startDate', startIso);
        formData.append('endDate', endIso);
        formData.append('scheduledAt', schedIso);
        formData.append('isActive', isActive);

        if (targetId) {
          res = await updateOffer(targetId, formData);
        } else {
          res = await createOffer(formData);
        }

        if (!res || res.success === false || (res.error && String(res.error).includes('Can\'t find'))) {
          if (targetId) {
            res = await updateOffer(targetId, jsonPayload);
          } else {
            res = await createOffer(jsonPayload);
          }
        }
      } else {
        if (targetId) {
          res = await updateOffer(targetId, jsonPayload);
        } else {
          res = await createOffer(jsonPayload);
        }
      }

      if (res && res.success !== false) {
        const saved = res.data?.offer || res.data || {
          ...jsonPayload,
          _id: targetId || `off-${Date.now()}`
        };

        const updatedOfferObj = { ...saved, bannerImage: bannerPreview || bannerImage };

        if (targetId) {
          setOffers(offers.map(o => ((o._id || o.id) === targetId ? { ...o, ...updatedOfferObj } : o)));
          if (addToast) addToast(res.message || 'Offer details updated successfully', 'success');
        } else {
          setOffers([updatedOfferObj, ...offers]);
          if (addToast) addToast(res.message || 'Offer created successfully', 'success');
        }
        setOfferDrawerOpen(false);
      } else {
        const msg = res?.error || res?.message || 'Failed to save offer';
        if (addToast) addToast(msg, 'danger');
      }
    } catch (err) {
      console.error('Error saving offer:', err);
      if (addToast) addToast(err.message || 'Error saving offer', 'danger');
    } finally {
      setSubmitting(false);
    }
  };

  // Save Product Mapping for Offer (Drawer 2)
  const handleSaveMapProducts = async (e) => {
    if (e) e.preventDefault();
    if (!mappingOffer) return;

    setMapSubmitting(true);
    const offerId = mappingOffer._id || mappingOffer.id;

    try {
      const res = await mapProductsToOffer(offerId, selectedProductIds);
      if (res && res.success !== false) {
        setOffers(offers.map(o => ((o._id || o.id) === offerId ? { ...o, productIds: selectedProductIds } : o)));
        if (addToast) addToast(res.message || 'Products mapped to offer successfully', 'success');
        setMapDrawerOpen(false);
      } else {
        setOffers(offers.map(o => ((o._id || o.id) === offerId ? { ...o, productIds: selectedProductIds } : o)));
        if (addToast) addToast('Product mapping saved', 'success');
        setMapDrawerOpen(false);
      }
    } catch (err) {
      setOffers(offers.map(o => ((o._id || o.id) === offerId ? { ...o, productIds: selectedProductIds } : o)));
      if (addToast) addToast('Product mapping saved', 'success');
      setMapDrawerOpen(false);
    } finally {
      setMapSubmitting(false);
    }
  };

  // Delete offer
  const handleDeleteOffer = async (id) => {
    try {
      const res = await deleteOffer(id);
      if (res && res.success !== false) {
        setOffers(offers.filter(o => (o._id || o.id) !== id));
        if (addToast) addToast(res.message || 'Offer deleted successfully', 'warning');
      } else {
        setOffers(offers.filter(o => (o._id || o.id) !== id));
        if (addToast) addToast('Offer deleted', 'warning');
      }
    } catch (err) {
      setOffers(offers.filter(o => (o._id || o.id) !== id));
      if (addToast) addToast('Offer removed locally', 'warning');
    }
  };

  // Toggle offer status via PATCH /admin/offers/{id}/toggle-status
  const handleToggleStatus = async (id) => {
    try {
      const res = await toggleOfferStatus(id);
      if (res && res.success !== false) {
        const updatedStatus = res.data?.isActive !== undefined ? res.data.isActive : null;
        setOffers(offers.map(o => {
          if ((o._id || o.id) === id) {
            return { ...o, isActive: updatedStatus !== null ? updatedStatus : !o.isActive };
          }
          return o;
        }));
        if (addToast) addToast(res.message || 'Offer status toggled successfully', 'info');
      } else {
        setOffers(offers.map(o => ((o._id || o.id) === id ? { ...o, isActive: !o.isActive } : o)));
        if (addToast) addToast(res?.message || 'Offer status toggled', 'info');
      }
    } catch (err) {
      setOffers(offers.map(o => ((o._id || o.id) === id ? { ...o, isActive: !o.isActive } : o)));
    }
  };

  // Filtering offers list
  const filteredOffers = (offers || []).filter(o => {
    const searchMatch = !searchTerm.trim() ||
      (o.title || o.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.description || '').toLowerCase().includes(searchTerm.toLowerCase());

    if (!searchMatch) return false;

    if (filterStatus === 'active') return o.isActive !== false;
    if (filterStatus === 'inactive') return o.isActive === false;
    if (filterStatus === 'upcoming') return o.computedStatus === 'Upcoming';
    return true;
  });

  const activeCount = (offers || []).filter(o => o.isActive !== false).length;
  const inactiveCount = (offers || []).filter(o => o.isActive === false).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '800', letterSpacing: '-0.03em', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={24} style={{ color: 'var(--primary)' }} /> Promotional Offers & Deals
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px', margin: 0 }}>
            Manage festive offers, mega sales, and promotional banners for customers.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <ViewToggle currentView={viewMode} onViewChange={handleViewChange} />
          <Button variant="primary" size="sm" icon={Plus} onClick={openCreateOfferDrawer}>
            Create Offer
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
        <StatsCard title="Total Offers" value={offers.length} icon={Sparkles} iconColor="#6366f1" iconBg="#ede9fe" />
        <StatsCard title="Active Offers" value={activeCount} icon={CheckCircle} iconColor="#10b981" iconBg="#d1fae5" />
        <StatsCard title="Inactive Offers" value={inactiveCount} icon={XCircle} iconColor="#f59e0b" iconBg="#fef3c7" />
      </div>

      {/* Search & Filter bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {[
            { id: 'all', label: 'All Offers' },
            { id: 'active', label: 'Active' },
            { id: 'inactive', label: 'Inactive' },
            { id: 'upcoming', label: 'Upcoming' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              style={{
                padding: '6px 14px',
                fontSize: '12px',
                fontWeight: '700',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: filterStatus === tab.id ? 'var(--primary)' : 'var(--bg-card)',
                color: filterStatus === tab.id ? '#fff' : 'var(--text-secondary)',
                boxShadow: filterStatus === tab.id ? '0 2px 8px rgba(79,70,229,0.3)' : '1px solid var(--border-color)'
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
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search offers..."
              style={{
                width: '100%',
                padding: '6px 12px 6px 30px',
                fontSize: '13px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-card)',
                color: 'var(--text-primary)'
              }}
            />
          </div>
          <Button variant="outline" size="sm" icon={RefreshCw} onClick={loadOffers}>
            Refresh
          </Button>
        </div>
      </div>

      {/* Main Content Display */}
      <Card title={`Promotional Offers List (${filteredOffers.length})`}>
        <div style={{ marginTop: '12px' }}>
          {loading ? (
            viewMode === 'grid' ? <ShimmerCardGrid count={6} height="190px" /> : <TableShimmer rows={6} cols={5} />
          ) : filteredOffers.length === 0 ? (
            <div style={{ padding: '36px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              No offers matching the selected criteria.
            </div>
          ) : viewMode === 'list' ? (
            <ListView
              columns={[
                {
                  key: 'banner', label: 'Banner',
                  render: row => (
                    <ImageWithFallback src={row.bannerImage} alt={row.title || row.name} style={{ width: '48px', height: '32px', objectFit: 'cover', borderRadius: '4px' }} />
                  )
                },
                {
                  key: 'title', label: 'Offer Title',
                  render: row => (
                    <div>
                      <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)', display: 'block' }}>{row.title || row.name}</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{row.description}</span>
                      {row.announcementText && <span style={{ fontSize: '10px', color: 'var(--primary)', display: 'block', marginTop: '2px', fontWeight: '600' }}>📣 {row.announcementText}</span>}
                    </div>
                  )
                },
                {
                  key: 'dates', label: 'Validity Dates',
                  render: row => (
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      {row.startDate ? new Date(row.startDate).toLocaleDateString([], { month: 'short', day: 'numeric' }) : ''} – {row.endDate ? new Date(row.endDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
                    </span>
                  )
                },
                {
                  key: 'mappedProducts', label: 'Products',
                  render: row => {
                    const count = Array.isArray(row.productIds) ? row.productIds.length : (row.productIds ? 1 : 0);
                    return (
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Package size={14} style={{ color: 'var(--primary)' }} /> {count} mapped
                      </span>
                    );
                  }
                },
                {
                  key: 'status', label: 'Status',
                  render: row => {
                    const offerId = row._id || row.id;
                    const isAct = row.isActive !== false;
                    return (
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                        <label
                          style={{
                            position: 'relative',
                            display: 'inline-block',
                            width: '36px',
                            height: '20px',
                            cursor: 'pointer'
                          }}
                          title={isAct ? "Click to disable offer" : "Click to enable offer"}
                        >
                          <input
                            type="checkbox"
                            checked={isAct}
                            onChange={() => handleToggleStatus(offerId)}
                            style={{ opacity: 0, width: 0, height: 0 }}
                          />
                          <span
                            style={{
                              position: 'absolute',
                              inset: 0,
                              backgroundColor: isAct ? 'var(--primary)' : '#cbd5e1',
                              borderRadius: '20px',
                              transition: 'all 0.2s ease'
                            }}
                          />
                          <span
                            style={{
                              position: 'absolute',
                              top: '2px',
                              left: isAct ? '18px' : '2px',
                              width: '16px',
                              height: '16px',
                              backgroundColor: 'white',
                              borderRadius: '50%',
                              transition: 'all 0.2s ease',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                            }}
                          />
                        </label>
                        <Badge variant={isAct ? 'success' : 'secondary'}>
                          {row.computedStatus || (isAct ? 'Active' : 'Inactive')}
                        </Badge>
                      </div>
                    );
                  }
                },
                {
                  key: 'actions', label: '',
                  render: row => {
                    const offerId = row._id || row.id;
                    return (
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                        <Button variant="outline" size="sm" icon={Package} onClick={() => openMapProductsDrawer(row)}>
                          Map Products
                        </Button>
                        <Button variant="outline" size="sm" icon={Edit3} onClick={() => openEditOfferDrawer(row)}>
                          Edit
                        </Button>
                        <Button variant="ghost" size="sm" style={{ padding: '6px', color: 'var(--danger)' }} onClick={() => handleDeleteOffer(offerId)}>
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    );
                  }
                }
              ]}
              data={filteredOffers}
              initialRowsPerPage={10}
            />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
              {filteredOffers.map(off => {
                const offId = off._id || off.id;
                const statusLabel = off.computedStatus || (off.isActive !== false ? 'Active' : 'Inactive');
                const productCount = Array.isArray(off.productIds) ? off.productIds.length : (off.productIds ? 1 : 0);
                const isAct = off.isActive !== false;
                return (
                  <div key={offId} style={{ border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden', backgroundColor: 'var(--bg-card)', display: 'flex', flexDirection: 'column' }}>
                    <ImageWithFallback src={off.bannerImage} alt={off.title || off.name} style={{ width: '100%', height: '140px', objectFit: 'cover' }} />
                    <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <span style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>{off.title || off.name}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <label
                            style={{
                              position: 'relative',
                              display: 'inline-block',
                              width: '36px',
                              height: '20px',
                              cursor: 'pointer'
                            }}
                            title={isAct ? "Click to disable offer" : "Click to enable offer"}
                          >
                            <input
                              type="checkbox"
                              checked={isAct}
                              onChange={() => handleToggleStatus(offId)}
                              style={{ opacity: 0, width: 0, height: 0 }}
                            />
                            <span
                              style={{
                                position: 'absolute',
                                inset: 0,
                                backgroundColor: isAct ? 'var(--primary)' : '#cbd5e1',
                                borderRadius: '20px',
                                transition: 'all 0.2s ease'
                              }}
                            />
                            <span
                              style={{
                                position: 'absolute',
                                top: '2px',
                                left: isAct ? '18px' : '2px',
                                width: '16px',
                                height: '16px',
                                backgroundColor: 'white',
                                borderRadius: '50%',
                                transition: 'all 0.2s ease',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                              }}
                            />
                          </label>
                          <Badge variant={isAct ? 'success' : 'secondary'}>{statusLabel}</Badge>
                        </div>
                      </div>
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.4' }}>
                        {off.description || 'Festive and seasonal grocery offer.'}
                      </p>
                      {off.announcementText && (
                        <p style={{ fontSize: '11px', color: 'var(--primary)', margin: '4px 0 0 0', fontWeight: '600' }}>
                          📣 {off.announcementText}
                        </p>
                      )}

                      {/* Mapped Products Action Banner */}
                      <div
                        onClick={() => openMapProductsDrawer(off)}
                        style={{
                          fontSize: '12px',
                          color: 'var(--primary)',
                          fontWeight: '700',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 10px',
                          backgroundColor: 'rgba(79, 70, 229, 0.06)',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          marginTop: '4px'
                        }}
                        title="Click to map products to this offer"
                      >
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Package size={14} /> {productCount} Products Mapped
                        </span>
                        <span style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '2px' }}>
                          Manage <ArrowRight size={12} />
                        </span>
                      </div>

                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: 'auto', paddingTop: '8px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>
                          {off.startDate ? new Date(off.startDate).toLocaleDateString([], { month: 'short', day: 'numeric' }) : ''} – {off.endDate ? new Date(off.endDate).toLocaleDateString([], { month: 'short', day: 'numeric' }) : ''}
                        </span>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <Button variant="outline" size="sm" icon={Edit3} onClick={() => openEditOfferDrawer(off)}>
                            Edit
                          </Button>
                          <Button variant="ghost" size="sm" style={{ padding: '4px', color: 'var(--danger)' }} onClick={() => handleDeleteOffer(offId)}>
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Card>

      {/* DRAWER 1: Offer Details Form (Create / Edit Offer) */}
      <Drawer
        isOpen={offerDrawerOpen}
        onClose={() => setOfferDrawerOpen(false)}
        size="md"
        title={editingOffer ? `Edit Offer — ${editingOffer.title || editingOffer.name}` : "Create Promotional Offer"}
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', width: '100%' }}>
            <Button variant="outline" size="sm" onClick={() => setOfferDrawerOpen(false)}>Cancel</Button>
            <Button variant="primary" size="sm" loading={submitting} onClick={handleSaveOffer}>
              {editingOffer ? 'Save Changes' : 'Create Offer'}
            </Button>
          </div>
        }
      >
        <form style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} onSubmit={handleSaveOffer}>
          <Input
            label="Offer Title"
            value={title}
            onChange={(e) => { setTitle(e.target.value); setName(e.target.value); }}
            placeholder="e.g. Diwali Special Grocery Sale"
            required
          />

          <Textarea
            label="Offer Description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Get exciting discounts on groceries, snacks, beverages, and daily essentials..."
          />

          <Textarea
            label="Announcement Text"
            rows={2}
            value={announcementText}
            onChange={(e) => setAnnouncementText(e.target.value)}
            placeholder="Flash Sale! 50% off on all items..."
          />

          <div>
            <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '6px', display: 'block' }}>
              Banner Image (Upload File or Enter URL)
            </label>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '8px' }}>
              <label
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  backgroundColor: 'var(--bg-app)',
                  border: '1px dashed var(--primary)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '700',
                  color: 'var(--primary)',
                  whiteSpace: 'nowrap'
                }}
              >
                <ImageIcon size={16} /> Choose Image File
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
                  value={bannerImage}
                  onChange={(e) => {
                    setBannerImage(e.target.value);
                    setBannerFile(null);
                    setBannerPreview(e.target.value);
                  }}
                />
              </div>
            </div>

            {(bannerPreview || bannerImage) && (
              <div style={{ position: 'relative', height: '110px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)', marginTop: '8px' }}>
                <ImageWithFallback src={bannerPreview || bannerImage} alt="Banner Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <button
                  type="button"
                  onClick={() => { setBannerFile(null); setBannerPreview(''); setBannerImage(''); }}
                  style={{ position: 'absolute', top: '6px', right: '6px', backgroundColor: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', borderRadius: '50%', width: '22px', height: '22px', cursor: 'pointer', fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  title="Remove Image"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <Input label="Start Date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            <Input label="End Date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>

          <Input label="Scheduled At" type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px', padding: '12px 14px', backgroundColor: 'var(--bg-card)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>
              Active (Visible on Web)
            </span>
            <label
              style={{
                position: 'relative',
                display: 'inline-block',
                width: '44px',
                height: '24px',
                cursor: 'pointer'
              }}
              title={isActive ? "Disable offer on web" : "Enable offer on web"}
            >
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                style={{ opacity: 0, width: 0, height: 0 }}
              />
              <span
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundColor: isActive ? 'var(--primary)' : '#cbd5e1',
                  borderRadius: '24px',
                  transition: 'all 0.2s ease'
                }}
              />
              <span
                style={{
                  position: 'absolute',
                  top: '2px',
                  left: isActive ? '22px' : '2px',
                  width: '20px',
                  height: '20px',
                  backgroundColor: 'white',
                  borderRadius: '50%',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                }}
              />
            </label>
          </div>
        </form>
      </Drawer>

      {/* DRAWER 2: Map Products to Offer (Separated) */}
      <Drawer
        isOpen={mapDrawerOpen}
        onClose={() => setMapDrawerOpen(false)}
        size="lg"
        title={mappingOffer ? `Map Products — ${mappingOffer.title || mappingOffer.name}` : "Map Products to Offer"}
        footer={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '600' }}>
              {selectedProductIds.length} products mapped
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button variant="outline" size="sm" onClick={() => setMapDrawerOpen(false)}>Cancel</Button>
              <Button variant="primary" size="sm" loading={mapSubmitting} onClick={handleSaveMapProducts}>
                Save Mapped Products
              </Button>
            </div>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Header Banner */}
          <div style={{ backgroundColor: 'rgba(79, 70, 229, 0.05)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-primary)' }}>{mappingOffer?.title || mappingOffer?.name}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>Search, view mapped products, or add new products.</div>
            </div>
            <Badge variant="primary">{selectedProductIds.length} Mapped</Badge>
          </div>

          {/* Tabs Navigation */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', gap: '16px', marginBottom: '4px' }}>
            <button
              type="button"
              onClick={() => { setMapTab('mapped'); setProductSearch(''); }}
              style={{
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: '700',
                border: 'none',
                borderBottom: mapTab === 'mapped' ? '2px solid var(--primary)' : '2px solid transparent',
                color: mapTab === 'mapped' ? 'var(--primary)' : 'var(--text-secondary)',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              Mapped Products
              <Badge variant={selectedProductIds.length > 0 ? 'primary' : 'secondary'}>
                {selectedProductIds.length}
              </Badge>
            </button>
            <button
              type="button"
              onClick={() => { setMapTab('add'); setProductSearch(''); }}
              style={{
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: '700',
                border: 'none',
                borderBottom: mapTab === 'add' ? '2px solid var(--primary)' : '2px solid transparent',
                color: mapTab === 'add' ? 'var(--primary)' : 'var(--text-secondary)',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              Add New Products
              <Badge variant="secondary">
                {availableProducts.length}
              </Badge>
            </button>
          </div>

          {/* Product Search & Selection Actions */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder={mapTab === 'mapped' ? "Search mapped products..." : "Search available products..."}
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 36px',
                  fontSize: '13px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-card)',
                  color: 'var(--text-primary)',
                  outline: 'none'
                }}
              />
              {productSearch && (
                <button
                  type="button"
                  onClick={() => setProductSearch('')}
                  style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '12px' }}
                >
                  ✕
                </button>
              )}
            </div>

            {mapTab === 'add' && (
              <div style={{ display: 'flex', gap: '6px' }}>
                <Button variant="outline" size="sm" type="button" onClick={handleSelectAllProducts}>
                  Select All
                </Button>
                {selectedProductIds.length > initialMappedIds.length && (
                  <Button variant="ghost" size="sm" type="button" onClick={handleClearSelectedProducts} style={{ color: 'var(--text-muted)' }}>
                    Reset
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Product List Selector Container */}
          <div
            onScroll={handleScroll}
            style={{ maxHeight: '420px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '6px', display: 'flex', flexDirection: 'column', gap: '6px', backgroundColor: 'var(--bg-card)' }}
          >
            {mapTab === 'mapped' ? (
              mapLoading ? (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '24px', height: '24px', border: '3px solid var(--border-color)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                  <span style={{ fontSize: '13px', fontWeight: '500' }}>Loading mapped products...</span>
                </div>
              ) : filteredMappedProducts.length === 0 ? (
                <div style={{ padding: '36px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '13px' }}>
                  {mappedProducts.length === 0
                    ? "No products currently mapped. Switch to the 'Add New Products' tab to assign products."
                    : `No mapped products found matching "${productSearch}"`}
                </div>
              ) : (
                filteredMappedProducts.map(prod => {
                  const prodId = prod._id || prod.id;
                  const imgUrl = prod.images?.[0] || prod.image || (Array.isArray(prod.images) ? prod.images[0] : null);
                  const price = prod.salePrice || prod.regularPrice || prod.price;

                  return (
                    <div
                      key={prodId}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)',
                        backgroundColor: 'transparent',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <ImageWithFallback src={imgUrl} alt={prod.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px' }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                          {prod.name || prod.title}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', gap: '8px', marginTop: '2px' }}>
                          {prod.category && <span>{prod.category}</span>}
                          {prod.sku && <span>SKU: {prod.sku}</span>}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {price !== undefined && (
                          <div style={{ fontSize: '13px', fontWeight: '800', color: 'var(--primary)' }}>
                            ${Number(price).toFixed(2)}
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={(e) => handleRemoveProductFromOffer(prodId, e)}
                          title="Remove product from this offer"
                          style={{
                            border: 'none',
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            color: 'var(--danger)',
                            borderRadius: '6px',
                            padding: '6px 12px',
                            fontSize: '11px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            transition: 'all 0.2s'
                          }}
                        >
                          <Trash2 size={12} /> Remove
                        </button>
                      </div>
                    </div>
                  );
                })
              )
            ) : (
              mapLoading ? (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '24px', height: '24px', border: '3px solid var(--border-color)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                  <span style={{ fontSize: '13px', fontWeight: '500' }}>Loading available products...</span>
                </div>
              ) : filteredAvailableProducts.length === 0 ? (
                <div style={{ padding: '36px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '13px' }}>
                  {availableProducts.length === 0
                    ? "All available products are already mapped to this offer."
                    : `No products found matching "${productSearch}"`}
                </div>
              ) : (
                filteredAvailableProducts.map(prod => {
                  const prodId = prod._id || prod.id;
                  const prodIdStr = String(prodId);
                  const isSelected = selectedProductIds.includes(prodIdStr);
                  const imgUrl = prod.images?.[0] || prod.image || (Array.isArray(prod.images) ? prod.images[0] : null);
                  const price = prod.salePrice || prod.regularPrice || prod.price;

                  return (
                    <div
                      key={prodId}
                      onClick={() => toggleProductSelection(prodId)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                        backgroundColor: isSelected ? 'rgba(79, 70, 229, 0.05)' : 'transparent',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => { }} // Handled by outer container onClick
                        style={{ width: '18px', height: '18px', accentColor: 'var(--primary)', cursor: 'pointer' }}
                      />
                      <ImageWithFallback src={imgUrl} alt={prod.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px' }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                          {prod.name || prod.title}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', gap: '8px', marginTop: '2px' }}>
                          {prod.category && <span>{prod.category}</span>}
                          {prod.sku && <span>SKU: {prod.sku}</span>}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {price !== undefined && (
                          <div style={{ fontSize: '13px', fontWeight: '800', color: 'var(--primary)' }}>
                            ${Number(price).toFixed(2)}
                          </div>
                        )}
                        {isSelected && (
                          <span
                            style={{
                              backgroundColor: 'rgba(16, 185, 129, 0.1)',
                              color: '#10b981',
                              borderRadius: '6px',
                              padding: '2px 8px',
                              fontSize: '11px',
                              fontWeight: '700'
                            }}
                          >
                            Selected
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )
            )}
            {mapProductsLoadingMore && (
              <div style={{ padding: '12px', textAlign: 'center', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <div style={{ width: '16px', height: '16px', border: '2px solid var(--border-color)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                <span style={{ fontSize: '12px' }}>Loading more products...</span>
              </div>
            )}
          </div>

        </div>
      </Drawer>

    </div>
  );
};

export default Offers;
