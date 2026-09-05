import api from "@/lib/api"
import { useQuery } from "@tanstack/react-query"
import type { ReminderTableRow } from "./-RemindersTable"

export type ReminderScope = "all" | "mine"

export default function useRemindersQuery(scope: ReminderScope = "all") {
  return useQuery({
    queryKey: ["reminders", scope],
    queryFn: async () => {
      const url =
        scope === "mine"
          ? "/api/reminders/mine"
          : "/api/reminders"
      const response = await api.get(url)
      return response.data.data as ReminderTableRow[]
    },
  })
}
