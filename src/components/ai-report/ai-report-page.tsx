import { useState } from "react"
import {
  AlertCircle,
  FileText,
  Loader2,
  Plus,
  Sparkles,
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
import {
  aiReportRangeLabel,
  useAiReportsQuery,
  useGenerateAiReport,
} from "@/lib/queries/useAiReports"
import { AiReportRender, AiReportPrintPane } from "./ai-report-render"

export type ReportType = "opportunity" | "satisfaction" | "rep_performance"
export type DateRange = "this_week" | "last_month" | "custom"

const REPORT_TYPES: { value: ReportType; label: string }[] = [
  { value: "opportunity", label: "Opportunity Report" },
  { value: "satisfaction", label: "Client Satisfaction Report" },
  { value: "rep_performance", label: "Sales Representative Performance Report" },
]

const DATE_RANGES: { value: DateRange; label: string }[] = [
  { value: "this_week", label: "This Week" },
  { value: "last_month", label: "Last Month" },
  { value: "custom", label: "Custom Range" },
]

export function AiReportPage() {
  const reportsQuery = useAiReportsQuery()
  const generateMutation = useGenerateAiReport()

  const [type, setType] = useState<ReportType>("opportunity")
  const [dateRange, setDateRange] = useState<DateRange>("this_week")
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")

  // The report currently being read / exported; null means "newest".
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const currentReport =
    reportsQuery.data?.find((r) => r.id === selectedId) ??
    reportsQuery.data?.[0] ??
    null

  const isCustomRange = dateRange === "custom"
  const isGenerating = generateMutation.isPending
  const hasError = generateMutation.isError
  const disabledGenerate =
    isGenerating || (isCustomRange && (!fromDate || !toDate))

  const handleGenerate = async () => {
    const report = await generateMutation.mutateAsync({
      type,
      date_range: dateRange,
      ...(isCustomRange ? { from_date: fromDate, to_date: toDate } : {}),
    })
    setSelectedId(report.id)
  }

  return (
    <div className="space-y-6 p-6">
      {/* Always-mounted print pane; only visible in the print dialog. */}
      {currentReport && (
        <div className="print-report">
          <AiReportPrintPane report={currentReport} />
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold">AI Reports</h1>
        <p className="text-muted-foreground">
          Generate AI-written reports from your pipeline and satisfaction
          analytics.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Generate New Report
          </CardTitle>
          <CardDescription>
            Pick a type and period, then generate. Your report history is kept
            below.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="type">Report Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as ReportType)}>
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="date_range">Date Range</Label>
              <Select value={dateRange} onValueChange={(v) => setDateRange(v as DateRange)}>
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
        </CardContent>
      </Card>

      {currentReport && (
        <section>
          <h2 className="mb-4 text-lg font-semibold">Latest Report</h2>
          <AiReportRender report={currentReport} />
        </section>
      )}

      {reportsQuery.data && reportsQuery.data.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Report History
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {reportsQuery.data.map((report) => (
              <button
                key={report.id}
                type="button"
                onClick={() => setSelectedId(report.id)}
                className={`flex w-full items-center justify-between gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-muted/50 ${
                  currentReport?.id === report.id
                    ? "border-primary/50 bg-primary/5"
                    : "border-border"
                }`}
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 shrink-0 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{report.type_label}</p>
                    <p className="text-xs text-muted-foreground">
                      {aiReportRangeLabel(report)} •{" "}
                      {new Date(report.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}