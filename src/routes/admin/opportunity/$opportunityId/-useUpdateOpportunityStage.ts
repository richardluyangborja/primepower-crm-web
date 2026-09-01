import { useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/api"
import type { OpportunityInfoPage } from "."

export function useUpdateOpportunityStage(opportunityId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      stage,
      reason,
    }: {
      stage: string
      reason?: string
    }) => {
      const response = await api.patch(
        `/api/opportunities/${opportunityId}/stage`,
        {
          stage,
          reason,
        }
      )
      return response.data.data as OpportunityInfoPage
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["opportunity_details", String(opportunityId)],
      })

      queryClient.invalidateQueries({
        queryKey: ["opportunities"],
      })
    },
  })
}
