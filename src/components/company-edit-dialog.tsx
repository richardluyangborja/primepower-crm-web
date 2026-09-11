import { useForm } from "@tanstack/react-form"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Loader2 } from "lucide-react"
import { z } from "zod"

import { Button } from "@/components/ui/button"
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
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import api from "@/lib/api"

export type CompanyEditValues = {
  id: number
  industry: string
  address: string
  phone: string
  email: string
  website: string
}

const companySchema = z.object({
  industry: z.string().max(100),
  address: z.string().max(500),
  phone: z.string().max(50),
  email: z.string().email("Enter a valid email address").or(z.literal("")),
  website: z.string().max(255),
  notes: z.string().max(5000),
})

export function CompanyEditDialog({
  open,
  onOpenChange,
  company,
  notes,
  notesEndpoint,
  detailQueryKey,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  company: CompanyEditValues
  notes: string
  notesEndpoint: string
  detailQueryKey: string[]
}) {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof companySchema>) => {
      await api.patch(`/api/companies/${company.id}`, {
        industry: values.industry,
        address: values.address,
        phone: values.phone,
        email: values.email,
        website: values.website,
      })
      await api.patch(notesEndpoint, { notes: values.notes })
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] })
      queryClient.invalidateQueries({ queryKey: detailQueryKey })
      onOpenChange(false)
    },
  })

  const form = useForm({
    defaultValues: {
      industry: company.industry ?? "",
      address: company.address ?? "",
      phone: company.phone ?? "",
      email: company.email ?? "",
      website: company.website ?? "",
      notes: notes ?? "",
    },
    validators: {
      onSubmit: companySchema,
    },
    onSubmit: async ({ value }) => {
      await mutation.mutateAsync(value)
    },
  })

  const isSubmitting = mutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Edit company information</DialogTitle>
          <DialogDescription>
            Update the company details and internal notes.
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
            <form.Field
              name="industry"
              children={(field) => (
                <Field data-invalid={field.state.meta.isTouched && !field.state.meta.isValid}>
                  <FieldLabel htmlFor={field.name}>Industry</FieldLabel>
                  <Input
                    autoComplete="off"
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={field.state.meta.isTouched && !field.state.meta.isValid}
                    placeholder="e.g. Technology"
                  />
                  {field.state.meta.errors.length > 0 && (
                    <FieldError>
                      {field.state.meta.errors.join(", ")}
                    </FieldError>
                  )}
                </Field>
              )}
            />

            <form.Field
              name="address"
              children={(field) => (
                <Field data-invalid={field.state.meta.isTouched && !field.state.meta.isValid}>
                  <FieldLabel htmlFor={field.name}>Address</FieldLabel>
                  <Input
                    autoComplete="off"
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={field.state.meta.isTouched && !field.state.meta.isValid}
                    placeholder="e.g. 123 Main St"
                  />
                  {field.state.meta.errors.length > 0 && (
                    <FieldError>
                      {field.state.meta.errors.join(", ")}
                    </FieldError>
                  )}
                </Field>
              )}
            />

            <form.Field
              name="phone"
              children={(field) => (
                <Field data-invalid={field.state.meta.isTouched && !field.state.meta.isValid}>
                  <FieldLabel htmlFor={field.name}>Phone</FieldLabel>
                  <Input
                    autoComplete="off"
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={field.state.meta.isTouched && !field.state.meta.isValid}
                    placeholder="e.g. +1 (555) 000-0000"
                  />
                  {field.state.meta.errors.length > 0 && (
                    <FieldError>
                      {field.state.meta.errors.join(", ")}
                    </FieldError>
                  )}
                </Field>
              )}
            />

            <form.Field
              name="email"
              children={(field) => (
                <Field data-invalid={field.state.meta.isTouched && !field.state.meta.isValid}>
                  <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                  <FieldDescription>
                    The company's general contact email.
                  </FieldDescription>
                  <Input
                    autoComplete="off"
                    type="email"
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={field.state.meta.isTouched && !field.state.meta.isValid}
                    placeholder="e.g. hello@company.com"
                  />
                  {field.state.meta.errors.length > 0 && (
                    <FieldError>
                      {field.state.meta.errors.join(", ")}
                    </FieldError>
                  )}
                </Field>
              )}
            />

            <form.Field
              name="website"
              children={(field) => (
                <Field data-invalid={field.state.meta.isTouched && !field.state.meta.isValid}>
                  <FieldLabel htmlFor={field.name}>Website</FieldLabel>
                  <Input
                    autoComplete="off"
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={field.state.meta.isTouched && !field.state.meta.isValid}
                    placeholder="e.g. https://company.com"
                  />
                  {field.state.meta.errors.length > 0 && (
                    <FieldError>
                      {field.state.meta.errors.join(", ")}
                    </FieldError>
                  )}
                </Field>
              )}
            />

            <form.Field
              name="notes"
              children={(field) => (
                <Field data-invalid={field.state.meta.isTouched && !field.state.meta.isValid}>
                  <FieldLabel htmlFor={field.name}>Notes</FieldLabel>
                  <FieldDescription>Internal notes about this record.</FieldDescription>
                  <Textarea
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={field.state.meta.isTouched && !field.state.meta.isValid}
                    rows={4}
                    placeholder="Add any internal notes…"
                  />
                  {field.state.meta.errors.length > 0 && (
                    <FieldError>
                      {field.state.meta.errors.join(", ")}
                    </FieldError>
                  )}
                </Field>
              )}
            />
          </FieldGroup>
          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="animate-spin" />}
              Save changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
