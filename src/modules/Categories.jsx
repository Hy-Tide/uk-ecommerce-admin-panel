import { useState } from 'react';
import { Folder, FolderPlus, Trash2, Edit, GripVertical } from 'lucide-react';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Input, { Select, Textarea } from '../components/Input';
import Badge from '../components/Badge';
import Uploader from '../components/Uploader';

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
  
  // Form fields
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');
  const [parent, setParent] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('');
  const [displayOrder, setDisplayOrder] = useState(1);
  const [status, setStatus] = useState('Active');

  const openModal = (cat = null) => {
    setEditingCategory(cat);
    setNameError('');
    if (cat) {
      setName(cat.name);
      setParent(cat.parent || '');
      setDescription(cat.description || '');
      setIcon(cat.icon || '');
      setDisplayOrder(cat.displayOrder || 1);
      setStatus(cat.status || 'Active');
    } else {
      setName('');
      setParent('');
      setDescription('');
      setIcon('https://images.unsplash.com/photo-1610348725531-843dff163e2c?auto=format&fit=crop&q=80&w=100');
      setDisplayOrder(categories.length + 1);
      setStatus('Active');
    }
    setModalOpen(true);
  };

  const handleSaveSubmit = (e) => {
    e.preventDefault();
    setNameError('');
    if (!name) {
      setNameError('Category name is compulsory.');
      addToast('Category name is required', 'danger');
      return;
    }

    const payload = {
      id: editingCategory ? editingCategory.id : `cat-${Date.now()}`,
      name: name,
      parent: parent === '' ? null : parent,
      description: description,
      icon: icon,
      displayOrder: Number(displayOrder),
      status: status
    };

    if (editingCategory) {
      setCategories(categories.map(c => c.id === editingCategory.id ? payload : c));
      addToast('Category updated successfully', 'success');
    } else {
      setCategories([...categories, payload]);
      addToast('Category created successfully', 'success');
    }

    setAuditLogs([
      {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        user: 'Director David',
        action: editingCategory ? 'Category Edited' : 'Category Created',
        module: 'Categories',
        detail: `${editingCategory ? 'Modified' : 'Added'} category: ${payload.name}`
      },
      ...auditLogs
    ]);

    setModalOpen(false);
  };

  const handleDelete = (id) => {
    const toDelete = categories.find(c => c.id === id);
    setCategories(categories.filter(c => c.id !== id && c.parent !== toDelete.name));
    addToast('Category and its subcategories removed', 'warning');
    
    setAuditLogs([
      {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        user: 'Director David',
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
        user: 'Director David',
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
        <Button variant="primary" size="sm" icon={FolderPlus} onClick={() => openModal(null)}>
          Add Category
        </Button>
      </div>

      {/* Categories Visual List Sheet */}
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

      {/* Edit/Create Category dialog */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingCategory ? 'Modify Category Settings' : 'Create Category Item'}
        footer={
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button variant="outline" size="sm" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={handleSaveSubmit}>Save changes</Button>
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
          
          <Uploader
            key={editingCategory ? `edit-${editingCategory.id}-${icon}` : `new-${icon}`}
            label="Category Image / Icon"
            initialImages={icon && (icon.startsWith('http') || icon.startsWith('/')) ? [icon] : []}
            onFilesChanged={(urls) => {
              if (urls && urls.length > 0) {
                setIcon(urls[0]);
              } else {
                setIcon('');
              }
            }}
            maxFiles={1}
          />

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
