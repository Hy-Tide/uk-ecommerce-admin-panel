import React, { useState, useEffect } from 'react';
import { Edit3, Plus, Search, Trash2, Filter, FileSpreadsheet, Layers, Sliders, Settings, Video } from 'lucide-react';
import Button from '../components/Button';
import Drawer from '../components/Drawer';
import Input, { Select, Textarea, Checkbox } from '../components/Input';
import Table from '../components/Table';
import ListView from '../components/ListView';
import GridView from '../components/GridView';
import ViewToggle from '../components/ViewToggle';
import Badge from '../components/Badge';
import Uploader from '../components/Uploader';
import { getData, postData, putData, deleteData, showSnackbar } from '../services/api';

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
  const [formStatus, setFormStatus] = useState('Published');
  const [formWeight, setFormWeight] = useState('');
  const [formPackSize, setFormPackSize] = useState('');
  const [formVideoUrl, setFormVideoUrl] = useState('');

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
      setFormNutrition(prod.nutritionFacts || '');
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
      setFormStatus(prod.status || 'Published');
      setFormWeight(prod.weight || '');
      setFormPackSize(prod.packSize || '');
      setFormVideoUrl(prod.videoUrl || '');
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
      setFormStorage('');
      setFormCountry('USA');
      setFormImages([]);
      setFormRegularPrice(0);
      setFormSalePrice(0);
      setFormCostPrice(0);
      setFormStock(50);
      setFormMinStock(10);
      setFormMaxStock(300);
      setFormReorderLevel(15);
      setFormWarehouse('Aisle 1, Shelf A1');
      setFormStatus('Published');
      setFormWeight('1kg');
      setFormPackSize('1 bag');
      setFormVideoUrl('');
    }
    setDrawerOpen(true);
  };

  const [loading, setLoading] = useState(false);
  const [liveCategories, setLiveCategories] = useState([]);
  const [liveSubCategories, setLiveSubCategories] = useState([]);
  const [liveBrands, setLiveBrands] = useState([]);

  // Fetch live Categories, Subcategories, Brands & Products
  useEffect(() => {
    const fetchAllLiveData = async () => {
      try {
        const queryParams = { limit: 100 };

        // 1. Fetch live categories
        let catRes = await getData('admin/categories', queryParams);
        let catList = catRes?.data?.categories || (Array.isArray(catRes?.data) ? catRes.data : []);
        if (!Array.isArray(catList) || catList.length === 0) {
          catRes = await getData('website/categories', queryParams);
          catList = catRes?.data?.categories || (Array.isArray(catRes?.data) ? catRes.data : []);
        }
        if (Array.isArray(catList) && catList.length > 0) {
          const formattedCats = catList.map(c => ({ id: c._id || c.id, _id: c._id || c.id, name: c.name }));
          setLiveCategories(formattedCats);
        }

        // 2. Fetch live subcategories
        let subRes = await getData('admin/subcategories', queryParams);
        let subList = subRes?.data?.subCategories || subRes?.data?.subcategories || (Array.isArray(subRes?.data) ? subRes.data : []);
        if (Array.isArray(subList) && subList.length > 0) {
          const formattedSubs = subList.map(s => ({ id: s._id || s.id, _id: s._id || s.id, name: s.name, category_id: s.category_id }));
          setLiveSubCategories(formattedSubs);
        }

        // 3. Fetch live brands
        let brandRes = await getData('admin/brands', queryParams);
        let brandList = brandRes?.data?.brands || (Array.isArray(brandRes?.data) ? brandRes.data : []);
        if (!Array.isArray(brandList) || brandList.length === 0) {
          brandRes = await getData('website/brands', queryParams);
          brandList = brandRes?.data?.brands || (Array.isArray(brandRes?.data) ? brandRes.data : []);
        }
        if (Array.isArray(brandList) && brandList.length > 0) {
          const formattedBrands = brandList.map(b => ({ id: b._id || b.id, _id: b._id || b.id, name: b.name }));
          setLiveBrands(formattedBrands);
        }

        // 4. Fetch live products
        if (search.trim()) queryParams.search = search.trim();
        let prodRes = await getData('admin/products', queryParams);
        let prodList = prodRes?.data?.products || (Array.isArray(prodRes?.data) ? prodRes.data : []);
        if (!Array.isArray(prodList) || prodList.length === 0) {
          prodRes = await getData('website/products', queryParams);
          prodList = prodRes?.data?.products || (Array.isArray(prodRes?.data) ? prodRes.data : []);
        }

        if (Array.isArray(prodList) && prodList.length > 0) {
          const allCats = (catList && catList.length > 0) ? catList : categories;
          const allBrands = (brandList && brandList.length > 0) ? brandList : brands;
          const allSubs = (subList && subList.length > 0) ? subList : [];

          const formattedProds = prodList.map((p) => {
            const catObj = allCats.find(c => c.id === p.category_id || c._id === p.category_id);
            const subObj = allSubs.find(s => s.id === p.sub_category_id || s._id === p.sub_category_id);
            const brandObj = allBrands.find(b => b.id === p.brand_id || b._id === p.brand_id);
            const firstVariant = Array.isArray(p.variants) && p.variants.length > 0 ? p.variants[0] : {};

            return {
              id: p._id || p.id,
              name: p.title || p.name,
              sku: firstVariant.sku || p.sku || `SKU-${p._id ? p._id.slice(-4) : '001'}`,
              barcode: p.barcode || '123456789012',
              category: catObj ? catObj.name : (p.category_name || 'Fresh Fruits & Vegetables'),
              subCategory: subObj ? subObj.name : '',
              brand: brandObj ? brandObj.name : (p.brand_name || 'Aachi'),
              description: p.description || '',
              ingredients: '',
              nutritionFacts: '',
              storageInstructions: '',
              countryOfOrigin: 'USA',
              images: Array.isArray(p.images) && p.images.length > 0 ? p.images : ['https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=400'],
              regularPrice: p.base_price || 0,
              salePrice: p.discount_price || p.base_price || 0,
              costPrice: p.costPrice || 0,
              stock: firstVariant.stock_quantity !== undefined ? firstVariant.stock_quantity : (p.stock !== undefined ? p.stock : 50),
              minStock: 10,
              maxStock: 200,
              reorderLevel: 15,
              warehouseLocation: 'Aisle 1, Shelf A1',
              status: p.status ? (p.status.toLowerCase() === 'active' || p.status.toLowerCase() === 'published' ? 'Published' : 'Draft') : 'Published',
              weight: p.weight || '1kg',
              packSize: '1 unit',
              videoUrl: '',
              rating: 4.8,
              reviewsCount: 12
            };
          });
          setProducts(formattedProds);
        }
      } catch (err) {
        console.warn('Using fallback data:', err);
      }
    };

    fetchAllLiveData();
  }, [search]);

  // If dashboard quick action requested
  React.useEffect(() => {
    if (externalOpenDrawer) {
      openEditDrawer(null);
      setExternalOpenDrawer(false);
    }
  }, [externalOpenDrawer]);

  const saveProductSubmit = async (e) => {
    e.preventDefault();
    if (!formName) {
      addToast('Product name is required', 'danger');
      return;
    }

    setLoading(true);

    const effectiveCats = liveCategories.length > 0 ? liveCategories : categories;
    const effectiveBrands = liveBrands.length > 0 ? liveBrands : brands;

    const catObj = effectiveCats.find(c => c.name === formCategory || c.id === formCategory || c._id === formCategory);
    const subCatObj = liveSubCategories.find(s => s.name === formSubCategory || s.id === formSubCategory || s._id === formSubCategory);
    const brandObj = effectiveBrands.find(b => b.name === formBrand || b.id === formBrand || b._id === formBrand);

    const apiPayload = {
      title: formName,
      category_id: catObj ? (catObj._id || catObj.id) : (categories[0]?._id || categories[0]?.id || ''),
      sub_category_id: subCatObj ? (subCatObj._id || subCatObj.id) : undefined,
      brand_id: brandObj ? (brandObj._id || brandObj.id) : (brands[0]?._id || brands[0]?.id || ''),
      description: formDesc || '',
      base_price: Number(formRegularPrice) || 0,
      discount_price: Number(formSalePrice) || Number(formRegularPrice) || 0,
      weight: formWeight || '1',
      unit: 'kg',
      images: formImages.length > 0 ? formImages : ['https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=400'],
      is_featured: true,
      status: formStatus.toLowerCase() === 'published' || formStatus.toLowerCase() === 'active' ? 'active' : 'draft',
      variants: [
        {
          sku: formSku || `SKU-${Date.now()}`,
          attributes: {},
          price_modifier: 0,
          stock_quantity: Number(formStock) || 0
        }
      ]
    };

    const localPayload = {
      id: selectedProduct ? selectedProduct.id : `prod-${Date.now()}`,
      name: formName,
      sku: formSku,
      barcode: formBarcode,
      category: formCategory,
      subCategory: formSubCategory,
      brand: formBrand,
      description: formDesc,
      ingredients: formIngredients,
      nutritionFacts: formNutrition,
      storageInstructions: formStorage,
      countryOfOrigin: formCountry,
      images: formImages.length > 0 ? formImages : ['https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=400'],
      regularPrice: Number(formRegularPrice),
      salePrice: Number(formSalePrice) || Number(formRegularPrice),
      costPrice: Number(formCostPrice),
      stock: Number(formStock),
      minStock: Number(formMinStock),
      maxStock: Number(formMaxStock),
      reorderLevel: Number(formReorderLevel),
      warehouseLocation: formWarehouse,
      status: formStatus,
      weight: formWeight,
      packSize: formPackSize,
      videoUrl: formVideoUrl,
      rating: selectedProduct ? selectedProduct.rating : 5.0,
      reviewsCount: selectedProduct ? selectedProduct.reviewsCount : 0
    };

    try {
      if (selectedProduct) {
        if (selectedProduct.id && !selectedProduct.id.startsWith('prod-')) {
          await putData(`admin/products/${selectedProduct.id}`, apiPayload);
        }
        setProducts(products.map(p => p.id === selectedProduct.id ? localPayload : p));
        addToast('Product updated successfully', 'success');
        showSnackbar('Product updated successfully!', 'success');
      } else {
        const res = await postData('admin/products', apiPayload);
        const pData = res?.data?.product || res?.data || {};

        if (pData && pData._id) {
          localPayload.id = pData._id;
        }

        setProducts([localPayload, ...products]);
        addToast('Product created successfully', 'success');
        showSnackbar('Product created successfully!', 'success');
      }

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
      if (selectedProduct) {
        setProducts(products.map(p => p.id === selectedProduct.id ? localPayload : p));
      } else {
        setProducts([localPayload, ...products]);
      }
      addToast('Product saved locally', 'info');
    } finally {
      setLoading(false);
      setDrawerOpen(false);
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
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      p.barcode.toLowerCase().includes(search.toLowerCase());

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
            <img src={row.images[0]} alt={row.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '8px' }} />
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
          <span style={{ fontWeight: '600', color: 'var(--primary)' }}>${row.salePrice.toFixed(2)}</span>
          {row.salePrice < row.regularPrice && (
            <span style={{ fontSize: '11px', textDecoration: 'line-through', color: 'var(--text-muted)' }}>
              ${row.regularPrice.toFixed(2)}
            </span>
          )}
        </div>
      )
    },
    {
      key: 'stock',
      label: 'Stock Status',
      render: (row) => {
        if (row.stock === 0) return <Badge variant="danger">Out of stock (0)</Badge>;
        if (row.stock <= row.minStock) return <Badge variant="warning">Low stock ({row.stock})</Badge>;
        return <Badge variant="success">In stock ({row.stock})</Badge>;
      }
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <Badge variant={row.status === 'Published' ? 'success' : row.status === 'Draft' ? 'secondary' : 'danger'}>
          {row.status}
        </Badge>
      )
    },
    {
      key: 'actions',
      label: '',
      render: (row) => (
        <div style={{ display: 'flex', gap: '8px' }}>
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

      {/* Main presentation layer switcher */}
      {viewMode === 'list' ? (
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
          initialRowsPerPage={10}
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
          initialRowsPerPage={8}
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
              label="Sub Category (Optional)"
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

          <Textarea label="Long Description" value={formDesc} onChange={(e) => setFormDesc(e.target.value)} placeholder="Write details about benefits, flavors..." />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Input label="Ingredients List" value={formIngredients} onChange={(e) => setFormIngredients(e.target.value)} placeholder="e.g. 100% Organic Oats" />
            <Input label="Nutrition Facts" value={formNutrition} onChange={(e) => setFormNutrition(e.target.value)} placeholder="e.g. Calories: 120" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Input label="Weight/Volume" value={formWeight} onChange={(e) => setFormWeight(e.target.value)} placeholder="e.g. 500g" />
            <Input label="Pack Size" value={formPackSize} onChange={(e) => setFormPackSize(e.target.value)} placeholder="e.g. Pack of 6" />
          </div>

          {/* Pricing fields */}
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
            <span style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--text-primary)', display: 'block', marginBottom: '12px' }}>Pricing & Valuation</span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              <Input label="Regular Price ($)" type="number" step="0.01" value={formRegularPrice} onChange={(e) => setFormRegularPrice(e.target.value)} />
              <Input label="Sale Price ($)" type="number" step="0.01" value={formSalePrice} onChange={(e) => setFormSalePrice(e.target.value)} />
              <Input label="Wholesale Cost ($)" type="number" step="0.01" value={formCostPrice} onChange={(e) => setFormCostPrice(e.target.value)} />
            </div>
          </div>

          {/* Stock inventory fields */}
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
            <span style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--text-primary)', display: 'block', marginBottom: '12px' }}>Inventory Management</span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              <Input label="Current Stock" type="number" value={formStock} onChange={(e) => setFormStock(e.target.value)} />
              <Input label="Min Stock Alert" type="number" value={formMinStock} onChange={(e) => setFormMinStock(e.target.value)} />
              <Input label="Reorder Level" type="number" value={formReorderLevel} onChange={(e) => setFormReorderLevel(e.target.value)} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '12px' }}>
              <Input label="Warehouse Location" value={formWarehouse} onChange={(e) => setFormWarehouse(e.target.value)} placeholder="e.g. Aisle 3, Shelf B" />
              <Select label="Status" value={formStatus} onChange={(e) => setFormStatus(e.target.value)} options={['Published', 'Draft', 'Archived']} />
            </div>
          </div>

          {/* Media uploader & Video URL */}
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Input
              label="Product Image URL"
              value={formImages[0] || ''}
              onChange={(e) => setFormImages(e.target.value ? [e.target.value] : [])}
              placeholder="https://images.unsplash.com/... or image URL"
            />

            {formImages[0] && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '10px 14px', borderRadius: '10px',
                backgroundColor: 'var(--bg-app)', border: '1px solid var(--border-color)'
              }}>
                <img
                  src={formImages[0]}
                  alt="Product preview"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  style={{ width: '56px', height: '56px', borderRadius: '8px', objectFit: 'cover' }}
                />
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  Live Image Preview
                </span>
              </div>
            )}

            <Input
              label="Product Video URL (Optional)"
              value={formVideoUrl}
              onChange={(e) => setFormVideoUrl(e.target.value)}
              placeholder="e.g. https://assets.mixkit.co/videos/preview/..."
            />

            {formVideoUrl && (
              <div style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-app)', padding: '12px' }}>
                <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>Video Preview</span>
                <video
                  src={formVideoUrl}
                  controls
                  muted
                  style={{ width: '100%', maxHeight: '180px', borderRadius: '6px', backgroundColor: 'black' }}
                />
              </div>
            )}
          </div>

        </form>
      </Drawer>

    </div>
  );
};
export default Products;
