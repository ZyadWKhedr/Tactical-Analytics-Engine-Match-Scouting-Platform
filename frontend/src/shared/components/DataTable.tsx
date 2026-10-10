import React, { useState } from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { ArrowDown, ArrowUp, ArrowUpDown, Search } from 'lucide-react';
import { cn } from '../lib/utils';
import { EmptyState } from './EmptyState';

interface DataTableProps<TData> {
  columns: ColumnDef<TData, any>[];
  data: TData[];
  searchPlaceholder?: string;
  searchColumnId?: string;
  pageSize?: number;
  isLoading?: boolean;
  onRowClick?: (row: TData) => void;
  className?: string;
  density?: 'compact' | 'normal';
}

export function DataTable<TData>({
  columns,
  data,
  searchPlaceholder = 'Filter rows...',
  pageSize = 15,
  isLoading = false,
  onRowClick,
  className,
  density = 'compact',
}: DataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize,
      },
    },
  });

  const cellPadding = density === 'compact' ? 'py-2 px-3 text-xs' : 'py-3 px-3.5 text-sm';

  return (
    <div className={cn('w-full flex flex-col gap-2.5 font-sans', className)}>
      {/* Table toolbar */}
      {searchPlaceholder && (
        <div className="flex items-center justify-between gap-3 px-0.5">
          <div className="relative max-w-xs w-full">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-3)]" />
            <input
              type="text"
              value={globalFilter ?? ''}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-[var(--border)] bg-[var(--panel-2)] text-[var(--text)] placeholder:text-[var(--text-3)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] font-sans transition-colors"
            />
          </div>
          <div className="text-3xs font-mono text-[var(--text-3)]">
            {table.getFilteredRowModel().rows.length} / {data.length} records
          </div>
        </div>
      )}

      {/* Table grid */}
      <div className="overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--panel)]">
        <table className="w-full text-left border-collapse">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-[var(--border)] bg-[var(--panel-2)]/60">
                {headerGroup.headers.map((header) => {
                  const isSortable = header.column.getCanSort();
                  const sortDir = header.column.getIsSorted();

                  return (
                    <th
                      key={header.id}
                      className={cn(
                        'text-3xs font-semibold uppercase tracking-wider text-[var(--text-3)] select-none py-2.5 px-3 font-mono',
                        isSortable && 'cursor-pointer hover:text-[var(--text)]'
                      )}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className="flex items-center gap-1.5">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {isSortable && (
                          <span className="text-[var(--text-3)]">
                            {sortDir === 'asc' ? (
                              <ArrowUp className="w-3 h-3 text-[var(--accent)]" />
                            ) : sortDir === 'desc' ? (
                              <ArrowDown className="w-3 h-3 text-[var(--accent)]" />
                            ) : (
                              <ArrowUpDown className="w-3 h-3 opacity-30 hover:opacity-100" />
                            )}
                          </span>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-[var(--border)] font-sans">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="py-12 text-center text-xs text-[var(--text-3)] font-mono">
                  Loading scouting data...
                </td>
              </tr>
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="p-6">
                  <EmptyState title="No matching records" description="Try adjusting search or filter parameters." />
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => onRowClick && onRowClick(row.original)}
                  className={cn(
                    'hover:bg-[var(--panel-2)] transition-colors',
                    onRowClick && 'cursor-pointer'
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className={cn('text-[var(--text)] font-sans', cellPadding)}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination controls */}
      {table.getPageCount() > 1 && (
        <div className="flex items-center justify-between px-1 py-1 text-3xs text-[var(--text-3)] font-mono">
          <div>
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="px-2.5 py-1 rounded-md border border-[var(--border)] bg-[var(--panel)] disabled:opacity-40 hover:bg-[var(--panel-2)] text-[var(--text)] transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="px-2.5 py-1 rounded-md border border-[var(--border)] bg-[var(--panel)] disabled:opacity-40 hover:bg-[var(--panel-2)] text-[var(--text)] transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
