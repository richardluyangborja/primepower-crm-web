import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Spinner } from "@/components/ui/spinner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, TrendingUp, TrendingDown, Minus, X } from "lucide-react"
import { useNavigate } from "@tanstack/react-router"
import { useState, useMemo } from "react"
import {
  useSatisfactionQuery,
  type SatisfactionFilters,
} from "./-useSatisfactionQuery"
import {
  trendLabels,
  type ClientSatisfactionSummary,
} from "@/routes/admin/satisfaction/-types"

function TrendIcon({ trend }: { trend: ClientSatisfactionSummary["trend"] }) {
  if (trend === "up") return <TrendingUp className="size-4" />
  if (trend === "down") return <TrendingDown className="size-4" />
  return <Minus className="size-4" />
}

function ScoreBadge({ score }: { score: number | null | undefined }) {
  if (score === null || score === undefined) {
    return <span className="text-muted-foreground">—</span>
  }

  const numScore = typeof score === "string" ? parseFloat(score) : score

  const variant =
    numScore >= 4 ? "default" : numScore >= 3 ? "secondary" : "destructive"

  return <Badge variant={variant}>{numScore.toFixed(1)}</Badge>
}

export default function ClientSatisfactionList() {
  const navigate = useNavigate()
  const [search, setSearch] = useState("")
  const [trendFilter, setTrendFilter] = useState("all")
  const [scoreFilter, setScoreFilter] = useState("all")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")

  const filters: SatisfactionFilters = useMemo(
    () => ({
      q: search || undefined,
      trend: trendFilter !== "all" ? trendFilter : undefined,
      score: scoreFilter !== "all" ? scoreFilter : undefined,
      from: dateFrom || undefined,
      to: dateTo || undefined,
    }),
    [search, trendFilter, scoreFilter, dateFrom, dateTo]
  )

  const hasActiveFilters =
    search !== "" ||
    trendFilter !== "all" ||
    scoreFilter !== "all" ||
    dateFrom !== "" ||
    dateTo !== ""

  function clearFilters() {
    setSearch("")
    setTrendFilter("all")
    setScoreFilter("all")
    setDateFrom("")
    setDateTo("")
  }

  const query = useSatisfactionQuery(filters)
  const data = query.data

  return (
    <Card>
      <CardHeader>
        {/* Row 1: Search + Selects + Clear */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search companies..."
              className="w-60 pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={trendFilter} onValueChange={setTrendFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All trends" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All trends</SelectItem>
              <SelectItem value="up">Improving</SelectItem>
              <SelectItem value="down">Declining</SelectItem>
              <SelectItem value="stable">Stable</SelectItem>
            </SelectContent>
          </Select>
          <Select value={scoreFilter} onValueChange={setScoreFilter}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="All scores" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All scores</SelectItem>
              <SelectItem value="ge4">4.0+ (Strong)</SelectItem>
              <SelectItem value="ge3">3.0–3.9 (Neutral)</SelectItem>
              <SelectItem value="lt3">Below 3.0 (At risk)</SelectItem>
            </SelectContent>
          </Select>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="mr-1 size-4" />
              Clear
            </Button>
          )}
        </div>

        {/* Row 2: Date Range */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">From</span>
            <Input
              type="date"
              className="w-40"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">To</span>
            <Input
              type="date"
              className="w-40"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {query.isPending ? (
          <Spinner />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Primary Contact</TableHead>
                <TableHead className="text-center">Surveys</TableHead>
                <TableHead className="text-center">Pending</TableHead>
                <TableHead className="text-center">Last Survey</TableHead>
                <TableHead className="text-center">Avg Score</TableHead>
                <TableHead className="text-center">Trend</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.map((client) => (
                <TableRow
                  key={client.id}
                  onClick={() =>
                    navigate({
                      to: "/sales/satisfaction/$clientId",
                      params: { clientId: client.id.toString() },
                    })
                  }
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Avatar>
                        <AvatarFallback>
                          {client.company.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span>{client.company.name}</span>
                        <span className="text-xs font-normal text-muted-foreground">
                          {client.company.industry}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="flex flex-col">
                    <span>{client.primary_contact?.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {client.primary_contact?.title}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span>{client.completed_surveys}</span>
                    <span className="text-muted-foreground">
                      /{client.total_surveys}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    {client.pending_surveys > 0 ? (
                      <Badge variant="outline">{client.pending_surveys}</Badge>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center text-sm">
                    {client.last_survey_date
                      ? new Date(client.last_survey_date).toLocaleDateString()
                      : "—"}
                  </TableCell>
                  <TableCell className="text-center">
                    <ScoreBadge score={client.average_score} />
                  </TableCell>
                  <TableCell className="text-center">
                    {client.trend ? (
                      <div className="flex items-center justify-center gap-1">
                        <TrendIcon trend={client.trend} />
                        <span className="text-xs text-muted-foreground">
                          {trendLabels[client.trend]}
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {data?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    No clients found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
