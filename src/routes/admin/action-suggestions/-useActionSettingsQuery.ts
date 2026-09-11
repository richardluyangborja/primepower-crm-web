import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/api"

export type ActionSettings = Record<string, string>

export function useActionSettingsQuery() {
  return useQuery({
    queryKey: ["action-suggestion-settings"],
    queryFn: async () => {
      const { data } = await api.get<{ data: ActionSettings }>(
        "/api/action-suggestions/settings"
      )
      return data.data
    },
  })
}

export function useUpdateActionSettingsMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (settings: Record<string, number>) => {
      const { data } = await api.put<{ data: ActionSettings }>(
        "/api/action-suggestions/settings",
        settings
      )
      return data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["action-suggestion-settings"] })
      queryClient.invalidateQueries({ queryKey: ["action-suggestions"] })
    },
  })
}
