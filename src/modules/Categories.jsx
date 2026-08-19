import { useState, useEffect } from 'react';
import { Folder, FolderPlus, Trash2, Edit, GripVertical, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Input, { Select, Textarea } from '../components/Input';
import Badge from '../components/Badge';
import Uploader from '../components/Uploader';
import GridView from '../components/GridView';
import ViewToggle from '../components/ViewToggle';
import { getData, postData, putData, deleteData, showSnackbar } from '../services/api';

export const Categories = ({
  categories = [],
  setCategories,
  addToast,
  auditLogs = [],
  setAuditLogs
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [draggingId, setDraggingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('view-mode-categories') || 'list';
  });
  const [isFetchingCats, setIsFetchingCats] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedParentCategory, setSelectedParentCategory] = useState(null);
  const limit = 10;

  const handleViewChange = (newView) => {
    setViewMode(newView);
    localStorage.setItem('view-mode-categories', newView);
  };

  // Form fields
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');
  const [parent, setParent] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imageMode, setImageMode] = useState('url');
  const [displayOrder, setDisplayOrder] = useState(1);
  const [status, setStatus] = useState('Active');

  const openModal = (cat = null) => {
    setEditingCategory(cat);
    setNameError('');
    if (cat) {
      setName(cat.name);
      setParent(cat.parent || '');
      setDescription(cat.description || '');
      setIcon(cat.icon || cat.image_url || '');
      setDisplayOrder(cat.displayOrder || 1);
      setStatus(cat.status || 'Active');
    } else {
      setName('');
      setParent('');
      setDescription('');
      setIcon('');
      setImageFile(null);
      setDisplayOrder(categories.length + 1);
      setStatus('Active');
    }
    setModalOpen(true);
  };

  // Helper to format & resolve backend image URLs
  const resolveImageUrl = (img) => {
    if (!img || typeof img !== 'string') return '';
    return img.trim();
  };

  const getCategoryImg = (item) => {
    const raw = item.image_url || item.image || item.imageUrl || item.icon || item.thumbnail || '';
    return resolveImageUrl(raw);
  };

  // Reset page when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);

  // Live Fetch from GET /admin/categories & GET /admin/subcategories
  useEffect(() => {
    const fetchLiveCategories = async () => {
      setIsFetchingCats(true);
      try {
        const queryParams = { limit: limit, page: currentPage };
        if (searchTerm.trim()) queryParams.search = searchTerm.trim();
        if (filterStatus !== 'all') queryParams.status = filterStatus.toLowerCase();

        // Fetch root categories
        let response = await getData('admin/categories', queryParams);
        let catList = response?.data?.categories || (Array.isArray(response?.data) ? response.data : []);

        if (!Array.isArray(catList) || catList.length === 0) {
          response = await getData('website/categories', queryParams);
          catList = response?.data?.categories || (Array.isArray(response?.data) ? response.data : []);
        }

        // Fetch subcategories
        let subResponse = await getData('admin/subcategories', queryParams);
        let subList = subResponse?.data?.subCategories || subResponse?.data?.subcategories || (Array.isArray(subResponse?.data) ? subResponse.data : []);

        const catPages = response?.data?.meta?.totalPages || 1;
        setTotalPages(catPages);

        const categoryMap = {};
        if (Array.isArray(catList)) {
          catList.forEach(c => {
            const cId = c._id || c.id;
            categoryMap[cId] = c.name;
          });
        }

        const formattedCategories = Array.isArray(catList) ? catList.map((c, idx) => ({
          id: c._id || c.id,
          name: c.name,
          parent: null,
          description: c.description || '',
          icon: getCategoryImg(c) || 'https://images.unsplash.com/photo-1610348725531-843dff163e2c?auto=format&fit=crop&q=80&w=100',
          displayOrder: c.displayOrder || idx + 1,
          status: c.status ? (c.status.toLowerCase() === 'active' ? 'Active' : 'Inactive') : 'Active'
        })) : [];

        const formattedSubCategories = Array.isArray(subList) ? subList.map((s, idx) => {
          const parentName = categoryMap[s.category_id] || s.category_name || null;
          return {
            id: s._id || s.id,
            name: s.name,
            parent: parentName,
            category_id: s.category_id,
            description: s.description || '',
            icon: getCategoryImg(s) || 'https://images.unsplash.com/photo-1610348725531-843dff163e2c?auto=format&fit=crop&q=80&w=100',
            displayOrder: s.displayOrder || idx + 1,
            status: s.status ? (s.status.toLowerCase() === 'active' ? 'Active' : 'Inactive') : 'Active',
            isSubcategory: true
          };
        }) : [];

        setCategories([...formattedCategories, ...formattedSubCategories]);
      } catch (err) {
        console.warn('Error fetching live categories:', err);
        setCategories([]);
      } finally {
        setIsFetchingCats(false);
      }
    };

    fetchLiveCategories();
  }, [searchTerm, filterStatus, currentPage]);

  const isValidUrl = (str) => {
    if (!str || typeof str !== 'string') return false;
    return Boolean(str.trim());
  };

  const DEFAULT_VALID_IMAGE = 'https://images.unsplash.com/photo-1610348725531-843dff163e2c?auto=format&fit=crop&q=80&w=400';

  const handleSaveSubmit = async (e) => {
    e.preventDefault();
    setNameError('');

    const trimmedName = (name || '').trim();

    if (!trimmedName || trimmedName.length < 2) {
      setNameError('Subcategory name must be at least 2 characters long.');
      addToast('Name must be at least 2 characters long', 'danger');
      return;
    }

    setLoading(true);

    try {
      const validImgUrl = isValidUrl(icon) ? icon.trim() : DEFAULT_VALID_IMAGE;

      if (editingCategory) {
        // Edit flow
        const isSub = editingCategory.isSubcategory || !!editingCategory.parent;

        if (editingCategory.id && !editingCategory.id.startsWith('cat-') && !editingCategory.id.startsWith('sub-')) {
          let res;
          const statusVal = (status && status.toLowerCase() === 'active') ? 'Active' : 'Inactive';
          if (isSub) {
            const parentCatObj = categories.find(c => c.name === parent || c.id === parent || c._id === parent);
            let parentId = parentCatObj ? (parentCatObj.id || parentCatObj._id) : editingCategory.category_id;
            if (!parentId || parentId.startsWith('cat-')) {
              const realCat = categories.find(c => !c.parent && c.id && !c.id.startsWith('cat-') && c.id.length === 24);
              if (realCat) parentId = realCat.id;
            }

            if (!parentId) {
              addToast('Category ID is required for subcategories', 'danger');
              showSnackbar('Category ID is required. Please select a valid parent Category.', 'error');
              setLoading(false);
              return;
            }

            if (imageFile) {
              const formData = new FormData();
              formData.append('name', trimmedName);
              formData.append('category_id', parentId);
              formData.append('categoryId', parentId);
              formData.append('description', description || '');
              formData.append('status', statusVal);
              formData.append('is_active', statusVal === 'Active');
              formData.append('displayOrder', String(Number(displayOrder)));
              formData.append('image', imageFile);
              if (icon && !icon.startsWith('blob:')) formData.append('icon', validImgUrl);
              console.log('Subcategory Update FormData Payload (image: [File Binary])');
              res = await putData(`admin/subcategories/${editingCategory.id}`, formData);
            } else {
              const subPayload = {
                name: trimmedName,
                category_id: parentId,
                categoryId: parentId,
                description: description || '',
                image: validImgUrl,
                image_url: validImgUrl,
                icon: validImgUrl,
                displayOrder: Number(displayOrder),
                status: statusVal,
                is_active: statusVal === 'Active'
              };
              console.log('Subcategory Update JSON Payload:', subPayload);
              res = await putData(`admin/subcategories/${editingCategory.id}`, subPayload);
            }
          } else {
            if (imageFile) {
              const formData = new FormData();
              formData.append('name', trimmedName);
              formData.append('description', description || '');
              formData.append('status', statusVal);
              formData.append('is_active', statusVal === 'Active');
              formData.append('displayOrder', String(Number(displayOrder)));
              formData.append('image', imageFile);
              formData.append('icon', validImgUrl);
              formData.append('image_url', validImgUrl);
              console.log('Category Update FormData Payload');
              res = await putData(`admin/categories/${editingCategory.id}`, formData);
            } else {
              const catPayload = {
                name: trimmedName,
                description: description || '',
                icon: validImgUrl,
                image_url: validImgUrl,
                image: validImgUrl,
                status: statusVal,
                is_active: statusVal === 'Active',
                displayOrder: Number(displayOrder)
              };
              console.log('Category Update JSON Payload:', catPayload);
              res = await putData(`admin/categories/${editingCategory.id}`, catPayload);
            }
          }

          if (res?.success === false || res?.error) {
            const errMsg = res?.error || res?.message || 'Failed to update category in API';
            addToast(errMsg, 'danger');
            showSnackbar(errMsg, 'error');
            setLoading(false);
            return;
          }
        }

        const updatedCat = {
          id: editingCategory.id,
          name: trimmedName, parent: parent === '' ? null : parent,
          description, icon: validImgUrl, displayOrder: Number(displayOrder), status,
          isSubcategory: isSub
        };
        setCategories(categories.map(c => c.id === editingCategory.id ? updatedCat : c));
        addToast('Category updated successfully', 'success');
        showSnackbar('Category updated successfully!', 'success');
      } else {
        // Create flow: Check if parent is selected (Subcategory) or not (Root Category)
        const statusVal = (status && status.toLowerCase() === 'active') ? 'Active' : 'Inactive';

        if (parent && parent !== '') {
          // POST /admin/subcategories
          const parentCatObj = categories.find(c => c.name === parent || c.id === parent || c._id === parent);
          let parentId = parentCatObj ? (parentCatObj.id || parentCatObj._id) : '';
          if (!parentId || parentId.startsWith('cat-')) {
            const realCat = categories.find(c => !c.parent && c.id && !c.id.startsWith('cat-') && c.id.length === 24);
            if (realCat) parentId = realCat.id;
          }

          if (!parentId) {
            addToast('Category ID is required for subcategories', 'danger');
            showSnackbar('Category ID is required. Please select a valid parent Category.', 'error');
            setLoading(false);
            return;
          }

          let res;
          if (imageFile) {
            const formData = new FormData();
            formData.append('name', trimmedName);
            formData.append('category_id', parentId);
            formData.append('categoryId', parentId);
            formData.append('description', description || '');
            formData.append('status', statusVal);
            formData.append('is_active', statusVal === 'Active');
            formData.append('displayOrder', String(Number(displayOrder)));
            formData.append('image', imageFile);
            if (icon && !icon.startsWith('blob:')) formData.append('icon', validImgUrl);
            console.log('Subcategory Create FormData Payload (image: [File Binary])');
            res = await postData('admin/subcategories', formData);
          } else {
            const subPayload = {
              name: trimmedName,
              category_id: parentId,
              categoryId: parentId,
              description: description || '',
              image: validImgUrl,
              image_url: validImgUrl,
              icon: validImgUrl,
              displayOrder: Number(displayOrder),
              status: statusVal,
              is_active: statusVal === 'Active'
            };
            console.log('Subcategory Create JSON Payload:', subPayload);
            res = await postData('admin/subcategories', subPayload);
          }
          if (res?.success === false || res?.error) {
            const errMsg = res?.error || res?.message || 'Failed to create subcategory in API';
            addToast(errMsg, 'danger');
            showSnackbar(errMsg, 'error');
            setLoading(false);
            return;
          }

          const sData = res?.data?.subCategory || res?.data || {};
          const newSubObj = {
            id: sData._id || sData.id || `sub-${Date.now()}`,
            name: sData.name || name,
            parent: parent,
            category_id: parentId,
            description: description || '',
            icon: sData.image_url || validImgUrl,
            displayOrder: Number(displayOrder),
            status: sData.status ? (sData.status.toLowerCase() === 'active' ? 'Active' : 'Inactive') : statusVal,
            isSubcategory: true
          };

          setCategories([...categories, newSubObj]);
          addToast('Subcategory created successfully', 'success');
          showSnackbar('Subcategory created successfully!', 'success');
        } else {
          // POST /admin/categories
          let res;
          if (imageFile) {
            const formData = new FormData();
            formData.append('name', name);
            formData.append('description', description || '');
            formData.append('status', statusVal);
            formData.append('is_active', statusVal === 'Active');
            formData.append('displayOrder', String(Number(displayOrder)));
            formData.append('image', imageFile);
            formData.append('icon', validImgUrl);
            formData.append('image_url', validImgUrl);
            console.log('Category Create FormData Payload');
            res = await postData('admin/categories', formData);
          } else {
            const catPayload = {
              name,
              description: description || '',
              icon: validImgUrl,
              image_url: validImgUrl,
              image: validImgUrl,
              status: statusVal,
              is_active: statusVal === 'Active',
              displayOrder: Number(displayOrder)
            };
            console.log('Category Create JSON Payload:', catPayload);
            res = await postData('admin/categories', catPayload);
          }

          if (res?.success === false || res?.error) {
            const errMsg = res?.error || res?.message || 'Failed to create category in API';
            addToast(errMsg, 'danger');
            showSnackbar(errMsg, 'error');
            setLoading(false);
            return;
          }

          const cData = res?.data?.category || res?.data || {};
          const newCatObj = {
            id: cData._id || cData.id || `cat-${Date.now()}`,
            name: cData.name || name,
            parent: null,
            description: cData.description || description,
            icon: cData.image_url || icon,
            displayOrder: Number(displayOrder),
            status: cData.status ? (cData.status.toLowerCase() === 'active' ? 'Active' : 'Inactive') : status
          };

          setCategories([...categories, newCatObj]);
          addToast('Category created successfully', 'success');
          showSnackbar('Category created successfully!', 'success');
        }
      }

      setAuditLogs([
        {
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString(),
          user: 'Admin',
          action: editingCategory ? 'Category Edited' : 'Category Created',
          module: 'Categories',
          detail: `${editingCategory ? 'Modified' : 'Added'} category: ${name}`
        },
        ...auditLogs
      ]);

      setModalOpen(false);
    } catch (err) {
      const errMsg = err.message || 'Failed to save category in API';
      addToast(errMsg, 'danger');
      showSnackbar(errMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const toDelete = categories.find(c => c.id === id);
    setCategories(categories.filter(c => c.id !== id && c.parent !== toDelete?.name));

    try {
      if (id && !id.startsWith('cat-') && !id.startsWith('sub-')) {
        if (toDelete?.isSubcategory) {
          const res = await deleteData(`admin/subcategories/${id}`);
          if (res?.success || res?.statusCode === 200) {
            showSnackbar('Subcategory deleted successfully', 'success');
          }
        } else {
          const res = await deleteData(`admin/categories/${id}`);
          if (res?.success || res?.statusCode === 200) {
            showSnackbar('Category deleted successfully', 'success');
          }
        }
      }
    } catch {
      // Quiet fallback
    }

    addToast('Category removed successfully', 'warning');

    setAuditLogs([
      {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        user: 'Admin',
        action: 'Category Deleted',
        module: 'Categories',
        detail: `Deleted category: ${toDelete?.name}`
      },
      ...auditLogs
    ]);
  };

  // Drag & Drop handlers for reordering
  const handleDragStart = (e, id) => {
    setDraggingId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggingId(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e, targetId, type, parentName = null) => {
    e.preventDefault();
    if (!draggingId || draggingId === targetId) return;

    const draggingItem = categories.find(c => c.id === draggingId);
    const targetItem = categories.find(c => c.id === targetId);

    if (!draggingItem || !targetItem) return;

    // Ensure dragging is kept within same depth level and parent boundaries
    if (type === 'root' && (draggingItem.parent || targetItem.parent)) return;
    if (type === 'sub' && (draggingItem.parent !== parentName || targetItem.parent !== parentName)) return;

    if (type === 'root') {
      const currentRoots = categories.filter(c => !c.parent);
      const dragIdx = currentRoots.findIndex(c => c.id === draggingId);
      const targIdx = currentRoots.findIndex(c => c.id === targetId);
      if (dragIdx === -1 || targIdx === -1) return;

      const newRoots = [...currentRoots];
      newRoots.splice(dragIdx, 1);
      const newTargIdx = newRoots.findIndex(c => c.id === targetId);
      newRoots.splice(newTargIdx, 0, draggingItem);

      const reorderedRoots = newRoots.map((cat, idx) => ({
        ...cat,
        displayOrder: idx + 1
      }));

      // Merge back into categories
      const nonRoots = categories.filter(c => c.parent);
      const updatedAll = [...reorderedRoots, ...nonRoots];
      setCategories(updatedAll);
      addToast(`Root category order updated (Index: ${newTargIdx + 1})`, 'success');
      showSnackbar(`Category '${draggingItem.name}' reordered to position #${newTargIdx + 1}`, 'success');

      // Persist display orders to API for all affected root categories
      reorderedRoots.forEach(async (cat) => {
        if (cat.id && !cat.id.startsWith('cat-')) {
          try {
            await putData(`admin/categories/${cat.id}`, {
              name: cat.name,
              description: cat.description || '',
              icon: cat.icon || '',
              image_url: cat.icon || '',
              displayOrder: Number(cat.displayOrder),
              status: cat.status === 'Active' ? 'Active' : 'Inactive'
            });
          } catch (err) {
            console.warn(`Could not persist reorder for category ${cat.name}:`, err);
          }
        }
      });
    } else {
      // Subcategory reorder under parent
      const currentSubs = categories.filter(c => c.parent === parentName);
      const dragIdx = currentSubs.findIndex(c => c.id === draggingId);
      const targIdx = currentSubs.findIndex(c => c.id === targetId);
      if (dragIdx === -1 || targIdx === -1) return;

      const newSubs = [...currentSubs];
      newSubs.splice(dragIdx, 1);
      const newTargIdx = newSubs.findIndex(c => c.id === targetId);
      newSubs.splice(newTargIdx, 0, draggingItem);

      const reorderedSubs = newSubs.map((sub, idx) => ({
        ...sub,
        displayOrder: idx + 1
      }));

      const otherCategories = categories.filter(c => c.parent !== parentName);
      const updatedAll = [...otherCategories, ...reorderedSubs];
      setCategories(updatedAll);
      addToast(`Subcategory order updated (Index: ${newTargIdx + 1})`, 'success');
      showSnackbar(`Subcategory '${draggingItem.name}' reordered to position #${newTargIdx + 1}`, 'success');

      // Persist display orders to API for all affected subcategories
      reorderedSubs.forEach(async (sub) => {
        if (sub.id && !sub.id.startsWith('sub-')) {
          try {
            const parentCatObj = categories.find(c => c.name === sub.parent || c.id === sub.category_id || c._id === sub.category_id);
            let pId = parentCatObj ? (parentCatObj.id || parentCatObj._id) : sub.category_id;
            if (!pId || pId.startsWith('cat-')) {
              const realCat = categories.find(c => !c.parent && c.id && !c.id.startsWith('cat-') && c.id.length === 24);
              if (realCat) pId = realCat.id;
            }

            const validSubImg = isValidUrl(sub.icon) ? sub.icon : DEFAULT_VALID_IMAGE;

            await putData(`admin/subcategories/${sub.id}`, {
              name: sub.name,
              category_id: pId,
              categoryId: pId,
              description: sub.description || '',
              image: validSubImg,
              image_url: validSubImg,
              displayOrder: Number(sub.displayOrder),
              status: sub.status === 'Active' ? 'Active' : 'Inactive'
            });
          } catch (err) {
            console.warn(`Could not persist reorder for subcategory ${sub.name}:`, err);
          }
        }
      });
    }

    setAuditLogs([
      {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        user: 'Admin',
        action: 'Category Hierarchy Reordered',
        module: 'Categories',
        detail: `Moved category '${draggingItem.name}' via drag & drop`
      },
      ...auditLogs
    ]);
  };

  // Get root-level categories
  const roots = categories.filter(c => !c.parent);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '700', letterSpacing: '-0.02em', margin: 0 }}>Category Hierarchy</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Manage department grouping, parent trees, and visual index display.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <ViewToggle currentView={viewMode} onViewChange={handleViewChange} />
          <Button variant="primary" size="sm" icon={FolderPlus} onClick={() => openModal(null)}>
            Add Category
          </Button>
        </div>
      </div>

      {/* Search & Status Filter Toolbar */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'space-between' }}>
        <div style={{
          display: 'flex', gap: '6px',
          backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)',
          borderRadius: '12px', padding: '5px', width: 'fit-content'
        }}>
          {[
            { id: 'all', label: `All (${roots.length})` },
            { id: 'active', label: `Active (${roots.filter(c => c.status === 'Active').length})` },
            { id: 'inactive', label: `Inactive (${roots.filter(c => c.status !== 'Active').length})` }
          ].map(t => (
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

        {/* Live Search Input */}
        <div style={{ position: 'relative', minWidth: '260px', flex: '0 1 320px' }}>
          <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search categories live..."
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

      {/* Categories Switcher with Loader */}
      {isFetchingCats ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '24px 0' }}>
          {viewMode === 'grid' ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <div key={i} className="skeleton" style={{ height: '240px', borderRadius: '12px' }} />
              ))}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="skeleton" style={{ height: '72px', borderRadius: '12px' }} />
              ))}
            </div>
          )}
        </div>
      ) : viewMode === 'list' ? (
        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-sm)',
            padding: '24px'
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {roots.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>No categories registered. Click Add Category to start.</div>
            ) : (
              roots.map((root) => {
                // Find children subcategories
                const subcats = categories.filter(c => c.parent === root.name);

                return (
                  <div
                    key={root.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, root.id)}
                    onDragEnd={handleDragEnd}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, root.id, 'root')}
                    style={{
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: draggingId === root.id ? 'var(--bg-card-alt)' : 'var(--bg-app)',
                      padding: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                      opacity: draggingId === root.id ? 0.6 : 1,
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {/* Root Category Row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <GripVertical size={16} style={{ color: 'var(--text-muted)', cursor: 'grab' }} />
                        {root.icon ? (
                          <img
                            src={root.icon}
                            alt={root.name}
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = '/logo.png';
                              e.currentTarget.style.opacity = '0.35';
                              e.currentTarget.style.objectFit = 'contain';
                            }}
                            style={{ width: '36px', height: '36px', borderRadius: '8px', objectFit: 'cover', border: '1px solid var(--border-color)' }}
                          />
                        ) : (
                          <Folder size={18} style={{ color: 'var(--primary)' }} />
                        )}
                        <div>
                          <span style={{ fontWeight: '700', fontSize: '15px' }}>{root.name}</span>
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginLeft: '12px' }}>
                            Display order: {root.displayOrder}
                          </span>
                        </div>
                        <Badge variant={root.status === 'Active' ? 'success' : 'secondary'}>{root.status}</Badge>
                      </div>

                      <div style={{ display: 'flex', gap: '4px' }}>
                        <Button variant="ghost" size="sm" onClick={() => openModal(root)} style={{ padding: '4px' }}>
                          <Edit size={14} />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(root.id)} style={{ padding: '4px', color: 'var(--danger)' }}>
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>

                    {/* Render Subcategories list */}
                    {subcats.length > 0 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingLeft: '28px', borderLeft: '2px dashed var(--border-color)' }}>
                        {subcats.map((sub) => (
                          <div
                            key={sub.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, sub.id)}
                            onDragEnd={handleDragEnd}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, sub.id, 'sub', root.name)}
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              backgroundColor: draggingId === sub.id ? 'var(--bg-card-alt)' : 'var(--bg-card)',
                              border: '1px solid var(--border-color)',
                              padding: '10px 12px',
                              borderRadius: '8px',
                              opacity: draggingId === sub.id ? 0.6 : 1,
                              transition: 'all 0.2s ease'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <GripVertical size={14} style={{ color: 'var(--text-muted)', cursor: 'grab' }} />
                              {sub.icon ? (
                                <img
                                  src={sub.icon}
                                  alt={sub.name}
                                  onError={(e) => {
                                    e.currentTarget.onerror = null;
                                    e.currentTarget.src = '/logo.png';
                                    e.currentTarget.style.opacity = '0.35';
                                    e.currentTarget.style.objectFit = 'contain';
                                  }}
                                  style={{ width: '28px', height: '28px', borderRadius: '6px', objectFit: 'cover', border: '1px solid var(--border-color)' }}
                                />
                              ) : (
                                <Folder size={14} style={{ color: 'var(--accent)' }} />
                              )}
                              <span style={{ fontSize: '13px', fontWeight: '500' }}>{sub.name}</span>
                              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Order: {sub.displayOrder}</span>
                              <Badge variant={sub.status === 'Active' ? 'success' : 'secondary'} style={{ fontSize: '9px', padding: '2px 6px' }}>{sub.status}</Badge>
                            </div>

                            <div style={{ display: 'flex', gap: '2px' }}>
                              <Button variant="ghost" size="sm" onClick={() => openModal(sub)} style={{ padding: '4px' }}>
                                <Edit size={12} />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDelete(sub.id)} style={{ padding: '4px', color: 'var(--danger)' }}>
                                <Trash2 size={12} />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {subcats.length === 0 && (
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', paddingLeft: '28px' }}>
                        No subcategories mapped under this block.
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {selectedParentCategory && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '4px' }}>
              <Button variant="outline" size="sm" onClick={() => setSelectedParentCategory(null)}>
                <ChevronLeft size={16} /> Back to Categories
              </Button>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)' }}>
                Subcategories of {selectedParentCategory.name}
              </h3>
            </div>
          )}
          <GridView
            data={selectedParentCategory
              ? categories.filter(c => c.parent === selectedParentCategory.name || c.category_id === selectedParentCategory.id)
              : roots}
            idKey="id"
            imageKey="icon"
            titleKey="name"
            subtitleKey={item => item.parent ? `Subcategory of ${item.parent}` : 'Root Department'}
            statusKey="status"
            onEdit={openModal}
            onDelete={item => handleDelete(item.id)}
            onCardClick={item => {
              if (!item.parent && !item.isSubcategory) {
                setSelectedParentCategory(item);
              }
            }}
            initialRowsPerPage={100}
          />
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginTop: '24px' }}>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage <= 1 || isFetchingCats}
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
            disabled={currentPage >= totalPages || isFetchingCats}
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
          >
            Next <ChevronRight size={16} style={{ marginLeft: '4px' }} />
          </Button>
        </div>
      )}


      {/* Edit/Create Category dialog */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingCategory ? 'Modify Category Settings' : 'Create Category Item'}
        footer={
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button variant="outline" size="sm" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary" size="sm" loading={loading} onClick={handleSaveSubmit}>Save changes</Button>
          </div>
        }
      >
        <form style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Input
            label="Category Name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setNameError('');
            }}
            placeholder="e.g. Baking Supplies"
            error={nameError}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Select
              label="Parent Category (Optional)"
              value={parent}
              onChange={(e) => setParent(e.target.value)}
              options={['', ...categories.filter(c => !c.parent).map(c => c.name)]}
            />
            <Input label="Display Index" type="number" value={displayOrder} onChange={(e) => setDisplayOrder(e.target.value)} />
          </div>

          <Textarea label="Short Description" value={description} onChange={(e) => setDescription(e.target.value)} />

          {/* Image Choice: URL vs File Upload */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>Category Image</label>
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
                  Image URL
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
                placeholder="https://images.unsplash.com/... or image link"
                value={icon}
                onChange={(e) => {
                  setIcon(e.target.value);
                  setImageFile(null);
                }}
              />
            ) : (
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    const file = e.target.files[0];
                    setImageFile(file);
                    setIcon(URL.createObjectURL(file));
                  }
                }}
              />
            )}

            {icon && (
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 14px', borderRadius: '10px',
                backgroundColor: 'var(--bg-app)', border: '1px solid var(--border-color)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <img
                    src={icon}
                    alt="Category preview"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }}
                  />
                  <span style={{ fontSize: '12px', fontWeight: '500', color: 'var(--text-primary)' }}>
                    Image Preview
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => { setIcon(''); setImageFile(null); }}
                  style={{ border: 'none', background: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: '12px' }}
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          <Select
            label="Visibility Status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            options={['Active', 'Inactive']}
          />
        </form>
      </Modal>

    </div>
  );
};
export default Categories;
