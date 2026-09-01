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
        subject: values.subject,
        notes: values.notes,
        duration_minutes: values.duration_minutes,
        scheduled_at: values.scheduled_at,
      })
      return response.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["communications"] })
    },
  })
}
