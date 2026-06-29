import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

export interface Column<T> {
  key: string;
  header: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
  width?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyState?: React.ReactNode;
  
  // Sort
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (field: string, direction: 'asc' | 'desc') => void;

  // Pagination
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  pageSize?: number;
  totalCount?: number;

  // Selectable row support
  selectable?: boolean;
  selectedIds?: string[];
  onSelectChange?: (selectedIds: string[]) => void;
  getRowId?: (item: T) => string;
}

export default function DataTable<T>({
  columns,
  data,
  loading = false,
  emptyState,
  sortField,
  sortDirection,
  onSort,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  pageSize = 20,
  totalCount = 0,
  selectable = false,
  selectedIds = [],
  onSelectChange,
  getRowId,
}: DataTableProps<T>) {
  
  const handleSort = (column: Column<T>) => {
    if (!column.sortable || !onSort) return;
    let nextDirection: 'asc' | 'desc' = 'asc';
    if (sortField === column.key && sortDirection === 'asc') {
      nextDirection = 'desc';
    }
    onSort(column.key, nextDirection);
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!onSelectChange || !getRowId) return;
    if (e.target.checked) {
      const allIds = data.map(item => getRowId(item));
      onSelectChange(allIds);
    } else {
      onSelectChange([]);
    }
  };

  const handleSelectRow = (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
    if (!onSelectChange) return;
    if (e.target.checked) {
      onSelectChange([...selectedIds, id]);
    } else {
      onSelectChange(selectedIds.filter(item => item !== id));
    }
  };

  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalCount || data.length);

  return (
    <div className="admin-table-wrapper">
      <table className="admin-table">
        <thead>
          <tr>
            {selectable && (
              <th style={{ width: '40px', paddingLeft: '16px' }}>
                <input
                  type="checkbox"
                  className="admin-checkbox"
                  onChange={handleSelectAll}
                  checked={data.length > 0 && selectedIds.length === data.length}
                />
              </th>
            )}
            {columns.map((column) => (
              <th
                key={column.key}
                className={column.sortable ? 'sortable' : ''}
                onClick={() => handleSort(column)}
                style={{ width: column.width }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>{column.header}</span>
                  {column.sortable && sortField === column.key ? (
                    sortDirection === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />
                  ) : column.sortable ? (
                    <ArrowUpDown size={12} style={{ opacity: 0.4 }} />
                  ) : null}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            Array.from({ length: 5 }).map((_, rowIndex) => (
              <tr key={rowIndex}>
                {selectable && <td style={{ paddingLeft: '16px' }}><div style={{ width: '16px', height: '16px', background: '#e5e7eb', borderRadius: '4px' }} className="animate-pulse" /></td>}
                {columns.map((col, colIndex) => (
                  <td key={colIndex}>
                    <div style={{ width: col.width || '100%', height: '16px', background: '#e5e7eb', borderRadius: '4px' }} className="animate-pulse" />
                  </td>
                ))}
              </tr>
            ))
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length + (selectable ? 1 : 0)} style={{ padding: 0 }}>
                {emptyState || (
                  <div className="admin-empty">
                    <div className="admin-empty-title">No entries found</div>
                    <div className="admin-empty-desc">There are no records matching this query.</div>
                  </div>
                )}
              </td>
            </tr>
          ) : (
            data.map((item, rowIndex) => {
              const id = getRowId ? getRowId(item) : String(rowIndex);
              const isSelected = selectedIds.includes(id);
              return (
                <tr key={id} style={{ backgroundColor: isSelected ? 'var(--admin-accent-light)' : undefined }}>
                  {selectable && (
                    <td style={{ paddingLeft: '16px' }}>
                      <input
                        type="checkbox"
                        className="admin-checkbox"
                        checked={isSelected}
                        onChange={(e) => handleSelectRow(e, id)}
                      />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td key={col.key}>
                      {col.render ? col.render(item) : (item as any)[col.key]}
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      {totalPages > 1 && onPageChange && (
        <div className="admin-pagination">
          <div>
            Showing <span style={{ fontWeight: 600 }}>{startIndex}</span> to{' '}
            <span style={{ fontWeight: 600 }}>{endIndex}</span> of{' '}
            <span style={{ fontWeight: 600 }}>{totalCount || data.length}</span> results
          </div>
          <div className="admin-pagination-buttons">
            <button
              className="admin-pagination-btn"
              onClick={() => onPageChange(1)}
              disabled={currentPage === 1 || loading}
              title="First page"
            >
              <ChevronsLeft size={14} />
            </button>
            <button
              className="admin-pagination-btn"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1 || loading}
              title="Previous page"
            >
              <ChevronLeft size={14} />
            </button>
            <span style={{ margin: '0 8px', fontSize: '13px' }}>
              Page {currentPage} of {totalPages}
            </span>
            <button
              className="admin-pagination-btn"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages || loading}
              title="Next page"
            >
              <ChevronRight size={14} />
            </button>
            <button
              className="admin-pagination-btn"
              onClick={() => onPageChange(totalPages)}
              disabled={currentPage === totalPages || loading}
              title="Last page"
            >
              <ChevronsRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
