import { createFileRoute } from "@tanstack/react-router"
import { useState, type ComponentType } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Area,
  AreaChart,
  XAxis,
  YAxis,
} from "recharts"
import {
  Target,
  Banknote,
  Trophy,
  TrendingUp,
  Star,
  Send,
  ChartSpline,
  BarChart3,
  Briefcase,
} from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import useDashboardQuery, { type DashboardData } from "./-useDashboardQuery"
import { KpiCards } from "@/components/kpi-cards"
import useSalesRepresentatives from "@/lib/queries/useSalesRepresentatives"
import { Spinner } from "@/components/ui/spinner"
import { formatCurrency } from "@/lib/utils"

export const Route = createFileRoute("/admin/dashboard/")({
  component: RouteComponent,
})

function RouteComponent() {
  return <DashboardContent />
}

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
]

/** "contract_processing" -> "Contract processing" */
function titleCase(value: string): string {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

export function DashboardContent({
  showRepFilter = false,
}: {
  showRepFilter?: boolean
}) {
  const [repId, setRepId] = useState<number | null>(null)
  const repsQuery = useSalesRepresentatives()
  const { data, isLoading } = useDashboardQuery(repId ? { repId } : {})

  const isOverseer = data?.scope.role === "admin" || data?.scope.role === "manager"

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-medium">
            Dashboard and Analytics
          </h1>
          <p className="text-sm text-muted-foreground">
            Opportunity pipeline and customer satisfaction at a glance
          </p>
        </div>
        {showRepFilter && (
          <div className="w-56">
            <Select
              value={repId ? String(repId) : "all"}
              onValueChange={(value) =>
                setRepId(value === "all" ? null : Number(value))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All representatives</SelectItem>
                {(repsQuery.data ?? []).map((rep) => (
                  <SelectItem key={rep.id} value={String(rep.id)}>
                    {rep.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {isLoading && (
        <div className="flex h-full items-center justify-center py-24">
          <Spinner className="size-10" />
        </div>
      )}
      {!isLoading && !data && <div>No data available</div>}
      {!isLoading && data && (
        <>
          <KpiGrid data={data} />

          <SectionHeading icon={Briefcase} title="Opportunity Pipeline Analytics" />
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <OpportunityDistributionChart opportunities={data.opportunities} />
            <OpportunityTrendChart opportunities={data.opportunities} />
            <WinLossChart opportunities={data.opportunities} />
          </div>

          <SectionHeading
            icon={Star}
            title="Client Satisfaction Analytics"
          />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <OverallSatisfactionCard satisfaction={data.satisfaction} />
            <SatisfactionTrendChart satisfaction={data.satisfaction} />
            <SatisfactionByCategoryChart satisfaction={data.satisfaction} />
            <SatisfactionDistributionChart satisfaction={data.satisfaction} />
          </div>

          {(isOverseer || data.performance.length > 0) && (
            <>
              <SectionHeading
                icon={BarChart3}
                title={isOverseer ? "Sales Rep Performance" : "My Performance"}
              />
              <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                <PerformanceTable
                  performance={data.performance}
                  fullWidth={!isOverseer}
                />
                {isOverseer && <PipelineByRepChart performance={data.performance} />}
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}

function SectionHeading({
  icon: Icon,
  title,
}: {
  icon: ComponentType<{ className?: string }>
  title: string
}) {
  return (
    <h2 className="flex items-center gap-2 font-heading text-lg font-semibold">
      <Icon className="size-5 text-primary" />
      {title}
    </h2>
  )
}

function KpiGrid({ data }: { data: DashboardData }) {
  const { summary, opportunities, satisfaction } = data
  const activeOpportunities = Math.max(
    0,
    summary.total_opportunities -
      summary.won_opportunities -
      summary.lost_opportunities,
  )
  const pipelineValue = opportunities.value_by_stage
    .filter((row) => row.stage !== "won" && row.stage !== "lost")
    .reduce((sum, row) => sum + row.value, 0)

  const cards = [
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

  return <KpiCards kpis={cards} />
}

// ---------------------------------------------------------------------------
// Opportunity Pipeline Analytics
// ---------------------------------------------------------------------------

function OpportunityDistributionChart({
  opportunities,
}: {
  opportunities: DashboardData["opportunities"]
}) {
  const chartConfig = Object.fromEntries(
    opportunities.by_stage.map((row, index) => [
      row.stage,
      { label: titleCase(row.stage), color: CHART_COLORS[index % CHART_COLORS.length] },
    ]),
  ) satisfies ChartConfig

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Distribution by Stage</CardTitle>
        <CardDescription>Opportunities across pipeline stages</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[260px] w-full">
          <BarChart accessibilityLayer data={opportunities.by_stage}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="stage"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={titleCase}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar dataKey="count" radius={8}>
              {opportunities.by_stage.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={CHART_COLORS[index % CHART_COLORS.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

function OpportunityTrendChart({
  opportunities,
}: {
  opportunities: DashboardData["opportunities"]
}) {
  const chartConfig = {
    count: {
      label: "Opportunities",
      color: "var(--chart-1)",
    },
  } satisfies ChartConfig

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Opportunity Trend</CardTitle>
        <CardDescription>Opportunities created per month</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[260px] w-full">
          <AreaChart
            accessibilityLayer
            data={opportunities.trend}
            margin={{ left: 12, right: 12 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Area
              dataKey="count"
              type="natural"
              fill="var(--color-count)"
              fillOpacity={0.4}
              stroke="var(--color-count)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

function WinLossChart({
  opportunities,
}: {
  opportunities: DashboardData["opportunities"]
}) {
  const chartConfig = {
    count: { label: "Deals" },
  } satisfies ChartConfig

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Win/Loss Analysis</CardTitle>
        <CardDescription>Won vs lost opportunities</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[260px] w-full">
          <BarChart accessibilityLayer data={opportunities.win_loss}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="stage"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) =>
                value === "won" ? "Won" : "Lost"
              }
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar dataKey="count" radius={8}>
              {opportunities.win_loss.map((row) => (
                <Cell
                  key={row.stage}
                  fill={
                    row.stage === "won" ? "var(--chart-2)" : "var(--destructive)"
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
        <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
          {opportunities.win_loss.map((row) => (
            <span key={row.stage} className="flex items-center gap-1.5">
              <span
                className="size-2.5 rounded-full"
                style={{
                  backgroundColor:
                    row.stage === "won" ? "var(--chart-2)" : "var(--destructive)",
                }}
              />
              {titleCase(row.stage)}: {row.count} · {formatCurrency(row.value)}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Client Satisfaction Analytics
// ---------------------------------------------------------------------------

function OverallSatisfactionCard({
  satisfaction,
}: {
  satisfaction: DashboardData["satisfaction"]
}) {
  const score = satisfaction.average_score

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="size-4 text-primary" />
          Overall Satisfaction Score
        </CardTitle>
        <CardDescription>Average across completed surveys</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <div className="flex size-20 items-center justify-center rounded-2xl bg-primary/10">
            <span className="text-3xl font-semibold">
              {score !== null ? score : "—"}
            </span>
          </div>
          <div className="text-sm">
            {score !== null ? (
              <>
                <span className="font-medium">out of 5</span>
                <p className="text-muted-foreground">
                  {score >= 4
                    ? "Strong satisfaction"
                    : score >= 3
                      ? "Acceptable satisfaction"
                      : "Needs attention"}
                </p>
              </>
            ) : (
              <p className="text-muted-foreground">No completed surveys yet</p>
            )}
          </div>
        </div>
        <Separator className="my-4" />
        <div className="flex justify-between text-sm">
          <div>
            <p className="text-muted-foreground">Response Rate</p>
            <p className="text-lg font-semibold">
              {satisfaction.response_rate}%
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Completed Surveys</p>
            <p className="text-lg font-semibold">
              {satisfaction.completed_surveys}
              <span className="text-muted-foreground">
                /{satisfaction.total_surveys}
              </span>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function SatisfactionTrendChart({
  satisfaction,
}: {
  satisfaction: DashboardData["satisfaction"]
}) {
  const chartConfig = {
    average_score: {
      label: "Avg Score",
      color: "var(--chart-1)",
    },
  } satisfies ChartConfig

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="size-4 text-primary" />
          Satisfaction Trend
        </CardTitle>
        <CardDescription>Average survey score (1–5) per month</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[260px] w-full">
          <LineChart
            accessibilityLayer
            data={satisfaction.trend}
            margin={{ left: 12, right: 12 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis
              domain={[0, 5]}
              ticks={[1, 2, 3, 4, 5]}
              tickLine={false}
              axisLine={false}
              width={30}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <Line
              dataKey="average_score"
              type="monotone"
              stroke="var(--color-average_score)"
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

function SatisfactionByCategoryChart({
  satisfaction,
}: {
  satisfaction: DashboardData["satisfaction"]
}) {
  const chartConfig = Object.fromEntries(
    satisfaction.by_question.map((row, index) => [
      row.question,
      { label: row.label, color: CHART_COLORS[index % CHART_COLORS.length] },
    ]),
  ) satisfies ChartConfig

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ChartSpline className="size-4 text-primary" />
          Satisfaction by Category
        </CardTitle>
        <CardDescription>Average score per survey question</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[260px] w-full">
          <BarChart accessibilityLayer data={satisfaction.by_question}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis
              domain={[0, 5]}
              ticks={[1, 2, 3, 4, 5]}
              tickLine={false}
              axisLine={false}
              width={30}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar dataKey="average_score" radius={8}>
              {satisfaction.by_question.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={CHART_COLORS[index % CHART_COLORS.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

function SatisfactionDistributionChart({
  satisfaction,
}: {
  satisfaction: DashboardData["satisfaction"]
}) {
  const chartConfig = {
    count: {
      label: "Clients",
      color: "var(--chart-3)",
    },
  } satisfies ChartConfig

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="size-4 text-primary" />
          Satisfaction Distribution
        </CardTitle>
        <CardDescription>Clients by latest survey score band</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[260px] w-full">
          <BarChart accessibilityLayer data={satisfaction.score_distribution}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar dataKey="count" fill="var(--color-count)" radius={8} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Sales Rep Performance (admin / manager)
// ---------------------------------------------------------------------------

function PerformanceTable({
  performance,
  fullWidth = false,
}: {
  performance: DashboardData["performance"]
  fullWidth?: boolean
}) {
  const spanClass = fullWidth ? "xl:col-span-3" : "xl:col-span-2"

  if (performance.length === 0) {
    return (
      <Card className={spanClass}>
        <CardHeader>
          <CardTitle className="text-base">Performance Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No active sales representatives.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={spanClass}>
      <CardHeader>
        <CardTitle className="text-base">Performance Comparison</CardTitle>
        <CardDescription>Per-rep pipeline and satisfaction KPIs</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Rep</TableHead>
              <TableHead className="text-right">Active</TableHead>
              <TableHead className="text-right">Pipeline Value</TableHead>
              <TableHead className="text-right">Won</TableHead>
              <TableHead className="text-right">Win Rate</TableHead>
              <TableHead className="text-right">Avg Score</TableHead>
              <TableHead className="text-right">Response</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {performance.map((rep) => (
              <TableRow key={rep.rep_id}>
                <TableCell className="font-medium">{rep.rep_name}</TableCell>
                <TableCell className="text-right">
                  {rep.open_opportunities}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(rep.pipeline_value)}
                </TableCell>
                <TableCell className="text-right">{rep.won_count}</TableCell>
                <TableCell className="text-right">{rep.win_rate}%</TableCell>
                <TableCell className="text-right">
                  {rep.average_score !== null ? `${rep.average_score}/5` : "—"}
                </TableCell>
                <TableCell className="text-right">
                  {rep.response_rate}%
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

function PipelineByRepChart({
  performance,
}: {
  performance: DashboardData["performance"]
}) {
  const chartConfig = {
    pipeline_value: {
      label: "Pipeline Value",
      color: "var(--chart-1)",
    },
  } satisfies ChartConfig

  if (performance.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Pipeline Value by Rep</CardTitle>
        <CardDescription>Open opportunity value per rep</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <BarChart
            accessibilityLayer
            data={performance}
            layout="vertical"
            margin={{ left: 8, right: 12 }}
          >
            <CartesianGrid horizontal={false} />
            <XAxis type="number" hide />
            <YAxis
              dataKey="rep_name"
              type="category"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              width={110}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar dataKey="pipeline_value" fill="var(--color-pipeline_value)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}