import React from 'react';

/**
 * Reusable Shimmer Skeleton Loaders
 */

export const ShimmerRow = ({ height = '44px', count = 5 }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        className="shimmer"
        style={{
          width: '100%',
          height,
          borderRadius: '10px'
        }}
      />
    ))}
  </div>
);

export const ShimmerCardGrid = ({ count = 6, height = '180px' }) => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
      gap: '16px',
      width: '100%'
    }}
  >
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        className="shimmer"
        style={{
          width: '100%',
          height,
          borderRadius: '14px'
        }}
      />
    ))}
  </div>
);

export const TableShimmer = ({ rows = 5, cols = 5 }) => (
  <div
    style={{
      width: '100%',
      backgroundColor: 'var(--bg-card)',
      border: '1px solid var(--border-color)',
      borderRadius: '14px',
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      boxShadow: 'var(--shadow-sm)'
    }}
  >
    <div style={{ display: 'flex', gap: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
      {Array.from({ length: cols }).map((_, c) => (
        <div key={c} className="shimmer" style={{ height: '18px', flex: c === 0 ? 2 : 1, borderRadius: '6px' }} />
      ))}
    </div>
    {Array.from({ length: rows }).map((_, r) => (
      <div key={r} style={{ display: 'flex', gap: '16px', alignItems: 'center', padding: '6px 0' }}>
        {Array.from({ length: cols }).map((_, c) => (
          <div key={c} className="shimmer" style={{ height: '22px', flex: c === 0 ? 2 : 1, borderRadius: '6px' }} />
        ))}
      </div>
    ))}
  </div>
);

export default ShimmerRow;
