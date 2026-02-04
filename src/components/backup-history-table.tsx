"use client";

import { useState, useMemo, useCallback, memo, Fragment } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getExpandedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type ExpandedState,
} from "@tanstack/react-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BackupHistoryResponse, BackupDocument } from "@/types/backup";
import { formatBytes } from "@/lib/utils";
import { format } from "date-fns";
import { ChevronDown, ChevronRight, Download, ArrowUpDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface BackupHistoryTableProps {
  machineName: string;
}

async function fetchBackupHistory(
  machineName: string,
  page: number
): Promise<BackupHistoryResponse> {
  const res = await fetch(
    `/api/machines/${encodeURIComponent(machineName)}/history?page=${page}&limit=20`,
    { cache: "no-store" }
  );
  if (!res.ok) throw new Error("Error al obtener historial de respaldos");
  return res.json();
}

const ExpandedRowContent = memo(function ExpandedRowContent({ backup }: { backup: BackupDocument }) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="bg-muted/30"
    >
      <div className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div>
            <p className="text-xs text-muted-foreground">Archivos Agregados</p>
            <p className="text-sm font-semibold">{!isNaN(backup.AddedFiles) ? backup.AddedFiles : "N/A"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Archivos Modificados</p>
            <p className="text-sm font-semibold">{!isNaN(backup.ModifiedFiles) ? backup.ModifiedFiles : "N/A"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Archivos Eliminados</p>
            <p className="text-sm font-semibold">{!isNaN(backup.DeletedFiles) ? backup.DeletedFiles : "N/A"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Archivos con Errores</p>
            <p className="text-sm font-semibold text-red-600 dark:text-red-400">
              {!isNaN(backup.FilesWithError) ? backup.FilesWithError : "N/A"}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Errores</p>
            <p className="text-sm font-semibold">{!isNaN(backup.ErrorsCount) ? backup.ErrorsCount : "N/A"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Advertencias</p>
            <p className="text-sm font-semibold">{!isNaN(backup.WarningsCount) ? backup.WarningsCount : "N/A"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Llamadas Remotas</p>
            <p className="text-sm font-semibold">{!isNaN(backup.RemoteCalls) ? backup.RemoteCalls : "N/A"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Intentos de Reintentos</p>
            <p className="text-sm font-semibold">{!isNaN(backup.RetryAttempts) ? backup.RetryAttempts : "N/A"}</p>
          </div>
        </div>

        {backup.Exception && (
          <div className="mt-4">
            <p className="text-sm font-semibold mb-2">Excepción:</p>
            <pre className="bg-card p-3 rounded text-xs overflow-x-auto border">
              {backup.Exception}
            </pre>
          </div>
        )}

        {backup.AdditionalOperations && backup.AdditionalOperations.length > 0 && (
          <div className="mt-4">
            <p className="text-sm font-semibold mb-2">Operaciones Adicionales:</p>
            <div className="space-y-2">
              {backup.AdditionalOperations.map((op: any, idx: number) => (
                <div key={idx} className="bg-card p-3 rounded border">
                  <p className="text-xs font-semibold">{op.operation}</p>
                  <p className="text-xs text-muted-foreground">{op.result}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
});

export const BackupHistoryTable = memo(function BackupHistoryTable({
  machineName,
}: BackupHistoryTableProps) {
  const [page, setPage] = useState(1);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [expanded, setExpanded] = useState<ExpandedState>({});

  const { data, isLoading } = useQuery({
    queryKey: ["backup-history", machineName, page],
    queryFn: () => fetchBackupHistory(machineName, page),
    staleTime: 15000,
  });

  const exportToCSV = useCallback(() => {
    if (!data) return;

    const headers = [
      "Fecha",
      "Estado",
      "Duración",
      "Tamaño (MB)",
      "Archivos Examinados",
      "Archivos Agregados",
      "Archivos Modificados",
      "Errores",
      "Advertencias",
    ];

    const rows = data.backups.map((backup) => [
      format(new Date(backup.EndTime), "yyyy-MM-dd HH:mm:ss"),
      backup.Status,
      backup.Duration || "N/A",
      !isNaN(backup.SizeOfExaminedFilesMB) ? backup.SizeOfExaminedFilesMB : "N/A",
      !isNaN(backup.ExaminedFiles) ? backup.ExaminedFiles : "N/A",
      !isNaN(backup.AddedFiles) ? backup.AddedFiles : "N/A",
      !isNaN(backup.ModifiedFiles) ? backup.ModifiedFiles : "N/A",
      !isNaN(backup.ErrorsCount) ? backup.ErrorsCount : "N/A",
      !isNaN(backup.WarningsCount) ? backup.WarningsCount : "N/A",
    ]);

    const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${machineName}-backup-history.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [data, machineName]);

  const columns = useMemo<ColumnDef<BackupDocument>[]>(
    () => [
      {
        id: "expander",
        header: () => null,
        cell: ({ row }) => {
          return row.getCanExpand() ? (
            <button
              onClick={row.getToggleExpandedHandler()}
              className="cursor-pointer hover:text-primary transition-colors"
            >
              {row.getIsExpanded() ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          ) : null;
        },
      },
      {
        accessorKey: "EndTime",
        header: ({ column }) => {
          return (
            <button
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="flex items-center gap-2 hover:text-primary transition-colors"
            >
              Fecha
              <ArrowUpDown className="w-3 h-3" />
            </button>
          );
        },
        cell: ({ row }) => (
          <span className="text-sm">
            {format(new Date(row.original.EndTime), "MMM dd, yyyy HH:mm")}
          </span>
        ),
      },
      {
        accessorKey: "Status",
        header: "Estado",
        cell: ({ row }) => (
          <Badge
            variant={
              row.original.Status === "SUCCESS"
                ? "success"
                : row.original.Status === "WARNING"
                ? "warning"
                : row.original.Status === "ERROR"
                ? "error"
                : "default"
            }
          >
            {row.original.Status}
          </Badge>
        ),
      },
      {
        accessorKey: "Duration",
        header: "Duración",
        cell: ({ row }) => (
          <span className="text-sm">{row.original.Duration || "N/A"}</span>
        ),
      },
      {
        accessorKey: "SizeOfExaminedFilesMB",
        header: ({ column }) => {
          return (
            <button
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="flex items-center gap-2 hover:text-primary transition-colors"
            >
              Tamaño
              <ArrowUpDown className="w-3 h-3" />
            </button>
          );
        },
        cell: ({ row }) => {
          const size = row.original.SizeOfExaminedFilesMB;
          return (
            <span className="text-sm">
              {!isNaN(size) ? formatBytes(size * 1024 * 1024) : "N/A"}
            </span>
          );
        },
      },
      {
        accessorKey: "ExaminedFiles",
        header: ({ column }) => {
          return (
            <button
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="flex items-center gap-2 hover:text-primary transition-colors"
            >
              Archivos
              <ArrowUpDown className="w-3 h-3" />
            </button>
          );
        },
        cell: ({ row }) => {
          const files = row.original.ExaminedFiles;
          return (
            <span className="text-sm">
              {!isNaN(files) ? files.toLocaleString() : "N/A"}
            </span>
          );
        },
      },
    ],
    []
  );

  const table = useReactTable({
    data: data?.backups ?? [],
    columns,
    state: {
      sorting,
      expanded,
    },
    onSortingChange: setSorting,
    onExpandedChange: setExpanded,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getRowCanExpand: () => true,
    manualPagination: true,
    pageCount: data?.totalPages ?? 0,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Historial de Respaldos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.backups.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Historial de Respaldos</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            No hay historial de respaldos disponible
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.4 }}
    >
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Historial de Respaldos</CardTitle>
            <Button variant="outline" size="sm" onClick={exportToCSV}>
              <Download className="w-4 h-4 mr-2" />
              Exportar CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id} className="border-b">
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="text-left py-3 px-4 text-sm font-semibold"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map((row) => (
                  <Fragment key={row.id}>
                    <motion.tr
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className="border-b hover:bg-muted/50 transition-colors"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          className="py-3 px-4"
                          onClick={
                            cell.column.id === "expander"
                              ? undefined
                              : row.getToggleExpandedHandler()
                          }
                          style={{
                            cursor:
                              cell.column.id === "expander" ? "default" : "pointer",
                          }}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                      ))}
                    </motion.tr>
                    <AnimatePresence>
                      {row.getIsExpanded() && (
                        <tr>
                          <td colSpan={row.getVisibleCells().length}>
                            <ExpandedRowContent backup={row.original} />
                          </td>
                        </tr>
                      )}
                    </AnimatePresence>
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-muted-foreground">
              Mostrando {(page - 1) * data.limit + 1} a{" "}
              {Math.min(page * data.limit, data.total)} de {data.total} respaldos
            </p>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
              >
                Anterior
              </Button>
              <span className="flex items-center px-3 text-sm font-medium">
                Página {page} de {data.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={page >= data.totalPages}
              >
                Siguiente
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
});
