import api from "@/lib/api"
import { useQuery } from "@tanstack/react-query"

export function useIsLoggedInHook() {
  return useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      return api.get("/api/me")
    },
  })
}
