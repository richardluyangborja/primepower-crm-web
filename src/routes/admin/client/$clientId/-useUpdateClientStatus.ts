import { useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/api"
import type { ClientInfoPage } from "."

export function useUpdateClientStatus(clientId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      status,
      reason,
    }: {
      status: "active" | "inactive"
      reason?: string
    }) => {
      const response = await api.patch(`/api/clients/${clientId}/status`, {
        status,
        reason,
      })
      return response.data.data as ClientInfoPage
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["client_details", String(clientId)],
      })
    },
  })
}
