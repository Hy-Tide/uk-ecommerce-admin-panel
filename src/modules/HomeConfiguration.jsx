import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  GripVertical, Save, Plus, Trash2, Search, ArrowUp, ArrowDown,
  ToggleLeft, ToggleRight, X, AlertCircle, RefreshCw, Eye
} from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';
import Input, { Select, Textarea, Checkbox, MultiSelect } from '../components/Input';
import Uploader from '../components/Uploader';
import Modal from '../components/Modal';
import CmsPreview from './CmsPreview';

// ------------------------------------------------------------------
// 1. SECTION CONFIGURATION SCHEMA
// ------------------------------------------------------------------
const SECTION_TYPES = [
  'Hero Banner', 'Service Features', 'Offer Banners', 'Shop by Categories',
  'Today\'s Best Deals', 'Limited Products', 'Recommended Products', 'New Arrivals',
  'Recently Viewed', 'Subscription Banner', 'Shop by Brands', 'Popular Recipes',
  'Testimonials', 'Why Choose Us', 'Newsletter'
];

const SECTION_CONFIG = {
  'Hero Banner': {
    label: 'Home Banner',
    fields: [
      { name: 'highlightTitle', label: 'Announcement Text', type: 'text' },
      { name: 'title', label: 'Main Heading', type: 'text', required: true },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'primaryButtonText', label: 'Primary Button Text', type: 'text' },
      { name: 'primaryButtonUrl', label: 'Primary Button URL', type: 'text' },
      { name: 'secondaryButtonText', label: 'Secondary Button Text', type: 'text' },
      { name: 'secondaryButtonUrl', label: 'Secondary Button URL', type: 'text' },
      { name: 'backgroundImage', label: 'Background Image', type: 'image' },
      { name: 'desktopImage', label: 'Main/Foreground Image', type: 'image' },
      { name: 'items', label: 'Highlight Items', type: 'itemsList',
        itemFields: [
          { name: 'iconImage', label: 'Icon', type: 'image' },
          { name: 'title', label: 'Text', type: 'text', required: true }
        ]
      }
    ]
  },
  'Service Features': {
    label: 'Benefits / Features',
    fields: [
      { name: 'title', label: 'Section Title', type: 'text' },
      { name: 'items', label: 'Feature Items', type: 'itemsList',
        itemFields: [
          { name: 'iconImage', label: 'Icon', type: 'image' },
          { name: 'title', label: 'Title', type: 'text', required: true },
          { name: 'description', label: 'Description', type: 'textarea' }
        ]
      }
    ]
  },
  'Shop by Categories': {
    label: 'Shop By Categories',
    fields: [
      { name: 'title', label: 'Section Title', type: 'text', required: true },
      { name: 'subtitle', label: 'Section Subtitle', type: 'text' },
      { name: 'categoryIds', label: 'Category Selection', type: 'categorySelect' },
      { name: 'productLimit', label: 'Display Limit', type: 'number', defaultValue: 10 },
    ]
  },
  'Today\'s Best Deals': {
    label: 'Best Deals',
    fields: [
      { name: 'title', label: 'Section Title', type: 'text', required: true },
      { name: 'subtitle', label: 'Section Subtitle', type: 'text' },
      { name: 'dataSource', label: 'Data Source', type: 'select', options: ['Automatic', 'Manual'] },
      { name: 'selectedProductIds', label: 'Product Selection', type: 'productSelect' },
      { name: 'productLimit', label: 'Display Limit', type: 'number', defaultValue: 10 },
    ]
  },
  'Limited Products': {
    label: 'Limited Products',
    fields: [
      { name: 'title', label: 'Section Title', type: 'text', required: true },
      { name: 'infoNote', label: 'Products in this section are automatically fetched.', type: 'info' },
      { name: 'productLimit', label: 'Display Limit', type: 'number', defaultValue: 8 },
    ]
  },
  'Recommended Products': {
    label: 'Recommended Products',
    fields: [
      { name: 'title', label: 'Section Title', type: 'text', required: true },
      { name: 'selectedProductIds', label: 'Product Selection', type: 'productSelect' },
      { name: 'productLimit', label: 'Display Limit', type: 'number', defaultValue: 8 },
    ]
  },
  'New Arrivals': {
    label: 'New Arrivals',
    fields: [
      { name: 'highlightTitle', label: 'Badge Text', type: 'text' },
      { name: 'title', label: 'Section Title', type: 'text', required: true },
      { name: 'productLimit', label: 'Display Limit', type: 'number', defaultValue: 10 },
    ]
  },
  'Recently Viewed': {
    label: 'Recently Viewed',
    fields: [
      { name: 'title', label: 'Section Title', type: 'text', required: true },
      { name: 'productLimit', label: 'Display Limit', type: 'number', defaultValue: 10 },
    ]
  },
  'Offer Banners': {
    label: 'Offer Banners',
    fields: [
      { name: 'title', label: 'Section Title', type: 'text', required: true },
      { name: 'items', label: 'Offers List', type: 'itemsList',
        itemFields: [
          { name: 'title', label: 'Title', type: 'text', required: true },
          { name: 'announcementText', label: 'Announcement Text', type: 'text' },
          { name: 'description', label: 'Description', type: 'textarea' },
          { name: 'image', label: 'Banner Image', type: 'image' },
          { name: 'buttonText', label: 'Button Text', type: 'text' },
          { name: 'buttonUrl', label: 'Button URL', type: 'text' },
          { name: 'bg', label: 'Background Color (Hex)', type: 'text' }
        ]
      }
    ]
  },
  'Subscription Banner': {
    label: 'Subscription Banner',
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'subtitle', label: 'Subtitle', type: 'text' },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'highlightTitle', label: 'Discount / Highlight', type: 'text' },
      { name: 'desktopImage', label: 'Image', type: 'image' },
      { name: 'buttonText', label: 'Button Text', type: 'text' },
      { name: 'buttonUrl', label: 'Button URL', type: 'text' },
    ]
  },
  'Shop by Brands': {
    label: 'Shop By Brands',
    fields: [
      { name: 'title', label: 'Section Title', type: 'text', required: true },
      { name: 'brandIds', label: 'Brand Selection', type: 'brandSelect' },
      { name: 'productLimit', label: 'Display Limit', type: 'number', defaultValue: 10 },
    ]
  },
  'Popular Recipes': {
    label: 'Popular Recipes',
    fields: [
      { name: 'highlightTitle', label: 'Badge Text', type: 'text' },
      { name: 'title', label: 'Section Title', type: 'text', required: true },
      { name: 'subtitle', label: 'Section Subtitle', type: 'text' },
      { name: 'recipeIds', label: 'Recipe Selection', type: 'recipeSelect' },
      { name: 'productLimit', label: 'Display Limit', type: 'number', defaultValue: 6 },
    ]
  },
  'Testimonials': {
    label: 'Testimonials',
    fields: [
      { name: 'title', label: 'Section Title', type: 'text', required: true },
      // Inline items configuration
      { name: 'items', label: 'Testimonials List', type: 'itemsList', 
        itemFields: [
          { name: 'customerName', label: 'Customer Name', type: 'text', required: true },
          { name: 'customerImage', label: 'Customer Image', type: 'image' },
          { name: 'review', label: 'Review', type: 'textarea', required: true },
          { name: 'rating', label: 'Rating (1-5)', type: 'number', required: true },
          { name: 'designation', label: 'Designation', type: 'text' },
          { name: 'verified', label: 'Verified', type: 'checkbox' }
        ]
      }
    ]
  },
  'Why Choose Us': {
    label: 'Why Choose Us',
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'iconImage', label: 'Icon / Image', type: 'image' },
    ]
  },
  'Newsletter': {
    label: 'Newsletter',
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'buttonText', label: 'Button Text', type: 'text' },
      { name: 'backgroundImage', label: 'Background Image', type: 'image' }
    ]
  }
};

const generateUniqueId = (prefix = 'id') => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

const HomeConfiguration = ({
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
  const [products, setProducts] = useState(initialProducts);
  const [categories, setCategories] = useState(initialCategories);
  const [brands, setBrands] = useState(initialBrands);
  const [recipes, setRecipes] = useState(initialRecipes);

  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSectionId, setSelectedSectionId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  // New Draft State
  const [draft, setDraft] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Selector pagination & search state
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

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
          const normalized = sectionsArray.map(s => ({ ...s, id: s.id || s._id }));
          const sorted = [...normalized].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
          setSections(sorted);
          if (sorted.length > 0) handleSelectSection(sorted[0]);
        } else {
          setSections([]);
        }
      } catch (err) {
        console.error('Error fetching home configuration:', err);
        setSections([]);
      } finally {
        setLoading(false);
      }
    };

    loadHomeConfiguration();
  }, [cmsData.homeSections]);

  const fetchedFlags = useRef({
    categories: initialCategories.length > 0,
    brands: initialBrands.length > 0,
    products: initialProducts.length > 0,
    recipes: initialRecipes.length > 0
  });

  const fetchDependencies = async () => {
    try {
      const { getData } = await import('../services/api');
      const queryParams = { limit: 100 };
      
      if (!fetchedFlags.current.categories) {
        let catRes = await getData('admin/categories', queryParams);
        let catList = catRes?.data?.categories || (Array.isArray(catRes?.data) ? catRes.data : []);
        let subRes = await getData('admin/subcategories', queryParams);
        let subList = subRes?.data?.subCategories || subRes?.data?.subcategories || (Array.isArray(subRes?.data) ? subRes.data : []);
        const formattedCats = catList.map(c => ({ id: c._id || c.id, name: c.name }));
        const formattedSubs = Array.isArray(subList) ? subList.map(s => ({ id: s._id || s.id, name: s.name })) : [];
        setCategories([...formattedCats, ...formattedSubs]);
        fetchedFlags.current.categories = true;
      }
      if (!fetchedFlags.current.brands) {
        let brandRes = await getData('admin/brands', queryParams);
        let brandList = brandRes?.data?.brands || (Array.isArray(brandRes?.data) ? brandRes.data : []);
        setBrands(brandList.map(b => ({ id: b._id || b.id, name: b.name })));
        fetchedFlags.current.brands = true;
      }
      if (!fetchedFlags.current.products) {
        let prodRes = await getData('admin/products', queryParams);
        let prodList = prodRes?.data?.products || (Array.isArray(prodRes?.data) ? prodRes.data : []);
        setProducts(prodList.map(p => ({ id: p._id || p.id, name: p.name || p.title, sku: p.sku })));
        fetchedFlags.current.products = true;
      }
      if (!fetchedFlags.current.recipes) {
        let recipeRes = await getData('admin/recipes', queryParams);
        let recipeList = recipeRes?.data?.recipes || (Array.isArray(recipeRes?.data) ? recipeRes.data : []);
        setRecipes(recipeList.map(r => ({ id: r._id || r.id, name: r.title || r.name })));
        fetchedFlags.current.recipes = true;
      }
    } catch (e) {
      console.warn("Failed fetching dependencies", e);
    }
  };

  useEffect(() => {
    fetchDependencies();
  }, []);

  const handleSelectSection = (section) => {
    setSelectedSectionId(section.id);
    setDraft({ ...section });
    setIsEditing(false);
  };

  const handleOpenPreview = () => {
    // Save current state to local storage for the preview to read
    const payload = sections.map(s => {
      // If the draft is the current section, use its values
      if (draft && s.id === draft.id) return draft;
      return s;
    });
    localStorage.setItem('cmsPreviewState', JSON.stringify(payload));
    setPreviewOpen(true);
  };

  const handleAddSection = () => {
    const newSection = {
      id: generateUniqueId('draft'),
      isDraft: true,
      sectionType: 'Hero Banner',
      title: 'New Section',
      displayOrder: sections.length + 1,
      enabled: true
    };
    setSelectedSectionId(newSection.id);
    setDraft(newSection);
    setIsEditing(true);
  };

  const handleSectionTypeChange = (e) => {
    const type = e.target.value;
    setDraft(prev => ({
      ...prev,
      sectionType: type,
      title: SECTION_CONFIG[type]?.label || type,
      // Clear out irrelevant data when switching type
      subtitle: '', description: '', desktopImage: '', mobileImage: '', buttonText: '', buttonUrl: '',
      productLimit: SECTION_CONFIG[type]?.fields.find(f => f.name === 'productLimit')?.defaultValue || 10,
      selectedProductIds: [], categoryIds: [], brandIds: [], recipeIds: [], items: []
    }));
  };

  const updateDraftField = (key, value) => {
    setDraft(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveDraft = async () => {
    if (!draft) return;
    
    // Validation
    const config = SECTION_CONFIG[draft.sectionType];
    if (config) {
      for (const field of config.fields) {
        if (field.required && !draft[field.name]) {
          addToast(`${field.label} is required`, 'warning');
          return;
        }
      }
    }

    setSaving(true);
    try {
      const payload = { ...draft };
      delete payload.id; // Backend generates ID
      delete payload.isDraft;

      // Extract File objects
      let hasFile = false;
      const fileKeys = ['desktopImage', 'mobileImage', 'backgroundImage', 'iconImage', 'bannerImage'];
      fileKeys.forEach(k => {
        if (payload[k] instanceof File) hasFile = true;
        if (!payload[k]) delete payload[k]; // clean up empty files
      });

      // Also check items array for files if we support image uploads in items (e.g. Testimonials)
      if (payload.items && Array.isArray(payload.items)) {
        payload.items.forEach(item => {
           if (item.customerImage instanceof File) hasFile = true;
        });
      }

      const formData = new FormData();
      Object.keys(payload).forEach(key => {
        if (key === 'items') {
            formData.append(key, JSON.stringify(payload[key])); // Stringify items for now unless backend specifically supports nested files. Usually it's better to stringify.
        } else if (fileKeys.includes(key) && payload[key] instanceof File) {
          formData.append(key, payload[key]);
        } else if (typeof payload[key] === 'object' && !(payload[key] instanceof File)) {
          formData.append(key, JSON.stringify(payload[key]));
        } else {
          formData.append(key, payload[key]);
        }
      });

      let updatedSections = [...sections];
      if (draft.isDraft) {
        const { createHomeConfig } = await import('../services/api');
        const res = await createHomeConfig(hasFile ? formData : payload);
        if (res && res.success && res.data) {
          const sectionData = res.data.section || res.data;
          const newId = sectionData.id || sectionData._id || generateUniqueId('sec');
          const savedSection = { ...draft, ...sectionData, id: newId, isDraft: false };
          updatedSections.push(savedSection);
          setDraft(savedSection);
          setSelectedSectionId(newId);
          setIsEditing(false);
        }
      } else {
        const { updateHomeConfig } = await import('../services/api');
        await updateHomeConfig(draft.id, hasFile ? formData : payload);
        updatedSections = updatedSections.map(s => s.id === draft.id ? { ...draft, isDraft: false } : s);
        setIsEditing(false);
      }

      const sorted = [...updatedSections].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
      setSections(sorted);
      setCmsData({ ...cmsData, homeSections: sorted });
      addToast('Section saved successfully', 'success');
    } catch (err) {
      console.error('Update section error:', err);
      addToast('Error saving to server', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSection = async (id) => {
    if (!window.confirm('Are you sure you want to delete this section?')) return;
    try {
      const { deleteHomeConfig } = await import('../services/api');
      const section = sections.find(s => s.id === id);
      if (!section.isDraft) {
        await deleteHomeConfig(id);
      }
      const updated = sections.filter(s => s.id !== id);
      setSections(updated);
      setCmsData({ ...cmsData, homeSections: updated });
      if (selectedSectionId === id) {
        if (updated.length > 0) handleSelectSection(updated[0]);
        else { setSelectedSectionId(null); setDraft(null); }
      }
      addToast('Section deleted', 'success');
    } catch (e) {
      addToast('Failed to delete section', 'error');
    }
  };

  const handleToggleStatus = async (id) => {
    const section = sections.find(s => s.id === id);
    if (!section || section.isDraft) return;
    try {
      const { toggleHomeConfigStatus } = await import('../services/api');
      await toggleHomeConfigStatus(id);
      const updated = sections.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s);
      setSections(updated);
      setCmsData({ ...cmsData, homeSections: updated });
      if (draft && draft.id === id) setDraft({ ...draft, enabled: !draft.enabled });
      addToast(`Section ${section.enabled ? 'disabled' : 'enabled'}`, 'success');
    } catch (e) {
      addToast('Failed to toggle status', 'error');
    }
  };

  const handleDragStart = (e, index) => {
    e.dataTransfer.setData('text/plain', index);
  };
  const handleDrop = async (e, destIndex) => {
    e.preventDefault();
    const sourceIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
    if (sourceIndex === destIndex) return;

    const newSections = [...sections];
    const [moved] = newSections.splice(sourceIndex, 1);
    newSections.splice(destIndex, 0, moved);

    const updated = newSections.map((s, idx) => ({ ...s, displayOrder: idx + 1 }));
    setSections(updated);
    setCmsData({ ...cmsData, homeSections: updated });

    try {
      const { reorderHomeConfigs } = await import('../services/api');
      await reorderHomeConfigs(updated.map(s => ({ id: s.id, displayOrder: s.displayOrder })));
      addToast('Layout order updated', 'success');
    } catch (err) {
      addToast('Order saved locally (API error)', 'warning');
    }
  };

  // Render Field Input based on Schema
  const renderField = (field, value, onChange) => {
    switch (field.type) {
      case 'text':
      case 'number':
      case 'url':
        return (
          <Input 
            label={field.label} 
            type={field.type} 
            value={value || ''} 
            onChange={e => onChange(field.name, e.target.value)} 
            placeholder={field.placeholder}
            required={field.required}
            disabled={!isEditing}
          />
        );
      case 'textarea':
        return (
          <Textarea 
            label={field.label} 
            value={value || ''} 
            onChange={e => onChange(field.name, e.target.value)} 
            rows={4}
            required={field.required}
            disabled={!isEditing}
          />
        );
      case 'select':
        return (
          <Select 
            label={field.label} 
            value={value || ''} 
            onChange={e => onChange(field.name, e.target.value)}
            options={field.options.map(o => ({ value: o, label: o }))}
            required={field.required}
            disabled={!isEditing}
          />
        );
      case 'categorySelect':
        return (
          <MultiSelect 
            label={field.label} 
            value={value || []} 
            onChange={e => onChange(field.name, e)}
            options={categories.map(c => ({ value: c.id, label: c.name }))}
            disabled={!isEditing}
          />
        );
      case 'brandSelect':
        return (
          <MultiSelect 
            label={field.label} 
            value={value || []} 
            onChange={e => onChange(field.name, e)}
            options={brands.map(c => ({ value: c.id, label: c.name }))}
            disabled={!isEditing}
          />
        );
      case 'productSelect':
        return (
          <MultiSelect 
            label={field.label} 
            value={value || []} 
            onChange={e => onChange(field.name, e)}
            options={products.map(c => ({ value: c.id, label: c.name }))}
            disabled={!isEditing}
          />
        );
      case 'recipeSelect':
        return (
          <MultiSelect 
            label={field.label} 
            value={value || []} 
            onChange={e => onChange(field.name, e)}
            options={recipes.map(c => ({ value: c.id, label: c.name }))}
            disabled={!isEditing}
          />
        );
      case 'image':
        return (
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              {field.label} {field.required && '*'}
            </label>
            {isEditing && (
              <input 
                type="file" 
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    onChange(field.name, e.target.files[0]);
                  }
                }} 
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '8px',
                  border: '1px dashed var(--border-color)',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg-app)',
                  cursor: 'pointer'
                }}
              />
            )}
            {value && (
              <div style={{ marginTop: '8px', position: 'relative', display: 'inline-block' }}>
                <img 
                  src={typeof value === 'string' ? value : (value instanceof File ? URL.createObjectURL(value) : '')} 
                  alt="Preview" 
                  style={{ height: '80px', borderRadius: '8px', objectFit: 'cover', border: '1px solid var(--border-color)' }} 
                />
                {isEditing && (
                  <button
                    type="button"
                    onClick={() => onChange(field.name, '')}
                    style={{
                      position: 'absolute',
                      top: '-6px',
                      right: '-6px',
                      background: 'var(--danger)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '50%',
                      width: '20px',
                      height: '20px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px'
                    }}
                  >
                    ×
                  </button>
                )}
              </div>
            )}
          </div>
        );
      case 'checkbox':
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <input 
              type="checkbox" 
              checked={!!value} 
              onChange={e => onChange(field.name, e.target.checked)} 
              style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }}
              disabled={!isEditing}
            />
            <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>{field.label}</label>
          </div>
        );
      case 'info':
        return (
          <div style={{ padding: '12px', backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#2563eb', borderRadius: '8px', fontSize: '13px', border: '1px solid rgba(59, 130, 246, 0.2)', marginBottom: '16px' }}>
            <strong>Note: </strong> {field.label}
          </div>
        );
      default:
        return null;
    }
  };

  // Render Items List (e.g. Testimonials)
  const renderItemsList = (field, items, onChange) => {
    const list = items || [];
    return (
      <div style={{ marginBottom: '20px', padding: '16px', border: '1px solid var(--border-color)', borderRadius: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
          <h4 style={{ fontSize: '14px', fontWeight: '700' }}>{field.label}</h4>
          {isEditing && (
            <Button size="sm" variant="outline" icon={Plus} onClick={() => onChange(field.name, [...list, {}])}>Add Item</Button>
          )}
        </div>
        {list.map((item, idx) => (
          <div key={idx} style={{ padding: '16px', background: 'var(--bg-muted)', borderRadius: '8px', marginBottom: '12px', position: 'relative' }}>
            {isEditing && (
              <button 
                onClick={() => onChange(field.name, list.filter((_, i) => i !== idx))}
                style={{ position: 'absolute', top: '8px', right: '8px', background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}
              >
                <Trash2 size={16} />
              </button>
            )}
            <div style={{ display: 'grid', gap: '12px' }}>
              {field.itemFields.map(f => (
                <div key={f.name}>
                  {renderField(f, item[f.name], (name, val) => {
                    if (!isEditing) return;
                    const newList = [...list];
                    newList[idx] = { ...newList[idx], [name]: val };
                    onChange(field.name, newList);
                  })}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '700', letterSpacing: '-0.02em', margin: 0 }}>Dynamic Home Configuration</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Manage landing page sections using pre-defined layouts.</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button variant="outline" size="sm" icon={Eye} onClick={handleOpenPreview}>
            Live Preview
          </Button>
          <Button variant="primary" size="sm" icon={Plus} onClick={handleAddSection}>
            Add Section
          </Button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px', flex: 1, minHeight: 0 }}>
        
        {/* Left Pane - Layout Sections List */}
        <Card title="Homepage Sections" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: 0, flex: 1, overflowY: 'auto' }}>
            <div style={{ padding: '12px', borderBottom: '1px solid var(--border-color)' }}>
            <div style={{ position: 'relative' }}>
              <Input 
                placeholder="Search sections..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                icon={Search}
              />
            </div>
          </div>
          <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>Loading...</div>
            ) : sections.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                No sections configured. Click "Add Section" to create one.
              </div>
            ) : (
              sections
                .filter(s => s.title?.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((section, idx) => (
                <div
                  key={section.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, idx)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleDrop(e, idx)}
                  onClick={() => handleSelectSection(section)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    borderRadius: '10px',
                    backgroundColor: selectedSectionId === section.id ? 'var(--primary-light)' : 'var(--bg-card)',
                    border: `1px solid ${selectedSectionId === section.id ? 'var(--primary)' : 'var(--border-color)'}`,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    opacity: section.enabled ? 1 : 0.6
                  }}
                >
                  <div style={{ cursor: 'grab', color: 'var(--text-muted)' }}><GripVertical size={16} /></div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: '600', fontSize: '13px', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {section.title} {section.isDraft && <span style={{ color: 'var(--warning)', fontSize: '11px', marginLeft: '4px' }}>(Draft)</span>}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                      Type: {section.sectionType} | Order: {section.displayOrder}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleToggleStatus(section.id); }}
                      style={{ background: 'none', border: 'none', color: section.enabled ? 'var(--success)' : 'var(--text-muted)', cursor: 'pointer' }}
                      title={section.enabled ? "Disable Section" : "Enable Section"}
                    >
                      {section.enabled ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDeleteSection(section.id); }}
                      style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
          </div>
        </Card>

        {/* Right Pane - Dynamic Editor */}
        {draft ? (
          <Card title={`${isEditing ? 'Edit:' : 'View:'} ${draft.title || 'Draft'}`} 
            actions={
              isEditing ? (
                <div style={{ display: 'flex', gap: '8px' }}>
                  {!draft.isDraft && (
                    <Button size="sm" variant="outline" onClick={() => { setDraft(sections.find(s => s.id === draft.id)); setIsEditing(false); }}>
                      Cancel
                    </Button>
                  )}
                  <Button size="sm" variant="primary" icon={Save} onClick={handleSaveDraft} loading={saving}>
                    Save Section
                  </Button>
                </div>
              ) : (
                <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                  Edit
                </Button>
              )
            }
          >
            <div style={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto', padding: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Core Attributes */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <Select
                  label="Section Type"
                  value={draft.sectionType}
                  onChange={handleSectionTypeChange}
                  options={SECTION_TYPES.map(t => ({ value: t, label: SECTION_CONFIG[t]?.label || t }))}
                  disabled={!draft.isDraft || !isEditing}
                />
                <Input
                  label="Display Order"
                  type="number"
                  value={draft.displayOrder}
                  onChange={(e) => updateDraftField('displayOrder', parseInt(e.target.value, 10))}
                  disabled={!isEditing}
                />
              </div>
              
              <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)' }} />
              
              {/* Dynamic Fields from Schema */}
              {SECTION_CONFIG[draft.sectionType] ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '8px' }}>
                    {SECTION_CONFIG[draft.sectionType].label} Settings
                  </h3>
                  {SECTION_CONFIG[draft.sectionType].fields.map(field => (
                    <div key={field.name}>
                      {field.type === 'itemsList' 
                        ? renderItemsList(field, draft[field.name], updateDraftField)
                        : renderField(field, draft[field.name] ?? field.defaultValue, updateDraftField)}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: '24px', textAlign: 'center', color: 'var(--warning)', backgroundColor: 'var(--warning-light)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                  <AlertCircle size={18} />
                  <span>No predefined schema for section type: {draft.sectionType}.</span>
                </div>
              )}
            </div>
            </div>
          </Card>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', border: '2px dashed var(--border-color)', borderRadius: '12px' }}>
            Select a section from the left to edit, or click "Add Section".
          </div>
        )}
      </div>

      <Modal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title="Live Website Preview"
        size="fullscreen"
      >
        <div style={{ height: 'calc(100vh - 120px)', overflowY: 'auto' }}>
          <CmsPreview 
            products={products}
            categories={categories}
            brands={brands}
            recipes={recipes}
          />
        </div>
      </Modal>
    </div>
  );
};

export default HomeConfiguration;
