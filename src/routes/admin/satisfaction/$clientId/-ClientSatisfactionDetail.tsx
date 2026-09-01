import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Spinner } from "@/components/ui/spinner"
import {
  Copy,
  Loader2,
  Mail,
  Phone,
  Globe,
  MapPin,
  CheckCircle2,
  Clock,
  AlertCircle,
  Info,
  Send,
  Trash,
  User,
  MessageSquare,
  Link2,
  Calendar,
  Star,
  TrendingUp,
} from "lucide-react"
import { useState } from "react"
import { surveyStatusLabels, surveyStatusVariant, type Survey } from "../-types"
import {
  useCreateSurvey,
  useDeleteSurvey,
  useSatisfactionDetailQuery,
} from "../-useSatisfactionQuery"

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

function ScoreBar({ score }: { score: number | null | undefined }) {
  const numScore =
    score === null || score === undefined
      ? 0
      : typeof score === "string"
        ? parseFloat(score)
        : score

  const percentage = (numScore / 5) * 100
  const color =
    numScore >= 4
      ? "bg-green-500"
      : numScore >= 3
        ? "bg-yellow-500"
        : "bg-red-500"

  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-24 overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full ${color}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-sm font-medium">{numScore.toFixed(1)}</span>
    </div>
  )
}

function SurveyDetailCard({
  survey,
  onDelete,
}: {
  survey: Survey
  onDelete: (survey: Survey) => void
}) {
  const isDeletable = survey.status === "pending" || survey.status === "expired"
  const [copied, setCopied] = useState(false)

  const statusConfig = {
    completed: {
      icon: <CheckCircle2 className="size-5" />,
      color: "text-green-600",
      bg: "bg-green-50 border-green-200",
    },
    pending: {
      icon: <Clock className="size-5" />,
      color: "text-amber-600",
      bg: "bg-amber-50 border-amber-200",
    },
    expired: {
      icon: <AlertCircle className="size-5" />,
      color: "text-red-600",
      bg: "bg-red-50 border-red-200",
    },
  }

  const config = statusConfig[survey.status]
  const surveyUrl = `${window.location.origin}/survey/${survey.token}`

  const handleCopyUrl = async () => {
    await navigator.clipboard.writeText(surveyUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const numScore =
    survey.average_score != null
      ? typeof survey.average_score === "string"
        ? parseFloat(survey.average_score)
        : survey.average_score
      : null

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className={`rounded-lg border p-2 ${config.bg}`}>
              <span className={config.color}>{config.icon}</span>
            </div>
            <div>
              <CardTitle className="text-base">
                Survey on{" "}
                {new Date(survey.created_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </CardTitle>
              <div className="mt-1 flex items-center gap-2">
                <Badge variant={surveyStatusVariant[survey.status]}>
                  {surveyStatusLabels[survey.status]}
                </Badge>
                {survey.completed_at && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="size-3" />
                    Completed{" "}
                    {new Date(survey.completed_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                )}
              </div>
            </div>
          </div>
          {numScore !== null && (
            <div className="text-right">
              <div className="flex items-center gap-1">
                <Star className="size-4 fill-primary text-primary" />
                <span className="text-xl font-bold">
                  {numScore.toFixed(1)}
                </span>
              </div>
              <span className="text-xs text-muted-foreground">avg score</span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Survey URL */}
        <div className="rounded-lg border bg-muted/50 p-3">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium">
            <Link2 className="size-4" />
            Survey Link
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 overflow-hidden rounded-md border bg-background px-3 py-2">
              <code className="block truncate text-sm">{surveyUrl}</code>
            </div>
            <Button size="icon" variant="outline" onClick={handleCopyUrl}>
              {copied ? (
                <CheckCircle2 className="size-4 text-green-500" />
              ) : (
                <Copy className="size-4" />
              )}
            </Button>
          </div>
          {copied && (
            <div className="mt-2 flex items-center gap-1 text-xs text-green-600">
              <CheckCircle2 className="size-3" />
              Copied to clipboard!
            </div>
          )}
        </div>

        {/* Responses */}
        {survey.responses && survey.responses.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <TrendingUp className="size-4" />
              Responses
            </div>
            {surveyQuestions.map((q) => {
              const response = survey.responses?.find(
                (r) => r.question_id === q.id
              )
              return (
                <div
                  key={q.id}
                  className="flex items-center justify-between rounded-md border p-3"
                >
                  <div className="flex flex-col">
                    <span className="text-sm">{q.text}</span>
                    <span className="text-xs text-muted-foreground">
                      {q.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((num) => (
                        <div
                          key={num}
                          className={`size-4 rounded-full ${
                            response && num <= response.score
                              ? "bg-primary"
                              : "bg-muted"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="w-8 text-right text-sm font-bold">
                      {response?.score ?? "—"}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Respondent info */}
        {(survey.respondent_name || survey.respondent_position) && (
          <div className="rounded-lg border bg-blue-50/50 p-3">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-blue-700">
              <User className="size-4" />
              Respondent
            </div>
            <div className="text-sm text-blue-600">
              {survey.respondent_name && (
                <div className="font-medium">{survey.respondent_name}</div>
              )}
              {survey.respondent_position && (
                <div className="text-blue-500">{survey.respondent_position}</div>
              )}
            </div>
          </div>
        )}

        {/* Feedback */}
        {survey.feedback && (
          <div className="rounded-lg border bg-muted/50 p-3">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium">
              <MessageSquare className="size-4" />
              Additional Feedback
            </div>
            <p className="text-sm text-muted-foreground">{survey.feedback}</p>
          </div>
        )}
      </CardContent>

      {isDeletable && (
        <CardFooter className="border-t bg-muted/30 px-6 py-3">
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(survey)}
          >
            <Trash className="mr-2 size-4" />
            Delete Survey
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}

function ClientSatisfactionDetail({ clientId }: { clientId: number }) {
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [linkDialogOpen, setLinkDialogOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [surveyLink, setSurveyLink] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Survey | null>(null)

  const query = useSatisfactionDetailQuery(clientId)
  const createSurvey = useCreateSurvey(clientId)
  const deleteSurvey = useDeleteSurvey(clientId)

  const hasPendingSurvey =
    query.data?.surveys.some((s) => s.status === "pending") ?? false

  const handleConfirmGenerate = async () => {
    setConfirmDialogOpen(false)
    const result = await createSurvey.mutateAsync()
    setSurveyLink(result.link)
    setLinkDialogOpen(true)
  }

  const handleCopyLink = async () => {
    if (!surveyLink) return
    await navigator.clipboard.writeText(surveyLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDeleteClick = (survey: Survey) => {
    setDeleteTarget(survey)
  }

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return
    await deleteSurvey.mutateAsync(deleteTarget.id)
    setDeleteTarget(null)
  }

  if (query.isPending) {
    return (
      <div className="flex justify-center">
        <Spinner />
      </div>
    )
  }

  const detail = query.data
  if (!detail) return null

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Avatar className="size-10">
                <AvatarFallback>
                  {detail.company.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle>{detail.company.name}</CardTitle>
                <CardDescription>{detail.company.industry}</CardDescription>
              </div>
            </div>
          </div>
          <CardAction>
            <Button
              onClick={() => setConfirmDialogOpen(true)}
              disabled={createSurvey.isPending || hasPendingSurvey}
            >
              <Send className="mr-2 size-4" />
              {createSurvey.isPending
                ? "Generating..."
                : hasPendingSurvey
                  ? "Pending Survey Exists"
                  : "Send Survey to Client"}
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <span className="block text-sm text-muted-foreground">
                Total Surveys
              </span>
              <span className="text-2xl font-semibold">
                {detail.total_surveys}
              </span>
            </div>
            <div>
              <span className="block text-sm text-muted-foreground">
                Completed
              </span>
              <span className="text-2xl font-semibold">
                {detail.completed_surveys}
              </span>
            </div>
            <div>
              <span className="block text-sm text-muted-foreground">
                Average Score
              </span>
              <div className="mt-1">
                <ScoreBar score={detail.average_score} />
              </div>
            </div>
            <div>
              <span className="block text-sm text-muted-foreground">Trend</span>
              {detail.surveys.length >= 2 ? (
                <Badge variant="secondary">Calculated</Badge>
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {detail.primary_contact?.name && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Primary Contact</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Avatar>
                <AvatarFallback>
                  {detail.primary_contact.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="font-medium">
                  {detail.primary_contact.name}
                </span>
                <span className="text-sm text-muted-foreground">
                  {detail.primary_contact.title}
                </span>
              </div>
              <div className="ml-auto flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Mail className="size-4" />
                  <span>{detail.primary_contact.email}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Company Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {detail.company.address && (
              <div className="flex items-start gap-2">
                <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Address</span>
                  <span className="text-sm text-muted-foreground">
                    {detail.company.address}
                  </span>
                </div>
              </div>
            )}
            {detail.company.phone && (
              <div className="flex items-start gap-2">
                <Phone className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Phone</span>
                  <span className="text-sm text-muted-foreground">
                    {detail.company.phone}
                  </span>
                </div>
              </div>
            )}
            {detail.company.website && (
              <div className="flex items-start gap-2">
                <Globe className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Website</span>
                  <span className="text-sm text-muted-foreground">
                    {detail.company.website}
                  </span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div>
        <h3 className="mb-3 font-heading text-lg">Survey History</h3>
        {detail.surveys.length > 0 ? (
          <div className="space-y-4">
            {detail.surveys.map((survey) => (
              <SurveyDetailCard
                key={survey.id}
                survey={survey}
                onDelete={handleDeleteClick}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No surveys sent yet. Click "Send Survey to Client" to get started.
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="max-w-fit!">
          <DialogHeader>
            <DialogTitle>Delete Survey?</DialogTitle>
            <DialogDescription>
              This will permanently delete this survey. This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deleteSurvey.isPending}
            >
              {deleteSurvey.isPending && (
                <Loader2 className="mr-2 size-4 animate-spin" />
              )}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent className="max-w-fit!">
          <DialogHeader>
            <DialogTitle>Generate Survey Link?</DialogTitle>
            <DialogDescription>
              This will create a new survey link for {detail.company.name}. You
              can only have one pending survey at a time.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setConfirmDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmGenerate}
              disabled={createSurvey.isPending}
            >
              {createSurvey.isPending && (
                <Loader2 className="mr-2 size-4 animate-spin" />
              )}
              Generate Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
        <DialogContent className="max-w-fit!">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="size-5" />
              Survey Ready to Send
            </DialogTitle>
            <DialogDescription>
              A unique survey link has been generated for {detail.company.name}.
              Copy the link below and send it to your client via email or
              messaging.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="flex items-center gap-2">
              <div className="flex-1 overflow-hidden rounded-md border bg-muted px-3 py-2">
                <code className="block truncate text-sm">
                  {surveyLink ?? "Generating..."}
                </code>
              </div>
              <Button size="icon" variant="outline" onClick={handleCopyLink}>
                {copied ? (
                  <CheckCircle2 className="size-4" />
                ) : (
                  <Copy className="size-4" />
                )}
              </Button>
            </div>

            {copied && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle2 className="size-4" />
                Link copied to clipboard!
              </div>
            )}

            {detail.primary_contact && (
              <div className="rounded-md border bg-muted/50 p-3">
                <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                  <Mail className="size-4" />
                  Suggested Recipient
                </div>
                <div className="text-sm text-muted-foreground">
                  <div>
                    {detail.primary_contact.name} (
                    {detail.primary_contact.title})
                  </div>
                  <div>{detail.primary_contact.email}</div>
                </div>
              </div>
            )}

            <div className="rounded-md border bg-blue-50 p-3">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-blue-700">
                <Info className="size-4" />
                What happens next?
              </div>
              <ul className="space-y-1 text-sm text-blue-600">
                <li>• Copy the link above and send it to your client</li>
                <li>• The client can access the survey without logging in</li>
                <li>
                  • Once submitted, the survey will be recorded automatically
                </li>
                <li>• The link expires after 30 days if not completed</li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setLinkDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default ClientSatisfactionDetail
