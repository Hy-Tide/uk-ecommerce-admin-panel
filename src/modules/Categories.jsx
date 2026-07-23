import { useState, useEffect } from 'react';
import { Folder, FolderPlus, Trash2, Edit, GripVertical, Search } from 'lucide-react';
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

  // Live Fetch from GET /admin/categories & GET /admin/subcategories
  useEffect(() => {
    const fetchLiveCategories = async () => {
      try {
        const queryParams = { limit: 100 };
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
          icon: c.image_url || c.icon || 'https://images.unsplash.com/photo-1610348725531-843dff163e2c?auto=format&fit=crop&q=80&w=100',
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
            icon: s.image_url || s.icon || 'https://images.unsplash.com/photo-1610348725531-843dff163e2c?auto=format&fit=crop&q=80&w=100',
            displayOrder: s.displayOrder || idx + 1,
            status: s.status ? (s.status.toLowerCase() === 'active' ? 'Active' : 'Inactive') : 'Active',
            isSubcategory: true
          };
        }) : [];

        setCategories([...formattedCategories, ...formattedSubCategories]);
      } catch (err) {
        console.warn('Using fallback categories matrix:', err);
      }
    };

    fetchLiveCategories();
  }, [searchTerm, filterStatus]);

  const handleSaveSubmit = async (e) => {
    e.preventDefault();
    setNameError('');
    if (!name) {
      setNameError('Category name is compulsory.');
      addToast('Category name is required', 'danger');
      return;
    }

    setLoading(true);

    try {
      if (editingCategory) {
        // Edit flow
        const isSub = editingCategory.isSubcategory || !!editingCategory.parent;
        let updatedCat = {
          id: editingCategory.id,
          name, parent: parent === '' ? null : parent,
          description, icon, displayOrder: Number(displayOrder), status
        };

        if (editingCategory.id && !editingCategory.id.startsWith('cat-') && !editingCategory.id.startsWith('sub-')) {
          if (isSub) {
            const parentCatObj = categories.find(c => c.name === parent);
            const subPayload = {
              name,
              category_id: parentCatObj ? (parentCatObj.id || parentCatObj._id) : editingCategory.category_id,
              image_url: icon,
              status: status.toLowerCase() === 'active' ? 'active' : 'inactive'
            };
            await putData(`admin/subcategories/${editingCategory.id}`, subPayload);
          } else {
            const formData = new FormData();
            formData.append('name', name);
            formData.append('description', description || '');
            if (icon && !imageFile) formData.append('image_url', icon);
            formData.append('is_active', status.toLowerCase() === 'active');
            formData.append('status', status.toLowerCase() === 'active' ? 'Active' : 'Inactive');
            formData.append('displayOrder', displayOrder);
            if (imageFile) {
              formData.append('image', imageFile);
            }
            await putData(`admin/categories/${editingCategory.id}`, formData);
          }
        }

        setCategories(categories.map(c => c.id === editingCategory.id ? updatedCat : c));
        addToast('Category updated successfully', 'success');
        showSnackbar('Category updated successfully!', 'success');
      } else {
        // Create flow: Check if parent is selected (Subcategory) or not (Root Category)
        if (parent && parent !== '') {
          // POST /admin/subcategories
          const parentCatObj = categories.find(c => c.name === parent);
          const parentId = parentCatObj ? (parentCatObj.id || parentCatObj._id) : '';

          const subPayload = {
            name,
            category_id: parentId,
            image_url: icon,
            status: status.toLowerCase() === 'active' ? 'active' : 'inactive'
          };

          const res = await postData('admin/subcategories', subPayload);
          const sData = res?.data?.subCategory || res?.data || {};

          const newSubObj = {
            id: sData._id || sData.id || `sub-${Date.now()}`,
            name: sData.name || name,
            parent: parent,
            category_id: parentId,
            description: description || '',
            icon: sData.image_url || icon,
            displayOrder: Number(displayOrder),
            status: sData.status ? (sData.status.toLowerCase() === 'active' ? 'Active' : 'Inactive') : status,
            isSubcategory: true
          };

          setCategories([...categories, newSubObj]);
          addToast('Subcategory created successfully', 'success');
          showSnackbar('Subcategory created successfully!', 'success');
        } else {
          // POST /admin/categories
          const formData = new FormData();
          formData.append('name', name);
          formData.append('description', description || '');
          if (icon && !imageFile) formData.append('image_url', icon);
          formData.append('is_active', status.toLowerCase() === 'active');
          formData.append('status', status.toLowerCase() === 'active' ? 'Active' : 'Inactive');
          formData.append('displayOrder', displayOrder);
          if (imageFile) {
            formData.append('image', imageFile);
          }

          const res = await postData('admin/categories', formData);
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
          user: 'Mugesh',
          action: editingCategory ? 'Category Edited' : 'Category Created',
          module: 'Categories',
          detail: `${editingCategory ? 'Modified' : 'Added'} category: ${name}`
        },
        ...auditLogs
      ]);
    } catch (err) {
      const fallbackCat = {
        id: editingCategory ? editingCategory.id : `cat-${Date.now()}`,
        name, parent: parent === '' ? null : parent,
        description, icon, displayOrder: Number(displayOrder), status
      };
      if (editingCategory) {
        setCategories(categories.map(c => c.id === editingCategory.id ? fallbackCat : c));
      } else {
        setCategories([...categories, fallbackCat]);
      }
      addToast('Category saved locally', 'info');
    } finally {
      setLoading(false);
      setModalOpen(false);
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
        user: 'Mugesh',
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

  const handleDrop = (e, targetId, type, parentName = null) => {
    e.preventDefault();
    if (!draggingId || draggingId === targetId) return;

    const draggingIdx = categories.findIndex(c => c.id === draggingId);
    const targetIdx = categories.findIndex(c => c.id === targetId);

    if (draggingIdx === -1 || targetIdx === -1) return;

    const draggingItem = categories[draggingIdx];
    const targetItem = categories[targetIdx];

    // Ensure dragging is kept within same depth level and parent boundaries
    if (type === 'root' && (draggingItem.parent || targetItem.parent)) return;
    if (type === 'sub' && (draggingItem.parent !== parentName || targetItem.parent !== parentName)) return;

    const reordered = [...categories];
    reordered.splice(draggingIdx, 1);
    const newTargetIdx = reordered.findIndex(c => c.id === targetId);
    reordered.splice(newTargetIdx, 0, draggingItem);

    // Update display orders
    const updated = reordered.map((cat, idx) => ({
      ...cat,
      displayOrder: idx + 1
    }));

    setCategories(updated);
    addToast('Hierarchy order updated', 'success');

    setAuditLogs([
      {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        user: 'Mugesh',
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
            { id: 'all', label: `All (${categories.length})` },
            { id: 'active', label: `Active (${categories.filter(c => c.status === 'Active').length})` },
            { id: 'inactive', label: `Inactive (${categories.filter(c => c.status !== 'Active').length})` }
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

      {/* Categories Switcher */}
      {viewMode === 'list' ? (
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
                        {root.icon && (root.icon.startsWith('http') || root.icon.startsWith('/')) ? (
                          <img src={root.icon} alt={root.name} style={{ width: '32px', height: '32px', borderRadius: '6px', objectFit: 'cover' }} />
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
                              {sub.icon && (sub.icon.startsWith('http') || sub.icon.startsWith('/')) ? (
                                <img src={sub.icon} alt={sub.name} style={{ width: '24px', height: '24px', borderRadius: '4px', objectFit: 'cover' }} />
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
        <GridView
          data={categories}
          idKey="id"
          imageKey="icon"
          titleKey="name"
          subtitleKey={item => item.parent ? `Subcategory of ${item.parent}` : 'Root Department'}
          statusKey="status"
          onEdit={openModal}
          onDelete={item => handleDelete(item.id)}
          initialRowsPerPage={8}
        />
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

          {/* Direct Image URL Input with Live Preview */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <Input
              label="Image URL"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              placeholder="https://images.unsplash.com/... or https://..."
            />
            <Input
              label="Upload Image File"
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setImageFile(e.target.files[0]);
                  // Automatically generate a preview URL for the selected file
                  setIcon(URL.createObjectURL(e.target.files[0]));
                }
              }}
            />
            {icon && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '10px 14px', borderRadius: '10px',
                backgroundColor: 'var(--bg-app)', border: '1px solid var(--border-color)'
              }}>
                <img
                  src={icon}
                  alt="Category preview"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }}
                />
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  Live Image Preview
                </span>
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
