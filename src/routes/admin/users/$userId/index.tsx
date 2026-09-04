import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useForm } from "@tanstack/react-form"
import * as z from "zod"
import api, { isAxiosError } from "@/lib/api"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"
import {
  ChevronLeft,
  Info,
  KeyRound,
  Loader2,
  MoveUpRight,
  Power,
  PowerOff,
  Trash,
} from "lucide-react"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import useTeamsQuery from "@/lib/queries/useTeams"
import useAuthUser from "@/lib/queries/useAuthUser"

export const Route = createFileRoute("/admin/users/$userId/")({
  component: RouteComponent,
})

const editSchema = z.object({
  name: z.string().min(1).max(255),
  email: z.string().email().max(255),
  role: z.enum(["admin", "manager", "sales_rep"]),
  team_id: z.string(),
  manager_id: z.string(),
  password: z.string(),
})

function RouteComponent() {
  const { userId } = Route.useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const authUser = useAuthUser()

  const userQuery = useQuery({
    queryKey: ["users", "detail", userId],
    queryFn: async () => {
      const response = await api.get(`/api/users/${userId}`)
      return (response.data as { data: Record<string, unknown> }).data
    },
  })

  const teamsQuery = useTeamsQuery()
  const [confirmAction, setConfirmAction] = useState<
    null | "deactivate" | "activate" | "delete" | "reset"
  >(null)
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null)

  const isSelf = Number(userId) === authUser.data?.id

  const updateMutation = useMutation({
    mutationFn: async (values: z.infer<typeof editSchema>) => {
      const payload: Record<string, unknown> = {
        name: values.name,
        email: values.email,
        role: values.role,
      }
      payload.team_id = values.team_id ? Number(values.team_id) : null
      payload.manager_id = values.manager_id ? Number(values.manager_id) : null
      if (values.password && values.password.length > 0) {
        payload.password = values.password
      }
      const response = await api.put(`/api/users/${userId}`, payload)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
    },
  })

  const deactivateMutation = useMutation({
    mutationFn: async () => api.post(`/api/users/${userId}/deactivate`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
      userQuery.refetch()
    },
  })

  const activateMutation = useMutation({
    mutationFn: async () => api.post(`/api/users/${userId}/activate`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
      userQuery.refetch()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async () => api.delete(`/api/users/${userId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
      navigate({ to: "/admin/users" })
    },
  })

  const resetMutation = useMutation({
    mutationFn: async () => api.post(`/api/users/${userId}/reset-password`),
    onSuccess: (response) => {
      const data = response.data as { data: { temporary_password: string } }
      setGeneratedPassword(data.data.temporary_password)
      queryClient.invalidateQueries({ queryKey: ["users"] })
    },
  })

  const form = useForm({
    defaultValues: {
      name: (userQuery.data?.name as string) ?? "",
      email: (userQuery.data?.email as string) ?? "",
      role: ((userQuery.data?.role as string) ?? "sales_rep") as
        | "admin"
        | "manager"
        | "sales_rep",
      team_id: userQuery.data?.team_id
        ? String(userQuery.data.team_id)
        : "",
      manager_id: userQuery.data?.manager_id
        ? String(userQuery.data.manager_id)
        : "",
      password: "",
    },
    validators: { onSubmit: editSchema },
    onSubmit: async ({ value }) => {
      await updateMutation.mutateAsync(value)
    },
  })

  if (userQuery.isPending) {
    return (
      <div className="flex h-svh w-full items-center justify-center">
        <Spinner className="size-10" />
      </div>
    )
  }

  if (!userQuery.data) {
    return (
      <div className="p-6 text-sm text-muted-foreground">User not found.</div>
    )
  }

  return (
    <div className="px-4 pb-8">
      <header className="py-4">
        <Button
          variant="link"
          onClick={() => navigate({ to: "/admin/users" })}
        >
          <ChevronLeft />
          <span>Back to users</span>
        </Button>
      </header>
      <main className="flex flex-col gap-6">
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <h1 className="font-heading text-lg">
              {(userQuery.data.name as string) ?? "User"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {userQuery.data.email as string}
            </p>
            <div className="mt-1 flex items-center gap-2">
              <Badge variant="secondary">
                {(userQuery.data.role as string).replace("_", " ")}
              </Badge>
              <Badge
                variant={
                  (userQuery.data.is_active as boolean) ? "default" : "destructive"
                }
              >
                {(userQuery.data.is_active as boolean) ? "Active" : "Inactive"}
              </Badge>
              {(userQuery.data.team as { name: string } | null)?.name && (
                <Badge variant="outline">
                  Team: {(userQuery.data.team as { name: string }).name}
                </Badge>
              )}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              disabled={isSelf || resetMutation.isPending}
              onClick={() => setConfirmAction("reset")}
            >
              <KeyRound />
              Reset password
            </Button>
            {(userQuery.data.is_active as boolean) ? (
              <Button
                variant="outline"
                disabled={isSelf || deactivateMutation.isPending}
                onClick={() => setConfirmAction("deactivate")}
              >
                <PowerOff />
                Deactivate
              </Button>
            ) : (
              <Button
                variant="outline"
                disabled={isSelf || activateMutation.isPending}
                onClick={() => setConfirmAction("activate")}
              >
                <Power />
                Activate
              </Button>
            )}
            <Button
              variant="destructive"
              disabled={isSelf || deleteMutation.isPending}
              onClick={() => setConfirmAction("delete")}
            >
              <Trash />
              Delete
            </Button>
          </div>
        </header>

        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>
              Update user details. Role changes revoke active sessions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {updateMutation.isError && (
              <Alert variant="destructive" className="mb-4">
                <Info />
                <AlertTitle>Could not save changes</AlertTitle>
                <AlertDescription>
                  {isAxiosError(updateMutation.error)
                    ? (updateMutation.error.response?.data?.message as string) ??
                      "Validation error"
                    : String(updateMutation.error)}
                </AlertDescription>
              </Alert>
            )}
            {updateMutation.isSuccess && (
              <Alert className="mb-4">
                <Info />
                <AlertTitle>Saved</AlertTitle>
                <AlertDescription>
                  User details have been updated.
                </AlertDescription>
              </Alert>
            )}
            <form
              onSubmit={(event) => {
                event.preventDefault()
                event.stopPropagation()
                form.handleSubmit()
              }}
            >
              <FieldGroup>
                <div className="grid grid-cols-2 gap-4">
                  <form.Field
                    name="name"
                    children={(field) => (
                      <Field>
                        <FieldLabel>Name</FieldLabel>
                        <Input
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          onBlur={field.handleBlur}
                        />
                        <FieldError errors={field.state.meta.errors} />
                      </Field>
                    )}
                  />
                  <form.Field
                    name="email"
                    children={(field) => (
                      <Field>
                        <FieldLabel>Email</FieldLabel>
                        <Input
                          type="email"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          onBlur={field.handleBlur}
                        />
                        <FieldError errors={field.state.meta.errors} />
                      </Field>
                    )}
                  />
                </div>
                <form.Field
                  name="role"
                  children={(field) => (
                    <Field>
                      <FieldLabel>Role</FieldLabel>
                      <Select
                        value={field.state.value}
                        onValueChange={(value) =>
                          field.handleChange(value as "admin" | "manager" | "sales_rep")
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Administrator</SelectItem>
                          <SelectItem value="manager">Manager</SelectItem>
                          <SelectItem value="sales_rep">
                            Sales Representative
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <form.Field
                    name="team_id"
                    children={(field) => (
                      <Field>
                        <FieldLabel>Team</FieldLabel>
                        <Select
                          value={field.state.value || "none"}
                          onValueChange={(value) =>
                            field.handleChange(value === "none" ? "" : value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="No team" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No team</SelectItem>
                            {teamsQuery.data?.map((team) => (
                              <SelectItem
                                key={team.id}
                                value={String(team.id)}
                              >
                                {team.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </Field>
                    )}
                  />
                  <form.Field
                    name="manager_id"
                    children={(field) => (
                      <Field>
                        <FieldLabel>Manager user ID</FieldLabel>
                        <Input
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder="Leave empty for no manager"
                        />
                        <FieldError errors={field.state.meta.errors} />
                      </Field>
                    )}
                  />
                </div>
                <form.Field
                  name="password"
                  children={(field) => (
                    <Field>
                      <FieldLabel>Reset password (optional)</FieldLabel>
                      <Input
                        type="text"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="Leave blank to keep current"
                      />
                      <FieldError errors={field.state.meta.errors} />
                    </Field>
                  )}
                />
                <div className="flex items-center gap-2 pt-2">
                  <Button type="submit" disabled={updateMutation.isPending}>
                    {updateMutation.isPending && (
                      <Loader2 className="size-4 animate-spin" />
                    )}
                    {updateMutation.isPending ? "Saving..." : "Save changes"}
                    <MoveUpRight />
                  </Button>
                </div>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>

        <Dialog
          open={confirmAction !== null}
          onOpenChange={(open) => {
            if (!open) setConfirmAction(null)
          }}
        >
          <DialogContent showCloseButton={false}>
            <DialogHeader>
              <DialogTitle>
                {confirmAction === "deactivate" && "Deactivate user"}
                {confirmAction === "activate" && "Activate user"}
                {confirmAction === "delete" && "Delete user"}
                {confirmAction === "reset" && "Reset password"}
              </DialogTitle>
              <DialogDescription>
                {confirmAction === "deactivate" &&
                  "This user will no longer be able to log in. All active sessions are revoked."}
                {confirmAction === "activate" &&
                  "Re-enable this account so the user can log in again."}
                {confirmAction === "delete" &&
                  "This is a soft delete. The record is retained for audit history but the user cannot log in."}
                {confirmAction === "reset" &&
                  "A new temporary password will be generated. The user must change it on next login."}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setConfirmAction(null)}
                disabled={
                  deactivateMutation.isPending ||
                  activateMutation.isPending ||
                  deleteMutation.isPending ||
                  resetMutation.isPending
                }
              >
                Cancel
              </Button>
              <Button
                variant={
                  confirmAction === "delete" ? "destructive" : "default"
                }
                onClick={async () => {
                  if (confirmAction === "deactivate") {
                    await deactivateMutation.mutateAsync()
                  } else if (confirmAction === "activate") {
                    await activateMutation.mutateAsync()
                  } else if (confirmAction === "delete") {
                    await deleteMutation.mutateAsync()
                  } else if (confirmAction === "reset") {
                    await resetMutation.mutateAsync()
                  }
                  setConfirmAction(null)
                }}
                disabled={
                  deactivateMutation.isPending ||
                  activateMutation.isPending ||
                  deleteMutation.isPending ||
                  resetMutation.isPending
                }
              >
                {confirmAction === "deactivate" && "Deactivate"}
                {confirmAction === "activate" && "Activate"}
                {confirmAction === "delete" && "Delete"}
                {confirmAction === "reset" && "Reset password"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog
          open={generatedPassword !== null}
          onOpenChange={(open) => {
            if (!open) setGeneratedPassword(null)
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Temporary password</DialogTitle>
              <DialogDescription>
                Share this securely with the user. It will not be shown again.
              </DialogDescription>
            </DialogHeader>
            <Input readOnly value={generatedPassword ?? ""} className="font-mono" />
            <DialogFooter>
              <Button onClick={() => setGeneratedPassword(null)}>Done</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
