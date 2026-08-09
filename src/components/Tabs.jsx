import React from 'react';

export const Tabs = ({
  tabs = [], // [{ key: 'tab1', label: 'Tab 1', icon: Icon, badgeCount: 3 }]
  activeTab,
  onChange,
  className = '',
  style = {}
}) => {
  return (
    <div
      style={{
        display: 'flex',
        borderBottom: '1px solid var(--border-color)',
        gap: '24px',
        overflowX: 'auto',
        width: '100%',
        ...style
      }}
      className={`admin-tabs ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        const Icon = tab.icon;

        return (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 4px',
              fontSize: '14px',
              fontWeight: isActive ? '600' : '500',
              color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
              borderBottom: `2px solid ${isActive ? 'var(--primary)' : 'transparent'}`,
              backgroundColor: 'transparent',
              borderTop: 'none',
              borderLeft: 'none',
              borderRight: 'none',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all var(--transition-fast)',
              position: 'relative'
            }}
          >
            {Icon && <Icon size={16} />}
            {tab.label}
            {tab.badgeCount !== undefined && tab.badgeCount > 0 && (
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: '700',
                  backgroundColor: isActive ? 'var(--primary)' : 'var(--border-color)',
                  color: isActive ? '#ffffff' : 'var(--text-secondary)',
                  borderRadius: '10px',
                  padding: '2px 6px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: '18px',
                  height: '18px'
                }}
              >
                {tab.badgeCount}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
export default Tabs;
