import api from "@/lib/api"
import { useQuery } from "@tanstack/react-query"
import type { ReminderTableRow } from "./-RemindersTable"

export default function useRemindersQuery() {
  return useQuery({
    queryKey: ["reminders"],
    queryFn: async () => {
      const response = await api.get("/api/reminders")
      return response.data.data as ReminderTableRow[]
    },
  })
}
