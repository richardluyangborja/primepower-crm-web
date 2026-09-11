import { createFileRoute } from "@tanstack/react-router"
import ActionSuggestionsPage from "./-ActionSuggestionsPage"

export const Route = createFileRoute("/manager/action-suggestions/")({
  component: () => <ActionSuggestionsPage />,
})
