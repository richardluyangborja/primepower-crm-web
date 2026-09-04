import { useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/api"

export function useDeleteReminder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/api/reminders/${id}`)
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
