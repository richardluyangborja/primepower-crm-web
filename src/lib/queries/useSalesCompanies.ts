import api from "@/lib/api"
import { useQuery } from "@tanstack/react-query"

export default function useSalesCompanies() {
  return useQuery({
    queryKey: ["sales_companies"],
    queryFn: async () => {
      const response = await api.get("/api/companies/mine")
      return response.data.data as {
        id: number
        name: string
        industry: string
        is_client: boolean
        contacts: { id: number; name: string; title: string | null }[]
        leads: { id: number; status: string; company_name: string }[]
        client: { id: number; status: string; company_name: string } | null
        sales_representative: {
          id: number
          name: string
        } | null
      }[]
    },
  })
}
