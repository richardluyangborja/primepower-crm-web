import api from "@/lib/api"
import { useQuery } from "@tanstack/react-query"
import type { ReminderEntry } from "@/components/reminders-history"

export default function useReminderDetailsQuery(reminderId: string) {
  return useQuery({
    queryKey: ["reminder_details", reminderId],
    queryFn: async () => {
      const response = await api.get(`/api/reminders/${reminderId}`)
      return response.data.data as ReminderEntry
    },
    staleTime: 30_000,
  })
}
