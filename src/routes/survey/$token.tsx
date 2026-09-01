import { useState } from "react"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { Loader2, CheckCircle2, AlertCircle, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { Separator } from "@/components/ui/separator"
import api from "@/lib/api"

export const Route = createFileRoute("/survey/$token")({
  component: RouteComponent,
  loader: async ({ params }) => {
    const response = await api.get(`/api/surveys/${params.token}`)
    return response.data.data
  },
  pendingComponent: () => (
    <div className="flex min-h-screen items-center justify-center">
      <Spinner className="size-8" />
    </div>
  ),
  errorComponent: () => (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle />
            Invalid Survey Link
          </CardTitle>
          <CardDescription>
            This survey link is invalid or has expired. Please contact the
            organization for a new survey link.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  ),
})

const surveyQuestions = [
  {
    id: "q1",
    text: "How satisfied are you with our communication?",
    category: "Communication",
  },
  {
    id: "q2",
    text: "How would you rate the quality of our deliverables?",
    category: "Quality",
  },
  {
    id: "q3",
    text: "How satisfied are you with our timeliness?",
    category: "Timeliness",
  },
  {
    id: "q4",
    text: "How likely are you to recommend our services?",
    category: "Loyalty",
  },
  {
    id: "q5",
    text: "How satisfied are you with our responsiveness?",
    category: "Support",
  },
]

type SurveyData = {
  token: string
  status: string
  company: {
    name: string
    industry: string
  }
}

function RouteComponent() {
  const navigate = useNavigate()
  const survey: SurveyData = Route.useLoaderData()
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [scores, setScores] = useState<Record<string, number>>({
    q1: 0,
    q2: 0,
    q3: 0,
    q4: 0,
    q5: 0,
  })
  const [respondentName, setRespondentName] = useState("")
  const [respondentPosition, setRespondentPosition] = useState("")
  const [feedback, setFeedback] = useState("")

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      await api.post(`/api/surveys/${survey.token}/submit`, {
        responses: [
          { question_id: "q1", score: scores.q1 },
          { question_id: "q2", score: scores.q2 },
          { question_id: "q3", score: scores.q3 },
          { question_id: "q4", score: scores.q4 },
          { question_id: "q5", score: scores.q5 },
        ],
        respondent_name: respondentName || null,
        respondent_position: respondentPosition || null,
        feedback: feedback || null,
      })
      setSubmitted(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (survey.status === "completed") {
    return (
      <div className="mx-auto flex h-svh w-md items-center justify-center">
        <Card className="w-full">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <CheckCircle2 className="size-6 text-green-500" />
              Survey Already Completed
            </CardTitle>
            <CardDescription>
              Thank you! You have already submitted your response for this
              survey.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <span className="mx-auto">You may now close this window.</span>
          </CardFooter>
        </Card>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="mx-auto flex h-svh w-md items-center justify-center">
        <Card className="w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="size-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Thank You!</CardTitle>
            <CardDescription>
              Your response has been recorded successfully. We appreciate your
              valuable feedback!
            </CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <span className="mx-auto">You may now close this window.</span>
          </CardFooter>
        </Card>
      </div>
    )
  }

  const allAnswered = Object.values(scores).every((s) => s > 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="mx-auto max-w-2xl p-4 py-8">
        {/* Header with branding */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex items-center justify-center rounded-full text-primary-foreground">
            <img src="/pms-logo.png" alt="Primepower" className="h-auto w-40" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            Primepower Manpower Services
          </h1>
          <p className="text-muted-foreground">Client Satisfaction Survey</p>
        </div>

        {/* Company info card */}
        <Card className="mb-6">
          <CardContent className="">
            <div className="flex items-center gap-4">
              <div className="flex size-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <svg
                  className="size-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <div>
                <p className="font-semibold">{survey.company.name}</p>
                <p className="text-sm text-muted-foreground">
                  {survey.company.industry}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Survey form */}
        <Card>
          <CardHeader>
            <CardTitle>Rate Your Experience</CardTitle>
            <CardDescription>
              Please rate your experience with us on a scale of 1 to 5.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {surveyQuestions.map((question, index) => (
                <div key={question.id} className="space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-medium">{question.text}</p>
                      <p className="text-xs text-muted-foreground">
                        {question.category}
                      </p>
                    </div>
                  </div>
                  <div className="ml-9 flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() =>
                          setScores((prev) => ({ ...prev, [question.id]: num }))
                        }
                        className="group flex flex-col items-center gap-1"
                      >
                        <div
                          className={`flex size-10 items-center justify-center rounded-full border-2 transition-colors ${
                            scores[question.id] === num
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-muted hover:border-primary/50"
                          }`}
                        >
                          <Star
                            className={`size-4 ${
                              scores[question.id] === num
                                ? "fill-current"
                                : "group-hover:fill-primary/20"
                            }`}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {num}
                        </span>
                      </button>
                    ))}
                    <span className="ml-2 text-xs text-muted-foreground">
                      {scores[question.id] === 1 && "(Poor)"}
                      {scores[question.id] === 2 && "(Fair)"}
                      {scores[question.id] === 3 && "(Good)"}
                      {scores[question.id] === 4 && "(Very Good)"}
                      {scores[question.id] === 5 && "(Excellent)"}
                    </span>
                  </div>
                </div>
              ))}

              <Separator />

              {/* Optional fields */}
              <div className="space-y-4">
                <div>
                  <p className="mb-2 font-medium">About You (Optional)</p>
                  <p className="mb-3 text-sm text-muted-foreground">
                    Help us know who is providing this feedback.
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor="respondent_name">Full Name</FieldLabel>
                    <Input
                      id="respondent_name"
                      value={respondentName}
                      onChange={(e) => setRespondentName(e.target.value)}
                      placeholder="Enter your name"
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="respondent_position">
                      Position / Title
                    </FieldLabel>
                    <Input
                      id="respondent_position"
                      value={respondentPosition}
                      onChange={(e) => setRespondentPosition(e.target.value)}
                      placeholder="e.g. HR Manager, CEO"
                    />
                  </Field>
                </div>
                <Field>
                  <FieldLabel htmlFor="feedback">
                    Additional Feedback (Optional)
                  </FieldLabel>
                  <Textarea
                    id="feedback"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Share any additional thoughts, suggestions, or concerns..."
                    className="min-h-24 resize-none"
                  />
                  <FieldDescription>
                    Your feedback helps us improve our services.
                  </FieldDescription>
                </Field>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !allAnswered}
              className="gap-2"
            >
              {isSubmitting && <Loader2 className="size-4 animate-spin" />}
              {isSubmitting ? "Submitting..." : "Submit Survey"}
            </Button>
          </CardFooter>
        </Card>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Powered by Primepower Manpower Services
        </p>
      </div>
    </div>
  )
}
