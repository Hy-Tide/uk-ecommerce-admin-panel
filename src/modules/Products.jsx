import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Edit3, Plus, Search, Trash2, Filter, FileSpreadsheet, Layers, Sliders, Settings, Video, Upload, Link, AlertCircle, AlertTriangle, ImageOff, Tag, X, Star, Flame, Award, Eye, CheckCircle2 } from 'lucide-react';
import Button from '../components/Button';
import Drawer from '../components/Drawer';
import Input, { Select, Textarea, Checkbox } from '../components/Input';
import Table from '../components/Table';
import ListView from '../components/ListView';
import GridView from '../components/GridView';
import ViewToggle from '../components/ViewToggle';
import Badge from '../components/Badge';
import Uploader from '../components/Uploader';
import RichTextEditor from '../components/RichTextEditor';
import {
  getData, postData, putData, deleteData, showSnackbar, uploadFile,
  fetchMostViewedProducts, fetchTrendingProducts, fetchBestSellerProducts, fetchFeaturedProducts,
  toggleProductFeatured, toggleProductBestSeller, toggleProductStatus, toggleProductInStock
} from '../services/api';

export const Products = ({
  products = [],
  setProducts,
  categories = [],
  brands = [],
  auditLogs = [],
  setAuditLogs,
  addToast,
  externalOpenDrawer = false,
  setExternalOpenDrawer
}) => {
  const location = useLocation();
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterBrand, setFilterBrand] = useState('All');
  const [filterStock, setFilterStock] = useState('All'); // All, In Stock, Low Stock, Out of Stock
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('view-mode-products') || 'list';
  });

  const handleViewChange = (newView) => {
    setViewMode(newView);
    localStorage.setItem('view-mode-products', newView);
  };

  // Drawer edit state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Bulk Selection
  const [selectedRows, setSelectedRows] = useState([]);

  // Form Fields State
  const [formName, setFormName] = useState('');
  const [formSku, setFormSku] = useState('');
  const [formBarcode, setFormBarcode] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formSubCategory, setFormSubCategory] = useState('');
  const [formBrand, setFormBrand] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formIngredients, setFormIngredients] = useState('');
  const [formNutrition, setFormNutrition] = useState('');
  const [formStorage, setFormStorage] = useState('');
  const [formCountry, setFormCountry] = useState('USA');
  const [formImages, setFormImages] = useState([]);
  const [formRegularPrice, setFormRegularPrice] = useState(0);
  const [formSalePrice, setFormSalePrice] = useState(0);
  const [formCostPrice, setFormCostPrice] = useState(0);
  const [formStock, setFormStock] = useState(0);
  const [formMinStock, setFormMinStock] = useState(10);
  const [formMaxStock, setFormMaxStock] = useState(100);
  const [formReorderLevel, setFormReorderLevel] = useState(15);
  const [formWarehouse, setFormWarehouse] = useState('');
  const [formStatus, setFormStatus] = useState('active');
  const [formWeight, setFormWeight] = useState('');
  const [formPackSize, setFormPackSize] = useState('');
  const [formVideoUrl, setFormVideoUrl] = useState('');

  // Product Tags State (Up to 10 tags)
  const [formTags, setFormTags] = useState([]);
  const [tagInput, setTagInput] = useState('');

  // Optional field visibility toggles
  const [formHighlights, setFormHighlights] = useState('');
  const [showIngredientsField, setShowIngredientsField] = useState(false);
  const [showNutritionField, setShowNutritionField] = useState(false);
  const [showHighlightsField, setShowHighlightsField] = useState(false);

  // Image upload modes for up to 3 slots ('url' or 'upload')
  const [imageModes, setImageModes] = useState(['url', 'url', 'url']);
  // Diagnostic load error tracking per image slot
  const [imageSlotErrors, setImageSlotErrors] = useState({});

  const handleAddTag = (tagToAdd = tagInput) => {
    const trimmed = (tagToAdd || '').trim().replace(/^[#,]+/, '');
    if (!trimmed) return;
    if (formTags.length >= 10) {
      addToast('Maximum 10 tags allowed per product', 'warning');
      showSnackbar('Maximum limit reached! You can add up to 10 tags per product.', 'warning');
      return;
    }
    if (formTags.some(t => t.toLowerCase() === trimmed.toLowerCase())) {
      addToast(`Tag "${trimmed}" is already added`, 'warning');
      return;
    }
    setFormTags([...formTags, trimmed]);
    setTagInput('');
  };

  const handleRemoveTag = (indexToRemove) => {
    setFormTags(formTags.filter((_, idx) => idx !== indexToRemove));
  };

  // Product Weight Options state: Each weight option has Weight/Unit, Pricing & Valuation, and Inventory Management (Clean empty defaults)
  const [formVariants, setFormVariants] = useState([
    { id: 'var-1', value: '', unit: 'g', regularPrice: '', salePrice: '', costPrice: '', stock: '', minStock: '', reorderLevel: '' }
  ]);

  const addVariantOption = () => {
    setFormVariants([
      {
        id: `var-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        value: '',
        unit: 'g',
        regularPrice: '',
        salePrice: '',
        costPrice: '',
        stock: '',
        minStock: '',
        reorderLevel: ''
      },
      ...formVariants
    ]);
  };

  const updateVariantOption = (index, field, value) => {
    const updated = [...formVariants];
    updated[index] = { ...updated[index], [field]: value };
    setFormVariants(updated);
  };

  // Quick Toggle Handlers via API
  const handleToggleFeatured = async (row) => {
    const id = row._id || row.id;
    try {
      const res = await toggleProductFeatured(id);
      if (res && res.success !== false) {
        if (addToast) addToast(res.message || `Featured status toggled for ${row.name}`, 'success');
        if (setProducts) {
          setProducts(prev => prev.map(p => (p._id === id || p.id === id) ? { ...p, isFeatured: !p.isFeatured, featured: !p.featured } : p));
        }
      } else {
        if (addToast) addToast(res?.message || 'Failed to toggle featured status', 'danger');
      }
    } catch (err) {
      console.error('Error toggling featured status:', err);
    }
  };

  const handleToggleBestSeller = async (row) => {
    const id = row._id || row.id;
    try {
      const res = await toggleProductBestSeller(id);
      if (res && res.success !== false) {
        if (addToast) addToast(res.message || `Best seller status toggled for ${row.name}`, 'success');
        if (setProducts) {
          setProducts(prev => prev.map(p => (p._id === id || p.id === id) ? { ...p, isBestSeller: !p.isBestSeller, bestSeller: !p.bestSeller } : p));
        }
      } else {
        if (addToast) addToast(res?.message || 'Failed to toggle best seller status', 'danger');
      }
    } catch (err) {
      console.error('Error toggling best seller status:', err);
    }
  };

  const handleToggleStatus = async (row) => {
    const id = row._id || row.id;
    try {
      const res = await toggleProductStatus(id);
      if (res && res.success !== false) {
        const nextStatus = (row.status || 'active').toLowerCase() === 'active' ? 'inactive' : 'active';
        if (addToast) addToast(res.message || `Product status updated to ${nextStatus}`, 'warning');
        if (setProducts) {
          setProducts(prev => prev.map(p => (p._id === id || p.id === id) ? { ...p, status: nextStatus } : p));
        }
      } else {
        if (addToast) addToast(res?.message || 'Failed to toggle status', 'danger');
      }
    } catch (err) {
      console.error('Error toggling status:', err);
    }
  };

  const handleToggleInStock = async (row) => {
    const id = row._id || row.id;
    try {
      const res = await toggleProductInStock(id);
      if (res && res.success !== false) {
        const nextStock = row.stock > 0 ? 0 : 50;
        if (addToast) addToast(res.message || `In-stock status toggled for ${row.name}`, 'info');
        if (setProducts) {
          setProducts(prev => prev.map(p => (p._id === id || p.id === id) ? { ...p, stock: nextStock } : p));
        }
      } else {
        if (addToast) addToast(res?.message || 'Failed to toggle in-stock status', 'danger');
      }
    } catch (err) {
      console.error('Error toggling in-stock status:', err);
    }
  };

  const removeVariantOption = (index) => {
    if (formVariants.length <= 1) {
      addToast('At least one weight option is required', 'warning');
      return;
    }
    setFormVariants(formVariants.filter((_, i) => i !== index));
  };

  const updateImageSlot = (index, val) => {
    const updated = [...formImages];
    updated[index] = val;
    setFormImages(updated.slice(0, 3));
    setImageSlotErrors(prev => ({ ...prev, [index]: false }));
  };

  const removeImageSlot = (index) => {
    const updated = formImages.filter((_, i) => i !== index);
    setFormImages(updated.length > 0 ? updated : ['']);
    setImageModes(prev => prev.filter((_, i) => i !== index));
    setImageSlotErrors(prev => {
      const copy = { ...prev };
      delete copy[index];
      return copy;
    });
  };

  const handleFileUpload = (index, file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      addToast('Invalid file format! Please upload an image (PNG, JPG, WebP, GIF)', 'danger');
      showSnackbar('Invalid file format! Must be an image.', 'error');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      addToast('Image size exceeds 5MB limit', 'danger');
      showSnackbar('Image size exceeds 5MB limit!', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      updateImageSlot(index, dataUrl);
      addToast(`Image slot ${index + 1} updated`, 'success');
    };
    reader.onerror = () => {
      addToast('Failed to read image file', 'danger');
      showSnackbar('Error reading image file', 'error');
    };
    reader.readAsDataURL(file);
  };

  const handleVideoUpload = (file) => {
    if (!file) return;
    if (!file.type.startsWith('video/')) {
      addToast('Invalid file format! Please upload a video file (MP4, WebM)', 'danger');
      showSnackbar('Invalid file format! Must be a video.', 'error');
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      addToast('Video size exceeds 20MB limit', 'danger');
      showSnackbar('Video size exceeds 20MB limit!', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setFormVideoUrl(e.target.result);
      addToast('Product video attached', 'success');
    };
    reader.onerror = () => {
      addToast('Failed to read video file', 'danger');
    };
    reader.readAsDataURL(file);
  };

  // Handle opening Drawer for New Product vs Editing
  const openEditDrawer = (prod = null) => {
    setSelectedProduct(prod);
    if (prod) {
      setFormName(prod.name);
      setFormSku(prod.sku);
      setFormBarcode(prod.barcode);
      setFormCategory(prod.category);
      setFormSubCategory(prod.subCategory || '');
      setFormBrand(prod.brand);
      setFormDesc(prod.description);
      setFormIngredients(prod.ingredients || '');
      setFormNutrition(prod.nutritionalInformation || prod.nutritionFacts || '');
      setFormHighlights(prod.highlights || '');
      setFormStorage(prod.storageInstructions || '');
      setFormCountry(prod.countryOfOrigin || 'USA');
      setFormImages(prod.images || []);
      setFormRegularPrice(prod.regularPrice);
      setFormSalePrice(prod.salePrice);
      setFormCostPrice(prod.costPrice);
      setFormStock(prod.stock);
      setFormMinStock(prod.minStock);
      setFormMaxStock(prod.maxStock);
      setFormReorderLevel(prod.reorderLevel);
      setFormWarehouse(prod.warehouseLocation || '');
      setFormStatus(prod.status ? prod.status.toLowerCase() : 'active');
      setFormWeight(prod.weight || '');
      setFormPackSize(prod.packSize || '');
      setFormVideoUrl(prod.videoUrl || '');
      setShowIngredientsField(Boolean(prod.ingredients && prod.ingredients.trim()));
      setShowNutritionField(Boolean((prod.nutritionalInformation || prod.nutritionFacts) && (prod.nutritionalInformation || prod.nutritionFacts).trim()));
      setShowHighlightsField(Boolean(prod.highlights && prod.highlights.trim()));
      const initImgs = Array.isArray(prod.images) && prod.images.length > 0 ? prod.images.slice(0, 3) : [''];
      setFormImages(initImgs);
      setImageModes(initImgs.map(() => 'url'));
      setFormTags(Array.isArray(prod.tags) && prod.tags.length > 0 ? prod.tags.slice(0, 10) : [prod.category, prod.brand].filter(Boolean));
      setTagInput('');

      const rawVars = (Array.isArray(prod.variations) && prod.variations.length > 0)
        ? prod.variations
        : ((Array.isArray(prod.variants) && prod.variants.length > 0) ? prod.variants : []);

      if (rawVars.length > 0) {
        setFormVariants(rawVars.map((v, i) => ({
          id: v.id || `var-${Date.now()}-${i}`,
          value: v.value !== undefined ? String(v.value) : (v.weight !== undefined ? String(v.weight) : ''),
          unit: v.weightUnit || v.unit || (v.weight ? (String(v.weight).includes('ml') ? 'ml' : String(v.weight).includes('kg') ? 'kg' : String(v.weight).includes('L') ? 'L' : 'g') : 'g'),
          regularPrice: v.regularPrice !== undefined ? String(v.regularPrice) : (v.price !== undefined ? String(v.price) : (prod.regularPrice !== undefined ? String(prod.regularPrice) : '')),
          salePrice: v.salePrice !== undefined ? String(v.salePrice) : (v.discount_price !== undefined ? String(v.discount_price) : (prod.salePrice !== undefined ? String(prod.salePrice) : '')),
          costPrice: v.costPrice !== undefined ? String(v.costPrice) : (prod.costPrice !== undefined ? String(prod.costPrice) : ''),
          stock: v.stockQuantity !== undefined ? String(v.stockQuantity) : (v.stock_quantity !== undefined ? String(v.stock_quantity) : (v.stock !== undefined ? String(v.stock) : (prod.stock !== undefined ? String(prod.stock) : ''))),
          minStock: v.minStockAlert !== undefined ? String(v.minStockAlert) : (v.minStock !== undefined ? String(v.minStock) : (prod.minStock !== undefined ? String(prod.minStock) : '')),
          reorderLevel: v.reorderLevel !== undefined ? String(v.reorderLevel) : (prod.reorderLevel !== undefined ? String(prod.reorderLevel) : '')
        })));
      } else {
        setFormVariants([
          {
            id: `var-${Date.now()}`,
            value: prod.weight ? String(prod.weight).replace(/[^0-9.]/g, '') : '',
            unit: prod.weight ? (String(prod.weight).includes('ml') ? 'ml' : String(prod.weight).includes('kg') ? 'kg' : String(prod.weight).includes('L') ? 'L' : 'g') : 'g',
            regularPrice: prod.regularPrice !== undefined ? String(prod.regularPrice) : '',
            salePrice: prod.salePrice !== undefined ? String(prod.salePrice) : '',
            costPrice: prod.costPrice !== undefined ? String(prod.costPrice) : '',
            stock: prod.stock !== undefined ? String(prod.stock) : '',
            minStock: prod.minStock !== undefined ? String(prod.minStock) : '',
            reorderLevel: prod.reorderLevel !== undefined ? String(prod.reorderLevel) : ''
          }
        ]);
      }
    } else {
      setFormName('');
      setFormSku(`GR-${Math.random().toString(36).substr(2, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`);
      setFormBarcode(Math.floor(100000000000 + Math.random() * 900000000000).toString());
      setFormCategory(categories[0]?.name || '');
      setFormSubCategory('');
      setFormBrand(brands[0]?.name || '');
      setFormDesc('');
      setFormIngredients('');
      setFormNutrition('');
      setFormHighlights('');
      setFormStorage('');
      setFormCountry('USA');
      setFormImages(['']);
      setImageModes(['url', 'url', 'url']);
      setFormRegularPrice('');
      setFormSalePrice('');
      setFormCostPrice('');
      setFormStock('');
      setFormMinStock('');
      setFormMaxStock('');
      setFormReorderLevel('');
      setFormWarehouse('');
      setFormStatus('active');
      setFormWeight('');
      setFormPackSize('');
      setFormVideoUrl('');
      setShowIngredientsField(false);
      setShowNutritionField(false);
      setShowHighlightsField(false);
      setFormVariants([
        { id: `var-${Date.now()}-1`, value: '', unit: 'g', regularPrice: '', salePrice: '', costPrice: '', stock: '', minStock: '', reorderLevel: '' }
      ]);
      setFormTags([]);
      setTagInput('');
    }
    setImageSlotErrors({});
    setDrawerOpen(true);
  };

  const [loading, setLoading] = useState(false);
  const [liveCategories, setLiveCategories] = useState([]);
  const [liveSubCategories, setLiveSubCategories] = useState([]);
  const [liveBrands, setLiveBrands] = useState([]);
  const [isFetchingProds, setIsFetchingProds] = useState(true);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [limit, setLimit] = useState(100);

  // Fetch live Categories, Subcategories, Brands & Products
  useEffect(() => {
    const fetchAllLiveData = async () => {
      setIsFetchingProds(true);
      try {
        const dropdownParams = { limit: 100 };
        const productParams = { limit: limit, page: currentPage };

        // 1. Fetch live categories
        let catRes = await getData('admin/categories', dropdownParams);
        let catList = catRes?.data?.categories || (Array.isArray(catRes?.data) ? catRes.data : []);
        if (!Array.isArray(catList) || catList.length === 0) {
          catRes = await getData('website/categories', dropdownParams);
          catList = catRes?.data?.categories || (Array.isArray(catRes?.data) ? catRes.data : []);
        }
        if (Array.isArray(catList) && catList.length > 0) {
          const formattedCats = catList.map(c => ({ id: c._id || c.id, _id: c._id || c.id, name: c.name }));
          setLiveCategories(formattedCats);
        }

        // 2. Fetch live subcategories
        let subRes = await getData('admin/subcategories', dropdownParams);
        let subList = subRes?.data?.subCategories || subRes?.data?.subcategories || (Array.isArray(subRes?.data) ? subRes.data : []);
        if (Array.isArray(subList) && subList.length > 0) {
          const formattedSubs = subList.map(s => ({ id: s._id || s.id, _id: s._id || s.id, name: s.name, category_id: s.category_id }));
          setLiveSubCategories(formattedSubs);
        }

        // 3. Fetch live brands
        let brandRes = await getData('admin/brands', dropdownParams);
        let brandList = brandRes?.data?.brands || (Array.isArray(brandRes?.data) ? brandRes.data : []);
        if (!Array.isArray(brandList) || brandList.length === 0) {
          brandRes = await getData('website/brands', dropdownParams);
          brandList = brandRes?.data?.brands || (Array.isArray(brandRes?.data) ? brandRes.data : []);
        }
        if (Array.isArray(brandList) && brandList.length > 0) {
          const formattedBrands = brandList.map(b => ({ id: b._id || b.id, _id: b._id || b.id, name: b.name }));
          setLiveBrands(formattedBrands);
        }

        // 4. Fetch live products
        if (search.trim()) productParams.search = search.trim();
        let prodRes = await getData('admin/products', productParams);
        let prodList = prodRes?.data?.products || (Array.isArray(prodRes?.data) ? prodRes.data : []);
        if (!Array.isArray(prodList) || prodList.length === 0) {
          prodRes = await getData('website/products', productParams);
          prodList = prodRes?.data?.products || (Array.isArray(prodRes?.data) ? prodRes.data : []);
        }

        if (Array.isArray(prodList) && prodList.length > 0) {
          const apiTotalPages = prodRes?.data?.meta?.totalPages || 1;
          const apiTotalItems = prodRes?.data?.meta?.total || 0;
          setTotalPages(apiTotalPages);
          setTotalItems(apiTotalItems);

          const allCats = (catList && catList.length > 0) ? catList : categories;
          const allBrands = (brandList && brandList.length > 0) ? brandList : brands;
          const allSubs = (subList && subList.length > 0) ? subList : [];

          const formattedProds = prodList.map((p) => {
            const catId = p.categoryId || p.category_id;
            const subCatId = p.subCategoryId || p.sub_category_id;
            const brandId = p.brand || p.brand_id;

            const catObj = allCats.find(c => c.id === catId || c._id === catId);
            const subObj = allSubs.find(s => s.id === subCatId || s._id === subCatId);
            const brandObj = allBrands.find(b => b.id === brandId || b._id === brandId || b.name === p.brand);

            const rawVars = (Array.isArray(p.variations) && p.variations.length > 0)
              ? p.variations
              : ((Array.isArray(p.variants) && p.variants.length > 0) ? p.variants : []);

            const parsedVars = rawVars.map((v, idx) => ({
              id: v._id || v.id || `var-${idx + 1}`,
              value: v.weight !== undefined ? String(v.weight) : (v.value || ''),
              unit: v.weightUnit || v.unit || 'g',
              weight: v.displayWeight || (v.weight ? `${v.weight}${v.weightUnit || 'g'}` : ''),
              regularPrice: v.regularPrice !== undefined ? v.regularPrice : (v.regular_price !== undefined ? v.regular_price : p.base_price || 0),
              salePrice: v.salePrice !== undefined ? v.salePrice : (v.discount_price !== undefined ? v.discount_price : p.discount_price || 0),
              costPrice: v.costPrice || 0,
              stock: v.stockQuantity !== undefined ? v.stockQuantity : (v.stock_quantity !== undefined ? v.stock_quantity : (v.stock !== undefined ? v.stock : 0)),
              minStock: v.minStockAlert !== undefined ? v.minStockAlert : (v.minStock || 10),
              reorderLevel: v.reorderLevel || 15
            }));

            const firstVariant = parsedVars[0] || {};
            const primaryRegPrice = firstVariant.regularPrice !== undefined ? firstVariant.regularPrice : (p.base_price || 0);
            const primarySalePrice = firstVariant.salePrice !== undefined ? firstVariant.salePrice : (p.discount_price || primaryRegPrice);
            const totalStock = parsedVars.length > 0
              ? parsedVars.reduce((sum, v) => sum + (Number(v.stock) || 0), 0)
              : (p.stock !== undefined ? p.stock : (p.inStock ? 50 : 0));

            const formattedWeightSummary = parsedVars.length > 0
              ? parsedVars.map(v => `${v.value}${v.unit}`).filter(w => w !== '').join(', ')
              : (p.weight || '');

            return {
              id: p._id || p.id,
              name: p.name || p.title,
              sku: p.sku || firstVariant.sku || `SKU-${p._id ? p._id.slice(-4) : '001'}`,
              barcode: p.barcode || '123456789012',
              categoryId: catId,
              subCategoryId: subCatId,
              category: catObj ? catObj.name : (p.category_name || (typeof p.category === 'string' ? p.category : 'Fresh Fruits & Vegetables')),
              subCategory: subObj ? subObj.name : (p.subCategory || ''),
              brand: brandObj ? brandObj.name : (p.brand_name || (typeof p.brand === 'string' ? p.brand : 'Aachi')),
              description: p.description || p.shortDescription || '',
              shortDescription: p.shortDescription || p.name || p.title || '',
              ingredients: p.ingredients || '',
              nutritionFacts: p.nutritionalInformation || p.nutritionFacts || '',
              nutritionalInformation: p.nutritionalInformation || p.nutritionFacts || '',
              highlights: p.highlights || '',
              storageInstructions: p.storageInstructions || '',
              countryOfOrigin: p.countryOfOrigin || 'USA',
              images: Array.isArray(p.images) && p.images.length > 0 ? p.images : ['https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=400'],
              regularPrice: primaryRegPrice,
              salePrice: primarySalePrice,
              costPrice: firstVariant.costPrice || 0,
              stock: totalStock,
              minStock: firstVariant.minStock || 10,
              maxStock: 200,
              reorderLevel: firstVariant.reorderLevel || 15,
              warehouseLocation: p.warehouseLocation || 'Aisle 1, Shelf A1',
              status: p.status ? p.status.toLowerCase() : 'active',
              weight: formattedWeightSummary,
              variations: parsedVars,
              variants: parsedVars,
              packSize: p.packSize || '1 unit',
              videoUrl: p.videoUrl || '',
              rating: p.rating || 4.8,
              reviewsCount: p.reviewsCount || 12
            };
          });
          setProducts(formattedProds);
        } else {
          setProducts([]);
        }
      } catch (err) {
        console.warn('Error fetching live data:', err);
      } finally {
        setIsFetchingProds(false);
      }
    };

    fetchAllLiveData();
  }, [search, limit, currentPage]);

  // If dashboard quick action requested
  React.useEffect(() => {
    if (externalOpenDrawer) {
      openEditDrawer(null);
      setExternalOpenDrawer(false);
    }
  }, [externalOpenDrawer]);

  // Handle navigation from Wishlist / Cart to open Product details
  React.useEffect(() => {
    if (location.state?.search) {
      setSearch(location.state.search);
    }
    if (location.state?.openProduct) {
      const target = location.state.openProduct;
      const targetName = (target?.name || target?.title || target?.product_name || (typeof target === 'string' ? target : '')).toLowerCase();

      const match = products.find(p =>
        (target.id && (p.id === target.id || p._id === target.id)) ||
        (target._id && (p.id === target._id || p._id === target._id)) ||
        (p.name && targetName && p.name.toLowerCase().includes(targetName)) ||
        (targetName && p.name && targetName.includes(p.name.toLowerCase()))
      );

      if (match) {
        openEditDrawer(match);
      } else if (typeof target === 'object' && target !== null && (target.name || target.title)) {
        openEditDrawer(target);
      }
    }
  }, [location.state, products]);

  const saveProductSubmit = async (e) => {
    e.preventDefault();
    if (!formName || !formName.trim()) {
      addToast('Product name is required', 'danger');
      return;
    }
    if (!formSubCategory || !formSubCategory.trim()) {
      addToast('Subcategory is mandatory', 'danger');
      showSnackbar('Subcategory is mandatory!', 'danger');
      return;
    }
    if (!formDesc || !formDesc.trim()) {
      addToast('Long Description is mandatory', 'danger');
      showSnackbar('Long Description is mandatory!', 'danger');
      return;
    }

    setLoading(true);

    const effectiveCats = liveCategories.length > 0 ? liveCategories : categories;
    const effectiveBrands = liveBrands.length > 0 ? liveBrands : brands;

    const catObj = effectiveCats.find(c => c.name === formCategory || c.id === formCategory || c._id === formCategory);
    const subCatObj = liveSubCategories.find(s => s.name === formSubCategory || s.id === formSubCategory || s._id === formSubCategory);
    const brandObj = effectiveBrands.find(b => b.name === formBrand || b.id === formBrand || b._id === formBrand);

    const validImages = formImages.filter(img => img && img.trim() !== '');
    const hasBrokenImages = formImages.some((img, idx) => img && img.trim() !== '' && imageSlotErrors[idx]);
    if (hasBrokenImages) {
      addToast('Warning: One or more image URLs failed to load. Saving with available media.', 'warning');
    }
    const finalImages = validImages.length > 0 ? validImages : ['https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=400'];
    const finalTags = formTags.length > 0 ? formTags.slice(0, 10) : [formCategory, formBrand].filter(Boolean);

    const firstVar = formVariants[0] || {};
    const primaryPrice = Number(firstVar.regularPrice) || Number(formRegularPrice) || 0;
    const primarySalePrice = Number(firstVar.salePrice) || Number(formSalePrice) || primaryPrice;
    const totalStock = formVariants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);
    const formattedWeightSummary = formVariants.map(v => `${v.value}${v.unit}`).filter(w => w !== '').join(', ');

    const catId = catObj ? (catObj._id || catObj.id) : (effectiveCats[0]?._id || effectiveCats[0]?.id || formCategory || '');
    const subCatId = subCatObj ? (subCatObj._id || subCatObj.id) : (liveSubCategories[0]?._id || liveSubCategories[0]?.id || formSubCategory || '');
    const brandId = brandObj ? (brandObj._id || brandObj.id) : (effectiveBrands[0]?._id || effectiveBrands[0]?.id || formBrand || '');

    // EXACT API PAYLOAD FORMAT MATCHING NEW REQUEST BODY SCHEMA
    const apiPayload = {
      name: formName,
      categoryId: catId,
      subCategoryId: subCatId,
      brand: brandId,
      sku: formSku || `SKU-${Date.now()}`,
      shortDescription: formName,
      description: formDesc || '',
      ingredients: formIngredients || '',
      nutritionalInformation: formNutrition || '',
      highlights: formHighlights || '',
      variations: formVariants.map((v) => ({
        weight: Number(v.value) || 0,
        weightUnit: v.unit || 'g',
        regularPrice: Number(v.regularPrice) || 0,
        salePrice: Number(v.salePrice) || Number(v.regularPrice) || 0,
        stockQuantity: Number(v.stock) || 0,
        minStockAlert: Number(v.minStock) || 0
      })),
      images: finalImages,
      tags: finalTags,
      inStock: totalStock > 0,
      isFeatured: true,
      displayOrder: 0,
      status: formStatus.toLowerCase()
    };

    const localPayload = {
      id: selectedProduct ? selectedProduct.id : `prod-${Date.now()}`,
      name: formName,
      sku: formSku,
      barcode: formBarcode,
      categoryId: catId,
      subCategoryId: subCatId,
      category: formCategory,
      subCategory: formSubCategory,
      brand: formBrand,
      description: formDesc,
      shortDescription: formName,
      ingredients: formIngredients,
      nutritionalInformation: formNutrition,
      highlights: formHighlights,
      storageInstructions: formStorage,
      countryOfOrigin: formCountry,
      images: finalImages,
      regularPrice: primaryPrice,
      salePrice: primarySalePrice,
      costPrice: Number(firstVar.costPrice) || 0,
      stock: totalStock,
      minStock: Number(firstVar.minStock) || 10,
      reorderLevel: Number(firstVar.reorderLevel) || 15,
      warehouseLocation: formWarehouse,
      status: formStatus,
      inStock: totalStock > 0,
      isFeatured: true,
      displayOrder: 0,
      tags: finalTags,
      weight: formattedWeightSummary,
      variations: formVariants.map((v, i) => ({
        id: v.id || `var-${i + 1}`,
        weight: Number(v.value) || 0,
        weightUnit: v.unit || 'g',
        value: v.value,
        unit: v.unit,
        regularPrice: Number(v.regularPrice) || 0,
        salePrice: Number(v.salePrice) || 0,
        costPrice: Number(v.costPrice) || 0,
        stockQuantity: Number(v.stock) || 0,
        stock: Number(v.stock) || 0,
        minStockAlert: Number(v.minStock) || 0,
        reorderLevel: Number(v.reorderLevel) || 15
      })),
      variants: formVariants.map((v, i) => ({
        id: v.id || `var-${i + 1}`,
        value: v.value,
        unit: v.unit,
        weight: `${v.value}${v.unit}`,
        sku: `${formSku || 'SKU'}-${i + 1}`,
        regularPrice: Number(v.regularPrice) || 0,
        salePrice: Number(v.salePrice) || 0,
        costPrice: Number(v.costPrice) || 0,
        stock: Number(v.stock) || 0,
        minStock: Number(v.minStock) || 10,
        reorderLevel: Number(v.reorderLevel) || 15
      })),
      packSize: formPackSize,
      videoUrl: formVideoUrl,
      rating: selectedProduct ? selectedProduct.rating : 5.0,
      reviewsCount: selectedProduct ? selectedProduct.reviewsCount : 0
    };

    try {
      const token = sessionStorage.getItem('admin_access_token') ||
        localStorage.getItem('admin_access_token') ||
        sessionStorage.getItem('sessionToken') ||
        localStorage.getItem('sessionToken') ||
        sessionStorage.getItem('accessToken') ||
        localStorage.getItem('accessToken') || '';

      if (selectedProduct) {
        if (selectedProduct.id && !selectedProduct.id.startsWith('prod-')) {
          const res = await putData(`admin/products/${selectedProduct.id}`, apiPayload, token);
          if (res?.success === false || res?.error) {
            const errMsg = res?.error || res?.message || 'Failed to update product in API';
            addToast(errMsg, 'danger');
            showSnackbar(errMsg, 'error');
            setLoading(false);
            return;
          }
        }
        setProducts(products.map(p => p.id === selectedProduct.id ? localPayload : p));
        addToast('Product updated successfully', 'success');
        showSnackbar('Product updated successfully!', 'success');
      } else {
        const res = await postData('admin/products', apiPayload, token);
        if (res?.success === false || res?.error) {
          const errMsg = res?.error || res?.message || 'Failed to create product in API';
          addToast(errMsg, 'danger');
          showSnackbar(errMsg, 'error');
          setLoading(false);
          return;
        }

        const pData = res?.data?.product || res?.data || {};
        if (pData && (pData._id || pData.id)) {
          localPayload.id = pData._id || pData.id;
        }

        setProducts([localPayload, ...products]);
        addToast('Product created successfully', 'success');
        showSnackbar('Product created successfully!', 'success');
      }

      setDrawerOpen(false);

      setAuditLogs([
        {
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString(),
          user: 'Mugesh',
          action: selectedProduct ? 'Product Edited' : 'Product Created',
          module: 'Products',
          detail: `${selectedProduct ? 'Modified' : 'Added new'} product: ${formName}`
        },
        ...auditLogs
      ]);
    } catch (err) {
      addToast(err.message || 'Failed to save product in API', 'danger');
      showSnackbar(err.message || 'Failed to save product in API', 'error');
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id) => {
    const deleted = products.find(p => p.id === id);
    setProducts(products.filter(p => p.id !== id));

    try {
      if (id && !id.startsWith('prod-')) {
        const res = await deleteData(`admin/products/${id}`);
        if (res?.success || res?.statusCode === 200) {
          showSnackbar('Product deleted successfully', 'success');
        }
      }
    } catch {
      // Quiet fallback
    }

    addToast('Product deleted', 'warning');
    setAuditLogs([
      {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        user: 'Mugesh',
        action: 'Product Deleted',
        module: 'Products',
        detail: `Removed product: ${deleted?.name}`
      },
      ...auditLogs
    ]);
  };

  // Bulk actions triggers
  const handleBulkDelete = () => {
    setProducts(products.filter(p => !selectedRows.includes(p.id)));
    addToast(`Successfully deleted ${selectedRows.length} items`, 'warning');
    setSelectedRows([]);
  };

  const handleBulkExport = () => {
    const selectedProds = products.filter(p => selectedRows.includes(p.id));
    const csvContent = "data:text/csv;charset=utf-8,"
      + ["Name,SKU,Category,Price,Stock"].join(",") + "\n"
      + selectedProds.map(p => `"${p.name}","${p.sku}","${p.category}",${p.salePrice},${p.stock}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "ukecommerce_products_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast(`Exported ${selectedRows.length} products to CSV`, 'success');
  };

  // Filter Catalog Data
  const filteredProducts = products.filter(p => {
    const searchLower = (search || '').toLowerCase();
    const matchesSearch =
      (p.name || '').toLowerCase().includes(searchLower) ||
      (p.sku || '').toLowerCase().includes(searchLower) ||
      (p.barcode || '').toLowerCase().includes(searchLower);

    const matchesCategory = filterCategory === 'All' || p.category === filterCategory;
    const matchesBrand = filterBrand === 'All' || p.brand === filterBrand;

    let matchesStock = true;
    if (filterStock === 'In Stock') matchesStock = p.stock > p.minStock;
    if (filterStock === 'Low Stock') matchesStock = p.stock > 0 && p.stock <= p.minStock;
    if (filterStock === 'Out of Stock') matchesStock = p.stock === 0;

    return matchesSearch && matchesCategory && matchesBrand && matchesStock;
  });

  // Table structure columns definition
  const tableColumns = [
    {
      key: 'name',
      label: 'Product Details',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <img
              src={row.images?.[0] || '/logo.png'}
              alt={row.name}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/logo.png';
                e.target.style.opacity = '0.35';
                e.target.style.objectFit = 'contain';
              }}
              style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border-color)' }}
            />
            {row.videoUrl && (
              <span
                style={{
                  position: 'absolute',
                  bottom: '-2px',
                  right: '-2px',
                  backgroundColor: 'var(--primary)',
                  color: 'white',
                  borderRadius: '50%',
                  width: '16px',
                  height: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'var(--shadow-sm)',
                  border: '1.5px solid white'
                }}
                title="Product contains video content"
              >
                <Video size={10} style={{ color: 'white' }} />
              </span>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ fontWeight: '600', color: 'var(--text-primary)', whiteSpace: 'normal', maxWidth: '280px' }}>{row.name}</span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>SKU: {row.sku} | Barcode: {row.barcode}</span>
          </div>
        </div>
      )
    },
    { key: 'category', label: 'Category' },
    { key: 'brand', label: 'Brand' },
    {
      key: 'price',
      label: 'Pricing',
      render: (row) => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontWeight: '600', color: 'var(--primary)' }}>£{row.salePrice.toFixed(2)}</span>
          {row.salePrice < row.regularPrice && (
            <span style={{ fontSize: '11px', textDecoration: 'line-through', color: 'var(--text-muted)' }}>
              £{row.regularPrice.toFixed(2)}
            </span>
          )}
        </div>
      )
    },
    {
      key: 'stock',
      label: 'Stock Status',
      render: (row) => {
        const isInStock = row.stock > 0;
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Badge variant={row.stock === 0 ? 'danger' : row.stock <= row.minStock ? 'warning' : 'success'}>
              {row.stock === 0 ? 'Out of stock (0)' : row.stock <= row.minStock ? `Low stock (${row.stock})` : `In stock (${row.stock})`}
            </Badge>
            <button
              onClick={() => handleToggleInStock(row)}
              style={{ border: 'none', background: 'none', cursor: 'pointer', color: isInStock ? 'var(--success)' : 'var(--danger)', padding: '2px' }}
              title="Toggle In-Stock Status (PATCH /admin/products/{id}/toggle-instock)"
            >
              <CheckCircle2 size={14} />
            </button>
          </div>
        );
      }
    },
    {
      key: 'status',
      label: 'Status & Badges',
      render: (row) => {
        const s = (row.status || 'active').toLowerCase();
        const badgeVar = (s === 'active' || s === 'published') ? 'success' : s === 'inactive' ? 'warning' : 'secondary';
        const isFeat = Boolean(row.isFeatured || row.featured);
        const isBest = Boolean(row.isBestSeller || row.bestSeller);

        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <Badge variant={badgeVar} onClick={() => handleToggleStatus(row)} style={{ cursor: 'pointer' }} title="Click to Toggle Status (PATCH /admin/products/{id}/toggle-status)">
              {s}
            </Badge>
            <button
              onClick={() => handleToggleFeatured(row)}
              style={{ border: 'none', background: 'none', cursor: 'pointer', color: isFeat ? '#f59e0b' : 'var(--text-muted)', padding: '2px' }}
              title="Toggle Featured Status (PATCH /admin/products/{id}/toggle-featured)"
            >
              <Star size={14} fill={isFeat ? '#f59e0b' : 'none'} />
            </button>
            <button
              onClick={() => handleToggleBestSeller(row)}
              style={{ border: 'none', background: 'none', cursor: 'pointer', color: isBest ? '#6366f1' : 'var(--text-muted)', padding: '2px' }}
              title="Toggle Best Seller Status (PATCH /admin/products/{id}/toggle-best-seller)"
            >
              <Award size={14} />
            </button>
          </div>
        );
      }
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div style={{ display: 'flex', gap: '6px' }}>
          <Button variant="ghost" size="sm" onClick={() => openEditDrawer(row)} style={{ padding: '6px' }} title="Edit Product">
            <Edit3 size={15} />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => deleteProduct(row.id)} style={{ padding: '6px', color: 'var(--danger)' }} title="Delete Product">
            <Trash2 size={15} />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Header controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '700', letterSpacing: '-0.02em', margin: 0 }}>Products Catalog</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Modify store catalogue, edit description templates, weights, and categories.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <ViewToggle currentView={viewMode} onViewChange={handleViewChange} />
          <Button variant="primary" size="sm" icon={Plus} onClick={() => openEditDrawer(null)}>
            Create Product
          </Button>
        </div>
      </div>

      {/* Bulk actions and search toolbar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          padding: '12px 16px',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flex: 1, minWidth: '240px' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '320px' }}>
            <span style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-muted)' }}><Search size={16} /></span>
            <input
              type="text"
              placeholder="Search SKU, barcode, title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 36px',
                fontSize: '13px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-app)',
                color: 'var(--text-primary)',
                outline: 'none'
              }}
            />
          </div>

          {/* Quick Filters */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            style={{ padding: '8px', fontSize: '13px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-app)', color: 'var(--text-primary)' }}
          >
            <option value="All">All Categories</option>
            {(liveCategories.length > 0 ? liveCategories : categories).map(c => <option key={c.id || c._id} value={c.name}>{c.name}</option>)}
          </select>

          <select
            value={filterStock}
            onChange={(e) => setFilterStock(e.target.value)}
            style={{ padding: '8px', fontSize: '13px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-app)', color: 'var(--text-primary)' }}
          >
            <option value="All">All Stock Levels</option>
            <option value="In Stock">In Stock Only</option>
            <option value="Low Stock">Low Stock Alerts</option>
            <option value="Out of Stock">Out of Stock</option>
          </select>
        </div>

        {/* Selected Actions */}
        {selectedRows.length > 0 && (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', backgroundColor: 'var(--primary-light)', padding: '4px 12px', borderRadius: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--primary)' }}>{selectedRows.length} selected</span>
            <Button variant="outline" size="sm" icon={FileSpreadsheet} onClick={handleBulkExport}>Export</Button>
            <Button variant="danger" size="sm" icon={Trash2} onClick={handleBulkDelete}>Delete</Button>
          </div>
        )}
      </div>

      {/* Main presentation layer switcher with loader */}
      {isFetchingProds ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '24px 0' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="skeleton" style={{ height: '140px', borderRadius: '12px' }} />
            ))}
          </div>
        </div>
      ) : viewMode === 'list' ? (
        <ListView
          columns={tableColumns}
          data={filteredProducts}
          selectable
          selectedKeys={selectedRows}
          onSelectAll={(keys) => setSelectedRows(keys)}
          onSelectRow={(key, checked) => {
            if (checked) {
              setSelectedRows([...selectedRows, key]);
            } else {
              setSelectedRows(selectedRows.filter(k => k !== key));
            }
          }}
          serverSideTotal={totalItems}
          serverSidePage={currentPage}
          onServerPageChange={setCurrentPage}
          onServerRowsChange={setLimit}
          initialRowsPerPage={limit}
          rowsPerPageOptions={[10, 25, 50, 100]}
        />
      ) : (
        <GridView
          data={filteredProducts}
          idKey="id"
          imageKey={item => item.images?.[0]}
          titleKey="name"
          subtitleKey="description"
          statusKey="status"
          onEdit={openEditDrawer}
          onDelete={item => deleteProduct(item.id)}
          initialRowsPerPage={100}
          rowsPerPageOptions={[8, 16, 32, 64, 100]}
        />
      )}

      {/* Slider edit drawer */}
      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={selectedProduct ? 'Edit Catalog Product' : 'Create Product Entry'}
        size="lg"
        footer={
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button variant="outline" size="sm" onClick={() => setDrawerOpen(false)}>Cancel</Button>
            <Button variant="primary" size="sm" loading={loading} onClick={saveProductSubmit}>Save Changes</Button>
          </div>
        }
      >
        <form style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          <Input label="Product Name" value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Organic Strawberries (400g)" />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Input label="SKU Code" value={formSku} onChange={(e) => setFormSku(e.target.value)} />
            <Input label="UPC/Barcode" value={formBarcode} onChange={(e) => setFormBarcode(e.target.value)} />
          </div>

          {/* Category, Sub Category & Brand Partner dropdowns loaded from live backend database */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            <Select
              label="Category"
              value={formCategory || (liveCategories[0]?.name || categories[0]?.name || '')}
              onChange={(e) => {
                setFormCategory(e.target.value);
                setFormSubCategory('');
              }}
              options={(liveCategories.length > 0 ? liveCategories : categories).map(c => c.name)}
            />
            <Select
              label="Sub Category *"
              value={formSubCategory}
              onChange={(e) => setFormSubCategory(e.target.value)}
              options={['', ...liveSubCategories.map(s => s.name)]}
            />
            <Select
              label="Brand Partner"
              value={formBrand || (liveBrands[0]?.name || brands[0]?.name || '')}
              onChange={(e) => setFormBrand(e.target.value)}
              options={(liveBrands.length > 0 ? liveBrands : brands).map(b => b.name)}
            />
          </div>

          <RichTextEditor
            label="Long Description *"
            value={formDesc}
            onChange={setFormDesc}
            placeholder="Write details about benefits, flavors... (Mandatory)"
            required
            minHeight="120px"
          />

          {/* Optional Specifications with + Add Symbol buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', backgroundColor: 'var(--bg-app)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>
                Optional Specifications
              </span>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {!showIngredientsField && (
                  <button
                    type="button"
                    onClick={() => setShowIngredientsField(true)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '6px 12px',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: 'var(--primary)',
                      backgroundColor: 'var(--primary-light)',
                      border: '1px solid var(--primary)',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <Plus size={14} /> Add Ingredients
                  </button>
                )}
                {!showNutritionField && (
                  <button
                    type="button"
                    onClick={() => setShowNutritionField(true)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '6px 12px',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: 'var(--primary)',
                      backgroundColor: 'var(--primary-light)',
                      border: '1px solid var(--primary)',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <Plus size={14} /> Add Nutritional Info
                  </button>
                )}
                {!showHighlightsField && (
                  <button
                    type="button"
                    onClick={() => setShowHighlightsField(true)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '6px 12px',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: 'var(--primary)',
                      backgroundColor: 'var(--primary-light)',
                      border: '1px solid var(--primary)',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <Plus size={14} /> Add Highlights
                  </button>
                )}
              </div>
            </div>

            {(showIngredientsField || showNutritionField || showHighlightsField) && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '8px' }}>
                {showIngredientsField && (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      padding: '14px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'var(--bg-card)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>
                        Ingredients List (Optional)
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setShowIngredientsField(false);
                          setFormIngredients('');
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--danger)',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: '600',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px',
                          padding: '2px 6px',
                          borderRadius: '4px'
                        }}
                        title="Remove field"
                      >
                        <Trash2 size={13} /> Remove
                      </button>
                    </div>
                    <RichTextEditor
                      value={formIngredients}
                      onChange={setFormIngredients}
                      placeholder="e.g. 100% Organic Oats, Whole Spices (supports bold, dot list •, font style)"
                      minHeight="95px"
                    />
                  </div>
                )}

                {showNutritionField && (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      padding: '14px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'var(--bg-card)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>
                        Nutritional Information (Optional)
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setShowNutritionField(false);
                          setFormNutrition('');
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--danger)',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: '600',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px',
                          padding: '2px 6px',
                          borderRadius: '4px'
                        }}
                        title="Remove field"
                      >
                        <Trash2 size={13} /> Remove
                      </button>
                    </div>
                    <RichTextEditor
                      value={formNutrition}
                      onChange={setFormNutrition}
                      placeholder="e.g. Calories: 120, Protein: 5g, Carbohydrates: 20g (supports bold, dot list •, font style)"
                      minHeight="95px"
                    />
                  </div>
                )}

                {showHighlightsField && (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      padding: '14px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'var(--bg-card)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>
                        Product Highlights (Optional)
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setShowHighlightsField(false);
                          setFormHighlights('');
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--danger)',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: '600',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px',
                          padding: '2px 6px',
                          borderRadius: '4px'
                        }}
                        title="Remove field"
                      >
                        <Trash2 size={13} /> Remove
                      </button>
                    </div>
                    <RichTextEditor
                      value={formHighlights}
                      onChange={setFormHighlights}
                      placeholder="e.g. 100% Organically Farmed • Zero Preservatives • Rich in Natural Antioxidants"
                      minHeight="95px"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* MEDIA ASSETS SECTION (RIGHT BELOW OPTIONAL SPECIFICATIONS) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', backgroundColor: 'var(--bg-app)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <div>
              <span style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--text-primary)', display: 'block', marginBottom: '2px' }}>
                Product Media Assets
              </span>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Upload or link up to 3 product images, and attach an optional product video.
              </span>
            </div>

            {/* Images Container */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>
                  Product Images ({formImages.filter(Boolean).length} / 3)
                </span>
                {formImages.length < 3 && (
                  <button
                    type="button"
                    onClick={() => {
                      if (formImages.length < 3) {
                        setFormImages([...formImages, '']);
                        setImageModes([...imageModes, 'url']);
                      }
                    }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 10px',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: 'var(--primary)',
                      backgroundColor: 'var(--primary-light)',
                      border: '1px solid var(--primary)',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    <Plus size={13} /> Add Image Slot
                  </button>
                )}
              </div>

              {/* Render Slot Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: formImages.length > 1 ? 'repeat(auto-fit, minmax(220px, 1fr))' : '1fr', gap: '12px' }}>
                {formImages.slice(0, 3).map((imgUrl, index) => {
                  const mode = imageModes[index] || 'url';
                  return (
                    <div
                      key={index}
                      style={{
                        padding: '12px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-color)',
                        backgroundColor: 'var(--bg-card)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-primary)' }}>
                          Image Slot {index + 1} {index === 0 ? '(Primary)' : '(Optional)'}
                        </span>

                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          {/* Toggle URL vs Upload Mode */}
                          <div style={{ display: 'flex', backgroundColor: 'var(--bg-app)', padding: '2px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                            <button
                              type="button"
                              onClick={() => setImageModes(prev => { const n = [...prev]; n[index] = 'url'; return n; })}
                              style={{
                                padding: '2px 6px',
                                fontSize: '10px',
                                fontWeight: mode === 'url' ? '600' : 'normal',
                                color: mode === 'url' ? 'var(--primary)' : 'var(--text-muted)',
                                backgroundColor: mode === 'url' ? 'var(--primary-light)' : 'transparent',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '2px'
                              }}
                            >
                              <Link size={10} /> URL
                            </button>
                            <button
                              type="button"
                              onClick={() => setImageModes(prev => { const n = [...prev]; n[index] = 'upload'; return n; })}
                              style={{
                                padding: '2px 6px',
                                fontSize: '10px',
                                fontWeight: mode === 'upload' ? '600' : 'normal',
                                color: mode === 'upload' ? 'var(--primary)' : 'var(--text-muted)',
                                backgroundColor: mode === 'upload' ? 'var(--primary-light)' : 'transparent',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '2px'
                              }}
                            >
                              <Upload size={10} /> Upload
                            </button>
                          </div>

                          {index > 0 && (
                            <button
                              type="button"
                              onClick={() => removeImageSlot(index)}
                              style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '2px' }}
                              title="Remove Image Slot"
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                      </div>

                      {mode === 'url' ? (
                        <Input
                          placeholder="Paste image URL (e.g. https://...)"
                          value={imgUrl}
                          onChange={(e) => updateImageSlot(index, e.target.value)}
                        />
                      ) : (
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                handleFileUpload(index, e.target.files[0]);
                              }
                            }}
                            style={{ fontSize: '11px', color: 'var(--text-secondary)' }}
                          />
                        </div>
                      )}

                      {/* Image Preview Thumbnail with Diagnostic Error Indicator */}
                      {imgUrl && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            {!imageSlotErrors[index] ? (
                              <img
                                src={imgUrl}
                                alt={`Preview ${index + 1}`}
                                onError={() => {
                                  setImageSlotErrors(prev => ({ ...prev, [index]: true }));
                                }}
                                style={{ width: '48px', height: '48px', borderRadius: '6px', objectFit: 'cover', border: '1px solid var(--border-color)' }}
                              />
                            ) : (
                              <div
                                style={{
                                  width: '48px',
                                  height: '48px',
                                  borderRadius: '6px',
                                  backgroundColor: 'var(--danger-light, rgba(239, 68, 68, 0.12))',
                                  border: '1px solid var(--danger)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: 'var(--danger)'
                                }}
                                title="Image URL failed to load"
                              >
                                <AlertCircle size={22} />
                              </div>
                            )}
                            <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                              <span style={{ fontSize: '11px', fontWeight: '600', color: imageSlotErrors[index] ? 'var(--danger)' : 'var(--text-secondary)' }}>
                                {imageSlotErrors[index] ? 'Image Load Failed' : 'Preview Active'}
                              </span>
                              <span style={{ fontSize: '10px', color: imageSlotErrors[index] ? 'var(--danger)' : 'var(--text-muted)' }}>
                                {imageSlotErrors[index] ? 'Invalid URL or unreachable host' : 'Image ready for catalog'}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => updateImageSlot(index, '')}
                              style={{ background: 'none', border: 'none', color: 'var(--danger)', fontSize: '11px', cursor: 'pointer', fontWeight: '600', marginLeft: 'auto' }}
                            >
                              Clear
                            </button>
                          </div>
                          {imageSlotErrors[index] && (
                            <div style={{ padding: '6px 10px', backgroundColor: 'var(--danger-light, rgba(239, 68, 68, 0.1))', border: '1px solid var(--danger)', borderRadius: '6px', fontSize: '11px', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <AlertTriangle size={13} />
                              <span>Issue: The image link cannot be rendered. Please check the URL or upload an image file.</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Video Section (Upload Only, Optional) */}
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', display: 'block' }}>
                    Product Video (Optional - File Upload Only)
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Upload MP4 or WebM video file (Max 20MB)
                  </span>
                </div>
                {formVideoUrl && (
                  <button
                    type="button"
                    onClick={() => setFormVideoUrl('')}
                    style={{ background: 'none', border: 'none', color: 'var(--danger)', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Trash2 size={13} /> Remove Video
                  </button>
                )}
              </div>

              <div
                style={{
                  border: '2px dashed var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '14px',
                  textAlign: 'center',
                  backgroundColor: 'var(--bg-card)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <input
                  type="file"
                  accept="video/mp4,video/webm,video/ogg,video/*"
                  id="product-video-file-input"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleVideoUpload(e.target.files[0]);
                    }
                  }}
                  style={{ display: 'none' }}
                />
                <label
                  htmlFor="product-video-file-input"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 14px',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: 'var(--primary)',
                    backgroundColor: 'var(--primary-light)',
                    border: '1px solid var(--primary)',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  <Upload size={14} /> Upload Product Video
                </label>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  {formVideoUrl ? 'Video file attached' : 'No video file selected (Optional)'}
                </span>
              </div>

              {/* Live Video Player Preview */}
              {formVideoUrl && (
                <div style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)', padding: '10px', marginTop: '4px' }}>
                  <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                    Uploaded Video Preview
                  </span>
                  <video
                    src={formVideoUrl}
                    controls
                    muted
                    style={{ width: '100%', maxHeight: '180px', borderRadius: '6px', backgroundColor: 'black' }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Weight Options List — Each Weight Option Has Its Own Weight/Unit, Pricing & Valuation, and Inventory Management */}
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <span style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--text-primary)', display: 'block' }}>
                  Product Weight Options (Each with Pricing & Inventory)
                </span>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Add multiple weight options. Each option includes its own weight/unit, Pricing & Valuation, and Inventory Management.
                </span>
              </div>
              <button
                type="button"
                onClick={addVariantOption}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '6px 12px',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: 'var(--primary)',
                  backgroundColor: 'var(--primary-light)',
                  border: '1px solid var(--primary)',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                <Plus size={14} /> Add Weight Option
              </button>
            </div>

            {/* Render Card per Weight Option */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {formVariants.map((variant, index) => (
                <div
                  key={variant.id || index}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    backgroundColor: 'var(--bg-app)',
                    padding: '16px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)'
                  }}
                >
                  {/* Card Header: Option # & Remove button */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--primary)' }}>
                      Weight Option #{index + 1} ({variant.value || '0'}{variant.unit})
                    </span>
                    {formVariants.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeVariantOption(index)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--danger)',
                          cursor: 'pointer',
                          fontSize: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                        title="Remove Weight Option"
                      >
                        <Trash2 size={13} /> Remove Option
                      </button>
                    )}
                  </div>

                  {/* Weight Value & Unit Dropdown */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <Input
                      label="Weight Value"
                      type="number"
                      placeholder="e.g. 1000"
                      value={variant.value}
                      onChange={(e) => updateVariantOption(index, 'value', e.target.value)}
                    />
                    <Select
                      label="Unit Dropdown"
                      value={variant.unit}
                      onChange={(e) => updateVariantOption(index, 'unit', e.target.value)}
                      options={['g', 'ml', 'kg', 'L', 'pack', 'pcs']}
                    />
                  </div>

                  {/* Pricing & Valuation for THIS Weight Option */}
                  <div style={{ borderTop: '1px dashed var(--border-color)', paddingTop: '10px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-primary)', display: 'block', marginBottom: '8px' }}>
                      Pricing & Valuation ({variant.value || '0'}{variant.unit})
                    </span>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <Input
                        label="Regular Price (£)"
                        type="number"
                        step="0.01"
                        value={variant.regularPrice}
                        onChange={(e) => updateVariantOption(index, 'regularPrice', e.target.value)}
                      />
                      <Input
                        label="Sale Price (£)"
                        type="number"
                        step="0.01"
                        value={variant.salePrice}
                        onChange={(e) => updateVariantOption(index, 'salePrice', e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Inventory Management for THIS Weight Option */}
                  <div style={{ borderTop: '1px dashed var(--border-color)', paddingTop: '10px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-primary)', display: 'block', marginBottom: '8px' }}>
                      Inventory Management ({variant.value || '0'}{variant.unit})
                    </span>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <Input
                        label="Current Stock"
                        type="number"
                        value={variant.stock}
                        onChange={(e) => updateVariantOption(index, 'stock', e.target.value)}
                      />
                      <Input
                        label="Min Stock Alert"
                        type="number"
                        value={variant.minStock}
                        onChange={(e) => updateVariantOption(index, 'minStock', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Product Tags Section (Up to 10 tags) */}
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <span style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--text-primary)', display: 'block' }}>
                  Product Tags (Up to 10)
                </span>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Add keywords/tags to organize products and improve search indexing (Max 10 tags).
                </span>
              </div>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: '700',
                  padding: '3px 10px',
                  borderRadius: '12px',
                  backgroundColor: formTags.length >= 10 ? 'var(--warning-light, rgba(245, 158, 11, 0.15))' : 'var(--primary-light)',
                  color: formTags.length >= 10 ? 'var(--warning, #d97706)' : 'var(--primary)'
                }}
              >
                {formTags.length} / 10 tags
              </span>
            </div>

            {/* Tag Input Field & Add Button */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                  <Tag size={14} />
                </span>
                <input
                  type="text"
                  placeholder={formTags.length >= 10 ? 'Tag limit reached (10 max)' : 'Type a tag and press Enter... (e.g. Organic, Fresh, Bestseller)'}
                  value={tagInput}
                  disabled={formTags.length >= 10}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 12px 8px 32px',
                    fontSize: '13px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: formTags.length >= 10 ? 'var(--bg-app)' : 'var(--bg-card)',
                    color: 'var(--text-primary)',
                    outline: 'none'
                  }}
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={formTags.length >= 10 || !tagInput.trim()}
                onClick={() => handleAddTag()}
              >
                <Plus size={14} /> Add Tag
              </Button>
            </div>

            {/* Active Tags Badge Chips */}
            {formTags.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px' }}>
                {formTags.map((tag, idx) => (
                  <span
                    key={idx}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '4px 10px',
                      fontSize: '12px',
                      fontWeight: '600',
                      backgroundColor: 'var(--primary-light)',
                      color: 'var(--primary)',
                      borderRadius: '16px',
                      border: '1px solid var(--primary-light)',
                      boxShadow: 'var(--shadow-sm)'
                    }}
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(idx)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--primary)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '0',
                        marginLeft: '2px'
                      }}
                      title="Remove tag"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Quick Suggestion Pills */}
            {formTags.length < 10 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginTop: '2px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '500' }}>Quick Add:</span>
                {['Organic', 'Fresh', 'Bestseller', 'Gluten-Free', 'Vegan', 'Discount', 'Trending', 'Local'].map((sampleTag) => {
                  const isAdded = formTags.some(t => t.toLowerCase() === sampleTag.toLowerCase());
                  if (isAdded) return null;
                  return (
                    <button
                      key={sampleTag}
                      type="button"
                      onClick={() => handleAddTag(sampleTag)}
                      style={{
                        padding: '2px 8px',
                        fontSize: '11px',
                        fontWeight: '500',
                        color: 'var(--text-secondary)',
                        backgroundColor: 'var(--bg-app)',
                        border: '1px dashed var(--border-color)',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'var(--primary)';
                        e.currentTarget.style.color = 'var(--primary)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'var(--border-color)';
                        e.currentTarget.style.color = 'var(--text-secondary)';
                      }}
                    >
                      + {sampleTag}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Global Details */}
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Input label="Warehouse Location" value={formWarehouse} onChange={(e) => setFormWarehouse(e.target.value)} placeholder="e.g. Aisle 1, Shelf A1" />
            <Select label="Status" value={formStatus} onChange={(e) => setFormStatus(e.target.value)} options={['active', 'inactive', 'draft']} />
          </div>

        </form>
      </Drawer>

    </div>
  );
};
export default Products;