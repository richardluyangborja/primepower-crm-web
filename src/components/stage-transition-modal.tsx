import { useForm } from "@tanstack/react-form"
import { Loader2 } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"

export type StageHistoryEntry = {
  id: number
  from_stage: string | null
  to_stage: string
  reason: string | null
  user: { id: number; name: string } | null
  created_at: string
}

export type StatusHistoryEntry = {
  id: number
  from_status: string | null
  to_status: string
  reason: string | null
  user: { id: number; name: string } | null
  created_at: string
}

export type StageTransitionModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  isPending: boolean
  onSubmit: (reason: string) => Promise<void>
}

export function StageTransitionModal({
  open,
  onOpenChange,
  title,
  description,
  isPending,
  onSubmit,
}: StageTransitionModalProps) {
  const form = useForm({
    defaultValues: {
      reason: "",
    },

    onSubmit: async ({ value }) => {
      await onSubmit(value.reason)
      form.reset()
      onOpenChange(false)
    },
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(event) => {
            event.preventDefault()
            event.stopPropagation()
            form.handleSubmit()
          }}
        >
          <div className="flex flex-col gap-4 py-4">
            <form.Field name="reason">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>
                      What happened or why this change?
                    </FieldLabel>
                    <Textarea
                      autoComplete="off"
                      id={field.name}
                      name={field.name}
                      value={field.state.value ?? ""}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="Briefly describe the reason for this stage change..."
                      rows={4}
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                )
              }}
            </form.Field>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
