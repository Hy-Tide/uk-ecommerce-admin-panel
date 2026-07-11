import React from 'react';

export const Badge = ({
  children,
  variant = 'secondary', // primary, secondary, success, danger, warning, accent
  className = '',
  style = {},
  ...props
}) => {
  const getColors = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: 'var(--primary-light)',
          color: 'var(--primary)',
          borderColor: 'rgba(16, 185, 129, 0.2)'
        };
      case 'success':
        return {
          backgroundColor: 'var(--success-light)',
          color: 'var(--success)',
          borderColor: 'rgba(52, 211, 153, 0.2)'
        };
      case 'danger':
        return {
          backgroundColor: 'var(--danger-light)',
          color: 'var(--danger)',
          borderColor: 'rgba(248, 113, 113, 0.2)'
        };
      case 'warning':
        return {
          backgroundColor: 'var(--warning-light)',
          color: 'var(--warning)',
          borderColor: 'rgba(251, 191, 36, 0.2)'
        };
      case 'accent':
        return {
          backgroundColor: 'var(--accent-light)',
          color: 'var(--accent)',
          borderColor: 'rgba(251, 146, 60, 0.2)'
        };
      case 'secondary':
      default:
        return {
          backgroundColor: 'var(--bg-app)',
          color: 'var(--text-secondary)',
          borderColor: 'var(--border-color)'
        };
    }
  };

  const colors = getColors();

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        fontSize: '11px',
        fontWeight: '600',
        padding: '3px 8px',
        borderRadius: '12px',
        border: '1px solid transparent',
        textTransform: 'uppercase',
        letterSpacing: '0.03em',
        width: 'fit-content',
        ...colors,
        ...style
      }}
      className={`admin-badge ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};
export default Badge;
