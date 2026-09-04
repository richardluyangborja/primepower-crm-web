import { useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/api"

export function useMarkReminderIncomplete() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (reminderId: number) => {
      const response = await api.patch(`/api/reminders/${reminderId}/incomplete`)
      return response.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales_reminders"] })
      queryClient.invalidateQueries({ queryKey: ["sales_reminder_details"] })
      queryClient.invalidateQueries({ queryKey: ["sales_lead_details"] })
      queryClient.invalidateQueries({ queryKey: ["sales_client_details"] })
      queryClient.invalidateQueries({ queryKey: ["sales_opportunity_details"] })
    },
  })
}
