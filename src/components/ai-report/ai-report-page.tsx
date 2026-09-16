import { useState } from "react"
import {
  AlertCircle,
  Calendar,
  FileText,
  Loader2,
  Plus,
  ShieldCheck,
  Sparkles,
  User,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  aiReportRangeLabel,
  useAiReportsQuery,
  useGenerateAiReport,
} from "@/lib/queries/useAiReports"
import { AiReportModal, AiReportPrintPane } from "./ai-report-render"

export type ReportType = "business_health" | "rep_performance"
export type DateRange = "this_week" | "last_month" | "custom"

const REPORT_TYPES: { value: ReportType; label: string; hint: string }[] = [
  {
    value: "business_health",
    label: "Business Health Report",
    hint: "Pipeline + satisfaction analytics with action suggestions",
  },
  {
    value: "rep_performance",
    label: "Sales Performance Report",
    hint: "Per-representative pipeline, win rate and satisfaction",
  },
]

const DATE_RANGES: { value: DateRange; label: string }[] = [
  { value: "this_week", label: "This Week" },
  { value: "last_month", label: "Last Month" },
  { value: "custom", label: "Custom Range" },
]

export function AiReportPage() {
  const reportsQuery = useAiReportsQuery()
  const generateMutation = useGenerateAiReport()

  const [type, setType] = useState<ReportType>("business_health")
  const [dateRange, setDateRange] = useState<DateRange>("this_week")
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")

  // The report currently being read / exported; null means "newest".
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const currentReport =
    reportsQuery.data?.find((r) => r.id === selectedId) ??
    reportsQuery.data?.[0] ??
    null

  const [modalOpen, setModalOpen] = useState(false)

  const isCustomRange = dateRange === "custom"
  const isGenerating = generateMutation.isPending
  const hasError = generateMutation.isError
  const disabledGenerate =
    isGenerating || (isCustomRange && (!fromDate || !toDate))
  const activeType = REPORT_TYPES.find((t) => t.value === type)

  const handleGenerate = async () => {
    const report = await generateMutation.mutateAsync({
      type,
      date_range: dateRange,
      ...(isCustomRange ? { from_date: fromDate, to_date: toDate } : {}),
    })
    setSelectedId(report.id)
    setModalOpen(true)
  }

  return (
    <div className="space-y-6 p-6">
      {/* Always-mounted print pane; only visible in the print dialog. */}
      {currentReport && (
        <div className="print-report">
          <AiReportPrintPane report={currentReport} />
        </div>
      )}

      <header className="py-4">
        <h1 className="font-heading text-lg">Management Report Generation</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          Generate management-ready reports from your analytics and action
          suggestions.
        </p>
      </header>

      <Alert>
        <ShieldCheck />
        <AlertTitle>How reports work</AlertTitle>
        <AlertDescription>
          Reports are built from aggregated analytics for the selected period
          and follow a fixed five-section structure. Only numbers are sent to
          the AI — no company, client, or representative names or emails.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Generate New Report
          </CardTitle>
          <CardDescription>
            Pick a report type and period, then generate. Your report history is
            kept below.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="type">Report Type</Label>
              <Select
                value={type}
                onValueChange={(v) => setType(v as ReportType)}
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  {REPORT_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {activeType && (
                <p className="text-xs text-muted-foreground">
                  {activeType.hint}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="date_range">Date Range</Label>
              <Select
                value={dateRange}
                onValueChange={(v) => setDateRange(v as DateRange)}
              >
                <SelectTrigger id="date_range">
                  <SelectValue placeholder="Select date range" />
                </SelectTrigger>
                <SelectContent>
                  {DATE_RANGES.map((d) => (
                    <SelectItem key={d.value} value={d.value}>
                      {d.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {isCustomRange && (
            <div className="grid gap-4 border-t pt-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="from_date">From Date</Label>
                <Input
                  id="from_date"
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="to_date">To Date</Label>
                <Input
                  id="to_date"
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                />
              </div>
            </div>
          )}

          {hasError && (
            <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              {generateMutation.error?.message ?? "Failed to generate report."}
            </div>
          )}

          <Separator />

          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <p className="text-xs text-muted-foreground">
              Generation may take up to a minute. The report opens automatically
              when ready.
            </p>
            <Button
              onClick={handleGenerate}
              disabled={disabledGenerate}
              className="w-full md:w-auto"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating…
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Generate Report
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Report History
            {reportsQuery.data && reportsQuery.data.length > 0 && (
              <Badge variant="secondary">{reportsQuery.data.length}</Badge>
            )}
          </CardTitle>
          <CardDescription>
            Newest first. Select a report to view, export, or delete it.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {reportsQuery.isPending && (
            <p className="text-sm text-muted-foreground">Loading reports…</p>
          )}
          {reportsQuery.data?.length === 0 && (
            <div className="rounded-lg border border-dashed p-6 text-center">
              <p className="text-sm font-medium">No reports yet</p>
              <p className="text-xs text-muted-foreground">
                Generate your first report using the form above.
              </p>
            </div>
          )}
          {reportsQuery.data?.map((report) => (
            <button
              key={report.id}
              type="button"
              onClick={() => {
                setSelectedId(report.id)
                setModalOpen(true)
              }}
              className={`flex w-full items-center justify-between gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-muted/50 ${
                currentReport?.id === report.id
                  ? "border-primary/50 bg-primary/5"
                  : "border-border"
              }`}
            >
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 shrink-0 text-muted-foreground" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">{report.type_label}</p>
                  <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                    <Badge variant="outline" className="gap-1">
                      <Calendar className="h-3 w-3" />
                      {aiReportRangeLabel(report)}
                    </Badge>
                    <span>{new Date(report.created_at).toLocaleString()}</span>
                    {report.user_name && (
                      <span className="inline-flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {report.user_name}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </CardContent>
      </Card>

      {currentReport && (
        <AiReportModal
          report={currentReport}
          open={modalOpen}
          onOpenChange={setModalOpen}
        />
      )}
    </div>
  )
}
