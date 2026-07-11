import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CornerDownLeft, Search } from 'lucide-react';

export const CommandPalette = ({
  isOpen = false,
  onClose,
  onNavigate, // function (tabKey)
  onQuickAction, // function (actionKey)
  modulesList = [] // [{ key, label, icon }]
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Reset indices on close or query change
  useEffect(() => {
    setSelectedIndex(0);
  }, [query, isOpen]);

  // Handle global key events
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, filteredItems.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          handleItemClick(filteredItems[selectedIndex]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, query]);

  // Mock list of search items
  const commands = [
    { type: 'navigation', label: 'Go to Dashboard Analytics', key: 'dashboard', section: 'Navigation' },
    { type: 'navigation', label: 'Go to Products Catalog', key: 'products', section: 'Navigation' },
    { type: 'navigation', label: 'Go to Order Log Queue', key: 'orders', section: 'Navigation' },
    { type: 'navigation', label: 'Go to Customers Profiles', key: 'customers', section: 'Navigation' },
    { type: 'navigation', label: 'Go to Coupons & Promotions', key: 'coupons', section: 'Navigation' },
    { type: 'navigation', label: 'Go to CMS Editor', key: 'cms', section: 'Navigation' },
    { type: 'navigation', label: 'Go to Blogs Publisher', key: 'blogs', section: 'Navigation' },
    { type: 'navigation', label: 'Go to WhatsApp Campaigns', key: 'whatsapp', section: 'Navigation' },
    { type: 'navigation', label: 'Go to Store Settings', key: 'settings', section: 'Navigation' },
    { type: 'navigation', label: 'Go to Audit Logs & Security', key: 'security', section: 'Navigation' },
    { type: 'action', label: 'Quick Action: Add New Product', key: 'add-product', section: 'Quick Actions' },
    { type: 'action', label: 'Quick Action: Generate Promo Coupon', key: 'create-coupon', section: 'Quick Actions' },
    { type: 'action', label: 'Quick Action: Launch WhatsApp Broadcast', key: 'whatsapp-campaign', section: 'Quick Actions' },
    { type: 'action', label: 'Quick Action: Download Sales Sheet (CSV)', key: 'export-sales', section: 'Quick Actions' }
  ];

  const filteredItems = commands.filter(item =>
    item.label.toLowerCase().includes(query.toLowerCase())
  );

  const handleItemClick = (item) => {
    if (item.type === 'navigation') {
      onNavigate(item.key);
    } else {
      onQuickAction(item.key);
    }
    onClose();
    setQuery('');
  };

  // Group filtered items by section
  const sections = {};
  filteredItems.forEach(item => {
    if (!sections[item.section]) {
      sections[item.section] = [];
    }
    sections[item.section].push(item);
  });

  // Flat array mapping indices to actual items for highlighting
  const flatFilteredItems = [];
  Object.keys(sections).forEach(sect => {
    sections[sect].forEach(item => {
      flatFilteredItems.push(item);
    });
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 10000,
            display: 'flex',
            justifyContent: 'center',
            paddingTop: '15vh',
            paddingLeft: '16px',
            paddingRight: '16px'
          }}
        >
          {/* Dark blurred background */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.4)',
              backdropFilter: 'blur(4px)',
            }}
          />

          {/* Dialog Container */}
          <motion.div
            initial={{ y: -20, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -20, opacity: 0, scale: 0.98 }}
            transition={{ type: 'tween', duration: 0.15 }}
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '560px',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-xl)',
              display: 'flex',
              flexDirection: 'column',
              maxHeight: '400px',
              zIndex: 10,
              overflow: 'hidden'
            }}
          >
            {/* Input Search Box */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '16px',
                borderBottom: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-app)'
              }}
            >
              <Search size={20} style={{ color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Type a command or search dashboard modules..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
                style={{
                  flex: 1,
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: 'var(--text-primary)',
                  fontSize: '15px',
                  outline: 'none',
                  fontWeight: '500'
                }}
              />
              <span
                style={{
                  fontSize: '11px',
                  backgroundColor: 'var(--border-color)',
                  color: 'var(--text-secondary)',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontFamily: 'monospace'
                }}
              >
                ESC
              </span>
            </div>

            {/* Results Container */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
              {filteredItems.length === 0 ? (
                <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
                  No commands found matching "{query}"
                </div>
              ) : (
                Object.keys(sections).map(secTitle => (
                  <div key={secTitle} style={{ marginBottom: '16px' }}>
                    <div
                      style={{
                        fontSize: '11px',
                        fontWeight: '700',
                        color: 'var(--text-muted)',
                        paddingLeft: '8px',
                        paddingBottom: '6px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}
                    >
                      {secTitle}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      {sections[secTitle].map((item) => {
                        // Find the index of this item in the flat array to apply highlight
                        const itemIdx = flatFilteredItems.findIndex(i => i.label === item.label);
                        const isHighlighted = selectedIndex === itemIdx;

                        return (
                          <div
                            key={item.label}
                            onClick={() => handleItemClick(item)}
                            onMouseEnter={() => setSelectedIndex(itemIdx)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '10px 12px',
                              borderRadius: 'var(--radius-md)',
                              backgroundColor: isHighlighted ? 'var(--primary-light)' : 'transparent',
                              cursor: 'pointer',
                              transition: 'background-color var(--transition-fast)'
                            }}
                          >
                            <span
                              style={{
                                fontSize: '13px',
                                fontWeight: isHighlighted ? '600' : '500',
                                color: isHighlighted ? 'var(--primary)' : 'var(--text-primary)'
                              }}
                            >
                              {item.label}
                            </span>
                            {isHighlighted && (
                              <span
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  fontSize: '11px',
                                  color: 'var(--primary)',
                                  gap: '2px'
                                }}
                              >
                                Jump <CornerDownLeft size={10} />
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
export default CommandPalette;
