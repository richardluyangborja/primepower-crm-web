import type { ReactNode } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { cn, formatCurrency } from "@/lib/utils"
import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  BarChart3,
  CalendarClock,
  CalendarPlus,
  Clock,
  Hourglass,
  RefreshCw,
  Rocket,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
  Users,
  XCircle,
  type LucideIcon,
} from "lucide-react"
import {
  type OpportunityAnalyticsAction,
  type OpportunityAnalyticsItem,
  type OpportunityAnalyticsOwner,
} from "./-useOpportunityAnalyticsQuery"
import useOpportunityAnalyticsQuery from "./-useOpportunityAnalyticsQuery"

type OpportunityAnalyticsStage = {
  stage: string
  label: string
  count: number
  value: number
}

// Stage values that are still open (won/lost live in the metric tiles).
const OPEN_STAGES = new Set([
  "initial_contact",
  "discussion",
  "proposal",
  "negotiation",
  "contract_processing",
])

const actionIcon = {
  stalled: Clock,
  closing: Target,
  date: CalendarPlus,
  review: Sparkles,
} as const

/** Short ₱ label for on-bar values, e.g. ₱150K. */
function compactCurrency(value: number): string {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value)
}

function truncate(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text
}

/** "2026-09-05" → local Date. */
function parseDate(date: string): Date | null {
  const [year, month, day] = date.split("-").map(Number)

  return year && month && day ? new Date(year, month - 1, day) : null
}

function daysUntil(date: string): number | null {
  const parsed = parseDate(date)

  return parsed
    ? Math.max(0, Math.ceil((parsed.getTime() - Date.now()) / 86_400_000))
    : null
}

export default function OpportunityAnalytics() {
  const query = useOpportunityAnalyticsQuery()
  const data = query.data

  let content
  if (query.isPending) {
    content = (
      <div className="flex items-center justify-center py-8">
        <Spinner className="size-5 text-muted-foreground" />
      </div>
    )
  } else if (query.isError) {
    content = (
      <p className="text-sm text-muted-foreground">
        Couldn't load pipeline analytics.{" "}
        {query.error instanceof Error
          ? query.error.message
          : "Please try again."}
      </p>
    )
  } else if (data?.empty) {
    content = (
      <p className="text-sm text-muted-foreground">
        No open opportunities in the pipeline yet. Once deals exist, analytics
        will chart pipeline value, weighted expectations, and data-driven
        suggested actions.
      </p>
    )
  } else if (data) {
    content = <Insights data={data} />
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 font-heading text-lg">
              <Sparkles className="size-4 text-primary" />
              Opportunity Analytics
            </CardTitle>
            <CardDescription>
              Quantitative pipeline analytics — computed from live deal stages
              and dates.
            </CardDescription>
          </div>
          <Button
            size="sm"
            variant="outline"
            disabled={query.isFetching}
            onClick={() => query.refetch()}
          >
            <RefreshCw
              className={cn("size-4", query.isFetching && "animate-spin")}
            />
            {query.isFetching ? "Refreshing…" : "Refresh"}
          </Button>
        </div>
      </CardHeader>

      <CardContent>{content}</CardContent>
    </Card>
  )
}

function Insights({
  data,
}: {
  data: {
    empty: boolean
    generated_at: string
    metrics: {
      total_value: number
      weighted_value: number
      won_count: number
      won_value: number
      lost_count: number
      lost_value: number
      per_stage: OpportunityAnalyticsStage[]
      top_deals: OpportunityAnalyticsItem[]
      stalled: OpportunityAnalyticsItem[]
      closing_soon: OpportunityAnalyticsItem[]
      by_owner: OpportunityAnalyticsOwner[]
    }
    suggested_actions: OpportunityAnalyticsAction[]
  }
}) {
  const { metrics, suggested_actions, generated_at } = data

  // Normalize a deal row into what the horizontal bars need.
  const toDealBar = (deal: OpportunityAnalyticsItem, full: string) => ({
    key: deal.title,
    label: deal.title,
    full,
    value: deal.value,
  })

  const topDeals = metrics.top_deals.map((deal) =>
    toDealBar(deal, `${deal.company} · ${deal.owner}`)
  )
  const stalled = metrics.stalled.map((deal) => ({
    ...toDealBar(deal, `${deal.company} · in ${deal.stage}`),
    value: deal.days ?? 0,
  }))
  const closing = metrics.closing_soon.map((deal) => ({
    ...toDealBar(deal, `${deal.company} · closes ${deal.close_date}`),
    value: daysUntil(deal.close_date ?? "") ?? 0,
  }))
  const owners = metrics.by_owner.map((owner) => ({
    key: owner.owner,
    label: owner.owner,
    full: `${owner.count} open deal${owner.count === 1 ? "" : "s"}`,
    value: owner.value,
  }))

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MetricChip
          label="Pipeline value"
          value={formatCurrency(metrics.total_value)}
          icon={TrendingUp}
        />
        <MetricChip
          label="Weighted revenue"
          value={formatCurrency(metrics.weighted_value)}
          icon={Target}
        />
        <MetricChip
          label="Won"
          value={`${metrics.won_count} · ${formatCurrency(metrics.won_value)}`}
          icon={Trophy}
        />
        <MetricChip
          label="Lost"
          value={`${metrics.lost_count} · ${formatCurrency(metrics.lost_value)}`}
          icon={XCircle}
        />
      </div>

      <StageChart stages={metrics.per_stage} />

      <div className="grid gap-4 md:grid-cols-2">
        <ValueBars
          title="Top deals"
          icon={Rocket}
          data={topDeals}
          color="var(--chart-1)"
          valueLabel="Pipeline value"
          formatTooltip={formatCurrency}
          formatTick={compactCurrency}
        />
        <ValueBars
          title="Value by owner"
          icon={Users}
          data={owners}
          color="var(--chart-2)"
          valueLabel="Pipeline value"
          formatTooltip={formatCurrency}
          formatTick={compactCurrency}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <ValueBars
          title="Stalled in stage"
          icon={Hourglass}
          data={stalled}
          color="var(--chart-3)"
          valueLabel="Days"
          formatTooltip={(days) => `${days} day${days === 1 ? "" : "s"}`}
          formatTick={(days) => `${days}d`}
        />
        <ValueBars
          title="Closing soon"
          icon={CalendarClock}
          data={closing}
          color="var(--chart-4)"
          valueLabel="Days to close"
          formatTooltip={(days) => `${days} day${days === 1 ? "" : "s"}`}
          formatTick={(days) => `${days}d`}
        />
      </div>

      <SuggestedActions actions={suggested_actions} />

      <p className="text-xs text-muted-foreground">
        Refreshed {new Date(generated_at).toLocaleString()}
      </p>
    </div>
  )
}

function MetricChip({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: string
  icon: LucideIcon
}) {
  return (
    <div className="rounded-xl border bg-card p-3">
      <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <Icon className="size-3.5" />
        {label}
      </div>
      <p className="mt-1 font-heading text-base font-semibold">{value}</p>
    </div>
  )
}

function ChartSection({
  title,
  icon: Icon,
  children,
}: {
  title: string
  icon: LucideIcon
  children: ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <h3 className="flex items-center gap-1.5 font-heading text-sm font-semibold">
        <Icon className="size-4 text-muted-foreground" />
        {title}
      </h3>
      {children}
    </div>
  )
}

/** Vertical bar chart — pipeline value across the open stages. */
function StageChart({ stages }: { stages: OpportunityAnalyticsStage[] }) {
  const data = stages.filter((stage) => OPEN_STAGES.has(stage.stage))

  if (data.length === 0) {
    return null
  }

  const config = {
    value: { label: "Pipeline value", color: "var(--chart-1)" },
  } satisfies ChartConfig

  return (
    <ChartSection title="Pipeline by stage" icon={BarChart3}>
      <ChartContainer config={config} className="h-56">
        <BarChart
          accessibilityLayer
          data={data}
          margin={{ top: 20, left: 8, right: 8 }}
        >
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
          />
          <YAxis hide />
          <ChartTooltip
            cursor={false}
            content={
              <ChartTooltipContent
                labelFormatter={(label, payload) =>
                  `${label} · ${payload?.[0]?.payload?.count ?? 0} open`
                }
                formatter={(value) => formatCurrency(Number(value))}
              />
            }
          />
          <Bar
            dataKey="value"
            fill="var(--color-value)"
            radius={[6, 6, 0, 0]}
            barSize={48}
          >
            <LabelList
              dataKey="value"
              position="top"
              offset={8}
              formatter={(value) => compactCurrency(Number(value))}
              className="fill-foreground"
              fontSize={11}
            />
          </Bar>
        </BarChart>
      </ChartContainer>
    </ChartSection>
  )
}

type DealBar = { key: string; label: string; full: string; value: number }

function ValueBars({
  title,
  icon,
  data,
  color,
  valueLabel,
  formatTooltip,
  formatTick,
}: {
  title: string
  icon: LucideIcon
  data: DealBar[]
  color: string
  valueLabel: string
  formatTooltip: (value: number) => string
  formatTick: (value: number) => string
}) {
  if (data.length === 0) {
    return null
  }

  const config = {
    value: { label: valueLabel, color },
  } satisfies ChartConfig

  return (
    <ChartSection title={title} icon={icon}>
      <ChartContainer config={config} className="h-56">
        <BarChart
          accessibilityLayer
          layout="vertical"
          data={data}
          margin={{ left: 8, right: 28, top: 4, bottom: 4 }}
        >
          <CartesianGrid horizontal={false} />
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="label"
            width={92}
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value) => truncate(String(value), 14)}
          />
          <ChartTooltip
            cursor={false}
            content={
              <ChartTooltipContent
                labelFormatter={(label, payload) =>
                  payload?.[0]?.payload?.full ?? label
                }
                formatter={(value) => formatTooltip(Number(value))}
              />
            }
          />
          <Bar
            dataKey="value"
            fill="var(--color-value)"
            radius={6}
            barSize={18}
          >
            <LabelList
              dataKey="value"
              position="right"
              offset={6}
              formatter={(value) => formatTick(Number(value))}
              className="fill-foreground"
              fontSize={11}
            />
          </Bar>
        </BarChart>
      </ChartContainer>
    </ChartSection>
  )
}

function SuggestedActions({
  actions,
}: {
  actions: OpportunityAnalyticsAction[]
}) {
  if (actions.length === 0) {
    return null
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <h3 className="font-heading text-sm font-semibold">
          Suggested actions
        </h3>
        <Badge variant="outline">Auto-suggested</Badge>
      </div>
      <ul className="grid gap-2 sm:grid-cols-2">
        {actions.map((action, index) => {
          const Icon = actionIcon[action.type] ?? Sparkles

          return (
            <li
              key={`${action.type}-${index}`}
              className="flex gap-2.5 rounded-lg border bg-card p-2.5"
            >
              <Icon className="mt-0.5 size-4 shrink-0 text-primary" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{action.suggest}</p>
                <p className="text-xs text-muted-foreground">{action.reason}</p>
              </div>
              {action.value ? (
                <span className="shrink-0 text-xs font-medium text-muted-foreground">
                  {formatCurrency(action.value)}
                </span>
              ) : null}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
