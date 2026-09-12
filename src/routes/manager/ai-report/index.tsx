import { createFileRoute } from "@tanstack/react-router"
import { AiReportPage } from "@/components/ai-report/ai-report-page"

export const Route = createFileRoute("/manager/ai-report/")({
  component: () => <AiReportPage />,
})