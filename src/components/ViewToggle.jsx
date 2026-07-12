import React from 'react';
import { List, Grid } from 'lucide-react';

export const ViewToggle = ({ currentView, onViewChange }) => {
  return (
    <div style={{
      display: 'flex',
      gap: '2px',
      backgroundColor: 'var(--bg-app)',
      padding: '3px',
      borderRadius: '10px',
      border: '1px solid var(--border-color)',
      width: 'fit-content'
    }}>
      <button
        type="button"
        onClick={() => onViewChange('list')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 12px',
          fontSize: '12px',
          fontWeight: '700',
          borderRadius: '7px',
          border: 'none',
          cursor: 'pointer',
          transition: 'all 0.2s',
          backgroundColor: currentView === 'list' ? 'var(--primary)' : 'transparent',
          color: currentView === 'list' ? '#fff' : 'var(--text-secondary)'
        }}
      >
        <List size={14} />
        <span>List</span>
      </button>
      <button
        type="button"
        onClick={() => onViewChange('grid')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 12px',
          fontSize: '12px',
          fontWeight: '700',
          borderRadius: '7px',
          border: 'none',
          cursor: 'pointer',
          transition: 'all 0.2s',
          backgroundColor: currentView === 'grid' ? 'var(--primary)' : 'transparent',
          color: currentView === 'grid' ? '#fff' : 'var(--text-secondary)'
        }}
      >
        <Grid size={14} />
        <span>Grid</span>
      </button>
    </div>
  );
};

export default ViewToggle;
