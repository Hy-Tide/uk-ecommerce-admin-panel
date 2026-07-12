import React, { useState, useMemo } from 'react';
import { Edit, Trash2, Copy, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import Button from './Button';

export const GridView = ({
  data = [],
  idKey = 'id',
  imageKey = 'image',
  titleKey = 'name',
  subtitleKey = 'description',
  statusKey = 'status',
  createdKey = 'createdDate',
  updatedKey = 'updatedDate',
  
  // Custom renderers
  renderImage,
  renderTitle,
  renderSubtitle,
  renderStatus,
  renderActions,
  
  // Callbacks
  onEdit,
  onDelete,
  onDuplicate,
  onView,
  
  // Pagination
  initialRowsPerPage = 8,
  rowsPerPageOptions = [8, 16, 32, 64]
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage);

  // Reset page if data changes or shrinks
  const totalPages = Math.ceil(data.length / rowsPerPage) || 1;
  const activePage = Math.min(currentPage, totalPages);

  const paginatedData = useMemo(() => {
    const start = (activePage - 1) * rowsPerPage;
    return data.slice(start, start + rowsPerPage);
  }, [data, activePage, rowsPerPage]);

  const getFieldValue = (item, key, fallback = '') => {
    if (!key || !item) return fallback;
    if (typeof key === 'function') return key(item);
    return item[key] !== undefined ? item[key] : fallback;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Grid container */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '20px'
      }}>
        {paginatedData.map((item) => {
          const id = item[idKey];
          const title = getFieldValue(item, titleKey, 'Untitled');
          const subtitle = getFieldValue(item, subtitleKey);
          const status = getFieldValue(item, statusKey);
          const created = getFieldValue(item, createdKey);
          const updated = getFieldValue(item, updatedKey);

          return (
            <div
              key={id}
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: 'var(--shadow-sm)',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                e.currentTarget.style.borderColor = 'var(--primary)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                e.currentTarget.style.borderColor = 'var(--border-color)';
              }}
            >
              {/* Image/Icon Header */}
              <div style={{
                height: '160px',
                backgroundColor: 'var(--bg-app)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                borderBottom: '1px solid var(--border-color)',
                overflow: 'hidden'
              }}>
                {renderImage ? (
                  renderImage(item)
                ) : (
                  (() => {
                    const imgSrc = getFieldValue(item, imageKey);
                    if (imgSrc && (typeof imgSrc === 'string' && (imgSrc.startsWith('http') || imgSrc.startsWith('data:')))) {
                      return <img src={imgSrc} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />;
                    }
                    return (
                      <div style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '16px',
                        backgroundColor: 'var(--primary-light)',
                        color: 'var(--primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '24px',
                        fontWeight: '800'
                      }}>
                        {title.charAt(0).toUpperCase()}
                      </div>
                    );
                  })()
                )}

                {/* Status Overlay */}
                <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
                  {renderStatus ? (
                    renderStatus(item)
                  ) : (
                    status && (
                      <span style={{
                        backgroundColor: status === 'Active' || status === 'Published' || status === 'Paid' ? 'var(--success-light)' : 'var(--secondary-light)',
                        color: status === 'Active' || status === 'Published' || status === 'Paid' ? 'var(--success)' : 'var(--secondary)',
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '11px',
                        fontWeight: '700'
                      }}>
                        {status}
                      </span>
                    )
                  )}
                </div>
              </div>

              {/* Body */}
              <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>
                  {renderTitle ? renderTitle(item) : title}
                </div>

                {subtitle && (
                  <div style={{
                    fontSize: '12px',
                    color: 'var(--text-secondary)',
                    lineHeight: '1.4',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    minHeight: '34px'
                  }}>
                    {renderSubtitle ? renderSubtitle(item) : subtitle}
                  </div>
                )}

                {/* Dates */}
                {(created || updated) && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: 'auto', paddingTop: '8px', borderTop: '1px solid var(--border-color)', fontSize: '10px', color: 'var(--text-muted)' }}>
                    {created && <div>Created: {new Date(created).toLocaleDateString()}</div>}
                    {updated && <div>Updated: {new Date(updated).toLocaleDateString()}</div>}
                  </div>
                )}
              </div>

              {/* Actions Footer */}
              <div style={{
                padding: '12px 16px',
                borderTop: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-card-alt)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '8px'
              }}>
                {renderActions ? (
                  renderActions(item)
                ) : (
                  <>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {onView && (
                        <button
                          onClick={() => onView(item)}
                          title="View details"
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '8px',
                            border: 'none',
                            backgroundColor: 'transparent',
                            color: 'var(--text-secondary)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'background 0.2s'
                          }}
                          onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--secondary-light)'}
                          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          <Eye size={14} />
                        </button>
                      )}
                      {onDuplicate && (
                        <button
                          onClick={() => onDuplicate(item)}
                          title="Duplicate"
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '8px',
                            border: 'none',
                            backgroundColor: 'transparent',
                            color: 'var(--text-secondary)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'background 0.2s'
                          }}
                          onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--secondary-light)'}
                          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          <Copy size={14} />
                        </button>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '6px' }}>
                      {onEdit && (
                        <Button variant="outline" size="sm" onClick={() => onEdit(item)}>
                          Edit
                        </Button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(item)}
                          title="Delete"
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '8px',
                            border: 'none',
                            backgroundColor: 'transparent',
                            color: 'var(--danger)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'background 0.2s'
                          }}
                          onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--danger-light)'}
                          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination controls */}
      {data.length > rowsPerPage && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 0',
          borderTop: '1px solid var(--border-color)',
          marginTop: '8px'
        }}>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Showing <strong>{((activePage - 1) * rowsPerPage) + 1}</strong> to <strong>{Math.min(activePage * rowsPerPage, data.length)}</strong> of <strong>{data.length}</strong> items
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <select
              value={rowsPerPage}
              onChange={e => {
                setRowsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              style={{
                padding: '6px 10px',
                fontSize: '12px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-card)',
                color: 'var(--text-primary)',
                cursor: 'pointer'
              }}
            >
              {rowsPerPageOptions.map(o => (
                <option key={o} value={o}>{o} per page</option>
              ))}
            </select>

            <div style={{ display: 'flex', gap: '4px' }}>
              <button
                disabled={activePage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-card)',
                  color: 'var(--text-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: activePage === 1 ? 'not-allowed' : 'pointer',
                  opacity: activePage === 1 ? 0.5 : 1
                }}
              >
                <ChevronLeft size={16} />
              </button>
              <button
                disabled={activePage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-card)',
                  color: 'var(--text-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: activePage === totalPages ? 'not-allowed' : 'pointer',
                  opacity: activePage === totalPages ? 0.5 : 1
                }}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GridView;
