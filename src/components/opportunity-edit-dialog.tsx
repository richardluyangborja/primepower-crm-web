import { useForm } from "@tanstack/react-form"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/api"
import useAuthUser from "@/lib/queries/useAuthUser"
import useSalesRepresentatives from "@/lib/queries/useSalesRepresentatives"

export type OpportunityEditValues = {
  title: string
  description?: string
  estimated_contract_value?: number | null
  expected_close_date?: string | null
  lost_reason?: string | null
  manpower_requirement?: number | null
  assigned_to_id?: string | null
}

const editOpportunitySchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  description: z
    .string()
    .max(5000, "Description cannot exceed 5000 characters"),
  estimated_contract_value: z
    .number()
    .min(0, "Estimated contract value must be at least 0")
    .nullable(),
  expected_close_date: z
    .string()
    .regex(
      /^\d{4}-\d{2}-\d{2}$/,
      "Expected close date must be in YYYY-MM-DD format"
    )
    .nullable()
    .or(z.literal("")),
  lost_reason: z
    .string()
    .max(5000, "Lost reason cannot exceed 5000 characters"),
  manpower_requirement: z
    .number()
    .int()
    .min(0, "Manpower requirement must be at least 0")
    .nullable(),
  assigned_to_id: z.string().uuid("Select a sales representative").nullable(),
})

export function OpportunityEditDialog({
  open,
  onOpenChange,
  opportunity,
  detailQueryKey,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  opportunity: {
    id: string
    title: string
    description?: string | null
    estimated_contract_value?: number | null
    expected_close_date?: string | null
    lost_reason?: string | null
    manpower_requirement?: number | null
    assigned_to?: { id: string; name: string } | null
  }
  detailQueryKey: string[]
}) {
  const queryClient = useQueryClient()
  const userQuery = useAuthUser()
  const repsQuery = useSalesRepresentatives()
  const isAdmin = userQuery.data?.role === "admin"

  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof editOpportunitySchema>) => {
      // Remove empty strings and nulls for optional fields to avoid sending unnecessary data
      const payload: Record<string, unknown> = { ...values }
      Object.keys(payload).forEach((key) => {
        if (payload[key] === "" || payload[key] === null) {
          delete payload[key]
        }
      })
      const response = await api.patch(
        `/api/opportunities/${opportunity.id}`,
        payload
      )
      return response.data
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["opportunities"] })
      queryClient.invalidateQueries({ queryKey: ["sales_opportunities"] })
      queryClient.invalidateQueries({ queryKey: detailQueryKey })
      onOpenChange(false)
    },
  })

  const form = useForm({
    defaultValues: {
      title: opportunity.title,
      description: opportunity.description ?? "",
      estimated_contract_value: opportunity.estimated_contract_value ?? null,
      expected_close_date: opportunity.expected_close_date ?? null,
      lost_reason: opportunity.lost_reason ?? "",
      manpower_requirement: opportunity.manpower_requirement ?? null,
      assigned_to_id: opportunity.assigned_to?.id ?? null,
    },
    validators: {
      onSubmit: editOpportunitySchema,
    },
    onSubmit: async ({ value }) => {
      await mutation.mutateAsync(value)
    },
  })

  const isSubmitting = mutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="flex h-full flex-col sm:max-w-3xl"
      >
        <DialogHeader>
          <DialogTitle>Edit opportunity</DialogTitle>
          <DialogDescription>
            Update the details for this opportunity.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto pr-4">
          <form
            onSubmit={(event) => {
              event.preventDefault()
              event.stopPropagation()
              form.handleSubmit()
            }}
          >
            <FieldGroup>
              <form.Field
                name="title"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid

                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Title</FieldLabel>
                      <Input
                        autoComplete="off"
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                      />
                      {field.state.meta.errors.length > 0 && (
                        <FieldError>
                          {field.state.meta.errors.join(", ")}
                        </FieldError>
                      )}
                    </Field>
                  )
                }}
              />

              <form.Field
                name="description"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid

                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Description</FieldLabel>
                      <FieldDescription>
                        Additional details about this opportunity.
                      </FieldDescription>
                      <Textarea
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        rows={4}
                      />
                      {field.state.meta.errors.length > 0 && (
                        <FieldError>
                          {field.state.meta.errors.join(", ")}
                        </FieldError>
                      )}
                    </Field>
                  )
                }}
              />

              <form.Field
                name="estimated_contract_value"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid

                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>
                        Estimated Contract Value (PHP)
                      </FieldLabel>
                      <FieldDescription>
                        The expected value of this opportunity.
                      </FieldDescription>
                      <Input
                        autoComplete="off"
                        id={field.name}
                        name={field.name}
                        type="number"
                        value={
                          field.state.value !== null &&
                          field.state.value !== undefined
                            ? String(field.state.value)
                            : ""
                        }
                        onBlur={field.handleBlur}
                        onChange={(e) => {
                          const val = e.target.value
                          if (val === "") {
                            field.handleChange(null)
                          } else {
                            const num = parseFloat(val)
                            if (isNaN(num)) {
                              field.handleChange(null)
                            } else {
                              field.handleChange(num)
                            }
                          }
                        }}
                        aria-invalid={isInvalid}
                        placeholder="0"
                      />
                      {field.state.meta.errors.length > 0 && (
                        <FieldError>
                          {field.state.meta.errors.join(", ")}
                        </FieldError>
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
                      <FieldDescription>
                        The expected date when this opportunity will be closed.
                      </FieldDescription>
                      <Input
                        autoComplete="off"
                        id={field.name}
                        name={field.name}
                        type="date"
                        value={field.state.value ?? ""}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                      />
                      {field.state.meta.errors.length > 0 && (
                        <FieldError>
                          {field.state.meta.errors.join(", ")}
                        </FieldError>
                      )}
                    </Field>
                  )
                }}
              />

              <form.Field
                name="lost_reason"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid

                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Lost Reason</FieldLabel>
                      <FieldDescription>
                        If the opportunity was lost, please provide the reason.
                      </FieldDescription>
                      <Textarea
                        id={field.name}
                        name={field.name}
                        value={field.state.value ?? ""}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        rows={2}
                      />
                      {field.state.meta.errors.length > 0 && (
                        <FieldError>
                          {field.state.meta.errors.join(", ")}
                        </FieldError>
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
                      <FieldDescription>
                        The number of people required to deliver this
                        opportunity.
                      </FieldDescription>
                      <Input
                        autoComplete="off"
                        id={field.name}
                        name={field.name}
                        type="number"
                        value={
                          field.state.value !== null &&
                          field.state.value !== undefined
                            ? String(field.state.value)
                            : ""
                        }
                        onBlur={field.handleBlur}
                        onChange={(e) => {
                          const val = e.target.value
                          if (val === "") {
                            field.handleChange(null)
                          } else {
                            const num = parseFloat(val)
                            if (isNaN(num)) {
                              field.handleChange(null)
                            } else {
                              field.handleChange(num)
                            }
                          }
                        }}
                        aria-invalid={isInvalid}
                        placeholder="0"
                      />
                      {field.state.meta.errors.length > 0 && (
                        <FieldError>
                          {field.state.meta.errors.join(", ")}
                        </FieldError>
                      )}
                    </Field>
                  )
                }}
              />

              {isAdmin && (
                <form.Field
                  name="assigned_to_id"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid

                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>
                          Assigned Sales Representative
                        </FieldLabel>
                        <FieldDescription>
                          Who owns this opportunity.
                        </FieldDescription>
                        <Select
                          value={String(field.state.value ?? "")}
                          onValueChange={(value) => field.handleChange(value)}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a representative" />
                          </SelectTrigger>
                          <SelectContent>
                            {(repsQuery.data ?? []).map((rep) => (
                              <SelectItem key={rep.id} value={String(rep.id)}>
                                {rep.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                          {field.state.meta.errors.length > 0 && (
                            <FieldError>
                              {field.state.meta.errors.join(", ")}
                            </FieldError>
                          )}
                        </Select>
                      </Field>
                    )
                  }}
                />
              )}
            </FieldGroup>
          </form>
        </div>
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
      </DialogContent>
    </Dialog>
  )
}
