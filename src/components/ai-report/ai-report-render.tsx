import { Calendar, FileText, Printer } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import useAuthUser from "@/lib/queries/useAuthUser"
import {
  aiReportRangeLabel,
  useDeleteAiReport,
  type AiReport,
} from "@/lib/queries/useAiReports"
import { DeleteAiReportButton } from "./-DeleteAiReportButton"

export type AiReportView = AiReport

export function AiReportRender({ report }: { report: AiReportView }) {
  const userQuery = useAuthUser()
  const isAdmin = userQuery.data?.role === "admin"
  const deleteMutation = useDeleteAiReport()

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileText className="h-4 w-4 text-muted-foreground" />
          {report.type_label}
        </CardTitle>
        <Badge variant="secondary" className="gap-1">
          <Calendar className="h-3 w-3" />
          {aiReportRangeLabel(report)}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="whitespace-pre-wrap text-sm leading-relaxed">{report.content}</p>

        <div className="flex items-center justify-between border-t pt-4 text-xs text-muted-foreground no-print">
          <time dateTime={report.created_at}>
            Generated {new Date(report.created_at).toLocaleString([], {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </time>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <Printer className="mr-2 h-4 w-4" />
              Export PDF
            </Button>
            {isAdmin && (
              <DeleteAiReportButton
                reportId={report.id}
                reportLabel={report.type_label}
                onDelete={(id) => deleteMutation.mutate(id)}
                isPending={deleteMutation.isPending}
              />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Always-mounted pane rendered for print: hidden on screen, its content is all
 * that prints. The page renders it with the report the user is currently viewing.
 */
export function AiReportPrintPane({ report }: { report: AiReportView }) {
  return (
    <div className="print-report">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold">{report.type_label}</h1>
        <p className="text-sm text-muted-foreground">
          Period: {aiReportRangeLabel(report)} — Generated{" "}
          {new Date(report.created_at).toLocaleString()}
        </p>
      </div>
      <div className="whitespace-pre-wrap text-sm leading-relaxed">
        {report.content}
      </div>
    </div>
  )
}