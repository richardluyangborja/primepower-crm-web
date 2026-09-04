import { useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/api"

export function useDeleteReminder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/api/reminders/${id}`)
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
