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
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import useSalesRepresentatives from "@/lib/queries/useSalesRepresentatives"
import { useCreateTeam, useUpdateTeam, type TeamFormValues } from "./-useTeamsMutation"
import type { TeamRow } from "@/lib/queries/useTeams"

export function TeamFormDialog({
  open,
  onOpenChange,
  team,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  team?: TeamRow
}) {
  // Keyed by open state + team so the inner form remounts with fresh state
  // every time the dialog opens (avoids setState-in-effect).
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open && (
        <TeamFormInner
          key={`${team?.id ?? "new"}-${open}`}
          team={team}
          onClose={() => onOpenChange(false)}
        />
      )}
    </Dialog>
  )
}

function TeamFormInner({
  team,
  onClose,
}: {
  team?: TeamRow
  onClose: () => void
}) {
  const [name, setName] = useState(team?.name ?? "")
  const [description, setDescription] = useState(team?.description ?? "")
  const [managerId, setManagerId] = useState<string>(
    team?.manager_id ? String(team.manager_id) : ""
  )
  const representatives = useSalesRepresentatives()
  const createTeam = useCreateTeam()
  const updateTeam = useUpdateTeam()

  const isEditing = Boolean(team)
  const isSubmitting = createTeam.isPending || updateTeam.isPending

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const values: TeamFormValues = {
      name,
      description,
      manager_id: managerId ? Number(managerId) : null,
    }
    if (isEditing && team) {
      await updateTeam.mutateAsync({ id: team.id, values })
    } else {
      await createTeam.mutateAsync(values)
    }
    onClose()
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{isEditing ? "Edit Team" : "Create Team"}</DialogTitle>
        <DialogDescription>
          {isEditing
            ? "Update the team name, description, or assigned manager."
            : "Create a new team and assign a manager."}
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="team-name">Name</Label>
          <Input
            id="team-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="e.g. Enterprise Sales"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="team-description">Description</Label>
          <Textarea
            id="team-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional description of this team's focus."
            className="min-h-20 resize-none"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="team-manager">Manager</Label>
          <Select
            value={managerId}
            onValueChange={setManagerId}
            disabled={representatives.isPending}
          >
            <SelectTrigger id="team-manager">
              <SelectValue
                placeholder={
                  representatives.isPending ? "Loading..." : "Select a manager"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {representatives.data?.map((rep) => (
                <SelectItem key={rep.id} value={String(rep.id)}>
                  {rep.name}
                </SelectItem>
              ))}
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
                : "Create Team"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}
