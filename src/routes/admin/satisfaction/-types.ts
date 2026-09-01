export type SurveyStatus = "pending" | "completed" | "expired"

export type SurveyQuestion = {
  id: string
  text: string
  category: string
}

export type SurveyResponse = {
  question_id: string
  score: number
}

export type Survey = {
  id: number
  token: string
  client_id: number
  status: SurveyStatus
  created_at: string
  completed_at: string | null
  responses: SurveyResponse[] | null
  average_score: string | null
  respondent_name?: string | null
  respondent_position?: string | null
  feedback?: string | null
}

export type ClientSatisfactionSummary = {
  id: number
  company: {
    name: string
    industry: string
    address?: string
    phone?: string
    website?: string
  }
  primary_contact?: {
    name: string
    title: string
  }
  total_surveys: number
  completed_surveys: number
  pending_surveys: number
  last_survey_date: string | null
  average_score: string | null
  trend: "up" | "down" | "stable" | null
}

export type ClientSatisfactionDetail = {
  id: number
  company: {
    name: string
    industry: string
    address?: string
    phone?: string
    website?: string
  }
  primary_contact?: {
    name: string
    title: string
    email: string
    phone: string
  }
  total_surveys: number
  completed_surveys: number
  pending_surveys: number
  average_score: string | null
  surveys: Survey[]
}

export const surveyStatusLabels: Record<SurveyStatus, string> = {
  pending: "Pending",
  completed: "Completed",
  expired: "Expired",
}

export const surveyStatusVariant: Record<
  SurveyStatus,
  "default" | "secondary" | "outline"
> = {
  pending: "outline",
  completed: "default",
  expired: "secondary",
}

export const trendLabels: Record<string, string> = {
  up: "Improving",
  down: "Declining",
  stable: "Stable",
}

export const trendVariant: Record<
  string,
  "default" | "secondary" | "destructive"
> = {
  up: "default",
  down: "destructive",
  stable: "secondary",
}
