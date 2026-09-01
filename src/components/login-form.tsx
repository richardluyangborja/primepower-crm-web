import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import * as z from "zod"
import { useForm } from "@tanstack/react-form"
import { useMutation } from "@tanstack/react-query"
import api from "@/lib/api"
import { isAxiosError } from "axios"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"
import { useNavigate } from "@tanstack/react-router"
import { useQueryClient } from "@tanstack/react-query"
import { Info } from "lucide-react"

const demoAccounts = [
  {
    role: "Admin",
    name: "Daniel Balisi",
    email: "daniel@primepower.com",
    password: "password",
  },
  {
    role: "Sales Rep",
    name: "Carlos Reyes",
    email: "carlos@primepower.com",
    password: "password",
  },
]

const formSchema = z.object({
  email: z.email().max(32, "Email must be at most 32 characters."),
  password: z.string().max(50, "Description must be at most 50 characters."),
})

type Login = z.infer<typeof formSchema>

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async (body: Login) => {
      return api.post("/api/login", body)
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["auth_user"] })
      if (response.data.user.role === "admin")
        return navigate({ to: "/admin/dashboard" })
      return navigate({ to: "/sales/lead-and-client/leads" })
    },
  })

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      await mutation.mutateAsync(value)
    },
  })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
      }}
      className={cn("flex flex-col gap-6", className)}
      {...props}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Login to your account</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Enter your primepower account below to login
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {demoAccounts.map((account) => (
            <button
              key={account.email}
              type="button"
              onClick={() => {
                form.setFieldValue("email", account.email)
                form.setFieldValue("password", account.password)
              }}
              className="flex flex-col items-start gap-1 rounded-lg border border-border p-3 text-left transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              <span className="text-xs font-medium text-muted-foreground">
                {account.role}
              </span>
              <span className="text-sm font-semibold">{account.name}</span>
              <span className="text-xs text-muted-foreground">
                {account.email}
              </span>
            </button>
          ))}
        </div>
        {mutation.isError && (
          <Alert variant="destructive">
            <Info />
            <AlertTitle>Login Error!</AlertTitle>
            <AlertDescription>
              {isAxiosError(mutation.error)
                ? mutation.error.response?.data.message
                : mutation.error.name}
            </AlertDescription>
          </Alert>
        )}
        <form.Field
          name="email"
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={isInvalid}
                  placeholder="m@primepower.com"
                  autoComplete="off"
                  type="email"
                  required
                  className="bg-background"
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            )
          }}
        />
        <form.Field
          name="password"
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={isInvalid}
                  autoComplete="off"
                  type="password"
                  required
                  className="bg-background"
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            )
          }}
        />
        <Field>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending && <Spinner />}
            {mutation.isPending ? "Logging in..." : "Login"}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  )
}
