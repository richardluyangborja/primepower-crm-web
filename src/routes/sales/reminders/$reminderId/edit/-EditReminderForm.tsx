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
import { Spinner } from "@/components/ui/spinner"
import {
  reminderPriorityLabels,
  recurrenceLabels,
  type ReminderEntry,
  type ReminderPriority,
} from "@/components/reminders-history"
import useReminderDetailsQuery from "../-useReminderDetailsQuery"
import { useUpdateReminder } from "../../-useUpdateReminder"

type EditReminderFormValues = {
  title: string
  description: string
  due_date: string
  priority: ReminderPriority
  recurrence_rule: "daily" | "weekly" | "monthly" | ""
}

export function EditReminderForm({ reminderId }: { reminderId: string }) {
  const detailsQuery = useReminderDetailsQuery(reminderId)

  if (detailsQuery.isPending) {
    return (
      <div className="flex justify-center">
        <Spinner />
      </div>
    )
  }

  if (!detailsQuery.data) {
    return <p className="text-sm text-muted-foreground">Reminder not found.</p>
  }

  return (
    <EditReminderFormInner
      reminder={detailsQuery.data}
      reminderId={reminderId}
    />
  )
}

function EditReminderFormInner({
  reminder,
  reminderId,
}: {
  reminder: ReminderEntry
  reminderId: string
}) {
  const navigate = useNavigate()
  const updateMutation = useUpdateReminder()

  const form = useForm({
    defaultValues: {
      title: reminder.title,
      description: reminder.description ?? "",
      due_date: reminder.due_date.slice(0, 10),
      priority: reminder.priority,
      recurrence_rule: (reminder.recurrence_rule ?? "") as
        "daily" | "weekly" | "monthly" | "",
    } satisfies EditReminderFormValues,

    onSubmit: async ({ value }) => {
      await updateMutation.mutateAsync({
        id: reminderId,
        payload: {
          title: value.title,
          description: value.description,
          due_date: value.due_date,
          priority: value.priority,
          recurrence_rule: value.recurrence_rule,
        },
      })
      return navigate({
        to: "/sales/reminders/$reminderId",
        params: { reminderId },
      })
    },
  })

  const isSubmitting = updateMutation.isPending

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
            <h1 className="font-heading text-lg">Edit Reminder</h1>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          <FieldSet>
            <FieldLegend>Reminder Details</FieldLegend>

            <FieldDescription>
              Update the details of this follow-up reminder.
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

                        <FieldError
                          errors={field.state.meta.errors.map((error) =>
                            typeof error === "string"
                              ? { message: error }
                              : error
                          )}
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
                          {(["daily", "weekly", "monthly"] as const).map(
                            (rule) => (
                              <SelectItem key={rule} value={rule}>
                                {recurrenceLabels[rule]}
                              </SelectItem>
                            )
                          )}
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
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() =>
              navigate({
                to: "/sales/reminders/$reminderId",
                params: { reminderId },
              })
            }
          >
            Cancel
          </Button>
          <Button type="submit" className="gap-2" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="size-4 animate-spin" />}
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
