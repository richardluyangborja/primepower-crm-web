import { useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/api"

export type ContactFormValues = {
  company_id: number
  first_name: string
  last_name: string
  title: string
  email: string
  phone: string
  is_primary?: boolean
}

export function useCreateContact(leadId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (values: ContactFormValues) => {
      const response = await api.post("/api/contacts", values)
      return response.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lead_details", leadId] })
    },
  })
}

export function useDeleteContact(leadId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (contactId: number) => {
      await api.delete(`/api/contacts/${contactId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lead_details", leadId] })
    },
  })
}

export function useMarkAsPrimaryContact(leadId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (contactId: number) => {
      const response = await api.patch(`/api/contacts/${contactId}`)
      return response.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lead_details", leadId] })
    },
  })
}
