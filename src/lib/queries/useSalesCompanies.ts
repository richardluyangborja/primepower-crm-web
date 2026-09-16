import api from "@/lib/api"
import { useQuery } from "@tanstack/react-query"

export default function useSalesCompanies() {
  return useQuery({
    queryKey: ["sales_companies"],
    queryFn: async () => {
      const response = await api.get("/api/companies/mine")
      return response.data.data as {
        id: string
        name: string
        industry: string
        is_client: boolean
        contacts: { id: string; name: string; title: string | null }[]
        leads: { id: string; status: string; company_name: string }[]
        client: { id: string; status: string; company_name: string } | null
        sales_representative: {
          id: string
          name: string
        } | null
      }[]
    },
  })
}
