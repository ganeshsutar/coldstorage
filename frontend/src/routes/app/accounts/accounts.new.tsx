import * as React from "react"
import { useNavigate } from "@tanstack/react-router"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeftIcon } from "lucide-react"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { accountsService } from "@/features/accounting/api/accounts"
import { useAccounts } from "@/features/accounting"
import type { AccountType, AccountCategory } from "@/features/accounting"

const accountSchema = z.object({
  code: z.string().min(1, "Code is required"),
  name: z.string().min(1, "Name is required"),
  type: z.enum(["asset", "liability", "income", "expense", "equity"]),
  category: z.enum(["balance_sheet", "trading", "profit_loss"]),
  parent_id: z.string().nullable(),
})

type AccountFormData = z.infer<typeof accountSchema>

export function NewAccountPage() {
  const navigate = useNavigate()
  const { accounts } = useAccounts()
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AccountFormData>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      code: "",
      name: "",
      type: "asset",
      category: "balance_sheet",
      parent_id: null,
    },
  })

  const accountType = watch("type")
  const groupAccounts = accounts.filter((a) => a.account_type === "GROUP")

  const onSubmit = async (data: AccountFormData) => {
    setLoading(true)
    setError(null)

    try {
      await accountsService.createAccount({
        ...data,
        is_party: false,
      })
      navigate({ to: "/app/accounts/chart-of-accounts" })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create account")
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout activeNavItemId="chart-of-accounts" breadcrumbs={[{ label: "Accounts", to: "/app/accounts/chart-of-accounts" }, { label: "New Account" }]}>
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Go back"
            onClick={() => navigate({ to: "/app/accounts/chart-of-accounts" })}
            data-testid="new-account-back-button"
          >
            <ArrowLeftIcon className="size-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold" data-testid="new-account-title">New Account</h1>
            <p className="text-sm text-muted-foreground">
              Create a new account in the chart of accounts
            </p>
          </div>
        </div>

        {error && (
          <div className="text-sm text-destructive bg-destructive/10 p-4 rounded-md" data-testid="new-account-error">
            {error}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">
              Account Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" data-testid="new-account-form">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Account Code</Label>
                  <Input
                    id="code"
                    data-testid="add-account-code-input"
                    {...register("code")}
                    placeholder="e.g., 1001"
                    disabled={loading}
                  />
                  {errors.code && (
                    <p data-testid="add-account-code-error" className="text-sm text-destructive">{errors.code.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Account Name</Label>
                  <Input
                    id="name"
                    data-testid="add-account-name-input"
                    {...register("name")}
                    placeholder="e.g., Cash in Hand"
                    disabled={loading}
                  />
                  {errors.name && (
                    <p data-testid="add-account-name-error" className="text-sm text-destructive">{errors.name.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Account Type</Label>
                  <Select
                    value={accountType}
                    onValueChange={(value: AccountType) => setValue("type", value)}
                    disabled={loading}
                  >
                    <SelectTrigger data-testid="add-account-type-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asset">Asset</SelectItem>
                      <SelectItem value="liability">Liability</SelectItem>
                      <SelectItem value="income">Income</SelectItem>
                      <SelectItem value="expense">Expense</SelectItem>
                      <SelectItem value="equity">Equity</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={watch("category")}
                    onValueChange={(value: AccountCategory) => setValue("category", value)}
                    disabled={loading}
                  >
                    <SelectTrigger data-testid="add-account-category-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="balance_sheet">Balance Sheet</SelectItem>
                      <SelectItem value="trading">Trading</SelectItem>
                      <SelectItem value="profit_loss">Profit & Loss</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Parent Account</Label>
                <Select
                  value={watch("parent_id") || "none"}
                  onValueChange={(value) => setValue("parent_id", value === "none" ? null : value)}
                  disabled={loading}
                >
                  <SelectTrigger data-testid="add-account-parent-select">
                    <SelectValue placeholder="Select parent account" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Parent (Root Level)</SelectItem>
                    {groupAccounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.code} - {account.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  data-testid="add-account-cancel-button"
                  onClick={() => navigate({ to: "/app/accounts/chart-of-accounts" })}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button type="submit" data-testid="add-account-submit-button" disabled={loading}>
                  {loading ? "Creating..." : "Create Account"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
