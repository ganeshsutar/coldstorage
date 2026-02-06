import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import { usersService } from "../../api/users"
import type { OrganizationUser } from "../../types"

const createUserSchema = z.object({
  email: z.string().email("Valid email required"),
  full_name: z.string().min(1, "Name is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  phone: z.string().optional(),
  role: z.enum(["ADMIN", "OPERATOR"]),
  loan_per_bag_limit: z.number().optional().nullable(),
  backdate_entry_limit: z.number().optional().nullable(),
})

const updateUserSchema = z.object({
  full_name: z.string().min(1, "Name is required"),
  phone: z.string().optional(),
  role: z.enum(["ADMIN", "OPERATOR"]),
  status: z.enum(["PENDING", "ACTIVE", "SUSPENDED"]),
  loan_per_bag_limit: z.number().optional().nullable(),
  backdate_entry_limit: z.number().optional().nullable(),
})

type CreateUserFormData = z.infer<typeof createUserSchema>
type UpdateUserFormData = z.infer<typeof updateUserSchema>

interface UserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  editUser?: OrganizationUser
}

export function UserDialog({
  open,
  onOpenChange,
  onSuccess,
  editUser,
}: UserDialogProps) {
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const isEdit = !!editUser

  const createForm = useForm<CreateUserFormData>({
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

  const updateForm = useForm<UpdateUserFormData>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      full_name: "",
      phone: "",
      role: "OPERATOR",
      status: "ACTIVE",
      loan_per_bag_limit: null,
      backdate_entry_limit: null,
    },
  })

  React.useEffect(() => {
    if (open) {
      setError(null)
      if (editUser) {
        updateForm.reset({
          full_name: editUser.user.full_name,
          phone: editUser.user.phone || "",
          role: editUser.role,
          status: editUser.status,
          loan_per_bag_limit: editUser.loan_per_bag_limit,
          backdate_entry_limit: editUser.backdate_entry_limit,
        })
      } else {
        createForm.reset({
          email: "",
          full_name: "",
          password: "",
          phone: "",
          role: "OPERATOR",
          loan_per_bag_limit: null,
          backdate_entry_limit: null,
        })
      }
    }
  }, [open, editUser, createForm, updateForm])

  const onCreateSubmit = async (data: CreateUserFormData) => {
    setLoading(true)
    setError(null)

    try {
      await usersService.createUser(data)
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create user")
    } finally {
      setLoading(false)
    }
  }

  const onUpdateSubmit = async (data: UpdateUserFormData) => {
    if (!editUser) return

    setLoading(true)
    setError(null)

    try {
      await usersService.updateUser(editUser.id, data)
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update user")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit User" : "Add User"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update user details and permissions"
              : "Create a new user account for your organization"}
          </DialogDescription>
        </DialogHeader>

        {isEdit ? (
          <Form {...updateForm}>
            <form
              onSubmit={updateForm.handleSubmit(onUpdateSubmit)}
              className="space-y-4"
            >
              {error && (
                <div data-testid="user-dialog-error-message" className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                  {error}
                </div>
              )}

              <FormField
                control={updateForm.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name *</FormLabel>
                    <FormControl>
                      <Input data-testid="user-dialog-edit-fullname-input" disabled={loading} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={updateForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input data-testid="user-dialog-edit-phone-input" disabled={loading} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={updateForm.control}
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
                          <SelectTrigger data-testid="user-dialog-edit-role-select">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="ADMIN">Admin</SelectItem>
                          <SelectItem value="OPERATOR">Operator</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={updateForm.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status *</FormLabel>
                      <Select
                        disabled={loading}
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger data-testid="user-dialog-edit-status-select">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="ACTIVE">Active</SelectItem>
                          <SelectItem value="PENDING">Pending</SelectItem>
                          <SelectItem value="SUSPENDED">Suspended</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={updateForm.control}
                  name="loan_per_bag_limit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Loan Per Bag Limit</FormLabel>
                      <FormControl>
                        <Input
                          data-testid="user-dialog-edit-loan-limit-input"
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
                  control={updateForm.control}
                  name="backdate_entry_limit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Backdate Limit (days)</FormLabel>
                      <FormControl>
                        <Input
                          data-testid="user-dialog-edit-backdate-limit-input"
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

              <DialogFooter>
                <Button
                  data-testid="user-dialog-cancel-button"
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button data-testid="user-dialog-submit-button" type="submit" disabled={loading}>
                  {loading ? "Saving..." : "Update User"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        ) : (
          <Form {...createForm}>
            <form
              onSubmit={createForm.handleSubmit(onCreateSubmit)}
              className="space-y-4"
            >
              {error && (
                <div data-testid="user-dialog-error-message" className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                  {error}
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={createForm.control}
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
                  control={createForm.control}
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
                  control={createForm.control}
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
                  control={createForm.control}
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
                control={createForm.control}
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
                        <SelectItem value="ADMIN">
                          Admin - Full system access
                        </SelectItem>
                        <SelectItem value="OPERATOR">
                          Operator - Data entry only
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={createForm.control}
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
                  control={createForm.control}
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

              <DialogFooter>
                <Button
                  data-testid="user-dialog-cancel-button"
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button data-testid="user-dialog-submit-button" type="submit" disabled={loading}>
                  {loading ? "Creating..." : "Create User"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  )
}
