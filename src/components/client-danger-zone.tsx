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

type ClientDangerData = {
  id: string
  opportunities?: unknown[]
  reminders?: unknown[]
  communications?: unknown[]
  status_histories?: unknown[]
  latest_survey?: unknown
  company?: { name?: string }
}

type Blocker = {
  key: string
  label: string
  detail: string
  howToFix: string
}

function computeClientBlockers(client: ClientDangerData): Blocker[] {
  const blockers: Blocker[] = []

  if (client.opportunities && client.opportunities.length > 0) {
    blockers.push({
      key: "opportunities",
      label: "Opportunities",
      detail: "This client has one or more linked opportunities.",
      howToFix:
        "Delete or remove the related opportunities before deleting this client.",
    })
  }

  if (client.latest_survey) {
    blockers.push({
      key: "surveys",
      label: "Surveys",
      detail: "This client has satisfaction survey responses.",
      howToFix: "Remove the related surveys before deleting this client.",
    })
  }

  if (client.reminders && client.reminders.length > 0) {
    blockers.push({
      key: "reminders",
      label: "Reminders",
      detail: "This client has one or more linked reminders.",
      howToFix:
        "Delete or resolve the related reminders before deleting this client.",
    })
  }

  if (client.status_histories && client.status_histories.length > 0) {
    blockers.push({
      key: "status_history",
      label: "Status history",
      detail: "This client has recorded status changes.",
      howToFix:
        "The status history must be cleared before this client can be deleted.",
    })
  }

  if (client.communications && client.communications.length > 0) {
    blockers.push({
      key: "communications",
      label: "Communications",
      detail: "This client's company has logged communications.",
      howToFix:
        "Remove the related communications before deleting this client.",
    })
  }

  return blockers
}

export function ClientDangerZone({
  client,
  detailQueryKey,
  listPath,
}: {
  client: ClientDangerData
  detailQueryKey: string[]
  listPath: string
}) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [confirmOpen, setConfirmOpen] = useState(false)

  const blockers = computeClientBlockers(client)

  const mutation = useMutation({
    mutationFn: async () => {
      const response = await api.delete(`/api/clients/${client.id}`)
      return response.data
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] })
      queryClient.invalidateQueries({ queryKey: ["sales_clients"] })
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
            Permanently delete this client. This action cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {blockers.length > 0 ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                This client currently cannot be deleted because of the following
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
              This client has no related records and can be deleted.
            </p>
          )}

          <Button
            variant="destructive"
            onClick={() => setConfirmOpen(true)}
            disabled={mutation.isPending}
          >
            <Trash />
            Delete client
          </Button>
        </CardContent>
      </Card>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Delete client?</DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete the client{" "}
              {client.company?.name ?? `#${client.id}`}? This action cannot be
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
