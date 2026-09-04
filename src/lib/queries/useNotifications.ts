import api from "@/lib/api"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

export type NotificationItem = {
  id: string
  type: string | null
  title: string | null
  message: string | null
  reminder_id: number | null
  related_to_type: "lead" | "client" | "opportunity" | null
  related_to_id: number | null
  due_date: string | null
  priority: string | null
  read_at: string | null
  created_at: string
}

export function useNotificationsQuery(unreadOnly = false) {
  return useQuery({
    queryKey: ["notifications", { unreadOnly }],
    queryFn: async () => {
      const response = await api.get("/api/notifications", {
        params: unreadOnly ? { unread_only: 1 } : undefined,
      })
      return (response.data.data ?? []) as NotificationItem[]
    },
  })
}

export function useUnreadCountQuery() {
  return useQuery({
    queryKey: ["notifications", "unread_count"],
    queryFn: async () => {
      const response = await api.get("/api/notifications/unread-count")
      return (response.data.count ?? 0) as number
    },
    refetchInterval: 60_000,
  })
}

export function useMarkNotificationRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.patch(`/api/notifications/${id}/read`)
      return response.data.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] })
    },
  })
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      await api.post("/api/notifications/mark-all-read")
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] })
    },
  })
}
