import { useForm } from "@tanstack/react-form"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Field,
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
import { useCreateOpportunity, useCompanies, useLeads } from "./-hooks"
import {
  createOpportunitySchema,
  type CreateOpportunityFormValues,
} from "./-types"
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useNavigate } from "@tanstack/react-router"

export function CreateOpportunityForm() {
  const companiesQuery = useCompanies()
  const leadsQuery = useLeads()
  const createOpportunityMutation = useCreateOpportunity()
  const navigate = useNavigate()
  const [selectedCompanyId, setSelectedCompanyId] = useState(0)

  const form = useForm({
    defaultValues: {
      company_id: 0,
      lead_id: null,
      title: "",
      description: "",
      manpower_requirement: null,
      estimated_contract_value: null,
      expected_close_date: null,
    } satisfies CreateOpportunityFormValues,

    validators: {
      onSubmit: createOpportunitySchema,
    },

    onSubmit: async ({ value }) => {
      await createOpportunityMutation.mutateAsync(value)
      form.reset()
      setSelectedCompanyId(0)
      return navigate({ to: "/admin/opportunities" })
    },
  })

  const isSubmitting = createOpportunityMutation.isPending
  const availableLeads = leadsQuery.data?.filter(
    (lead) => lead.company.id === selectedCompanyId
  )

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
            <h1 className="font-heading text-lg">Create a new opportunity</h1>
          </CardTitle>
          <CardAction>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                form.reset()
                setSelectedCompanyId(0)
              }}
              disabled={isSubmitting}
            >
              Reset Form
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent className="space-y-8">
          <FieldSet>
            <FieldLegend>Opportunity Information</FieldLegend>

            <FieldGroup>
              <form.Field
                name="title"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid

                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>
                        Opportunity Title
                      </FieldLabel>

                      <Input
                        autoComplete="off"
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        placeholder="Warehouse Staffing Contract"
                      />

                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  )
                }}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <form.Field
                  name="company_id"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid

                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>Company</FieldLabel>

                        <Select
                          value={
                            field.state.value > 0
                              ? String(field.state.value)
                              : ""
                          }
                          onValueChange={(value) => {
                            setSelectedCompanyId(Number(value))
                            field.handleChange(Number(value))
                          }}
                          disabled={
                            companiesQuery.isLoading || companiesQuery.isError
                          }
                        >
                          <SelectTrigger
                            id={field.name}
                            aria-invalid={isInvalid}
                          >
                            <SelectValue
                              placeholder={
                                companiesQuery.isLoading
                                  ? "Loading companies..."
                                  : "Select company"
                              }
                            />
                          </SelectTrigger>

                          <SelectContent>
                            {companiesQuery.data?.map((company) => (
                              <SelectItem
                                key={company.id}
                                value={String(company.id)}
                              >
                                {company.name}
                                {company.is_client ? "(client)" : ""}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        {companiesQuery.isError && (
                          <FieldError>Unable to load companies.</FieldError>
                        )}

                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    )
                  }}
                />

                <form.Field
                  name="lead_id"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid

                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>
                          Related Lead (Optional)
                        </FieldLabel>

                        <Select
                          value={
                            field.state.value ? String(field.state.value) : ""
                          }
                          onValueChange={(value) =>
                            field.handleChange(value ? Number(value) : null)
                          }
                          disabled={leadsQuery.isLoading || leadsQuery.isError}
                        >
                          <SelectTrigger
                            id={field.name}
                            aria-invalid={isInvalid}
                          >
                            <SelectValue
                              placeholder={
                                leadsQuery.isLoading
                                  ? "Loading leads..."
                                  : "None"
                              }
                            />
                          </SelectTrigger>

                          <SelectContent>
                            <SelectItem value="">None</SelectItem>
                            {availableLeads?.map((lead) => (
                              <SelectItem key={lead.id} value={String(lead.id)}>
                                {lead.company.name} — #{lead.id}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        {leadsQuery.isError && (
                          <FieldError>Unable to load leads.</FieldError>
                        )}

                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    )
                  }}
                />
              </div>
              <Alert>
                <AlertTitle>
                  Creating an opportunity for an existing client?
                </AlertTitle>
                <AlertDescription>
                  If the company already has a client record, leave the Related
                  Lead field empty. New opportunities for existing clients
                  should not be linked to a lead.
                </AlertDescription>
              </Alert>

              <form.Field
                name="description"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid

                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Description</FieldLabel>

                      <Textarea
                        autoComplete="off"
                        id={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        placeholder="Potential deployment of 50 warehouse personnel..."
                        className="min-h-32 resize-none"
                      />

                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  )
                }}
              />

              <div className="grid gap-4 sm:grid-cols-3">
                <form.Field
                  name="estimated_contract_value"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid

                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>
                          Estimated Contract Value
                        </FieldLabel>

                        <Input
                          autoComplete="off"
                          id={field.name}
                          name={field.name}
                          type="number"
                          value={field.state.value ?? ""}
                          onBlur={field.handleBlur}
                          onChange={(e) =>
                            field.handleChange(
                              e.target.value ? Number(e.target.value) : null
                            )
                          }
                          aria-invalid={isInvalid}
                          placeholder="2500000"
                        />

                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    )
                  }}
                />

                <form.Field
                  name="expected_close_date"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid

                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>
                          Expected Close Date
                        </FieldLabel>

                        <Input
                          autoComplete="off"
                          id={field.name}
                          name={field.name}
                          type="date"
                          value={field.state.value ?? ""}
                          onBlur={field.handleBlur}
                          onChange={(e) =>
                            field.handleChange(e.target.value || null)
                          }
                          aria-invalid={isInvalid}
                        />

                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    )
                  }}
                />

                <form.Field
                  name="manpower_requirement"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid

                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>
                          Manpower Requirement
                        </FieldLabel>

                        <Input
                          autoComplete="off"
                          id={field.name}
                          name={field.name}
                          type="number"
                          value={field.state.value ?? ""}
                          onBlur={field.handleBlur}
                          onChange={(e) =>
                            field.handleChange(
                              e.target.value ? Number(e.target.value) : null
                            )
                          }
                          aria-invalid={isInvalid}
                          placeholder="50"
                        />

                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    )
                  }}
                />
              </div>
            </FieldGroup>
          </FieldSet>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
            {isSubmitting ? "Creating..." : "Create Opportunity"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
