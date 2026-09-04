import { useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/api"

export function useSnoozeReminder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      dueDate,
    }: {
      id: number
      dueDate: string
    }) => {
      const response = await api.patch(`/api/reminders/${id}/snooze`, {
        due_date: dueDate,
      })
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
