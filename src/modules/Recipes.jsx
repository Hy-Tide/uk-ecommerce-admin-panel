import React, { useState } from 'react';
import { ChefHat, Link2, Plus, Save, Trash2 } from 'lucide-react';
import Button from '../components/Button';
import Drawer from '../components/Drawer';
import Input, { Textarea } from '../components/Input';
import Table from '../components/Table';
import Badge from '../components/Badge';

export const Recipes = ({
  recipes = [],
  setRecipes,
  products = [],
  addToast,
  auditLogs = [],
  setAuditLogs
}) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeRecipe, setActiveRecipe] = useState(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [cookingTime, setCookingTime] = useState('');
  const [nutrition, setNutrition] = useState('');
  const [ingredientsText, setIngredientsText] = useState('');
  const [stepsText, setStepsText] = useState('');
  const [image, setImage] = useState('');
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDesc, setSeoDesc] = useState('');
  const [linkedProds, setLinkedProds] = useState([]); // List of product IDs

  const openDrawer = (rec = null) => {
    setActiveRecipe(rec);
    if (rec) {
      setTitle(rec.title);
      setCookingTime(rec.cookingTime || '');
      setNutrition(rec.nutrition || '');
      setIngredientsText(rec.ingredientsText || '');
      setStepsText(rec.stepsText || '');
      setImage(rec.image || '');
      setSeoTitle(rec.seoTitle || '');
      setSeoDesc(rec.seoDescription || '');
      setLinkedProds(rec.linkedProducts || []);
    } else {
      setTitle('');
      setCookingTime('20 mins');
      setNutrition('Calories: 150 kcal');
      setIngredientsText('');
      setStepsText('');
      setImage('https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&q=80&w=300');
      setSeoTitle('');
      setSeoDesc('');
      setLinkedProds([]);
    }
    setDrawerOpen(true);
  };

  const handleSaveRecipe = (e) => {
    e.preventDefault();
    if (!title) {
      addToast('Recipe title is required', 'danger');
      return;
    }

    const payload = {
      id: activeRecipe ? activeRecipe.id : `rec-${Date.now()}`,
      title,
      cookingTime,
      nutrition,
      ingredientsText,
      stepsText,
      image,
      seoTitle: seoTitle || title,
      seoDescription: seoDesc,
      linkedProducts: linkedProds
    };

    if (activeRecipe) {
      setRecipes(recipes.map(r => r.id === activeRecipe.id ? payload : r));
      addToast('Recipe updated successfully', 'success');
    } else {
      setRecipes([payload, ...recipes]);
      addToast('Recipe created successfully', 'success');
    }

    setAuditLogs([
      {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        user: 'Director David',
        action: activeRecipe ? 'Recipe Edited' : 'Recipe Created',
        module: 'Recipes',
        detail: `${activeRecipe ? 'Updated' : 'Created'} grocery recipe: ${payload.title}`
      },
      ...auditLogs
    ]);

    setDrawerOpen(false);
  };

  const handleDelete = (id) => {
    const deleted = recipes.find(r => r.id === id);
    setRecipes(recipes.filter(r => r.id !== id));
    addToast('Recipe removed', 'warning');
    
    setAuditLogs([
      {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        user: 'Director David',
        action: 'Recipe Deleted',
        module: 'Recipes',
        detail: `Deleted recipe: ${deleted?.title}`
      },
      ...auditLogs
    ]);
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
          <img src={row.image} alt={row.title} style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '8px' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{row.title}</span>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Cook Time: {row.cookingTime} | Nutrition: {row.nutrition}</span>
          </div>
        </div>
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
          <Button variant="ghost" size="sm" onClick={() => handleDelete(row.id)} style={{ padding: '6px', color: 'var(--danger)' }}><Trash2 size={14} /></Button>
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
        <Button variant="primary" size="sm" icon={ChefHat} onClick={() => openDrawer(null)}>
          Add Recipe
        </Button>
      </div>

      <Card title="Published Recipe Catalog">
        <div style={{ marginTop: '12px' }}>
          <Table
            columns={columns}
            data={recipes}
            initialRowsPerPage={5}
          />
        </div>
      </Card>

      {/* Editor slide Drawer */}
      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={activeRecipe ? 'Modify Recipe Settings' : 'Create Store Recipe'}
        size="xl"
        footer={
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button variant="outline" size="sm" onClick={() => setDrawerOpen(false)}>Cancel</Button>
            <Button variant="primary" size="sm" icon={Save} onClick={handleSaveRecipe}>Save Recipe</Button>
          </div>
        }
      >
        <form style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Input label="Recipe Title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Avocado Toast with Poached Egg" />
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Input label="Cooking Time" value={cookingTime} onChange={(e) => setCookingTime(e.target.value)} placeholder="e.g. 15 mins" />
            <Input label="Nutrition summary" value={nutrition} onChange={(e) => setNutrition(e.target.value)} placeholder="e.g. 240 kcal" />
          </div>

          <Input label="Featured Image URL" value={image} onChange={(e) => setImage(e.target.value)} />

          <Textarea label="Ingredients Checklist (One per line)" rows={6} value={ingredientsText} onChange={(e) => setIngredientsText(e.target.value)} placeholder="e.g. 2 ripe Hass avocados\n1 slice sourdough bread" />
          <Textarea label="Preparation Steps (One per line)" rows={6} value={stepsText} onChange={(e) => setStepsText(e.target.value)} placeholder="e.g. 1. Slice avocados in half\n2. Toast sourdough slice" />

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
                  key={p.id}
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
                    checked={linkedProds.includes(p.id)}
                    onChange={() => toggleProductLink(p.id)}
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
