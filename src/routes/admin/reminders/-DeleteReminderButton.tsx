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
import { Loader2, Trash2 } from "lucide-react"
import { useNavigate } from "@tanstack/react-router"
import { useDeleteReminder } from "./-useDeleteReminder"

export function DeleteReminderButton({
  reminderId,
  disabled,
}: {
  reminderId: string
  disabled?: boolean
}) {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const del = useDeleteReminder()

  const onConfirm = async () => {
    await del.mutateAsync(reminderId)
    setOpen(false)
    navigate({ to: "/admin/reminders" })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="destructive" disabled={disabled}>
          <Trash2 className="mr-2 size-4" />
          Delete
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete reminder?</DialogTitle>
          <DialogDescription>
            This will permanently delete the reminder. This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={del.isPending}
          >
            {del.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
