import { useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/api"

export type EscalationRuleFormValues = {
  name: string
  entity_type: "lead" | "client" | "opportunity" | "reminder"
  condition: string
  threshold_days: number
  action_type:
    "create_reminder" | "notify_manager" | "create_reminder_and_notify"
  reminder_title?: string | null
  reminder_priority?: "low" | "medium" | "high" | null
  reminder_due_in_days?: number | null
  is_active: boolean
}

export function useCreateEscalationRule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (values: EscalationRuleFormValues) => {
      const response = await api.post("/api/escalation-rules", {
        name: values.name,
        entity_type: values.entity_type,
        condition: values.condition,
        threshold_days: values.threshold_days,
        action_type: values.action_type,
        reminder_title: values.reminder_title || null,
        reminder_priority: values.reminder_priority || null,
        reminder_due_in_days: values.reminder_due_in_days || null,
        is_active: values.is_active,
      })
      return response.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["escalation-rules"] })
    },
  })
}

export function useUpdateEscalationRule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      values,
    }: {
      id: number
      values: EscalationRuleFormValues
    }) => {
      const response = await api.put(`/api/escalation-rules/${id}`, {
        name: values.name,
        entity_type: values.entity_type,
        condition: values.condition,
        threshold_days: values.threshold_days,
        action_type: values.action_type,
        reminder_title: values.reminder_title || null,
        reminder_priority: values.reminder_priority || null,
        reminder_due_in_days: values.reminder_due_in_days || null,
        is_active: values.is_active,
      })
      return response.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["escalation-rules"] })
    },
  })
}

export function useDeleteEscalationRule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/api/escalation-rules/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["escalation-rules"] })
    },
  })
}
