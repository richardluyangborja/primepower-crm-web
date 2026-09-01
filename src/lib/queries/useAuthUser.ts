import api from "@/lib/api"
import { useQuery } from "@tanstack/react-query"

export type AuthUser = {
  id: number
  name: string
  email: string
  role: string
}

export default function useAuthUser() {
  return useQuery({
    queryKey: ["auth_user"],
    queryFn: async () => {
      const response = await api.get("/api/user")
      return response.data as AuthUser
    },
    staleTime: Infinity,
  })
}
