import { z } from "zod"

export type SalesRepresentative = {
  id: number
  name: string
}

export type CreateLeadPayload = {
  company: {
    name: string
    industry: string
    address: string
    phone: string
    email: string
    website: string
  }

  primary_contact: {
    first_name: string
    last_name: string
    title: string
    email: string
    phone: string
  }

  source: string
  assigned_to_id: number
  notes: string
}

export const createLeadSchema = z.object({
  company: z.object({
    name: z.string().min(1, "Company name is required").max(255),

    industry: z.string().min(1, "Industry is required").max(100),

    address: z.string().min(1, "Address is required").max(500),

    phone: z.string().min(1, "Phone number is required").max(50),

    email: z
      .string()
      .min(1, "Company email is required")
      .email("Enter a valid email address")
      .max(255),

    website: z.string().url("Enter a valid URL").max(255).or(z.literal("")),
  }),

  primary_contact: z.object({
    first_name: z.string().min(1, "First name is required").max(100),

    last_name: z.string().min(1, "Last name is required").max(100),

    title: z.string().min(1, "Job title is required").max(100),

    email: z
      .string()
      .min(1, "Contact email is required")
      .email("Enter a valid email address")
      .max(255),

    phone: z.string().min(1, "Phone number is required").max(50),
  }),

  source: z.string().min(1, "Lead source is required").max(100),

  assigned_to_id: z.number().int().positive("Select a sales representative"),

  notes: z.string().max(5000, "Notes cannot exceed 5000 characters"),
})

export type CreateLeadFormValues = z.infer<typeof createLeadSchema>
