import api from "@/lib/api"
import { useQuery } from "@tanstack/react-query"

export type SurveyTemplateRow = {
  id: number
  name: string
  description: string | null
  is_active: boolean
  version: number
  questions: SurveyQuestion[]
  question_count: number
  created_at: string
  updated_at: string
}

export type SurveyQuestion = {
  id: string
  text: string
  category: string
}

export default function useSurveyTemplatesQuery() {
  return useQuery({
    queryKey: ["survey-templates"],
    queryFn: async () => {
      const response = await api.get("/api/survey-templates")
      return (response.data.data as SurveyTemplateRow[]) ?? []
    },
    staleTime: 30_000,
  })
}