import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"

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

/** Minimal structural subset of a satisfaction survey, so the chart stays
 *  decoupled from the route-local `Survey` type it is fed. */
export type SatisfactionTrendSurvey = {
  status: string
  average_score: number | null
  completed_at: string | null
  created_at: string
}

const chartConfig = {
  score: {
    label: "Avg Score",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

export function SatisfactionTrendChart({
  surveys,
}: {
  surveys: SatisfactionTrendSurvey[]
}) {
  const points = surveys
    .filter(
      (survey) => survey.status === "completed" && survey.average_score != null
    )
    .map((survey) => ({
      date: new Date(survey.completed_at ?? survey.created_at),
      score: Number(survey.average_score),
    }))
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .map((point) => ({
      date: point.date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      score: point.score,
    }))

  if (points.length === 0) {
    return null
  }

  const label = `${points.length} completed survey${points.length === 1 ? "" : "s"}`

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Satisfaction Trend</CardTitle>
        <CardDescription>
          Average survey score (1–5) over time — {label}.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={points}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis
              domain={[0, 5]}
              ticks={[1, 2, 3, 4, 5]}
              tickLine={false}
              axisLine={false}
              tickMargin={4}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Line
              dataKey="score"
              type="monotone"
              stroke="var(--color-score)"
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
