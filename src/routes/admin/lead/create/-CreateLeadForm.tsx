import { useForm } from "@tanstack/react-form"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
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
import { useCreateLead, useSalesRepresentatives } from "./-hooks"
import { createLeadSchema, type CreateLeadFormValues } from "./-types"
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useNavigate } from "@tanstack/react-router"

export function CreateLeadForm() {
  const salesRepsQuery = useSalesRepresentatives()
  const createLeadMutation = useCreateLead()
  const navigate = useNavigate()

  const form = useForm({
    defaultValues: {
      company: {
        name: "",
        industry: "",
        address: "",
        phone: "",
        email: "",
        website: "",
      },

      primary_contact: {
        first_name: "",
        last_name: "",
        title: "",
        email: "",
        phone: "",
      },

      source: "",
      assigned_to_id: 0,
      notes: "",
    } satisfies CreateLeadFormValues,

    validators: {
      onSubmit: createLeadSchema,
    },

    onSubmit: async ({ value }) => {
      await createLeadMutation.mutateAsync(value)
      form.reset()
      return navigate({ to: "/admin/lead-and-client/leads" })
    },
  })

  const isSubmitting = createLeadMutation.isPending

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
            <h1 className="font-heading text-lg">Create a new lead</h1>
          </CardTitle>
          <CardAction>
            <Button
              type="button"
              variant="outline"
              onClick={() => form.reset()}
              disabled={isSubmitting}
            >
              Reset Form
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* company */}
          <FieldSet>
            <FieldLegend>Company Information</FieldLegend>

            <FieldDescription>
              Information about the company being considered as a potential
              client.
            </FieldDescription>

            <FieldGroup>
              <form.Field
                name="company.name"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid

                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Company Name</FieldLabel>

                      <Input
                        autoComplete="off"
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        placeholder="ABC Manufacturing Corporation"
                      />

                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  )
                }}
              />

              <form.Field
                name="company.industry"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid

                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Industry</FieldLabel>

                      <Input
                        autoComplete="off"
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        placeholder="Manufacturing"
                      />

                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  )
                }}
              />

              <form.Field
                name="company.address"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid

                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Address</FieldLabel>

                      <Input
                        autoComplete="off"
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        placeholder="Quezon City, Metro Manila"
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
                  name="company.phone"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid

                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>Phone</FieldLabel>

                        <Input
                          autoComplete="off"
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          aria-invalid={isInvalid}
                          placeholder="+63 917 123 4567"
                        />

                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    )
                  }}
                />

                <form.Field
                  name="company.email"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid

                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>Email</FieldLabel>

                        <Input
                          autoComplete="off"
                          id={field.name}
                          name={field.name}
                          type="email"
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          aria-invalid={isInvalid}
                          placeholder="hr@company.com"
                        />

                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    )
                  }}
                />
              </div>

              <form.Field
                name="company.website"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid

                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Website</FieldLabel>

                      <Input
                        autoComplete="off"
                        id={field.name}
                        name={field.name}
                        type="url"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        placeholder="https://company.com"
                      />

                      <FieldDescription>Optional.</FieldDescription>

                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  )
                }}
              />
            </FieldGroup>
          </FieldSet>
          {/* company */}
          {/* primary contact */}
          <FieldSet>
            <FieldLegend>Primary Contact</FieldLegend>

            <FieldDescription>
              The main person to contact within the company.
            </FieldDescription>

            <FieldGroup>
              <div className="grid gap-4 sm:grid-cols-2">
                <form.Field
                  name="primary_contact.first_name"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid

                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>First Name</FieldLabel>

                        <Input
                          autoComplete="off"
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
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
                  name="primary_contact.last_name"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid

                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>Last Name</FieldLabel>

                        <Input
                          autoComplete="off"
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          aria-invalid={isInvalid}
                        />

                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    )
                  }}
                />
              </div>

              <form.Field
                name="primary_contact.title"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid

                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Job Title</FieldLabel>

                      <Input
                        autoComplete="off"
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        placeholder="HR Manager"
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
                  name="primary_contact.email"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid

                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>Email</FieldLabel>

                        <Input
                          autoComplete="off"
                          id={field.name}
                          type="email"
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
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
                  name="primary_contact.phone"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid

                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>Phone</FieldLabel>

                        <Input
                          autoComplete="off"
                          id={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          aria-invalid={isInvalid}
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
          {/* primary contact */}
          {/* lead info */}
          <FieldSet>
            <FieldLegend>Lead Information</FieldLegend>

            <FieldGroup>
              <form.Field
                name="source"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid

                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Lead Source</FieldLabel>

                      <Select
                        value={field.state.value}
                        onValueChange={field.handleChange}
                      >
                        <SelectTrigger id={field.name} aria-invalid={isInvalid}>
                          <SelectValue placeholder="Select source" />
                        </SelectTrigger>

                        <SelectContent>
                          <SelectItem value="Referral">Referral</SelectItem>

                          <SelectItem value="Website">Website</SelectItem>

                          <SelectItem value="Cold Call">Cold Call</SelectItem>

                          <SelectItem value="Social Media">
                            Social Media
                          </SelectItem>

                          <SelectItem value="Existing Network">
                            Existing Network
                          </SelectItem>

                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>

                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  )
                }}
              />

              <form.Field
                name="assigned_to_id"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid

                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>
                        Sales Representative
                      </FieldLabel>

                      <Select
                        value={
                          field.state.value > 0 ? String(field.state.value) : ""
                        }
                        onValueChange={(value) =>
                          field.handleChange(Number(value))
                        }
                        disabled={
                          salesRepsQuery.isLoading || salesRepsQuery.isError
                        }
                      >
                        <SelectTrigger id={field.name} aria-invalid={isInvalid}>
                          <SelectValue
                            placeholder={
                              salesRepsQuery.isLoading
                                ? "Loading sales representatives..."
                                : "Select sales representative"
                            }
                          />
                        </SelectTrigger>

                        <SelectContent>
                          {salesRepsQuery.data?.map((salesRep) => (
                            <SelectItem
                              key={salesRep.id}
                              value={String(salesRep.id)}
                            >
                              {salesRep.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {salesRepsQuery.isError && (
                        <FieldError>
                          Unable to load sales representatives.
                        </FieldError>
                      )}

                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  )
                }}
              />

              <form.Field
                name="notes"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid

                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Notes</FieldLabel>

                      <Textarea
                        autoComplete="off"
                        id={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        placeholder="Add any relevant information about this lead..."
                        className="min-h-32 resize-none"
                      />

                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  )
                }}
              />
            </FieldGroup>
          </FieldSet>
          {/* lead info */}
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}

            {isSubmitting ? "Creating..." : "Create Lead"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
