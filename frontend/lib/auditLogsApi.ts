import { apiGet } from './apiClient'

export interface AuditLogEntry {
  id: string
  action: string
  actorId: string | null
  actorType: string
  resourceType: string | null
  resourceId: string | null
  ipAddress: string | null
  result: string
  metadata: Record<string, unknown>
  createdAt: string
}

export interface AuditLogPagination {
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface AuditLogResponse {
  entries: AuditLogEntry[]
  pagination: AuditLogPagination
}

export interface AuditLogQueryParams {
  actorId?: string
  action?: string
  resourceType?: string
  resourceId?: string
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
}

function buildQuery(params: AuditLogQueryParams): string {
  const search = new URLSearchParams()
  if (params.actorId) search.set('actorId', params.actorId)
  if (params.action) search.set('action', params.action)
  if (params.resourceType) search.set('resourceType', params.resourceType)
  if (params.resourceId) search.set('resourceId', params.resourceId)
  if (params.startDate) search.set('startDate', params.startDate)
  if (params.endDate) search.set('endDate', params.endDate)
  if (params.page != null) search.set('page', String(params.page))
  if (params.limit != null) search.set('limit', String(params.limit))
  const qs = search.toString()
  return qs ? `?${qs}` : ''
}

export async function getAuditLogs(params: AuditLogQueryParams = {}): Promise<AuditLogResponse> {
  return apiGet<AuditLogResponse>(`/api/v1/admin/audit-logs${buildQuery(params)}`)
}
