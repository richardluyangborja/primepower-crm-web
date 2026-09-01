import api from "@/lib/api"
import type { LeadInfoPage } from "../$leadId"
import type { CreateLeadPayload, SalesRepresentative } from "./-types"

export async function getSalesRepresentatives() {
  const response = await api.get<{
    data: SalesRepresentative[]
  }>("/api/sales-representatives")

  return response.data.data
}

export async function createLead(payload: CreateLeadPayload) {
  const response = await api.post<{
    data: LeadInfoPage
  }>("/api/leads", payload)

  return response.data.data
}
