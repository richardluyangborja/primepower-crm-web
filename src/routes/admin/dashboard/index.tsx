import { createFileRoute } from "@tanstack/react-router"
import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { Area, AreaChart } from "recharts"
import { Pie, PieChart, Cell } from "recharts"
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  UserCheck,
  Target,
  DollarSign,
  Bell,
  BarChart3,
  MessageSquare,
  ClipboardCheck,
  UserX,
  Clock,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react"
import { Separator } from "@/components/ui/separator"
import useDashboardQuery, { type DashboardData } from "./-useDashboardQuery"
import { Spinner } from "@/components/ui/spinner"
import { formatCurrency } from "@/lib/utils"

export const Route = createFileRoute("/admin/dashboard/")({
  component: RouteComponent,
})

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
]

function RouteComponent() {
  const { data, isLoading } = useDashboardQuery()

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner className="size-10" />
      </div>
    )
  }

  if (!data) {
    return <div>No data available</div>
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="font-heading text-2xl font-medium">
          Dashboard and Analytics
        </h1>
        <p className="text-sm text-muted-foreground">
          Overview of your CRM performance metrics
        </p>
      </div>

      <SummaryCards summary={data.summary} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <LeadsByStatusChart leads={data.leads} />
        <OpportunitiesByStageChart opportunities={data.opportunities} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <LeadTrendsChart leads={data.leads} />
        <MonthlyRevenueChart opportunities={data.opportunities} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <ClientGrowthChart clients={data.clients} />
        <CommunicationsChart communications={data.communications} />
        <RemindersChart reminders={data.reminders} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SatisfactionChart satisfaction={data.satisfaction} />
        <LeadSourceChart leads={data.leads} />
      </div>
    </div>
  )
}

function SummaryCards({ summary }: { summary: DashboardData["summary"] }) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      <Card>
        <CardContent className="flex items-center gap-4 p-4">
          <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10">
            <Users className="size-6 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Leads</p>
            <p className="text-2xl font-semibold">{summary.total_leads}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex items-center gap-4 p-4">
          <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10">
            <UserCheck className="size-6 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Clients</p>
            <p className="text-2xl font-semibold">{summary.total_clients}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex items-center gap-4 p-4">
          <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10">
            <DollarSign className="size-6 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Contract Value</p>
            <p className="text-2xl font-semibold">
              {formatCurrency(summary.total_contract_value)}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex items-center gap-4 p-4">
          <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10">
            <Target className="size-6 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Conversion Rate</p>
            <p className="text-2xl font-semibold">{summary.conversion_rate}%</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function LeadsByStatusChart({ leads }: { leads: DashboardData["leads"] }) {
  const chartConfig = {
    count: {
      label: "Leads",
      color: "var(--chart-1)",
    },
  } satisfies ChartConfig

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="size-4" />
          Leads by Status
        </CardTitle>
        <CardDescription>Distribution of leads across statuses</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <BarChart accessibilityLayer data={leads.by_status}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="status"
              tickLine={false}
              tickMargin={8}
              axisLine={false}
              tickFormatter={(value) =>
                value.charAt(0).toUpperCase() + value.slice(1)
              }
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

function OpportunitiesByStageChart({
  opportunities,
}: {
  opportunities: DashboardData["opportunities"]
}) {
  const chartConfig = Object.fromEntries(
    opportunities.by_stage.map((s, i) => [
      s.stage,
      {
        label:
          s.stage.replace(/_/g, " ").charAt(0).toUpperCase() +
          s.stage.replace(/_/g, " ").slice(1),
        color: CHART_COLORS[i % CHART_COLORS.length],
      },
    ])
  ) satisfies ChartConfig

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="size-4" />
          Opportunities by Stage
        </CardTitle>
        <CardDescription>Pipeline distribution across stages</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={opportunities.by_stage.filter((s) => s.count > 0)}
              dataKey="count"
              nameKey="stage"
              innerRadius={60}
              outerRadius={80}
            >
              {opportunities.by_stage.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={CHART_COLORS[index % CHART_COLORS.length]}
                />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 leading-none font-medium">
          Total: {opportunities.total_opportunities} opportunities
        </div>
      </CardFooter>
    </Card>
  )
}

function LeadTrendsChart({ leads }: { leads: DashboardData["leads"] }) {
  const chartConfig = {
    count: {
      label: "Leads",
      color: "var(--chart-1)",
    },
  } satisfies ChartConfig

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="size-4" />
          Lead Trends
        </CardTitle>
        <CardDescription>Monthly lead acquisition</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <AreaChart
            accessibilityLayer
            data={leads.by_month}
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

function MonthlyRevenueChart({
  opportunities,
}: {
  opportunities: DashboardData["opportunities"]
}) {
  const chartConfig = {
    total_value: {
      label: "Revenue",
      color: "var(--chart-2)",
    },
  } satisfies ChartConfig

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="size-4" />
          Monthly Won Revenue
        </CardTitle>
        <CardDescription>Revenue from won opportunities</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <BarChart accessibilityLayer data={opportunities.monthly_won}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={8}
              axisLine={false}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar
              dataKey="total_value"
              fill="var(--color-total_value)"
              radius={8}
            />
          </BarChart>
        </ChartContainer>
        <div className="mt-4 flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Avg Deal:</span>
            <Badge variant="secondary">
              {formatCurrency(opportunities.avg_deal_size)}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ClientGrowthChart({ clients }: { clients: DashboardData["clients"] }) {
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
          <UserCheck className="size-4" />
          Client Growth
        </CardTitle>
        <CardDescription>Monthly client acquisition</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex gap-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-4 text-green-500" />
            <span className="text-sm text-muted-foreground">Active:</span>
            <Badge variant="outline">{clients.active}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <UserX className="size-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Inactive:</span>
            <Badge variant="outline">{clients.inactive}</Badge>
          </div>
        </div>
        <ChartContainer config={chartConfig} className="h-[200px] w-full">
          <AreaChart
            accessibilityLayer
            data={clients.by_month}
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

function CommunicationsChart({
  communications,
}: {
  communications: DashboardData["communications"]
}) {
  const chartConfig = Object.fromEntries(
    communications.by_type.map((t, i) => [
      t.type,
      {
        label: t.type.charAt(0).toUpperCase() + t.type.slice(1),
        color: CHART_COLORS[i % CHART_COLORS.length],
      },
    ])
  ) satisfies ChartConfig

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="size-4" />
          Communications
        </CardTitle>
        <CardDescription>By type</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <span className="text-sm text-muted-foreground">Total:</span>
          <Badge variant="secondary" className="ml-2">
            {communications.total}
          </Badge>
        </div>
        <ChartContainer config={chartConfig} className="h-[200px] w-full">
          <BarChart
            accessibilityLayer
            data={communications.by_type}
            layout="vertical"
          >
            <CartesianGrid horizontal={false} />
            <XAxis type="number" hide />
            <YAxis
              dataKey="type"
              type="category"
              tickLine={false}
              tickMargin={8}
              axisLine={false}
              width={80}
              tickFormatter={(value) =>
                value.charAt(0).toUpperCase() + value.slice(1)
              }
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar dataKey="count" radius={4}>
              {communications.by_type.map((_, index) => (
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

function RemindersChart({
  reminders,
}: {
  reminders: DashboardData["reminders"]
}) {
  const chartConfig = {
    pending: {
      label: "Pending",
      color: "var(--chart-1)",
    },
    completed: {
      label: "Completed",
      color: "var(--chart-2)",
    },
  } satisfies ChartConfig

  const chartData = [
    {
      status: "pending",
      count: reminders.pending,
      fill: "var(--color-pending)",
    },
    {
      status: "completed",
      count: reminders.completed,
      fill: "var(--color-completed)",
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="size-4" />
          Reminders
        </CardTitle>
        <CardDescription>Follow-up reminders overview</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Clock className="size-4 text-blue-500" />
            <span className="text-sm text-muted-foreground">Pending:</span>
            <Badge variant="outline">{reminders.pending}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-4 text-green-500" />
            <span className="text-sm text-muted-foreground">Completed:</span>
            <Badge variant="outline">{reminders.completed}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="size-4 text-destructive" />
            <span className="text-sm text-muted-foreground">Overdue:</span>
            <Badge variant="destructive">{reminders.overdue}</Badge>
          </div>
        </div>
        <ChartContainer config={chartConfig} className="h-[200px] w-full">
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="count"
              nameKey="status"
              innerRadius={50}
              outerRadius={70}
            />
            <ChartLegend content={<ChartLegendContent />} />
          </PieChart>
        </ChartContainer>
        {reminders.due_soon > 0 && (
          <div className="mt-4 text-center text-sm text-muted-foreground">
            <Bell className="mr-1 inline size-4" />
            {reminders.due_soon} due within 7 days
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function SatisfactionChart({
  satisfaction,
}: {
  satisfaction: DashboardData["satisfaction"]
}) {
  const chartConfig = {
    count: {
      label: "Clients",
      color: "var(--chart-1)",
    },
  } satisfies ChartConfig

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardCheck className="size-4" />
          Client Satisfaction
        </CardTitle>
        <CardDescription>Survey score distribution</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex items-center gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Average Score</p>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-semibold">
                {satisfaction.average_score ?? "N/A"}
              </span>
            </div>
          </div>
          <Separator orientation="vertical" className="h-12" />
          <div>
            <p className="text-sm text-muted-foreground">Surveys</p>
            <p className="text-lg font-semibold">
              {satisfaction.completed_surveys}
              <span className="text-sm text-muted-foreground">
                /{satisfaction.total_surveys}
              </span>
            </p>
          </div>
        </div>
        <ChartContainer config={chartConfig} className="h-[180px] w-full">
          <BarChart accessibilityLayer data={satisfaction.score_distribution}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="label"
              tickLine={false}
              tickMargin={8}
              axisLine={false}
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

function LeadSourceChart({ leads }: { leads: DashboardData["leads"] }) {
  const chartConfig = Object.fromEntries(
    leads.by_source.map((s, i) => [
      s.source,
      {
        label: s.source,
        color: CHART_COLORS[i % CHART_COLORS.length],
      },
    ])
  ) satisfies ChartConfig

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="size-4" />
          Lead Sources
        </CardTitle>
        <CardDescription>Where leads come from</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <RadarChart data={leads.by_source}>
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <PolarAngleAxis dataKey="source" />
            <PolarGrid />
            <Radar dataKey="count" fill="var(--chart-1)" fillOpacity={0.6} />
            <ChartLegend content={<ChartLegendContent />} />
          </RadarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
