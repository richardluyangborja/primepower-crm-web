import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { createFileRoute, useRouter } from "@tanstack/react-router"
import { ChevronLeft, CheckCircle2, Info, Pencil } from "lucide-react"
import useOpportunityDetailsQuery from "./-useOpportunityDetailsQuery"
import { useWinOpportunity } from "./-useWinOpportunity"
import { useUpdateOpportunityStage } from "./-useUpdateOpportunityStage"
import { Spinner } from "@/components/ui/spinner"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { StageTransitionModal } from "@/components/stage-transition-modal"
import type { StageHistoryEntry } from "@/components/stage-transition-modal"
import {
  ReminderHistorySection,
  type ReminderEntry,
} from "@/components/reminders-history"
import { useState } from "react"

export type OpportunityInfoPage = {
  id: number
  title: string
  stage:
    | "initial_contact"
    | "discussion"
    | "proposal"
    | "negotiation"
    | "contract_processing"
    | "won"
    | "lost"
  description: string
  company: {
    name: string
  }
  lead: {
    id: number
    status: "new" | "qualified" | "converted" | "disqualified"
    company: {
      id: number
      name: string
    }
  } | null
  assigned_to: {
    id: number
    name: string
  }
  estimated_contract_value: number | null
  expected_close_date: string | null
  lost_reason: string | null
  manpower_requirement: number | null
  stage_histories: StageHistoryEntry[]
  reminders?: ReminderEntry[]
  created_at: string
  contacts: {
    id: number
    name: string
    title: string
    email: string
    phone: string
    is_primary: boolean
  }[]
}

export const Route = createFileRoute("/admin/opportunity/$opportunityId/")({
  component: RouteComponent,
})

const stageLabels: Record<string, string> = {
  initial_contact: "Initial Contact",
  discussion: "Discussion",
  proposal: "Proposal",
  negotiation: "Negotiation",
  contract_processing: "Contract Processing",
  won: "Won",
  lost: "Lost",
}

const stageTransitions: Record<string, { label: string; value: string }[]> = {
  initial_contact: [
    { label: "Move to Discussion", value: "discussion" },
    { label: "Mark as Lost", value: "lost" },
  ],
  discussion: [
    { label: "Move to Proposal", value: "proposal" },
    { label: "Mark as Lost", value: "lost" },
  ],
  proposal: [
    { label: "Move to Negotiation", value: "negotiation" },
    { label: "Mark as Lost", value: "lost" },
  ],
  negotiation: [
    { label: "Move to Contract Processing", value: "contract_processing" },
    { label: "Mark as Lost", value: "lost" },
  ],
  contract_processing: [
    { label: "Mark as Won", value: "won" },
    { label: "Mark as Lost", value: "lost" },
  ],
}

function RouteComponent() {
  const router = useRouter()
  const { opportunityId } = Route.useParams()
  const query = useOpportunityDetailsQuery(opportunityId)
  const opportunity = query.data!

  return (
    <div className="px-4 pb-8">
      <header className="py-4">
        <Button variant="link" onClick={() => router.history.back()}>
          <ChevronLeft />
          <span>Back</span>
        </Button>
      </header>
      <main>
        {query.isPending ? (
          <div className="flex justify-center">
            <Spinner />
          </div>
        ) : (
          <div className="mt-6 flex flex-col gap-6">
            <OpportunityInfoCard
              opportunity={opportunity}
              opportunityId={Number(opportunityId)}
            />
          </div>
        )}
      </main>
    </div>
  )
}

function OpportunityInfoCard({
  opportunity,
  opportunityId,
}: {
  opportunity: OpportunityInfoPage
  opportunityId: number
}) {
  const winMutation = useWinOpportunity(opportunityId)
  const stageMutation = useUpdateOpportunityStage(opportunityId)
  const transitions = stageTransitions[opportunity.stage] ?? []

  const [modalOpen, setModalOpen] = useState(false)
  const [activeTransition, setActiveTransition] = useState<{
    label: string
    value: string
  } | null>(null)

  const handleTransitionClick = (transition: {
    label: string
    value: string
  }) => {
    setActiveTransition(transition)
    setModalOpen(true)
  }

  const handleModalSubmit = async (reason: string) => {
    if (!activeTransition) return

    if (activeTransition.value === "won") {
      await winMutation.mutateAsync({ reason })
    } else {
      await stageMutation.mutateAsync({
        stage: activeTransition.value,
        reason,
      })
    }
  }

  const isPending = winMutation.isPending || stageMutation.isPending

  const stageLabel = (value: string) => stageLabels[value] ?? value

  const modalTitle =
    activeTransition?.value === "won"
      ? "Mark as Won"
      : activeTransition?.value === "lost"
        ? "Mark as Lost"
        : "Transition Stage"

  const modalDescription =
    activeTransition?.value === "won"
      ? "Provide details about why this opportunity is being marked as won."
      : activeTransition?.value === "lost"
        ? "Provide details about why this opportunity was lost."
        : `Provide a brief note about moving this opportunity to ${stageLabel(activeTransition?.value ?? "")}.`

  return (
    <section>
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <CardTitle>{opportunity.title}</CardTitle>
              <Badge variant="secondary">
                {stageLabels[opportunity.stage] ?? opportunity.stage}
              </Badge>
            </div>
            <CardDescription>{opportunity.company.name}</CardDescription>
          </div>
          <CardAction className="flex flex-wrap gap-2">
            {transitions.map((t) => (
              <Button
                key={t.value}
                size="sm"
                variant={t.value === "lost" ? "destructive" : "default"}
                onClick={() => handleTransitionClick(t)}
                disabled={isPending}
              >
                {t.value === "won" && <CheckCircle2 className="mr-2 size-4" />}
                {t.label}
              </Button>
            ))}
            <Button variant="outline" size="icon">
              <Pencil />
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <span className="block text-sm text-muted-foreground">
              Description
            </span>
            <span>{opportunity.description}</span>
          </div>
          <div>
            <span className="block text-sm text-muted-foreground">
              Estimated Contract Value
            </span>
            <span>
              {opportunity.estimated_contract_value
                ? new Intl.NumberFormat("en-PH", {
                    style: "currency",
                    currency: "PHP",
                    minimumFractionDigits: 0,
                  }).format(opportunity.estimated_contract_value)
                : "—"}
            </span>
          </div>
          <div>
            <span className="block text-sm text-muted-foreground">
              Expected Close Date
            </span>
            <span>
              {opportunity.expected_close_date
                ? new Date(opportunity.expected_close_date).toLocaleDateString()
                : "—"}
            </span>
          </div>
          <div>
            <span className="block text-sm text-muted-foreground">
              Manpower Requirement
            </span>
            <span>
              {opportunity.manpower_requirement
                ? `${opportunity.manpower_requirement} people`
                : "—"}
            </span>
          </div>
          <div>
            <span className="block text-sm text-muted-foreground">
              Created At
            </span>
            <span>{new Date(opportunity.created_at).toDateString()}</span>
          </div>
          {opportunity.lost_reason && (
            <div className="col-span-2">
              <Alert variant="destructive">
                <Info />
                <AlertTitle>Lost Reason</AlertTitle>
                <AlertDescription>{opportunity.lost_reason}</AlertDescription>
              </Alert>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Avatar>
              <AvatarImage src={opportunity.assigned_to.name} />
              <AvatarFallback>
                {opportunity.assigned_to.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <span className="block text-sm text-muted-foreground">
                Sales Representative
              </span>
              <span>{opportunity.assigned_to.name}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {opportunity.stage_histories &&
        opportunity.stage_histories.length > 0 && (
          <StageHistorySection histories={opportunity.stage_histories} />
        )}

      {opportunity.reminders && opportunity.reminders.length > 0 && (
        <ReminderHistorySection reminders={opportunity.reminders} />
      )}

      <StageTransitionModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title={modalTitle}
        description={modalDescription}
        isPending={isPending}
        onSubmit={handleModalSubmit}
      />
    </section>
  )
}

function StageHistorySection({
  histories,
}: {
  histories: StageHistoryEntry[]
}) {
  return (
    <section>
      <h3 className="mt-6 mb-3 font-heading text-lg">Stage History</h3>
      <div className="flex flex-col gap-3">
        {histories.map((h) => (
          <div key={h.id} className="border-l-2 border-muted pl-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-sm font-medium">
                  {h.from_stage ? stageLabels[h.from_stage] : "New"} →{" "}
                  {stageLabels[h.to_stage]}
                </span>
                <span className="block text-xs text-muted-foreground">
                  {new Date(h.created_at).toLocaleString()}
                </span>
              </div>
              {h.user && (
                <span className="text-xs text-muted-foreground">
                  {h.user.name}
                </span>
              )}
            </div>
            {h.reason && <p className="mt-1 text-sm">{h.reason}</p>}
          </div>
        ))}
      </div>
    </section>
  )
}
