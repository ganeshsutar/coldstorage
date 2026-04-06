import * as React from "react"
import { useNavigate } from "@tanstack/react-router"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { ArrowLeftIcon } from "lucide-react"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { usersService } from "@/features/system/api/users"

const createUserSchema = z.object({
  email: z.string().email("Valid email required"),
  full_name: z.string().min(1, "Name is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  phone: z.string().optional(),
  role: z.enum(["ADMIN", "OPERATOR"]),
  loan_per_bag_limit: z.number().optional().nullable(),
  backdate_entry_limit: z.number().optional().nullable(),
})

type CreateUserFormData = z.infer<typeof createUserSchema>

export function NewUserPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const form = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      email: "",
      full_name: "",
      password: "",
      phone: "",
      role: "OPERATOR",
      loan_per_bag_limit: null,
      backdate_entry_limit: null,
    },
  })

  const onSubmit = async (data: CreateUserFormData) => {
    setLoading(true)
    setError(null)

    try {
      await usersService.createUser(data)
      navigate({ to: "/app/system/settings" })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create user")
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout activeNavItemId="settings" breadcrumbs={[{ label: "System", to: "/app/system/settings" }, { label: "New User" }]}>
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Go back"
            onClick={() => navigate({ to: "/app/system/settings" })}
            data-testid="new-user-back-button"
          >
            <ArrowLeftIcon className="size-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold" data-testid="new-user-title">New User</h1>
            <p className="text-sm text-muted-foreground">
              Create a new user account for your organization
            </p>
          </div>
        </div>

        {error && (
          <div className="text-sm text-destructive bg-destructive/10 p-4 rounded-md" data-testid="new-user-error">
            {error}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">
              User Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                noValidate
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
                data-testid="new-user-form"
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email *</FormLabel>
                        <FormControl>
                          <Input
                            data-testid="user-dialog-email-input"
                            type="email"
                            placeholder="user@example.com"
                            disabled={loading}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="full_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name *</FormLabel>
                        <FormControl>
                          <Input data-testid="user-dialog-fullname-input" disabled={loading} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password *</FormLabel>
                        <FormControl>
                          <Input data-testid="user-dialog-password-input" type="password" disabled={loading} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input data-testid="user-dialog-phone-input" disabled={loading} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role *</FormLabel>
                      <Select
                        disabled={loading}
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger data-testid="user-dialog-role-select">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="ADMIN">Admin - Full system access</SelectItem>
                          <SelectItem value="OPERATOR">Operator - Data entry only</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="loan_per_bag_limit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Loan Per Bag Limit</FormLabel>
                        <FormControl>
                          <Input
                            data-testid="user-dialog-loan-limit-input"
                            type="number"
                            placeholder="Rs"
                            disabled={loading}
                            {...field}
                            value={field.value ?? ""}
                          />
                        </FormControl>
                        <FormDescription>Max loan amount per bag</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="backdate_entry_limit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Backdate Limit (days)</FormLabel>
                        <FormControl>
                          <Input
                            data-testid="user-dialog-backdate-limit-input"
                            type="number"
                            placeholder="Days"
                            disabled={loading}
                            {...field}
                            value={field.value ?? ""}
                          />
                        </FormControl>
                        <FormDescription>Days allowed for backdating</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end gap-4 pt-4">
                  <Button
                    data-testid="user-dialog-cancel-button"
                    type="button"
                    variant="outline"
                    onClick={() => navigate({ to: "/app/system/settings" })}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button data-testid="user-dialog-submit-button" type="submit" disabled={loading}>
                    {loading ? "Creating..." : "Create User"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
