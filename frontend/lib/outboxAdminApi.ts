import { apiGet, apiPost, apiDelete, withQuery } from "./apiClient"

export type DeadLetterItem = {
  id: string
  eventType: string
  txType: string
  payload: Record<string, unknown>
  failureReason: string
  retryCount: number
  createdAt: string
  lastAttemptedAt: string
}

export type DeadLetterListResponse = {
  items: DeadLetterItem[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

export async function fetchDeadLetterItems(params?: {
  page?: number
  pageSize?: number
  eventType?: string
  dateFrom?: string
  dateTo?: string
}): Promise<DeadLetterListResponse> {
  return apiGet<DeadLetterListResponse>(
    withQuery("/api/admin/outbox/dead-letter", {
      page: params?.page,
      pageSize: params?.pageSize,
      eventType: params?.eventType,
      dateFrom: params?.dateFrom,
      dateTo: params?.dateTo,
    }),
  )
}

export async function retryDeadLetterItem(id: string): Promise<{ success: boolean; message: string }> {
  return apiPost<{ success: boolean; message: string }>(
    `/api/admin/outbox/dead-letter/${id}/retry`,
    {},
  )
}

export async function bulkRetryDeadLetters(eventType: string): Promise<{ success: boolean; reQueued: number; message: string }> {
  return apiPost<{ success: boolean; reQueued: number; message: string }>(
    "/api/admin/outbox/dead-letter/bulk-retry",
    { eventType },
  )
}

export async function dismissDeadLetterItem(id: string): Promise<{ success: boolean; message: string }> {
  return apiDelete<{ success: boolean; message: string }>(
    `/api/admin/outbox/dead-letter/${id}`,
  )
}
