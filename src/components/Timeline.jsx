import React from 'react';
import { CheckCircle2, Circle } from 'lucide-react';

export const Timeline = ({
  steps = [], // [{ status: 'New Order', time: '2026-07-01T14:32:00Z', desc: 'Order placed' }]
  className = '',
  style = {}
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        paddingLeft: '24px',
        ...style
      }}
      className={`admin-timeline ${className}`}
    >
      {/* Central Line */}
      <div
        style={{
          position: 'absolute',
          left: '7px',
          top: '8px',
          bottom: '8px',
          width: '2px',
          backgroundColor: 'var(--border-color)',
          zIndex: 1
        }}
      />

      {steps.map((step, idx) => {
        const isLast = idx === steps.length - 1;
        const timeStr = step.time ? new Date(step.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
        const dateStr = step.time ? new Date(step.time).toLocaleDateString([], { month: 'short', day: 'numeric' }) : '';

        return (
          <div
            key={idx}
            style={{
              display: 'flex',
              gap: '16px',
              paddingBottom: isLast ? '0' : '20px',
              position: 'relative',
              zIndex: 2
            }}
          >
            {/* Status node icon container */}
            <div
              style={{
                position: 'absolute',
                left: '-24px',
                top: '2px',
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                backgroundColor: 'var(--bg-card)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isLast ? 'var(--primary)' : 'var(--text-muted)'
              }}
            >
              {isLast ? (
                <CheckCircle2 size={16} fill="var(--primary-light)" />
              ) : (
                <Circle size={12} fill="var(--border-color)" stroke="var(--border-color)" />
              )}
            </div>

            {/* Step metadata */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', fontWeight: '600', color: isLast ? 'var(--primary)' : 'var(--text-primary)' }}>
                  {step.status}
                </span>
                {step.time && (
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {dateStr} {timeStr}
                  </span>
                )}
              </div>
              {step.desc && (
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  {step.desc}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
export default Timeline;
