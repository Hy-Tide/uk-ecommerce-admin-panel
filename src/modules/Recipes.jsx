import React, { useState, useEffect } from 'react';
import { ChefHat, Link2, Plus, Save, Trash2, CheckCircle, XCircle, UtensilsCrossed } from 'lucide-react';
import Button from '../components/Button';
import Drawer from '../components/Drawer';
import Modal from '../components/Modal';
import Input, { Select, Textarea } from '../components/Input';
import Table from '../components/Table';
import Badge from '../components/Badge';
import Card from '../components/Card';
import ListView from '../components/ListView';
import GridView from '../components/GridView';
import ViewToggle from '../components/ViewToggle';
import { fetchRecipes, createRecipe, updateRecipe, deleteRecipe, toggleRecipeStatus, fetchCuisines, createCuisine, updateCuisine, deleteCuisine, showSnackbar } from '../services/api';

export const Recipes = ({
  recipes: initialRecipes = [],
  setRecipes: setParentRecipes,
  products = [],
  addToast,
  auditLogs = [],
  setAuditLogs
}) => {
  const [recipes, setRecipesState] = useState(initialRecipes);
  const [cuisines, setCuisines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [cuisineModalOpen, setCuisineModalOpen] = useState(false);
  const [activeRecipe, setActiveRecipe] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreatingCuisine, setIsCreatingCuisine] = useState(false);
  const [editingCuisine, setEditingCuisine] = useState(null);
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('view-mode-recipes-v2') || 'grid';
  });

  // Cuisine Form Fields
  const [cuisineName, setCuisineName] = useState('');
  const [cuisineDesc, setCuisineDesc] = useState('');
  const [cuisineImage, setCuisineImage] = useState('');

  const updateRecipes = (newList) => {
    setRecipesState(newList);
    if (typeof setParentRecipes === 'function') {
      setParentRecipes(newList);
    }
  };

  const handleViewChange = (newView) => {
    setViewMode(newView);
    localStorage.setItem('view-mode-recipes-v2', newView);
  };

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('');
  const [cookingTime, setCookingTime] = useState('');
  const [nutrition, setNutrition] = useState('');
  const [ingredientsText, setIngredientsText] = useState('');
  const [stepsText, setStepsText] = useState('');
  const [image, setImage] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDesc, setSeoDesc] = useState('');
  const [linkedProds, setLinkedProds] = useState([]);

  // Fetch live cuisines from API
  const loadCuisines = async () => {
    try {
      const res = await fetchCuisines();
      if (res && res.success !== false) {
        const list = res.data?.cuisines || (Array.isArray(res.data) ? res.data : []);
        if (Array.isArray(list)) {
          setCuisines(list);
          if (list.length > 0 && !selectedCuisine) {
            setSelectedCuisine(list[0].name);
          }
        }
      }
    } catch (err) {
      console.error('Failed to fetch cuisines:', err);
    }
  };

  // Fetch live recipes from backend
  const loadRecipes = async (search = '', status = 'all') => {
    setLoading(true);
    try {
      const params = { limit: 50 };
      if (search.trim()) params.search = search.trim();
      if (status !== 'all') params.status = status;

      const res = await fetchRecipes(params);
      if (res && res.success !== false) {
        const list = res.data?.recipes || (Array.isArray(res.data) ? res.data : (Array.isArray(res) ? res : []));
        if (Array.isArray(list) && list.length > 0) {
          const formatted = list.map(r => normalizeRecipe(r));
          updateRecipes(formatted);
        }
      }
    } catch (err) {
      console.error('Failed to fetch recipes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecipes();
    loadCuisines();
  }, []);

  const normalizeRecipe = (r) => {
    const ingArr = Array.isArray(r.ingredients)
      ? r.ingredients
      : (typeof r.ingredientsText === 'string' ? r.ingredientsText.split('\n').filter(Boolean) : []);

    const ingText = Array.isArray(r.ingredients)
      ? r.ingredients.join('\n')
      : (r.ingredientsText || '');

    return {
      id: r._id || r.id || `rec-${Date.now()}`,
      _id: r._id || r.id,
      title: r.title || '',
      description: r.description || '',
      cuisine: r.cuisine || r.cuisineName || 'Indian Cuisine',
      image: r.image_url || r.image || 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&q=80&w=300',
      image_url: r.image_url || r.image || '',
      ingredients: ingArr,
      ingredientsText: ingText,
      instructions: r.instructions || r.stepsText || '',
      stepsText: r.instructions || r.stepsText || '',
      is_active: r.is_active !== undefined ? Boolean(r.is_active) : true,
      cookingTime: r.cookingTime || '20 mins',
      nutrition: r.nutrition || 'Calories: 150 kcal',
      seoTitle: r.seoTitle || r.title || '',
      seoDescription: r.seoDescription || r.description || '',
      linkedProducts: r.products 
        ? r.products.map(p => typeof p === 'object' && p !== null ? (p._id || p.id) : p) 
        : (r.linkedProducts || [])
    };
  };

  const [createCuisineModalOpen, setCreateCuisineModalOpen] = useState(false);
  const [editCuisineModalOpen, setEditCuisineModalOpen] = useState(false);

  const openCreateCuisineModal = () => {
    setEditingCuisine(null);
    setCuisineName('');
    setCuisineDesc('');
    setCuisineImage('');
    setCreateCuisineModalOpen(true);
  };

  const openEditCuisineModal = (c) => {
    setEditingCuisine(c);
    setCuisineName(c.name || '');
    setCuisineDesc(c.description || '');
    setCuisineImage(c.image || '');
    setEditCuisineModalOpen(true);
  };

  // Save (Create or Update) Cuisine via API
  const handleSaveCuisine = async (e) => {
    if (e) e.preventDefault();
    if (!cuisineName.trim()) {
      if (addToast) addToast('Cuisine name is required', 'danger');
      return;
    }

    setIsCreatingCuisine(true);
    const cuisinePayload = {
      name: cuisineName.trim(),
      description: cuisineDesc.trim(),
      image: cuisineImage.trim() || 'https://images.unsplash.com/photo-1585937421612-70a008356fbe',
      isActive: editingCuisine && editingCuisine.isActive !== undefined ? editingCuisine.isActive : true
    };

    const isEdit = Boolean(editingCuisine && (editingCuisine._id || editingCuisine.id));
    const targetId = editingCuisine ? (editingCuisine._id || editingCuisine.id) : null;

    try {
      let res;
      if (isEdit) {
        res = await updateCuisine(targetId, cuisinePayload);
      } else {
        res = await createCuisine(cuisinePayload);
      }

      if (res && res.success !== false) {
        const saved = res.data?.cuisine || res.data || { ...cuisinePayload, _id: targetId };
        if (isEdit) {
          setCuisines(cuisines.map(c => ((c._id || c.id) === targetId ? { ...c, ...saved } : c)));
          if (addToast) addToast('Cuisine updated successfully', 'success');
          setEditCuisineModalOpen(false);
        } else {
          setCuisines([...cuisines, saved]);
          setSelectedCuisine(saved.name);
          if (addToast) addToast('Cuisine created successfully', 'success');
          setCreateCuisineModalOpen(false);
        }
        setEditingCuisine(null);
        setCuisineName('');
        setCuisineDesc('');
        setCuisineImage('');
      } else {
        const msg = res?.error || res?.message || 'Failed to save cuisine';
        if (addToast) addToast(msg, 'danger');
      }
    } catch (err) {
      console.error('Error saving cuisine:', err);
      if (addToast) addToast(err.message || 'Error saving cuisine', 'danger');
    } finally {
      setIsCreatingCuisine(false);
    }
  };

  const handleDeleteCuisine = async (cuisineId) => {
    try {
      const res = await deleteCuisine(cuisineId);
      if (res && res.success !== false) {
        setCuisines(cuisines.filter(c => (c._id || c.id) !== cuisineId));
        if (addToast) addToast('Cuisine deleted successfully', 'warning');
      } else {
        setCuisines(cuisines.filter(c => (c._id || c.id) !== cuisineId));
        if (addToast) addToast('Cuisine removed locally', 'warning');
      }
    } catch (err) {
      console.error('Error deleting cuisine:', err);
      setCuisines(cuisines.filter(c => (c._id || c.id) !== cuisineId));
    }
  };



  const openDrawer = (rec = null) => {
    setActiveRecipe(rec);
    if (rec) {
      setTitle(rec.title || '');
      setDescription(rec.description || '');
      setSelectedCuisine(rec.cuisine || cuisines[0]?.name || 'Indian Cuisine');
      setCookingTime(rec.cookingTime || '');
      setNutrition(rec.nutrition || '');
      setIngredientsText(rec.ingredientsText || (Array.isArray(rec.ingredients) ? rec.ingredients.join('\n') : ''));
      setStepsText(rec.instructions || rec.stepsText || '');
      setImage(rec.image_url || rec.image || '');
      setIsActive(rec.is_active !== undefined ? rec.is_active : true);
      setSeoTitle(rec.seoTitle || '');
      setSeoDesc(rec.seoDescription || '');
      setLinkedProds(rec.linkedProducts || []);
    } else {
      setTitle('');
      setDescription('');
      setSelectedCuisine(cuisines[0]?.name || 'Indian Cuisine');
      setCookingTime('20 mins');
      setNutrition('Calories: 150 kcal');
      setIngredientsText('');
      setStepsText('');
      setImage('https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a');
      setIsActive(true);
      setSeoTitle('');
      setSeoDesc('');
      setLinkedProds([]);
    }
    setDrawerOpen(true);
  };

  const handleSaveRecipe = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      if (addToast) addToast('Recipe title is required', 'danger');
      return;
    }

    setIsSubmitting(true);

    const parsedIngredients = ingredientsText
      .split('\n')
      .map(item => item.trim())
      .filter(Boolean);

    const apiPayload = {
      title: title.trim(),
      description: description.trim(),
      image_url: image.trim(),
      ingredients: parsedIngredients,
      products: linkedProds,
      instructions: stepsText.trim(),
      is_active: isActive
    };

    const isEdit = Boolean(activeRecipe && (activeRecipe._id || activeRecipe.id));
    const targetId = activeRecipe ? (activeRecipe._id || activeRecipe.id) : null;

    try {
      let res;
      if (isEdit) {
        res = await updateRecipe(targetId, apiPayload);
      } else {
        res = await createRecipe(apiPayload);
      }

      if (res && res.success !== false) {
        const savedData = res.data?.recipe || res.data || res;
        const normalizedSaved = normalizeRecipe({
          ...savedData,
          cuisine: selectedCuisine,
          cookingTime,
          nutrition,
          linkedProducts: linkedProds,
          seoTitle,
          seoDescription: seoDesc
        });

        if (isEdit) {
          updateRecipes(recipes.map(r => (r.id === targetId || r._id === targetId) ? normalizedSaved : r));
          if (addToast) addToast('Recipe updated successfully', 'success');
        } else {
          updateRecipes([normalizedSaved, ...recipes]);
          if (addToast) addToast(res.message || 'Recipe created successfully', 'success');
        }

        if (setAuditLogs) {
          setAuditLogs([
            {
              id: `log-${Date.now()}`,
              timestamp: new Date().toISOString(),
              user: 'Admin',
              action: isEdit ? 'Recipe Edited' : 'Recipe Created',
              module: 'Recipes',
              detail: `${isEdit ? 'Updated' : 'Created'} recipe: ${apiPayload.title}`
            },
            ...auditLogs
          ]);
        }

        setDrawerOpen(false);
      } else {
        const msg = res?.error || res?.message || 'Failed to save recipe';
        if (addToast) addToast(msg, 'danger');
      }
    } catch (err) {
      console.error('Error saving recipe:', err);
      if (addToast) addToast(err.message || 'An unexpected error occurred', 'danger');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (rec) => {
    const targetId = typeof rec === 'object' ? (rec._id || rec.id) : rec;
    const recipeObj = typeof rec === 'object' ? rec : recipes.find(r => r.id === targetId || r._id === targetId);

    try {
      const res = await deleteRecipe(targetId);
      if (res && res.success !== false) {
        updateRecipes(recipes.filter(r => r.id !== targetId && r._id !== targetId));
        if (addToast) addToast('Recipe deleted successfully', 'warning');

        if (setAuditLogs) {
          setAuditLogs([
            {
              id: `log-${Date.now()}`,
              timestamp: new Date().toISOString(),
              user: 'Admin',
              action: 'Recipe Deleted',
              module: 'Recipes',
              detail: `Deleted recipe: ${recipeObj?.title || targetId}`
            },
            ...auditLogs
          ]);
        }
      } else {
        updateRecipes(recipes.filter(r => r.id !== targetId && r._id !== targetId));
        if (addToast) addToast('Recipe removed locally', 'warning');
      }
    } catch (err) {
      console.error('Error deleting recipe:', err);
      updateRecipes(recipes.filter(r => r.id !== targetId && r._id !== targetId));
      if (addToast) addToast('Recipe removed locally', 'warning');
    }
  };

  const handleToggleStatus = async (row) => {
    const targetId = row._id || row.id;
    const newStatus = !row.is_active;
    try {
      const res = await toggleRecipeStatus(targetId, newStatus);
      if (res && res.success !== false) {
        updateRecipes(recipes.map(r => (r.id === targetId || r._id === targetId) ? { ...r, is_active: newStatus } : r));
        if (addToast) addToast(`Recipe marked as ${newStatus ? 'Active' : 'Inactive'}`, 'info');
      } else {
        updateRecipes(recipes.map(r => (r.id === targetId || r._id === targetId) ? { ...r, is_active: newStatus } : r));
      }
    } catch (err) {
      updateRecipes(recipes.map(r => (r.id === targetId || r._id === targetId) ? { ...r, is_active: newStatus } : r));
    }
  };

  const toggleProductLink = (prodId) => {
    if (linkedProds.includes(prodId)) {
      setLinkedProds(linkedProds.filter(id => id !== prodId));
    } else {
      setLinkedProds([...linkedProds, prodId]);
    }
  };

  const columns = [
    {
      key: 'title',
      label: 'Recipe Details',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img
            src={row.image_url || row.image || '/logo.png'}
            alt={row.title}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/logo.png';
              e.target.style.opacity = '0.35';
              e.target.style.objectFit = 'contain';
            }}
            style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '8px' }}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{row.title}</span>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', maxWdith: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {row.description || (row.cookingTime ? `Cook Time: ${row.cookingTime}` : 'No description')}
            </span>
          </div>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <Badge
          variant={row.is_active ? 'success' : 'neutral'}
          onClick={() => handleToggleStatus(row)}
          style={{ cursor: 'pointer' }}
        >
          {row.is_active ? 'Active' : 'Inactive'}
        </Badge>
      )
    },
    {
      key: 'ingredientsCount',
      label: 'Ingredients',
      render: (row) => (
        <span style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: '600' }}>
          {Array.isArray(row.ingredients) ? row.ingredients.length : (row.ingredientsText ? row.ingredientsText.split('\n').length : 0)} items
        </span>
      )
    },
    {
      key: 'linkedCount',
      label: 'Linked Items',
      render: (row) => (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 'bold' }}>
          <Link2 size={14} style={{ color: 'var(--primary)' }} />
          {row.linkedProducts?.length || 0} items
        </span>
      )
    },
    {
      key: 'actions',
      label: '',
      render: (row) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button variant="outline" size="sm" onClick={() => openDrawer(row)}>Edit</Button>
          <Button variant="ghost" size="sm" onClick={() => handleDelete(row)} style={{ padding: '6px', color: 'var(--danger)' }}><Trash2 size={14} /></Button>
        </div>
      )
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '700', letterSpacing: '-0.02em', margin: 0 }}>Grocery Recipe Editor</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Create meal plan recipes and map ingredients to live store catalogue items.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Button variant="outline" size="sm" icon={UtensilsCrossed} onClick={() => setCuisineModalOpen(true)}>
            Cuisines ({cuisines.length})
          </Button>
          <ViewToggle currentView={viewMode} onViewChange={handleViewChange} />
          <Button variant="primary" size="sm" icon={ChefHat} onClick={() => openDrawer(null)}>
            Add Recipe
          </Button>
        </div>
      </div>

      <Card title="Published Recipe Catalog">
        <div style={{ marginTop: '12px' }}>
          {loading ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading recipes...</div>
          ) : viewMode === 'list' ? (
            <ListView
              columns={columns}
              data={recipes}
              initialRowsPerPage={5}
            />
          ) : (
            <GridView
              data={recipes}
              idKey="id"
              imageKey="image"
              titleKey="title"
              subtitleKey="description"
              statusKey={item => item.is_active ? 'Active' : 'Inactive'}
              onEdit={openDrawer}
              onDelete={item => handleDelete(item)}
              initialRowsPerPage={8}
            />
          )}
        </div>
      </Card>

      {/* Cuisines Directory Management List Modal */}
      <Modal
        isOpen={cuisineModalOpen}
        onClose={() => setCuisineModalOpen(false)}
        title="Cuisines Directory"
        size="md"
        footer={
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
            <Button variant="primary" size="sm" icon={Plus} onClick={openCreateCuisineModal}>
              Create New Cuisine
            </Button>
            <Button variant="outline" size="sm" onClick={() => setCuisineModalOpen(false)}>Close</Button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <span style={{ fontSize: '14px', fontWeight: '700' }}>Available Cuisines ({cuisines.length})</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '320px', overflowY: 'auto' }}>
            {cuisines.length === 0 ? (
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', padding: '16px', textAlign: 'center' }}>No cuisines loaded yet.</div>
            ) : (
              cuisines.map(c => (
                <div key={c._id || c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', border: '1px solid var(--border-color)', borderRadius: '8px', backgroundColor: 'var(--bg-card)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {c.image ? (
                      <img src={c.image} alt={c.name} style={{ width: '36px', height: '36px', objectFit: 'cover', borderRadius: '6px' }} />
                    ) : (
                      <div style={{ width: '36px', height: '36px', borderRadius: '6px', backgroundColor: 'var(--bg-app)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                        <UtensilsCrossed size={18} />
                      </div>
                    )}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>{c.name}</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)', maxWidth: '220px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {c.description || 'No description'}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Button variant="outline" size="sm" onClick={() => openEditCuisineModal(c)}>
                      Edit
                    </Button>
                    <Button variant="ghost" size="sm" style={{ padding: '6px', color: 'var(--danger)' }} onClick={() => handleDeleteCuisine(c._id || c.id)}>
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </Modal>

      {/* Dedicated Create Cuisine Modal */}
      <Modal
        isOpen={createCuisineModalOpen}
        onClose={() => setCreateCuisineModalOpen(false)}
        title="Create New Cuisine"
        footer={
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button variant="outline" size="sm" onClick={() => setCreateCuisineModalOpen(false)}>Cancel</Button>
            <Button variant="primary" size="sm" icon={Plus} onClick={handleSaveCuisine} disabled={isCreatingCuisine}>
              {isCreatingCuisine ? 'Creating...' : 'Create Cuisine'}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSaveCuisine} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Input label="Cuisine Name" value={cuisineName} onChange={(e) => setCuisineName(e.target.value)} placeholder="e.g. Indian Cuisine" required />
          <Textarea label="Description" rows={3} value={cuisineDesc} onChange={(e) => setCuisineDesc(e.target.value)} placeholder="Explore delicious Indian dishes featuring traditional flavors..." />
          <Input label="Image URL" value={cuisineImage} onChange={(e) => setCuisineImage(e.target.value)} placeholder="https://images.unsplash.com/photo-..." />
        </form>
      </Modal>

      {/* Dedicated Edit Cuisine Modal */}
      <Modal
        isOpen={editCuisineModalOpen}
        onClose={() => setEditCuisineModalOpen(false)}
        title={`Edit Cuisine — ${editingCuisine?.name || ''}`}
        footer={
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button variant="outline" size="sm" onClick={() => setEditCuisineModalOpen(false)}>Cancel</Button>
            <Button variant="primary" size="sm" icon={Save} onClick={handleSaveCuisine} disabled={isCreatingCuisine}>
              {isCreatingCuisine ? 'Saving Changes...' : 'Save Changes'}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSaveCuisine} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Input label="Cuisine Name" value={cuisineName} onChange={(e) => setCuisineName(e.target.value)} placeholder="e.g. Indian Cuisine" required />
          <Textarea label="Description" rows={3} value={cuisineDesc} onChange={(e) => setCuisineDesc(e.target.value)} placeholder="Explore delicious Indian dishes featuring traditional flavors..." />
          <Input label="Image URL" value={cuisineImage} onChange={(e) => setCuisineImage(e.target.value)} placeholder="https://images.unsplash.com/photo-..." />
        </form>
      </Modal>

      {/* Editor slide Drawer */}
      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={activeRecipe ? 'Modify Recipe Settings' : 'Create Store Recipe'}
        size="xl"
        footer={
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button variant="outline" size="sm" onClick={() => setDrawerOpen(false)}>Cancel</Button>
            <Button variant="primary" size="sm" icon={Save} onClick={handleSaveRecipe} disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Recipe'}
            </Button>
          </div>
        }
      >
        <form style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} onSubmit={handleSaveRecipe}>
          <Input label="Recipe Title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Classic Chicken Biryani" required />

          <Textarea label="Short Description" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="A flavorful and aromatic South Indian-style chicken biryani..." />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            <Select
              label="Cuisine Type"
              value={selectedCuisine}
              onChange={(e) => setSelectedCuisine(e.target.value)}
              options={
                cuisines.length > 0
                  ? cuisines.map(c => ({ value: c.name, label: c.name }))
                  : ['Indian Cuisine', 'Healthy Living', 'Asian', 'Mediterranean', 'Mexican']
              }
            />
            <Input label="Cooking Time" value={cookingTime} onChange={(e) => setCookingTime(e.target.value)} placeholder="e.g. 30 mins" />
            <Input label="Nutrition Summary" value={nutrition} onChange={(e) => setNutrition(e.target.value)} placeholder="e.g. Calories: 450 kcal" />
          </div>

          <Input label="Featured Image URL" value={image} onChange={(e) => setImage(e.target.value)} placeholder="https://images.unsplash.com/photo-..." />

          <Textarea label="Ingredients List (One per line)" rows={6} value={ingredientsText} onChange={(e) => setIngredientsText(e.target.value)} placeholder="500g Chicken&#10;2 cups Basmati Rice&#10;2 Onions, sliced&#10;2 Tomatoes, chopped" />
          <Textarea label="Instructions / Preparation Steps" rows={6} value={stepsText} onChange={(e) => setStepsText(e.target.value)} placeholder="Wash and soak the basmati rice for 30 minutes. Marinate the chicken..." />

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
            <input
              type="checkbox"
              id="is_active_toggle"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              style={{ width: '18px', height: '18px', accentColor: 'var(--primary)', cursor: 'pointer' }}
            />
            <label htmlFor="is_active_toggle" style={{ fontSize: '14px', fontWeight: '600', cursor: 'pointer', color: 'var(--text-primary)' }}>
              Active (Visible on Customer App & Storefront)
            </label>
          </div>

          {/* Linked Products selectors */}
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
            <span style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text-primary)', display: 'block', marginBottom: '8px' }}>
              Map Ingredients to Store Catalog Products
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '12px' }}>
              Checked items will display purchase links directly under the recipe on your customer storefront.
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', maxHeight: '160px', overflowY: 'auto', border: '1px solid var(--border-color)', padding: '12px', borderRadius: '8px' }}>
              {products.map(p => (
                <label
                  key={p.id || p._id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    color: 'var(--text-primary)'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={linkedProds.includes(p.id || p._id)}
                    onChange={() => toggleProductLink(p.id || p._id)}
                    style={{ accentColor: 'var(--primary)', cursor: 'pointer' }}
                  />
                  {p.name}
                </label>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
            <Input label="SEO Page Title" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} />
            <Textarea label="SEO Page Description" value={seoDesc} onChange={(e) => setSeoDesc(e.target.value)} />
          </div>
        </form>
      </Drawer>

    </div>
  );
};

export default Recipes;

