import { createFileRoute } from "@tanstack/react-router"
import ActionSuggestionsPage from "./-ActionSuggestionsPage"

export const Route = createFileRoute("/admin/action-suggestions/")({
  component: () => <ActionSuggestionsPage />,
})
