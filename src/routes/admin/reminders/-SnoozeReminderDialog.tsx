import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Clock, Loader2 } from "lucide-react"
import { useSnoozeReminder } from "./-useSnoozeReminder"

function tomorrowIsoDate(): string {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().slice(0, 16)
}

export function SnoozeReminderDialog({
  reminderId,
  disabled,
}: {
  reminderId: number
  disabled?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [dueDate, setDueDate] = useState<string>(tomorrowIsoDate())
  const snooze = useSnoozeReminder()

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!dueDate) return
    await snooze.mutateAsync({
      id: reminderId,
      dueDate: new Date(dueDate).toISOString(),
    })
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" disabled={disabled}>
          <Clock className="mr-2 size-4" />
          Snooze
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Snooze reminder</DialogTitle>
          <DialogDescription>
            Pick a new due date in the future. The reminder status will change
            to "Snoozed".
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="snooze-due-date">New due date</Label>
            <Input
              id="snooze-due-date"
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={snooze.isPending}>
              {snooze.isPending ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <Clock className="mr-2 size-4" />
              )}
              Snooze
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
