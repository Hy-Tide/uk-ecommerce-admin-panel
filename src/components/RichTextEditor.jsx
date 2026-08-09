import React, { useRef, useEffect } from 'react';
import { Bold, Italic, Underline, List, ListOrdered, RemoveFormatting } from 'lucide-react';

export const RichTextEditor = ({
  label,
  value = '',
  onChange,
  placeholder = 'Write content here...',
  required = false,
  minHeight = '100px',
  error = '',
  className = ''
}) => {
  const editorRef = useRef(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      if (!editorRef.current.innerHTML && !value) {
        editorRef.current.innerHTML = '';
      } else if (document.activeElement !== editorRef.current) {
        editorRef.current.innerHTML = value || '';
      }
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current && onChange) {
      const html = editorRef.current.innerHTML;
      const cleanHtml = (html === '<br>' || html === '<p><br></p>') ? '' : html;
      onChange(cleanHtml);
    }
  };

  const execCmd = (command, arg = null) => {
    document.execCommand(command, false, arg);
    if (editorRef.current) {
      editorRef.current.focus();
      handleInput();
    }
  };

  const isEditorEmpty = !value || value === '<br>' || value === '<p><br></p>';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }} className={className}>
      {label && (
        <label style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)' }}>
          {label} {required && <span style={{ color: 'var(--danger)' }}>*</span>}
        </label>
      )}

      <div
        style={{
          border: `1px solid ${error ? 'var(--danger)' : 'var(--border-color)'}`,
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--bg-card)',
          overflow: 'hidden',
          transition: 'border-color var(--transition-fast), box-shadow var(--transition-fast)'
        }}
      >
        {/* Formatting Toolbar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '6px 10px',
            backgroundColor: 'var(--bg-app)',
            borderBottom: '1px solid var(--border-color)',
            flexWrap: 'wrap'
          }}
        >
          {/* Font Style Header Selector */}
          <select
            onChange={(e) => {
              if (e.target.value) {
                execCmd('formatBlock', e.target.value);
                e.target.value = '';
              }
            }}
            style={{
              fontSize: '12px',
              padding: '3px 6px',
              borderRadius: '4px',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-card)',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              outline: 'none'
            }}
            defaultValue=""
          >
            <option value="" disabled>Font Style</option>
            <option value="p">Normal text</option>
            <option value="h3">Heading 1</option>
            <option value="h4">Heading 2</option>
            <option value="blockquote">Quote block</option>
          </select>

          <div style={{ width: '1px', height: '18px', backgroundColor: 'var(--border-color)', margin: '0 4px' }} />

          {/* Bold */}
          <button
            type="button"
            onClick={() => execCmd('bold')}
            title="Bold (Ctrl+B)"
            style={{
              background: 'none',
              border: 'none',
              borderRadius: '4px',
              padding: '4px 6px',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
            onMouseDown={(e) => e.preventDefault()}
          >
            <Bold size={15} />
          </button>

          {/* Italic */}
          <button
            type="button"
            onClick={() => execCmd('italic')}
            title="Italic (Ctrl+I)"
            style={{
              background: 'none',
              border: 'none',
              borderRadius: '4px',
              padding: '4px 6px',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
            onMouseDown={(e) => e.preventDefault()}
          >
            <Italic size={15} />
          </button>

          {/* Underline */}
          <button
            type="button"
            onClick={() => execCmd('underline')}
            title="Underline (Ctrl+U)"
            style={{
              background: 'none',
              border: 'none',
              borderRadius: '4px',
              padding: '4px 6px',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
            onMouseDown={(e) => e.preventDefault()}
          >
            <Underline size={15} />
          </button>

          <div style={{ width: '1px', height: '18px', backgroundColor: 'var(--border-color)', margin: '0 4px' }} />

          {/* Bullet / Dot List */}
          <button
            type="button"
            onClick={() => execCmd('insertUnorderedList')}
            title="Dot List / Bullet List (•)"
            style={{
              background: 'none',
              border: 'none',
              borderRadius: '4px',
              padding: '4px 6px',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
            onMouseDown={(e) => e.preventDefault()}
          >
            <List size={15} />
          </button>

          {/* Numbered List */}
          <button
            type="button"
            onClick={() => execCmd('insertOrderedList')}
            title="Numbered List"
            style={{
              background: 'none',
              border: 'none',
              borderRadius: '4px',
              padding: '4px 6px',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
            onMouseDown={(e) => e.preventDefault()}
          >
            <ListOrdered size={15} />
          </button>

          <div style={{ width: '1px', height: '18px', backgroundColor: 'var(--border-color)', margin: '0 4px' }} />

          {/* Clear Formatting */}
          <button
            type="button"
            onClick={() => execCmd('removeFormat')}
            title="Clear Formatting"
            style={{
              background: 'none',
              border: 'none',
              borderRadius: '4px',
              padding: '4px 6px',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
            onMouseDown={(e) => e.preventDefault()}
          >
            <RemoveFormatting size={15} />
          </button>
        </div>

        {/* Editable Area */}
        <div style={{ position: 'relative' }}>
          {isEditorEmpty && (
            <div
              style={{
                position: 'absolute',
                left: '12px',
                top: '10px',
                color: 'var(--text-muted)',
                fontSize: '13px',
                pointerEvents: 'none',
                userSelect: 'none'
              }}
            >
              {placeholder}
            </div>
          )}
          <div
            ref={editorRef}
            contentEditable
            onInput={handleInput}
            onBlur={handleInput}
            style={{
              padding: '10px 12px',
              minHeight: minHeight,
              outline: 'none',
              color: 'var(--text-primary)',
              fontSize: '14px',
              lineHeight: '1.5',
              overflowY: 'auto'
            }}
          />
        </div>
      </div>
      {error && <span style={{ fontSize: '12px', color: 'var(--danger)', marginTop: '2px' }}>{error}</span>}
    </div>
  );
};

export default RichTextEditor;
