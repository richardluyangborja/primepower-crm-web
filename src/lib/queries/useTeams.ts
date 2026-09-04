import api from "@/lib/api"
import { useQuery } from "@tanstack/react-query"

export type TeamRow = {
  id: number
  name: string
  description: string | null
  manager_id: number | null
  manager: { id: number; name: string; email: string } | null
  members_count: number
  created_at: string
}

export default function useTeamsQuery() {
  return useQuery({
    queryKey: ["teams"],
    queryFn: async () => {
      const response = await api.get("/api/teams")
      return (response.data.data as TeamRow[]) ?? []
    },
    staleTime: 30_000,
  })
}
