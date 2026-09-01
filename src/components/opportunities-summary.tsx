import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useNavigate } from "@tanstack/react-router"
import { ChevronRight } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

export type OpportunityStage =
  | "initial_contact"
  | "discussion"
  | "proposal"
  | "negotiation"
  | "contract_processing"
  | "won"
  | "lost"

export type OpportunitySummary = {
  id: number
  title: string
  stage: OpportunityStage
  estimated_contract_value: number | null
  expected_close_date: string | null
  assigned_to: {
    id: number
    name: string
  }
}

const stageLabels: Record<OpportunityStage, string> = {
  initial_contact: "Initial Contact",
  discussion: "Discussion",
  proposal: "Proposal",
  negotiation: "Negotiation",
  contract_processing: "Contract Processing",
  won: "Won",
  lost: "Lost",
}

const stageVariant: Record<
  OpportunityStage,
  "default" | "secondary" | "outline"
> = {
  initial_contact: "secondary",
  discussion: "secondary",
  proposal: "secondary",
  negotiation: "secondary",
  contract_processing: "default",
  won: "default",
  lost: "outline",
}

export default function OpportunitiesSummary({
  opportunities,
  basePath = "/admin",
}: {
  opportunities: OpportunitySummary[]
  basePath?: string
}) {
  const navigate = useNavigate()

  if (opportunities.length === 0) {
    return null
  }

  return (
    <section>
      <header className="mb-3 flex items-center justify-between">
        <h2 className="font-heading text-lg">Opportunities</h2>
        <Button
          variant="link"
          className="text-sm"
          onClick={() => navigate({ to: `${basePath}/opportunities` })}
        >
          View all
          <ChevronRight className="ml-1 size-3" />
        </Button>
      </header>
      <div className="flex flex-col gap-3">
        {opportunities.map((opportunity) => (
          <Card
            key={opportunity.id}
            className="group cursor-pointer hover:border-primary/50"
            onClick={() =>
              navigate({
                to: `${basePath}/opportunity/$opportunityId`,
                params: { opportunityId: opportunity.id.toString() },
              })
            }
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{opportunity.title}</CardTitle>
                <Badge variant={stageVariant[opportunity.stage]}>
                  {stageLabels[opportunity.stage]}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="block text-sm text-muted-foreground">
                    Estimated Value
                  </span>
                  <span>
                    {opportunity.estimated_contract_value
                      ? formatCurrency(opportunity.estimated_contract_value)
                      : "—"}
                  </span>
                </div>
                <div>
                  <span className="block text-sm text-muted-foreground">
                    Expected Close
                  </span>
                  <span>
                    {opportunity.expected_close_date
                      ? new Date(
                          opportunity.expected_close_date
                        ).toLocaleDateString()
                      : "—"}
                  </span>
                </div>
                <div>
                  <span className="block text-sm text-muted-foreground">
                    Sales Representative
                  </span>
                  <span>{opportunity.assigned_to.name}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
