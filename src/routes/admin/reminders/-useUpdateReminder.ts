import { useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/api"

export function useUpdateReminder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (reminderId: number) => {
      const response = await api.patch(`/api/reminders/${reminderId}`)
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
