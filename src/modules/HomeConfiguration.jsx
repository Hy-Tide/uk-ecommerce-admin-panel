import { useState, useEffect, useMemo } from 'react';
import {
  GripVertical, Save, Eye, Plus, Trash2, Search, ArrowUp, ArrowDown,
  FileText, ChevronRight, ChevronLeft, ToggleLeft, ToggleRight, X, AlertCircle
} from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';
import Input, { Select, Textarea, Checkbox } from '../components/Input';
import Uploader from '../components/Uploader';
import Modal from '../components/Modal';

const generateUniqueId = (prefix = 'id') => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const HomeConfiguration = ({
  products: initialProducts = [],
  categories: initialCategories = [],
  brands: initialBrands = [],
  recipes: initialRecipes = [],
  cmsData = {},
  setCmsData,
  addToast,
  auditLogs = [],
  setAuditLogs
}) => {
  // Use real data states initialized with the props (fallback/seed data)
  const [products, setProducts] = useState(initialProducts);
  const [categories, setCategories] = useState(initialCategories);
  const [brands, setBrands] = useState(initialBrands);
  const [recipes, setRecipes] = useState(initialRecipes);

  // Try loading sections from server or fallback to state
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSectionId, setSelectedSectionId] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Create Section Modal State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newSectionType, setNewSectionType] = useState('Hero Banner');
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [newSectionSubtitle, setNewSectionSubtitle] = useState('');
  const [newSectionDataSource, setNewSectionDataSource] = useState('Manual');
  const [newSectionProductLimit, setNewSectionProductLimit] = useState(8);
  const [newSectionButtonText, setNewSectionButtonText] = useState('');
  const [newSectionButtonUrl, setNewSectionButtonUrl] = useState('');

  const sectionTypesList = [
    'Hero Banner', 'Service Features', 'Offer Banners', 'Shop by Categories',
    'Today\'s Best Deals', 'Limited Products', 'Recommended Products', 'New Arrivals',
    'Recently Viewed', 'Subscription Banner', 'Shop by Brands', 'Popular Recipes',
    'Testimonials', 'Why Choose Us', 'Newsletter'
  ];

  // Selector pagination & search state
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Initialize layout sections and fetch live data
  useEffect(() => {
    const loadHomeConfiguration = async () => {
      setLoading(true);
      try {
        const { fetchHomeConfigs } = await import('../services/api');
        const res = await fetchHomeConfigs();

        let sectionsArray = null;
        if (res && res.success) {
          if (Array.isArray(res.data)) {
            sectionsArray = res.data;
          } else if (res.data && Array.isArray(res.data.sections)) {
            sectionsArray = res.data.sections;
          } else if (res.data && Array.isArray(res.data.data)) {
            sectionsArray = res.data.data;
          }
        }

        if (sectionsArray !== null) {
          // Normalize _id to id
          const normalized = sectionsArray.map(s => ({ ...s, id: s.id || s._id }));
          // Sort by display order
          const sorted = [...normalized].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
          setSections(sorted);
          if (sorted.length > 0) setSelectedSectionId(sorted[0].id);
        } else {
          // Fallback to cmsData seeds if API fails or format is unrecognized
          const seedSections = cmsData.homeSections || [];
          setSections(seedSections);
          if (seedSections.length > 0) setSelectedSectionId(seedSections[0].id);
        }
      } catch (err) {
        console.error('Error fetching home configuration:', err);
        const seedSections = cmsData.homeSections || [];
        setSections(seedSections);
        if (seedSections.length > 0) setSelectedSectionId(seedSections[0].id);
      } finally {
        setLoading(false);
      }
    };

    loadHomeConfiguration();
  }, [cmsData.homeSections]);

  // Fetch real data on mount from the REST API endpoints to populate options and checklists
  useEffect(() => {
    const fetchRealData = async () => {
      try {
        const { getData } = await import('../services/api');
        const queryParams = { limit: 100 };

        // 1. Fetch categories & subcategories
        let catRes = await getData('admin/categories', queryParams);
        let catList = catRes?.data?.categories || (Array.isArray(catRes?.data) ? catRes.data : []);


        let subRes = await getData('admin/subcategories', queryParams);
        let subList = subRes?.data?.subCategories || subRes?.data?.subcategories || (Array.isArray(subRes?.data) ? subRes.data : []);

        if (Array.isArray(catList) && catList.length > 0) {
          const formattedCats = catList.map(c => ({
            id: c._id || c.id,
            name: c.name,
            parent: null,
            icon: c.icon || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=100'
          }));

          const formattedSubs = Array.isArray(subList) ? subList.map(s => {
            const parentCat = catList.find(c => c._id === s.category_id || c.id === s.category_id || c._id === s.categoryId || c.id === s.categoryId);
            return {
              id: s._id || s.id,
              name: s.name,
              parent: parentCat ? parentCat.name : 'Pantry',
              icon: s.icon || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=100'
            };
          }) : [];

          setCategories([...formattedCats, ...formattedSubs]);
        }

        // 2. Fetch brands
        let brandRes = await getData('admin/brands', queryParams);
        let brandList = brandRes?.data?.brands || (Array.isArray(brandRes?.data) ? brandRes.data : []);

        if (Array.isArray(brandList) && brandList.length > 0) {
          setBrands(brandList.map(b => ({
            id: b._id || b.id,
            name: b.name,
            logo: b.logo || 'https://images.unsplash.com/photo-1500937386664-56d159062255?auto=format&fit=crop&q=80&w=100'
          })));
        }

        // 3. Fetch products
        let prodRes = await getData('admin/products', queryParams);
        let prodList = prodRes?.data?.products || (Array.isArray(prodRes?.data) ? prodRes.data : []);

        if (Array.isArray(prodList) && prodList.length > 0) {
          setProducts(prodList.map(p => {
            const rawVars = (Array.isArray(p.variations) && p.variations.length > 0)
              ? p.variations
              : ((Array.isArray(p.variants) && p.variants.length > 0) ? p.variants : []);
            const parsedVars = rawVars.map((v, idx) => ({
              id: v._id || v.id || `var-${idx + 1}`,
              regularPrice: v.regularPrice !== undefined ? v.regularPrice : p.base_price || 0,
              salePrice: v.salePrice !== undefined ? v.salePrice : p.discount_price || 0,
              stock: v.stockQuantity !== undefined ? v.stockQuantity : (v.stock !== undefined ? v.stock : 0),
            }));
            const firstVariant = parsedVars[0] || {};
            const primaryRegPrice = firstVariant.regularPrice !== undefined ? firstVariant.regularPrice : (p.base_price || 0);
            const primarySalePrice = firstVariant.salePrice !== undefined ? firstVariant.salePrice : (p.discount_price || primaryRegPrice);

            return {
              id: p._id || p.id,
              name: p.name || p.title,
              sku: p.sku || `SKU-${p._id ? p._id.slice(-4) : '001'}`,
              category: p.category_name || (typeof p.category === 'string' ? p.category : ''),
              subCategory: p.subCategory || '',
              brand: typeof p.brand === 'string' ? p.brand : (p.brand_name || ''),
              regularPrice: primaryRegPrice,
              salePrice: primarySalePrice,
              stock: p.stockQuantity || p.stock || 0,
              isFeatured: p.isFeatured || false,
              isNewArrival: p.isNewArrival || p.newArrival || false,
              isBestSeller: p.isBestSeller || p.bestSeller || false,
              images: Array.isArray(p.images) && p.images.length > 0 ? p.images : ['https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=400'],
              tags: p.tags || []
            };
          }));
        }

        // 4. Fetch recipes
        let recipeRes = await getData('admin/recipes', queryParams);
        let recipeList = recipeRes?.data?.recipes || (Array.isArray(recipeRes?.data) ? recipeRes.data : []);

        if (Array.isArray(recipeList) && recipeList.length > 0) {
          setRecipes(recipeList.map(r => ({
            id: r._id || r.id,
            title: r.title,
            cookingTime: r.cookingTime || '15 mins',
            nutrition: r.nutrition || '',
            image: r.image || 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&q=80&w=300',
            linkedProducts: r.linkedProducts || []
          })));
        }
      } catch (err) {
        console.warn('Error fetching live databases, using defaults', err);
      }
    };

    fetchRealData();
  }, [initialCategories, initialBrands, initialProducts, initialRecipes]);

  // Find currently selected section
  const activeSection = useMemo(() => {
    return sections.find(s => s.id === selectedSectionId) || null;
  }, [sections, selectedSectionId]);

  // Handle reordering (Native HTML5 Drag & Drop)
  const handleDragStart = (e, index) => {
    e.dataTransfer.setData('text/plain', index);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e, targetIndex) => {
    e.preventDefault();
    const sourceIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
    if (sourceIndex === targetIndex || isNaN(sourceIndex)) return;

    const reordered = [...sections];
    const [removed] = reordered.splice(sourceIndex, 1);
    reordered.splice(targetIndex, 0, removed);

    // Re-index display orders
    const updated = reordered.map((sec, idx) => ({
      ...sec,
      displayOrder: idx + 1
    }));
    setSections(updated);
    addToast('Display order updated visually. Click Publish to save.', 'info');
  };

  // Move up/down fallback buttons
  const moveSection = (index, direction) => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;

    const reordered = [...sections];
    const temp = reordered[index];
    reordered[index] = reordered[targetIndex];
    reordered[targetIndex] = temp;

    const updated = reordered.map((sec, idx) => ({
      ...sec,
      displayOrder: idx + 1
    }));
    setSections(updated);
    addToast('Display order updated visually. Click Publish to save.', 'info');
  };

  // Toggle Visibility Status
  const handleToggleVisibility = async (sectionId) => {
    const updatedSections = sections.map(s => {
      if (s.id === sectionId) {
        return { ...s, enabled: !s.enabled };
      }
      return s;
    });
    setSections(updatedSections);

    try {
      const { toggleHomeConfigStatus } = await import('../services/api');
      const res = await toggleHomeConfigStatus(sectionId);
      if (res && res.success) {
        addToast('Section visibility toggled successfully', 'success');
      } else {
        addToast('Status updated locally. Save all with Publish.', 'info');
      }
    } catch (err) {
      console.warn('Backend API toggle not active, using local state.', err);
      addToast('Status updated locally. Save all with Publish.', 'info');
    }
  };

  // Update specific active section field
  const handleUpdateActiveSection = (fields) => {
    setSections(sections.map(s => {
      if (s.id === selectedSectionId) {
        return { ...s, ...fields };
      }
      return s;
    }));
  };

  // Update specific filter property
  const handleUpdateFilters = (filterKey, value) => {
    if (!activeSection) return;
    const currentFilters = activeSection.filters || {};
    handleUpdateActiveSection({
      filters: {
        ...currentFilters,
        [filterKey]: value
      }
    });
  };

  // Handle checklist selection (Products, Categories, Brands, Recipes)
  const handleItemSelectToggle = (itemId) => {
    if (!activeSection) return;
    const selected = activeSection.items || [];
    const updated = selected.includes(itemId)
      ? selected.filter(id => id !== itemId)
      : [...selected, itemId];
    handleUpdateActiveSection({ items: updated });
  };

  // Save all sections to the backend/cmsData state
  const handlePublish = async () => {
    setSaving(true);
    try {
      const { reorderHomeConfigs, updateHomeConfig } = await import('../services/api');

      // 1. Save reordering bulk index
      const orderPayload = sections.map(s => ({ id: s.id, displayOrder: s.displayOrder }));
      await reorderHomeConfigs(orderPayload);

      // 2. Put single updates for all sections (or save globally in state)
      // Since we want to update the client state, we update the React parent state as well
      const updatedCMS = {
        ...cmsData,
        homeSections: sections
      };
      setCmsData(updatedCMS);

      // Try bulk-syncing with endpoints (simulated promise matches)
      await Promise.all(
        sections.map(sec =>
          updateHomeConfig(sec.id, {
            sectionType: sec.sectionType,
            title: sec.title || '',
            subtitle: sec.subtitle || '',
            enabled: sec.enabled,
            displayOrder: sec.displayOrder,
            dataSource: sec.dataSource || 'Manual',
            productLimit: sec.productLimit || 1,
            filters: sec.filters || {},
            buttonText: sec.buttonText || '',
            buttonUrl: sec.buttonUrl || ''
          }).catch(() => null) // Allow soft failure if endpoints are partially live
        )
      );

      addToast('Homepage Layout published successfully to web storefront!', 'success');

      setAuditLogs([
        {
          id: generateUniqueId('log'),
          timestamp: new Date().toISOString(),
          user: 'Mugesh',
          action: 'Homepage Layout Published',
          module: 'Home Config',
          detail: `Bulk updated display orders and filters for ${sections.length} sections.`
        },
        ...auditLogs
      ]);
    } catch (error) {
      console.error('Publish error:', error);
      addToast('Error synchronizing layout with server. Saved locally.', 'warning');
      const updatedCMS = { ...cmsData, homeSections: sections };
      setCmsData(updatedCMS);
    } finally {
      setSaving(false);
    }
  };

  // Create section via POST API
  const handleCreateSection = async (e) => {
    e.preventDefault();
    if (!newSectionType) {
      addToast('Section Type is required', 'danger');
      return;
    }
    setSaving(true);
    try {
      const { createHomeConfig } = await import('../services/api');
      const payload = {
        sectionType: newSectionType,
        title: newSectionTitle || '',
        subtitle: newSectionSubtitle || '',
        enabled: true,
        displayOrder: sections.length,
        dataSource: isProductSection(newSectionType) ? newSectionDataSource : 'Manual',
        productLimit: isProductSection(newSectionType) ? Number(newSectionProductLimit) || 8 : 1,
        filters: {},
        buttonText: newSectionButtonText || '',
        buttonUrl: newSectionButtonUrl || ''
      };

      const res = await createHomeConfig(payload);
      if (res && res.success && res.data) {
        const created = {
          ...payload,          // our defaults (enabled: true, etc.)
          ...res.data,         // API-returned fields (id, timestamps, etc.)
          id: res.data.id || res.data._id || generateUniqueId('sec'),
          enabled: true,       // always start enabled regardless of API response
          items: res.data.items || []
        };
        const newSectionsList = [...sections, created];
        setSections(newSectionsList);
        setSelectedSectionId(created.id);
        addToast('New homepage section created successfully!', 'success');
      } else {
        const localCreated = {
          id: generateUniqueId('sec'),
          ...payload,
          items: []
        };
        const newSectionsList = [...sections, localCreated];
        setSections(newSectionsList);
        setSelectedSectionId(localCreated.id);
        addToast('New homepage section created locally.', 'success');
      }

      setNewSectionTitle('');
      setNewSectionSubtitle('');
      setNewSectionType('Hero Banner');
      setNewSectionDataSource('Manual');
      setNewSectionProductLimit(8);
      setNewSectionButtonText('');
      setNewSectionButtonUrl('');
      setCreateModalOpen(false);

      setAuditLogs([
        {
          id: generateUniqueId('log'),
          timestamp: new Date().toISOString(),
          user: 'Mugesh',
          action: 'Homepage Section Created',
          module: 'Home Config',
          detail: `Created new homepage section of type: ${newSectionType}`
        },
        ...auditLogs
      ]);
    } catch (err) {
      console.error('Create section error:', err);
      addToast('Error creating new homepage section.', 'danger');
    } finally {
      setSaving(false);
    }
  };

  // Delete section via DELETE API
  const handleDeleteSection = async (sectionId, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this homepage section?")) return;

    try {
      const { deleteHomeConfig } = await import('../services/api');
      await deleteHomeConfig(sectionId);
      addToast('Section deleted successfully', 'success');

      const updated = sections.filter(s => s.id !== sectionId);
      setSections(updated);

      if (selectedSectionId === sectionId) {
        if (updated.length > 0) {
          setSelectedSectionId(updated[0].id);
        } else {
          setSelectedSectionId(null);
        }
      }

      setAuditLogs([
        {
          id: generateUniqueId('log'),
          timestamp: new Date().toISOString(),
          user: 'Mugesh',
          action: 'Homepage Section Deleted',
          module: 'Home Config',
          detail: `Deleted section ID: ${sectionId}`
        },
        ...auditLogs
      ]);
    } catch (err) {
      console.error('Delete section error:', err);
      addToast('Error deleting section from server.', 'danger');
    }
  };

  // Filters for real-time visual mockup preview
  const getPreviewProductsForSection = (section) => {
    if (!section.dataSource || section.dataSource === 'Manual') {
      const selectedIds = section.items || [];
      return products.filter(p => selectedIds.includes(p.id));
    }

    // Automatic mode filters
    const filters = section.filters || {};
    let filtered = [...products];

    if (filters.categories && filters.categories.length > 0) {
      filtered = filtered.filter(p => filters.categories.includes(p.category));
    } else if (filters.category) {
      filtered = filtered.filter(p => p.category === filters.category);
    }
    if (filters.subcategory) {
      filtered = filtered.filter(p => p.subCategory === filters.subcategory);
    }
    if (filters.brands && filters.brands.length > 0) {
      filtered = filtered.filter(p => filters.brands.includes(p.brand));
    } else if (filters.brand) {
      filtered = filtered.filter(p => p.brand === filters.brand);
    }
    if (filters.tag) {
      filtered = filtered.filter(p => p.tags && p.tags.some(t => t.toLowerCase() === filters.tag.toLowerCase()));
    }
    if (filters.minDiscount && filters.minDiscount > 0) {
      filtered = filtered.filter(p => {
        if (!p.regularPrice || !p.salePrice) return false;
        const discount = ((p.regularPrice - p.salePrice) / p.regularPrice) * 100;
        return discount >= filters.minDiscount;
      });
    }
    if (filters.stockStatus) {
      if (filters.stockStatus === 'in-stock') {
        filtered = filtered.filter(p => p.stock > 0);
      } else if (filters.stockStatus === 'out-of-stock') {
        filtered = filtered.filter(p => p.stock === 0);
      }
    }
    if (filters.newArrival) {
      filtered = filtered.filter(p => p.newArrival === true || p.isNewArrival === true || (p.tags && p.tags.some(t => t.toLowerCase() === 'new')));
    }
    if (filters.featured) {
      filtered = filtered.filter(p => p.isFeatured === true || p.featured === true || (p.tags && p.tags.some(t => t.toLowerCase() === 'featured')));
    }
    if (filters.bestSeller) {
      filtered = filtered.filter(p => p.isBestSeller === true || p.bestSeller === true || (p.tags && p.tags.some(t => t.toLowerCase() === 'bestseller')));
    }

    const limit = section.productLimit || 4;
    return filtered.slice(0, limit);
  };

  // Section properties checkers
  const isProductSection = (type) => {
    return [
      'Today\'s Best Deals', 'Limited Products', 'Recommended Products', 'New Arrivals', 'Recently Viewed'
    ].includes(type);
  };

  const hasLimitField = (type) => {
    return [
      'Shop by Categories', 'Today\'s Best Deals', 'Limited Products', 'Recommended Products',
      'New Arrivals', 'Recently Viewed', 'Shop by Brands', 'Popular Recipes'
    ].includes(type);
  };

  const hasCustomContentField = (type) => {
    return [
      'Service Features', 'Offer Banners',
      'Testimonials', 'Why Choose Us', 'Shop by Categories', 'Shop by Brands', 'Popular Recipes'
    ].includes(type);
  };

  // Selected items pagination and search are reset on state change inside handlers directly

  // Categories, Brands, Recipes lists filtering for selection view
  const selectorItems = useMemo(() => {
    if (!activeSection) return [];
    const type = activeSection.sectionType;

    if (type === 'Shop by Categories') {
      return categories.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    if (type === 'Shop by Brands') {
      return brands.filter(b => b.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    if (type === 'Popular Recipes') {
      return recipes.filter(r => r.title.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    if (isProductSection(type) && activeSection.dataSource === 'Manual Selection') {
      return products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    return [];
  }, [activeSection, categories, brands, recipes, products, searchTerm]);

  // Paginated selection items
  const paginatedSelectorItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return selectorItems.slice(startIndex, startIndex + itemsPerPage);
  }, [selectorItems, currentPage]);

  const totalSelectorPages = Math.max(1, Math.ceil(selectorItems.length / itemsPerPage));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* ── TOP HEADER ACTION BAR ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '800', letterSpacing: '-0.02em', margin: 0 }}>Homepage Layout Configuration</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '2px' }}>
            Control structure, order, and filters for all storefront homepage sections.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Button variant="outline" size="sm" icon={Eye} onClick={() => setPreviewOpen(true)}>
            Visual Preview
          </Button>
          <Button variant="primary" size="sm" icon={Save} onClick={handlePublish} disabled={saving}>
            {saving ? 'Publishing...' : 'Publish Layout'}
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="skeleton" style={{ height: '350px', borderRadius: 'var(--radius-lg)' }} />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '24px', alignItems: 'flex-start' }} className="responsive-split">

          {/* ── LEFT PANEL: SECTIONS LIST & DRAG-DROP ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Card
              title="Homepage Sections Order"
              subtitle="Drag elements to adjust site display sequence."
              actions={
                <Button
                  variant="outline"
                  size="sm"
                  icon={Plus}
                  onClick={() => setCreateModalOpen(true)}
                  style={{ padding: '4px 8px', fontSize: '11px', height: '28px' }}
                >
                  Add Section
                </Button>
              }
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  marginTop: '12px'
                }}
              >
                {sections.map((sec, idx) => {
                  const isSelected = sec.id === selectedSectionId;
                  return (
                    <div
                      key={sec.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, idx)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, idx)}
                      onClick={() => { setSelectedSectionId(sec.id); setCurrentPage(1); }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px 14px',
                        backgroundColor: isSelected ? 'var(--primary-light)' : 'var(--bg-card)',
                        border: `1.5px solid ${isSelected ? 'var(--primary)' : 'var(--border-color)'}`,
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer',
                        transition: 'all var(--transition-fast)',
                        position: 'relative',
                        opacity: sec.enabled ? 1 : 0.55
                      }}
                      className="section-drag-item"
                    >
                      {/* Drag Grip Handle */}
                      <div
                        style={{ color: 'var(--text-muted)', cursor: 'grab', display: 'flex', alignItems: 'center' }}
                        title="Drag to reorder"
                      >
                        <GripVertical size={16} />
                      </div>

                      {/* Display Order Badge */}
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: '800',
                          backgroundColor: isSelected ? 'var(--primary)' : 'var(--bg-app)',
                          color: isSelected ? 'white' : 'var(--text-secondary)',
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        {idx + 1}
                      </span>

                      {/* Section Info details */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '13.5px', fontWeight: '600', color: isSelected ? 'var(--primary)' : 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {sec.title || sec.sectionType}
                          </span>
                          {!sec.enabled && (
                            <span style={{ fontSize: '9px', fontWeight: '700', padding: '1px 5px', borderRadius: '4px', backgroundColor: 'var(--border-color)', color: 'var(--text-muted)' }}>
                              Disabled
                            </span>
                          )}
                        </div>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.02em', display: 'block', marginTop: '2px' }}>
                          {sec.sectionType}
                        </span>
                      </div>

                      {/* Arrow Fallback controls & Visibility Toggle */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => moveSection(idx, 'up')}
                          disabled={idx === 0}
                          style={{ border: 'none', background: 'none', color: idx === 0 ? 'var(--border-color)' : 'var(--text-secondary)', cursor: idx === 0 ? 'not-allowed' : 'pointer', padding: '2px' }}
                          title="Move up"
                        >
                          <ArrowUp size={13} />
                        </button>
                        <button
                          onClick={() => moveSection(idx, 'down')}
                          disabled={idx === sections.length - 1}
                          style={{ border: 'none', background: 'none', color: idx === sections.length - 1 ? 'var(--border-color)' : 'var(--text-secondary)', cursor: idx === sections.length - 1 ? 'not-allowed' : 'pointer', padding: '2px' }}
                          title="Move down"
                        >
                          <ArrowDown size={13} />
                        </button>
                        <button
                          onClick={() => handleToggleVisibility(sec.id)}
                          style={{ border: 'none', background: 'none', color: sec.enabled ? 'var(--primary)' : 'var(--text-muted)', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' }}
                          title={sec.enabled ? 'Disable section' : 'Enable section'}
                        >
                          {sec.enabled ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                        </button>
                        <button
                          onClick={(e) => handleDeleteSection(sec.id, e)}
                          style={{ border: 'none', background: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' }}
                          title="Delete section"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* ── RIGHT PANEL: SECTIONS CONFIGURATION EDITOR ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {activeSection ? (
              <Card
                title={`Configure: ${activeSection.sectionType}`}
                subtitle={`Modify rules, labels, content slides, or records for display order #${activeSection.displayOrder}`}
                actions={
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '12px', fontWeight: '500', color: 'var(--text-secondary)' }}>Status:</span>
                    <button
                      onClick={() => handleToggleVisibility(activeSection.id)}
                      style={{ border: 'none', background: 'none', color: activeSection.enabled ? 'var(--primary)' : 'var(--text-muted)', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' }}
                    >
                      {activeSection.enabled ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                    </button>
                  </div>
                }
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', marginTop: '12px' }}>

                  {/* General settings widgets based on Section Type */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {/* Common Header Fields */}
                    {['Service Features', 'Offer Banners', 'Shop by Categories', 'Today\'s Best Deals', 'Limited Products', 'Recommended Products', 'New Arrivals', 'Recently Viewed', 'Shop by Brands', 'Popular Recipes', 'Testimonials', 'Why Choose Us'].includes(activeSection.sectionType) && (
                      <Input
                        label="Section Title"
                        value={activeSection.title || ''}
                        onChange={(e) => handleUpdateActiveSection({ title: e.target.value })}
                        placeholder="e.g. Best Farm Offers"
                      />
                    )}

                    {['Today\'s Best Deals', 'Limited Products', 'Recommended Products', 'New Arrivals', 'Recently Viewed', 'Popular Recipes', 'Testimonials'].includes(activeSection.sectionType) && (
                      <Input
                        label="Subtitle"
                        value={activeSection.subtitle || ''}
                        onChange={(e) => handleUpdateActiveSection({ subtitle: e.target.value })}
                      />
                    )}

                    {['Why Choose Us'].includes(activeSection.sectionType) && (
                      <Input
                        label="Highlighted Title"
                        value={activeSection.highlightedTitle || ''}
                        onChange={(e) => handleUpdateActiveSection({ highlightedTitle: e.target.value })}
                      />
                    )}

                    {['Service Features', 'Why Choose Us'].includes(activeSection.sectionType) && (
                      <Textarea
                        label="Description"
                        value={activeSection.description || ''}
                        onChange={(e) => handleUpdateActiveSection({ description: e.target.value })}
                        rows={2}
                      />
                    )}

                    {/* View All Fields */}
                    {['Shop by Categories', 'Today\'s Best Deals', 'Limited Products', 'Recommended Products', 'New Arrivals', 'Recently Viewed', 'Shop by Brands'].includes(activeSection.sectionType) && (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="responsive-split">
                        <Input
                          label="View All Text"
                          value={activeSection.buttonText || ''}
                          onChange={(e) => handleUpdateActiveSection({ buttonText: e.target.value })}
                        />
                        <Input
                          label="View All URL"
                          value={activeSection.buttonUrl || ''}
                          onChange={(e) => handleUpdateActiveSection({ buttonUrl: e.target.value })}
                        />
                      </div>
                    )}

                    {['Popular Recipes'].includes(activeSection.sectionType) && (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="responsive-split">
                        <Input
                          label="View All Text"
                          value={activeSection.buttonText || ''}
                          onChange={(e) => handleUpdateActiveSection({ buttonText: e.target.value })}
                        />
                        <Input
                          label="View All URL"
                          value={activeSection.buttonUrl || ''}
                          onChange={(e) => handleUpdateActiveSection({ buttonUrl: e.target.value })}
                        />
                      </div>
                    )}

                    {/* Hero Banner Fields */}
                    {activeSection.sectionType === 'Hero Banner' && (
                      <>
                        <Input label="Title" value={activeSection.title || ''} onChange={(e) => handleUpdateActiveSection({ title: e.target.value })} />
                        <Input label="Subtitle" value={activeSection.subtitle || ''} onChange={(e) => handleUpdateActiveSection({ subtitle: e.target.value })} />
                        <Textarea label="Description" value={activeSection.description || ''} onChange={(e) => handleUpdateActiveSection({ description: e.target.value })} rows={2} />
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="responsive-split">
                          <Input label="Primary Button Text" value={activeSection.primaryButtonText || ''} onChange={(e) => handleUpdateActiveSection({ primaryButtonText: e.target.value })} />
                          <Input label="Primary Button URL" value={activeSection.primaryButtonUrl || ''} onChange={(e) => handleUpdateActiveSection({ primaryButtonUrl: e.target.value })} />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="responsive-split">
                          <Input label="Secondary Button Text" value={activeSection.secondaryButtonText || ''} onChange={(e) => handleUpdateActiveSection({ secondaryButtonText: e.target.value })} />
                          <Input label="Secondary Button URL" value={activeSection.secondaryButtonUrl || ''} onChange={(e) => handleUpdateActiveSection({ secondaryButtonUrl: e.target.value })} />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="responsive-split">
                          <Input label="Offer Badge" value={activeSection.offerBadge || ''} onChange={(e) => handleUpdateActiveSection({ offerBadge: e.target.value })} />
                          <Input label="Offer Text" value={activeSection.offerText || ''} onChange={(e) => handleUpdateActiveSection({ offerText: e.target.value })} />
                        </div>
                        <Uploader label="Images" maxFiles={3} initialImages={activeSection.images || []} onFilesChanged={(urls) => handleUpdateActiveSection({ images: urls })} />
                      </>
                    )}

                    {/* Subscription Banner Fields */}
                    {activeSection.sectionType === 'Subscription Banner' && (
                      <>
                        <Input label="Title" value={activeSection.title || ''} onChange={(e) => handleUpdateActiveSection({ title: e.target.value })} />
                        <Input label="Highlighted Text" value={activeSection.highlightedText || ''} onChange={(e) => handleUpdateActiveSection({ highlightedText: e.target.value })} />
                        <Textarea label="Description" value={activeSection.description || ''} onChange={(e) => handleUpdateActiveSection({ description: e.target.value })} rows={2} />
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="responsive-split">
                          <Input label="Button Text" value={activeSection.buttonText || ''} onChange={(e) => handleUpdateActiveSection({ buttonText: e.target.value })} />
                          <Input label="Button URL" value={activeSection.buttonUrl || ''} onChange={(e) => handleUpdateActiveSection({ buttonUrl: e.target.value })} />
                        </div>
                        <Input label="Background Color" type="color" value={activeSection.backgroundColor || '#ffffff'} onChange={(e) => handleUpdateActiveSection({ backgroundColor: e.target.value })} />
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="responsive-split">
                          <Uploader label="Banner Image" maxFiles={1} initialImages={[activeSection.bannerImage || ''].filter(Boolean)} onFilesChanged={(urls) => handleUpdateActiveSection({ bannerImage: urls[0] || '' })} />
                          <Uploader label="Background Image" maxFiles={1} initialImages={[activeSection.backgroundImage || ''].filter(Boolean)} onFilesChanged={(urls) => handleUpdateActiveSection({ backgroundImage: urls[0] || '' })} />
                        </div>
                      </>
                    )}

                    {/* Newsletter Fields */}
                    {activeSection.sectionType === 'Newsletter' && (
                      <>
                        <Input label="Title" value={activeSection.title || ''} onChange={(e) => handleUpdateActiveSection({ title: e.target.value })} />
                        <Input label="Subtitle" value={activeSection.subtitle || ''} onChange={(e) => handleUpdateActiveSection({ subtitle: e.target.value })} />
                        <Textarea label="Description" value={activeSection.description || ''} onChange={(e) => handleUpdateActiveSection({ description: e.target.value })} rows={2} />
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="responsive-split">
                          <Input label="Placeholder" value={activeSection.placeholder || ''} onChange={(e) => handleUpdateActiveSection({ placeholder: e.target.value })} />
                          <Input label="Button Text" value={activeSection.buttonText || ''} onChange={(e) => handleUpdateActiveSection({ buttonText: e.target.value })} />
                        </div>
                        <Input label="Success Message" value={activeSection.successMessage || ''} onChange={(e) => handleUpdateActiveSection({ successMessage: e.target.value })} />
                        <Uploader label="Background Image" maxFiles={1} initialImages={[activeSection.backgroundImage || ''].filter(Boolean)} onFilesChanged={(urls) => handleUpdateActiveSection({ backgroundImage: urls[0] || '' })} />
                      </>
                    )}

                    {/* Additional Limit fields for Product Sections */}
                    {isProductSection(activeSection.sectionType) && (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                        <Input label="Products Count" type="number" value={activeSection.productLimit || ''} onChange={(e) => handleUpdateActiveSection({ productLimit: Math.max(1, parseInt(e.target.value, 10) || 0) })} />
                        <Input label="Rows" type="number" value={activeSection.rows || 1} onChange={(e) => handleUpdateActiveSection({ rows: Math.max(1, parseInt(e.target.value, 10) || 1) })} />
                        <Input label="Columns" type="number" value={activeSection.columns || 4} onChange={(e) => handleUpdateActiveSection({ columns: Math.max(1, parseInt(e.target.value, 10) || 1) })} />
                      </div>
                    )}
                    {isProductSection(activeSection.sectionType) && (
                      <Select
                        label="Slider / Grid"
                        value={activeSection.displayFormat || 'Grid'}
                        onChange={(e) => handleUpdateActiveSection({ displayFormat: e.target.value })}
                        options={['Grid', 'Slider']}
                      />
                    )}
                  </div>

                  {/* ──────────────── DATA SOURCE CONFIGURATION ──────────────── */}
                  {isProductSection(activeSection.sectionType) && (
                    <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <div>
                          <span style={{ fontSize: '13.5px', fontWeight: '700', color: 'var(--text-primary)' }}>Products Fetch Mode</span>
                          <p style={{ color: 'var(--text-muted)', fontSize: '11px' }}>Decide how product items are fed to this module.</p>
                        </div>
                      </div>

                      <Select
                        label="Product Source"
                        value={activeSection.dataSource || 'Featured Products'}
                        onChange={(e) => handleUpdateActiveSection({ dataSource: e.target.value })}
                        options={['Featured Products', 'Latest Products', 'Manual Selection', 'Category Based', 'Brand Based', 'Offer Products']}
                      />

                      {/* Source-specific configurations — multi-select checkboxes */}
                      {activeSection.dataSource === 'Category Based' && (
                        <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <label style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)' }}>Filter by Categories (multi-select)</label>
                          <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', overflow: 'hidden', maxHeight: '200px', overflowY: 'auto', backgroundColor: 'var(--bg-card)' }}>
                            {categories.filter(c => !c.parent).map(cat => {
                              const selectedCats = activeSection.filters?.categories || [];
                              const isChecked = selectedCats.includes(cat.name);
                              return (
                                <label key={cat.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 14px', borderBottom: '1px solid var(--border-color)', cursor: 'pointer', backgroundColor: isChecked ? 'var(--primary-light)' : 'transparent', transition: 'background 0.15s' }}>
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => {
                                      const current = activeSection.filters?.categories || [];
                                      const updated = isChecked ? current.filter(n => n !== cat.name) : [...current, cat.name];
                                      handleUpdateFilters('categories', updated);
                                    }}
                                    style={{ accentColor: 'var(--primary)', width: '15px', height: '15px', cursor: 'pointer' }}
                                  />
                                  {cat.icon && <img src={cat.icon} alt={cat.name} style={{ width: '28px', height: '28px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--border-color)' }} />}
                                  <span style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: isChecked ? '600' : '400' }}>{cat.name}</span>
                                </label>
                              );
                            })}
                            {categories.filter(c => !c.parent).length === 0 && (
                              <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>No categories found. Add categories in the Categories module.</div>
                            )}
                          </div>
                          {(activeSection.filters?.categories || []).length > 0 && (
                            <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-secondary)' }}>
                              {(activeSection.filters.categories).length} categor{(activeSection.filters.categories).length === 1 ? 'y' : 'ies'} selected: {(activeSection.filters.categories).join(', ')}
                            </p>
                          )}
                        </div>
                      )}

                      {activeSection.dataSource === 'Brand Based' && (
                        <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <label style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)' }}>Filter by Brands (multi-select)</label>
                          <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', overflow: 'hidden', maxHeight: '200px', overflowY: 'auto', backgroundColor: 'var(--bg-card)' }}>
                            {brands.map(brand => {
                              const selectedBrands = activeSection.filters?.brands || [];
                              const isChecked = selectedBrands.includes(brand.name);
                              return (
                                <label key={brand.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 14px', borderBottom: '1px solid var(--border-color)', cursor: 'pointer', backgroundColor: isChecked ? 'var(--primary-light)' : 'transparent', transition: 'background 0.15s' }}>
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => {
                                      const current = activeSection.filters?.brands || [];
                                      const updated = isChecked ? current.filter(n => n !== brand.name) : [...current, brand.name];
                                      handleUpdateFilters('brands', updated);
                                    }}
                                    style={{ accentColor: 'var(--primary)', width: '15px', height: '15px', cursor: 'pointer' }}
                                  />
                                  {brand.logo && <img src={brand.logo} alt={brand.name} style={{ width: '28px', height: '28px', objectFit: 'contain', borderRadius: '4px', border: '1px solid var(--border-color)' }} />}
                                  <span style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: isChecked ? '600' : '400' }}>{brand.name}</span>
                                </label>
                              );
                            })}
                            {brands.length === 0 && (
                              <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>No brands found. Add brands in the Brands module.</div>
                            )}
                          </div>
                          {(activeSection.filters?.brands || []).length > 0 && (
                            <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-secondary)' }}>
                              {(activeSection.filters.brands).length} brand{(activeSection.filters.brands).length === 1 ? '' : 's'} selected: {(activeSection.filters.brands).join(', ')}
                            </p>
                          )}
                        </div>
                      )}

                    </div>
                  )}

                  {/* ──────────────── CHECKLIST SELECTOR SECTION ──────────────── */}
                  {((isProductSection(activeSection.sectionType) && activeSection.dataSource === 'Manual Selection') ||
                    ['Shop by Categories', 'Shop by Brands', 'Popular Recipes'].includes(activeSection.sectionType)) && (
                      <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                          <div>
                            <span style={{ fontSize: '13.5px', fontWeight: '700', color: 'var(--text-primary)' }}>
                              Link items to Section ({activeSection.items?.length || 0} linked)
                            </span>
                            <p style={{ color: 'var(--text-muted)', fontSize: '11px' }}>Search and toggle rows to include them on the page.</p>
                          </div>
                        </div>

                        {/* Search Bar filter */}
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                          <div style={{ position: 'relative', flex: 1 }}>
                            <span style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }}><Search size={16} /></span>
                            <input
                              type="text"
                              placeholder="Filter records..."
                              value={searchTerm}
                              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                              style={{
                                width: '100%', padding: '8px 12px 8px 32px', fontSize: '13px',
                                borderRadius: '8px', border: '1px solid var(--border-color)',
                                backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)', outline: 'none'
                              }}
                            />
                          </div>
                          {searchTerm && (
                            <Button variant="ghost" size="sm" onClick={() => { setSearchTerm(''); setCurrentPage(1); }} style={{ color: 'var(--text-muted)' }}>
                              Clear
                            </Button>
                          )}
                        </div>

                        {/* Items selection Grid list */}
                        <div
                          style={{
                            border: '1px solid var(--border-color)',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            backgroundColor: 'var(--bg-card)'
                          }}
                        >
                          {paginatedSelectorItems.length === 0 ? (
                            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                              No items found. Clear your search filter or add records in their respective modules.
                            </div>
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              {paginatedSelectorItems.map(item => {
                                const itemId = item.id || item._id;
                                const isSelected = (activeSection.items || []).includes(itemId);
                                const displayName = item.name || item.title || 'Untitled';
                                const displaySub = item.sku || item.parent || (item.cookingTime ? `Time: ${item.cookingTime}` : '');
                                const displayImg = item.icon || item.logo || item.image || (item.images && item.images[0]) || '';

                                return (
                                  <div
                                    key={itemId}
                                    onClick={() => handleItemSelectToggle(itemId)}
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '12px',
                                      padding: '10px 14px',
                                      borderBottom: '1px solid var(--border-color)',
                                      cursor: 'pointer',
                                      backgroundColor: isSelected ? 'var(--primary-light)' : 'transparent',
                                      transition: 'background-color 0.15s ease'
                                    }}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isSelected}
                                      onChange={() => { }} // Controlled by row onClick
                                      style={{ accentColor: 'var(--primary)', cursor: 'pointer', width: '16px', height: '16px' }}
                                    />
                                    {displayImg ? (
                                      <img
                                        src={displayImg}
                                        alt={displayName}
                                        style={{ width: '38px', height: '38px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--border-color)', flexShrink: 0 }}
                                      />
                                    ) : (
                                      <div style={{ width: '38px', height: '38px', borderRadius: '4px', backgroundColor: 'var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <FileText size={16} style={{ color: 'var(--text-muted)' }} />
                                      </div>
                                    )}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                      <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {displayName}
                                      </span>
                                      {displaySub && (
                                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>
                                          {displaySub}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        {/* Pagination Controls */}
                        {totalSelectorPages > 1 && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                            <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                              Page <strong>{currentPage}</strong> of <strong>{totalSelectorPages}</strong>
                            </span>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                style={{ padding: '4px 8px' }}
                              >
                                <ChevronLeft size={14} />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(prev => Math.min(totalSelectorPages, prev + 1))}
                                disabled={currentPage === totalSelectorPages}
                                style={{ padding: '4px 8px' }}
                              >
                                <ChevronRight size={14} />
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                  {/* ──────────────── CUSTOM LAYOUT CONTENT EDITOR (SLIDES / HIGHLIGHTS) ──────────────── */}
                  {hasCustomContentField(activeSection.sectionType) && (
                    <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <div>
                          <span style={{ fontSize: '13.5px', fontWeight: '700', color: 'var(--text-primary)' }}>
                            Custom Content Items ({activeSection.customContent?.length || 0} items)
                          </span>
                          <p style={{ color: 'var(--text-muted)', fontSize: '11px' }}>Directly edit graphics, text slides, features or testimonials in this block.</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          icon={Plus}
                          onClick={() => {
                            const current = activeSection.customContent || [];
                            let newSlide = { id: generateUniqueId('custom'), status: true, displayOrder: current.length + 1 };

                            switch (activeSection.sectionType) {
                              case 'Service Features':
                                newSlide = { ...newSlide, iconImage: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=100', title: 'New Feature', description: 'Feature description' };
                                break;
                              case 'Offer Banners':
                                newSlide = { ...newSlide, title: 'Offer Title', subtitle: 'Offer Subtitle', description: 'Offer Description', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=400', backgroundColor: '#ffffff', buttonText: 'Shop Now', buttonUrl: '/shop', badge: 'New' };
                                break;
                              case 'Shop by Categories':
                                newSlide = { ...newSlide, categoryImage: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=200', icon: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=100', bannerImage: '', sortOrder: current.length + 1, featured: false };
                                break;
                              case 'Shop by Brands':
                                newSlide = { ...newSlide, logo: 'https://images.unsplash.com/photo-1500937386664-56d159062255?auto=format&fit=crop&q=80&w=100', banner: '', name: 'Brand Name', url: '', featured: false, sortOrder: current.length + 1 };
                                break;
                              case 'Popular Recipes':
                                newSlide = { ...newSlide, recipeTitle: 'New Recipe', slug: 'new-recipe', thumbnail: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&q=80&w=200', bannerImage: '', description: 'Recipe description', ingredients: 'Ingredient 1, Ingredient 2', preparation: 'Step 1, Step 2', cookingTime: '30 mins', servings: '4', category: 'Dinner', tags: 'Healthy', author: 'Chef' };
                                break;
                              case 'Testimonials':
                                newSlide = { ...newSlide, customerName: 'John Doe', customerImage: '', designation: 'Customer', rating: 5, review: 'Great experience!', backgroundColor: '#ffffff' };
                                break;
                              case 'Why Choose Us':
                                newSlide = { ...newSlide, icon: 'Award', title: 'Quality', description: 'Best quality products' };
                                break;
                              default:
                                newSlide = {
                                  ...newSlide,
                                  title: 'New Headline title',
                                  subtitle: 'Description line text...',
                                  description: 'Paragraph text body description...',
                                  imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=400',
                                  image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=400',
                                  buttonText: 'Click here',
                                  buttonUrl: '/shop',
                                };
                            }
                            handleUpdateActiveSection({ customContent: [...current, newSlide] });
                            addToast('New custom slide draft added. Edit details below.', 'info');
                          }}
                        >
                          Add Block
                        </Button>
                      </div>

                      {/* Custom slides block list editor */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {(activeSection.customContent || []).map((slide, sIdx) => (
                          <div
                            key={slide.id}
                            style={{
                              backgroundColor: 'var(--bg-app)',
                              borderRadius: 'var(--radius-lg)',
                              border: '1px solid var(--border-color)',
                              padding: '16px',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '12px',
                              position: 'relative'
                            }}
                          >
                            {/* Remove button */}
                            <button
                              type="button"
                              onClick={() => {
                                const filtered = (activeSection.customContent || []).filter((_, idx) => idx !== sIdx);
                                handleUpdateActiveSection({ customContent: filtered });
                                addToast('Custom item removed.', 'warning');
                              }}
                              style={{
                                position: 'absolute', top: '12px', right: '12px', border: 'none', background: 'none',
                                color: 'var(--danger)', cursor: 'pointer', padding: '4px'
                              }}
                              title="Delete Item"
                            >
                              <Trash2 size={16} />
                            </button>

                            <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)' }}>
                              BLOCK ITEM #{sIdx + 1}
                            </span>

                            {activeSection.sectionType === 'Service Features' && (
                              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '12px' }} className="responsive-split">
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                  <Input label="Title" value={slide.title || ''} onChange={(e) => { const updated = [...activeSection.customContent]; updated[sIdx].title = e.target.value; handleUpdateActiveSection({ customContent: updated }); }} />
                                  <Input label="Description" value={slide.description || ''} onChange={(e) => { const updated = [...activeSection.customContent]; updated[sIdx].description = e.target.value; handleUpdateActiveSection({ customContent: updated }); }} />
                                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    <Input label="Display Order" type="number" value={slide.displayOrder || 1} onChange={(e) => { const updated = [...activeSection.customContent]; updated[sIdx].displayOrder = parseInt(e.target.value, 10); handleUpdateActiveSection({ customContent: updated }); }} />
                                    <div style={{ display: 'flex', alignItems: 'center', height: '100%', marginTop: '20px' }}>
                                      <Checkbox label="Status (Active)" checked={slide.enabled !== false} onChange={(e) => { const updated = [...activeSection.customContent]; updated[sIdx].enabled = e.target.checked; handleUpdateActiveSection({ customContent: updated }); }} />
                                    </div>
                                  </div>
                                </div>
                                <Uploader label="Icon Image" maxFiles={1} initialImages={[slide.iconImage || ''].filter(Boolean)} onFilesChanged={(urls) => { const updated = [...activeSection.customContent]; updated[sIdx].iconImage = urls[0] || ''; handleUpdateActiveSection({ customContent: updated }); }} />
                              </div>
                            )}

                            {activeSection.sectionType === 'Offer Banners' && (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }} className="responsive-split">
                                  <Input label="Title" value={slide.title || ''} onChange={(e) => { const updated = [...activeSection.customContent]; updated[sIdx].title = e.target.value; handleUpdateActiveSection({ customContent: updated }); }} />
                                  <Input label="Subtitle" value={slide.subtitle || ''} onChange={(e) => { const updated = [...activeSection.customContent]; updated[sIdx].subtitle = e.target.value; handleUpdateActiveSection({ customContent: updated }); }} />
                                </div>
                                <Textarea label="Description" value={slide.description || ''} onChange={(e) => { const updated = [...activeSection.customContent]; updated[sIdx].description = e.target.value; handleUpdateActiveSection({ customContent: updated }); }} rows={2} />
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }} className="responsive-split">
                                  <Input label="Button Text" value={slide.buttonText || ''} onChange={(e) => { const updated = [...activeSection.customContent]; updated[sIdx].buttonText = e.target.value; handleUpdateActiveSection({ customContent: updated }); }} />
                                  <Input label="Button URL" value={slide.buttonUrl || ''} onChange={(e) => { const updated = [...activeSection.customContent]; updated[sIdx].buttonUrl = e.target.value; handleUpdateActiveSection({ customContent: updated }); }} />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px' }} className="responsive-split">
                                  <Input label="Badge" value={slide.badge || ''} onChange={(e) => { const updated = [...activeSection.customContent]; updated[sIdx].badge = e.target.value; handleUpdateActiveSection({ customContent: updated }); }} />
                                  <Input label="Display Order" type="number" value={slide.displayOrder || 1} onChange={(e) => { const updated = [...activeSection.customContent]; updated[sIdx].displayOrder = parseInt(e.target.value, 10); handleUpdateActiveSection({ customContent: updated }); }} />
                                  <Input label="Background Color" type="color" value={slide.backgroundColor || '#ffffff'} onChange={(e) => { const updated = [...activeSection.customContent]; updated[sIdx].backgroundColor = e.target.value; handleUpdateActiveSection({ customContent: updated }); }} />
                                  <div style={{ display: 'flex', alignItems: 'center', height: '100%', marginTop: '20px' }}>
                                    <Checkbox label="Status (Active)" checked={slide.enabled !== false} onChange={(e) => { const updated = [...activeSection.customContent]; updated[sIdx].enabled = e.target.checked; handleUpdateActiveSection({ customContent: updated }); }} />
                                  </div>
                                </div>
                                <Uploader label="Image" maxFiles={1} initialImages={[slide.image || ''].filter(Boolean)} onFilesChanged={(urls) => { const updated = [...activeSection.customContent]; updated[sIdx].image = urls[0] || ''; handleUpdateActiveSection({ customContent: updated }); }} />
                              </div>
                            )}

                            {activeSection.sectionType === 'Shop by Categories' && (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }} className="responsive-split">
                                  <Input label="Sort Order" type="number" value={slide.sortOrder || 1} onChange={(e) => { const updated = [...activeSection.customContent]; updated[sIdx].sortOrder = parseInt(e.target.value, 10); handleUpdateActiveSection({ customContent: updated }); }} />
                                  <div style={{ display: 'flex', alignItems: 'center', height: '100%', marginTop: '20px' }}>
                                    <Checkbox label="Featured" checked={slide.featured || false} onChange={(e) => { const updated = [...activeSection.customContent]; updated[sIdx].featured = e.target.checked; handleUpdateActiveSection({ customContent: updated }); }} />
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', height: '100%', marginTop: '20px' }}>
                                    <Checkbox label="Status (Active)" checked={slide.enabled !== false} onChange={(e) => { const updated = [...activeSection.customContent]; updated[sIdx].enabled = e.target.checked; handleUpdateActiveSection({ customContent: updated }); }} />
                                  </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }} className="responsive-split">
                                  <Uploader label="Category Image" maxFiles={1} initialImages={[slide.categoryImage || ''].filter(Boolean)} onFilesChanged={(urls) => { const updated = [...activeSection.customContent]; updated[sIdx].categoryImage = urls[0] || ''; handleUpdateActiveSection({ customContent: updated }); }} />
                                  <Uploader label="Icon" maxFiles={1} initialImages={[slide.icon || ''].filter(Boolean)} onFilesChanged={(urls) => { const updated = [...activeSection.customContent]; updated[sIdx].icon = urls[0] || ''; handleUpdateActiveSection({ customContent: updated }); }} />
                                  <Uploader label="Banner Image (Optional)" maxFiles={1} initialImages={[slide.bannerImage || ''].filter(Boolean)} onFilesChanged={(urls) => { const updated = [...activeSection.customContent]; updated[sIdx].bannerImage = urls[0] || ''; handleUpdateActiveSection({ customContent: updated }); }} />
                                </div>
                              </div>
                            )}

                            {activeSection.sectionType === 'Shop by Brands' && (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }} className="responsive-split">
                                  <Input label="Name" value={slide.name || ''} onChange={(e) => { const updated = [...activeSection.customContent]; updated[sIdx].name = e.target.value; handleUpdateActiveSection({ customContent: updated }); }} />
                                  <Input label="URL (Optional)" value={slide.url || ''} onChange={(e) => { const updated = [...activeSection.customContent]; updated[sIdx].url = e.target.value; handleUpdateActiveSection({ customContent: updated }); }} />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }} className="responsive-split">
                                  <Input label="Sort Order" type="number" value={slide.sortOrder || 1} onChange={(e) => { const updated = [...activeSection.customContent]; updated[sIdx].sortOrder = parseInt(e.target.value, 10); handleUpdateActiveSection({ customContent: updated }); }} />
                                  <div style={{ display: 'flex', alignItems: 'center', height: '100%', marginTop: '20px' }}>
                                    <Checkbox label="Featured" checked={slide.featured || false} onChange={(e) => { const updated = [...activeSection.customContent]; updated[sIdx].featured = e.target.checked; handleUpdateActiveSection({ customContent: updated }); }} />
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', height: '100%', marginTop: '20px' }}>
                                    <Checkbox label="Status (Active)" checked={slide.enabled !== false} onChange={(e) => { const updated = [...activeSection.customContent]; updated[sIdx].enabled = e.target.checked; handleUpdateActiveSection({ customContent: updated }); }} />
                                  </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }} className="responsive-split">
                                  <Uploader label="Logo" maxFiles={1} initialImages={[slide.logo || ''].filter(Boolean)} onFilesChanged={(urls) => { const updated = [...activeSection.customContent]; updated[sIdx].logo = urls[0] || ''; handleUpdateActiveSection({ customContent: updated }); }} />
                                  <Uploader label="Banner (Optional)" maxFiles={1} initialImages={[slide.banner || ''].filter(Boolean)} onFilesChanged={(urls) => { const updated = [...activeSection.customContent]; updated[sIdx].banner = urls[0] || ''; handleUpdateActiveSection({ customContent: updated }); }} />
                                </div>
                              </div>
                            )}

                            {activeSection.sectionType === 'Popular Recipes' && (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }} className="responsive-split">
                                  <Input label="Recipe Title" value={slide.recipeTitle || ''} onChange={(e) => { const updated = [...activeSection.customContent]; updated[sIdx].recipeTitle = e.target.value; handleUpdateActiveSection({ customContent: updated }); }} />
                                  <Input label="Slug" value={slide.slug || ''} onChange={(e) => { const updated = [...activeSection.customContent]; updated[sIdx].slug = e.target.value; handleUpdateActiveSection({ customContent: updated }); }} />
                                  <Input label="Author" value={slide.author || ''} onChange={(e) => { const updated = [...activeSection.customContent]; updated[sIdx].author = e.target.value; handleUpdateActiveSection({ customContent: updated }); }} />
                                </div>
                                <Textarea label="Description" value={slide.description || ''} onChange={(e) => { const updated = [...activeSection.customContent]; updated[sIdx].description = e.target.value; handleUpdateActiveSection({ customContent: updated }); }} rows={2} />
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }} className="responsive-split">
                                  <Textarea label="Ingredients (comma separated)" value={slide.ingredients || ''} onChange={(e) => { const updated = [...activeSection.customContent]; updated[sIdx].ingredients = e.target.value; handleUpdateActiveSection({ customContent: updated }); }} rows={2} />
                                  <Textarea label="Preparation Steps" value={slide.preparation || ''} onChange={(e) => { const updated = [...activeSection.customContent]; updated[sIdx].preparation = e.target.value; handleUpdateActiveSection({ customContent: updated }); }} rows={2} />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr', gap: '12px' }} className="responsive-split">
                                  <Input label="Cooking Time" value={slide.cookingTime || ''} onChange={(e) => { const updated = [...activeSection.customContent]; updated[sIdx].cookingTime = e.target.value; handleUpdateActiveSection({ customContent: updated }); }} />
                                  <Input label="Servings" type="number" value={slide.servings || ''} onChange={(e) => { const updated = [...activeSection.customContent]; updated[sIdx].servings = parseInt(e.target.value, 10); handleUpdateActiveSection({ customContent: updated }); }} />
                                  <Input label="Category" value={slide.category || ''} onChange={(e) => { const updated = [...activeSection.customContent]; updated[sIdx].category = e.target.value; handleUpdateActiveSection({ customContent: updated }); }} />
                                  <Input label="Display Order" type="number" value={slide.displayOrder || 1} onChange={(e) => { const updated = [...activeSection.customContent]; updated[sIdx].displayOrder = parseInt(e.target.value, 10); handleUpdateActiveSection({ customContent: updated }); }} />
                                  <div style={{ display: 'flex', alignItems: 'center', height: '100%', marginTop: '20px' }}>
                                    <Checkbox label="Status (Active)" checked={slide.enabled !== false} onChange={(e) => { const updated = [...activeSection.customContent]; updated[sIdx].enabled = e.target.checked; handleUpdateActiveSection({ customContent: updated }); }} />
                                  </div>
                                </div>
                                <Input label="Tags (comma separated)" value={slide.tags || ''} onChange={(e) => { const updated = [...activeSection.customContent]; updated[sIdx].tags = e.target.value; handleUpdateActiveSection({ customContent: updated }); }} />
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }} className="responsive-split">
                                  <Uploader label="Thumbnail" maxFiles={1} initialImages={[slide.thumbnail || ''].filter(Boolean)} onFilesChanged={(urls) => { const updated = [...activeSection.customContent]; updated[sIdx].thumbnail = urls[0] || ''; handleUpdateActiveSection({ customContent: updated }); }} />
                                  <Uploader label="Banner Image" maxFiles={1} initialImages={[slide.bannerImage || ''].filter(Boolean)} onFilesChanged={(urls) => { const updated = [...activeSection.customContent]; updated[sIdx].bannerImage = urls[0] || ''; handleUpdateActiveSection({ customContent: updated }); }} />
                                </div>
                              </div>
                            )}

                            {activeSection.sectionType === 'Testimonials' && (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }} className="responsive-split">
                                  <Input label="Customer Name" value={slide.customerName || ''} onChange={(e) => { const updated = [...activeSection.customContent]; updated[sIdx].customerName = e.target.value; handleUpdateActiveSection({ customContent: updated }); }} />
                                  <Input label="Designation" value={slide.designation || ''} onChange={(e) => { const updated = [...activeSection.customContent]; updated[sIdx].designation = e.target.value; handleUpdateActiveSection({ customContent: updated }); }} />
                                  <Select label="Rating" value={slide.rating || 5} onChange={(e) => { const updated = [...activeSection.customContent]; updated[sIdx].rating = parseInt(e.target.value, 10); handleUpdateActiveSection({ customContent: updated }); }} options={[1, 2, 3, 4, 5]} />
                                </div>
                                <Textarea label="Review" value={slide.review || ''} onChange={(e) => { const updated = [...activeSection.customContent]; updated[sIdx].review = e.target.value; handleUpdateActiveSection({ customContent: updated }); }} rows={2} />
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px' }} className="responsive-split">
                                  <Input label="Display Order" type="number" value={slide.displayOrder || 1} onChange={(e) => { const updated = [...activeSection.customContent]; updated[sIdx].displayOrder = parseInt(e.target.value, 10); handleUpdateActiveSection({ customContent: updated }); }} />
                                  <Input label="Background Color" type="color" value={slide.backgroundColor || '#ffffff'} onChange={(e) => { const updated = [...activeSection.customContent]; updated[sIdx].backgroundColor = e.target.value; handleUpdateActiveSection({ customContent: updated }); }} />
                                  <div style={{ display: 'flex', alignItems: 'center', height: '100%', marginTop: '20px' }}>
                                    <Checkbox label="Status (Active)" checked={slide.enabled !== false} onChange={(e) => { const updated = [...activeSection.customContent]; updated[sIdx].enabled = e.target.checked; handleUpdateActiveSection({ customContent: updated }); }} />
                                  </div>
                                </div>
                                <Uploader label="Customer Image" maxFiles={1} initialImages={[slide.customerImage || ''].filter(Boolean)} onFilesChanged={(urls) => { const updated = [...activeSection.customContent]; updated[sIdx].customerImage = urls[0] || ''; handleUpdateActiveSection({ customContent: updated }); }} />
                              </div>
                            )}

                            {activeSection.sectionType === 'Why Choose Us' && (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 0.6fr', gap: '12px' }} className="responsive-split">
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <Input label="Title" value={slide.title || ''} onChange={(e) => { const updated = [...activeSection.customContent]; updated[sIdx].title = e.target.value; handleUpdateActiveSection({ customContent: updated }); }} />
                                    <Textarea label="Description" rows={2} value={slide.description || ''} onChange={(e) => { const updated = [...activeSection.customContent]; updated[sIdx].description = e.target.value; handleUpdateActiveSection({ customContent: updated }); }} />
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                      <Input label="Display Order" type="number" value={slide.displayOrder || 1} onChange={(e) => { const updated = [...activeSection.customContent]; updated[sIdx].displayOrder = parseInt(e.target.value, 10); handleUpdateActiveSection({ customContent: updated }); }} />
                                      <div style={{ display: 'flex', alignItems: 'center', height: '100%', marginTop: '20px' }}>
                                        <Checkbox label="Status (Active)" checked={slide.enabled !== false} onChange={(e) => { const updated = [...activeSection.customContent]; updated[sIdx].enabled = e.target.checked; handleUpdateActiveSection({ customContent: updated }); }} />
                                      </div>
                                    </div>
                                  </div>
                                  <Uploader label="Icon Image" maxFiles={1} initialImages={[slide.iconImage || slide.icon || ''].filter(u => typeof u === 'string' && u.trim())} onFilesChanged={(urls) => { const updated = [...activeSection.customContent]; updated[sIdx].iconImage = urls[0] || ''; updated[sIdx].icon = urls[0] || ''; handleUpdateActiveSection({ customContent: updated }); }} />
                                </div>
                              </div>
                            )}

                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '260px', border: '2px dashed var(--border-color)', borderRadius: '12px', color: 'var(--text-muted)', textAlign: 'center', gap: '8px' }}>
                <AlertCircle size={28} />
                <span style={{ fontWeight: '600' }}>No Active Section Selected</span>
                <span style={{ fontSize: '12px' }}>Click a homepage section row on the left panel to configure its details.</span>
              </div>
            )}
          </div>

        </div>
      )}

      {/* ── LIVE HOMEPAGE PREVIEW OVERLAY DRAWER ── */}
      {previewOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10002, display: 'flex', backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(3px)' }}>
          <div onClick={() => setPreviewOpen(false)} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />

          {/* Preview Panel */}
          <div style={{ position: 'relative', marginLeft: 'auto', width: '100%', maxWidth: '980px', height: '100%', backgroundColor: '#ffffff', display: 'flex', flexDirection: 'column', boxShadow: '-12px 0 50px rgba(0,0,0,0.3)' }}>

            {/* Admin Toolbar */}
            <div style={{ padding: '9px 18px', borderBottom: '2px solid #e2e8f0', backgroundColor: '#1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontWeight: '800', fontSize: '13px', color: '#fff' }}>🌐 Live Homepage Preview</span>
                <span style={{ fontSize: '10.5px', backgroundColor: '#22c55e', color: '#fff', padding: '2px 8px', borderRadius: '999px', fontWeight: '700' }}>Grandma's Basket — Desktop</span>
              </div>
              <button onClick={() => setPreviewOpen(false)} style={{ border: '1px solid #475569', background: 'none', color: '#94a3b8', cursor: 'pointer', padding: '5px 10px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', fontWeight: '600' }}>
                <X size={14} /> Close Preview
              </button>
            </div>

            {/* Website Clone — scrollable */}
            <div style={{ flex: 1, overflowY: 'auto', backgroundColor: '#ffffff', fontFamily: "'Outfit', 'Inter', system-ui, sans-serif" }}>

              {/* ═══ TOP ANNOUNCEMENT BAR (dark, like real site) ═══ */}
              <div style={{ backgroundColor: '#111827', color: '#e5e7eb', fontSize: '11px', padding: '7px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '12px' }}>🚚</span>
                  <span>Free delivery on orders over <strong style={{ color: '#fff' }}>£40</strong></span>
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ backgroundColor: '#ea580c', color: 'white', fontSize: '10px', fontWeight: '800', padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>DIWALI SALE</span>
                  <span style={{ color: '#e5e7eb' }}>Up to <strong style={{ color: '#fbbf24' }}>30% OFF</strong> — Limited time</span>
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '10.5px', color: '#9ca3af' }}>
                  <span>🕐 Mon–Sat: 9am–8pm · Sun: 10am–6pm</span>
                  <span style={{ backgroundColor: '#16a34a', color: 'white', fontSize: '10px', fontWeight: '700', padding: '3px 10px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    💬 WhatsApp: +44 7700 900000
                  </span>
                </span>
              </div>

              {/* ═══ MAIN HEADER ═══ */}
              <div style={{ backgroundColor: '#fff', borderBottom: '1px solid #f1f5f9', padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                {/* GB Logo */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, marginRight: '8px' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'linear-gradient(135deg,#1a5c2e,#22863a)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '900', fontSize: '20px', fontStyle: 'italic' }}>
                    G
                  </div>
                  <div>
                    <div style={{ fontWeight: '900', fontSize: '14px', color: '#1a3a1a', lineHeight: 1.1, letterSpacing: '-0.01em' }}>Grandma's Basket</div>
                    <div style={{ fontSize: '9px', color: '#6b7280', fontWeight: '600', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Fresh &amp; Local</div>
                  </div>
                </div>

                {/* Location */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '0 14px', borderLeft: '1px solid #e5e7eb', borderRight: '1px solid #e5e7eb', flexShrink: 0 }}>
                  <span style={{ fontSize: '15px' }}>📍</span>
                  <div>
                    <div style={{ fontSize: '9px', color: '#9ca3af', lineHeight: 1 }}>Delivery to</div>
                    <div style={{ fontSize: '11.5px', fontWeight: '700', color: '#1f2937', lineHeight: 1.2 }}>London, UK</div>
                  </div>
                </div>

                {/* Search */}
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', backgroundColor: '#f9fafb', border: '1.5px solid #e5e7eb', borderRadius: '10px', padding: '8px 14px', gap: '8px' }}>
                  <Search size={14} style={{ color: '#9ca3af', flexShrink: 0 }} />
                  <span style={{ fontSize: '11.5px', color: '#9ca3af' }}>Search your products, Categories or Brands</span>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexShrink: 0 }}>
                  {[['♡', 'Wishlist'], ['🛒', 'Cart'], ['👤', 'Account']].map(([icon, label]) => (
                    <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', gap: '1px' }}>
                      <span style={{ fontSize: '18px', color: '#374151' }}>{icon}</span>
                      <span style={{ fontSize: '9px', color: '#6b7280', fontWeight: '600' }}>{label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* ═══ SECONDARY NAV ═══ */}
              <div style={{ backgroundColor: '#fff', borderBottom: '1px solid #f1f5f9', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                  {['Home', 'Categories', 'Brands', 'Offers', 'Recipes', 'Blog', 'Contact'].map((item, i) => (
                    <span key={item} style={{ fontSize: '12px', fontWeight: i === 0 ? '700' : i === 3 ? '700' : '500', color: i === 0 ? '#16a34a' : i === 3 ? '#ea580c' : '#374151', padding: '10px 12px', cursor: 'pointer', borderBottom: i === 0 ? '2px solid #16a34a' : '2px solid transparent', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      {item}{(i === 1 || i === 2 || i === 3) ? ' ▾' : ''}
                    </span>
                  ))}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <span style={{ fontSize: '11px', color: '#374151', cursor: 'pointer' }}>Returns</span>
                  <span style={{ fontSize: '11px', color: '#374151', cursor: 'pointer' }}>FAQs</span>
                  <span style={{ fontSize: '11px', backgroundColor: '#fff7ed', color: '#ea580c', border: '1px solid #fed7aa', padding: '4px 10px', borderRadius: '6px', fontWeight: '700', cursor: 'pointer' }}>✉ Email support</span>
                </div>
              </div>

              {/* ═══ ENABLED SECTIONS ═══ */}
              {sections.filter(s => s.enabled).map((sec) => {
                const sType = sec.sectionType;
                const previewProds = getPreviewProductsForSection(sec);

                return (
                  <div key={sec.id}>

                    {/* HERO BANNER */}
                    {sType === 'Hero Banner' && (() => {
                      const bgImg = sec.images?.[0] || '';
                      return (
                        <div style={{ position: 'relative', minHeight: '320px', backgroundColor: '#1a2e1a', backgroundImage: bgImg ? `url(${bgImg})` : undefined, backgroundSize: 'cover', backgroundPosition: 'center right', display: 'flex', alignItems: 'center' }}>
                          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(20,40,20,0.90) 0%, rgba(20,40,20,0.60) 45%, rgba(20,40,20,0.05) 80%)' }} />
                          <div style={{ position: 'relative', zIndex: 1, padding: '48px 40px', maxWidth: '520px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            {(sec.offerBadge || sec.offerText) && (
                              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', backgroundColor: 'rgba(22,163,74,0.25)', border: '1px solid rgba(22,163,74,0.5)', color: '#86efac', fontSize: '11px', fontWeight: '700', padding: '5px 12px', borderRadius: '20px', alignSelf: 'flex-start' }}>
                                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#4ade80', display: 'inline-block' }} />
                                {sec.offerBadge || sec.offerText}
                              </div>
                            )}
                            <div>
                              {sec.title && (
                                <h1 style={{ margin: 0, fontSize: '32px', fontWeight: '900', color: 'white', lineHeight: 1.15, letterSpacing: '-0.02em' }}>
                                  {sec.title}
                                </h1>
                              )}
                            </div>
                            {(sec.subtitle || sec.description) && (
                              <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.80)', lineHeight: 1.6, maxWidth: '400px' }}>
                                {sec.subtitle || sec.description}
                              </p>
                            )}
                            <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
                              {(sec.primaryButtonText || sec.primaryButtonUrl) && (
                                <span style={{ display: 'inline-block', backgroundColor: '#16a34a', color: 'white', fontSize: '12px', fontWeight: '700', padding: '10px 22px', borderRadius: '8px', cursor: 'pointer' }}>
                                  {sec.primaryButtonText || 'Shop Now'}
                                </span>
                              )}
                              {(sec.secondaryButtonText || sec.secondaryButtonUrl) && (
                                <span style={{ display: 'inline-block', backgroundColor: 'transparent', color: 'white', border: '1px solid rgba(255,255,255,0.3)', fontSize: '12px', fontWeight: '700', padding: '10px 22px', borderRadius: '8px', cursor: 'pointer' }}>
                                  {sec.secondaryButtonText || 'Learn More'}
                                </span>
                              )}
                            </div>
                          </div>
                          {!bgImg && (
                            <div style={{ position: 'absolute', right: '40px', top: '50%', transform: 'translateY(-50%)', opacity: 0.3, fontSize: '80px' }}>🖼️</div>
                          )}
                        </div>
                      );
                    })()}

                    {/* FEATURE HIGHLIGHTS */}
                    {sType === 'Feature Highlights' && (
                      <div style={{ backgroundColor: '#fff', borderBottom: '1px solid #f1f5f9', padding: '18px 28px' }}>
                        {sec.customContent?.length > 0 ? (
                          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(sec.customContent.length, 4)}, 1fr)`, gap: '0', borderTop: '1px solid #f1f5f9', borderLeft: '1px solid #f1f5f9' }}>
                            {sec.customContent.slice(0, 4).map((feat, i) => (
                              <div key={feat.id || i} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '18px 20px', borderRight: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9' }}>
                                <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: feat.iconBg || '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>
                                  {feat.icon || '✅'}
                                </div>
                                <div>
                                  <div style={{ fontSize: '12.5px', fontWeight: '700', color: '#111827' }}>{feat.title}</div>
                                  <div style={{ fontSize: '10.5px', color: '#6b7280', marginTop: '2px' }}>{feat.description}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div style={{ padding: '24px', textAlign: 'center', color: '#9ca3af', fontSize: '12px', border: '1.5px dashed #e5e7eb', borderRadius: '10px' }}>
                            📦 No feature highlights configured — add items in the section editor
                          </div>
                        )}
                      </div>
                    )}

                    {/* PROMOTIONAL BANNER GRID */}
                    {sType === 'Promotional Banner Grid' && (() => {
                      const items = sec.customContent || [];
                      if (items.length === 0) return (
                        <div style={{ padding: '20px 24px', backgroundColor: '#f3f4f6' }}>
                          <div style={{ padding: '32px', textAlign: 'center', color: '#9ca3af', fontSize: '12px', border: '1.5px dashed #e5e7eb', borderRadius: '12px', backgroundColor: '#fff' }}>
                            🖼️ No promotional banners configured — add banners in the section editor
                          </div>
                        </div>
                      );
                      return (
                        <div style={{ padding: '20px 24px', backgroundColor: '#f3f4f6' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                            {items.slice(0, 4).map((promo, i) => {
                              const bg = promo.backgroundColor || promo.bg || ['#1a5c2e', '#f97316', '#7c1f1f', '#fbbf24'][i % 4];
                              const isDark = bg !== '#fbbf24' && bg !== '#fff' && bg !== '#f5f5f5';
                              const imgSrc = promo.imageUrl || promo.image;
                              return (
                                <div key={promo.id || i} style={{ borderRadius: '16px', overflow: 'hidden', backgroundColor: bg, display: 'flex', height: '160px' }}>
                                  <div style={{ flex: 1, padding: '18px 16px 18px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                    <div>
                                      {promo.label && (
                                        promo.labelPill ? (
                                          <span style={{ display: 'inline-block', backgroundColor: '#ea580c', color: 'white', fontSize: '10px', fontWeight: '800', padding: '2px 8px', borderRadius: '12px', marginBottom: '8px', textTransform: 'uppercase' }}>{promo.label}</span>
                                        ) : (
                                          <div style={{ fontSize: '10px', fontWeight: '700', color: promo.labelColor || '#f97316', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>{promo.label}</div>
                                        )
                                      )}
                                      <div style={{ fontSize: '14px', fontWeight: '800', color: isDark ? 'white' : '#111827', lineHeight: 1.25 }}>{promo.title}</div>
                                      {promo.description && <div style={{ fontSize: '11px', color: isDark ? 'rgba(255,255,255,0.75)' : '#6b7280', marginTop: '4px' }}>{promo.description}</div>}
                                    </div>
                                    {promo.buttonText && (
                                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', backgroundColor: 'rgba(255,255,255,0.15)', color: isDark ? 'white' : '#111827', fontSize: '11px', fontWeight: '700', padding: '7px 14px', borderRadius: '6px', border: isDark ? '1.5px solid rgba(255,255,255,0.5)' : '1.5px solid #111827', alignSelf: 'flex-start', cursor: 'pointer' }}>
                                        {promo.buttonText} →
                                      </span>
                                    )}
                                  </div>
                                  {imgSrc && (
                                    <div style={{ width: '44%', flexShrink: 0, overflow: 'hidden' }}>
                                      <img
                                        src={imgSrc}
                                        alt={promo.title}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                                        onError={(e) => {
                                          e.target.onerror = null;
                                          e.target.src = '/logo.png';
                                          e.target.style.opacity = '0.35';
                                          e.target.style.objectFit = 'contain';
                                        }}
                                      />
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })()}

                    {/* CATEGORIES */}
                    {sType === 'Categories' && (() => {
                      const CAT_COLORS = ['#3d6b2e', '#6b3d7c', '#1e6b5e', '#6b4e1e', '#7c1f1f', '#1e3d6b', '#2d5a3d'];
                      const catList = (categories.filter(c => (sec.items || []).includes(c.id)).length > 0
                        ? categories.filter(c => (sec.items || []).includes(c.id))
                        : categories
                      ).slice(0, sec.productLimit || 7);
                      return (
                        <div style={{ padding: '24px 24px', backgroundColor: '#fff' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: '#111827' }}>{sec.title || 'Shop by categories'}</h3>
                            <span style={{ fontSize: '12px', color: '#ea580c', fontWeight: '700', cursor: 'pointer' }}>{sec.buttonText || 'All Categories'} →</span>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '10px' }}>
                            {catList.map((cat, idx) => (
                              <div key={cat.id} style={{ borderRadius: '14px', overflow: 'hidden', backgroundColor: CAT_COLORS[idx % CAT_COLORS.length], height: '155px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '14px 12px 0', cursor: 'pointer', position: 'relative' }}>
                                <div>
                                  <div style={{ fontSize: '12px', fontWeight: '800', color: 'white', lineHeight: 1.2 }}>{cat.name}</div>
                                  <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.65)', marginTop: '3px' }}>Local Market</div>
                                </div>
                                <div style={{ height: '80px', margin: '0 -4px', position: 'relative', overflow: 'hidden', borderRadius: '8px 8px 0 0' }}>
                                  {cat.icon ? (
                                    <img
                                      src={cat.icon}
                                      alt={cat.name}
                                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                                      onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = '/logo.png';
                                        e.target.style.opacity = '0.35';
                                        e.target.style.objectFit = 'contain';
                                      }}
                                    />
                                  ) : (
                                    <div style={{ width: '100%', height: '100%', backgroundColor: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px' }}>🛒</div>
                                  )}
                                </div>
                              </div>
                            ))}
                            {/* Arrow more card */}
                            <div style={{ borderRadius: '14px', backgroundColor: '#f3f4f6', height: '155px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '1px solid #e5e7eb' }}>
                              <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#111827', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '18px', fontWeight: '700' }}>→</div>
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {/* PRODUCT SECTIONS */}
                    {isProductSection(sType) && (() => {
                      const ACCENT_LABELS = {
                        'Best Deals': 'HOT DEALS',
                        'New Arrivals': 'JUST LANDED',
                        'Recently Viewed': 'YOUR HISTORY',
                        'Featured Products': 'HAND PICKED',
                        'Trending Products': 'TRENDING NOW',
                        'Best Sellers': 'TOP RATED',
                        'Limited Products': 'LIMITED STOCK',
                        'Recommended Products': 'FOR YOU',
                      };
                      const accentLabel = ACCENT_LABELS[sType] || 'FEATURED';
                      return (
                        <div style={{ padding: '28px 28px 32px', backgroundColor: '#fff' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '22px' }}>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                                <div style={{ width: '20px', height: '2.5px', backgroundColor: '#16a34a', borderRadius: '2px' }} />
                                <span style={{ fontSize: '10px', fontWeight: '800', color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{accentLabel}</span>
                              </div>
                              <h2 style={{ margin: 0, fontSize: '22px', fontWeight: '900', color: '#111827', letterSpacing: '-0.02em', lineHeight: 1.1 }}>{sec.title || sType}</h2>
                              {sec.subtitle && (
                                <p style={{ margin: '5px 0 0', fontSize: '12px', color: '#6b7280', lineHeight: 1.5 }}>{sec.subtitle}</p>
                              )}
                            </div>
                            <a style={{ fontSize: '12.5px', color: '#16a34a', fontWeight: '700', cursor: 'pointer', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap', paddingBottom: '3px', borderBottom: '1.5px solid #16a34a' }}>
                              {sec.buttonText || 'See All'} →
                            </a>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                            {(previewProds.length > 0 ? previewProds : products).slice(0, sec.productLimit || 8).map((prod, pIdx) => {
                              const saleP = Number(prod.salePrice || 0);
                              const regP = Number(prod.regularPrice || 0);
                              const hasDiscount = regP > saleP && saleP > 0;
                              const discountPct = hasDiscount ? Math.round((1 - saleP / regP) * 100) : 0;
                              const isOrganic = prod.isFeatured || pIdx % 2 === 1;
                              return (
                                <div key={prod.id} style={{ borderRadius: '16px', overflow: 'hidden', backgroundColor: '#fff', cursor: 'pointer', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', border: '1px solid #f1f5f9' }}>
                                  <div style={{ position: 'relative', backgroundColor: '#f8fafc', height: '160px', overflow: 'hidden' }}>
                                    <img
                                      src={prod.images?.[0] || 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=400'}
                                      alt={prod.name}
                                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                                      onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=400'; }}
                                    />
                                    {hasDiscount && (
                                      <div style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <span style={{ backgroundColor: '#dc2626', color: 'white', fontSize: '9px', fontWeight: '800', padding: '3px 8px', borderRadius: '5px', textTransform: 'uppercase' }}>Best Sale</span>
                                        <span style={{ backgroundColor: '#ea580c', color: 'white', fontSize: '9px', fontWeight: '800', padding: '3px 7px', borderRadius: '5px' }}>{discountPct}% off</span>
                                      </div>
                                    )}
                                    {isOrganic && (
                                      <span style={{ position: 'absolute', top: '10px', right: '10px', backgroundColor: '#16a34a', color: 'white', fontSize: '8.5px', fontWeight: '800', padding: '3px 7px', borderRadius: '5px', textTransform: 'uppercase' }}>ORGANIC</span>
                                    )}
                                  </div>
                                  <div style={{ padding: '12px 14px 14px' }}>
                                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#111827', marginBottom: '3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{prod.name}</div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                      <span style={{ fontSize: '10px', color: '#9ca3af' }}>{prod.weight || prod.unit || '500g'}</span>
                                      <span style={{ display: 'flex', alignItems: 'center', gap: '2px', fontSize: '10px', color: '#6b7280' }}>
                                        <span style={{ color: '#f59e0b' }}>★</span>
                                        <span>(4.8/5)</span>
                                      </span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                                        <span style={{ fontSize: '17px', fontWeight: '800', color: '#111827' }}>${Number(saleP || regP || 0).toFixed(2)}</span>
                                        {hasDiscount && (
                                          <span style={{ fontSize: '11px', color: '#9ca3af', textDecoration: 'line-through' }}>${regP.toFixed(2)}</span>
                                        )}
                                      </div>
                                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#1a3d1a', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: '300', cursor: 'pointer', flexShrink: 0 }}>+</div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })()}

                    {/* BRANDS */}
                    {sType === 'Brands' && (
                      <div style={{ padding: '28px 28px 32px', backgroundColor: '#f9fafb' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '20px' }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                              <div style={{ width: '20px', height: '2.5px', backgroundColor: '#16a34a', borderRadius: '2px' }} />
                              <span style={{ fontSize: '10px', fontWeight: '800', color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.1em' }}>TRUSTED BRANDS</span>
                            </div>
                            <h2 style={{ margin: 0, fontSize: '22px', fontWeight: '900', color: '#111827', letterSpacing: '-0.02em' }}>{sec.title || 'Our Trusted Brands'}</h2>
                            {sec.subtitle && <p style={{ margin: '5px 0 0', fontSize: '12px', color: '#6b7280' }}>{sec.subtitle}</p>}
                          </div>
                          {sec.buttonText && <a style={{ fontSize: '12.5px', color: '#16a34a', fontWeight: '700', cursor: 'pointer', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', borderBottom: '1.5px solid #16a34a', paddingBottom: '2px' }}>{sec.buttonText} →</a>}
                        </div>
                        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                          {(brands.filter(b => (sec.items || []).includes(b.id)).length > 0
                            ? brands.filter(b => (sec.items || []).includes(b.id))
                            : brands
                          ).slice(0, sec.productLimit || 8).map(brand => (
                            <div key={brand.id} style={{ height: '56px', minWidth: '110px', border: '1px solid #e5e7eb', borderRadius: '10px', backgroundColor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px 18px', cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                              {brand.logo ? (
                                <img
                                  src={brand.logo}
                                  alt={brand.name}
                                  style={{ maxHeight: '36px', maxWidth: '90px', objectFit: 'contain' }}
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = '/logo.png';
                                    e.target.style.opacity = '0.35';
                                    e.target.style.objectFit = 'contain';
                                  }}
                                />
                              ) : (
                                <span style={{ fontSize: '12.5px', fontWeight: '700', color: '#374151' }}>{brand.name}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* RECIPES */}
                    {sType === 'Recipes' && (
                      <div style={{ padding: '28px 28px 32px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '20px' }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                              <div style={{ width: '20px', height: '2.5px', backgroundColor: '#16a34a', borderRadius: '2px' }} />
                              <span style={{ fontSize: '10px', fontWeight: '800', color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.1em' }}>CHEF'S PICKS</span>
                            </div>
                            <h2 style={{ margin: 0, fontSize: '22px', fontWeight: '900', color: '#111827', letterSpacing: '-0.02em' }}>{sec.title || 'Recipe Ideas'}</h2>
                            {sec.subtitle && <p style={{ margin: '5px 0 0', fontSize: '12px', color: '#6b7280' }}>{sec.subtitle}</p>}
                          </div>
                          {sec.buttonText && <a style={{ fontSize: '12.5px', color: '#16a34a', fontWeight: '700', cursor: 'pointer', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', borderBottom: '1.5px solid #16a34a', paddingBottom: '2px' }}>{sec.buttonText} →</a>}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
                          {(recipes.filter(r => (sec.items || []).includes(r.id)).length > 0
                            ? recipes.filter(r => (sec.items || []).includes(r.id))
                            : recipes
                          ).slice(0, sec.productLimit || 3).map(rec => (
                            <div key={rec.id} style={{ borderRadius: '14px', overflow: 'hidden', position: 'relative', height: '170px', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                              <img
                                src={rec.image}
                                alt={rec.title}
                                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                                onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&q=80&w=400'; }}
                              />
                              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,transparent 35%,rgba(0,0,0,0.75) 100%)' }} />
                              <div style={{ position: 'absolute', bottom: '12px', left: '14px', right: '14px' }}>
                                <div style={{ fontSize: '12.5px', fontWeight: '800', color: 'white' }}>{rec.title}</div>
                                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.75)', marginTop: '3px' }}>⏱ {rec.cookingTime}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* TESTIMONIALS */}
                    {sType === 'Testimonials' && (
                      <div style={{ padding: '36px 28px 40px', background: 'linear-gradient(135deg,#1e3a1e 0%,#0f2210 100%)' }}>
                        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
                            <div style={{ width: '20px', height: '2.5px', backgroundColor: '#4ade80', borderRadius: '2px' }} />
                            <span style={{ fontSize: '10px', fontWeight: '800', color: '#4ade80', textTransform: 'uppercase', letterSpacing: '0.1em' }}>HAPPY CUSTOMERS</span>
                            <div style={{ width: '20px', height: '2.5px', backgroundColor: '#4ade80', borderRadius: '2px' }} />
                          </div>
                          <h2 style={{ margin: '0 0 6px', fontSize: '22px', fontWeight: '900', color: 'white', letterSpacing: '-0.02em' }}>{sec.title || 'What Our Customers Say'}</h2>
                          {sec.subtitle && <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>{sec.subtitle}</p>}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
                          {sec.customContent?.length > 0 ? sec.customContent.slice(0, 6).map((test, i) => (
                            <div key={test.id || i} style={{ backgroundColor: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '14px', padding: '18px' }}>
                              <div style={{ fontSize: '15px', color: '#fbbf24', marginBottom: '10px', letterSpacing: '2px' }}>★★★★★</div>
                              <p style={{ margin: '0 0 14px', fontSize: '11px', color: 'rgba(255,255,255,0.78)', fontStyle: 'italic', lineHeight: 1.6 }}>"{test.feedback || test.comment || test.text}"</p>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                {test.avatar ? (
                                  <img src={test.avatar} alt={test.name} style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
                                ) : (
                                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg,#16a34a,#15803d)', color: 'white', fontSize: '13px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{(test.name || 'U')[0]}</div>
                                )}
                                <div>
                                  <div style={{ fontSize: '11px', fontWeight: '700', color: 'white' }}>{test.name}</div>
                                  <div style={{ fontSize: '9.5px', color: 'rgba(255,255,255,0.45)' }}>{test.role || test.designation}</div>
                                </div>
                              </div>
                            </div>
                          )) : (
                            <div style={{ gridColumn: '1/-1', padding: '28px', textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '12px', border: '1.5px dashed rgba(255,255,255,0.2)', borderRadius: '12px' }}>
                              💬 No testimonials configured — add reviews in the section editor
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* WHY CHOOSE US */}
                    {sType === 'Why Choose Us' && (
                      <div style={{ padding: '28px 28px 32px', backgroundColor: '#f0fdf4' }}>
                        <div style={{ textAlign: 'center', marginBottom: '22px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
                            <div style={{ width: '20px', height: '2.5px', backgroundColor: '#16a34a', borderRadius: '2px' }} />
                            <span style={{ fontSize: '10px', fontWeight: '800', color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.1em' }}>OUR PROMISE</span>
                            <div style={{ width: '20px', height: '2.5px', backgroundColor: '#16a34a', borderRadius: '2px' }} />
                          </div>
                          <h2 style={{ margin: '0 0 6px', fontSize: '22px', fontWeight: '900', color: '#111827', letterSpacing: '-0.02em' }}>{sec.title || "Why Choose Grandma's Basket?"}</h2>
                          {sec.subtitle && <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>{sec.subtitle}</p>}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                          {sec.customContent?.length > 0 ? sec.customContent.slice(0, 6).map((reason, i) => (
                            <div key={reason.id || i} style={{ backgroundColor: '#fff', borderRadius: '12px', overflow: 'hidden', border: '1px solid #d1fae5', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                              {(reason.imageUrl || reason.image) && (
                                <div style={{ height: '105px', overflow: 'hidden' }}>
                                  <img src={reason.imageUrl || reason.image} alt={reason.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none'; }} />
                                </div>
                              )}
                              <div style={{ padding: '14px' }}>
                                <div style={{ fontSize: '13px', fontWeight: '800', color: '#111827', marginBottom: '5px' }}>{reason.title}</div>
                                <div style={{ fontSize: '10.5px', color: '#6b7280', lineHeight: 1.5 }}>{reason.description}</div>
                              </div>
                            </div>
                          )) : (
                            <div style={{ gridColumn: '1/-1', padding: '28px', textAlign: 'center', color: '#9ca3af', fontSize: '12px', border: '1.5px dashed #e5e7eb', borderRadius: '12px', backgroundColor: '#fff' }}>
                              ✅ No reasons configured — add items in the section editor
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* NEWSLETTER */}
                    {sType === 'Newsletter' && (
                      <div style={{ background: 'linear-gradient(135deg,#16a34a 0%,#15803d 100%)', padding: '36px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '24px' }}>
                        <div style={{ flex: 1 }}>
                          <h3 style={{ margin: '0 0 6px', fontSize: '20px', fontWeight: '900', color: 'white' }}>{sec.title || 'Please subscribe for latest updates'}</h3>
                          <p style={{ margin: 0, fontSize: '12.5px', color: 'rgba(255,255,255,0.78)', lineHeight: 1.55 }}>{sec.subtitle || 'Get exclusive deals, farm-fresh alerts and 20% cashback with a subscription.'}</p>
                        </div>
                        <div style={{ display: 'flex', gap: '10px', flexShrink: 0 }}>
                          <input type="email" placeholder="Enter your email address..." disabled style={{ padding: '11px 18px', fontSize: '12px', borderRadius: '8px', border: 'none', width: '220px', outline: 'none', color: '#374151' }} />
                          <span style={{ display: 'inline-block', backgroundColor: '#ea580c', color: 'white', fontSize: '12.5px', fontWeight: '800', padding: '11px 22px', borderRadius: '8px', cursor: 'pointer', whiteSpace: 'nowrap' }}>{sec.buttonText || 'Subscribe Now'}</span>
                        </div>
                      </div>
                    )}

                  </div>
                );
              })}

              {/* ═══ FOOTER ═══ */}
              <div style={{ backgroundColor: '#0f1a12', color: '#9ca3af', padding: '36px 40px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2.2fr 1fr 1fr 1fr', gap: '32px', marginBottom: '28px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '9px', marginBottom: '14px' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg,#16a34a,#15803d)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '900', fontSize: '16px', fontStyle: 'italic' }}>G</div>
                      <div>
                        <div style={{ fontWeight: '800', fontSize: '13.5px', color: 'white' }}>Grandma's Basket</div>
                        <div style={{ fontSize: '9px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Fresh &amp; Local</div>
                      </div>
                    </div>
                    <p style={{ margin: '0 0 14px', fontSize: '11px', lineHeight: 1.7, maxWidth: '210px' }}>Delivering authentic Indian groceries &amp; spices from trusted suppliers to your doorstep across the UK.</p>
                  </div>
                  {[['Quick Links', ['Home', 'Categories', 'Offers', 'Recipes', 'Blog']], ['Customer Care', ['Track Order', 'Returns', 'FAQ', 'Contact', 'WhatsApp']], ['Follow Us', ['Instagram', 'Facebook', 'YouTube', 'Twitter', 'Pinterest']]].map(([title, links]) => (
                    <div key={title}>
                      <div style={{ fontWeight: '700', fontSize: '12.5px', color: 'white', marginBottom: '12px' }}>{title}</div>
                      {links.map(link => <div key={link} style={{ fontSize: '11px', marginBottom: '7px', cursor: 'pointer', color: '#9ca3af' }}>{link}</div>)}
                    </div>
                  ))}
                </div>
                <div style={{ borderTop: '1px solid #1f2d1f', paddingTop: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10.5px' }}>
                  <span>© 2024 Grandma's Basket Ltd. All rights reserved.</span>
                  <div style={{ display: 'flex', gap: '16px', color: '#6b7280' }}>
                    <span style={{ cursor: 'pointer' }}>Privacy Policy</span>
                    <span style={{ cursor: 'pointer' }}>Terms of Service</span>
                    <span style={{ cursor: 'pointer' }}>Cookie Policy</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div >
      )}

      {/* ── CREATE HOMEPAGE SECTION MODAL ── */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Add Homepage Section"
        footer={
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button variant="outline" size="sm" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleCreateSection} disabled={saving}>
              {saving ? 'Creating...' : 'Create Section'}
            </Button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Select
            label="Section Type"
            value={newSectionType}
            onChange={(e) => {
              setNewSectionType(e.target.value);
              setNewSectionTitle(e.target.value);
            }}
            options={sectionTypesList}
          />

          <Input
            label="Title"
            placeholder="e.g. Best Deals of the Week"
            value={newSectionTitle}
            onChange={(e) => setNewSectionTitle(e.target.value)}
          />

          <Input
            label="Subtitle"
            placeholder="e.g. Super fresh and discounted organic items"
            value={newSectionSubtitle}
            onChange={(e) => setNewSectionSubtitle(e.target.value)}
          />

          {isProductSection(newSectionType) && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <Select
                label="Data Source"
                value={newSectionDataSource}
                onChange={(e) => setNewSectionDataSource(e.target.value)}
                options={[
                  'Featured Products',
                  'Latest Products',
                  'Manual Selection',
                  'Category Based',
                  'Brand Based',
                  'Offer Products'
                ]}
              />
              <Input
                label="Product Limit"
                type="number"
                value={newSectionProductLimit}
                onChange={(e) => setNewSectionProductLimit(e.target.value)}
              />
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Input
              label="Redirect Button Text"
              placeholder="e.g. View All"
              value={newSectionButtonText}
              onChange={(e) => setNewSectionButtonText(e.target.value)}
            />
            <Input
              label="Redirect URL"
              placeholder="e.g. /offers"
              value={newSectionButtonUrl}
              onChange={(e) => setNewSectionButtonUrl(e.target.value)}
            />
          </div>
        </div>
      </Modal>

    </div >
  );
};

export default HomeConfiguration;
