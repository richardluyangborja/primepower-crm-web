import api from "@/lib/api"
import { useQuery } from "@tanstack/react-query"

export default function useOpportunitiesQuery() {
  return useQuery({
    queryKey: ["sales_opportunities"],
    queryFn: async () => {
      const response = await api.get("/api/opportunities/mine")
      return response.data.data as Opportunity[]
    },
  })
}

type Opportunity = {
  id: number
  title: string
  stage:
    | "initial_contact"
    | "discussion"
    | "proposal"
    | "negotiation"
    | "contract_processing"
    | "won"
    | "lost"
  description: string | null
  manpower_requirement: number | null
  company: {
    id: number
    name: string
    industry: string
  }
  assigned_to: {
    id: number
    name: string
  }
  estimated_contract_value: number | null
  expected_close_date: string | null
}
