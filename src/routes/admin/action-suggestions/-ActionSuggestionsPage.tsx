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
import { formatCurrency } from "@/lib/utils"
import { useIsAdmin } from "@/lib/queries/useIsAdmin"
import { useLocation, useNavigate } from "@tanstack/react-router"
import {
  AlertTriangle,
  CalendarClock,
  CircleDollarSign,
  RefreshCw,
  Send,
  Sparkles,
  Star,
  Target,
  TrendingDown,
  type LucideIcon,
} from "lucide-react"
import {
  useActionSuggestionsQuery,
  type OpportunitySuggestedAction,
  type SatisfactionSuggestedAction,
} from "@/lib/queries/useActionSuggestions"
import { ActionSettingsPanel } from "./-ActionSettingsPanel"

const opportunityActionIcon: Record<
  OpportunitySuggestedAction["type"],
  LucideIcon
> = {
  stalled: TrendingDown,
  closing: CalendarClock,
  date: CircleDollarSign,
  review: Sparkles,
}

const satisfactionActionIcon: Record<
  SatisfactionSuggestedAction["type"],
  LucideIcon
> = {
  low_score: TrendingDown,
  at_risk: AlertTriangle,
  pending: Send,
  review: Sparkles,
}

export default function ActionSuggestionsPage() {
  const isAdmin = useIsAdmin()
  const query = useActionSuggestionsQuery()
  const data = query.data

  // Role-scoped base path (e.g. "/admin", "/sales", "/manager") derived from
  // the current route so "View" links land on the right role's detail page.
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const basePath = `/${pathname.split("/")[1] ?? "admin"}`

  let content
  if (query.isPending) {
    content = (
      <div className="flex items-center justify-center py-24">
        <Spinner className="size-10" />
      </div>
    )
  } else if (query.isError) {
    content = (
      <div className="flex items-center justify-center py-24">
        <p className="text-sm text-muted-foreground">
          Couldn't load action suggestions.{" "}
          {query.error instanceof Error
            ? query.error.message
            : "Please try again."}
        </p>
      </div>
    )
  } else if (data) {
    content = <SuggestionsContent data={data} basePath={basePath} navigate={navigate} />
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-medium">
            Action Suggestions
          </h1>
          <p className="text-sm text-muted-foreground">
            Rule-based suggested actions from opportunity pipeline and client
            satisfaction analytics
          </p>
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

      {isAdmin && <ActionSettingsPanel />}

      {content}
    </div>
  )
}

function SuggestionsContent({
  data,
  basePath,
  navigate,
}: {
  data: {
    opportunity: { empty: boolean; suggested_actions: OpportunitySuggestedAction[] }
    satisfaction: { empty: boolean; suggested_actions: SatisfactionSuggestedAction[] }
  }
  basePath: string
  navigate: (opts: { to: string }) => void
}) {
  const { opportunity, satisfaction } = data
  const bothEmpty = opportunity.empty && satisfaction.empty

  if (bothEmpty) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Target className="mb-3 size-10 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">
            No data available yet. Add opportunities and client surveys to see
            auto-suggested actions.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-8">
      {/* Opportunity Pipeline */}
      {!opportunity.empty && (
        <div className="space-y-4">
          <SectionHeading icon={Target} title="Opportunity Pipeline" />
          <SuggestedActions
            actions={opportunity.suggested_actions}
            variant="opportunity"
            emptyMessage="No action suggestions right now. Everything looks good — keep pushing deals forward."
            basePath={basePath}
            navigate={navigate}
          />
        </div>
      )}

      {/* Client Satisfaction */}
      {!satisfaction.empty && (
        <div className="space-y-4">
          <SectionHeading icon={Star} title="Client Satisfaction" />
          <SuggestedActions
            actions={satisfaction.suggested_actions}
            variant="satisfaction"
            emptyMessage="No action suggestions right now. Client satisfaction looks healthy."
            basePath={basePath}
            navigate={navigate}
          />
        </div>
      )}
    </div>
  )
}

function SectionHeading({
  icon: Icon,
  title,
}: {
  icon: LucideIcon
  title: string
}) {
  return (
    <h2 className="flex items-center gap-2 font-heading text-lg font-semibold">
      <Icon className="size-5 text-primary" />
      {title}
    </h2>
  )
}

function SuggestedActions({
  actions,
  variant,
  emptyMessage,
  basePath,
  navigate,
}: {
  actions: (OpportunitySuggestedAction | SatisfactionSuggestedAction)[]
  variant: "opportunity" | "satisfaction"
  emptyMessage: string
  basePath: string
  navigate: (opts: { to: string }) => void
}) {
  if (actions.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Sparkles className="mx-auto mb-2 size-8 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle className="font-heading text-base">
            Suggested Actions
          </CardTitle>
          <Badge variant="outline">Auto-suggested</Badge>
        </div>
        <CardDescription>
          Rule-based actions derived from current{" "}
          {variant === "opportunity" ? "pipeline" : "satisfaction"} data
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {actions.map((action, index) => {
            const iconMap =
              variant === "opportunity"
                ? opportunityActionIcon
                : satisfactionActionIcon
            const Icon = iconMap[action.type as keyof typeof iconMap] ?? Sparkles

            return (
              <li
                key={`${action.type}-${index}`}
                className="flex items-center gap-3 rounded-lg border bg-card p-3"
              >
                <Icon className="size-4 shrink-0 text-primary" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{action.suggest}</p>
                  <p className="text-xs text-muted-foreground">
                    {action.reason}
                  </p>
                </div>
                {variant === "opportunity" && "value" in action && (
                  <span className="shrink-0 text-xs font-medium text-muted-foreground">
                    {formatCurrency(action.value)}
                  </span>
                )}
                {variant === "satisfaction" && "company" in action && (
                  <span className="shrink-0 text-xs font-medium text-muted-foreground">
                    {action.company}
                  </span>
                )}
                {action.id != null ? (
                  <Button
                    size="sm"
                    variant="outline"
                    className="shrink-0"
                    onClick={() =>
                      navigate({
                        to:
                          variant === "opportunity"
                            ? `${basePath}/opportunity/${action.id}`
                            : `${basePath}/client/${action.id}`,
                      })
                    }
                  >
                    View
                  </Button>
                ) : action.type === "review" ? (
                  <Button
                    size="sm"
                    variant="outline"
                    className="shrink-0"
                    onClick={() =>
                      navigate({
                        to:
                          variant === "opportunity"
                            ? `${basePath}/opportunities`
                            : `${basePath}/satisfaction`,
                      })
                    }
                  >
                    View
                  </Button>
                ) : null}
              </li>
            )
          })}
        </ul>
      </CardContent>
    </Card>
  )
}
