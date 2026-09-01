import { z } from "zod"

export type CompanyOption = {
  id: number
  name: string
  industry: string
}

export type LeadOption = {
  id: number
  company: {
    id: number
    name: string
  }
}

export type CreateOpportunityPayload = {
  company_id: number
  lead_id: number | null
  title: string
  description: string
  manpower_requirement: number | null
  estimated_contract_value: number | null
  expected_close_date: string | null
}

export const createOpportunitySchema = z.object({
  company_id: z.number().int().positive("Select a company"),
  lead_id: z.number().int().positive().nullable().optional(),
  title: z.string().min(1, "Opportunity title is required").max(255),
  description: z.string().max(5000).optional().default(""),
  manpower_requirement: z.coerce.number().int().min(0).nullable().optional(),
  estimated_contract_value: z.coerce.number().nullable().optional(),
  expected_close_date: z.string().nullable().optional(),
})

export type CreateOpportunityFormValues = z.infer<
  typeof createOpportunitySchema
>
