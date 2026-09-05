import { useForm } from "@tanstack/react-form"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ChevronLeft, Info, Loader2 } from "lucide-react"
import { createFileRoute } from "@tanstack/react-router"
import { useIsAdmin } from "@/lib/queries/useIsAdmin"
import { AdminOnlyEmptyState } from "@/components/admin-only-empty-state"

export const Route = createFileRoute("/admin/users/create/")({
  component: RouteComponent,
})

const formSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  email: z.string().email("Invalid email address").max(255),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["admin", "manager", "sales_rep"]),
  manager_id: z.string(),
})

type CreateUserForm = z.infer<typeof formSchema>

function RouteComponent() {
  const isAdmin = useIsAdmin()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  if (!isAdmin) {
    return (
      <div className="px-4 pb-8">
        <header className="py-4">
          <Button
            variant="link"
            onClick={() => navigate({ to: "/admin/dashboard" })}
          >
            <ChevronLeft />
            <span>Back to dashboard</span>
          </Button>
        </header>
        <main>
          <AdminOnlyEmptyState backTo="/admin/dashboard" backLabel="Back to dashboard" />
        </main>
      </div>
    )
  }

  const mutation = useMutation({
    mutationFn: async (values: CreateUserForm) => {
      const payload: Record<string, unknown> = {
        name: values.name,
        email: values.email,
        password: values.password,
        role: values.role,
      }
      if (values.manager_id) payload.manager_id = Number(values.manager_id)
      const response = await api.post("/api/users", payload)
      return response.data as {
        data: Record<string, unknown>
        initial_password: string
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
      navigate({ to: "/admin/users" })
    },
  })

  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "sales_rep" as CreateUserForm["role"],
      manager_id: "",
    },
    validators: { onSubmit: formSchema },
    onSubmit: async ({ value }) => {
      await mutation.mutateAsync(value)
    },
  })

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
      <main>
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Create user</CardTitle>
            <CardDescription>
              Add a new user account. The initial password is shared only with
              the administrator creating the account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {mutation.isError && (
              <Alert variant="destructive" className="mb-4">
                <Info />
                <AlertTitle>Could not create user</AlertTitle>
                <AlertDescription>
                  {isAxiosError(mutation.error)
                    ? (mutation.error.response?.data?.message as string) ??
                      "Validation error"
                    : String(mutation.error)}
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
                      <Field
                        data-invalid={
                          field.state.meta.isTouched && !field.state.meta.isValid
                        }
                      >
                        <FieldLabel htmlFor="name">Full name</FieldLabel>
                        <Input
                          id="name"
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder="Juan Dela Cruz"
                        />
                        <FieldError errors={field.state.meta.errors} />
                      </Field>
                    )}
                  />
                  <form.Field
                    name="email"
                    children={(field) => (
                      <Field
                        data-invalid={
                          field.state.meta.isTouched && !field.state.meta.isValid
                        }
                      >
                        <FieldLabel htmlFor="email">Email</FieldLabel>
                        <Input
                          id="email"
                          type="email"
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder="juan@primepower.com"
                        />
                        <FieldError errors={field.state.meta.errors} />
                      </Field>
                    )}
                  />
                </div>
                <form.Field
                  name="password"
                  children={(field) => (
                    <Field
                      data-invalid={
                        field.state.meta.isTouched && !field.state.meta.isValid
                      }
                    >
                      <FieldLabel htmlFor="password">Initial password</FieldLabel>
                      <Input
                        id="password"
                        type="text"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="At least 8 characters"
                      />
                      <FieldError errors={field.state.meta.errors} />
                    </Field>
                  )}
                />
                <form.Field
                  name="role"
                  children={(field) => (
                    <Field>
                      <FieldLabel>Role</FieldLabel>
                      <Select
                        value={field.state.value}
                        onValueChange={(value) =>
                          field.handleChange(value as CreateUserForm["role"])
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
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
                <div className="grid grid-cols-1 gap-4">
                  <form.Field
                    name="manager_id"
                    children={(field) => (
                      <Field>
                        <FieldLabel>Manager user ID (optional)</FieldLabel>
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
                <div className="flex items-center gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate({ to: "/admin/users" })}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={mutation.isPending}>
                    {mutation.isPending && (
                      <Loader2 className="size-4 animate-spin" />
                    )}
                    {mutation.isPending ? "Creating..." : "Create user"}
                  </Button>
                </div>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
