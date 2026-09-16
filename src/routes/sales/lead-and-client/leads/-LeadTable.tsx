import { useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  BadgeCheck,
  Ellipsis,
  Eye,
  EyeOff,
  Loader2,
  MoveUpRight,
  Search,
  Sparkles,
  Users,
  X,
} from "lucide-react"
import { useNavigate } from "@tanstack/react-router"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import useLeadsQuery, {
  useLeadSourcesQuery,
  useDeleteLead,
} from "./-useLeadsQuery"
import { Spinner } from "@/components/ui/spinner"
import { explainDeleteBlock } from "@/lib/delete-guard"
import { getInitials } from "@/lib/utils"
import { KpiCards } from "@/components/kpi-cards"

const statusLabels: Record<
  "new" | "qualified" | "converted" | "disqualified",
  string
> = {
  new: "New",
  qualified: "Qualified",
  converted: "Converted",
  disqualified: "Disqualified",
}

export type LeadTableRow = {
  id: string
  company: {
    id: string
    name: string
    industry: string
    logoHref?: string
    logoFallback?: string
  }
  source: string
  primary_contact?: {
    name: string
    title: string
  }
  status: "new" | "qualified" | "converted" | "disqualified"
  sales_representative: {
    name: string
    profileHref?: string
    profileFallback?: string
  }
}

export default function LeadTable() {
  const navigate = useNavigate()

  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("all")
  const [source, setSource] = useState("all")
  const [includeConverted, setIncludeConverted] = useState(false)

  const params = useMemo(
    () => ({
      q: search || undefined,
      status: status === "all" ? undefined : status,
      source: source === "all" ? undefined : source,
      // Converted leads are hidden by default; the toggle flips this off.
      exclude_converted: !includeConverted,
    }),
    [search, status, source, includeConverted]
  )

  const query = useLeadsQuery(params)
  const sourcesQuery = useLeadSourcesQuery()
  const deleteMutation = useDeleteLead()
  const data = query.data

  const kpis = useMemo(() => {
    const rows = data ?? []
    return [
      {
        label: "Total Leads",
        value: rows.length,
        hint: "All leads in view",
        icon: Users,
      },
      {
        label: "New",
        value: rows.filter((l) => l.status === "new").length,
        hint: "Awaiting qualification",
        icon: Sparkles,
      },
      {
        label: "Qualified",
        value: rows.filter((l) => l.status === "qualified").length,
        hint: "Ready to progress",
        icon: BadgeCheck,
      },
    ]
  }, [data])

  const [deleteTarget, setDeleteTarget] = useState<{
    id: string
    name: string
  } | null>(null)

  const deleteError = deleteMutation.isError
    ? ((
        deleteMutation.error as {
          response?: { data?: { message?: string } }
        }
      )?.response?.data?.message ??
      (deleteMutation.error as Error)?.message ??
      "Something went wrong.")
    : null

  const confirmDelete = async () => {
    if (!deleteTarget) return
    await deleteMutation.mutateAsync(deleteTarget.id)
    setDeleteTarget(null)
  }

  const hasActiveFilters =
    Boolean(search) || status !== "all" || source !== "all"

  const resetFilters = () => {
    setSearch("")
    setStatus("all")
    setSource("all")
    setIncludeConverted(false)
  }

  return (
    <div className="flex flex-col gap-4">
      <KpiCards kpis={kpis} />
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[12rem] flex-1">
              <Search className="absolute top-1/2 left-2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search company or notes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {(["new", "qualified", "disqualified"] as const).map((s) => (
                  <SelectItem key={s} value={s}>
                    {statusLabels[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={source} onValueChange={setSource}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All sources</SelectItem>
                {(sourcesQuery.data ?? []).map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant={includeConverted ? "secondary" : "outline"}
              size="sm"
              onClick={() => setIncludeConverted((v) => !v)}
            >
              {includeConverted ? (
                <Eye className="size-4" />
              ) : (
                <EyeOff className="size-4" />
              )}
              Show converted
            </Button>
            {(hasActiveFilters || includeConverted) && (
              <Button variant="ghost" size="sm" onClick={resetFilters}>
                <X />
                Clear
              </Button>
            )}
            <CardAction>
              <Button onClick={() => navigate({ to: "/sales/lead/create" })}>
                <span>Create new lead</span>
                <MoveUpRight />
              </Button>
            </CardAction>
          </div>
        </CardHeader>
        <CardContent>
          {query.isPending ? (
            <div className="flex justify-center">
              <Spinner />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Primary Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sales Representative</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.map((lead) => (
                  <TableRow
                    key={lead.id}
                    onClick={() =>
                      navigate({
                        to: "/sales/lead/$leadId",
                        params: { leadId: lead.id.toString() },
                      })
                    }
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Avatar>
                          <AvatarImage src={lead.company.logoHref} />
                          <AvatarFallback>
                            {lead.company.logoFallback ??
                              getInitials(lead.company.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span>{lead.company.name}</span>
                          <span className="text-xs font-normal text-muted-foreground">
                            {lead.company.industry}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{lead.source}</TableCell>
                    <TableCell className="flex flex-col">
                      <span>{lead.primary_contact?.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {lead.primary_contact?.title}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {statusLabels[lead.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar>
                          <AvatarImage
                            src={lead.sales_representative.profileHref}
                          />
                          <AvatarFallback>
                            {lead.sales_representative.profileFallback ??
                              getInitials(lead.sales_representative.name)}
                          </AvatarFallback>
                        </Avatar>
                        <span>{lead.sales_representative.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Ellipsis />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuGroup>
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation()
                                navigate({
                                  to: "/sales/lead/$leadId",
                                  params: { leadId: lead.id.toString() },
                                })
                              }}
                            >
                              View
                            </DropdownMenuItem>
                          </DropdownMenuGroup>
                          <DropdownMenuSeparator />
                          <DropdownMenuGroup>
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={(e) => {
                                e.stopPropagation()
                                setDeleteTarget({
                                  id: lead.id,
                                  name: lead.company.name,
                                })
                              }}
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {data?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      No leads found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>

        <Dialog
          open={!!deleteTarget}
          onOpenChange={(open) => {
            if (!open) {
              setDeleteTarget(null)
              deleteMutation.reset()
            }
          }}
        >
          <DialogContent showCloseButton={false}>
            <DialogHeader>
              <DialogTitle>Delete lead?</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete the lead for{" "}
                {deleteTarget?.name}? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            {deleteError && (
              <div className="space-y-2">
                <p className="text-sm text-destructive">{deleteError}</p>
                {explainDeleteBlock(deleteError).length > 0 && (
                  <ul className="space-y-1">
                    {explainDeleteBlock(deleteError).map((step) => (
                      <li key={step} className="text-sm text-muted-foreground">
                        • {step}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteTarget(null)}
                disabled={deleteMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending && (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                )}
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Card>
    </div>
  )
}
