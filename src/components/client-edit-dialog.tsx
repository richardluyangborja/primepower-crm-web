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

export type ClientEditValues = {
  id: number
  client_since: string
  status: "active" | "inactive"
  notes?: string
  sales_representative?: {
    id: number
    name: string
  }
}

const editClientSchema = z.object({
  client_since: z.string().min(1, "Client since date is required"),
  status: z.enum(["active", "inactive"]),
  assigned_to_id: z.number().int().positive("Select a sales representative"),
  notes: z.string().max(5000, "Notes cannot exceed 5000 characters"),
})

export function ClientEditDialog({
  open,
  onOpenChange,
  client,
  detailQueryKey,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  client: ClientEditValues
  detailQueryKey: string[]
}) {
  const queryClient = useQueryClient()
  const userQuery = useAuthUser()
  const repsQuery = useSalesRepresentatives()
  const isAdmin = userQuery.data?.role === "admin"

  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof editClientSchema>) => {
      const response = await api.patch(`/api/clients/${client.id}`, values)
      return response.data
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] })
      queryClient.invalidateQueries({ queryKey: ["sales_clients"] })
      queryClient.invalidateQueries({ queryKey: detailQueryKey })
      onOpenChange(false)
    },
  })

  const form = useForm({
    defaultValues: {
      client_since: client.client_since ?? "",
      status: client.status ?? "active",
      assigned_to_id:
        client.sales_representative?.id ?? userQuery.data?.id ?? 0,
      notes: client.notes ?? "",
    },
    validators: {
      onSubmit: editClientSchema,
    },
    onSubmit: async ({ value }) => {
      await mutation.mutateAsync(value)
    },
  })

  const isSubmitting = mutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Edit client</DialogTitle>
          <DialogDescription>
            Update the details for this client.
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
              name="client_since"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Client Since</FieldLabel>
                    <FieldDescription>
                      The date this company became a client.
                    </FieldDescription>
                    <Input
                      type="date"
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      className="max-w-52"
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
              name="status"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Status</FieldLabel>
                    <FieldDescription>
                      Whether this client is currently active.
                    </FieldDescription>
                    <Select
                      value={field.state.value}
                      onValueChange={(value) =>
                        field.handleChange(value as "active" | "inactive")
                      }
                    >
                      <SelectTrigger id={field.name} className="max-w-52">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                    {isInvalid && (
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
                      <FieldDescription>Who owns this client.</FieldDescription>
                      <Select
                        value={String(field.state.value)}
                        onValueChange={(value) =>
                          field.handleChange(Number(value))
                        }
                      >
                        <SelectTrigger className="max-w-52">
                          <SelectValue placeholder="Select a representative" />
                        </SelectTrigger>
                        <SelectContent>
                          {(repsQuery.data ?? []).map((rep) => (
                            <SelectItem key={rep.id} value={String(rep.id)}>
                              {rep.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {field.state.meta.errors.length > 0 && (
                        <FieldError>
                          {field.state.meta.errors.join(", ")}
                        </FieldError>
                      )}
                    </Field>
                  )
                }}
              />
            )}

            <form.Field
              name="notes"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Notes</FieldLabel>
                    <FieldDescription>
                      Internal notes about this client.
                    </FieldDescription>
                    <Textarea
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      rows={4}
                      placeholder="Add any internal notes…"
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
