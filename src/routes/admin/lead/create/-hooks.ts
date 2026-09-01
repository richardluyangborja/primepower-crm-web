import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createLead, getSalesRepresentatives } from "./-api"

export function useSalesRepresentatives() {
  return useQuery({
    queryKey: ["sales-representatives"],
    queryFn: getSalesRepresentatives,
  })
}

export function useCreateLead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createLead,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["leads"],
      })
    },
  })
}
