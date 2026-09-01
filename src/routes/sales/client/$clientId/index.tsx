import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
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
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { createFileRoute, useRouter } from "@tanstack/react-router"
import { useForm } from "@tanstack/react-form"
import {
  ChevronLeft,
  Info,
  Loader2,
  Mail,
  Minus,
  MoveUpRight,
  Pencil,
  Phone,
  Plus,
  Star,
  Trash,
  TrendingDown,
  TrendingUp,
} from "lucide-react"
import useClientDetailsQuery from "./-useClientDetailsQuery"
import { useUpdateClientStatus } from "./-useUpdateClientStatus"
import {
  useCreateContact,
  useDeleteContact,
  useMarkAsPrimaryContact,
  type ContactFormValues,
} from "./-useContactMutations"
import { Spinner } from "@/components/ui/spinner"
import OpportunitiesSummary, {
  type OpportunitySummary,
} from "@/components/opportunities-summary"
import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import {
  CommunicationHistorySection,
  type CommunicationEntry,
} from "@/components/communication-history"
import {
  ReminderHistorySection,
  type ReminderEntry,
} from "@/components/reminders-history"
import { Link } from "@tanstack/react-router"
import { StageTransitionModal } from "@/components/stage-transition-modal"
import type { StatusHistoryEntry } from "@/components/stage-transition-modal"
import { useState } from "react"

export type ClientInfoPage = {
  id: number
  status: "active" | "inactive"
  client_since: string
  notes?: string
  created_at: string
  recent_activity?: Date
  company: {
    id: number
    logoHref?: string
    logoFallback?: string
    name: string
    industry: string
    address: string
    phone: string
    email: string
    website: string
  }
  contacts: {
    id: number
    profileHref?: string
    profileFallback?: string
    name: string
    title: string
    email: string
    phone: string
  }[]
  opportunities?: OpportunitySummary[]
  lead?: {
    id: number
    status: "new" | "qualified" | "disqualified" | "converted"
  }
  communications?: CommunicationEntry[]
  reminders?: ReminderEntry[]
  sales_representative: {
    name: string
    profileHref?: string
    profileFallback?: string
  }
  average_score: string | null
  trend: "up" | "down" | "stable" | null
  last_survey_date: string | null
  latest_survey?: {
    id: number
    status: "pending" | "completed" | "expired"
    average_score: string | null
    completed_at: string | null
    created_at: string | null
  } | null
  status_histories?: StatusHistoryEntry[]
}

export const Route = createFileRoute("/sales/client/$clientId/")({
  component: RouteComponent,
})

const clientStatusLabels: Record<"active" | "inactive", string> = {
  active: "Active",
  inactive: "Inactive",
}

const surveyStatusLabels: Record<"pending" | "completed" | "expired", string> = {
  pending: "Pending",
  completed: "Completed",
  expired: "Expired",
}

const surveyStatusVariant: Record<
  "pending" | "completed" | "expired",
  "default" | "secondary" | "outline"
> = {
  pending: "outline",
  completed: "default",
  expired: "secondary",
}

const trendLabels: Record<"up" | "down" | "stable", string> = {
  up: "Improving",
  down: "Declining",
  stable: "Stable",
}

function TrendIcon({ trend }: { trend: "up" | "down" | "stable" }) {
  if (trend === "up") return <TrendingUp className="size-4" />
  if (trend === "down") return <TrendingDown className="size-4" />
  return <Minus className="size-4" />
}

function RouteComponent() {
  const router = useRouter()
  const { clientId } = Route.useParams()
  const query = useClientDetailsQuery(clientId)
  const client = query.data!

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
        ) : (
          <>
            <header>
              <div className="flex items-center gap-3">
                <Avatar size="lg">
                  <AvatarImage src={client.company.logoHref} />
                  <AvatarFallback>{client.company.logoFallback}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col gap-1">
                  <h1 className="font-heading text-lg">
                    {client.company.name}
                  </h1>
                  <div className="flex items-center gap-1">
                    <Badge variant="secondary">{client.status}</Badge>
                    {client.company.website && (
                      <Badge variant="secondary" asChild>
                        <a href={client.company.website}>
                          <span>{client.company.website}</span>
                          <MoveUpRight />
                        </a>
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </header>
            <div className="mt-6 flex flex-col gap-6">
              <CompanyInfoCard client={client} />
              <ClientInfoCard client={client} />
              {client.status_histories &&
                client.status_histories.length > 0 && (
                  <StatusHistorySection histories={client.status_histories} />
                )}
              <Separator />
              <ContactInfoSection client={client} />
              <Separator />
              {client.opportunities && client.opportunities.length > 0 && (
                <OpportunitiesSummary opportunities={client.opportunities} basePath="/sales" />
              )}
              <Separator />
              <ClientSurveySummary client={client} />
              <Separator />
              <CommunicationHistorySection
                communications={client.communications ?? []}
                basePath="/sales"
              />
              <Separator />
              <ReminderHistorySection reminders={client.reminders ?? []} basePath="/sales" />
            </div>
          </>
        )}
      </main>
    </div>
  )
}

function CompanyInfoCard({ client }: { client: ClientInfoPage }) {
  return (
    <section>
      <Card>
        <CardHeader>
          <CardTitle>Company Information</CardTitle>
          <CardAction>
            <Button variant="outline" size="icon">
              <Pencil />
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <div className="mb-4 grid grid-cols-2 gap-4">
            <div>
              <span className="block text-sm text-muted-foreground">
                Industry
              </span>
              <span>{client.company.industry}</span>
            </div>
            <div>
              <span className="block text-sm text-muted-foreground">
                Address
              </span>
              <span>{client.company.address}</span>
            </div>
            <div>
              <span className="block text-sm text-muted-foreground">Phone</span>
              <span>{client.company.phone}</span>
            </div>
            <div>
              <span className="block text-sm text-muted-foreground">Email</span>
              <span>{client.company.email}</span>
            </div>
          </div>
          {client.notes && (
            <Alert>
              <Info />
              <AlertTitle>Note</AlertTitle>
              <AlertDescription>{client.notes}</AlertDescription>
              <AlertAction>
                <Button variant="outline" size="icon">
                  <Pencil />
                </Button>
              </AlertAction>
            </Alert>
          )}
        </CardContent>
      </Card>
    </section>
  )
}

function ClientInfoCard({ client }: { client: ClientInfoPage }) {
  const updateStatusMutation = useUpdateClientStatus(client.id)
  const [modalOpen, setModalOpen] = useState(false)
  const [targetStatus, setTargetStatus] = useState<"active" | "inactive">(
    "inactive"
  )
  const [confirmOpen, setConfirmOpen] = useState(false)

  const pendingReminders = (client.reminders ?? []).filter(
    (r) => !r.is_completed && r.related_to_type === "client" && r.related_to_id === client.id
  )

  const handleToggleClick = () => {
    const next = client.status === "active" ? "inactive" : "active"
    if (next === "inactive" && pendingReminders.length > 0) {
      setConfirmOpen(true)
      return
    }
    setTargetStatus(next)
    setModalOpen(true)
  }

  const handleConfirm = () => {
    setConfirmOpen(false)
    setTargetStatus("inactive")
    setModalOpen(true)
  }

  const handleModalSubmit = async (reason: string) => {
    await updateStatusMutation.mutateAsync({
      status: targetStatus,
      reason,
    })
  }

  const modalTitle =
    targetStatus === "inactive"
      ? "Mark Client as Inactive"
      : "Mark Client as Active"

  const modalDescription =
    targetStatus === "inactive"
      ? "Provide details about why this client is being marked as inactive."
      : "Provide details about why this client is being marked as active."

  return (
    <section>
      <Card>
        <CardHeader>
          <CardTitle>Client Information</CardTitle>
          <CardDescription>
            Client since {new Date(client.client_since).toDateString()}
          </CardDescription>
          <CardAction className="flex items-center gap-2">
            {client.lead && (
              <Button variant="link" size="sm" asChild>
                <Link
                  to="/sales/lead/$leadId"
                  params={{ leadId: client.lead.id.toString() }}
                >
                  <span>View Lead Profile</span>
                  <MoveUpRight />
                </Link>
              </Button>
            )}
            <Button
              variant={client.status === "active" ? "destructive" : "default"}
              size="sm"
              onClick={handleToggleClick}
              disabled={updateStatusMutation.isPending}
            >
              {updateStatusMutation.isPending
                ? "Updating..."
                : client.status === "active"
                  ? "Mark as Inactive"
                  : "Mark as Active"}
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div>
            <span className="block text-sm text-muted-foreground">Status</span>
            <Badge variant="secondary">{client.status}</Badge>
          </div>
          <div className="flex items-center gap-1">
            <Avatar>
              <AvatarImage src={client.sales_representative.profileHref} />
              <AvatarFallback>
                {client.sales_representative.profileFallback}
              </AvatarFallback>
            </Avatar>
            <div>
              <span className="block text-sm text-muted-foreground">
                Sales Representative
              </span>
              <span>{client.sales_representative.name}</span>
            </div>
          </div>
          <div>
            <span className="block text-sm text-muted-foreground">
              Created At
            </span>
            <span>{new Date(client.created_at).toDateString()}</span>
          </div>
        </CardContent>
      </Card>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Mark Client as Inactive?</DialogTitle>
            <DialogDescription>
              This client has {pendingReminders.length} pending reminder{pendingReminders.length === 1 ? '' : 's'}. 
              The client will be marked as inactive, but existing reminders will remain.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirm}>
              Mark as Inactive
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <StageTransitionModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title={modalTitle}
        description={modalDescription}
        isPending={updateStatusMutation.isPending}
        onSubmit={handleModalSubmit}
      />
    </section>
  )
}

function StatusHistorySection({
  histories,
}: {
  histories: StatusHistoryEntry[]
}) {
  return (
    <section>
      <h3 className="my-3 font-heading text-lg">Status History</h3>
      <div className="flex flex-col gap-3">
        {histories.map((h) => (
          <div key={h.id} className="border-l-2 border-muted pl-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-sm font-medium">
                  {h.from_status
                    ? `${clientStatusLabels[h.from_status as "active" | "inactive"]} → ${clientStatusLabels[h.to_status as "active" | "inactive"]}`
                    : clientStatusLabels[h.to_status as "active" | "inactive"]}
                </span>
                <span className="block text-xs text-muted-foreground">
                  {new Date(h.created_at).toLocaleString()}
                </span>
              </div>
              {h.user && (
                <span className="text-xs text-muted-foreground">
                  {h.user.name}
                </span>
              )}
            </div>
            {h.reason && <p className="mt-1 text-sm">{h.reason}</p>}
          </div>
        ))}
      </div>
    </section>
  )
}

function ContactInfoSection({ client }: { client: ClientInfoPage }) {
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const createContactMutation = useCreateContact(String(client.id))
  const deleteContactMutation = useDeleteContact(String(client.id))
  const markAsPrimaryMutation = useMarkAsPrimaryContact(String(client.id))

  const hasPrimaryContact = client.contacts.some((c) => c.is_primary)

  const form = useForm({
    defaultValues: {
      company_id: client.company.id ?? 0,
      first_name: "",
      last_name: "",
      title: "",
      email: "",
      phone: "",
      is_primary: false,
    } satisfies ContactFormValues,
    onSubmit: async ({ value }) => {
      await createContactMutation.mutateAsync(value)
      form.reset()
      setAddDialogOpen(false)
    },
  })

  const isSubmitting = createContactMutation.isPending

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [contactToDelete, setContactToDelete] = useState<{
    id: number
    name: string
  } | null>(null)

  const requestDeleteContact = (contact: { id: number; name: string }) => {
    setContactToDelete(contact)
    setDeleteConfirmOpen(true)
  }

  const confirmDeleteContact = async () => {
    if (!contactToDelete) return
    await deleteContactMutation.mutateAsync(contactToDelete.id)
    setContactToDelete(null)
    setDeleteConfirmOpen(false)
  }

  const handleMarkAsPrimary = async (contactId: number) => {
    await markAsPrimaryMutation.mutateAsync(contactId)
  }

  return (
    <section>
      <header className="flex items-center justify-between">
        <h2 className="font-heading text-lg">Contacts</h2>
        <Button variant="outline" onClick={() => setAddDialogOpen(true)}>
          <Plus />
          <span>Add a contact</span>
        </Button>
      </header>
      <div className="mt-4 grid grid-cols-2 gap-4">
        {client.contacts.map((contact, i) => (
          <Card key={i}>
            <CardHeader>
              <CardTitle>{contact.name}</CardTitle>
              <CardDescription>{contact.title}</CardDescription>
              <CardAction className="flex flex-wrap gap-2">
                {client.lead && (
                  <Button variant="link" size="sm" asChild>
                    <Link
                      to="/sales/lead/$leadId"
                      params={{ leadId: client.lead.id.toString() }}
                    >
                      View Lead Profile
                    </Link>
                  </Button>
                )}
                <Button variant="outline" size="icon">
                  <Pencil />
                </Button>
              </CardAction>
            </CardHeader>
            <CardContent className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Mail size={18} className="text-muted-foreground" />
                <span>{contact.email}</span>
              </div>
              <div className="flex items-center gap-1">
                <Phone size={18} className="text-muted-foreground" />
                <span>{contact.phone}</span>
              </div>
            </CardContent>

            <Separator />
            <CardFooter className="flex flex-wrap gap-2">
              {!hasPrimaryContact && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleMarkAsPrimary(contact.id)}
                  disabled={markAsPrimaryMutation.isPending}
                >
                  <Star />
                  <span>Mark as Primary</span>
                </Button>
              )}
              <Button
                variant="destructive"
                size="sm"
                onClick={() => requestDeleteContact(contact)}
                disabled={deleteContactMutation.isPending}
              >
                <Trash />
                <span>Delete this contact</span>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Contact</DialogTitle>
            <DialogDescription>
              Add a new contact for {client.company.name}.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(event) => {
              event.preventDefault()
              event.stopPropagation()
              form.handleSubmit()
            }}
          >
            <FieldGroup>
              <div className="grid grid-cols-2 gap-4">
                <form.Field name="first_name">
                  {(field) => (
                    <Field>
                      <FieldLabel htmlFor="first_name">First Name</FieldLabel>
                      <Input
                        id="first_name"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="John"
                      />
                      <FieldError errors={field.state.meta.errors} />
                    </Field>
                  )}
                </form.Field>
                <form.Field name="last_name">
                  {(field) => (
                    <Field>
                      <FieldLabel htmlFor="last_name">Last Name</FieldLabel>
                      <Input
                        id="last_name"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="Doe"
                      />
                      <FieldError errors={field.state.meta.errors} />
                    </Field>
                  )}
                </form.Field>
              </div>
              <form.Field name="title">
                {(field) => (
                  <Field>
                    <FieldLabel htmlFor="title">Job Title</FieldLabel>
                    <Input
                      id="title"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="CEO"
                    />
                    <FieldError errors={field.state.meta.errors} />
                  </Field>
                )}
              </form.Field>
              <form.Field name="email">
                {(field) => (
                  <Field>
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <Input
                      id="email"
                      type="email"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="john@example.com"
                    />
                    <FieldError errors={field.state.meta.errors} />
                  </Field>
                )}
              </form.Field>
              <form.Field name="phone">
                {(field) => (
                  <Field>
                    <FieldLabel htmlFor="phone">Phone</FieldLabel>
                    <Input
                      id="phone"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="+1 234 567 890"
                    />
                    <FieldError errors={field.state.meta.errors} />
                  </Field>
                )}
              </form.Field>
            </FieldGroup>
            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setAddDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="size-4 animate-spin" />
                )}
                {isSubmitting ? "Adding..." : "Add Contact"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Delete Contact</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {contactToDelete?.name}? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmOpen(false)}
              disabled={deleteContactMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteContact}
              disabled={deleteContactMutation.isPending}
            >
              {deleteContactMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  )
}

function ClientSurveySummary({ client }: { client: ClientInfoPage }) {
  const score = client.average_score !== null
    ? Number(client.average_score)
    : null

  return (
    <section>
      <Card>
        <CardHeader>
          <CardTitle>Client Satisfaction</CardTitle>
          <CardDescription>Survey performance overview</CardDescription>
          <CardAction>
            <Button variant="link" size="sm" asChild>
              <Link
                to="/sales/satisfaction/$clientId"
                params={{ clientId: client.id.toString() }}
              >
                <span>View All Surveys</span>
                <MoveUpRight />
              </Link>
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <span className="block text-sm text-muted-foreground">
                Average Score
              </span>
              <div className="mt-1 flex items-center gap-2">
                {score !== null ? (
                  <>
                    <span className="text-2xl font-semibold">
                      {score.toFixed(1)}
                    </span>
                    <Badge
                      variant={
                        score >= 4
                          ? "default"
                          : score >= 3
                            ? "secondary"
                            : "destructive"
                      }
                    >
                      {score >= 4
                        ? "Good"
                        : score >= 3
                          ? "Fair"
                          : "Poor"}
                    </Badge>
                  </>
                ) : (
                  <span className="text-muted-foreground">No data</span>
                )}
              </div>
            </div>
            <div>
              <span className="block text-sm text-muted-foreground">
                Trend
              </span>
              <div className="mt-1 flex items-center gap-2">
                {client.trend ? (
                  <>
                    <TrendIcon trend={client.trend} />
                    <span className="text-sm font-medium">
                      {trendLabels[client.trend]}
                    </span>
                  </>
                ) : (
                  <span className="text-muted-foreground">
                    Not enough data
                  </span>
                )}
              </div>
            </div>
            <div>
              <span className="block text-sm text-muted-foreground">
                Last Survey
              </span>
              <div className="mt-1 flex flex-col gap-1">
                {client.latest_survey ? (
                  <>
                    <Badge
                      variant={
                        surveyStatusVariant[client.latest_survey.status]
                      }
                    >
                      {surveyStatusLabels[client.latest_survey.status]}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {client.latest_survey.completed_at
                        ? new Date(
                            client.latest_survey.completed_at
                          ).toLocaleDateString()
                        : client.last_survey_date
                          ? new Date(
                              client.last_survey_date
                            ).toLocaleDateString()
                          : "—"}
                    </span>
                  </>
                ) : (
                  <span className="text-muted-foreground">
                    No surveys
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
