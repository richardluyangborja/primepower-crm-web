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
  FunnelPlus,
  Search,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react"
import { useNavigate } from "@tanstack/react-router"
import { trendLabels, type ClientSatisfactionSummary } from "./-types"
import { useSatisfactionQuery } from "./-useSatisfactionQuery"

function TrendIcon({ trend }: { trend: ClientSatisfactionSummary["trend"] }) {
  if (trend === "up") return <TrendingUp className="size-4" />
  if (trend === "down") return <TrendingDown className="size-4" />
  return <Minus className="size-4" />
}

function ScoreBadge({ score }: { score: string | null | undefined }) {
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
  const query = useSatisfactionQuery()
  const data = query.data

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon">
            <Search />
          </Button>
          <Input placeholder="Search client..." className="w-xs" />
          <Button variant="outline" size="icon">
            <FunnelPlus />
          </Button>
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
                      to: "/admin/satisfaction/$clientId",
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
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
