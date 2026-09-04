import { useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/api"
import type { CreateCommunicationFormValues } from "./create/-CreateCommunicationForm"

export function useCreateCommunication() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (values: CreateCommunicationFormValues) => {
      const response = await api.post("/api/communications", {
        company_id: values.company_id,
        contact_id: values.contact_id,
        type: values.type,
        direction: values.direction,
        outcome: values.outcome,
        subject: values.subject,
        notes: values.notes,
        duration_minutes: values.duration_minutes,
        scheduled_at: values.scheduled_at,
      })
      return response.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales_communications"] })
    },
  })
}

export function useUpdateCommunication(id: number | string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (values: Partial<CreateCommunicationFormValues>) => {
      const payload: Record<string, unknown> = {}
      if (values.type !== undefined) payload.type = values.type
      if (values.direction !== undefined) payload.direction = values.direction
      if (values.outcome !== undefined) payload.outcome = values.outcome
      if (values.subject !== undefined) payload.subject = values.subject
      if (values.notes !== undefined) payload.notes = values.notes
      if (values.duration_minutes !== undefined)
        payload.duration_minutes = values.duration_minutes
      if (values.scheduled_at !== undefined)
        payload.scheduled_at = values.scheduled_at
      const response = await api.put(`/api/communications/${id}`, payload)
      return response.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales_communications"] })
      queryClient.invalidateQueries({
        queryKey: ["sales_communication_details", String(id)],
      })
    },
  })
}

export function useDeleteCommunication() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number | string) => {
      await api.delete(`/api/communications/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales_communications"] })
    },
  })
}
