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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { useForm } from "@tanstack/react-form"
import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router"
import { useState } from "react"
import {
  ChevronLeft,
  ContactRound,
  Info,
  Loader2,
  MoveUpRight,
  Pencil,
  Trash,
} from "lucide-react"
import { Spinner } from "@/components/ui/spinner"
import {
  CommunicationDirectionBadge,
  CommunicationOutcomeBadge,
  CommunicationTypeBadge,
  communicationDirectionLabels,
  communicationOutcomeLabels,
  communicationTypeIcons,
  communicationTypeLabels,
  formatDuration,
  type CommunicationEntry,
  type CommunicationOutcome,
  type CommunicationType,
} from "@/components/communication-history"
import useCommunicationDetailsQuery from "../-useCommunicationDetailsQuery"
import {
  useDeleteCommunication,
  useUpdateCommunication,
} from "../-useCreateCommunication"
import { isAxiosError } from "@/lib/api"

export const Route = createFileRoute("/admin/communications/$communicationId/")(
  {
    component: RouteComponent,
  }
)

function RouteComponent() {
  const router = useRouter()
  const { communicationId } = Route.useParams()
  const navigate = useNavigate()
  const query = useCommunicationDetailsQuery(communicationId)
  const deleteMutation = useDeleteCommunication()
  const comm = query.data
  const TypeIcon = comm ? communicationTypeIcons[comm.type] : null

  const [editOpen, setEditOpen] = useState(false)
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)

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
        ) : !comm ? (
          <p className="text-sm text-muted-foreground">
            Communication not found.
          </p>
        ) : (
          <>
            <header>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  {TypeIcon && (
                    <TypeIcon size={22} className="text-muted-foreground" />
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <h1 className="font-heading text-lg">
                    {comm.subject ?? communicationTypeLabels[comm.type]}
                  </h1>
                  <div className="flex flex-wrap items-center gap-2">
                    <CommunicationTypeBadge type={comm.type} />
                    <CommunicationDirectionBadge direction={comm.direction} />
                    <CommunicationOutcomeBadge outcome={comm.outcome} />
                  </div>
                </div>
              </div>
            </header>

            <div className="mt-6 flex flex-col gap-6">
              <CommunicationDetailCard
                comm={comm}
                date={new Date(comm.created_at)}
                onEdit={() => setEditOpen(true)}
                onDelete={() => setConfirmDeleteOpen(true)}
              />
            </div>

            <EditCommunicationDialog
              comm={comm}
              open={editOpen}
              onOpenChange={setEditOpen}
            />

            <Dialog
              open={confirmDeleteOpen}
              onOpenChange={setConfirmDeleteOpen}
            >
              <DialogContent showCloseButton={false}>
                <DialogHeader>
                  <DialogTitle>Delete communication</DialogTitle>
                  <DialogDescription>
                    This will soft-delete the communication record. The action
                    cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setConfirmDeleteOpen(false)}
                    disabled={deleteMutation.isPending}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    disabled={deleteMutation.isPending}
                    onClick={async () => {
                      await deleteMutation.mutateAsync(comm.id)
                      setConfirmDeleteOpen(false)
                      navigate({ to: "/admin/communications" })
                    }}
                  >
                    {deleteMutation.isPending && (
                      <Loader2 className="size-4 animate-spin" />
                    )}
                    Delete
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        )}
      </main>
    </div>
  )
}

function CommunicationDetailCard({
  comm,
  date,
  onEdit,
  onDelete,
}: {
  comm: CommunicationEntry
  date: Date
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <section>
      <Card>
        <CardHeader>
          <CardTitle>Communication Details</CardTitle>
          <CardDescription>Recorded on {date.toLocaleString()}</CardDescription>
          <CardAction className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Pencil />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onDelete}
              className="text-destructive"
            >
              <Trash />
              Delete
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="block text-sm text-muted-foreground">Type</span>
              <CommunicationTypeBadge type={comm.type} />
            </div>
            <div>
              <span className="block text-sm text-muted-foreground">
                Direction
              </span>
              <CommunicationDirectionBadge direction={comm.direction} />
            </div>
            <div>
              <span className="block text-sm text-muted-foreground">
                Outcome
              </span>
              <CommunicationOutcomeBadge outcome={comm.outcome} />
            </div>
            {comm.subject && (
              <div className="col-span-2">
                <span className="block text-sm text-muted-foreground">
                  Subject
                </span>
                <span>{comm.subject}</span>
              </div>
            )}
            {comm.scheduled_at && (
              <div>
                <span className="block text-sm text-muted-foreground">
                  Scheduled At
                </span>
                <span>{new Date(comm.scheduled_at).toLocaleString()}</span>
              </div>
            )}
            {comm.duration_minutes && comm.duration_minutes > 0 && (
              <div>
                <span className="block text-sm text-muted-foreground">
                  Duration
                </span>
                <span>{formatDuration(comm.duration_minutes)}</span>
              </div>
            )}
            <div>
              <span className="block text-sm text-muted-foreground">
                Logged By
              </span>
              <div className="flex items-center gap-2">
                {comm.user ? (
                  <>
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs">
                        {comm.user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <span>{comm.user.name}</span>
                  </>
                ) : (
                  <span className="text-sm text-muted-foreground">—</span>
                )}
              </div>
            </div>
          </div>

          <Separator className="my-4" />

          <div>
            <span className="block text-sm text-muted-foreground">Company</span>
            <div className="mt-1 flex items-center gap-2">
              <Avatar>
                <AvatarFallback>
                  {comm.company.name
                    .split(" ")
                    .map((w) => w[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span>{comm.company.name}</span>
                <span className="text-xs text-muted-foreground">
                  {comm.company.industry}
                </span>
              </div>
            </div>
          </div>

          <Separator className="my-4" />

          <div>
            <span className="block text-sm text-muted-foreground">Contact</span>
            {comm.contact ? (
              <div className="mt-1 flex items-center gap-2">
                <ContactRound size={18} className="text-muted-foreground" />
                <div className="flex flex-col">
                  <span>{comm.contact.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {comm.contact.title}
                  </span>
                </div>
              </div>
            ) : (
              <span className="mt-1 text-sm text-muted-foreground">—</span>
            )}
          </div>

          <Separator className="my-4" />

          <div>
            <span className="block text-sm text-muted-foreground">Notes</span>
            <p className="mt-1 text-sm">{comm.notes ?? "—"}</p>
          </div>

          {comm.updated_at && comm.updated_at !== comm.created_at && (
            <div className="mt-4 text-xs text-muted-foreground">
              Last edited {new Date(comm.updated_at).toLocaleString()}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  )
}

function EditCommunicationDialog({
  comm,
  open,
  onOpenChange,
}: {
  comm: CommunicationEntry
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const updateMutation = useUpdateCommunication(comm.id)
  const [serverError, setServerError] = useState<string | null>(null)

  const form = useForm({
    defaultValues: {
      type: comm.type,
      direction: comm.direction,
      outcome: comm.outcome,
      subject: comm.subject ?? "",
      notes: comm.notes ?? "",
      duration_minutes: comm.duration_minutes,
      scheduled_at: comm.scheduled_at
        ? comm.scheduled_at.slice(0, 16)
        : null,
    } as {
      type: CommunicationType
      direction: "incoming" | "outgoing"
      outcome: CommunicationOutcome | null
      subject: string
      notes: string
      duration_minutes: number | null
      scheduled_at: string | null
    },
    onSubmit: async ({ value }) => {
      setServerError(null)
      try {
        await updateMutation.mutateAsync({
          type: value.type,
          direction: value.direction,
          outcome: value.outcome,
          subject: value.subject,
          notes: value.notes,
          duration_minutes: value.duration_minutes,
          scheduled_at: value.scheduled_at,
        })
        onOpenChange(false)
      } catch (error) {
        if (isAxiosError(error)) {
          setServerError(
            (error.response?.data?.message as string) ??
              "Could not save changes.",
          )
        } else {
          setServerError("Could not save changes.")
        }
      }
    },
  })

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setServerError(null)
        onOpenChange(next)
      }}
    >
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit communication</DialogTitle>
          <DialogDescription>
            Changes are audit-logged. Sales reps can only edit within the
            configured grace period; managers and admins can edit at any time.
          </DialogDescription>
        </DialogHeader>
        {serverError && (
          <Alert variant="destructive">
            <Info />
            <AlertTitle>Save failed</AlertTitle>
            <AlertDescription>{serverError}</AlertDescription>
          </Alert>
        )}
        <form
          onSubmit={(event) => {
            event.preventDefault()
            event.stopPropagation()
            form.handleSubmit()
          }}
        >
          <FieldGroup>
            <div className="grid grid-cols-3 gap-4">
              <form.Field name="type">
                {(field) => (
                  <Field>
                    <FieldLabel>Type</FieldLabel>
                    <Select
                      value={field.state.value}
                      onValueChange={(val) =>
                        field.handleChange(val as CommunicationType)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(
                          Object.keys(
                            communicationTypeLabels,
                          ) as CommunicationType[]
                        ).map((t) => (
                          <SelectItem key={t} value={t}>
                            {communicationTypeLabels[t]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                )}
              </form.Field>
              <form.Field name="direction">
                {(field) => (
                  <Field>
                    <FieldLabel>Direction</FieldLabel>
                    <Select
                      value={field.state.value}
                      onValueChange={(val) =>
                        field.handleChange(val as "incoming" | "outgoing")
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="incoming">Inbound</SelectItem>
                        <SelectItem value="outgoing">
                          {communicationDirectionLabels.outgoing}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                )}
              </form.Field>
              <form.Field name="outcome">
                {(field) => (
                  <Field>
                    <FieldLabel>Outcome</FieldLabel>
                    <Select
                      value={field.state.value ?? "none"}
                      onValueChange={(val) =>
                        field.handleChange(
                          val === "none" ? null : (val as CommunicationOutcome),
                        )
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No outcome</SelectItem>
                        {(
                          Object.keys(
                            communicationOutcomeLabels,
                          ) as CommunicationOutcome[]
                        ).map((o) => (
                          <SelectItem key={o} value={o}>
                            {communicationOutcomeLabels[o]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                )}
              </form.Field>
            </div>
            <form.Field name="subject">
              {(field) => (
                <Field>
                  <FieldLabel>Subject</FieldLabel>
                  <Input
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  <FieldError errors={field.state.meta.errors} />
                </Field>
              )}
            </form.Field>
            <form.Field name="notes">
              {(field) => (
                <Field>
                  <FieldLabel>Notes</FieldLabel>
                  <Textarea
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="min-h-24 resize-none"
                  />
                  <FieldError errors={field.state.meta.errors} />
                </Field>
              )}
            </form.Field>
            <div className="grid grid-cols-2 gap-4">
              <form.Field name="duration_minutes">
                {(field) => (
                  <Field>
                    <FieldLabel>Duration (minutes)</FieldLabel>
                    <Input
                      type="number"
                      min={0}
                      value={field.state.value ?? ""}
                      onChange={(e) =>
                        field.handleChange(
                          e.target.value === ""
                            ? null
                            : Number(e.target.value),
                        )
                      }
                    />
                  </Field>
                )}
              </form.Field>
              <form.Field name="scheduled_at">
                {(field) => (
                  <Field>
                    <FieldLabel>Scheduled At</FieldLabel>
                    <Input
                      type="datetime-local"
                      value={field.state.value ?? ""}
                      onChange={(e) =>
                        field.handleChange(
                          e.target.value === "" ? null : e.target.value,
                        )
                      }
                    />
                  </Field>
                )}
              </form.Field>
            </div>
          </FieldGroup>
          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={updateMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending && (
                <Loader2 className="size-4 animate-spin" />
              )}
              {updateMutation.isPending ? "Saving..." : "Save changes"}
              <MoveUpRight />
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
