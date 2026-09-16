import api from "@/lib/api"
import { useQuery } from "@tanstack/react-query"
import type { ReminderTableRow } from "./-RemindersTable"

export type ReminderScope = "all" | "mine"

export type ReminderFilters = {
  q?: string
  status?: string
  priority?: string
  from?: string
  to?: string
  overdue?: boolean
}

export default function useRemindersQuery(
  scope: ReminderScope = "all",
  filters: ReminderFilters = {}
) {
  return useQuery({
    queryKey: ["reminders", scope, filters],
    queryFn: async () => {
      const url = scope === "mine" ? "/api/reminders/mine" : "/api/reminders"
      const params: Record<string, string | boolean> = {}
      if (filters.q) params.q = filters.q
      if (filters.status && filters.status !== "all")
        params.status = filters.status
      if (filters.priority && filters.priority !== "all")
        params.priority = filters.priority
      if (filters.from) params.from = filters.from
      if (filters.to) params.to = filters.to
      if (filters.overdue) params.overdue = true
      const response = await api.get(url, { params })
      return response.data.data as ReminderTableRow[]
    },
  })
}
