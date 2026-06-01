"use client"

import { useState, useEffect, useCallback } from "react"
import { RefreshCw, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { DeadLetterTable } from "@/components/admin/DeadLetterTable"
import { DeadLetterFilters, type DeadLetterFiltersState } from "@/components/admin/DeadLetterFilters"
import {
  fetchDeadLetterItems,
  retryDeadLetterItem,
  bulkRetryDeadLetters,
  dismissDeadLetterItem,
  type DeadLetterItem,
} from "@/lib/outboxAdminApi"
import { handleError, showSuccessToast } from "@/lib/toast"

const DEFAULT_FILTERS: DeadLetterFiltersState = { eventType: "", dateFrom: "", dateTo: "" }

export default function AdminOutboxPage() {
  const [items, setItems] = useState<DeadLetterItem[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [retryingIds, setRetryingIds] = useState<Set<string>>(new Set())
  const [bulkRetrying, setBulkRetrying] = useState(false)
  const [filters, setFilters] = useState<DeadLetterFiltersState>(DEFAULT_FILTERS)
  const [dismissConfirm, setDismissConfirm] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const result = await fetchDeadLetterItems({
        page,
        pageSize: 20,
        eventType: filters.eventType || undefined,
        dateFrom: filters.dateFrom || undefined,
        dateTo: filters.dateTo || undefined,
      })
      setItems(result.items)
      setTotalPages(result.pagination.totalPages)
      setTotal(result.pagination.total)
    } catch (err) {
      handleError(err, "Failed to load dead-letter records")
    } finally {
      setLoading(false)
    }
  }, [page, filters])

  useEffect(() => { void load() }, [load])

  const handleRetry = async (id: string) => {
    setRetryingIds((prev) => new Set(prev).add(id))
    try {
      const result = await retryDeadLetterItem(id)
      showSuccessToast(result.message)
      await load()
    } catch (err) {
      handleError(err, "Failed to retry record")
    } finally {
      setRetryingIds((prev) => { const n = new Set(prev); n.delete(id); return n })
    }
  }

  const handleBulkRetry = async () => {
    if (!filters.eventType) return
    setBulkRetrying(true)
    try {
      const result = await bulkRetryDeadLetters(filters.eventType)
      showSuccessToast(result.message)
      await load()
    } catch (err) {
      handleError(err, "Failed to bulk retry")
    } finally {
      setBulkRetrying(false)
    }
  }

  const handleDismiss = async (id: string) => {
    setDismissConfirm(null)
    try {
      const result = await dismissDeadLetterItem(id)
      showSuccessToast(result.message)
      setItems((prev) => prev.filter((i) => i.id !== id))
    } catch (err) {
      handleError(err, "Failed to dismiss record")
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b-3 border-foreground bg-card p-4 md:p-6">
        <div className="container mx-auto">
          <h1 className="text-2xl font-black md:text-3xl">Dead-Letter Queue</h1>
          <p className="text-sm text-muted-foreground mt-2">
            View and retry failed outbox events that exceeded max retry attempts
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card className="border-3 border-foreground p-6 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <DeadLetterFilters
              filters={filters}
              onChange={(f) => { setFilters(f); setPage(1) }}
              onReset={() => { setFilters(DEFAULT_FILTERS); setPage(1) }}
            />
            <div className="flex items-center gap-2">
              {filters.eventType && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleBulkRetry}
                  disabled={bulkRetrying}
                  className="border-3 border-foreground bg-primary font-bold shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] disabled:opacity-50"
                >
                  {bulkRetrying ? (
                    <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="mr-1 h-4 w-4" />
                  )}
                  Bulk Retry ({filters.eventType})
                </Button>
              )}
              <Button
                variant="outline" size="sm"
                onClick={() => void load()}
                className="border-3 border-foreground bg-background font-bold shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <DeadLetterTable
            items={items}
            loading={loading}
            page={page}
            totalPages={totalPages}
            total={total}
            retryingIds={retryingIds}
            onRetry={handleRetry}
            onDismiss={(id) => setDismissConfirm(id)}
            onPageChange={setPage}
          />
        </Card>
      </main>

      {/* Dismiss confirmation modal */}
      {dismissConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="border-3 border-foreground p-6 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] max-w-md w-full mx-4">
            <h2 className="text-lg font-black mb-2">Dismiss Record</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Are you sure you want to permanently dismiss this dead-letter record? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setDismissConfirm(null)}
                className="border-3 border-foreground bg-background font-bold shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDismiss(dismissConfirm)}
                className="border-3 border-foreground font-bold shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]"
              >
                Dismiss
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
