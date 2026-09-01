import { useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/api"

export function useWinOpportunity(opportunityId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ reason }: { reason?: string } = {}) => {
      const response = await api.post(
        `/api/opportunities/${opportunityId}/win`,
        { reason }
      )
      return response.data.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["opportunities"],
      })

      queryClient.invalidateQueries({
        queryKey: ["opportunity_details", String(opportunityId)],
      })

      if (data?.lead?.id) {
        queryClient.invalidateQueries({
          queryKey: ["lead_details", String(data.lead.id)],
        })
      }
    },
  })
}
