import api from "@/lib/api"
import { useQuery } from "@tanstack/react-query"

export type EscalationRuleRow = {
  id: number
  name: string
  entity_type: "lead" | "client" | "opportunity" | "reminder"
  condition: string
  condition_label: string
  threshold_days: number
  action_type:
    "create_reminder" | "notify_manager" | "create_reminder_and_notify"
  action_label: string
  reminder_title: string | null
  reminder_priority: "low" | "medium" | "high" | null
  reminder_due_in_days: number | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export default function useEscalationRulesQuery() {
  return useQuery({
    queryKey: ["escalation-rules"],
    queryFn: async () => {
      const response = await api.get("/api/escalation-rules")
      return (response.data.data as EscalationRuleRow[]) ?? []
    },
    staleTime: 30_000,
  })
}
