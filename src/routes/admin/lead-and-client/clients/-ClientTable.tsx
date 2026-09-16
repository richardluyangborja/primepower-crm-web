import { useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
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
  Activity,
  Briefcase,
  Ellipsis,
  Loader2,
  Minus,
  Pause,
  Search,
  TrendingDown,
  TrendingUp,
  X,
} from "lucide-react"
import { useNavigate } from "@tanstack/react-router"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import useClientsQuery, { useDeleteClient } from "./-useClientsQuery"
import { Spinner } from "@/components/ui/spinner"
import { useCanWrite } from "@/lib/queries/useCanWrite"
import { explainDeleteBlock } from "@/lib/delete-guard"
import { getInitials } from "@/lib/utils"
import { KpiCards } from "@/components/kpi-cards"

const trendLabels: Record<"up" | "down" | "stable", string> = {
  up: "Improving",
  down: "Declining",
  stable: "Stable",
}

const statusLabels: Record<"active" | "inactive", string> = {
  active: "Active",
  inactive: "Inactive",
}

export type ClientTableRow = {
  id: string
  company: {
    name: string
    industry: string
    logoHref?: string
    logoFallback?: string
  }
  primary_contact?: {
    name: string
    title: string
  }
  status: "active" | "inactive"
  trend: "up" | "down" | "stable" | null
  sales_representative: {
    name: string
    profileHref?: string
    profileFallback?: string
  }
}

export default function ClientTable({
  basePath = "/admin",
}: {
  basePath?: string
}) {
  const navigate = useNavigate()
  const canWrite = useCanWrite()

  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("all")

  const params = useMemo(
    () => ({
      q: search || undefined,
      status: status === "all" ? undefined : status,
    }),
    [search, status]
  )

  const query = useClientsQuery(params)
  const deleteMutation = useDeleteClient()
  const data = query.data

  const kpis = useMemo(() => {
    const rows = data ?? []
    return [
      {
        label: "Total Clients",
        value: rows.length,
        hint: "All clients in view",
        icon: Briefcase,
      },
      {
        label: "Active",
        value: rows.filter((c) => c.status === "active").length,
        hint: "Currently active",
        icon: Activity,
      },
      {
        label: "Inactive",
        value: rows.filter((c) => c.status === "inactive").length,
        hint: "Marked inactive",
        icon: Pause,
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

  const hasActiveFilters = Boolean(search) || status !== "all"

  return (
    <div className="flex flex-col gap-4">
      <KpiCards kpis={kpis} />
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[12rem] flex-1">
              <Search className="absolute top-1/2 left-2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search company..."
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
                {(["active", "inactive"] as const).map((s) => (
                  <SelectItem key={s} value={s}>
                    {statusLabels[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearch("")
                  setStatus("all")
                }}
              >
                <X />
                Clear
              </Button>
            )}
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
                  <TableHead>Primary Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Trend</TableHead>
                  <TableHead>Sales Representative</TableHead>
                  {canWrite && <TableHead />}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.map((client) => (
                  <TableRow
                    key={client.id}
                    onClick={() =>
                      navigate({
                        to: `${basePath}/client/$clientId`,
                        params: { clientId: client.id.toString() },
                      })
                    }
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Avatar>
                          <AvatarImage src={client.company.logoHref} />
                          <AvatarFallback>
                            {client.company.logoFallback ??
                              getInitials(client.company.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span>{client.company.name}</span>
                          <span className="text-xs font-normal text-muted-foreground">
                            {client.company.industry}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="flex flex-col">
                      <span>{client.primary_contact?.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {client.primary_contact?.title}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {statusLabels[client.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {client.trend === "up" && (
                          <>
                            <TrendingUp className="size-4 text-emerald-500" />
                            <span className="text-xs text-emerald-500">
                              {trendLabels["up"]}
                            </span>
                          </>
                        )}
                        {client.trend === "down" && (
                          <>
                            <TrendingDown className="size-4 text-rose-500" />
                            <span className="text-xs text-rose-500">
                              {trendLabels["down"]}
                            </span>
                          </>
                        )}
                        {client.trend === "stable" && (
                          <>
                            <Minus className="size-4 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {trendLabels["stable"]}
                            </span>
                          </>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar>
                          <AvatarImage
                            src={client.sales_representative.profileHref}
                          />
                          <AvatarFallback>
                            {client.sales_representative.profileFallback ??
                              getInitials(client.sales_representative.name)}
                          </AvatarFallback>
                        </Avatar>
                        <span>{client.sales_representative.name}</span>
                      </div>
                    </TableCell>
                    {canWrite && (
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
                                    to: `${basePath}/client/$clientId`,
                                    params: { clientId: client.id.toString() },
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
                                    id: client.id,
                                    name: client.company.name,
                                  })
                                }}
                              >
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuGroup>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
                {data?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      No clients found.
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
              <DialogTitle>Delete client?</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete the client {deleteTarget?.name}?
                This action cannot be undone.
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
