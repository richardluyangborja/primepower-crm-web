import { useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/api"
import type { LeadInfoPage } from "."

export function useUpdateLeadStatus(leadId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      to_status,
      reason,
    }: {
      to_status: string
      reason?: string
    }) => {
      const response = await api.patch(`/api/leads/${leadId}/status`, {
        to_status,
        reason,
      })
      return response.data.data as LeadInfoPage
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["lead_details", String(leadId)],
      })

      queryClient.invalidateQueries({
        queryKey: ["leads"],
      })
    },
  })
}
