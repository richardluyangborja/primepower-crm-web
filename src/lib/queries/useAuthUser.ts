import api from "@/lib/api"
import { useQuery } from "@tanstack/react-query"

export type AuthUser = {
  id: string
  name: string
  email: string
  role: string
  is_active: boolean
  deactivated_at: string | null
  created_at: string
  updated_at: string
}

export default function useAuthUser() {
  return useQuery({
    queryKey: ["auth_user"],
    queryFn: async () => {
      const response = await api.get("/api/user")
      return response.data as AuthUser
    },
    staleTime: Infinity,
    retry: false,
    // /api/user 401s while logged out are expected. Don't re-fire them on
    // every window focus / reconnect — that was spamming the console.
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })
}
