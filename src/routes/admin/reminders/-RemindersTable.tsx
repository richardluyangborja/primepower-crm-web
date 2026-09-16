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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Ellipsis, Loader2, Plus, Search, X } from "lucide-react"
import { useNavigate } from "@tanstack/react-router"
import { Spinner } from "@/components/ui/spinner"
import { useState, useMemo } from "react"
import { useDeleteReminder } from "./-useDeleteReminder"
import {
  ReminderPriorityBadge,
  ReminderStatusBadge,
  isOverdue,
  recurrenceLabels,
  type ReminderPriority,
} from "@/components/reminders-history"
import useRemindersQuery, {
  type ReminderScope,
  type ReminderFilters,
} from "./-useRemindersQuery"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useCanWrite } from "@/lib/queries/useCanWrite"

export type ReminderTableRow = {
  id: string
  title: string
  company: { id: string; name: string; industry: string }
  related_to_type: "lead" | "client" | "opportunity"
  related_to_id: string
  related_to_name: string
  due_date: string
  priority: ReminderPriority
  is_completed: boolean
  status: "pending" | "completed" | "incomplete"
  related_to_status: string | null
  assigned_to: { id: string; name: string } | null
  recurrence_rule: "daily" | "weekly" | "monthly" | null
  created_at: string
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export default function RemindersTable({
  defaultScope = "all",
  basePath = "/admin",
}: {
  defaultScope?: ReminderScope
  basePath?: string
}) {
  const navigate = useNavigate()
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState<string>("all")
  const [priority, setPriority] = useState<string>("all")
  const [from, setFrom] = useState<string>("")
  const [to, setTo] = useState<string>("")

  const filters = useMemo<ReminderFilters>(
    () => ({
      q: search || undefined,
      status: status === "all" ? undefined : status,
      priority: priority === "all" ? undefined : priority,
      from: from || undefined,
      to: to || undefined,
    }),
    [search, status, priority, from, to]
  )

  const query = useRemindersQuery(defaultScope, filters)
  const data = query.data
  const canWrite = useCanWrite()
  const deleteMutation = useDeleteReminder()
  const [reminderToDelete, setReminderToDelete] = useState<string | null>(null)

  const hasActiveFilters =
    Boolean(search) ||
    status !== "all" ||
    priority !== "all" ||
    Boolean(from) ||
    Boolean(to)

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[12rem] flex-1">
            <Search className="absolute top-1/2 left-2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search title or company..."
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
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="incomplete">Incomplete</SelectItem>
            </SelectContent>
          </Select>
          <Select value={priority} onValueChange={setPriority}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All priorities</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearch("")
                setStatus("all")
                setPriority("all")
                setFrom("")
                setTo("")
              }}
            >
              <X />
              Clear
            </Button>
          )}
          {canWrite && (
            <Button
              onClick={() => navigate({ to: `${basePath}/reminders/create` })}
            >
              <Plus />
              <span>Create Reminder</span>
            </Button>
          )}
        </div>
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">From</span>
            <Input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="w-40"
            />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">To</span>
            <Input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-40"
            />
          </div>
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
                <TableHead>Title</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Recurrence</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Created</TableHead>
                {canWrite && <TableHead />}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.map((reminder) => (
                <TableRow
                  key={reminder.id}
                  onClick={() =>
                    navigate({
                      to: `${basePath}/reminders/$reminderId`,
                      params: { reminderId: reminder.id.toString() },
                    })
                  }
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-7 w-7">
                        <AvatarFallback>
                          {reminder.company.name
                            .split(" ")
                            .map((w) => w[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span>{reminder.company.name}</span>
                        <span className="text-xs font-normal text-muted-foreground">
                          {reminder.company.industry}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    {reminder.title}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {formatDate(reminder.due_date)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <ReminderPriorityBadge priority={reminder.priority} />
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <ReminderStatusBadge status={reminder.status} />
                      {isOverdue(reminder.due_date, reminder.status) && (
                        <Badge variant="destructive" className="text-xs">
                          Overdue
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {reminder.recurrence_rule ? (
                      <Badge variant="outline" className="text-xs">
                        {recurrenceLabels[reminder.recurrence_rule]}
                      </Badge>
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {reminder.assigned_to ? (
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">
                            {reminder.assigned_to.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">
                          {reminder.assigned_to.name}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        Unassigned
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {formatDate(reminder.created_at)}
                    </span>
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
                                  to: `${basePath}/reminders/$reminderId`,
                                  params: {
                                    reminderId: reminder.id.toString(),
                                  },
                                })
                              }}
                            >
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation()
                                navigate({
                                  to: `${basePath}/reminders/$reminderId/edit`,
                                  params: {
                                    reminderId: reminder.id.toString(),
                                  },
                                })
                              }}
                            >
                              Edit
                            </DropdownMenuItem>
                          </DropdownMenuGroup>
                          <DropdownMenuSeparator />
                          <DropdownMenuGroup>
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={(e) => {
                                e.stopPropagation()
                                setReminderToDelete(reminder.id)
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
                  <TableCell colSpan={9} className="text-center">
                    No reminders found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <Dialog
        open={reminderToDelete !== null}
        onOpenChange={(open) => {
          if (!open) setReminderToDelete(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete reminder?</DialogTitle>
            <DialogDescription>
              This will permanently delete the reminder. This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setReminderToDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                if (reminderToDelete === null) return
                await deleteMutation.mutateAsync(reminderToDelete)
                setReminderToDelete(null)
              }}
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
  )
}
