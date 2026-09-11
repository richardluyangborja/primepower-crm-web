import { Sparkles } from "lucide-react"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import { useActionSuggestionsQuery } from "@/lib/queries/useActionSuggestions"

/**
 * Shows the auto-suggested actions that apply to one specific opportunity or
 * client, pulled from the shared rule-based analytics. Renders nothing when
 * the entity has no active suggestions.
 */
export function ActionSuggestionAlert({
  entityType,
  entityId,
}: {
  entityType: "opportunity" | "client"
  entityId: number
}) {
  const query = useActionSuggestionsQuery()

  if (query.isPending || query.isError || !query.data) {
    return null
  }

  const section =
    entityType === "opportunity"
      ? query.data.opportunity
      : query.data.satisfaction

  const suggestions = section.suggested_actions.filter(
    (action) => action.id === entityId
  )

  if (suggestions.length === 0) {
    return null
  }

  return (
    <Alert>
      <Sparkles className="size-4" />
      <AlertTitle>Suggested Actions</AlertTitle>
      <AlertDescription>
        <ul className="mt-1.5 space-y-2">
          {suggestions.map((action, index) => (
            <li key={`${action.type}-${index}`} className="text-sm">
              <span className="font-medium">{action.suggest}</span>
              <span className="block text-xs text-muted-foreground">
                {action.reason}
              </span>
            </li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  )
}