"use client";

/**
 * Admin Audit Log Viewer (#1045)
 *
 * Full-width paginated table of audit log entries with a filter bar.
 * Filters are reflected in the URL query string (bookmarkable/shareable).
 * Table updates without a full page reload when filters change.
 * Returns 403 for non-admin users (enforced by the backend; the UI simply
 * shows the error state).
 */

import { Suspense, useState, useEffect, useCallback, startTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { RefreshCw, Loader2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AuditLogFilters } from "@/components/admin/AuditLogFilters";
import { AuditLogTable } from "@/components/admin/AuditLogTable";
import {
  getAuditLogs,
  type AuditLogEntry,
  type AuditLogPagination,
  type AuditLogQueryParams,
} from "@/lib/auditLogsApi";

type LoadState =
  | { type: "idle" }
  | { type: "loading" }
  | { type: "error"; message: string; code?: number }
  | { type: "success"; entries: AuditLogEntry[]; pagination: AuditLogPagination };

function parseSearchParams(sp: URLSearchParams): AuditLogQueryParams {
  return {
    actorId: sp.get("actorId") ?? undefined,
    action: sp.get("action") ?? undefined,
    resourceType: sp.get("resourceType") ?? undefined,
    resourceId: sp.get("resourceId") ?? undefined,
    startDate: sp.get("startDate") ?? undefined,
    endDate: sp.get("endDate") ?? undefined,
    page: sp.has("page") ? Number(sp.get("page")) : 1,
    limit: 50,
  };
}

function filtersToSearchParams(filters: AuditLogQueryParams): URLSearchParams {
  const sp = new URLSearchParams();
  if (filters.actorId) sp.set("actorId", filters.actorId);
  if (filters.action) sp.set("action", filters.action);
  if (filters.resourceType) sp.set("resourceType", filters.resourceType);
  if (filters.resourceId) sp.set("resourceId", filters.resourceId);
  if (filters.startDate) sp.set("startDate", filters.startDate);
  if (filters.endDate) sp.set("endDate", filters.endDate);
  if (filters.page && filters.page !== 1) sp.set("page", String(filters.page));
  return sp;
}

function AuditLogsContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<AuditLogQueryParams>(() =>
    parseSearchParams(searchParams),
  );
  const [loadState, setLoadState] = useState<LoadState>({ type: "idle" });

  const fetchLogs = useCallback(async (f: AuditLogQueryParams) => {
    setLoadState({ type: "loading" });
    try {
      const result = await getAuditLogs(f);
      setLoadState({ type: "success", entries: result.entries, pagination: result.pagination });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to load audit logs";
      const code = (err as { status?: number }).status;
      setLoadState({ type: "error", message, code });
    }
  }, []);

  // Sync filters → URL and trigger fetch (startTransition avoids cascading-render lint error)
  useEffect(() => {
    const sp = filtersToSearchParams(filters);
    const qs = sp.toString();
    router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
    startTransition(() => { void fetchLogs(filters); });
  }, [filters, fetchLogs, pathname, router]);

  const handleFiltersChange = useCallback((next: AuditLogQueryParams) => {
    setFilters(next);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  }, []);

  const handleRefresh = useCallback(() => {
    void fetchLogs(filters);
  }, [filters, fetchLogs]);

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Audit Log</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Searchable, paginated view of all admin actions and sensitive operations.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={loadState.type === "loading"}
          className="gap-2"
        >
          {loadState.type === "loading" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Refresh
        </Button>
      </div>

      {/* Filter bar */}
      <AuditLogFilters filters={filters} onFiltersChange={handleFiltersChange} />

      {/* Table area */}
      {loadState.type === "loading" && (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-md" />
          ))}
        </div>
      )}

      {loadState.type === "error" && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-destructive/30 bg-destructive/5 py-16 text-center">
          <ShieldAlert className="mb-4 h-12 w-12 text-destructive" />
          <p className="mb-1 font-semibold text-destructive">
            {loadState.code === 403
              ? "Access denied — admin credentials required"
              : "Failed to load audit logs"}
          </p>
          <p className="mb-6 text-sm text-muted-foreground">{loadState.message}</p>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            Try again
          </Button>
        </div>
      )}

      {loadState.type === "success" && (
        <AuditLogTable
          entries={loadState.entries}
          pagination={loadState.pagination}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-80" />
        </div>
      </div>
      <Skeleton className="h-20 w-full rounded-lg" />
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-md" />
        ))}
      </div>
    </div>
  );
}

export default function AdminAuditLogsPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AuditLogsContent />
    </Suspense>
  );
}
