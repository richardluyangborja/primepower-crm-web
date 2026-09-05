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
import { Ellipsis, Loader2, Plus, Search, Trash2 } from "lucide-react"
import useSurveyTemplatesQuery, {
  type SurveyTemplateRow,
} from "@/lib/queries/useSurveyTemplates"
import { useDeleteSurveyTemplate } from "./-useSurveyTemplateMutation"
import { SurveyTemplateFormDialog } from "./-SurveyTemplateFormDialog"
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

export default function SurveyTemplateTable() {
  const isAdmin = useIsAdmin()
  const query = useSurveyTemplatesQuery()
  const data = query.data ?? []
  const [search, setSearch] = useState("")
  const [formOpen, setFormOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<SurveyTemplateRow | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<SurveyTemplateRow | null>(null)
  const del = useDeleteSurveyTemplate()

  const filtered = data.filter((template) =>
    template.name.toLowerCase().includes(search.toLowerCase())
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
              placeholder="Search templates..."
              className="w-xs"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {isAdmin && (
            <Button
              onClick={() => {
                setEditingTemplate(null)
                setFormOpen(true)
              }}
            >
              <Plus />
              <span>Create Template</span>
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
                <TableHead>Template</TableHead>
                <TableHead>Questions</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                {isAdmin && <TableHead />}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((template) => (
                <TableRow key={template.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{template.name}</span>
                      {template.description && (
                        <span className="max-w-60 truncate text-xs text-muted-foreground">
                          {template.description}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{template.question_count} question{template.question_count === 1 ? "" : "s"}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">v{template.version}</span>
                  </TableCell>
                  <TableCell>
                    {template.is_active ? (
                      <Badge className="bg-emerald-600 text-white">Active</Badge>
                    ) : (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {formatDate(template.created_at)}
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
                                setEditingTemplate(template)
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
                              onSelect={() => setDeleteTarget(template)}
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
            Survey templates are managed by administrators. This page is
            read-only for managers and sales representatives.
          </p>
        )}
      </CardContent>

      {isAdmin && (
        <>
          <SurveyTemplateFormDialog
            open={formOpen}
            onOpenChange={setFormOpen}
            template={editingTemplate ?? undefined}
          />

          <Dialog
            open={Boolean(deleteTarget)}
            onOpenChange={(open) => {
              if (!open) setDeleteTarget(null)
            }}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete survey template?</DialogTitle>
                <DialogDescription>
                  This will permanently delete the template{" "}
                  <strong>{deleteTarget?.name}</strong> and all its versions.
                  Surveys that were sent using this template will keep their
                  snapshot of the questions. This action cannot be undone.
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