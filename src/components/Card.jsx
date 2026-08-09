import React from 'react';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';

export const Card = ({
  children,
  title,
  actions = null,
  glass = false,
  className = '',
  style = {},
  ...props
}) => {
  return (
    <div
      style={{
        backgroundColor: glass ? 'var(--glass-bg)' : 'var(--bg-card)',
        border: `1px solid ${glass ? 'var(--glass-border)' : 'var(--border-color)'}`,
        backdropFilter: glass ? 'blur(12px)' : 'none',
        WebkitBackdropFilter: glass ? 'blur(12px)' : 'none',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-md)',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        transition: 'transform var(--transition-fast), box-shadow var(--transition-fast)',
        ...style
      }}
      className={`admin-card ${className}`}
      {...props}
    >
      {(title || actions) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          {title && <h4 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)' }}>{title}</h4>}
          {actions && <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>{actions}</div>}
        </div>
      )}
      <div style={{ flex: 1 }}>{children}</div>
    </div>
  );
};

export const StatsCard = ({
  title,
  value,
  subvalue,
  trend = 0, // e.g. +12.5 or -3.2 (percentage change)
  trendLabel = 'vs last month',
  icon: Icon = null,
  iconColor = 'var(--primary)',
  iconBg = 'var(--primary-light)',
  className = '',
  ...props
}) => {
  const isPositive = trend >= 0;

  return (
    <Card className={className} {...props}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)' }}>{title}</span>
          <h2 style={{ fontSize: '28px', fontWeight: '700', color: 'var(--text-primary)', margin: '4px 0 0' }}>{value}</h2>
        </div>
        {Icon && (
          <div
            style={{
              padding: '10px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: iconBg,
              color: iconColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Icon size={22} />
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '12px', fontSize: '12px' }}>
        {trend !== 0 && (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              fontWeight: '600',
              color: isPositive ? 'var(--success)' : 'var(--danger)',
              backgroundColor: isPositive ? 'var(--success-light)' : 'var(--danger-light)',
              padding: '2px 6px',
              borderRadius: '12px',
              gap: '2px'
            }}
          >
            {isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {Math.abs(trend)}%
          </span>
        )}
        <span style={{ color: 'var(--text-muted)' }}>{subvalue || trendLabel}</span>
      </div>
    </Card>
  );
};
export default Card;
