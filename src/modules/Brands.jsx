import { useState } from 'react';
import { ExternalLink, Globe, Plus, Settings, Star, Trash2 } from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';
import Modal from '../components/Modal';
import Input, { Select, Switch, Textarea } from '../components/Input';
import Badge from '../components/Badge';

export const Brands = ({
  brands = [],
  setBrands,
  addToast,
  auditLogs = [],
  setAuditLogs
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);

  // Form Fields
  const [name, setName] = useState('');
  const [logo, setLogo] = useState('');
  const [description, setDescription] = useState('');
  const [website, setWebsite] = useState('');
  const [featured, setFeatured] = useState(false);
  const [status, setStatus] = useState('Active');

  const openModal = (brand = null) => {
    setEditingBrand(brand);
    if (brand) {
      setName(brand.name);
      setLogo(brand.logo || '');
      setDescription(brand.description || '');
      setWebsite(brand.website || '');
      setFeatured(brand.featured || false);
      setStatus(brand.status || 'Active');
    } else {
      setName('');
      setLogo('https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=100');
      setDescription('');
      setWebsite('');
      setFeatured(false);
      setStatus('Active');
    }
    setModalOpen(true);
  };

  const handleSaveSubmit = (e) => {
    e.preventDefault();
    if (!name) {
      addToast('Brand name is required', 'danger');
      return;
    }

    const payload = {
      id: editingBrand ? editingBrand.id : `br-${Date.now()}`,
      name: name,
      logo: logo,
      description: description,
      website: website,
      featured: featured,
      status: status
    };

    if (editingBrand) {
      setBrands(brands.map(b => b.id === editingBrand.id ? payload : b));
      addToast('Brand updated successfully', 'success');
    } else {
      setBrands([...brands, payload]);
      addToast('Brand created successfully', 'success');
    }

    setAuditLogs([
      {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        user: 'Director David',
        action: editingBrand ? 'Brand Settings Edited' : 'Brand Added',
        module: 'Brands',
        detail: `${editingBrand ? 'Updated' : 'Created'} brand listing: ${payload.name}`
      },
      ...auditLogs
    ]);

    setModalOpen(false);
  };

  const handleDelete = (id) => {
    const deleted = brands.find(b => b.id === id);
    setBrands(brands.filter(b => b.id !== id));
    addToast('Brand deleted', 'warning');
    
    setAuditLogs([
      {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        user: 'Director David',
        action: 'Brand Deleted',
        module: 'Brands',
        detail: `Removed brand: ${deleted?.name}`
      },
      ...auditLogs
    ]);
  };

  const toggleFeaturedState = (id) => {
    setBrands(brands.map(b => {
      if (b.id === id) {
        const nextState = !b.featured;
        addToast(`${b.name} featured state toggled`, 'info');
        return { ...b, featured: nextState };
      }
      return b;
    }));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '700', letterSpacing: '-0.02em', margin: 0 }}>Partner Brands</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Modify store brand tags, descriptions, logos, and features status.</p>
        </div>
        <Button variant="primary" size="sm" icon={Plus} onClick={() => openModal(null)}>
          Add Brand
        </Button>
      </div>

      {/* Grid listing */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
        {brands.map((brand) => (
          <Card
            key={brand.id}
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <img src={brand.logo} alt={brand.name} style={{ width: '32px', height: '32px', borderRadius: '6px', objectFit: 'cover' }} />
                <span style={{ fontWeight: '700' }}>{brand.name}</span>
              </div>
            }
            actions={
              <div style={{ display: 'flex', gap: '4px' }}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleFeaturedState(brand.id)}
                  style={{ padding: '4px', color: brand.featured ? 'var(--accent)' : 'var(--text-muted)' }}
                  title="Toggle Featured"
                >
                  <Star size={14} fill={brand.featured ? 'var(--accent)' : 'none'} />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => openModal(brand)} style={{ padding: '4px' }}>
                  <Settings size={14} />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(brand.id)} style={{ padding: '4px', color: 'var(--danger)' }}>
                  <Trash2 size={14} />
                </Button>
              </div>
            }
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', height: '100%', justifyContent: 'space-between' }}>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', minHeight: '40px' }}>
                {brand.description}
              </p>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '10px', marginTop: '8px' }}>
                <Badge variant={brand.status === 'Active' ? 'success' : 'secondary'}>{brand.status}</Badge>
                
                {brand.website && (
                  <a
                    href={brand.website}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '12px',
                      color: 'var(--primary)',
                      textDecoration: 'none',
                      fontWeight: '500'
                    }}
                  >
                    <Globe size={12} /> Website <ExternalLink size={10} />
                  </a>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Edit/Create Brand dialog modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingBrand ? 'Configure Brand details' : 'Add Partner Brand'}
        footer={
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button variant="outline" size="sm" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={handleSaveSubmit}>Save changes</Button>
          </div>
        }
      >
        <form style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Input label="Brand Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Organic Groves" />
          <Input label="Logo Image URL" value={logo} onChange={(e) => setLogo(e.target.value)} />
          <Input label="Website Address" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="e.g. https://groves.com" />
          <Textarea label="Brand Narrative/Description" value={description} onChange={(e) => setDescription(e.target.value)} />
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', alignItems: 'center', marginTop: '8px' }}>
            <Switch label="Featured Brand status" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
            <Select label="Partner Status" value={status} onChange={(e) => setStatus(e.target.value)} options={['Active', 'Inactive']} />
          </div>
        </form>
      </Modal>

    </div>
  );
};
export default Brands;
