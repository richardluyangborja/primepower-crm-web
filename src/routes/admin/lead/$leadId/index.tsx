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
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router"
import { useForm } from "@tanstack/react-form"
import {
  AlertTriangle,
  Archive,
  ChevronLeft,
  Info,
  Loader2,
  Mail,
  MoveUpRight,
  Pencil,
  Phone,
  Plus,
  Star,
  Trash,
  UserCog,
} from "lucide-react"
import useLeadDetailsQuery from "./-useLeadDetailsQuery"
import { useUpdateLeadStatus } from "./-useUpdateLeadStatus"
import {
  useCreateContact,
  useDeleteContact,
  useMarkAsPrimaryContact,
  type ContactFormValues,
} from "./-useContactMutations"
import { Spinner } from "@/components/ui/spinner"
import OpportunitiesSummary, {
  type OpportunityStage,
  type OpportunitySummary,
} from "@/components/opportunities-summary"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { StageTransitionModal } from "@/components/stage-transition-modal"
import type { StatusHistoryEntry } from "@/components/stage-transition-modal"
import { LeadEditDialog } from "@/components/lead-edit-dialog"
import { CompanyEditDialog } from "@/components/company-edit-dialog"
import { ContactEditDialog } from "@/components/contact-edit-dialog"
import { LeadDangerZone } from "@/components/lead-danger-zone"
import { type ReminderEntry } from "@/components/reminders-history"
import {
  CommunicationHistorySection,
  type CommunicationEntry,
} from "@/components/communication-history"
import { ReminderHistorySection } from "@/components/reminders-history"
import { useState } from "react"
import { ReassignDialog } from "@/components/reassign-dialog"
import { useCanManage } from "@/lib/queries/useCanManage"
import { useCanWrite } from "@/lib/queries/useCanWrite"

export type LeadInfoPage = {
  id: string
  status: "new" | "qualified" | "converted" | "disqualified"
  client_id?: string | null
  source: string
  notes?: string
  sales_representative: {
    id: string
    name: string
    profileHref?: string
    profileFallback?: string
  }
  created_at: string
  recent_activity?: Date
  company: {
    id: string
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
    id: string
    profileHref?: string
    profileFallback?: string
    first_name: string
    last_name: string
    name: string
    title: string
    email: string
    phone: string
    is_primary: boolean
  }[]
  opportunities?: OpportunitySummary[]
  status_histories?: StatusHistoryEntry[]
  communications?: CommunicationEntry[]
  reminders?: ReminderEntry[]
}

export const Route = createFileRoute("/admin/lead/$leadId/")({
  component: RouteComponent,
})

export type LeadStatus = "new" | "qualified" | "disqualified" | "converted"

export const leadStatusLabels: Record<LeadStatus, string> = {
  new: "New",
  qualified: "Qualified",
  disqualified: "Disqualified",
  converted: "Converted",
}

export const leadStatusVariant: Record<
  LeadStatus,
  "default" | "secondary" | "destructive"
> = {
  new: "secondary",
  qualified: "default",
  disqualified: "destructive",
  converted: "default",
}

export const leadStatusTransitions: Record<
  LeadStatus,
  { label: string; value: string }[]
> = {
  new: [
    { label: "Qualify Lead", value: "qualified" },
    { label: "Convert to Client", value: "converted" },
    { label: "Disqualify Lead", value: "disqualified" },
  ],
  qualified: [
    { label: "Convert to Client", value: "converted" },
    { label: "Disqualify Lead", value: "disqualified" },
  ],
  disqualified: [{ label: "Re-qualify Lead", value: "qualified" }],
  converted: [],
}

const qualificationStages: OpportunityStage[] = [
  "proposal",
  "negotiation",
  "contract_processing",
]

function shouldShowQualificationAlert(lead: LeadInfoPage): boolean {
  if (lead.status !== "new") return false
  if (!lead.opportunities) return false
  return lead.opportunities.some((opp) =>
    qualificationStages.includes(opp.stage)
  )
}

export function LeadDetailContent({
  leadId,
  basePath = "/admin",
}: {
  leadId: string
  basePath?: string
}) {
  const navigate = useNavigate()
  const query = useLeadDetailsQuery(leadId)
  const lead = query.data!
  const canWrite = useCanWrite()

  return (
    <div className="px-4 pb-8">
      <header className="py-4">
        <Button
          variant="link"
          onClick={() => navigate({ to: "/admin/lead-and-client/leads" })}
        >
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
                  <AvatarImage src={lead.company.logoHref} />
                  <AvatarFallback>{lead.company.logoFallback}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col gap-1">
                  <h1 className="font-heading text-lg">{lead.company.name}</h1>
                  <div className="flex items-center gap-1">
                    <Badge
                      variant={leadStatusVariant[lead.status as LeadStatus]}
                    >
                      {leadStatusLabels[lead.status as LeadStatus]}
                    </Badge>
                    {lead.company.website && (
                      <Badge variant="secondary" asChild>
                        <a href={lead.company.website}>
                          <span>{lead.company.website}</span>
                          <MoveUpRight />
                        </a>
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </header>
            <div className="mt-6 flex flex-col gap-6">
              {lead.status === "converted" && (
                <Alert>
                  <Archive />
                  <AlertTitle>Converted Lead</AlertTitle>
                  <AlertDescription>
                    This lead was converted to a client and is kept for history
                    only.{" "}
                    {lead.client_id ? (
                      <Link
                        to={`${basePath}/client/$clientId` as any}
                        params={{ clientId: String(lead.client_id) } as any}
                        className="font-medium underline underline-offset-4"
                      >
                        View the client
                      </Link>
                    ) : null}
                  </AlertDescription>
                </Alert>
              )}
              <CompanyInfoCard
                lead={lead}
                canWrite={canWrite}
                detailQueryKey={["lead_details", leadId]}
              />
              <LeadInfoCard lead={lead} />
              {lead.status_histories && lead.status_histories.length > 0 && (
                <StatusHistorySection histories={lead.status_histories} />
              )}
              <Separator />
              <ContactInfoSection lead={lead} canWrite={canWrite} />
              <Separator />
              {lead.opportunities && lead.opportunities.length > 0 && (
                <OpportunitiesSummary
                  opportunities={lead.opportunities}
                  basePath={basePath}
                />
              )}
              <Separator />
              <CommunicationHistorySection
                communications={lead.communications ?? []}
                basePath={basePath}
              />
              <Separator />
              {lead.status === "converted" &&
                lead.reminders?.some((r) => r.status === "pending") && (
                  <Alert variant="destructive">
                    <AlertTriangle />
                    <AlertTitle>Pending Reminders on Converted Lead</AlertTitle>
                    <AlertDescription>
                      This lead has been converted to a client, but still has
                      pending reminders. These reminders should be marked as
                      incomplete.
                    </AlertDescription>
                  </Alert>
                )}
              <ReminderHistorySection
                reminders={lead.reminders ?? []}
                basePath={basePath}
              />
              {canWrite && (
                <LeadDangerZone
                  lead={lead}
                  detailQueryKey={["lead_details", leadId]}
                  listPath={`${basePath}/lead-and-client/leads`}
                />
              )}
            </div>{" "}
          </>
        )}
      </main>
    </div>
  )
}

function RouteComponent() {
  const { leadId } = Route.useParams()
  return <LeadDetailContent leadId={leadId} />
}

function CompanyInfoCard({
  lead,
  canWrite,
  detailQueryKey,
}: {
  lead: LeadInfoPage
  canWrite: boolean
  detailQueryKey: string[]
}) {
  const [editOpen, setEditOpen] = useState(false)

  return (
    <section>
      <Card>
        <CardHeader>
          <CardTitle>Company Information</CardTitle>
          {canWrite && (
            <CardAction>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setEditOpen(true)}
              >
                <Pencil />
              </Button>
            </CardAction>
          )}
        </CardHeader>
        <CardContent>
          <div className="mb-4 grid grid-cols-2 gap-4">
            <div>
              <span className="block text-sm text-muted-foreground">
                Industry
              </span>
              <span>{lead.company.industry}</span>
            </div>
            <div>
              <span className="block text-sm text-muted-foreground">
                Address
              </span>
              <span>{lead.company.address}</span>
            </div>
            <div>
              <span className="block text-sm text-muted-foreground">Phone</span>
              <span>{lead.company.phone}</span>
            </div>
            <div>
              <span className="block text-sm text-muted-foreground">Email</span>
              <span>{lead.company.email}</span>
            </div>
          </div>
          {lead.notes && (
            <Alert>
              <Info />
              <AlertTitle>Note</AlertTitle>
              <AlertDescription>{lead.notes}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <CompanyEditDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        company={{
          id: lead.company.id,
          industry: lead.company.industry,
          address: lead.company.address,
          phone: lead.company.phone,
          email: lead.company.email,
          website: lead.company.website,
        }}
        notes={lead.notes ?? ""}
        notesEndpoint={`/api/leads/${lead.id}`}
        detailQueryKey={detailQueryKey}
      />
    </section>
  )
}

function LeadInfoCard({ lead }: { lead: LeadInfoPage }) {
  const status = lead.status as LeadStatus
  const statusMutation = useUpdateLeadStatus(lead.id)
  const transitions = leadStatusTransitions[status] ?? []
  const showQualificationAlert = shouldShowQualificationAlert(lead)
  const canWrite = useCanWrite()
  const canManage = useCanManage()
  const [reassignOpen, setReassignOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)

  const [modalOpen, setModalOpen] = useState(false)
  const [activeTransition, setActiveTransition] = useState<{
    label: string
    value: string
  } | null>(null)

  const handleTransitionClick = (transition: {
    label: string
    value: string
  }) => {
    setActiveTransition(transition)
    setModalOpen(true)
  }

  const handleModalSubmit = async (reason: string) => {
    if (!activeTransition) return
    await statusMutation.mutateAsync({
      to_status: activeTransition.value,
      reason,
    })
  }

  const modalTitle =
    activeTransition?.value === "disqualified"
      ? "Disqualify Lead"
      : activeTransition?.value === "converted"
        ? "Convert Lead to Client"
        : status === "disqualified"
          ? "Re-qualify Lead"
          : "Qualify Lead"

  const modalDescription =
    activeTransition?.value === "disqualified"
      ? "Provide details about why this lead was disqualified."
      : activeTransition?.value === "converted"
        ? "Provide details about this conversion. Pending follow-up reminders will be marked as incomplete."
        : status === "disqualified"
          ? "Provide details about why this lead is being re-qualified."
          : "Provide details about why this lead is being qualified."

  return (
    <section>
      <Card>
        <CardHeader>
          <CardTitle>Lead Information</CardTitle>
          <CardDescription>
            Created at {new Date(lead.created_at).toDateString()}
          </CardDescription>
          <CardAction className="flex flex-wrap gap-2">
            {canManage && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setReassignOpen(true)}
              >
                <UserCog />
                Reassign
              </Button>
            )}
            {canWrite &&
              transitions.map((t) => (
                <Button
                  key={t.value}
                  size="sm"
                  variant={
                    t.value === "disqualified" ? "destructive" : "default"
                  }
                  onClick={() => handleTransitionClick(t)}
                  disabled={statusMutation.isPending}
                >
                  {t.label}
                </Button>
              ))}
            {canWrite && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setEditOpen(true)}
              >
                <Pencil />
                Edit
              </Button>
            )}
          </CardAction>
        </CardHeader>
        <CardContent>
          {showQualificationAlert && (
            <Alert className="mb-4">
              <Info />
              <AlertTitle>Lead Status Update Recommended</AlertTitle>
              <AlertDescription>
                This lead still has a <strong>New</strong> status, but at least
                one opportunity has reached the Proposal stage or higher.
                Consider qualifying this lead to reflect the active engagement.
              </AlertDescription>
            </Alert>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="block text-sm text-muted-foreground">
                Status
              </span>
              <Badge variant={leadStatusVariant[status]}>
                {leadStatusLabels[status]}
              </Badge>
            </div>
            <div>
              <span className="block text-sm text-muted-foreground">
                Source
              </span>
              <span>{lead.source}</span>
            </div>
            <div className="flex items-center gap-1">
              <Avatar>
                <AvatarImage src={lead.sales_representative.profileHref} />
                <AvatarFallback>
                  {lead.sales_representative.profileFallback}
                </AvatarFallback>
              </Avatar>
              <div>
                <span className="block text-sm text-muted-foreground">
                  Sales Representative
                </span>
                <span>{lead.sales_representative.name}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <StageTransitionModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title={modalTitle}
        description={modalDescription}
        isPending={statusMutation.isPending}
        onSubmit={handleModalSubmit}
      />

      <ReassignDialog
        open={reassignOpen}
        onOpenChange={setReassignOpen}
        endpoint={`/api/leads/${lead.id}/reassign`}
        currentOwnerId={(lead.sales_representative as { id?: string }).id ?? ""}
        currentOwnerName={lead.sales_representative.name}
        subjectName={`lead for ${lead.company.name}`}
        detailQueryKey={["lead_details", String(lead.id)]}
      />

      <LeadEditDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        lead={{
          id: lead.id,
          source: lead.source,
          notes: lead.notes,
          sales_representative: {
            id: lead.sales_representative.id,
            name: lead.sales_representative.name,
          },
        }}
        detailQueryKey={["lead_details", String(lead.id)]}
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
                    ? `${leadStatusLabels[h.from_status as LeadStatus]} → ${leadStatusLabels[h.to_status as LeadStatus]}`
                    : leadStatusLabels[h.to_status as LeadStatus]}
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

function ContactInfoSection({
  lead,
  canWrite,
}: {
  lead: LeadInfoPage
  canWrite: boolean
}) {
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const createContactMutation = useCreateContact(String(lead.id))
  const deleteContactMutation = useDeleteContact(String(lead.id))
  const markAsPrimaryMutation = useMarkAsPrimaryContact(String(lead.id))
  const [editDialogContact, setEditDialogContact] = useState<
    LeadInfoPage["contacts"][number] | null
  >(null)

  const hasPrimaryContact = lead.contacts.some((c) => c.is_primary)

  const form = useForm({
    defaultValues: {
      company_id: lead.company.id ?? "",
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
    id: string
    name: string
  } | null>(null)

  const requestDeleteContact = (contact: { id: string; name: string }) => {
    setContactToDelete(contact)
    setDeleteConfirmOpen(true)
  }

  const confirmDeleteContact = async () => {
    if (!contactToDelete) return
    await deleteContactMutation.mutateAsync(contactToDelete.id)
    setContactToDelete(null)
    setDeleteConfirmOpen(false)
  }

  const handleMarkAsPrimary = async (contactId: string) => {
    await markAsPrimaryMutation.mutateAsync(contactId)
  }

  return (
    <section>
      <header className="flex items-center justify-between">
        <h2 className="font-heading text-lg">Contacts</h2>
        {canWrite && (
          <Button variant="outline" onClick={() => setAddDialogOpen(true)}>
            <Plus />
            <span>Add a contact</span>
          </Button>
        )}
      </header>
      <div className="mt-4 grid grid-cols-2 gap-4">
        {lead.contacts.map((contact, i) => (
          <Card key={i}>
            <CardHeader>
              <CardTitle>{contact.name}</CardTitle>
              <CardDescription>{contact.title}</CardDescription>
              <CardAction>
                {canWrite && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setEditDialogContact(contact)}
                  >
                    <Pencil />
                  </Button>
                )}
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
              {canWrite && !hasPrimaryContact && (
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
              {canWrite && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => requestDeleteContact(contact)}
                  disabled={deleteContactMutation.isPending}
                >
                  <Trash />
                  <span>Delete this contact</span>
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>

      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Contact</DialogTitle>
            <DialogDescription>
              Add a new contact for {lead.company.name}.
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
                {isSubmitting && <Loader2 className="size-4 animate-spin" />}
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

      {editDialogContact && (
        <ContactEditDialog
          open={editDialogContact !== null}
          onOpenChange={(open) => {
            if (!open) setEditDialogContact(null)
          }}
          contact={{
            id: editDialogContact.id,
            first_name: editDialogContact.first_name,
            last_name: editDialogContact.last_name,
            title: editDialogContact.title,
            email: editDialogContact.email,
            phone: editDialogContact.phone,
          }}
          detailQueryKey={["lead_details", String(lead.id)]}
        />
      )}
    </section>
  )
}
