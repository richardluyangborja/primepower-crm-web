import api from "@/lib/api"
import type { CreateOpportunityPayload } from "./-types"

export async function createOpportunity(payload: CreateOpportunityPayload) {
  const response = await api.post("/api/opportunities", payload)
  return response.data.data
}
