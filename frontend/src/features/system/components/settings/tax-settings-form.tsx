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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useTaxSettings } from "../../hooks"

const taxSchema = z.object({
  default_cgst: z.number().min(0).max(100),
  default_sgst: z.number().min(0).max(100),
  default_igst: z.number().min(0).max(100),
})

type TaxFormData = z.infer<typeof taxSchema>

export function TaxSettingsForm() {
  const { settings, loading, error, updateSettings } = useTaxSettings()
  const [saving, setSaving] = React.useState(false)
  const [saveError, setSaveError] = React.useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = React.useState(false)

  const form = useForm<TaxFormData>({
    resolver: zodResolver(taxSchema),
    defaultValues: {
      default_cgst: 9,
      default_sgst: 9,
      default_igst: 18,
    },
  })

  React.useEffect(() => {
    if (settings) {
      form.reset({
        default_cgst: settings.default_cgst,
        default_sgst: settings.default_sgst,
        default_igst: settings.default_igst,
      })
    }
  }, [settings, form])

  const onSubmit = async (data: TaxFormData) => {
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
    return <div className="text-muted-foreground">Loading tax settings...</div>
  }

  if (error) {
    return <div className="text-destructive">{error}</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Default Tax Rates</CardTitle>
        <CardDescription>
          Default GST rates applied to new transactions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {saveError && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                {saveError}
              </div>
            )}
            {saveSuccess && (
              <div className="text-sm text-green-600 bg-green-50 p-3 rounded-md">
                Tax settings saved successfully
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-3">
              <FormField
                control={form.control}
                name="default_cgst"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CGST Rate (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        disabled={saving}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>Central GST</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="default_sgst"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SGST Rate (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        disabled={saving}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>State GST</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="default_igst"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>IGST Rate (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        disabled={saving}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>Integrated GST</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save Tax Settings"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
