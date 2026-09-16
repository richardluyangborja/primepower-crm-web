import { Calendar, FileText, Printer } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import useAuthUser from "@/lib/queries/useAuthUser"
import {
  aiReportRangeLabel,
  useDeleteAiReport,
  type AiReport,
} from "@/lib/queries/useAiReports"
import { DeleteAiReportButton } from "./-DeleteAiReportButton"

export type AiReportView = AiReport

/**
 * Full report viewer in a modal dialog. The report body only renders here —
 * the page itself keeps the report collapsed to a one-line summary.
 */
export function AiReportModal({
  report,
  open,
  onOpenChange,
}: {
  report: AiReportView
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const userQuery = useAuthUser()
  const isAdmin = userQuery.data?.role === "admin"
  const deleteMutation = useDeleteAiReport()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <FileText className="h-4 w-4 text-muted-foreground" />
            {report.type_label}
          </DialogTitle>
          <DialogDescription>
            <Badge variant="secondary" className="gap-1">
              <Calendar className="h-3 w-3" />
              {aiReportRangeLabel(report)}
            </Badge>{" "}
            — Generated{" "}
            {new Date(report.created_at).toLocaleString([], {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh]">
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {report.content}
          </p>
        </ScrollArea>

        <DialogFooter>
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
      <div className="text-sm leading-relaxed whitespace-pre-wrap">
        {report.content}
      </div>
    </div>
  )
}
