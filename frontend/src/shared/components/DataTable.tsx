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

  const cellPadding = density === 'compact' ? 'py-1.5 px-2.5 text-xs' : 'py-2.5 px-3 text-sm';

  return (
    <div className={cn('w-full flex flex-col gap-2', className)}>
      {/* Table toolbar */}
      {searchPlaceholder && (
        <div className="flex items-center justify-between gap-3 px-1">
          <div className="relative max-w-xs w-full">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={globalFilter ?? ''}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded border border-zinc-800 bg-zinc-900/60 text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 font-sans"
            />
          </div>
          <div className="text-2xs font-mono text-zinc-500">
            {table.getFilteredRowModel().rows.length} / {data.length} records
          </div>
        </div>
      )}

      {/* Table grid */}
      <div className="overflow-x-auto rounded border border-zinc-800/80 bg-zinc-900/40">
        <table className="w-full text-left border-collapse">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-zinc-800 bg-zinc-900/80">
                {headerGroup.headers.map((header) => {
                  const isSortable = header.column.getCanSort();
                  const sortDir = header.column.getIsSorted();

                  return (
                    <th
                      key={header.id}
                      className={cn(
                        'text-2xs font-semibold uppercase tracking-wider text-zinc-400 select-none py-2 px-2.5 font-mono',
                        isSortable && 'cursor-pointer hover:text-zinc-200'
                      )}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className="flex items-center gap-1">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {isSortable && (
                          <span className="text-zinc-500">
                            {sortDir === 'asc' ? (
                              <ArrowUp className="w-3 h-3 text-emerald-400" />
                            ) : sortDir === 'desc' ? (
                              <ArrowDown className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <ArrowUpDown className="w-3 h-3 opacity-40 hover:opacity-100" />
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
          <tbody className="divide-y divide-zinc-800/50 font-sans">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="py-8 text-center text-xs text-zinc-500 font-mono">
                  Loading table records...
                </td>
              </tr>
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="p-4">
                  <EmptyState title="No matching rows" description="Try adjusting search filter criteria." />
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => onRowClick && onRowClick(row.original)}
                  className={cn(
                    'hover:bg-zinc-800/40 transition-colors',
                    onRowClick && 'cursor-pointer'
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className={cn('text-zinc-200', cellPadding)}>
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
        <div className="flex items-center justify-between px-1 py-1 text-2xs text-zinc-400 font-mono">
          <div>
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="px-2 py-1 rounded border border-zinc-800 bg-zinc-900 disabled:opacity-40 hover:bg-zinc-800 text-zinc-300"
            >
              Prev
            </button>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="px-2 py-1 rounded border border-zinc-800 bg-zinc-900 disabled:opacity-40 hover:bg-zinc-800 text-zinc-300"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
