import React, { useState, useMemo } from 'react';

export interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  sortType?: 'string' | 'number' | 'date';
  render?: (item: T) => React.ReactNode;
  getValue?: (item: T) => any;
  headerStyle?: React.CSSProperties;
  cellStyle?: React.CSSProperties;
}

export interface TableSelectFilter<T> {
  id: string;
  label: string;
  options: { label: string; value: string }[];
  filterFn: (item: T, selectedValue: string) => boolean;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchPlaceholder?: string;
  searchFields?: string[];
  getSearchValue?: (item: T) => string;
  selectFilters?: TableSelectFilter<T>[];
  enableDateRangeFilter?: boolean;
  getDateValue?: (item: T) => string | undefined;
  defaultSortKey?: string;
  defaultSortOrder?: 'asc' | 'desc';
  pageSizeOptions?: number[];
  defaultPageSize?: number;
  emptyMessage?: string;
  keyExtractor: (item: T, index: number) => string | number;
  extraHeaderActions?: React.ReactNode;
  loading?: boolean;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  searchPlaceholder = 'Buscar...',
  getSearchValue,
  selectFilters = [],
  enableDateRangeFilter = false,
  getDateValue,
  defaultSortKey,
  defaultSortOrder = 'asc',
  pageSizeOptions = [5, 10, 25, 50],
  defaultPageSize = 10,
  emptyMessage = 'No se encontraron registros',
  keyExtractor,
  extraHeaderActions,
  loading = false,
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [sortKey, setSortKey] = useState<string | undefined>(defaultSortKey);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(defaultSortOrder);
  const [pageSize, setPageSize] = useState<number>(defaultPageSize);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Check if any filter is active
  const hasActiveFilters = useMemo(() => {
    if (searchTerm.trim()) return true;
    if (startDate || endDate) return true;
    return Object.values(filterValues).some((val) => Boolean(val));
  }, [searchTerm, startDate, endDate, filterValues]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setFilterValues({});
    setStartDate('');
    setEndDate('');
  };

  // Filtered data based on search, select filters & date range
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      // 1. Text Search Filter
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        let matchesSearch = false;
        if (getSearchValue) {
          matchesSearch = getSearchValue(item).toLowerCase().includes(term);
        } else {
          matchesSearch = columns.some((col) => {
            const val = col.getValue ? col.getValue(item) : item[col.key];
            if (val === null || val === undefined) return false;
            return String(val).toLowerCase().includes(term);
          });
        }
        if (!matchesSearch) return false;
      }

      // 2. Select Dropdown Filters
      for (const filterConfig of selectFilters) {
        const selectedVal = filterValues[filterConfig.id];
        if (selectedVal && selectedVal !== '') {
          if (!filterConfig.filterFn(item, selectedVal)) {
            return false;
          }
        }
      }

      // 3. Date Range Filter
      if (enableDateRangeFilter) {
        let itemDateStr: string | undefined;
        if (getDateValue) {
          itemDateStr = getDateValue(item);
        } else {
          itemDateStr = item.fecha || item.fechaRegistro || item.fechaPago;
        }

        if (itemDateStr) {
          const itemTime = new Date(itemDateStr).getTime();
          if (startDate) {
            const startTime = new Date(startDate).getTime();
            if (itemTime < startTime) return false;
          }
          if (endDate) {
            // Set to end of the selected day
            const endTime = new Date(endDate + 'T23:59:59').getTime();
            if (itemTime > endTime) return false;
          }
        }
      }

      return true;
    });
  }, [data, searchTerm, filterValues, selectFilters, enableDateRangeFilter, getDateValue, startDate, endDate, columns, getSearchValue]);

  // Sorted data
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;

    const colConfig = columns.find((c) => c.key === sortKey);

    return [...filteredData].sort((a, b) => {
      let valA = colConfig?.getValue ? colConfig.getValue(a) : a[sortKey];
      let valB = colConfig?.getValue ? colConfig.getValue(b) : b[sortKey];

      if (valA === null || valA === undefined) return sortOrder === 'asc' ? 1 : -1;
      if (valB === null || valB === undefined) return sortOrder === 'asc' ? -1 : 1;

      const sortType = colConfig?.sortType || 'string';

      if (sortType === 'number') {
        const numA = Number(valA) || 0;
        const numB = Number(valB) || 0;
        return sortOrder === 'asc' ? numA - numB : numB - numA;
      }

      if (sortType === 'date') {
        const timeA = new Date(valA).getTime() || 0;
        const timeB = new Date(valB).getTime() || 0;
        return sortOrder === 'asc' ? timeA - timeB : timeB - timeA;
      }

      // Default string comparison
      const strA = String(valA).toLowerCase();
      const strB = String(valB).toLowerCase();
      return sortOrder === 'asc' ? strA.localeCompare(strB) : strB.localeCompare(strA);
    });
  }, [filteredData, sortKey, sortOrder, columns]);

  // Pagination calculation
  const totalItems = sortedData.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;

  // Reset to page 1 if filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [searchTerm, filterValues, startDate, endDate, pageSize, sortKey, sortOrder]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const handleSort = (key: string, sortable?: boolean) => {
    if (sortable === false) return;
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const handleFilterChange = (filterId: string, value: string) => {
    setFilterValues((prev) => ({
      ...prev,
      [filterId]: value,
    }));
  };

  return (
    <div className="datatable-container">
      {/* Header controls toolbar */}
      <div className="datatable-toolbar">
        <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center', flexWrap: 'wrap', flex: 1 }}>
          <div className="datatable-search-box">
            <input
              type="text"
              className="datatable-search-input"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button className="datatable-search-clear" onClick={() => setSearchTerm('')}>
                &times;
              </button>
            )}
          </div>

          {/* Select Dropdown Filters */}
          {selectFilters.map((filter) => (
            <div key={filter.id} className="datatable-filter-item">
              <select
                value={filterValues[filter.id] || ''}
                onChange={(e) => handleFilterChange(filter.id, e.target.value)}
                style={{ fontSize: '0.85rem', padding: '0.45rem 0.75rem', width: 'auto' }}
              >
                <option value="">{filter.label}: Todos</option>
                {filter.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          ))}

          {/* Date Range Filters */}
          {enableDateRangeFilter && (
            <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Desde:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={{ width: 'auto', padding: '0.35rem 0.5rem', fontSize: '0.85rem' }}
              />
              <span style={{ color: 'var(--text-muted)' }}>Hasta:</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={{ width: 'auto', padding: '0.35rem 0.5rem', fontSize: '0.85rem' }}
              />
            </div>
          )}

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <button
              type="button"
              className="btn-outline"
              style={{ padding: '0.35rem 0.7rem', fontSize: '0.8rem', color: '#b91c1c', borderColor: '#fca5a5' }}
              onClick={handleResetFilters}
            >
              Limpiar filtros
            </button>
          )}
        </div>

        <div className="datatable-actions-right">
          {extraHeaderActions}

          <div className="datatable-page-size-selector">
            <span>Mostrar</span>
            <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))}>
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              {columns.map((col) => {
                const isSorted = sortKey === col.key;
                const isSortable = col.sortable !== false;

                return (
                  <th
                    key={col.key}
                    style={{
                      cursor: isSortable ? 'pointer' : 'default',
                      userSelect: 'none',
                      ...col.headerStyle,
                    }}
                    onClick={() => isSortable && handleSort(col.key, col.sortable)}
                  >
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span>{col.label}</span>
                      {isSortable && (
                        <span className="sort-icon" style={{ opacity: isSorted ? 1 : 0.35, fontSize: '0.85rem' }}>
                          {isSorted ? (sortOrder === 'asc' ? '▲' : '▼') : '⇅'}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                  Cargando datos...
                </td>
              </tr>
            ) : paginatedData.length > 0 ? (
              paginatedData.map((item, index) => (
                <tr key={keyExtractor(item, index)}>
                  {columns.map((col) => (
                    <td key={col.key} style={col.cellStyle}>
                      {col.render ? col.render(item) : col.getValue ? col.getValue(item) : item[col.key] ?? '-'}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer controls & pagination */}
      <div className="datatable-footer">
        <div className="datatable-info">
          {totalItems > 0 ? (
            <>
              Mostrando <strong>{(currentPage - 1) * pageSize + 1}</strong> a{' '}
              <strong>{Math.min(currentPage * pageSize, totalItems)}</strong> de <strong>{totalItems}</strong> registros
            </>
          ) : (
            '0 registros'
          )}
        </div>

        {totalPages > 1 && (
          <div className="datatable-pagination">
            <button
              className="pagination-btn"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            >
              &laquo; Ant
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                className={`pagination-btn ${page === currentPage ? 'active' : ''}`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}

            <button
              className="pagination-btn"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            >
              Sig &raquo;
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
