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
import { cn } from "@/lib/utils"
import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  AlertTriangle,
  RefreshCw,
  Send,
  Sparkles,
  Star,
  TrendingDown,
  Users,
  type LucideIcon,
} from "lucide-react"
import useSatisfactionAnalyticsQuery, {
  type SatisfactionAnalyticsAction,
  type SatisfactionAnalyticsInsights,
} from "./-useSatisfactionAnalyticsQuery"

const actionIcon = {
  low_score: TrendingDown,
  at_risk: AlertTriangle,
  pending: Send,
  review: Sparkles,
} as const

function truncate(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text
}

export default function SatisfactionAnalytics() {
  const query = useSatisfactionAnalyticsQuery()
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
        Couldn't load satisfaction analytics.{" "}
        {query.error instanceof Error
          ? query.error.message
          : "Please try again."}
      </p>
    )
  } else if (data?.empty) {
    content = (
      <p className="text-sm text-muted-foreground">
        No satisfaction data yet. Once surveys are answered or clients are
        flagged at risk, analytics will chart score distribution, coverage, and
        auto-suggested actions.
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
              <Star className="size-4 text-primary" />
              Satisfaction Analytics
            </CardTitle>
            <CardDescription>
              Client satisfaction analytics — computed from live survey scores
              and at-risk flags.
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

function Insights({ data }: { data: SatisfactionAnalyticsInsights }) {
  const { metrics, suggested_actions, generated_at } = data

  const bands = metrics.score_bands.map((row) => ({
    key: row.band,
    label: row.band,
    full: `${row.band} score`,
    count: row.count,
  }))

  const owners = metrics.by_owner.map((row) => ({
    key: row.owner,
    label: row.owner,
    full: `${row.count} client${row.count === 1 ? "" : "s"}`,
    count: row.count,
  }))

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MetricChip
          label="Average score"
          value={
            metrics.average_score === null
              ? "—"
              : metrics.average_score.toFixed(1)
          }
          icon={Star}
        />
        <MetricChip
          label="Response rate"
          value={`${metrics.response_rate}%`}
          icon={Send}
        />
        <MetricChip
          label="Completed"
          value={`${metrics.surveys_completed}/${metrics.surveys_sent}`}
          icon={Users}
        />
        <MetricChip
          label="At risk"
          value={String(metrics.at_risk_count)}
          icon={AlertTriangle}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <VerticalBars
          title="Score distribution"
          icon={Star}
          data={bands}
          dataKey="count"
          fullDataKey="full"
          color="var(--chart-1)"
          formatTooltip={(count) => `${count} survey${count === 1 ? "" : "s"}`}
        />
        <HorizontalBars
          title="Clients by owner"
          icon={Users}
          data={owners}
          dataKey="count"
          fullDataKey="full"
          color="var(--chart-4)"
          formatTooltip={(count) => `${count} client${count === 1 ? "" : "s"}`}
          formatTick={(count) => `${count}`}
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

type CountBar = { key: string; label: string; full?: string; count: number }

/** Vertical bar chart — a count per category (score band). */
function VerticalBars({
  title,
  icon,
  data,
  dataKey,
  fullDataKey,
  color,
  formatTooltip,
}: {
  title: string
  icon: LucideIcon
  data: CountBar[]
  dataKey: keyof CountBar
  fullDataKey?: keyof CountBar
  color: string
  formatTooltip: (count: number) => string
}) {
  if (data.length === 0) {
    return null
  }

  const config = {
    count: { label: title, color },
  } satisfies ChartConfig

  return (
    <ChartSection title={title} icon={icon}>
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
                  fullDataKey
                    ? ((payload?.[0]?.payload?.[fullDataKey] as string) ??
                      label)
                    : label
                }
                formatter={(value) => formatTooltip(Number(value))}
              />
            }
          />
          <Bar
            dataKey={dataKey as string}
            fill="var(--color-count)"
            radius={[6, 6, 0, 0]}
            barSize={36}
          >
            <LabelList
              dataKey={dataKey as string}
              position="top"
              offset={8}
              formatter={(value) => String(Number(value))}
              className="fill-foreground"
              fontSize={11}
            />
          </Bar>
        </BarChart>
      </ChartContainer>
    </ChartSection>
  )
}

/** Horizontal bar chart — a count per labeled row (owner). */
function HorizontalBars({
  title,
  icon,
  data,
  dataKey,
  fullDataKey,
  color,
  formatTooltip,
  formatTick,
}: {
  title: string
  icon: LucideIcon
  data: CountBar[]
  dataKey: keyof CountBar
  fullDataKey?: keyof CountBar
  color: string
  formatTooltip: (count: number) => string
  formatTick: (count: number) => string
}) {
  if (data.length === 0) {
    return null
  }

  const config = {
    count: { label: title, color },
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
                  fullDataKey
                    ? ((payload?.[0]?.payload?.[fullDataKey] as string) ??
                      label)
                    : label
                }
                formatter={(value) => formatTooltip(Number(value))}
              />
            }
          />
          <Bar
            dataKey={dataKey as string}
            fill="var(--color-count)"
            radius={6}
            barSize={18}
          >
            <LabelList
              dataKey={dataKey as string}
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
  actions: SatisfactionAnalyticsAction[]
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
              {action.company ? (
                <span className="shrink-0 text-xs font-medium text-muted-foreground">
                  {truncate(action.company, 16)}
                </span>
              ) : null}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
