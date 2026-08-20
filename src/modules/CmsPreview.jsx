import React, { useEffect, useState } from 'react';
import { Search } from 'lucide-react';

const CmsPreview = ({ products = [], categories = [], brands = [], recipes = [] }) => {
  const [sections, setSections] = useState([]);

  useEffect(() => {
    document.title = "Live Preview | Grandma's Basket";
    const saved = localStorage.getItem('cmsPreviewState');
    if (saved) {
      try { setSections(JSON.parse(saved)); } catch (e) { }
    }

    const handleStorageChange = (e) => {
      if (e.key === 'cmsPreviewState' && e.newValue) {
        try { setSections(JSON.parse(e.newValue)); } catch (err) { }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const getPreviewProductsForSection = (section) => {
    if (!section.dataSource || section.dataSource === 'Manual') {
      const selectedIds = section.items || [];
      return products.filter(p => selectedIds.includes(p.id));
    }
    const filters = section.filters || {};
    let filtered = [...products];
    if (filters.categories && filters.categories.length > 0) filtered = filtered.filter(p => filters.categories.includes(p.category));
    else if (filters.category) filtered = filtered.filter(p => p.category === filters.category);
    if (filters.subcategory) filtered = filtered.filter(p => p.subCategory === filters.subcategory);
    if (filters.brands && filters.brands.length > 0) filtered = filtered.filter(p => filters.brands.includes(p.brand));
    else if (filters.brand) filtered = filtered.filter(p => p.brand === filters.brand);
    if (filters.tag) filtered = filtered.filter(p => p.tags && p.tags.some(t => t.toLowerCase() === filters.tag.toLowerCase()));
    if (filters.minDiscount && filters.minDiscount > 0) {
      filtered = filtered.filter(p => {
        if (!p.regularPrice || !p.salePrice) return false;
        return (((p.regularPrice - p.salePrice) / p.regularPrice) * 100) >= filters.minDiscount;
      });
    }
    if (filters.stockStatus === 'in-stock') filtered = filtered.filter(p => p.stock > 0);
    else if (filters.stockStatus === 'out-of-stock') filtered = filtered.filter(p => p.stock === 0);
    if (filters.newArrival) filtered = filtered.filter(p => p.newArrival || p.isNewArrival || (p.tags && p.tags.some(t => t.toLowerCase() === 'new')));
    if (filters.featured) filtered = filtered.filter(p => p.isFeatured || p.featured || (p.tags && p.tags.some(t => t.toLowerCase() === 'featured')));
    if (filters.bestSeller) filtered = filtered.filter(p => p.isBestSeller || p.bestSeller || (p.tags && p.tags.some(t => t.toLowerCase() === 'bestseller')));
    return filtered.slice(0, section.productLimit || 4);
  };

  return (
    <div style={{ position: 'relative', width: '100%', minHeight: '100vh', backgroundColor: '#ffffff', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, overflowY: 'auto', backgroundColor: '#ffffff', fontFamily: "'Outfit', 'Inter', system-ui, sans-serif" }}>

        {/* ═══ TOP ANNOUNCEMENT BAR (dark, like real site) ═══ */}
        <div style={{ backgroundColor: '#111827', color: '#e5e7eb', fontSize: '11px', padding: '7px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px' }}>🚚</span>
            <span>Free delivery on orders over <strong style={{ color: '#fff' }}>£40</strong></span>
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ backgroundColor: '#ea580c', color: 'white', fontSize: '10px', fontWeight: '800', padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>DIWALI SALE</span>
            <span style={{ color: '#e5e7eb' }}>Up to <strong style={{ color: '#fbbf24' }}>30% OFF</strong> — Limited time</span>
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '10.5px', color: '#9ca3af' }}>
            <span>🕐 Mon–Sat: 9am–8pm · Sun: 10am–6pm</span>
            <span style={{ backgroundColor: '#16a34a', color: 'white', fontSize: '10px', fontWeight: '700', padding: '3px 10px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              💬 WhatsApp: +44 7700 900000
            </span>
          </span>
        </div>

        {/* ═══ MAIN HEADER ═══ */}
        <div style={{ backgroundColor: '#fff', borderBottom: '1px solid #f1f5f9', padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* GB Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, marginRight: '8px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'linear-gradient(135deg,#1a5c2e,#22863a)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '900', fontSize: '20px', fontStyle: 'italic' }}>
              G
            </div>
            <div>
              <div style={{ fontWeight: '900', fontSize: '14px', color: '#1a3a1a', lineHeight: 1.1, letterSpacing: '-0.01em' }}>Grandma's Basket</div>
              <div style={{ fontSize: '9px', color: '#6b7280', fontWeight: '600', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Fresh &amp; Local</div>
            </div>
          </div>

          {/* Location */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '0 14px', borderLeft: '1px solid #e5e7eb', borderRight: '1px solid #e5e7eb', flexShrink: 0 }}>
            <span style={{ fontSize: '15px' }}>📍</span>
            <div>
              <div style={{ fontSize: '9px', color: '#9ca3af', lineHeight: 1 }}>Delivery to</div>
              <div style={{ fontSize: '11.5px', fontWeight: '700', color: '#1f2937', lineHeight: 1.2 }}>London, UK</div>
            </div>
          </div>

          {/* Search */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', backgroundColor: '#f9fafb', border: '1.5px solid #e5e7eb', borderRadius: '10px', padding: '8px 14px', gap: '8px' }}>
            <Search size={14} style={{ color: '#9ca3af', flexShrink: 0 }} />
            <span style={{ fontSize: '11.5px', color: '#9ca3af' }}>Search your products, Categories or Brands</span>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexShrink: 0 }}>
            {[['♡', 'Wishlist'], ['🛒', 'Cart'], ['👤', 'Account']].map(([icon, label]) => (
              <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', gap: '1px' }}>
                <span style={{ fontSize: '18px', color: '#374151' }}>{icon}</span>
                <span style={{ fontSize: '9px', color: '#6b7280', fontWeight: '600' }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ═══ SECONDARY NAV ═══ */}
        <div style={{ backgroundColor: '#fff', borderBottom: '1px solid #f1f5f9', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
            {['Home', 'Categories', 'Brands', 'Offers', 'Recipes', 'Blog', 'Contact'].map((item, i) => (
              <span key={item} style={{ fontSize: '12px', fontWeight: i === 0 ? '700' : i === 3 ? '700' : '500', color: i === 0 ? '#16a34a' : i === 3 ? '#ea580c' : '#374151', padding: '10px 12px', cursor: 'pointer', borderBottom: i === 0 ? '2px solid #16a34a' : '2px solid transparent', display: 'flex', alignItems: 'center', gap: '3px' }}>
                {item}{(i === 1 || i === 2 || i === 3) ? ' ▾' : ''}
              </span>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span style={{ fontSize: '11px', color: '#374151', cursor: 'pointer' }}>Returns</span>
            <span style={{ fontSize: '11px', color: '#374151', cursor: 'pointer' }}>FAQs</span>
            <span style={{ fontSize: '11px', backgroundColor: '#fff7ed', color: '#ea580c', border: '1px solid #fed7aa', padding: '4px 10px', borderRadius: '6px', fontWeight: '700', cursor: 'pointer' }}>✉ Email support</span>
          </div>
        </div>

        {/* ═══ ENABLED SECTIONS ═══ */}
        {sections.filter(s => s.enabled).map((sec) => {
          const sType = sec.sectionType;
          const isProductSection = (type) => [
            'Today\'s Best Deals', 'Best Deals', 'Limited Products', 
            'Recommended Products', 'New Arrivals', 'Recently Viewed', 
            'Featured Products', 'Trending Products'
          ].includes(type);
          const previewProds = getPreviewProductsForSection(sec);

          return (
            <div key={sec.id}>

              {/* HERO BANNER */}
              {sType === 'Hero Banner' && (() => {
                const bgImg = sec.backgroundImage || sec.images?.[0] || '';
                return (
                  <div style={{ position: 'relative', minHeight: '320px', backgroundColor: '#1a2e1a', backgroundImage: bgImg ? `url(${bgImg})` : undefined, backgroundSize: 'cover', backgroundPosition: 'center right', display: 'flex', alignItems: 'center' }}>
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(20,40,20,0.90) 0%, rgba(20,40,20,0.60) 45%, rgba(20,40,20,0.05) 80%)' }} />
                    <div style={{ position: 'relative', zIndex: 1, padding: '48px 40px', maxWidth: '520px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      {(sec.highlightTitle || sec.offerBadge || sec.offerText) && (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', backgroundColor: 'rgba(22,163,74,0.25)', border: '1px solid rgba(22,163,74,0.5)', color: '#86efac', fontSize: '11px', fontWeight: '700', padding: '5px 12px', borderRadius: '20px', alignSelf: 'flex-start' }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#4ade80', display: 'inline-block' }} />
                          {sec.highlightTitle || sec.offerBadge || sec.offerText}
                        </div>
                      )}
                      <div>
                        {sec.title && (
                          <h1 style={{ margin: 0, fontSize: '32px', fontWeight: '900', color: 'white', lineHeight: 1.15, letterSpacing: '-0.02em' }}>
                            {sec.title}
                          </h1>
                        )}
                      </div>
                      {(sec.subtitle || sec.description) && (
                        <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.80)', lineHeight: 1.6, maxWidth: '400px' }}>
                          {sec.subtitle || sec.description}
                        </p>
                      )}
                      <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
                        {(sec.primaryButtonText || sec.primaryButtonUrl) && (
                          <span style={{ display: 'inline-block', backgroundColor: '#16a34a', color: 'white', fontSize: '12px', fontWeight: '700', padding: '10px 22px', borderRadius: '8px', cursor: 'pointer' }}>
                            {sec.primaryButtonText || 'Shop Now'}
                          </span>
                        )}
                        {(sec.secondaryButtonText || sec.secondaryButtonUrl) && (
                          <span style={{ display: 'inline-block', backgroundColor: 'transparent', color: 'white', border: '1px solid rgba(255,255,255,0.3)', fontSize: '12px', fontWeight: '700', padding: '10px 22px', borderRadius: '8px', cursor: 'pointer' }}>
                            {sec.secondaryButtonText || 'Learn More'}
                          </span>
                        )}
                      </div>
                    </div>
                    {!bgImg && (
                      <div style={{ position: 'absolute', right: '40px', top: '50%', transform: 'translateY(-50%)', opacity: 0.3, fontSize: '80px' }}>🖼️</div>
                    )}
                  </div>
                );
              })()}

              {/* FEATURE HIGHLIGHTS / SERVICE FEATURES */}
              {sType === 'Service Features' && (
                <div style={{ backgroundColor: '#fff', borderBottom: '1px solid #f1f5f9', padding: '18px 28px' }}>
                  {sec.items?.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(sec.items.length, 4)}, 1fr)`, gap: '0', borderTop: '1px solid #f1f5f9', borderLeft: '1px solid #f1f5f9' }}>
                      {sec.items.slice(0, 4).map((feat, i) => (
                        <div key={feat.id || i} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '18px 20px', borderRight: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9' }}>
                          <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: feat.iconBg || '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>
                            {feat.iconImage || feat.icon || '✅'}
                          </div>
                          <div>
                            <div style={{ fontSize: '12.5px', fontWeight: '700', color: '#111827' }}>{feat.title}</div>
                            <div style={{ fontSize: '10.5px', color: '#6b7280', marginTop: '2px' }}>{feat.description}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ padding: '24px', textAlign: 'center', color: '#9ca3af', fontSize: '12px', border: '1.5px dashed #e5e7eb', borderRadius: '10px' }}>
                      📦 No feature highlights configured — add items in the section editor
                    </div>
                  )}
                </div>
              )}

              {/* PROMOTIONAL BANNER GRID */}
              {sType === 'Offer Banners' && (() => {
                const items = sec.items || sec.customContent || [];
                if (items.length === 0) return (
                  <div style={{ padding: '20px 24px', backgroundColor: '#f3f4f6' }}>
                    <div style={{ padding: '32px', textAlign: 'center', color: '#9ca3af', fontSize: '12px', border: '1.5px dashed #e5e7eb', borderRadius: '12px', backgroundColor: '#fff' }}>
                      🖼️ No promotional banners configured — add banners in the section editor
                    </div>
                  </div>
                );
                return (
                  <div style={{ padding: '20px 24px', backgroundColor: '#f3f4f6' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                      {items.slice(0, 4).map((promo, i) => {
                        const bg = promo.backgroundColor || promo.bg || ['#1a5c2e', '#f97316', '#7c1f1f', '#fbbf24'][i % 4];
                        const isDark = bg !== '#fbbf24' && bg !== '#fff' && bg !== '#f5f5f5';
                        const imgSrc = promo.imageUrl || promo.image;
                        return (
                          <div key={promo.id || i} style={{ borderRadius: '16px', overflow: 'hidden', backgroundColor: bg, display: 'flex', height: '160px' }}>
                            <div style={{ flex: 1, padding: '18px 16px 18px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                              <div>
                                {promo.announcementText && (
                                  promo.labelPill ? (
                                    <span style={{ display: 'inline-block', backgroundColor: '#ea580c', color: 'white', fontSize: '10px', fontWeight: '800', padding: '2px 8px', borderRadius: '12px', marginBottom: '8px', textTransform: 'uppercase' }}>{promo.announcementText}</span>
                                  ) : (
                                    <div style={{ fontSize: '10px', fontWeight: '700', color: promo.labelColor || '#f97316', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>{promo.announcementText}</div>
                                  )
                                )}
                                <div style={{ fontSize: '14px', fontWeight: '800', color: isDark ? 'white' : '#111827', lineHeight: 1.25 }}>{promo.title}</div>
                                {promo.description && <div style={{ fontSize: '11px', color: isDark ? 'rgba(255,255,255,0.75)' : '#6b7280', marginTop: '4px' }}>{promo.description}</div>}
                              </div>
                              {promo.buttonText && (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', backgroundColor: 'rgba(255,255,255,0.15)', color: isDark ? 'white' : '#111827', fontSize: '11px', fontWeight: '700', padding: '7px 14px', borderRadius: '6px', border: isDark ? '1.5px solid rgba(255,255,255,0.5)' : '1.5px solid #111827', alignSelf: 'flex-start', cursor: 'pointer' }}>
                                  {promo.buttonText} →
                                </span>
                              )}
                            </div>
                            {imgSrc && (
                              <div style={{ width: '44%', flexShrink: 0, overflow: 'hidden' }}>
                                <img
                                  src={imgSrc}
                                  alt={promo.title}
                                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = '/logo.png';
                                    e.target.style.opacity = '0.35';
                                    e.target.style.objectFit = 'contain';
                                  }}
                                />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              {/* SHOP BY CATEGORIES */}
              {sType === 'Shop by Categories' && (() => {
                const CAT_COLORS = ['#3d6b2e', '#6b3d7c', '#1e6b5e', '#6b4e1e', '#7c1f1f', '#1e3d6b', '#2d5a3d'];
                const catList = (categories.filter(c => (sec.categoryIds || sec.items || []).includes(c.id)).length > 0
                  ? categories.filter(c => (sec.categoryIds || sec.items || []).includes(c.id))
                  : categories
                ).slice(0, sec.productLimit || 7);
                return (
                  <div style={{ padding: '24px 24px', backgroundColor: '#fff' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: '#111827' }}>{sec.title || 'Shop by categories'}</h3>
                      <span style={{ fontSize: '12px', color: '#ea580c', fontWeight: '700', cursor: 'pointer' }}>{sec.buttonText || 'All Categories'} →</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '10px' }}>
                      {catList.map((cat, idx) => (
                        <div key={cat.id} style={{ borderRadius: '14px', overflow: 'hidden', backgroundColor: CAT_COLORS[idx % CAT_COLORS.length], height: '155px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '14px 12px 0', cursor: 'pointer', position: 'relative' }}>
                          <div>
                            <div style={{ fontSize: '12px', fontWeight: '800', color: 'white', lineHeight: 1.2 }}>{cat.name}</div>
                            <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.65)', marginTop: '3px' }}>Local Market</div>
                          </div>
                          <div style={{ height: '80px', margin: '0 -4px', position: 'relative', overflow: 'hidden', borderRadius: '8px 8px 0 0' }}>
                            {cat.icon ? (
                              <img
                                src={cat.icon}
                                alt={cat.name}
                                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = '/logo.png';
                                  e.target.style.opacity = '0.35';
                                  e.target.style.objectFit = 'contain';
                                }}
                              />
                            ) : (
                              <div style={{ width: '100%', height: '100%', backgroundColor: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px' }}>🛒</div>
                            )}
                          </div>
                        </div>
                      ))}
                      {/* Arrow more card */}
                      <div style={{ borderRadius: '14px', backgroundColor: '#f3f4f6', height: '155px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '1px solid #e5e7eb' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#111827', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '18px', fontWeight: '700' }}>→</div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* PRODUCT SECTIONS */}
              {isProductSection(sType) && (() => {
                const ACCENT_LABELS = {
                  'Best Deals': 'HOT DEALS',
                  'New Arrivals': 'JUST LANDED',
                  'Recently Viewed': 'YOUR HISTORY',
                  'Featured Products': 'HAND PICKED',
                  'Trending Products': 'TRENDING NOW',
                  'Best Sellers': 'TOP RATED',
                  'Limited Products': 'LIMITED STOCK',
                  'Recommended Products': 'FOR YOU',
                };
                const accentLabel = ACCENT_LABELS[sType] || 'FEATURED';
                return (
                  <div style={{ padding: '28px 28px 32px', backgroundColor: '#fff' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '22px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                          <div style={{ width: '20px', height: '2.5px', backgroundColor: '#16a34a', borderRadius: '2px' }} />
                          <span style={{ fontSize: '10px', fontWeight: '800', color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{accentLabel}</span>
                        </div>
                        <h2 style={{ margin: 0, fontSize: '22px', fontWeight: '900', color: '#111827', letterSpacing: '-0.02em', lineHeight: 1.1 }}>{sec.title || sType}</h2>
                        {sec.subtitle && (
                          <p style={{ margin: '5px 0 0', fontSize: '12px', color: '#6b7280', lineHeight: 1.5 }}>{sec.subtitle}</p>
                        )}
                      </div>
                      <a style={{ fontSize: '12.5px', color: '#16a34a', fontWeight: '700', cursor: 'pointer', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap', paddingBottom: '3px', borderBottom: '1.5px solid #16a34a' }}>
                        {sec.buttonText || 'See All'} →
                      </a>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                      {(previewProds.length > 0 ? previewProds : products).slice(0, sec.productLimit || 8).map((prod, pIdx) => {
                        const saleP = Number(prod.salePrice || 0);
                        const regP = Number(prod.regularPrice || 0);
                        const hasDiscount = regP > saleP && saleP > 0;
                        const discountPct = hasDiscount ? Math.round((1 - saleP / regP) * 100) : 0;
                        const isOrganic = prod.isFeatured || pIdx % 2 === 1;
                        return (
                          <div key={prod.id} style={{ borderRadius: '16px', overflow: 'hidden', backgroundColor: '#fff', cursor: 'pointer', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', border: '1px solid #f1f5f9' }}>
                            <div style={{ position: 'relative', backgroundColor: '#f8fafc', height: '160px', overflow: 'hidden' }}>
                              <img
                                src={prod.images?.[0] || 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=400'}
                                alt={prod.name}
                                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                                onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=400'; }}
                              />
                              {hasDiscount && (
                                <div style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                  <span style={{ backgroundColor: '#dc2626', color: 'white', fontSize: '9px', fontWeight: '800', padding: '3px 8px', borderRadius: '5px', textTransform: 'uppercase' }}>Best Sale</span>
                                  <span style={{ backgroundColor: '#ea580c', color: 'white', fontSize: '9px', fontWeight: '800', padding: '3px 7px', borderRadius: '5px' }}>{discountPct}% off</span>
                                </div>
                              )}
                              {isOrganic && (
                                <span style={{ position: 'absolute', top: '10px', right: '10px', backgroundColor: '#16a34a', color: 'white', fontSize: '8.5px', fontWeight: '800', padding: '3px 7px', borderRadius: '5px', textTransform: 'uppercase' }}>ORGANIC</span>
                              )}
                            </div>
                            <div style={{ padding: '12px 14px 14px' }}>
                              <div style={{ fontSize: '13px', fontWeight: '700', color: '#111827', marginBottom: '3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{prod.name}</div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                <span style={{ fontSize: '10px', color: '#9ca3af' }}>{prod.weight || prod.unit || '500g'}</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '2px', fontSize: '10px', color: '#6b7280' }}>
                                  <span style={{ color: '#f59e0b' }}>★</span>
                                  <span>(4.8/5)</span>
                                </span>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                                  <span style={{ fontSize: '17px', fontWeight: '800', color: '#111827' }}>${Number(saleP || regP || 0).toFixed(2)}</span>
                                  {hasDiscount && (
                                    <span style={{ fontSize: '11px', color: '#9ca3af', textDecoration: 'line-through' }}>${regP.toFixed(2)}</span>
                                  )}
                                </div>
                                <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#1a3d1a', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: '300', cursor: 'pointer', flexShrink: 0 }}>+</div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              {/* BRANDS */}
              {sType === 'Shop by Brands' && (
                <div style={{ padding: '28px 28px 32px', backgroundColor: '#f9fafb' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '20px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                        <div style={{ width: '20px', height: '2.5px', backgroundColor: '#16a34a', borderRadius: '2px' }} />
                        <span style={{ fontSize: '10px', fontWeight: '800', color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.1em' }}>TRUSTED BRANDS</span>
                      </div>
                      <h2 style={{ margin: 0, fontSize: '22px', fontWeight: '900', color: '#111827', letterSpacing: '-0.02em' }}>{sec.title || 'Our Trusted Brands'}</h2>
                      {sec.subtitle && <p style={{ margin: '5px 0 0', fontSize: '12px', color: '#6b7280' }}>{sec.subtitle}</p>}
                    </div>
                    {sec.buttonText && <a style={{ fontSize: '12.5px', color: '#16a34a', fontWeight: '700', cursor: 'pointer', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', borderBottom: '1.5px solid #16a34a', paddingBottom: '2px' }}>{sec.buttonText} →</a>}
                  </div>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    {(brands.filter(b => (sec.brandIds || sec.items || []).includes(b.id)).length > 0
                      ? brands.filter(b => (sec.brandIds || sec.items || []).includes(b.id))
                      : brands
                    ).slice(0, sec.productLimit || 8).map(brand => (
                      <div key={brand.id} style={{ height: '56px', minWidth: '110px', border: '1px solid #e5e7eb', borderRadius: '10px', backgroundColor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px 18px', cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                        {brand.logo ? (
                          <img
                            src={brand.logo}
                            alt={brand.name}
                            style={{ maxHeight: '36px', maxWidth: '90px', objectFit: 'contain' }}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = '/logo.png';
                              e.target.style.opacity = '0.35';
                              e.target.style.objectFit = 'contain';
                            }}
                          />
                        ) : (
                          <span style={{ fontSize: '12.5px', fontWeight: '700', color: '#374151' }}>{brand.name}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* RECIPES */}
              {sType === 'Popular Recipes' && (
                <div style={{ padding: '28px 28px 32px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '20px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                        <div style={{ width: '20px', height: '2.5px', backgroundColor: '#16a34a', borderRadius: '2px' }} />
                        <span style={{ fontSize: '10px', fontWeight: '800', color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{sec.highlightTitle || "CHEF'S PICKS"}</span>
                      </div>
                      <h2 style={{ margin: 0, fontSize: '22px', fontWeight: '900', color: '#111827', letterSpacing: '-0.02em' }}>{sec.title || 'Recipe Ideas'}</h2>
                      {sec.subtitle && <p style={{ margin: '5px 0 0', fontSize: '12px', color: '#6b7280' }}>{sec.subtitle}</p>}
                    </div>
                    {sec.buttonText && <a style={{ fontSize: '12.5px', color: '#16a34a', fontWeight: '700', cursor: 'pointer', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', borderBottom: '1.5px solid #16a34a', paddingBottom: '2px' }}>{sec.buttonText} →</a>}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
                    {(recipes.filter(r => (sec.recipeIds || sec.items || []).includes(r.id)).length > 0
                      ? recipes.filter(r => (sec.recipeIds || sec.items || []).includes(r.id))
                      : recipes
                    ).slice(0, sec.productLimit || 3).map(rec => (
                      <div key={rec.id} style={{ borderRadius: '14px', overflow: 'hidden', position: 'relative', height: '170px', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                        <img
                          src={rec.image}
                          alt={rec.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&q=80&w=400'; }}
                        />
                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,transparent 35%,rgba(0,0,0,0.75) 100%)' }} />
                        <div style={{ position: 'absolute', bottom: '12px', left: '14px', right: '14px' }}>
                          <div style={{ fontSize: '12.5px', fontWeight: '800', color: 'white' }}>{rec.title}</div>
                          <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.75)', marginTop: '3px' }}>⏱ {rec.cookingTime}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TESTIMONIALS */}
              {sType === 'Testimonials' && (
                <div style={{ padding: '36px 28px 40px', background: 'linear-gradient(135deg,#1e3a1e 0%,#0f2210 100%)' }}>
                  <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
                      <div style={{ width: '20px', height: '2.5px', backgroundColor: '#4ade80', borderRadius: '2px' }} />
                      <span style={{ fontSize: '10px', fontWeight: '800', color: '#4ade80', textTransform: 'uppercase', letterSpacing: '0.1em' }}>HAPPY CUSTOMERS</span>
                      <div style={{ width: '20px', height: '2.5px', backgroundColor: '#4ade80', borderRadius: '2px' }} />
                    </div>
                    <h2 style={{ margin: '0 0 6px', fontSize: '22px', fontWeight: '900', color: 'white', letterSpacing: '-0.02em' }}>{sec.title || 'What Our Customers Say'}</h2>
                    {sec.subtitle && <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>{sec.subtitle}</p>}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
                    {sec.customContent?.length > 0 ? sec.customContent.slice(0, 6).map((test, i) => (
                      <div key={test.id || i} style={{ backgroundColor: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '14px', padding: '18px' }}>
                        <div style={{ fontSize: '15px', color: '#fbbf24', marginBottom: '10px', letterSpacing: '2px' }}>★★★★★</div>
                        <p style={{ margin: '0 0 14px', fontSize: '11px', color: 'rgba(255,255,255,0.78)', fontStyle: 'italic', lineHeight: 1.6 }}>"{test.feedback || test.comment || test.text}"</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          {test.avatar ? (
                            <img src={test.avatar} alt={test.name} style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
                          ) : (
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg,#16a34a,#15803d)', color: 'white', fontSize: '13px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{(test.name || 'U')[0]}</div>
                          )}
                          <div>
                            <div style={{ fontSize: '11px', fontWeight: '700', color: 'white' }}>{test.name}</div>
                            <div style={{ fontSize: '9.5px', color: 'rgba(255,255,255,0.45)' }}>{test.role || test.designation}</div>
                          </div>
                        </div>
                      </div>
                    )) : (
                      <div style={{ gridColumn: '1/-1', padding: '28px', textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '12px', border: '1.5px dashed rgba(255,255,255,0.2)', borderRadius: '12px' }}>
                        💬 No testimonials configured — add reviews in the section editor
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* WHY CHOOSE US */}
              {sType === 'Why Choose Us' && (
                <div style={{ padding: '28px 28px 32px', backgroundColor: '#f0fdf4' }}>
                  <div style={{ textAlign: 'center', marginBottom: '22px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
                      <div style={{ width: '20px', height: '2.5px', backgroundColor: '#16a34a', borderRadius: '2px' }} />
                      <span style={{ fontSize: '10px', fontWeight: '800', color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.1em' }}>OUR PROMISE</span>
                      <div style={{ width: '20px', height: '2.5px', backgroundColor: '#16a34a', borderRadius: '2px' }} />
                    </div>
                    <h2 style={{ margin: '0 0 6px', fontSize: '22px', fontWeight: '900', color: '#111827', letterSpacing: '-0.02em' }}>{sec.title || "Why Choose Grandma's Basket?"}</h2>
                    {sec.subtitle && <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>{sec.subtitle}</p>}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                    {sec.customContent?.length > 0 ? sec.customContent.slice(0, 6).map((reason, i) => (
                      <div key={reason.id || i} style={{ backgroundColor: '#fff', borderRadius: '12px', overflow: 'hidden', border: '1px solid #d1fae5', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                        {(reason.imageUrl || reason.image) && (
                          <div style={{ height: '105px', overflow: 'hidden' }}>
                            <img src={reason.imageUrl || reason.image} alt={reason.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none'; }} />
                          </div>
                        )}
                        <div style={{ padding: '14px' }}>
                          <div style={{ fontSize: '13px', fontWeight: '800', color: '#111827', marginBottom: '5px' }}>{reason.title}</div>
                          <div style={{ fontSize: '10.5px', color: '#6b7280', lineHeight: 1.5 }}>{reason.description}</div>
                        </div>
                      </div>
                    )) : (
                      <div style={{ gridColumn: '1/-1', padding: '28px', textAlign: 'center', color: '#9ca3af', fontSize: '12px', border: '1.5px dashed #e5e7eb', borderRadius: '12px', backgroundColor: '#fff' }}>
                        ✅ No reasons configured — add items in the section editor
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* NEWSLETTER OR SUBSCRIPTION */}
              {(sType === 'Newsletter' || sType === 'Subscription Banner') && (
                <div style={{ background: 'linear-gradient(135deg,#16a34a 0%,#15803d 100%)', padding: '36px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '24px' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: '0 0 6px', fontSize: '20px', fontWeight: '900', color: 'white' }}>{sec.title || 'Please subscribe for latest updates'}</h3>
                    <p style={{ margin: 0, fontSize: '12.5px', color: 'rgba(255,255,255,0.78)', lineHeight: 1.55 }}>{sec.subtitle || 'Get exclusive deals, farm-fresh alerts and 20% cashback with a subscription.'}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', flexShrink: 0 }}>
                    <input type="email" placeholder="Enter your email address..." disabled style={{ padding: '11px 18px', fontSize: '12px', borderRadius: '8px', border: 'none', width: '220px', outline: 'none', color: '#374151' }} />
                    <span style={{ display: 'inline-block', backgroundColor: '#ea580c', color: 'white', fontSize: '12.5px', fontWeight: '800', padding: '11px 22px', borderRadius: '8px', cursor: 'pointer', whiteSpace: 'nowrap' }}>{sec.buttonText || 'Subscribe Now'}</span>
                  </div>
                </div>
              )}

            </div>
          );
        })}

        {/* ═══ FOOTER ═══ */}
        <div style={{ backgroundColor: '#0f1a12', color: '#9ca3af', padding: '36px 40px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2.2fr 1fr 1fr 1fr', gap: '32px', marginBottom: '28px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '9px', marginBottom: '14px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg,#16a34a,#15803d)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '900', fontSize: '16px', fontStyle: 'italic' }}>G</div>
                <div>
                  <div style={{ fontWeight: '800', fontSize: '13.5px', color: 'white' }}>Grandma's Basket</div>
                  <div style={{ fontSize: '9px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Fresh &amp; Local</div>
                </div>
              </div>
              <p style={{ margin: '0 0 14px', fontSize: '11px', lineHeight: 1.7, maxWidth: '210px' }}>Delivering authentic Indian groceries &amp; spices from trusted suppliers to your doorstep across the UK.</p>
            </div>
            {[['Quick Links', ['Home', 'Categories', 'Offers', 'Recipes', 'Blog']], ['Customer Care', ['Track Order', 'Returns', 'FAQ', 'Contact', 'WhatsApp']], ['Follow Us', ['Instagram', 'Facebook', 'YouTube', 'Twitter', 'Pinterest']]].map(([title, links]) => (
              <div key={title}>
                <div style={{ fontWeight: '700', fontSize: '12.5px', color: 'white', marginBottom: '12px' }}>{title}</div>
                {links.map(link => <div key={link} style={{ fontSize: '11px', marginBottom: '7px', cursor: 'pointer', color: '#9ca3af' }}>{link}</div>)}
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid #1f2d1f', paddingTop: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10.5px' }}>
            <span>© 2024 Grandma's Basket Ltd. All rights reserved.</span>
            <div style={{ display: 'flex', gap: '16px', color: '#6b7280' }}>
              <span style={{ cursor: 'pointer' }}>Privacy Policy</span>
              <span style={{ cursor: 'pointer' }}>Terms of Service</span>
              <span style={{ cursor: 'pointer' }}>Cookie Policy</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CmsPreview;
