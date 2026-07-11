import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, EyeOff, SlidersHorizontal } from 'lucide-react';
import Button from './Button';

export const Table = ({
  columns = [], // [{ key: 'name', label: 'Name', sortable: true, render: (row) => ... }]
  data = [],
  loading = false,
  emptyState = null,
  selectable = false,
  selectedKeys = [],
  onSelectAll = () => {},
  onSelectRow = () => {},
  idKey = 'id',
  initialRowsPerPage = 5,
  rowsPerPageOptions = [5, 10, 25, 50],
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage);
  const [visibleColumns, setVisibleColumns] = useState(columns.map(c => c.key));
  const [showColDropdown, setShowColDropdown] = useState(false);

  // Pagination logic
  const totalItems = data.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / rowsPerPage));
  const indexOfLastItem = currentPage * rowsPerPage;
  const indexOfFirstItem = indexOfLastItem - rowsPerPage;
  const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
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
    if (visibleColumns.includes(colKey)) {
      if (visibleColumns.length > 1) {
        setVisibleColumns(visibleColumns.filter(k => k !== colKey));
      }
    } else {
      setVisibleColumns([...visibleColumns, colKey]);
    }
  };

  const isAllCurrentSelected =
    currentItems.length > 0 &&
    currentItems.every(item => selectedKeys.includes(item[idKey]));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
      {/* Table Toolbar controls */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', position: 'relative' }}>
        <Button
          variant="outline"
          size="sm"
          icon={SlidersHorizontal}
          onClick={() => setShowColDropdown(!showColDropdown)}
        >
          Columns
        </Button>
        {showColDropdown && (
          <div
            style={{
              position: 'absolute',
              top: '38px',
              right: 0,
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-lg)',
              padding: '12px',
              zIndex: 10,
              minWidth: '180px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}
          >
            <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-muted)', marginBottom: '4px' }}>Toggle Columns</div>
            {columns.map(col => (
              <label
                key={col.key}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '13px',
                  cursor: 'pointer',
                  color: 'var(--text-primary)'
                }}
              >
                <input
                  type="checkbox"
                  checked={visibleColumns.includes(col.key)}
                  onChange={() => toggleColumn(col.key)}
                  style={{
                    accentColor: 'var(--primary)',
                    cursor: 'pointer'
                  }}
                />
                {col.label}
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Actual Data Sheet */}
      <div
        style={{
          width: '100%',
          overflowX: 'auto',
          backgroundColor: 'var(--bg-card)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
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

      {/* Pagination controls */}
      {!loading && totalItems > 0 && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '13px',
            color: 'var(--text-secondary)',
            flexWrap: 'wrap',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>Show</span>
            <select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              style={{
                padding: '4px 8px',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-card)',
                color: 'var(--text-primary)',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              {rowsPerPageOptions.map(opt => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <span>entries</span>
            <span style={{ color: 'var(--text-muted)', marginLeft: '12px' }}>
              Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, totalItems)} of {totalItems} rows
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
              style={{ padding: '4px 8px' }}
            >
              <ChevronLeft size={16} />
            </Button>
            {Array.from({ length: totalPages }).map((_, idx) => {
              const pNum = idx + 1;
              const isCurrent = currentPage === pNum;
              return (
                <Button
                  key={idx}
                  variant={isCurrent ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => handlePageChange(pNum)}
                  style={{
                    minWidth: '28px',
                    padding: '4px 6px',
                    borderColor: isCurrent ? 'var(--primary)' : 'var(--border-color)'
                  }}
                >
                  {pNum}
                </Button>
              );
            })}
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
              style={{ padding: '4px 8px' }}
            >
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      )}
      <style>{`
        .table-row:hover {
          background-color: var(--bg-app);
        }
      `}</style>
    </div>
  );
};
export default Table;
