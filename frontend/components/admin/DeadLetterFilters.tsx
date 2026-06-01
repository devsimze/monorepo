"use client"

import { Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"

export type DeadLetterFiltersState = {
  eventType: string
  dateFrom: string
  dateTo: string
}

type DeadLetterFiltersProps = {
  filters: DeadLetterFiltersState
  onChange: (filters: DeadLetterFiltersState) => void
  onReset: () => void
}

export function DeadLetterFilters({ filters, onChange, onReset }: DeadLetterFiltersProps) {
  const hasFilters = filters.eventType || filters.dateFrom || filters.dateTo

  return (
    <div className="border-3 border-foreground bg-card p-4 shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]">
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold" htmlFor="event-type">Event Type</label>
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              id="event-type"
              type="text"
              placeholder="e.g. receipt, staking..."
              value={filters.eventType}
              onChange={(e) => onChange({ ...filters, eventType: e.target.value })}
              className="border-2 border-foreground bg-background pl-8 pr-2 py-1.5 text-sm font-mono w-48"
            />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold" htmlFor="date-from">From Date</label>
          <input
            id="date-from"
            type="date"
            value={filters.dateFrom}
            onChange={(e) => onChange({ ...filters, dateFrom: e.target.value })}
            className="border-2 border-foreground bg-background px-2 py-1.5 text-sm"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold" htmlFor="date-to">To Date</label>
          <input
            id="date-to"
            type="date"
            value={filters.dateTo}
            onChange={(e) => onChange({ ...filters, dateTo: e.target.value })}
            className="border-2 border-foreground bg-background px-2 py-1.5 text-sm"
          />
        </div>
        {hasFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={onReset}
            className="border-3 border-foreground bg-background font-bold shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]"
          >
            <X className="mr-1 h-4 w-4" />
            Reset
          </Button>
        )}
      </div>
    </div>
  )
}
