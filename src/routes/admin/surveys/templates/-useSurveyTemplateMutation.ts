import { useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/api"

export type SurveyTemplateFormValues = {
  name: string
  description: string | null
  is_active: boolean
  questions: {
    id: string
    text: string
    category: string
  }[]
}

export function useCreateSurveyTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (values: SurveyTemplateFormValues) => {
      const response = await api.post("/api/survey-templates", {
        name: values.name,
        description: values.description,
        is_active: values.is_active,
        questions: values.questions,
      })
      return response.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["survey-templates"] })
    },
  })
}

export function useUpdateSurveyTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      values,
    }: {
      id: number
      values: SurveyTemplateFormValues
    }) => {
      const response = await api.put(`/api/survey-templates/${id}`, {
        name: values.name,
        description: values.description,
        is_active: values.is_active,
        questions: values.questions,
      })
      return response.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["survey-templates"] })
    },
  })
}

export function useDeleteSurveyTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/api/survey-templates/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["survey-templates"] })
    },
  })
}