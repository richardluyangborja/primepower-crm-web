import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Search, Eye, ChevronLeft, ChevronRight } from "lucide-react"
import { Spinner } from "@/components/ui/spinner"
import useAuditLogsQuery, {
  AUDIT_MODULES,
  type AuditLogEntry,
} from "./-useAuditLogsQuery"

type BadgeVariant = "default" | "secondary" | "destructive" | "outline" | "ghost"

function moduleVariant(module: string): BadgeVariant {
  switch (module) {
    case "Lead":
      return "default"
    case "Client":
      return "secondary"
    case "Contact":
      return "outline"
    case "Opportunity":
      return "default"
    case "Communication":
      return "secondary"
    case "Reminder":
      return "outline"
    case "Client Satisfaction":
      return "ghost"
    default:
      return "secondary"
  }
}

function actionVariant(action: string): BadgeVariant {
  const a = action.toLowerCase()
  if (a.includes("delete") || a.includes("incomplete")) {
    return "destructive"
  }
  if (a.includes("create") || a.includes("won") || a.includes("complete")) {
    return "default"
  }
  if (
    a.includes("update") ||
    a.includes("status") ||
    a.includes("stage") ||
    a.includes("primary")
  ) {
    return "secondary"
  }
  return "outline"
}

function truncate(text: string | null, max = 60): string {
  if (!text) {
    return "—"
  }
  if (text.length <= max) {
    return text
  }
  return `${text.slice(0, max).trimEnd()}…`
}

function formatDateTime(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }
  return date.toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  })
}

function MetadataValue({ value }: { value: unknown }) {
  if (value === null || value === undefined) {
    return <span className="text-muted-foreground">—</span>
  }
  if (typeof value === "object") {
    return (
      <pre className="text-xs whitespace-pre-wrap rounded bg-muted p-2">
        {JSON.stringify(value, null, 2)}
      </pre>
    )
  }
  return <span>{String(value)}</span>
}

function MetadataList({ metadata }: { metadata: Record<string, unknown> | null }) {
  if (!metadata || Object.keys(metadata).length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No additional details were recorded for this entry.
      </p>
    )
  }
  return (
    <div className="grid grid-cols-1 gap-3">
      {Object.entries(metadata).map(([key, value]) => (
        <div key={key} className="grid grid-cols-[200px_1fr] gap-3">
          <span className="text-sm font-medium capitalize">
            {key.replace(/_/g, " ")}
          </span>
          <div className="text-sm">
            <MetadataValue value={value} />
          </div>
        </div>
      ))}
    </div>
  )
}

function AuditLogDetails({ entry }: { entry: AuditLogEntry }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={moduleVariant(entry.module)}>{entry.module}</Badge>
        <Badge variant={actionVariant(entry.action)}>{entry.action}</Badge>
      </div>

      <p className="text-sm text-muted-foreground">
        {entry.description ?? "No description provided."}
      </p>

      <Separator />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <p className="text-xs font-medium uppercase text-muted-foreground">
            Performed At
          </p>
          <p className="text-sm">{formatDateTime(entry.created_at)}</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase text-muted-foreground">
            Actor
          </p>
          <p className="text-sm">
            {entry.actor_name ?? "System"}
            {entry.actor_role ? (
              <span className="ml-2 text-xs text-muted-foreground">
                ({entry.actor_role})
              </span>
            ) : null}
          </p>
          {entry.actor_email ? (
            <p className="text-xs text-muted-foreground">{entry.actor_email}</p>
          ) : null}
        </div>
        <div>
          <p className="text-xs font-medium uppercase text-muted-foreground">
            Subject
          </p>
          <p className="text-sm">{entry.subject_name ?? "—"}</p>
          {(entry.subject_type || entry.subject_id) && (
            <p className="text-xs text-muted-foreground">
              {entry.subject_type}
              {entry.subject_id ? ` #${entry.subject_id}` : ""}
            </p>
          )}
        </div>
      </div>

      <Separator />

      <div>
        <p className="mb-2 text-xs font-medium uppercase text-muted-foreground">
          Additional Details
        </p>
        <MetadataList metadata={entry.metadata} />
      </div>
    </div>
  )
}

export default function AuditLogTable() {
  const [searchInput, setSearchInput] = useState("")
  const [search, setSearch] = useState("")
  const [moduleFilter, setModuleFilter] = useState<string>("")
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<AuditLogEntry | null>(null)

  const query = useAuditLogsQuery({
    search: search || undefined,
    module: moduleFilter || undefined,
    page,
  })

  const rows = query.data?.data ?? []
  const meta = query.data?.meta

  const applySearch = () => {
    setPage(1)
    setSearch(searchInput.trim())
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Search actor, subject, or description..."
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  applySearch()
                }
              }}
              className="w-xs"
            />
            <Button variant="outline" size="icon" onClick={applySearch}>
              <Search />
            </Button>
          </div>
          <Select
            value={moduleFilter || "all"}
            onValueChange={(value) => {
              setPage(1)
              setModuleFilter(value === "all" ? "" : value)
            }}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="All modules" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All modules</SelectItem>
              {AUDIT_MODULES.map((module) => (
                <SelectItem key={module} value={module}>
                  {module}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {query.isPending ? (
          <div className="flex justify-center py-10">
            <Spinner />
          </div>
        ) : rows.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            No audit log entries found.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Actor</TableHead>
                <TableHead>Module</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Description</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((entry) => (
                <TableRow
                  key={entry.id}
                  className="cursor-pointer"
                  onClick={() => setSelected(entry)}
                >
                  <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                    {formatDateTime(entry.created_at)}
                  </TableCell>
                  <TableCell className="text-sm">
                    {entry.actor_name ?? "System"}
                    {entry.actor_role ? (
                      <span className="block text-xs text-muted-foreground">
                        {entry.actor_role}
                      </span>
                    ) : null}
                  </TableCell>
                  <TableCell>
                    <Badge variant={moduleVariant(entry.module)}>
                      {entry.module}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={actionVariant(entry.action)}>
                      {entry.action}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {entry.subject_name ?? "—"}
                  </TableCell>
                  <TableCell className="max-w-md text-sm text-muted-foreground">
                    {truncate(entry.description)}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(event) => {
                        event.stopPropagation()
                        setSelected(entry)
                      }}
                    >
                      <Eye />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {meta && meta.last_page > 1 ? (
          <div className="mt-4 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              Page {meta.current_page} of {meta.last_page}
              {meta.total ? ` · ${meta.total} entries` : ""}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={meta.current_page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={meta.current_page >= meta.last_page}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
                <ChevronRight />
              </Button>
            </div>
          </div>
        ) : null}
      </CardContent>

      <Dialog open={selected !== null} onOpenChange={(open) => {
        if (!open) {
          setSelected(null)
        }
      }}>
        <DialogContent className="sm:max-w-xl">
          {selected ? (
            <>
              <DialogHeader>
                <DialogTitle>Audit Log Entry #{selected.id}</DialogTitle>
                <DialogDescription>
                  Detailed record of a single system operation.
                </DialogDescription>
              </DialogHeader>
              <ScrollArea className="max-h-[70vh] pr-3">
                <AuditLogDetails entry={selected} />
              </ScrollArea>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </Card>
  )
}
