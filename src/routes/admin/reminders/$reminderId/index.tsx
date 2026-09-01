import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { createFileRoute, useRouter, Link } from "@tanstack/react-router"
import {
  AlertTriangle,
  Bell,
  Calendar,
  CheckCircle,
  ChevronLeft,
  Loader2,
  Pencil,
  User,
  XCircle,
} from "lucide-react"
import { Spinner } from "@/components/ui/spinner"
import {
  ReminderPriorityBadge,
  ReminderStatusBadge,
  type ReminderEntry,
} from "@/components/reminders-history"
import useReminderDetailsQuery from "../-useReminderDetailsQuery"
import { useUpdateReminder } from "../-useUpdateReminder"
import { useMarkReminderIncomplete } from "../-useMarkReminderIncomplete"

export const Route = createFileRoute("/admin/reminders/$reminderId/")({
  component: RouteComponent,
})

function RouteComponent() {
  const router = useRouter()
  const { reminderId } = Route.useParams()
  const query = useReminderDetailsQuery(reminderId)
  const reminder = query.data
  const updateMutation = useUpdateReminder()
  const markIncompleteMutation = useMarkReminderIncomplete()

  const dueDate = reminder ? new Date(reminder.due_date) : null
  const dueFormatted = dueDate
    ? dueDate.toLocaleString([], {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null

  const createdAt = reminder ? new Date(reminder.created_at) : null
  const createdAtFormatted = createdAt ? createdAt.toLocaleString() : null

  return (
    <div className="px-4 pb-8">
      <header className="py-4">
        <Button variant="link" onClick={() => router.history.back()}>
          <ChevronLeft />
          <span>Back</span>
        </Button>
      </header>

      <main>
        {query.isPending ? (
          <div className="flex justify-center">
            <Spinner />
          </div>
        ) : !reminder ? (
          <p className="text-sm text-muted-foreground">Reminder not found.</p>
        ) : (
          <>
            <header>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-muted">
                  <Bell size={22} className="text-muted-foreground" />
                </div>
                <div className="flex flex-col gap-1">
                  <h1 className="font-heading text-lg">{reminder.title}</h1>
                  <div className="flex items-center gap-2">
                    <ReminderPriorityBadge priority={reminder.priority} />
                    <ReminderStatusBadge status={reminder.status} />
                  </div>
                </div>
              </div>
            </header>

            <div className="mt-6 flex flex-col gap-6">
              {reminder.status === "pending" &&
                reminder.related_to_type === "lead" &&
                reminder.related_to_status === "converted" && (
                  <Alert variant="destructive">
                    <AlertTriangle />
                    <AlertTitle>
                      Pending Reminder on Converted Lead
                    </AlertTitle>
                    <AlertDescription>
                      This reminder is still pending, but the related lead
                      has been converted to a client. Please mark it as
                      incomplete.
                    </AlertDescription>
                  </Alert>
                )}
              <ReminderDetailCard
                reminder={reminder}
                dueFormatted={dueFormatted}
                createdAtFormatted={createdAtFormatted}
                onMarkComplete={() => updateMutation.mutate(Number(reminderId))}
                onMarkIncomplete={() => markIncompleteMutation.mutate(Number(reminderId))}
                isMarkingComplete={updateMutation.isPending || markIncompleteMutation.isPending}
              />
            </div>
          </>
        )}
      </main>
    </div>
  )
}

function ReminderDetailCard({
  reminder,
  dueFormatted,
  createdAtFormatted,
  onMarkComplete,
  onMarkIncomplete,
  isMarkingComplete,
}: {
  reminder: ReminderEntry
  dueFormatted: string | null
  createdAtFormatted: string | null
  onMarkComplete: () => void
  onMarkIncomplete: () => void
  isMarkingComplete: boolean
}) {
  return (
    <section>
      <Card>
        <CardHeader>
          <CardTitle>Reminder Details</CardTitle>
          <CardDescription>Created on {createdAtFormatted}</CardDescription>
          <CardAction className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={onMarkComplete}
              disabled={isMarkingComplete || reminder.status === "completed"}
            >
              {isMarkingComplete ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <CheckCircle className="mr-2 size-4" />
              )}
              {isMarkingComplete ? "Marking..." : "Mark as Complete"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onMarkIncomplete}
              disabled={isMarkingComplete || reminder.status === "incomplete"}
            >
              {isMarkingComplete ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <XCircle className="mr-2 size-4" />
              )}
              {isMarkingComplete ? "Marking..." : "Mark as Incomplete"}
            </Button>
            <Link
              to="/admin/reminders/create"
              className="inline-flex items-center justify-center rounded-md border border-input bg-background px-3 text-sm font-medium shadow-xs hover:bg-accent"
            >
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </CardAction>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="block text-sm text-muted-foreground">
                Priority
              </span>
              <ReminderPriorityBadge priority={reminder.priority} />
            </div>
            <div>
              <span className="block text-sm text-muted-foreground">
                Status
              </span>
              <ReminderStatusBadge status={reminder.status} />
            </div>
            <div className="col-span-2">
              <span className="block text-sm text-muted-foreground">
                Due Date
              </span>
              <div className="flex items-center gap-1.5">
                <Calendar size={16} className="text-muted-foreground" />
                <span>{dueFormatted}</span>
              </div>
            </div>
            {reminder.description && (
              <div className="col-span-2">
                <span className="block text-sm text-muted-foreground">
                  Description
                </span>
                <p className="mt-1 text-sm">{reminder.description}</p>
              </div>
            )}
            <div>
              <span className="block text-sm text-muted-foreground">
                Assigned To
              </span>
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
                  <span>{reminder.assigned_to.name}</span>
                </div>
              ) : (
                <span className="text-sm text-muted-foreground">
                  Unassigned
                </span>
              )}
            </div>

            {reminder.is_completed && reminder.completed_at && (
              <div>
                <span className="block text-sm text-muted-foreground">
                  Completed At
                </span>
                <div className="flex items-center gap-1.5">
                  <CheckCircle size={16} className="text-green-600" />
                  <span>
                    {new Date(reminder.completed_at).toLocaleString()}
                  </span>
                </div>
              </div>
            )}
          </div>

          <Separator className="my-4" />

          <div>
            <span className="block text-sm text-muted-foreground">Company</span>
            <div className="mt-1 flex items-center gap-2">
              <User size={18} className="text-muted-foreground" />
              <div className="flex flex-col">
                <span>{reminder.company.name}</span>
                <span className="text-xs text-muted-foreground">
                  {reminder.company.industry}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
