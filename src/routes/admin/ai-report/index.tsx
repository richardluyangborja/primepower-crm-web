import { createFileRoute } from "@tanstack/react-router"
import { AiReportPage } from "@/components/ai-report/ai-report-page"

export const Route = createFileRoute("/admin/ai-report/")({
  component: () => <AiReportPage />,
})