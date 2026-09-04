import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Ellipsis, Loader2, Plus, Search, Trash2, Zap } from "lucide-react"
import useEscalationRulesQuery, {
  type EscalationRuleRow,
} from "@/lib/queries/useEscalationRules"
import { useDeleteEscalationRule } from "./-useEscalationRuleMutation"
import { EscalationRuleFormDialog } from "./-EscalationRuleFormDialog"
import { useIsAdmin } from "@/lib/queries/useIsAdmin"
import { Spinner } from "@/components/ui/spinner"

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export default function EscalationRuleTable() {
  const isAdmin = useIsAdmin()
  const query = useEscalationRulesQuery()
  const data = query.data ?? []
  const [search, setSearch] = useState("")
  const [formOpen, setFormOpen] = useState(false)
  const [editingRule, setEditingRule] = useState<EscalationRuleRow | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<EscalationRuleRow | null>(
    null
  )
  const del = useDeleteEscalationRule()

  const filtered = data.filter((rule) =>
    rule.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" disabled>
              <Search />
            </Button>
            <Input
              placeholder="Search rules..."
              className="w-xs"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {isAdmin && (
            <Button
              onClick={() => {
                setEditingRule(null)
                setFormOpen(true)
              }}
            >
              <Plus />
              <span>Create Rule</span>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {query.isPending ? (
          <div className="flex justify-center">
            <Spinner />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rule</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Threshold</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                {isAdmin && <TableHead />}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((rule) => (
                <TableRow key={rule.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="shrink-0">
                        <Zap className="size-3" />
                      </Badge>
                      <div className="flex flex-col">
                        <span className="font-medium">{rule.name}</span>
                        {rule.reminder_title && (
                          <span className="max-w-60 truncate text-xs text-muted-foreground">
                            Reminder: {rule.reminder_title}
                          </span>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{rule.condition_label}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">
                      {rule.threshold_days} day
                      {rule.threshold_days === 1 ? "" : "s"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{rule.action_label}</span>
                  </TableCell>
                  <TableCell>
                    {rule.is_active ? (
                      <Badge className="bg-emerald-600 text-white">
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {formatDate(rule.created_at)}
                    </span>
                  </TableCell>
                  {isAdmin && (
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Ellipsis />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuGroup>
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                              onSelect={() => {
                                setEditingRule(rule)
                                setFormOpen(true)
                              }}
                            >
                              Edit
                            </DropdownMenuItem>
                          </DropdownMenuGroup>
                          <DropdownMenuSeparator />
                          <DropdownMenuGroup>
                            <DropdownMenuItem
                              variant="destructive"
                              onSelect={() => setDeleteTarget(rule)}
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        {!isAdmin && (
          <p className="mt-4 text-xs text-muted-foreground">
            Escalation rules are managed by administrators. This page is
            read-only for managers and sales representatives.
          </p>
        )}
      </CardContent>

      {isAdmin && (
        <>
          <EscalationRuleFormDialog
            open={formOpen}
            onOpenChange={setFormOpen}
            rule={editingRule ?? undefined}
          />

          <Dialog
            open={Boolean(deleteTarget)}
            onOpenChange={(open) => {
              if (!open) setDeleteTarget(null)
            }}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete escalation rule?</DialogTitle>
                <DialogDescription>
                  This will permanently delete the rule{" "}
                  <strong>{deleteTarget?.name}</strong>. Matching entities that
                  have already fired will keep their reminders and
                  notifications, but the rule will no longer fire. This action
                  cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setDeleteTarget(null)}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  disabled={del.isPending}
                  onClick={async () => {
                    if (deleteTarget) {
                      await del.mutateAsync(deleteTarget.id)
                      setDeleteTarget(null)
                    }
                  }}
                >
                  {del.isPending && (
                    <Loader2 className="mr-2 size-4 animate-spin" />
                  )}
                  <Trash2 className="mr-2 size-4" />
                  Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </Card>
  )
}
