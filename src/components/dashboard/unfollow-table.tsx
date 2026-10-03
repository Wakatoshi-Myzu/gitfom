import { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  ColumnDef,
  RowSelectionState,
} from '@tanstack/react-table';
import { GitHubUserBasic } from '@/lib/api/github';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Star,
  ExternalLink,
  UserX,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  CheckSquare,
  Square,
  ShieldAlert,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface UnfollowTableProps {
  data: GitHubUserBasic[];
  tabType: 'notFollowingBack' | 'following' | 'mutuals' | 'fans' | 'whitelisted';
  isWhitelisted: (username: string) => boolean;
  onToggleWhitelist: (username: string) => void;
  onUnfollowSingle: (username: string) => Promise<void>;
  onFollowSingle?: (username: string) => Promise<void>;
  onStartBatchUnfollow: (users: GitHubUserBasic[]) => void;
  isUnfollowing?: boolean;
}

export function UnfollowTable({
  data,
  tabType,
  isWhitelisted,
  onToggleWhitelist,
  onUnfollowSingle,
  onFollowSingle,
  onStartBatchUnfollow,
}: UnfollowTableProps) {
  const [globalFilter, setGlobalFilter] = useState('');
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [loadingUser, setLoadingUser] = useState<string | null>(null);

  const columns = useMemo<ColumnDef<GitHubUserBasic>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <button
            onClick={table.getToggleAllRowsSelectedHandler()}
            className="p-1 text-muted-foreground hover:text-foreground rounded transition-colors"
            title="Pilih Semua di Halaman Ini"
          >
            {table.getIsAllRowsSelected() ? (
              <CheckSquare className="w-4 h-4 text-primary" />
            ) : (
              <Square className="w-4 h-4 text-muted-foreground" />
            )}
          </button>
        ),
        cell: ({ row }) => {
          const user = row.original;
          const safe = isWhitelisted(user.login);
          return (
            <button
              disabled={safe}
              onClick={row.getToggleSelectedHandler()}
              className={`p-1 rounded transition-colors ${
                safe ? 'opacity-30 cursor-not-allowed text-muted-foreground' : 'hover:text-foreground'
              }`}
              title={safe ? 'Akun ini dilindungi oleh Whitelist' : 'Pilih Akun'}
            >
              {row.getIsSelected() ? (
                <CheckSquare className="w-4 h-4 text-primary" />
              ) : (
                <Square className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
          );
        },
      },
      {
        accessorKey: 'login',
        header: 'Pengguna GitHub',
        cell: ({ row }) => {
          const user = row.original;
          const safe = isWhitelisted(user.login);
          return (
            <div className="flex items-center gap-3">
              <img
                src={user.avatar_url}
                alt={user.login}
                className="w-10 h-10 rounded-full border border-border bg-muted object-cover"
                loading="lazy"
              />
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <a
                    href={user.html_url}
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold text-foreground hover:text-primary hover:underline inline-flex items-center gap-1 text-sm"
                  >
                    @{user.login}
                    <ExternalLink className="w-3 h-3 text-muted-foreground" />
                  </a>
                  {safe && (
                    <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/30 text-[10px] py-0 px-1.5 gap-1">
                      <ShieldCheck className="w-3 h-3" /> Safe Whitelist
                    </Badge>
                  )}
                </div>
                <span className="text-xs text-muted-foreground font-mono">ID: {user.id}</span>
              </div>
            </div>
          );
        },
      },
      {
        id: 'status',
        header: 'Status Relasi',
        cell: () => {
          if (tabType === 'notFollowingBack') {
            return <Badge variant="notFollowing">Tidak Follow Back</Badge>;
          }
          if (tabType === 'mutuals') {
            return <Badge variant="mutual">Mutual Connections</Badge>;
          }
          if (tabType === 'fans') {
            return <Badge variant="fan">Fan (Belum Kamu Follow)</Badge>;
          }
          return <Badge variant="secondary">Following</Badge>;
        },
      },
      {
        id: 'actions',
        header: () => <div className="text-right">Aksi & Perlindungan</div>,
        cell: ({ row }) => {
          const user = row.original;
          const safe = isWhitelisted(user.login);
          const isLoadingThis = loadingUser === user.login;

          const handleSingleUnfollow = async () => {
            if (safe) return;
            setLoadingUser(user.login);
            try {
              await onUnfollowSingle(user.login);
            } finally {
              setLoadingUser(null);
            }
          };

          const handleSingleFollow = async () => {
            if (!onFollowSingle) return;
            setLoadingUser(user.login);
            try {
              await onFollowSingle(user.login);
            } finally {
              setLoadingUser(null);
            }
          };

          return (
            <div className="flex items-center justify-end gap-2">
              {/* Whitelist Pin Toggle Button */}
              <button
                onClick={() => onToggleWhitelist(user.login)}
                className={`p-2 rounded-xl border transition-all duration-200 ${
                  safe
                    ? 'bg-amber-500/15 border-amber-500/40 text-amber-500 shadow-sm'
                    : 'border-border text-muted-foreground hover:text-amber-500 hover:border-amber-500/30 hover:bg-amber-500/10'
                }`}
                title={safe ? 'Hapus dari Whitelist (Buka Perlindungan)' : 'Tambahkan ke Whitelist (Lindungi dari Unfollow)'}
              >
                <Star className={`w-4 h-4 ${safe ? 'fill-current' : ''}`} />
              </button>

              {/* Unfollow / Follow Action */}
              {tabType === 'fans' ? (
                <Button
                  size="sm"
                  variant="statusMutual"
                  isLoading={isLoadingThis}
                  onClick={handleSingleFollow}
                  className="text-xs"
                >
                  <UserCheck className="w-3.5 h-3.5" /> Follow Back
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant={safe ? 'outline' : 'statusNotFollowing'}
                  disabled={safe}
                  isLoading={isLoadingThis}
                  onClick={handleSingleUnfollow}
                  className="text-xs"
                >
                  {safe ? (
                    <>
                      <ShieldAlert className="w-3.5 h-3.5 text-amber-500" /> Kecebalan Aktif
                    </>
                  ) : (
                    <>
                      <UserX className="w-3.5 h-3.5" /> Unfollow
                    </>
                  )}
                </Button>
              )}
            </div>
          );
        },
      },
    ],
    [tabType, isWhitelisted, loadingUser, onToggleWhitelist, onUnfollowSingle, onFollowSingle]
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      globalFilter,
      rowSelection,
    },
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 15,
      },
    },
  });

  const selectedRows = table.getSelectedRowModel().rows;
  const selectedUnsafeUsers = selectedRows
    .map((r) => r.original)
    .filter((u) => !isWhitelisted(u.login));

  return (
    <div className="space-y-4">
      {/* Top Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card p-4 rounded-2xl border border-border shadow-sm">
        {/* Search Bar */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Cari username..."
            value={globalFilter ?? ''}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="w-full h-10 pl-9 pr-4 rounded-xl bg-background border border-input text-xs focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          />
        </div>

        {/* Batch Actions */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          {selectedRows.length > 0 && (
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
              <Button
                variant="statusNotFollowing"
                size="md"
                className="gap-2 shadow-lg"
                onClick={() => onStartBatchUnfollow(selectedUnsafeUsers)}
                disabled={selectedUnsafeUsers.length === 0}
              >
                <UserX className="w-4 h-4" /> Unfollow Batch ({selectedUnsafeUsers.length} Akun)
              </Button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Main Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-muted/40 border-b border-border text-xs uppercase text-muted-foreground font-bold tracking-wider">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="p-4">
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-border">
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="text-center p-12 text-muted-foreground">
                    <p className="text-sm font-semibold">Tidak ada akun yang ditemukan.</p>
                    <p className="text-xs mt-1">Coba sesuaikan pencarian atau tab filter Anda.</p>
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className={`transition-colors hover:bg-muted/30 ${
                      row.getIsSelected() ? 'bg-primary/5' : ''
                    }`}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="p-4 align-middle">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-between p-4 border-t border-border bg-muted/20 text-xs text-muted-foreground">
          <div>
            Menampilkan {table.getRowModel().rows.length} dari {table.getFilteredRowModel().rows.length} pengguna
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="w-4 h-4" /> Sebelum
            </Button>
            <span className="font-semibold text-foreground px-2">
              Halaman {table.getState().pagination.pageIndex + 1} dari {table.getPageCount()}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Selanjutnya <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
