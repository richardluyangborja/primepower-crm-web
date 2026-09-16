import api from "@/lib/api"
import type { CreateOpportunityPayload } from "../../create/-types"

export async function updateOpportunity(
  opportunityId: string,
  payload: CreateOpportunityPayload
) {
  const response = await api.patch(
    `/api/opportunities/${opportunityId}`,
    payload
  )
  return response.data.data
}
