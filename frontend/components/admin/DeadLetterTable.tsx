"use client"

import { useState } from "react"
import {
  RefreshCw, Loader2, Trash2, ChevronDown, ChevronRight,
  ChevronLeft, ChevronRight as ChevronRightIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import type { DeadLetterItem } from "@/lib/outboxAdminApi"
import { showSuccessToast } from "@/lib/toast"

function formatDate(d: string): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  }).format(new Date(d))
}

function PayloadPreview({ payload }: { payload: Record<string, unknown> }) {
  const [open, setOpen] = useState(false)
  const preview = JSON.stringify(payload).slice(0, 200)
  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-1 text-xs font-bold text-muted-foreground hover:text-foreground"
      >
        {open ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
        Payload
      </button>
      {open ? (
        <pre className="mt-1 p-2 bg-muted border-2 border-foreground text-xs font-mono overflow-x-auto max-h-40 overflow-y-auto">
          {JSON.stringify(payload, null, 2)}
        </pre>
      ) : (
        <p className="mt-1 text-xs font-mono text-muted-foreground truncate max-w-xs">
          {preview}{preview.length >= 200 ? "..." : ""}
        </p>
      )}
    </div>
  )
}

type DeadLetterTableProps = {
  items: DeadLetterItem[]
  loading: boolean
  page: number
  totalPages: number
  total: number
  retryingIds: Set<string>
  onRetry: (id: string) => void
  onDismiss: (id: string) => void
  onPageChange: (page: number) => void
}

export function DeadLetterTable({
  items, loading, page, totalPages, total, retryingIds,
  onRetry, onDismiss, onPageChange,
}: DeadLetterTableProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    )
  }

  if (!items.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center px-4">
        <p className="text-sm font-medium text-muted-foreground mb-2">No dead-letter records found</p>
        <p className="text-xs text-muted-foreground">All outbox events are processing normally.</p>
      </div>
    )
  }

  return (
    <div>
      <div className="space-y-3">
        {items.map((item) => (
          <Card key={item.id} className="border-3 border-foreground bg-card p-4 shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-0.5 border-2 border-foreground bg-destructive text-destructive-foreground font-bold text-xs">
                    DEAD
                  </span>
                  <span className="px-2 py-0.5 border-2 border-foreground bg-muted font-mono text-xs font-bold">
                    {item.eventType}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    retries: {item.retryCount}
                  </span>
                </div>
                <PayloadPreview payload={item.payload} />
                <div className="border-3 border-destructive bg-destructive/10 p-2">
                  <p className="text-xs font-bold text-destructive">Failure:</p>
                  <p className="text-xs text-destructive break-words">{item.failureReason}</p>
                </div>
                <div className="flex gap-4 text-xs text-muted-foreground">
                  <span>Created: {formatDate(item.createdAt)}</span>
                  <span>Last attempt: {formatDate(item.lastAttemptedAt)}</span>
                </div>
              </div>
              <div className="flex flex-col gap-2 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onRetry(item.id)}
                  disabled={retryingIds.has(item.id)}
                  className="border-3 border-foreground bg-background font-bold shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] disabled:opacity-50"
                >
                  {retryingIds.has(item.id) ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                  Retry
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDismiss(item.id)}
                  className="border-3 border-foreground bg-background font-bold shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]"
                >
                  <Trash2 className="h-4 w-4" />
                  Dismiss
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t-2 border-foreground">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages} ({total} total)
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline" size="sm"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="border-3 border-foreground bg-background font-bold shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] transition-all disabled:opacity-50 disabled:shadow-none"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-bold px-3 py-2 border-3 border-foreground bg-card min-w-[3rem] text-center">
              {page}
            </span>
            <Button
              variant="outline" size="sm"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              className="border-3 border-foreground bg-background font-bold shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] transition-all disabled:opacity-50 disabled:shadow-none"
            >
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
