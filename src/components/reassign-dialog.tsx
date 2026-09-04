import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useForm } from "@tanstack/react-form"
import * as z from "zod"
import { useState } from "react"
import api from "@/lib/api"
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
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, UserCog } from "lucide-react"

const reassignSchema = z.object({
  assigned_to_id: z.string().min(1, "Select a sales representative"),
  note: z.string(),
})

export type ReassignDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  endpoint: string
  currentOwnerId: number
  currentOwnerName: string
  subjectName: string
  onSuccess?: () => void
}

export function ReassignDialog({
  open,
  onOpenChange,
  endpoint,
  currentOwnerId,
  currentOwnerName,
  subjectName,
  onSuccess,
}: ReassignDialogProps) {
  const queryClient = useQueryClient()
  const [error, setError] = useState<string | null>(null)

  const repsQuery = useQuery({
    queryKey: ["sales-representatives"],
    queryFn: async () => {
      const response = await api.get("/api/sales-representatives")
      return (response.data.data as { id: number; name: string }[]) ?? []
    },
    enabled: open,
  })

  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof reassignSchema>) => {
      const response = await api.patch(endpoint, {
        assigned_to_id: Number(values.assigned_to_id),
        note: values.note || null,
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] })
      queryClient.invalidateQueries({ queryKey: ["clients"] })
      onSuccess?.()
      onOpenChange(false)
    },
    onError: (err) => {
      setError(
        err instanceof Error ? err.message : "Could not reassign record.",
      )
    },
  })

  const form = useForm({
    defaultValues: {
      assigned_to_id: "",
      note: "",
    },
    validators: { onSubmit: reassignSchema },
    onSubmit: async ({ value }) => {
      setError(null)
      await mutation.mutateAsync(value)
    },
  })

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          setError(null)
        }
        onOpenChange(next)
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCog className="size-4" />
            Reassign {subjectName}
          </DialogTitle>
          <DialogDescription>
            Currently owned by <strong>{currentOwnerName}</strong>. Choose a
            different sales representative to take over this record.
          </DialogDescription>
        </DialogHeader>
        {error && (
          <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}
        <form
          onSubmit={(event) => {
            event.preventDefault()
            event.stopPropagation()
            form.handleSubmit()
          }}
        >
          <FieldGroup>
            <form.Field
              name="assigned_to_id"
              children={(field) => (
                <Field
                  data-invalid={
                    field.state.meta.isTouched && !field.state.meta.isValid
                  }
                >
                  <FieldLabel>New sales representative</FieldLabel>
                  <Select
                    value={field.state.value}
                    onValueChange={(value) => field.handleChange(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select representative" />
                    </SelectTrigger>
                    <SelectContent>
                      {repsQuery.data
                        ?.filter((r) => r.id !== currentOwnerId)
                        .map((rep) => (
                          <SelectItem key={rep.id} value={String(rep.id)}>
                            {rep.name}
                          </SelectItem>
                        ))}
                      {repsQuery.data?.filter((r) => r.id !== currentOwnerId)
                        .length === 0 && (
                        <SelectItem value="__empty" disabled>
                          No other sales representatives available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FieldError errors={field.state.meta.errors} />
                </Field>
              )}
            />
            <form.Field
              name="note"
              children={(field) => (
                <Field>
                  <FieldLabel>Note (optional)</FieldLabel>
                  <Textarea
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    placeholder="Reason for reassignment..."
                    rows={3}
                  />
                  <FieldError errors={field.state.meta.errors} />
                </Field>
              )}
            />
          </FieldGroup>
          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={mutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending && (
                <Loader2 className="size-4 animate-spin" />
              )}
              {mutation.isPending ? "Reassigning..." : "Reassign"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
