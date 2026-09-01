import api from "@/lib/api"
import { useQuery } from "@tanstack/react-query"

export type AuditLogEntry = {
  id: number
  actor_name: string | null
  actor_email: string | null
  actor_role: string | null
  module: string
  action: string
  subject_type: string | null
  subject_id: string | null
  subject_name: string | null
  description: string | null
  metadata: Record<string, unknown> | null
  created_at: string
}

export type AuditLogMeta = {
  current_page: number
  last_page: number
  total: number
  per_page: number
  from: number | null
  to: number | null
}

export type AuditLogResponse = {
  data: AuditLogEntry[]
  meta: AuditLogMeta
}

export type AuditLogFilters = {
  search?: string
  module?: string
  page?: number
}

export const AUDIT_MODULES = [
  "Lead",
  "Client",
  "Contact",
  "Opportunity",
  "Communication",
  "Reminder",
  "Client Satisfaction",
] as const

export default function useAuditLogsQuery(filters: AuditLogFilters = {}) {
  return useQuery({
    queryKey: ["audit-logs", filters],
    queryFn: async () => {
      const response = await api.get("/api/audit-logs", { params: filters })
      return response.data as AuditLogResponse
    },
  })
}
