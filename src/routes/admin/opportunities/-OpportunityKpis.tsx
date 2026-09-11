import { KpiCards, type Kpi } from "@/components/kpi-cards"
import { Spinner } from "@/components/ui/spinner"
import useDashboardQuery from "@/routes/admin/dashboard/-useDashboardQuery"
import { formatCurrency } from "@/lib/utils"
import { Banknote, Target, Trophy } from "lucide-react"

export default function OpportunityKpis() {
  const { data, isLoading } = useDashboardQuery()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Spinner className="size-5 text-muted-foreground" />
      </div>
    )
  }
  if (!data) return null

  const { summary, opportunities } = data
  const activeOpportunities = Math.max(
    0,
    summary.total_opportunities -
      summary.won_opportunities -
      summary.lost_opportunities,
  )
  const pipelineValue = opportunities.value_by_stage
    .filter((row) => row.stage !== "won" && row.stage !== "lost")
    .reduce((sum, row) => sum + row.value, 0)

  const kpis: Kpi[] = [
    {
      label: "Active Opportunities",
      value: activeOpportunities.toLocaleString(),
      hint: "Open in the pipeline",
      icon: Target,
    },
    {
      label: "Pipeline Value",
      value: formatCurrency(pipelineValue),
      hint: "Open opportunity value",
      icon: Banknote,
    },
    {
      label: "Won Opportunities",
      value: summary.won_opportunities.toLocaleString(),
      hint: `${formatCurrency(summary.total_contract_value)} won`,
      icon: Trophy,
    },
  ]

  return <KpiCards kpis={kpis} />
}