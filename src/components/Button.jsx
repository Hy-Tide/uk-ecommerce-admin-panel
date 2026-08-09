import React from 'react';
import { motion } from 'framer-motion';

export const Button = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary', // primary, secondary, outline, ghost, danger, success, warning
  size = 'md', // sm, md, lg
  disabled = false,
  loading = false,
  className = '',
  icon: Icon = null,
  ...props
}) => {
  const baseStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontWeight: '500',
    borderRadius: 'var(--radius-md)',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    border: '1px solid transparent',
    transition: 'all var(--transition-fast)',
    fontSize: size === 'sm' ? '13px' : size === 'lg' ? '16px' : '14px',
    padding: size === 'sm' ? '6px 12px' : size === 'lg' ? '12px 24px' : '8px 16px',
    opacity: disabled || loading ? 0.6 : 1,
    outline: 'none',
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return {
          backgroundColor: 'var(--bg-app)',
          color: 'var(--text-primary)',
          borderColor: 'var(--border-color)',
          hover: { backgroundColor: 'var(--border-color)' }
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          color: 'var(--text-primary)',
          borderColor: 'var(--border-color)',
          hover: { borderColor: 'var(--text-muted)', backgroundColor: 'var(--primary-light)' }
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          color: 'var(--text-secondary)',
          hover: { backgroundColor: 'var(--border-color)', color: 'var(--text-primary)' }
        };
      case 'danger':
        return {
          backgroundColor: 'var(--danger)',
          color: '#ffffff',
          hover: { backgroundColor: 'var(--danger-hover)' }
        };
      case 'success':
        return {
          backgroundColor: 'var(--success)',
          color: '#ffffff',
          hover: { backgroundColor: 'var(--primary-hover)' }
        };
      case 'warning':
        return {
          backgroundColor: 'var(--warning)',
          color: '#0f172a',
          hover: { opacity: 0.9 }
        };
      case 'primary':
      default:
        return {
          backgroundColor: 'var(--primary)',
          color: '#ffffff',
          hover: { backgroundColor: 'var(--primary-hover)' }
        };
    }
  };

  const styles = getVariantStyles();

  // Combine standard inline style with custom styles inside a class if needed,
  // but using inline-style states + hovering class makes it extremely modular and premium.
  const [hovered, setHovered] = React.useState(false);

  const activeStyle = {
    ...baseStyle,
    ...styles,
    ...(hovered && !disabled && !loading ? styles.hover : {}),
  };

  const childrenArray = React.Children.toArray(children);
  const hasText = childrenArray.some(child => typeof child === 'string');
  const isIconOnly = !hasText && (Icon || childrenArray.length > 0);

  return (
    <motion.button
      type={type}
      disabled={disabled || loading}
      onClick={disabled || loading ? undefined : onClick}
      style={activeStyle}
      className={`admin-btn admin-btn-${variant} admin-btn-${size} ${isIconOnly ? 'admin-btn-icon-only' : ''} ${className}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      whileTap={disabled || loading ? {} : { scale: 0.97 }}
      {...props}
    >
      {loading && (
        <svg
          style={{
            animation: 'spin 1s linear infinite',
            width: '16px',
            height: '16px',
          }}
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path
            style={{ opacity: 0.75 }}
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {!loading && Icon && <Icon size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16} />}
      {children}
      <style>{`
        @keyframes spin {
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </motion.button>
  );
};
export default Button;
