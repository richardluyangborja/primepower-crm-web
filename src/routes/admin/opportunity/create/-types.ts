import { z } from "zod"

export type CompanyOption = {
  id: string
  name: string
  industry: string
}

export type LeadOption = {
  id: string
  company: {
    id: string
    name: string
  }
}

export type CreateOpportunityPayload = {
  company_id: string
  lead_id: string | null | undefined
  title: string
  description: string
  manpower_requirement: number | null | undefined
  estimated_contract_value: number | null | undefined
  expected_close_date: string | null | undefined
}

export const createOpportunitySchema = z.object({
  company_id: z.string().uuid("Select a company"),
  lead_id: z.string().uuid().nullable().optional(),
  title: z.string().min(1, "Opportunity title is required").max(255),
  description: z.string().max(5000).optional().default(""),
  manpower_requirement: z.coerce.number().int().min(0).nullable().optional(),
  estimated_contract_value: z.coerce.number().nullable().optional(),
  expected_close_date: z.string().nullable().optional(),
})

export type CreateOpportunityFormValues = z.infer<
  typeof createOpportunitySchema
>
