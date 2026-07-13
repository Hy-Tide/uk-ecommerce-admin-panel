import React, { useState } from 'react';
import { Eye, Layout, Plus, Save, Settings } from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';
import Input, { Textarea } from '../components/Input';

export const CMS = ({
  cmsData = {},
  setCmsData,
  addToast,
  auditLogs = [],
  setAuditLogs
}) => {
  const [heroTitle, setHeroTitle] = useState(cmsData.homepage?.heroTitle || 'Organic Grocery, Fresh Delivery');
  const [heroSubtitle, setHeroSubtitle] = useState(cmsData.homepage?.heroSubtitle || 'Handpicked organic items direct from local farms.');
  const [bannerUrl, setBannerUrl] = useState(cmsData.homepage?.bannerUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800');
  const [announcementBar, setAnnouncementBar] = useState(cmsData.homepage?.announcementBar || 'Special Deals! Code ORGANIC20 for 20% off fresh produce!');

  // Page SEO tags
  const [pageSEO, setPageSEO] = useState({
    homepage: { title: 'UK E-Commerce Organic - Home Delivery', desc: 'Order organic farm fresh groceries.' },
    faq: { title: 'FreshCart FAQs - Help & Center', desc: 'Frequently asked questions about shipping zones.' },
    contact: { title: 'FreshCart Support - Get in Touch', desc: 'Contact customer care representatives.' }
  });
  const [selectedSEOKey, setSelectedSEOKey] = useState('homepage');

  const handleSaveCMS = (e) => {
    e.preventDefault();
    const updated = {
      ...cmsData,
      homepage: {
        heroTitle,
        heroSubtitle,
        bannerUrl,
        announcementBar
      }
    };
    setCmsData(updated);
    addToast('CMS layouts successfully saved and published', 'success');

    setAuditLogs([
      {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        user: 'Mugesh',
        action: 'Homepage Layout Published',
        module: 'CMS',
        detail: 'Published homepage updates: Hero widgets & announcements'
      },
      ...auditLogs
    ]);
  };

  const handleSaveSEO = (e) => {
    e.preventDefault();
    addToast(`SEO tags updated for ${selectedSEOKey} page`, 'success');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '700', letterSpacing: '-0.02em', margin: 0 }}>Visual CMS Configurator</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Modify store front banners, header announcement logs, static FAQ blocks, and page metadata.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', alignItems: 'flex-start' }}>

        {/* Editor Settings Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          <Card title="Homepage Layout Configuration" actions={<Button variant="primary" size="sm" icon={Save} onClick={handleSaveCMS}>Publish Layout</Button>}>
            <form style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '12px' }}>
              <Input label="Header Announcement Bar" value={announcementBar} onChange={(e) => setAnnouncementBar(e.target.value)} />
              <Input label="Hero Slide title" value={heroTitle} onChange={(e) => setHeroTitle(e.target.value)} />
              <Textarea label="Hero Description Subtitle" value={heroSubtitle} onChange={(e) => setHeroSubtitle(e.target.value)} />
              <Input label="Hero Background Image URL" value={bannerUrl} onChange={(e) => setBannerUrl(e.target.value)} />
            </form>
          </Card>

          <Card title="Meta SEO Tag Templates" actions={<Button variant="outline" size="sm" onClick={handleSaveSEO}>Apply SEO</Button>}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                {Object.keys(pageSEO).map(k => (
                  <Button
                    key={k}
                    variant={selectedSEOKey === k ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedSEOKey(k)}
                    style={{ textTransform: 'capitalize' }}
                  >
                    {k}
                  </Button>
                ))}
              </div>
              <Input
                label="Meta Title Tag"
                value={pageSEO[selectedSEOKey].title}
                onChange={(e) => setPageSEO({
                  ...pageSEO,
                  [selectedSEOKey]: { ...pageSEO[selectedSEOKey], title: e.target.value }
                })}
              />
              <Textarea
                label="Meta Description Tag"
                value={pageSEO[selectedSEOKey].desc}
                onChange={(e) => setPageSEO({
                  ...pageSEO,
                  [selectedSEOKey]: { ...pageSEO[selectedSEOKey], desc: e.target.value }
                })}
              />
            </div>
          </Card>

        </div>

        {/* Live Visual Preview Frame */}
        <Card title="Live Web View Mockup Preview" icon={Eye}>
          <div
            style={{
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              overflow: 'hidden',
              backgroundColor: 'var(--bg-app)',
              display: 'flex',
              flexDirection: 'column',
              marginTop: '12px',
              fontSize: '14px',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            {/* Announcement bar mock */}
            <div style={{ backgroundColor: 'var(--accent)', color: 'white', fontSize: '10px', textAlign: 'center', padding: '4px 6px', fontWeight: 'bold' }}>
              {announcementBar}
            </div>

            {/* Navbar mock */}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)' }}>
              <span style={{ fontWeight: '800', color: 'var(--primary)' }}>FreshCart</span>
              <div style={{ display: 'flex', gap: '8px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                <span>Produce</span>
                <span>Bakery</span>
                <span>Pantry</span>
              </div>
            </div>

            {/* Banner hero section */}
            <div
              style={{
                position: 'relative',
                height: '140px',
                backgroundImage: `url(${bannerUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                display: 'flex',
                alignItems: 'center',
                padding: '16px'
              }}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.55)' }} />
              <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', gap: '4px', color: 'white' }}>
                <h3 style={{ color: 'white', fontSize: '15px', fontWeight: '800' }}>{heroTitle}</h3>
                <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '11px', lineHeight: '1.3' }}>{heroSubtitle}</p>
                <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                  <span style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '3px 8px', borderRadius: '4px', fontSize: '9px', fontWeight: 'bold' }}>Shop Now</span>
                </div>
              </div>
            </div>

            {/* Visual products placeholder */}
            <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>Featured items</span>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                {[1, 2, 3].map(i => (
                  <div key={i} style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', padding: '6px', borderRadius: '6px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ height: '36px', backgroundColor: 'var(--bg-app)', borderRadius: '4px' }} />
                    <span style={{ fontSize: '9px', fontWeight: '600' }}>Organic Item {i}</span>
                    <span style={{ fontSize: '9px', fontWeight: 'bold', color: 'var(--primary)' }}>$4.99</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </Card>

      </div>

    </div>
  );
};
export default CMS;
