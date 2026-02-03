import * as React from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { accountsService } from "../../api/accounts"
import type { Account, AccountType, AccountCategory } from "../../types/account"

const accountSchema = z.object({
  code: z.string().min(1, "Code is required"),
  name: z.string().min(1, "Name is required"),
  type: z.enum(["asset", "liability", "income", "expense", "equity"]),
  category: z.enum(["balance_sheet", "trading", "profit_loss"]),
  parent_id: z.string().nullable(),
})

type AccountFormData = z.infer<typeof accountSchema>

interface AddAccountDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  parentAccounts: Account[]
  onSuccess?: () => void
}

export function AddAccountDialog({
  open,
  onOpenChange,
  parentAccounts,
  onSuccess,
}: AddAccountDialogProps) {
  const [loading, setLoading] = React.useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
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

  const onSubmit = async (data: AccountFormData) => {
    try {
      setLoading(true)
      await accountsService.createAccount({
        ...data,
        is_party: false,
      })
      reset()
      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      console.error("Failed to create account:", error)
    } finally {
      setLoading(false)
    }
  }

  const groupAccounts = parentAccounts.filter((a) => a.is_group)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Account</DialogTitle>
          <DialogDescription>
            Create a new account in the chart of accounts.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code">Account Code</Label>
            <Input
              id="code"
              {...register("code")}
              placeholder="e.g., 1001"
            />
            {errors.code && (
              <p className="text-sm text-destructive">{errors.code.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Account Name</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="e.g., Cash in Hand"
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Account Type</Label>
            <Select
              value={accountType}
              onValueChange={(value: AccountType) => setValue("type", value)}
            >
              <SelectTrigger>
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
              onValueChange={(value: AccountCategory) =>
                setValue("category", value)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="balance_sheet">Balance Sheet</SelectItem>
                <SelectItem value="trading">Trading</SelectItem>
                <SelectItem value="profit_loss">Profit & Loss</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Parent Account</Label>
            <Select
              value={watch("parent_id") || "none"}
              onValueChange={(value) =>
                setValue("parent_id", value === "none" ? null : value)
              }
            >
              <SelectTrigger>
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

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Account"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
