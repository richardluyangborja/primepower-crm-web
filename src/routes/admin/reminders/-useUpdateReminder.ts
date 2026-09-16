import { useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/api"
import type { ReminderEntry } from "@/components/reminders-history"

export type UpdateReminderPayload = Partial<{
  title: string
  description: string | null
  due_date: string
  priority: ReminderEntry["priority"]
  status: ReminderEntry["status"]
  recurrence_rule: ReminderEntry["recurrence_rule"] | ""
  assigned_to_name: string | null
}>

export function useUpdateReminder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string
      payload: UpdateReminderPayload
    }) => {
      const response = await api.patch(`/api/reminders/${id}`, payload)
      return response.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reminders"] })
      queryClient.invalidateQueries({ queryKey: ["reminder_details"] })
      queryClient.invalidateQueries({ queryKey: ["lead_details"] })
      queryClient.invalidateQueries({ queryKey: ["client_details"] })
      queryClient.invalidateQueries({ queryKey: ["opportunity_details"] })
    },
  })
}
