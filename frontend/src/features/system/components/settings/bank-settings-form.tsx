import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useBankSettings } from "../../hooks"

const bankSchema = z.object({
  bank_name: z.string().optional(),
  account_no: z.string().optional(),
  ifsc_code: z.string().optional(),
  branch: z.string().optional(),
})

type BankFormData = z.infer<typeof bankSchema>

export function BankSettingsForm() {
  const { settings, loading, error, updateSettings } = useBankSettings()
  const [saving, setSaving] = React.useState(false)
  const [saveError, setSaveError] = React.useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = React.useState(false)

  const form = useForm<BankFormData>({
    resolver: zodResolver(bankSchema),
    defaultValues: {
      bank_name: "",
      account_no: "",
      ifsc_code: "",
      branch: "",
    },
  })

  React.useEffect(() => {
    if (settings) {
      form.reset({
        bank_name: settings.bank_name || "",
        account_no: settings.account_no || "",
        ifsc_code: settings.ifsc_code || "",
        branch: settings.branch || "",
      })
    }
  }, [settings, form])

  const onSubmit = async (data: BankFormData) => {
    setSaving(true)
    setSaveError(null)
    setSaveSuccess(false)

    try {
      await updateSettings(data)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="text-muted-foreground">Loading bank settings...</div>
  }

  if (error) {
    return <div className="text-destructive">{error}</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bank Details</CardTitle>
        <CardDescription>
          Company bank account details for invoices and receipts
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {saveError && (
              <div data-testid="bank-error-message" className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                {saveError}
              </div>
            )}
            {saveSuccess && (
              <div data-testid="bank-success-message" className="text-sm text-green-600 bg-green-50 p-3 rounded-md">
                Bank settings saved successfully
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="bank_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bank Name</FormLabel>
                    <FormControl>
                      <Input data-testid="bank-name-input" placeholder="e.g., HDFC Bank" disabled={saving} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="branch"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Branch</FormLabel>
                    <FormControl>
                      <Input data-testid="bank-branch-input" placeholder="e.g., Agra Main" disabled={saving} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="account_no"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account Number</FormLabel>
                    <FormControl>
                      <Input data-testid="bank-account-input" placeholder="Account number" disabled={saving} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="ifsc_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>IFSC Code</FormLabel>
                    <FormControl>
                      <Input data-testid="bank-ifsc-input" placeholder="e.g., HDFC0001234" disabled={saving} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end">
              <Button data-testid="bank-submit-button" type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save Bank Details"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
