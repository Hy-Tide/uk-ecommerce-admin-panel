import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, EyeOff, SlidersHorizontal } from 'lucide-react';
import Button from './Button';

// ─── Standalone ColumnsToggle (can be placed anywhere in parent) ──────────────
export const ColumnsToggle = ({ columns, visibleColumns, onToggle }) => {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <Button variant="outline" size="sm" icon={SlidersHorizontal} onClick={() => setOpen(o => !o)}>
        Columns
      </Button>
      {open && (
        <div
          style={{
            position: 'absolute', top: '38px', right: 0,
            backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)',
            borderRadius: '10px', boxShadow: 'var(--shadow-lg)',
            padding: '12px', zIndex: 50, minWidth: '180px',
            display: 'flex', flexDirection: 'column', gap: '8px'
          }}
        >
          <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>Toggle Columns</div>
          {columns.filter(c => c.label).map(col => (
            <label key={col.key} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', color: 'var(--text-primary)' }}>
              <input
                type="checkbox"
                checked={visibleColumns.includes(col.key)}
                onChange={() => onToggle(col.key)}
                style={{ accentColor: 'var(--primary)', cursor: 'pointer' }}
              />
              {col.label}
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

export const Table = ({
  columns = [],
  data = [],
  loading = false,
  emptyState = null,
  selectable = false,
  selectedKeys = [],
  onSelectAll = () => { },
  onSelectRow = () => { },
  idKey = 'id',
  initialRowsPerPage = 5,
  rowsPerPageOptions = [5, 10, 25, 50],
  // External column visibility (optional — pass both or neither)
  externalVisibleColumns,
  onToggleColumn,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage);
  const [_internalVisible, _setInternalVisible] = useState(columns.map(c => c.key));
  const [showColDropdown, setShowColDropdown] = useState(false);

  // Use external or internal column visibility
  const visibleColumns = externalVisibleColumns ?? _internalVisible;
  const setVisibleColumns = onToggleColumn
    ? (fn) => { } // noop — caller manages state
    : _setInternalVisible;

  // Pagination
  const totalItems = data.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / rowsPerPage));
  const indexOfLastItem = currentPage * rowsPerPage;
  const indexOfFirstItem = indexOfLastItem - rowsPerPage;
  const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);

  // Auto reset page if totalPages shrinks below currentPage
  React.useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(Math.max(1, totalPages));
    }
  }, [data.length, totalPages, currentPage]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always include page 1
      pages.push(1);

      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);

      if (currentPage <= 3) {
        end = 4;
      } else if (currentPage >= totalPages - 2) {
        start = totalPages - 3;
      }

      if (start > 2) {
        pages.push('ellipsis-left');
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages - 1) {
        pages.push('ellipsis-right');
      }

      // Always include last page
      pages.push(totalPages);
    }
    return pages;
  };

  const handleSelectAllChange = (e) => {
    if (e.target.checked) {
      onSelectAll(currentItems.map(item => item[idKey]));
    } else {
      onSelectAll([]);
    }
  };

  const handleRowSelectChange = (key, checked) => {
    onSelectRow(key, checked);
  };

  const toggleColumn = (colKey) => {
    if (onToggleColumn) { onToggleColumn(colKey); return; }
    if (visibleColumns.includes(colKey)) {
      if (visibleColumns.length > 1) _setInternalVisible(visibleColumns.filter(k => k !== colKey));
    } else {
      _setInternalVisible([...visibleColumns, colKey]);
    }
  };

  const isAllCurrentSelected =
    currentItems.length > 0 &&
    currentItems.every(item => selectedKeys.includes(item[idKey]));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
      {/* Toolbar — only shown when using internal column control */}
      {!externalVisibleColumns && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', position: 'relative' }}>
          <Button variant="outline" size="sm" icon={SlidersHorizontal} onClick={() => setShowColDropdown(!showColDropdown)}>
            Columns
          </Button>
          {showColDropdown && (
            <div style={{ position: 'absolute', top: '38px', right: 0, backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)', padding: '12px', zIndex: 10, minWidth: '180px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-muted)', marginBottom: '4px' }}>Toggle Columns</div>
              {columns.map(col => (
                <label key={col.key} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', color: 'var(--text-primary)' }}>
                  <input type="checkbox" checked={visibleColumns.includes(col.key)} onChange={() => toggleColumn(col.key)} style={{ accentColor: 'var(--primary)', cursor: 'pointer' }} />
                  {col.label}
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Actual Data Sheet Wrapper Container */}
      <div
        style={{
          width: '100%',
          backgroundColor: 'var(--bg-card)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-sm)',
          overflow: 'hidden',
        }}
      >
        <div style={{ width: '100%', overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              textAlign: 'left',
              fontSize: '14px',
            }}
          >
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-app)' }}>
                {selectable && (
                  <th style={{ padding: '14px 16px', width: '48px' }}>
                    <input
                      type="checkbox"
                      checked={isAllCurrentSelected}
                      onChange={handleSelectAllChange}
                      style={{ accentColor: 'var(--primary)', cursor: 'pointer', width: '16px', height: '16px' }}
                    />
                  </th>
                )}
                {columns
                  .filter(col => visibleColumns.includes(col.key))
                  .map(col => (
                    <th
                      key={col.key}
                      style={{
                        padding: '14px 16px',
                        color: 'var(--text-secondary)',
                        fontWeight: '600',
                        letterSpacing: '-0.01em',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {col.label}
                    </th>
                  ))}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                // Skeleton rows
                Array.from({ length: rowsPerPage }).map((_, rIdx) => (
                  <tr key={rIdx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    {selectable && (
                      <td style={{ padding: '16px' }}>
                        <div className="skeleton" style={{ width: '16px', height: '16px' }} />
                      </td>
                    )}
                    {columns
                      .filter(col => visibleColumns.includes(col.key))
                      .map((col, cIdx) => (
                        <td key={cIdx} style={{ padding: '16px' }}>
                          <div className="skeleton" style={{ width: cIdx === 0 ? '140px' : '80px', height: '14px' }} />
                        </td>
                      ))}
                  </tr>
                ))
              ) : currentItems.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + (selectable ? 1 : 0)}
                    style={{ padding: '48px 16px', textAlign: 'center' }}
                  >
                    {emptyState || (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                        <EyeOff size={32} style={{ color: 'var(--text-muted)' }} />
                        <div style={{ color: 'var(--text-primary)', fontWeight: '500' }}>No records found</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Try adjusting your search query or filters.</div>
                      </div>
                    )}
                  </td>
                </tr>
              ) : (
                currentItems.map((row, rIdx) => {
                  const rowKey = row[idKey];
                  const isSelected = selectedKeys.includes(rowKey);

                  return (
                    <tr
                      key={rowKey || rIdx}
                      style={{
                        borderBottom: '1px solid var(--border-color)',
                        backgroundColor: isSelected ? 'var(--primary-light)' : 'transparent',
                        transition: 'background-color var(--transition-fast)',
                      }}
                      className="table-row"
                    >
                      {selectable && (
                        <td style={{ padding: '14px 16px' }}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => handleRowSelectChange(rowKey, e.target.checked)}
                            style={{ accentColor: 'var(--primary)', cursor: 'pointer', width: '16px', height: '16px' }}
                          />
                        </td>
                      )}
                      {columns
                        .filter(col => visibleColumns.includes(col.key))
                        .map(col => (
                          <td
                            key={col.key}
                            style={{
                              padding: '14px 16px',
                              color: 'var(--text-primary)',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {col.render ? col.render(row) : row[col.key]}
                          </td>
                        ))}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Cohesive Pagination & Rows selector footer inside the card wrapper */}
        {!loading && totalItems > 0 && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 18px',
              borderTop: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-card-alt)',
              fontSize: '13px',
              color: 'var(--text-secondary)',
              flexWrap: 'wrap',
              gap: '12px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span>Show</span>
              <select
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                style={{
                  padding: '5px 8px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-card)',
                  color: 'var(--text-primary)',
                  fontSize: '12px',
                  fontWeight: '500',
                  outline: 'none',
                  cursor: 'pointer',
                  transition: 'border-color var(--transition-fast)'
                }}
              >
                {rowsPerPageOptions.map(opt => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <span>rows</span>
              <span style={{ color: 'var(--text-muted)', marginLeft: '12px' }}>
                Showing <strong style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{indexOfFirstItem + 1}</strong> to <strong style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{Math.min(indexOfLastItem, totalItems)}</strong> of <strong style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{totalItems}</strong> entries
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
                style={{
                  width: '32px',
                  height: '32px',
                  padding: 0,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ChevronLeft size={16} />
              </Button>

              {getPageNumbers().map((page, idx) => {
                if (page === 'ellipsis-left' || page === 'ellipsis-right') {
                  return (
                    <span
                      key={`ellipsis-${idx}`}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minWidth: '32px',
                        height: '32px',
                        color: 'var(--text-muted)',
                        fontSize: '13px',
                        fontWeight: '600',
                        letterSpacing: '1px',
                        userSelect: 'none',
                      }}
                    >
                      •••
                    </span>
                  );
                }

                const isCurrent = currentPage === page;
                return (
                  <Button
                    key={page}
                    variant={isCurrent ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => handlePageChange(page)}
                    style={{
                      minWidth: '32px',
                      height: '32px',
                      padding: '0 6px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: isCurrent ? '600' : '500',
                      borderColor: isCurrent ? 'var(--primary)' : 'var(--border-color)',
                      borderRadius: 'var(--radius-sm)',
                    }}
                  >
                    {page}
                  </Button>
                );
              })}

              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
                style={{
                  width: '32px',
                  height: '32px',
                  padding: 0,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .table-row:hover {
          background-color: var(--bg-app);
        }
      `}</style>
    </div>
  );
};
export default Table;
