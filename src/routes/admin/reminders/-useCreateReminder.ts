import { useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/api"
import type { CreateReminderFormValues } from "./create/-CreateReminderForm"

export function useCreateReminder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (values: CreateReminderFormValues) => {
      const response = await api.post("/api/reminders", {
        company_id: values.company_id,
        related_to_type: values.related_to_type,
        related_to_id: values.related_to_id,
        title: values.title,
        description: values.description,
        due_date: values.due_date,
        priority: values.priority,
        assigned_to_name: values.assigned_to_name,
      })
      return response.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reminders"] })
    },
  })
}
