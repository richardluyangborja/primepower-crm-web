import { KpiCards, type Kpi } from "@/components/kpi-cards"
import { Spinner } from "@/components/ui/spinner"
import useDashboardQuery from "@/routes/admin/dashboard/-useDashboardQuery"
import { Send, Star, TrendingUp } from "lucide-react"

export default function SatisfactionKpis() {
  const { data, isLoading } = useDashboardQuery()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Spinner className="size-5 text-muted-foreground" />
      </div>
    )
  }
  if (!data) return null

  const { summary, satisfaction } = data

  const kpis: Kpi[] = [
    {
      label: "Win Rate",
      value: `${summary.win_rate}%`,
      hint: "Closed deals won",
      icon: TrendingUp,
    },
    {
      label: "Avg Satisfaction",
      value:
        satisfaction.average_score !== null
          ? `${satisfaction.average_score}/5`
          : "—",
      hint: "Completed surveys",
      icon: Star,
    },
    {
      label: "Survey Response Rate",
      value: `${satisfaction.response_rate}%`,
      hint: `${satisfaction.completed_surveys}/${satisfaction.total_surveys} completed`,
      icon: Send,
    },
  ]

  return <KpiCards kpis={kpis} />
}