import React, { useState, useRef, useEffect } from 'react';

// Normal Text/Number/Date Input
export const Input = ({
  label,
  type = 'text',
  placeholder = '',
  value,
  onChange,
  disabled = false,
  error = '',
  icon: Icon = null,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }} className={className}>
      {label && (
        <label
          htmlFor={inputId}
          style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)' }}
        >
          {label}
        </label>
      )}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {Icon && (
          <span style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
            <Icon size={16} />
          </span>
        )}
        <input
          type={type}
          id={inputId}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          style={{
            width: '100%',
            padding: Icon ? '10px 12px 10px 38px' : '10px 12px',
            fontSize: '14px',
            backgroundColor: 'var(--bg-card)',
            color: 'var(--text-primary)',
            border: `1px solid ${error ? 'var(--danger)' : 'var(--border-color)'}`,
            borderRadius: 'var(--radius-md)',
            outline: 'none',
            transition: 'border-color var(--transition-fast), box-shadow var(--transition-fast)',
          }}
          className="admin-input"
          onFocus={(e) => {
            e.target.style.borderColor = 'var(--primary)';
            e.target.style.boxShadow = '0 0 0 3px var(--primary-light)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = error ? 'var(--danger)' : 'var(--border-color)';
            e.target.style.boxShadow = 'none';
          }}
          {...props}
        />
      </div>
      {error && <span style={{ fontSize: '12px', color: 'var(--danger)', marginTop: '2px' }}>{error}</span>}
    </div>
  );
};

// Textarea
export const Textarea = ({
  label,
  placeholder = '',
  value,
  onChange,
  disabled = false,
  rows = 4,
  error = '',
  className = '',
  id,
  ...props
}) => {
  const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }} className={className}>
      {label && (
        <label
          htmlFor={textareaId}
          style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)' }}
        >
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        rows={rows}
        style={{
          width: '100%',
          padding: '10px 12px',
          fontSize: '14px',
          backgroundColor: 'var(--bg-card)',
          color: 'var(--text-primary)',
          border: `1px solid ${error ? 'var(--danger)' : 'var(--border-color)'}`,
          borderRadius: 'var(--radius-md)',
          outline: 'none',
          resize: 'vertical',
          transition: 'border-color var(--transition-fast), box-shadow var(--transition-fast)',
        }}
        onFocus={(e) => {
          e.target.style.borderColor = 'var(--primary)';
          e.target.style.boxShadow = '0 0 0 3px var(--primary-light)';
        }}
        onBlur={(e) => {
          e.target.style.borderColor = error ? 'var(--danger)' : 'var(--border-color)';
          e.target.style.boxShadow = 'none';
        }}
        {...props}
      />
      {error && <span style={{ fontSize: '12px', color: 'var(--danger)', marginTop: '2px' }}>{error}</span>}
    </div>
  );
};

// Dropdown / Select
export const Select = ({
  label,
  value,
  onChange,
  options = [], // [{ value: 'x', label: 'X' }] or ['A', 'B']
  disabled = false,
  error = '',
  className = '',
  id,
  ...props
}) => {
  const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }} className={className}>
      {label && (
        <label
          htmlFor={selectId}
          style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)' }}
        >
          {label}
        </label>
      )}
      <select
        id={selectId}
        value={value}
        onChange={onChange}
        disabled={disabled}
        style={{
          width: '100%',
          padding: '10px 12px',
          fontSize: '14px',
          backgroundColor: 'var(--bg-card)',
          color: 'var(--text-primary)',
          border: `1px solid ${error ? 'var(--danger)' : 'var(--border-color)'}`,
          borderRadius: 'var(--radius-md)',
          outline: 'none',
          cursor: 'pointer',
          appearance: 'none',
          backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 12px center',
          backgroundSize: '16px',
          paddingRight: '36px',
          transition: 'border-color var(--transition-fast), box-shadow var(--transition-fast)',
        }}
        onFocus={(e) => {
          e.target.style.borderColor = 'var(--primary)';
          e.target.style.boxShadow = '0 0 0 3px var(--primary-light)';
        }}
        onBlur={(e) => {
          e.target.style.borderColor = error ? 'var(--danger)' : 'var(--border-color)';
          e.target.style.boxShadow = 'none';
        }}
        {...props}
      >
        {options.map((opt, i) => {
          const val = typeof opt === 'object' ? opt.value : opt;
          const lbl = typeof opt === 'object' ? opt.label : opt;
          return (
            <option key={i} value={val} style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}>
              {lbl}
            </option>
          );
        })}
      </select>
      {error && <span style={{ fontSize: '12px', color: 'var(--danger)', marginTop: '2px' }}>{error}</span>}
    </div>
  );
};

// Scrollable Dropdown / Select
export const ScrollableSelect = ({
  label,
  value,
  onChange,
  options = [], // [{ value: 'x', label: 'X' }] or ['A', 'B']
  disabled = false,
  error = '',
  className = '',
  id,
  onScrollEnd,
  isLoading = false,
  ...props
}) => {
  const selectId = id || `scroll-select-${Math.random().toString(36).substr(2, 9)}`;
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleScroll = (e) => {
    const { scrollTop, clientHeight, scrollHeight } = e.target;
    if (scrollHeight - scrollTop <= clientHeight + 20) {
      if (onScrollEnd && !isLoading) {
        onScrollEnd();
      }
    }
  };

  const displayValue = options.find(opt => (typeof opt === 'object' ? opt.value : opt) === value) || value;
  const displayLabel = typeof displayValue === 'object' ? displayValue.label : displayValue;

  return (
    <div ref={containerRef} style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%', position: 'relative' }} className={className}>
      {label && (
        <label
          htmlFor={selectId}
          style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)' }}
        >
          {label}
        </label>
      )}
      <div
        id={selectId}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        style={{
          width: '100%',
          padding: '10px 12px',
          fontSize: '14px',
          color: 'var(--text-primary)',
          backgroundColor: 'var(--bg-input)',
          border: `1px solid ${error ? 'var(--danger)' : 'var(--border-color)'}`,
          borderRadius: '8px',
          cursor: disabled ? 'not-allowed' : 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          userSelect: 'none'
        }}
        {...props}
      >
        <span>{displayLabel || 'Select...'}</span>
        <span style={{ fontSize: '10px', transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▼</span>
      </div>
      
      {isOpen && (
        <ul
          onScroll={handleScroll}
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            maxHeight: '200px',
            overflowY: 'auto',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            marginTop: '4px',
            padding: '4px 0',
            listStyle: 'none',
            zIndex: 1000,
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}
        >
          {options.map((opt, i) => {
            const val = typeof opt === 'object' ? opt.value : opt;
            const lbl = typeof opt === 'object' ? opt.label : opt;
            return (
              <li
                key={i}
                onClick={() => {
                  onChange({ target: { value: val } });
                  setIsOpen(false);
                }}
                style={{
                  padding: '8px 12px',
                  cursor: 'pointer',
                  backgroundColor: value === val ? 'var(--primary-light)' : 'transparent',
                  color: 'var(--text-primary)'
                }}
                onMouseEnter={(e) => {
                  if (value !== val) e.target.style.backgroundColor = 'var(--bg-hover)';
                }}
                onMouseLeave={(e) => {
                  if (value !== val) e.target.style.backgroundColor = 'transparent';
                }}
              >
                {lbl}
              </li>
            );
          })}
          {isLoading && <li style={{ padding: '8px 12px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '12px' }}>Loading...</li>}
          {!isLoading && options.length === 0 && <li style={{ padding: '8px 12px', textAlign: 'center', color: 'var(--text-secondary)' }}>No options</li>}
        </ul>
      )}
      {error && <span style={{ fontSize: '12px', color: 'var(--danger)', marginTop: '2px' }}>{error}</span>}
    </div>
  );
};
// Checkbox
export const Checkbox = ({
  label,
  checked,
  onChange,
  disabled = false,
  className = '',
  ...props
}) => {
  return (
    <label
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontSize: '14px',
        userSelect: 'none',
        color: 'var(--text-primary)',
      }}
      className={className}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        style={{
          width: '18px',
          height: '18px',
          borderRadius: '4px',
          border: '1px solid var(--border-color)',
          appearance: 'none',
          outline: 'none',
          backgroundColor: checked ? 'var(--primary)' : 'var(--bg-card)',
          backgroundImage: checked
            ? `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='20 6 9 17 4 12'/%3E%3C/svg%3E")`
            : 'none',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          backgroundSize: '12px',
          cursor: 'pointer',
          transition: 'all var(--transition-fast)',
        }}
        {...props}
      />
      {label}
    </label>
  );
};

// Toggle / Switch
export const Switch = ({
  label,
  checked,
  onChange,
  disabled = false,
  className = '',
  ...props
}) => {
  return (
    <label
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontSize: '14px',
        userSelect: 'none',
        width: '100%',
      }}
      className={className}
    >
      {label && <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>{label}</span>}
      <div style={{ position: 'relative', display: 'inline-block', width: '40px', height: '22px' }}>
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          style={{ opacity: 0, width: 0, height: 0 }}
          {...props}
        />
        <span
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: checked ? 'var(--primary)' : 'var(--secondary)',
            opacity: checked ? 1 : 0.4,
            borderRadius: '24px',
            transition: '0.2s',
          }}
        />
        <span
          style={{
            position: 'absolute',
            height: '16px',
            width: '16px',
            left: checked ? '20px' : '4px',
            bottom: '3px',
            backgroundColor: 'white',
            borderRadius: '50%',
            transition: '0.2s',
            boxShadow: 'var(--shadow-sm)',
          }}
        />
      </div>
    </label>
  );
};

// Radio Button
export const Radio = ({
  label,
  name,
  value,
  checked,
  onChange,
  disabled = false,
  className = '',
  ...props
}) => {
  return (
    <label
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontSize: '14px',
        color: 'var(--text-primary)',
        userSelect: 'none',
      }}
      className={className}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        style={{
          width: '18px',
          height: '18px',
          borderRadius: '50%',
          border: `1px solid ${checked ? 'var(--primary)' : 'var(--border-color)'}`,
          appearance: 'none',
          outline: 'none',
          backgroundColor: 'var(--bg-card)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all var(--transition-fast)',
        }}
        {...props}
      />
      {checked && (
        <span
          style={{
            position: 'absolute',
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            backgroundColor: 'var(--primary)',
            pointerEvents: 'none',
          }}
        />
      )}
      {label}
    </label>
  );
};
export default Input;
// MultiSelect
export const MultiSelect = ({
  label,
  value = [],
  onChange,
  options = [], 
  disabled = false,
  error = '',
  className = '',
  id,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOption = (optValue) => {
    if (disabled) return;
    const current = Array.isArray(value) ? value : [];
    if (current.includes(optValue)) {
      onChange(current.filter(v => v !== optValue));
    } else {
      onChange([...current, optValue]);
    }
  };

  const selectedLabels = options
    .filter(opt => {
      const val = typeof opt === 'object' ? opt.value : opt;
      return (Array.isArray(value) ? value : []).includes(val);
    })
    .map(opt => (typeof opt === 'object' ? opt.label : opt));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%', position: 'relative' }} className={className} ref={dropdownRef}>
      {label && (
        <label style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)' }}>
          {label}
        </label>
      )}
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        style={{
          width: '100%',
          padding: '8px 12px',
          minHeight: '40px',
          fontSize: '14px',
          backgroundColor: disabled ? 'var(--bg-muted)' : 'var(--bg-card)',
          color: 'var(--text-primary)',
          border: '1px solid ' + (error ? 'var(--danger)' : 'var(--border-color)'),
          borderRadius: 'var(--radius-md)',
          cursor: disabled ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '4px',
          backgroundImage: 'url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\\\'http://www.w3.org/2000/svg\\\' viewBox=\\\'0 0 24 24\\\' fill=\\\'none\\\' stroke=\\\'%2364748b\\\' stroke-width=\\\'2\\\' stroke-linecap=\\\'round\\\' stroke-linejoin=\\\'round\\\'%3E%3Cpolyline points=\\\'6 9 12 15 18 9\\\'/%3E%3C/svg%3E")',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 12px center',
          backgroundSize: '16px',
          paddingRight: '36px',
        }}
      >
        {selectedLabels.length > 0 ? (
          selectedLabels.map((lbl, idx) => (
            <span key={idx} style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '500', whiteSpace: 'nowrap' }}>
              {lbl}
            </span>
          ))
        ) : (
          <span style={{ color: 'var(--text-muted)' }}>Select options...</span>
        )}
      </div>
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          marginTop: '4px',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          maxHeight: '200px',
          overflowY: 'auto',
          zIndex: 10,
          padding: '4px'
        }}>
          {options.length > 0 ? options.map((opt, i) => {
            const val = typeof opt === 'object' ? opt.value : opt;
            const lbl = typeof opt === 'object' ? opt.label : opt;
            const isChecked = (Array.isArray(value) ? value : []).includes(val);
            return (
              <div
                key={i}
                onClick={() => toggleOption(val)}
                style={{
                  padding: '8px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  borderRadius: '4px',
                  backgroundColor: isChecked ? 'var(--primary-light)' : 'transparent',
                }}
                onMouseEnter={(e) => !isChecked && (e.currentTarget.style.backgroundColor = 'var(--bg-muted)')}
                onMouseLeave={(e) => !isChecked && (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <input type="checkbox" checked={isChecked} readOnly style={{ accentColor: 'var(--primary)', cursor: 'pointer' }} />
                <span style={{ fontSize: '14px', color: isChecked ? 'var(--primary)' : 'var(--text-primary)', fontWeight: isChecked ? '600' : '400' }}>{lbl}</span>
              </div>
            );
          }) : (
            <div style={{ padding: '8px 12px', fontSize: '13px', color: 'var(--text-muted)' }}>No options available</div>
          )}
        </div>
      )}
      {error && <span style={{ fontSize: '12px', color: 'var(--danger)', marginTop: '2px' }}>{error}</span>}
    </div>
  );
};
