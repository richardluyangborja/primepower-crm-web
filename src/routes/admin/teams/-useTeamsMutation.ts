import { useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/api"

export type TeamFormValues = {
  name: string
  description: string
  manager_id: number | null
}

export function useCreateTeam() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (values: TeamFormValues) => {
      const response = await api.post("/api/teams", {
        name: values.name,
        description: values.description || null,
        manager_id: values.manager_id,
      })
      return response.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] })
    },
  })
}

export function useUpdateTeam() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      values,
    }: {
      id: number
      values: TeamFormValues
    }) => {
      const response = await api.put(`/api/teams/${id}`, {
        name: values.name,
        description: values.description || null,
        manager_id: values.manager_id,
      })
      return response.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] })
    },
  })
}

export function useDeleteTeam() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/api/teams/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] })
    },
  })
}
