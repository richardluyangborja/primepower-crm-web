import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import {
  reminderPriorityLabels,
  type ReminderPriority,
} from "@/components/reminders-history"
import {
  useCreateEscalationRule,
  useUpdateEscalationRule,
  type EscalationRuleFormValues,
} from "./-useEscalationRuleMutation"
import type { EscalationRuleRow } from "@/lib/queries/useEscalationRules"

const RULE_TYPES: {
  value: string
  label: string
  entityType: EscalationRuleRow["entity_type"]
  condition: string
}[] = [
  {
    value: "lead:inactive_lead",
    label: "Inactive lead",
    entityType: "lead",
    condition: "inactive_lead",
  },
  {
    value: "client:inactive_client",
    label: "Inactive client",
    entityType: "client",
    condition: "inactive_client",
  },
  {
    value: "opportunity:stale_opportunity",
    label: "Stale opportunity",
    entityType: "opportunity",
    condition: "stale_opportunity",
  },
  {
    value: "reminder:overdue_reminder",
    label: "Overdue reminder",
    entityType: "reminder",
    condition: "overdue_reminder",
  },
]

const ACTIONS: {
  value: EscalationRuleFormValues["action_type"]
  label: string
  createsReminder: boolean
}[] = [
  {
    value: "create_reminder",
    label: "Create follow-up reminder",
    createsReminder: true,
  },
  {
    value: "notify_manager",
    label: "Notify manager",
    createsReminder: false,
  },
  {
    value: "create_reminder_and_notify",
    label: "Create reminder and notify manager",
    createsReminder: true,
  },
]

export function EscalationRuleFormDialog({
  open,
  onOpenChange,
  rule,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  rule?: EscalationRuleRow
}) {
  // Keyed by open state + rule so the inner form remounts with fresh state
  // every time the dialog opens (avoids setState-in-effect).
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open && (
        <EscalationRuleFormInner
          key={`${rule?.id ?? "new"}-${open}`}
          rule={rule}
          onClose={() => onOpenChange(false)}
        />
      )}
    </Dialog>
  )
}

function EscalationRuleFormInner({
  rule,
  onClose,
}: {
  rule?: EscalationRuleRow
  onClose: () => void
}) {
  const [name, setName] = useState(rule?.name ?? "")
  const [ruleType, setRuleType] = useState<string>(
    rule ? `${rule.entity_type}:${rule.condition}` : "lead:inactive_lead"
  )
  const [thresholdDays, setThresholdDays] = useState<string>(
    rule ? String(rule.threshold_days) : "7"
  )
  const [actionType, setActionType] = useState<
    EscalationRuleFormValues["action_type"]
  >(rule?.action_type ?? "create_reminder_and_notify")
  const [reminderTitle, setReminderTitle] = useState(rule?.reminder_title ?? "")
  const [reminderPriority, setReminderPriority] = useState<ReminderPriority>(
    (rule?.reminder_priority as ReminderPriority) ?? "medium"
  )
  const [reminderDueInDays, setReminderDueInDays] = useState<string>(
    rule?.reminder_due_in_days ? String(rule.reminder_due_in_days) : "2"
  )
  const [isActive, setIsActive] = useState<boolean>(rule?.is_active ?? true)

  const createRule = useCreateEscalationRule()
  const updateRule = useUpdateEscalationRule()

  const isEditing = Boolean(rule)
  const isSubmitting = createRule.isPending || updateRule.isPending

  const selectedRuleType =
    RULE_TYPES.find((t) => t.value === ruleType) ?? RULE_TYPES[0]
  const selectedAction =
    ACTIONS.find((a) => a.value === actionType) ?? ACTIONS[0]
  const createsReminder = selectedAction.createsReminder
  // A reminder entity only supports notifying the manager.
  const isReminderEntity = selectedRuleType.entityType === "reminder"
  const effectiveActionType: EscalationRuleFormValues["action_type"] =
    isReminderEntity ? "notify_manager" : actionType

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const values: EscalationRuleFormValues = {
      name,
      entity_type: selectedRuleType.entityType,
      condition: selectedRuleType.condition,
      threshold_days: Number(thresholdDays),
      action_type: effectiveActionType,
      reminder_title: createsReminder ? reminderTitle : null,
      reminder_priority: createsReminder ? reminderPriority : null,
      reminder_due_in_days: createsReminder ? Number(reminderDueInDays) : null,
      is_active: isActive,
    }
    if (isEditing && rule) {
      await updateRule.mutateAsync({ id: rule.id, values })
    } else {
      await createRule.mutateAsync(values)
    }
    onClose()
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>
          {isEditing ? "Edit Escalation Rule" : "Create Escalation Rule"}
        </DialogTitle>
        <DialogDescription>
          {isEditing
            ? "Update the rule, threshold, or action."
            : "Define when an auto follow-up or manager escalation should fire."}
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="rule-name">Name</Label>
          <Input
            id="rule-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="e.g. Follow up on stale leads"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="rule-type">Rule type</Label>
          <Select value={ruleType} onValueChange={setRuleType}>
            <SelectTrigger id="rule-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {RULE_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="rule-threshold">Inactive for (days)</Label>
          <Input
            id="rule-threshold"
            type="number"
            min={1}
            value={thresholdDays}
            onChange={(e) => setThresholdDays(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="rule-action">Action</Label>
          <Select
            value={isReminderEntity ? "notify_manager" : actionType}
            onValueChange={(value) =>
              setActionType(value as EscalationRuleFormValues["action_type"])
            }
            disabled={isReminderEntity}
          >
            <SelectTrigger id="rule-action">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ACTIONS.map((action) => (
                <SelectItem key={action.value} value={action.value}>
                  {action.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {isReminderEntity && (
            <p className="text-xs text-muted-foreground">
              Overdue reminders can only notify the manager.
            </p>
          )}
        </div>
        {createsReminder && (
          <>
            <div className="space-y-2">
              <Label htmlFor="rule-reminder-title">Reminder title</Label>
              <Input
                id="rule-reminder-title"
                value={reminderTitle}
                onChange={(e) => setReminderTitle(e.target.value)}
                required
                placeholder="e.g. Follow up with this lead"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rule-reminder-priority">Priority</Label>
              <Select
                value={reminderPriority}
                onValueChange={(value) =>
                  setReminderPriority(value as ReminderPriority)
                }
              >
                <SelectTrigger id="rule-reminder-priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(
                    Object.keys(reminderPriorityLabels) as ReminderPriority[]
                  ).map((priority) => (
                    <SelectItem key={priority} value={priority}>
                      {reminderPriorityLabels[priority]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="rule-reminder-due">Due in (days)</Label>
              <Input
                id="rule-reminder-due"
                type="number"
                min={1}
                value={reminderDueInDays}
                onChange={(e) => setReminderDueInDays(e.target.value)}
                required
              />
            </div>
          </>
        )}
        <div className="space-y-2">
          <Label htmlFor="rule-active">Status</Label>
          <Select
            value={isActive ? "active" : "inactive"}
            onValueChange={(value) => setIsActive(value === "active")}
          >
            <SelectTrigger id="rule-active">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
            {isSubmitting
              ? "Saving..."
              : isEditing
                ? "Save Changes"
                : "Create Rule"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}
