import api from "@/lib/api"
import { useQuery } from "@tanstack/react-query"

export type UserRow = {
  id: number
  name: string
  email: string
  role: "admin" | "manager" | "sales_rep"
  manager_id: number | null
  manager: { id: number; name: string } | null
  is_active: boolean
  deactivated_at: string | null
  created_at: string
  updated_at: string
}

export type UserListResponse = {
  data: UserRow[]
  links?: unknown
  meta?: unknown
}

export default function useUsersQuery(params?: {
  search?: string
  role?: string
  is_active?: boolean
}) {
  return useQuery({
    queryKey: ["users", params ?? {}],
    queryFn: async () => {
      const response = await api.get("/api/users", { params })
      return (response.data as UserListResponse).data
    },
  })
}
