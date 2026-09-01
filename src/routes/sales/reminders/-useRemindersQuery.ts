import api from "@/lib/api"
import { useQuery } from "@tanstack/react-query"
import type { ReminderTableRow } from "./-RemindersTable"

export default function useRemindersQuery() {
  return useQuery({
    queryKey: ["sales_reminders"],
    queryFn: async () => {
      const response = await api.get("/api/reminders/mine")
      return response.data.data as ReminderTableRow[]
    },
  })
}
