import { useState } from "react"
import { useForm } from "@tanstack/react-form"
import { Loader2, Info } from "lucide-react"
import { useNavigate } from "@tanstack/react-router"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
  FieldLegend,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  reminderPriorityLabels,
  recurrenceLabels,
  type ReminderPriority,
} from "@/components/reminders-history"
import useCompanies from "@/lib/queries/useCompanies"
import { useCreateReminder } from "../-useCreateReminder"

export type CreateReminderFormValues = {
  company_id: number
  related_to_type: "lead" | "client"
  related_to_id: number
  title: string
  description: string
  due_date: string
  priority: ReminderPriority
  assigned_to_name: string
  recurrence_rule: "daily" | "weekly" | "monthly" | ""
}

type SelectedRecord = {
  type: "lead" | "client"
  id: number
} | null

export function CreateReminderForm({ basePath = "/admin" }: { basePath?: string }) {
  const companiesQuery = useCompanies()
  const createMutation = useCreateReminder()
  const navigate = useNavigate()

  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(
    null
  )
  const [selectedRecord, setSelectedRecord] = useState<SelectedRecord>(null)

  const selectedCompany = selectedCompanyId
    ? (companiesQuery.data?.find((c) => c.id === selectedCompanyId) ?? null)
    : null

  const form = useForm({
    defaultValues: {
      company_id: 0,
      related_to_type: "lead" as "lead" | "client",
      related_to_id: 0,
      title: "",
      description: "",
      due_date: "",
      priority: "medium" as ReminderPriority,
      assigned_to_name: "",
      recurrence_rule: "" as "daily" | "weekly" | "monthly" | "",
    } satisfies CreateReminderFormValues,

    onSubmit: async ({ value }) => {
      if (!selectedRecord) return
      const assignedToName = selectedCompany?.sales_representative?.name ?? ""
      await createMutation.mutateAsync({
        ...value,
        related_to_type: selectedRecord.type,
        related_to_id: selectedRecord.id,
        assigned_to_name: assignedToName,
      })
      form.reset()
      setSelectedCompanyId(null)
      setSelectedRecord(null)
      return navigate({ to: `${basePath}/reminders` })
    },
  })

  const companies = companiesQuery.data ?? []
  const isSubmitting = createMutation.isPending

  const leadsForCompany = selectedCompany?.leads ?? []
  const clientForCompany = selectedCompany?.client ?? null
  const hasLeads = leadsForCompany.length > 0
  const hasClient = clientForCompany !== null
  const hasRecords = hasLeads || hasClient

  const handleCompanyChange = (companyId: number) => {
    setSelectedCompanyId(companyId)
    setSelectedRecord(null)
    form.setFieldValue("company_id", companyId)
    form.setFieldValue("related_to_id", 0)
  }

  const handleRecordChange = (value: string) => {
    const [type, idStr] = value.split(":")
    const id = Number(idStr)
    if (type === "lead" || type === "client") {
      setSelectedRecord({ type, id })
      form.setFieldValue("related_to_type", type)
      form.setFieldValue("related_to_id", id)
    }
  }

  const selectedRecordValue = selectedRecord
    ? `${selectedRecord.type}:${selectedRecord.id}`
    : ""

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        event.stopPropagation()
        form.handleSubmit()
      }}
    >
      <Card>
        <CardHeader>
          <CardTitle>
            <h1 className="font-heading text-lg">Create Follow-up Reminder</h1>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          <FieldSet>
            <FieldLegend>Related Record</FieldLegend>

            <FieldDescription>
              The lead or client this reminder is tied to.
            </FieldDescription>

            <FieldGroup>
              <form.Field name="company_id">
                {(field) => {
                  return (
                    <Field>
                      <FieldLabel htmlFor="company_id">Company</FieldLabel>

                      <Select
                        value={
                          field.state.value > 0 ? String(field.state.value) : ""
                        }
                        onValueChange={(val) =>
                          handleCompanyChange(Number(val))
                        }
                        disabled={
                          companiesQuery.isPending || companiesQuery.isError
                        }
                      >
                        <SelectTrigger id="company_id">
                          <SelectValue
                            placeholder={
                              companiesQuery.isPending
                                ? "Loading companies..."
                                : "Select company"
                            }
                          />
                        </SelectTrigger>

                        <SelectContent>
                          {companies.map((company) => (
                            <SelectItem
                              key={company.id}
                              value={String(company.id)}
                            >
                              {company.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {companiesQuery.isError && (
                        <FieldError>Unable to load companies.</FieldError>
                      )}
                    </Field>
                  )
                }}
              </form.Field>

              {selectedCompany && selectedCompany.is_client && (
                <Alert>
                  <AlertTitle>Note</AlertTitle>
                  <AlertDescription>
                    This company is already a client. The lead below represents
                    a past state — consider relating this reminder to the active
                    client instead.
                  </AlertDescription>
                </Alert>
              )}

              {selectedCompany && (
                <Field>
                  <FieldLabel htmlFor="related_record">
                    Related Record
                  </FieldLabel>

                  <Select
                    value={selectedRecordValue}
                    onValueChange={handleRecordChange}
                    disabled={!hasRecords}
                  >
                    <SelectTrigger id="related_record">
                      <SelectValue
                        placeholder={
                          !hasRecords
                            ? "No leads or clients for this company"
                            : "Select a record"
                        }
                      />
                    </SelectTrigger>

                    <SelectContent>
                      {hasLeads && (
                        <SelectGroup>
                          <SelectLabel>Leads</SelectLabel>
                          {leadsForCompany.map((lead) => (
                            <SelectItem
                              key={`lead:${lead.id}`}
                              value={`lead:${lead.id}`}
                            >
                              {lead.company_name} ({lead.status})
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      )}
                      {hasClient && (
                        <SelectGroup>
                          <SelectLabel>Clients</SelectLabel>
                          <SelectItem
                            key={`client:${clientForCompany.id}`}
                            value={`client:${clientForCompany.id}`}
                          >
                            {clientForCompany.company_name} (
                            {clientForCompany.status})
                          </SelectItem>
                        </SelectGroup>
                      )}
                    </SelectContent>
                  </Select>

                  <FieldDescription>
                    Select the lead or client this reminder is for.
                  </FieldDescription>
                </Field>
              )}
            </FieldGroup>
          </FieldSet>

          <FieldSet>
            <FieldLegend>Reminder Details</FieldLegend>

            <FieldDescription>
              Title, due date, and priority for this reminder.
            </FieldDescription>

            <FieldGroup>
              <form.Field name="title">
                {(field) => {
                  return (
                    <Field>
                      <FieldLabel htmlFor="title">Title</FieldLabel>

                      <Input
                        autoComplete="off"
                        id="title"
                        name="title"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="e.g. Follow up on proposal"
                      />
                    </Field>
                  )
                }}
              </form.Field>

              <form.Field name="description">
                {(field) => {
                  return (
                    <Field>
                      <FieldLabel htmlFor="description">Description</FieldLabel>

                      <Textarea
                        autoComplete="off"
                        id="description"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="Detailed notes about this reminder..."
                        className="min-h-32 resize-none"
                      />
                    </Field>
                  )
                }}
              </form.Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <form.Field name="due_date">
                  {(field) => {
                    return (
                      <Field>
                        <FieldLabel htmlFor="due_date">Due Date</FieldLabel>

                        <Input
                          autoComplete="off"
                          id="due_date"
                          name="due_date"
                          type="date"
                          value={field.state.value ?? ""}
                          onBlur={field.handleBlur}
                          onChange={(e) =>
                            field.handleChange(
                              e.target.value === "" ? "" : e.target.value
                            )
                          }
                        />
                      </Field>
                    )
                  }}
                </form.Field>

                <form.Field name="priority">
                  {(field) => {
                    return (
                      <Field>
                        <FieldLabel htmlFor="priority">Priority</FieldLabel>

                        <Select
                          value={field.state.value}
                          onValueChange={(val) =>
                            field.handleChange(val as ReminderPriority)
                          }
                        >
                          <SelectTrigger id="priority">
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>

                          <SelectContent>
                            {(
                              Object.keys(
                                reminderPriorityLabels
                              ) as ReminderPriority[]
                            ).map((priority) => (
                              <SelectItem key={priority} value={priority}>
                                {reminderPriorityLabels[priority]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </Field>
                    )
                  }}
                </form.Field>
              </div>

              <form.Field name="recurrence_rule">
                {(field) => {
                  return (
                    <Field>
                      <FieldLabel htmlFor="recurrence_rule">
                        Recurrence (optional)
                      </FieldLabel>

                      <Select
                        value={field.state.value}
                        onValueChange={(val) =>
                          field.handleChange(
                            val as "daily" | "weekly" | "monthly" | ""
                          )
                        }
                      >
                        <SelectTrigger id="recurrence_rule">
                          <SelectValue placeholder="No recurrence" />
                        </SelectTrigger>

                        <SelectContent>
                          <SelectItem value="">No recurrence</SelectItem>
                          {(
                            ["daily", "weekly", "monthly"] as const
                          ).map((rule) => (
                            <SelectItem key={rule} value={rule}>
                              {recurrenceLabels[rule]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <FieldDescription>
                        When set, completing this reminder will automatically
                        create the next occurrence.
                      </FieldDescription>
                    </Field>
                  )
                }}
              </form.Field>
            </FieldGroup>
          </FieldSet>

          <FieldSet>
            <FieldLegend>Assignment</FieldLegend>

            {selectedCompany?.sales_representative ? (
              <Alert>
                <Info />
                <AlertTitle>Auto-assigned Sales Representative</AlertTitle>
                <AlertDescription>
                  This reminder will be assigned to{" "}
                  <strong>{selectedCompany.sales_representative.name}</strong>,
                  the sales representative for {selectedCompany.name}.
                </AlertDescription>
              </Alert>
            ) : (
              <Alert>
                <Info />
                <AlertTitle>Assignment</AlertTitle>
                <AlertDescription>
                  Select a company to auto-assign the sales representative.
                </AlertDescription>
              </Alert>
            )}
          </FieldSet>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="gap-2" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="size-4 animate-spin" />}
            {isSubmitting ? "Creating..." : "Create Reminder"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
