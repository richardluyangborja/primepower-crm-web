import { useState } from "react"
import { Loader2, Trash } from "lucide-react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import api from "@/lib/api"

type LeadDangerData = {
  id: string
  status?: string
  opportunities?: unknown[]
  reminders?: unknown[]
  communications?: unknown[]
  status_histories?: unknown[]
  company?: { name?: string }
}

type Blocker = {
  key: string
  label: string
  detail: string
  howToFix: string
}

function computeLeadBlockers(lead: LeadDangerData): Blocker[] {
  const blockers: Blocker[] = []

  if (lead.status === "converted") {
    blockers.push({
      key: "client",
      label: "Converted to a client",
      detail:
        "This lead has already been converted into a client. Deleting it would orphan the client record.",
      howToFix:
        "Delete the related client first, then come back here to delete the lead.",
    })
  }

  if (lead.opportunities && lead.opportunities.length > 0) {
    blockers.push({
      key: "opportunities",
      label: "Opportunities",
      detail: "This lead has one or more linked opportunities.",
      howToFix:
        "Delete or remove the related opportunities before deleting this lead.",
    })
  }

  if (lead.reminders && lead.reminders.length > 0) {
    blockers.push({
      key: "reminders",
      label: "Reminders",
      detail: "This lead has one or more linked reminders.",
      howToFix:
        "Delete or resolve the related reminders before deleting this lead.",
    })
  }

  if (lead.status_histories && lead.status_histories.length > 0) {
    blockers.push({
      key: "status_history",
      label: "Status history",
      detail: "This lead has recorded status changes.",
      howToFix:
        "The status history must be cleared before this lead can be deleted.",
    })
  }

  if (lead.communications && lead.communications.length > 0) {
    blockers.push({
      key: "communications",
      label: "Communications",
      detail: "This lead's company has logged communications.",
      howToFix: "Remove the related communications before deleting this lead.",
    })
  }

  return blockers
}

export function LeadDangerZone({
  lead,
  detailQueryKey,
  listPath,
}: {
  lead: LeadDangerData
  detailQueryKey: string[]
  listPath: string
}) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [confirmOpen, setConfirmOpen] = useState(false)

  const blockers = computeLeadBlockers(lead)

  const mutation = useMutation({
    mutationFn: async () => {
      const response = await api.delete(`/api/leads/${lead.id}`)
      return response.data
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] })
      queryClient.invalidateQueries({ queryKey: ["sales_leads"] })
      queryClient.invalidateQueries({ queryKey: detailQueryKey })
      navigate({ to: listPath })
    },
  })

  const deleteError = mutation.isError
    ? ((mutation.error as { response?: { data?: { message?: string } } })
        ?.response?.data?.message ??
      (mutation.error as Error)?.message ??
      "Something went wrong.")
    : null

  return (
    <section>
      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>
            Permanently delete this lead. This action cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {blockers.length > 0 ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                This lead currently cannot be deleted because of the following
                related records:
              </p>
              <ul className="space-y-2">
                {blockers.map((b) => (
                  <li
                    key={b.key}
                    className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm"
                  >
                    <span className="font-medium text-destructive">
                      {b.label}
                    </span>
                    <span className="block text-muted-foreground">
                      {b.detail}
                    </span>
                    <span className="mt-1 block text-foreground">
                      <strong>To delete:</strong> {b.howToFix}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              This lead has no related records and can be deleted.
            </p>
          )}

          <Button
            variant="destructive"
            onClick={() => setConfirmOpen(true)}
            disabled={mutation.isPending}
          >
            <Trash />
            Delete lead
          </Button>
        </CardContent>
      </Card>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Delete lead?</DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete the lead for{" "}
              {lead.company?.name ?? `#${lead.id}`}? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          {deleteError && (
            <div className="space-y-2">
              <p className="text-sm text-destructive">{deleteError}</p>
              {blockers.length > 0 && (
                <ul className="space-y-1">
                  {blockers.map((b) => (
                    <li key={b.key} className="text-xs text-muted-foreground">
                      • {b.label} — {b.howToFix}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmOpen(false)}
              disabled={mutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending}
            >
              {mutation.isPending && (
                <Loader2 className="mr-2 size-4 animate-spin" />
              )}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  )
}
