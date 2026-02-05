import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
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
import { useInterestConfig } from "../../hooks"

const schema = z.object({
  interest_rate: z.number().min(0).max(100),
  days_in_year: z.number().min(1).max(366),
  calculate_interest: z.boolean(),
  interest_on_rent: z.boolean(),
  interest_on_loan: z.boolean(),
  interest_on_bardana: z.boolean(),
})

type FormData = z.infer<typeof schema>

export function InterestConfig() {
  const { config, loading, error, updateConfig } = useInterestConfig()
  const [saving, setSaving] = React.useState(false)
  const [saveError, setSaveError] = React.useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = React.useState(false)

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      interest_rate: 1.5,
      days_in_year: 360,
      calculate_interest: true,
      interest_on_rent: true,
      interest_on_loan: true,
      interest_on_bardana: true,
    },
  })

  React.useEffect(() => {
    if (config) {
      form.reset(config)
    }
  }, [config, form])

  const onSubmit = async (data: FormData) => {
    setSaving(true)
    setSaveError(null)
    setSaveSuccess(false)

    try {
      await updateConfig(data)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="text-muted-foreground">Loading configuration...</div>
  }

  if (error) {
    return <div className="text-destructive">{error}</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Interest Settings</CardTitle>
        <CardDescription>
          Configure interest calculation parameters
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {saveError && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                {saveError}
              </div>
            )}
            {saveSuccess && (
              <div className="text-sm text-green-600 bg-green-50 p-3 rounded-md">
                Settings saved successfully
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="interest_rate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Interest Rate (% per month)</FormLabel>
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
                    <FormDescription>Monthly interest rate</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="days_in_year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Days in Year</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        max="366"
                        disabled={saving}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>Days used for annual calculation (typically 360 or 365)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4 pt-4">
              <FormField
                control={form.control}
                name="calculate_interest"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Auto Calculate Interest</FormLabel>
                      <FormDescription>
                        Automatically calculate interest on dues
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={saving}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="text-sm font-medium pt-2">Apply Interest On</div>

              <FormField
                control={form.control}
                name="interest_on_rent"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Rent</FormLabel>
                      <FormDescription>
                        Apply interest on unpaid rent
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={saving}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="interest_on_loan"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Loans</FormLabel>
                      <FormDescription>
                        Apply interest on outstanding loans
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={saving}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="interest_on_bardana"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Bardana</FormLabel>
                      <FormDescription>
                        Apply interest on bardana dues
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={saving}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save Settings"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
