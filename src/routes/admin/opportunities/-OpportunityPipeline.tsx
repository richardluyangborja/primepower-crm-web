import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { useNavigate, Link } from "@tanstack/react-router"
import { formatCurrency } from "@/lib/utils"
import {
  Calendar,
  CheckCircle2,
  ChevronRight,
  Plus,
  UserRound,
  Users,
} from "lucide-react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import api from "@/lib/api"
import { StageTransitionModal } from "@/components/stage-transition-modal"
import useOpportunitiesQuery from "./-useOpportunitiesQuery"

const stages = [
  {
    key: "initial_contact",
    label: "Initial Contact",
    next: "discussion",
    nextLabel: "Discussion",
  },
  {
    key: "discussion",
    label: "Discussion",
    next: "proposal",
    nextLabel: "Proposal",
  },
  {
    key: "proposal",
    label: "Proposal",
    next: "negotiation",
    nextLabel: "Negotiation",
  },
  {
    key: "negotiation",
    label: "Negotiation",
    next: "contract_processing",
    nextLabel: "Contract Processing",
  },
  {
    key: "contract_processing",
    label: "Contract Processing",
    next: null,
    nextLabel: null,
  },
  { key: "won", label: "Won", next: null, nextLabel: null },
  { key: "lost", label: "Lost", next: null, nextLabel: null },
]

export type OpportunityPipelineCard = {
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
  description: string | null
  manpower_requirement: number | null
  company: {
    id: number
    name: string
    industry: string
  }
  assigned_to: {
    id: number
    name: string
  }
  estimated_contract_value: number | null
  expected_close_date: string | null
}

export default function OpportunityPipeline() {
  const navigate = useNavigate()
  const query = useOpportunitiesQuery()
  const data = query.data
  const queryClient = useQueryClient()

  const [modalOpen, setModalOpen] = useState(false)
  const [activeTransition, setActiveTransition] = useState<{
    opportunityId: number
    label: string
    stage: string
  } | null>(null)

  const stageMutation = useMutation({
    mutationFn: async ({
      opportunityId,
      stage,
      reason,
    }: {
      opportunityId: number
      stage: string
      reason: string
    }) => {
      const response = await api.patch(
        `/api/opportunities/${opportunityId}/stage`,
        { stage, reason }
      )
      return response.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["opportunities"] })
      queryClient.invalidateQueries({ queryKey: ["opportunity_details"] })
    },
  })

  const winMutation = useMutation({
    mutationFn: async ({
      opportunityId,
      reason,
    }: {
      opportunityId: number
      reason: string
    }) => {
      const response = await api.post(
        `/api/opportunities/${opportunityId}/win`,
        { reason }
      )
      return response.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["opportunities"] })
      queryClient.invalidateQueries({ queryKey: ["opportunity_details"] })
    },
  })

  const grouped = stages.reduce(
    (acc, stage) => {
      acc[stage.key] = data?.filter((o) => o.stage === stage.key) ?? []
      return acc
    },
    {} as Record<string, OpportunityPipelineCard[]>
  )

  const isPending = stageMutation.isPending || winMutation.isPending

  const handleTransitionClick = (
    opportunityId: number,
    stage: string,
    label: string
  ) => {
    setActiveTransition({ opportunityId, stage, label })
    setModalOpen(true)
  }

  const handleModalSubmit = async (reason: string) => {
    if (!activeTransition) return

    if (activeTransition.stage === "won") {
      await winMutation.mutateAsync({
        opportunityId: activeTransition.opportunityId,
        reason,
      })
    } else {
      await stageMutation.mutateAsync({
        opportunityId: activeTransition.opportunityId,
        stage: activeTransition.stage,
        reason,
      })
    }
  }

  const modalTitle = activeTransition
    ? activeTransition.stage === "won"
      ? "Mark as Won"
      : `Move to ${activeTransition.label}`
    : ""

  const modalDescription = activeTransition
    ? activeTransition.stage === "won"
      ? "Provide details about why this opportunity is being marked as won."
      : `Provide a brief note about moving this opportunity to ${activeTransition.label}.`
    : ""

  return (
    <>
      <ScrollArea>
        <div className="flex gap-6 p-4" style={{ flexWrap: "nowrap" }}>
          {stages.map((stage) => (
            <div
              key={stage.key}
              className="flex w-xs shrink-0 flex-col gap-3 px-3"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-medium">{stage.label}</h3>
                <Badge variant="secondary">
                  {grouped[stage.key]?.length ?? 0}
                </Badge>
              </div>
              {stage.key === "initial_contact" && (
                <Button asChild className="w-full">
                  <Link to="/admin/opportunity/create">
                    <Plus className="mr-2 size-4" />
                    Create opportunity
                  </Link>
                </Button>
              )}
              <ScrollArea className="h-[calc(100vh-220px)]">
                <div className="flex flex-col gap-3 px-2 py-3">
                  {grouped[stage.key]?.map((opportunity) => (
                    <Card
                      key={opportunity.id}
                      className="cursor-pointer hover:border-primary/50"
                      onClick={() =>
                        navigate({
                          to: "/admin/opportunity/$opportunityId",
                          params: {
                            opportunityId: opportunity.id.toString(),
                          },
                        })
                      }
                    >
                      <CardContent className="px-4">
                        <div className="flex flex-col gap-3">
                          <h4 className="font-heading text-base font-semibold">
                            {opportunity.title}
                          </h4>

                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-xs">
                                {opportunity.company.name
                                  .split(" ")
                                  .map((w) => w[0])
                                  .join("")
                                  .slice(0, 2)
                                  .toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                              <span className="text-xs text-muted-foreground">
                                {opportunity.company.name}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {opportunity.company.industry}
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-col gap-1.5 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                              <UserRound size={12} />
                              <span>{opportunity.assigned_to.name}</span>
                            </div>

                            {opportunity.expected_close_date && (
                              <div className="flex items-center gap-1.5">
                                <Calendar size={12} />
                                <span>
                                  Close:{" "}
                                  {new Date(
                                    opportunity.expected_close_date
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                            )}

                            {opportunity.manpower_requirement &&
                              opportunity.manpower_requirement > 0 && (
                                <div className="flex items-center gap-1.5">
                                  <Users size={12} />
                                  <span>
                                    {opportunity.manpower_requirement} people
                                  </span>
                                </div>
                              )}
                          </div>

                          {opportunity.estimated_contract_value && (
                            <div className="flex items-center justify-between border-t border-border pt-2">
                              <span className="text-xs text-muted-foreground">
                                Est. Value
                              </span>
                              <span className="text-sm font-medium">
                                {formatCurrency(
                                  opportunity.estimated_contract_value
                                )}
                              </span>
                            </div>
                          )}

                          {stage.key === "contract_processing" && (
                            <Button
                              variant="default"
                              size="sm"
                              className="mt-1 w-full"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleTransitionClick(
                                  opportunity.id,
                                  "won",
                                  "Won"
                                )
                              }}
                              disabled={isPending}
                            >
                              <CheckCircle2 className="mr-2 size-4" />
                              Mark as Won
                            </Button>
                          )}

                          {stage.next &&
                            stage.key !== "contract_processing" && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="mt-1 w-full"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleTransitionClick(
                                    opportunity.id,
                                    stage.next!,
                                    stage.nextLabel!
                                  )
                                }}
                                disabled={isPending}
                              >
                                <ChevronRight className="mr-2 size-4" />
                                Move to {stage.nextLabel}
                              </Button>
                            )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <ScrollBar orientation="vertical" />
              </ScrollArea>
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      <StageTransitionModal
        open={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open)
          if (!open) setActiveTransition(null)
        }}
        title={modalTitle}
        description={modalDescription}
        isPending={isPending}
        onSubmit={handleModalSubmit}
      />
    </>
  )
}
