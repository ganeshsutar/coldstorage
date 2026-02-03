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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Switch } from "@/components/ui/switch"
import { bankService } from "../../api/banks"
import type { Bank, CreateBankRequest } from "../../types"

const bankSchema = z.object({
  code: z.string().min(1, "Code is required").max(20),
  name: z.string().min(1, "Name is required").max(255),
  ifsc_pattern: z.string().optional(),
  is_active: z.boolean(),
})

type BankFormData = z.infer<typeof bankSchema>

interface BankDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  editBank?: Bank
}

export function BankDialog({
  open,
  onOpenChange,
  onSuccess,
  editBank,
}: BankDialogProps) {
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const form = useForm<BankFormData>({
    resolver: zodResolver(bankSchema),
    defaultValues: {
      code: "",
      name: "",
      ifsc_pattern: "",
      is_active: true,
    },
  })

  React.useEffect(() => {
    if (open) {
      if (editBank) {
        form.reset({
          code: editBank.code,
          name: editBank.name,
          ifsc_pattern: editBank.ifsc_pattern || "",
          is_active: editBank.is_active,
        })
      } else {
        form.reset({
          code: "",
          name: "",
          ifsc_pattern: "",
          is_active: true,
        })
      }
      setError(null)
    }
  }, [open, editBank, form])

  const onSubmit = async (data: BankFormData) => {
    setLoading(true)
    setError(null)

    try {
      if (editBank) {
        await bankService.updateBank(editBank.id, data)
      } else {
        await bankService.createBank(data as CreateBankRequest)
      }
      onSuccess()
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save bank")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {editBank ? "Edit Bank" : "Add Bank"}
          </DialogTitle>
          <DialogDescription>
            {editBank
              ? "Update bank details"
              : "Create a new bank for receipt tracking"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                {error}
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Code</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., SBI"
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
                name="ifsc_pattern"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>IFSC Pattern</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., SBIN"
                        disabled={loading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bank Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., State Bank of India"
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
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Active</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Inactive banks won't appear in selection lists
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={loading}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : editBank ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
