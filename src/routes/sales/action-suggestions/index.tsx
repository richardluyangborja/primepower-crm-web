import { createFileRoute } from "@tanstack/react-router"
import ActionSuggestionsPage from "./-ActionSuggestionsPage"

export const Route = createFileRoute("/sales/action-suggestions/")({
  component: () => <ActionSuggestionsPage />,
})
