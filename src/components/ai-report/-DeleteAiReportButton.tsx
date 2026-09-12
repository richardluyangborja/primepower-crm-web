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

interface DeleteAiReportButtonProps {
  reportId: number
  reportLabel: string
  onDelete: (id: number) => void
  isPending: boolean
}

export function DeleteAiReportButton({
  reportId,
  reportLabel,
  onDelete,
  isPending,
}: DeleteAiReportButtonProps) {
  const [open, setOpen] = useState(false)

  const onConfirm = async () => {
    onDelete(reportId)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="destructive">
          <Trash2 className="mr-2 size-4" />
          Delete
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete {reportLabel}?</DialogTitle>
          <DialogDescription>
            This will permanently delete the report. This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isPending}>
            {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}