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
import { Ellipsis, FunnelPlus, Plus, Search } from "lucide-react"
import { useNavigate } from "@tanstack/react-router"
import { Spinner } from "@/components/ui/spinner"
import {
  ReminderPriorityBadge,
  ReminderStatusBadge,
  isOverdue,
  type ReminderPriority,
} from "@/components/reminders-history"
import useRemindersQuery from "./-useRemindersQuery"

export type ReminderTableRow = {
  id: number
  title: string
  company: { id: number; name: string; industry: string }
  related_to_type: "lead" | "client" | "opportunity"
  related_to_id: number
  related_to_name: string
  related_to_status: string | null
  due_date: string
  priority: ReminderPriority
  status: "pending" | "completed" | "incomplete"
  is_completed: boolean
  assigned_to: { id: number; name: string } | null
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

export default function RemindersTable() {
  const navigate = useNavigate()
  const query = useRemindersQuery()
  const data = query.data

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon">
              <Search />
            </Button>
            <Input placeholder="Search reminders..." className="w-xs" />
            <Button variant="outline" size="icon">
              <FunnelPlus />
            </Button>
          </div>
          <Button onClick={() => navigate({ to: "/sales/reminders/create" })}>
            <Plus />
            <span>Create Reminder</span>
          </Button>
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
                <TableHead>Assigned To</TableHead>
                <TableHead>Created</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.map((reminder) => (
                <TableRow
                  key={reminder.id}
                  onClick={() =>
                    navigate({
                      to: "/sales/reminders/$reminderId",
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
                    <div className="flex items-center gap-1">
                      <ReminderStatusBadge status={reminder.status} />
                      {isOverdue(reminder.due_date, reminder.status) && (
                        <Badge variant="destructive" className="text-xs">
                          Overdue
                        </Badge>
                      )}
                    </div>
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
                                to: "/sales/reminders/$reminderId",
                                params: {
                                  reminderId: reminder.id.toString(),
                                },
                              })
                            }}
                          >
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => e.stopPropagation()}
                          >
                            Edit
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
