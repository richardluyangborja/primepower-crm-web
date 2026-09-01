import { useState } from "react"
import { useForm } from "@tanstack/react-form"
import { Loader2 } from "lucide-react"
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
  communicationTypeLabels,
  type CommunicationType,
  formatDuration,
} from "@/components/communication-history"
import useCompanies from "@/lib/queries/useCompanies"
import { useCreateCommunication } from "../-useCreateCommunication"

export type CreateCommunicationFormValues = {
  type: CommunicationType
  direction: "incoming" | "outgoing"
  company_id: number
  contact_id: number | null
  subject: string
  notes: string
  duration_minutes: number | null
  scheduled_at: string | null
}

export function CreateCommunicationForm() {
  const companiesQuery = useCompanies()
  const createMutation = useCreateCommunication()
  const navigate = useNavigate()

  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(
    null
  )

  const form = useForm({
    defaultValues: {
      type: "email" as CommunicationType,
      direction: "outgoing" as "incoming" | "outgoing",
      company_id: 0,
      contact_id: null,
      subject: "",
      notes: "",
      duration_minutes: null,
      scheduled_at: null,
    } satisfies CreateCommunicationFormValues,

    onSubmit: async ({ value }) => {
      await createMutation.mutateAsync(value)
      form.reset()
      setSelectedCompanyId(null)
      return navigate({ to: "/admin/communications" })
    },
  })

  const companies = companiesQuery.data ?? []

  const contactsForCompany =
    (selectedCompanyId
      ? companies.find((c) => c.id === selectedCompanyId)?.contacts
      : []) ?? []

  const isSubmitting = createMutation.isPending

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
            <h1 className="font-heading text-lg">Log a Communication</h1>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          <FieldSet>
            <FieldLegend>Communication Details</FieldLegend>

            <FieldDescription>
              Select the type and direction of this communication.
            </FieldDescription>

            <FieldGroup>
              <form.Field name="type">
                {(field) => {
                  return (
                    <Field>
                      <FieldLabel htmlFor="type">Communication Type</FieldLabel>

                      <Select
                        value={field.state.value}
                        onValueChange={(val) =>
                          field.handleChange(val as CommunicationType)
                        }
                      >
                        <SelectTrigger id="type">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>

                        <SelectContent>
                          {(
                            Object.keys(
                              communicationTypeLabels
                            ) as CommunicationType[]
                          ).map((type) => (
                            <SelectItem key={type} value={type}>
                              {communicationTypeLabels[type]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                  )
                }}
              </form.Field>

              <form.Field name="direction">
                {(field) => {
                  return (
                    <Field>
                      <FieldLabel htmlFor="direction">Direction</FieldLabel>

                      <Select
                        value={field.state.value}
                        onValueChange={(val) =>
                          field.handleChange(val as "incoming" | "outgoing")
                        }
                      >
                        <SelectTrigger id="direction">
                          <SelectValue placeholder="Select direction" />
                        </SelectTrigger>

                        <SelectContent>
                          <SelectItem value="incoming">Inbound</SelectItem>
                          <SelectItem value="outgoing">Outbound</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>
                  )
                }}
              </form.Field>

              <Alert>
                <AlertTitle>Direction</AlertTitle>
                <AlertDescription>
                  <strong>Inbound</strong> — the communication was received from
                  the contact or company (e.g. an incoming email or call).
                  <br />
                  <strong>Outbound</strong> — the communication was initiated by
                  your team (e.g. an outgoing email, call, or meeting).
                </AlertDescription>
              </Alert>
            </FieldGroup>
          </FieldSet>

          <FieldSet>
            <FieldLegend>Parties Involved</FieldLegend>

            <FieldDescription>
              The company and contact this communication relates to.
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
                        onValueChange={(val) => {
                          const id = Number(val)
                          setSelectedCompanyId(id)
                          field.handleChange(id)
                        }}
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

              <form.Field name="contact_id">
                {(field) => {
                  return (
                    <Field>
                      <FieldLabel htmlFor="contact_id">Contact</FieldLabel>

                      <Select
                        value={
                          field.state.value ? String(field.state.value) : ""
                        }
                        onValueChange={(val) => field.handleChange(Number(val))}
                        disabled={contactsForCompany.length === 0}
                      >
                        <SelectTrigger id="contact_id">
                          <SelectValue
                            placeholder={
                              contactsForCompany.length === 0
                                ? "No contacts available"
                                : "Select contact"
                            }
                          />
                        </SelectTrigger>

                        <SelectContent>
                          {contactsForCompany.map((contact) => (
                            <SelectItem
                              key={contact.id}
                              value={String(contact.id)}
                            >
                              {contact.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <FieldDescription>
                        Contact will be associated with the selected company.
                      </FieldDescription>
                    </Field>
                  )
                }}
              </form.Field>
            </FieldGroup>
          </FieldSet>

          <FieldSet>
            <FieldLegend>Content</FieldLegend>

            <FieldDescription>
              Subject and notes for the communication.
            </FieldDescription>

            <FieldGroup>
              <form.Field name="subject">
                {(field) => {
                  return (
                    <Field>
                      <FieldLabel htmlFor="subject">Subject</FieldLabel>

                      <Input
                        autoComplete="off"
                        id="subject"
                        name="subject"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="Brief subject or summary"
                      />

                      <FieldDescription>
                        Leave blank if not applicable (e.g. for phone calls).
                      </FieldDescription>
                    </Field>
                  )
                }}
              </form.Field>

              <form.Field name="notes">
                {(field) => {
                  return (
                    <Field>
                      <FieldLabel htmlFor="notes">Notes</FieldLabel>

                      <Textarea
                        autoComplete="off"
                        id="notes"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="Detailed notes about the communication..."
                        className="min-h-32 resize-none"
                      />
                    </Field>
                  )
                }}
              </form.Field>
            </FieldGroup>
          </FieldSet>

          <FieldSet>
            <FieldLegend>Additional Details</FieldLegend>

            <FieldDescription>
              Duration and scheduling (optional).
            </FieldDescription>

            <FieldGroup>
              <div className="grid gap-4 sm:grid-cols-2">
                <form.Field name="duration_minutes">
                  {(field) => {
                    return (
                      <Field>
                        <FieldLabel htmlFor="duration_minutes">
                          Duration (minutes)
                        </FieldLabel>

                        <Input
                          autoComplete="off"
                          id="duration_minutes"
                          name="duration_minutes"
                          type="number"
                          min={0}
                          value={field.state.value ?? 0}
                          onBlur={field.handleBlur}
                          onChange={(e) =>
                            field.handleChange(
                              e.target.value === ""
                                ? null
                                : Number(e.target.value)
                            )
                          }
                          placeholder="e.g. 30"
                        />

                        {field.state.value && field.state.value > 0 && (
                          <FieldDescription>
                            {formatDuration(field.state.value)}
                          </FieldDescription>
                        )}
                      </Field>
                    )
                  }}
                </form.Field>

                <form.Field name="scheduled_at">
                  {(field) => {
                    return (
                      <Field>
                        <FieldLabel htmlFor="scheduled_at">
                          Scheduled At
                        </FieldLabel>

                        <Input
                          autoComplete="off"
                          id="scheduled_at"
                          name="scheduled_at"
                          type="datetime-local"
                          value={field.state.value ?? ""}
                          onBlur={field.handleBlur}
                          onChange={(e) =>
                            field.handleChange(
                              e.target.value === "" ? null : e.target.value
                            )
                          }
                        />

                        <FieldDescription>
                          For scheduled communications (e.g. meetings, calls).
                        </FieldDescription>
                      </Field>
                    )
                  }}
                </form.Field>
              </div>
            </FieldGroup>
          </FieldSet>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="gap-2" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="size-4 animate-spin" />}
            {isSubmitting ? "Logging..." : "Log Communication"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
