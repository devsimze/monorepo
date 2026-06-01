"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, ChevronLeft, ChevronRight as ChevronRightIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { AuditLogEntry, AuditLogPagination } from "@/lib/auditLogsApi";

interface AuditLogTableProps {
  readonly entries: AuditLogEntry[];
  readonly pagination: AuditLogPagination;
  readonly onPageChange: (page: number) => void;
}

function ResultBadge({ result }: { readonly result: string }) {
  const isFailure = result === "failure" || result === "failed" || result === "error";
  return (
    <Badge variant={isFailure ? "destructive" : "secondary"} className="font-mono text-xs">
      {result}
    </Badge>
  );
}

function ExpandedDetail({ entry }: { readonly entry: AuditLogEntry }) {
  return (
    <tr>
      <td colSpan={7} className="bg-muted/30 px-6 py-4">
        <div className="text-xs">
          <p className="mb-1.5 font-semibold text-muted-foreground">Full metadata payload</p>
          <pre className="overflow-x-auto rounded border bg-background p-3 text-xs leading-relaxed">
            {JSON.stringify(entry.metadata, null, 2)}
          </pre>
          {entry.ipAddress && (
            <p className="mt-2 text-muted-foreground">
              IP address: <span className="font-mono text-foreground">{entry.ipAddress}</span>
            </p>
          )}
        </div>
      </td>
    </tr>
  );
}

export function AuditLogTable({ entries, pagination, onPageChange }: AuditLogTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  function toggleRow(id: string) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  return (
    <div className="rounded-lg border shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50 text-left">
              <th className="w-8 px-4 py-3" />
              <th className="px-4 py-3 font-semibold">Timestamp</th>
              <th className="px-4 py-3 font-semibold">Actor</th>
              <th className="px-4 py-3 font-semibold">Action</th>
              <th className="px-4 py-3 font-semibold">Resource Type</th>
              <th className="px-4 py-3 font-semibold">Resource ID</th>
              <th className="px-4 py-3 font-semibold">Result</th>
            </tr>
          </thead>
          <tbody>
            {entries.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                  No audit log entries match the current filters.
                </td>
              </tr>
            ) : (
              entries.map((entry) => {
                const isExpanded = expandedId === entry.id;
                return (
                  <>
                    <tr
                      key={entry.id}
                      className="cursor-pointer border-b transition-colors hover:bg-muted/40"
                      onClick={() => toggleRow(entry.id)}
                      aria-expanded={isExpanded}
                    >
                      <td className="px-4 py-3 text-muted-foreground">
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs whitespace-nowrap text-muted-foreground">
                        {new Date(entry.createdAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-mono text-xs truncate max-w-[140px]" title={entry.actorId ?? "—"}>
                            {entry.actorId ?? "—"}
                          </span>
                          <Badge variant="outline" className="w-fit text-xs">
                            {entry.actorType}
                          </Badge>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs font-medium">
                        {entry.action}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {entry.resourceType ?? "—"}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs truncate max-w-[140px]" title={entry.resourceId ?? ""}>
                        {entry.resourceId ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <ResultBadge result={entry.result} />
                      </td>
                    </tr>
                    {isExpanded && <ExpandedDetail key={`${entry.id}-detail`} entry={entry} />}
                  </>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination footer */}
      <div className="flex items-center justify-between border-t bg-muted/20 px-4 py-3">
        <p className="text-xs text-muted-foreground">
          {pagination.total === 0
            ? "No results"
            : `Showing ${(pagination.page - 1) * pagination.limit + 1}–${Math.min(
                pagination.page * pagination.limit,
                pagination.total,
              )} of ${pagination.total}`}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page <= 1}
            onClick={() => onPageChange(pagination.page - 1)}
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-xs text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages || 1}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => onPageChange(pagination.page + 1)}
            aria-label="Next page"
          >
            <ChevronRightIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
