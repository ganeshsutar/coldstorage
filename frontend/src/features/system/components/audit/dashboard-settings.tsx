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
import { useDashboardSettings } from "../../hooks"

const schema = z.object({
  show_summary_inward: z.boolean(),
  show_bag_grading: z.boolean(),
  show_pending_dues: z.boolean(),
  show_low_stock_alert: z.boolean(),
  show_chamber_occupancy: z.boolean(),
  show_recent_transactions: z.boolean(),
  show_todays_collections: z.boolean(),
  print_takpatti: z.boolean(),
  print_gate_pass: z.boolean(),
  print_receipt: z.boolean(),
  auto_print_rent_bill: z.boolean(),
  default_date_range: z.number().min(1).max(365),
  auto_refresh_interval: z.number().min(1).max(60),
  default_page_size: z.number().min(10).max(100),
})

type FormData = z.infer<typeof schema>

export function DashboardSettingsForm() {
  const { settings, loading, error, updateSettings } = useDashboardSettings()
  const [saving, setSaving] = React.useState(false)
  const [saveError, setSaveError] = React.useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = React.useState(false)

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      show_summary_inward: true,
      show_bag_grading: true,
      show_pending_dues: true,
      show_low_stock_alert: true,
      show_chamber_occupancy: true,
      show_recent_transactions: true,
      show_todays_collections: false,
      print_takpatti: false,
      print_gate_pass: true,
      print_receipt: true,
      auto_print_rent_bill: false,
      default_date_range: 30,
      auto_refresh_interval: 5,
      default_page_size: 20,
    },
  })

  React.useEffect(() => {
    if (settings) {
      form.reset(settings)
    }
  }, [settings, form])

  const onSubmit = async (data: FormData) => {
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
    return <div className="text-muted-foreground">Loading settings...</div>
  }

  if (error) {
    return <div className="text-destructive">{error}</div>
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {saveError && (
          <div data-testid="dashboard-error-message" className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
            {saveError}
          </div>
        )}
        {saveSuccess && (
          <div data-testid="dashboard-success-message" className="text-sm text-green-600 bg-green-50 p-3 rounded-md">
            Settings saved successfully
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Display Settings</CardTitle>
            <CardDescription>
              Configure which widgets to show on the dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="show_summary_inward"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Show Summary Inward</FormLabel>
                    <FormDescription>Display inward summary widget</FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      data-testid="dashboard-show-summary-inward-switch"
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
              name="show_bag_grading"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Show Bag Grading Summary</FormLabel>
                    <FormDescription>Display bag grading statistics</FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      data-testid="dashboard-show-bag-grading-switch"
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
              name="show_pending_dues"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Show Pending Dues</FormLabel>
                    <FormDescription>Display pending dues widget</FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      data-testid="dashboard-show-pending-dues-switch"
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
              name="show_low_stock_alert"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Show Low Stock Alerts</FormLabel>
                    <FormDescription>Display low stock warnings</FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      data-testid="dashboard-show-low-stock-switch"
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
              name="show_chamber_occupancy"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Show Chamber Occupancy</FormLabel>
                    <FormDescription>Display chamber occupancy stats</FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      data-testid="dashboard-show-chamber-occupancy-switch"
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
              name="show_recent_transactions"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Show Recent Transactions</FormLabel>
                    <FormDescription>Display recent transaction list</FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      data-testid="dashboard-show-recent-transactions-switch"
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
              name="show_todays_collections"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Show Today's Collections</FormLabel>
                    <FormDescription>Display today's collection summary</FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      data-testid="dashboard-show-todays-collections-switch"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={saving}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Print Settings</CardTitle>
            <CardDescription>
              Configure automatic print behavior
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="print_takpatti"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Print Takpatti on Save</FormLabel>
                    <FormDescription>Auto-print takpatti when saved</FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      data-testid="dashboard-print-takpatti-switch"
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
              name="print_gate_pass"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Print Gate Pass on Save</FormLabel>
                    <FormDescription>Auto-print gate pass when saved</FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      data-testid="dashboard-print-gate-pass-switch"
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
              name="print_receipt"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Print Receipt on Save</FormLabel>
                    <FormDescription>Auto-print receipt when saved</FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      data-testid="dashboard-print-receipt-switch"
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
              name="auto_print_rent_bill"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Auto-print Rent Bill</FormLabel>
                    <FormDescription>Auto-print rent bills when created</FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      data-testid="dashboard-auto-print-rent-bill-switch"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={saving}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Default Values</CardTitle>
            <CardDescription>
              Configure default values for lists and displays
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <FormField
                control={form.control}
                name="default_date_range"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Default Date Range (days)</FormLabel>
                    <FormControl>
                      <Input
                        data-testid="dashboard-date-range-input"
                        type="number"
                        min="1"
                        max="365"
                        disabled={saving}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>Days to show in lists</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="auto_refresh_interval"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Auto-refresh (minutes)</FormLabel>
                    <FormControl>
                      <Input
                        data-testid="dashboard-refresh-interval-input"
                        type="number"
                        min="1"
                        max="60"
                        disabled={saving}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>Dashboard refresh interval</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="default_page_size"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Default Page Size</FormLabel>
                    <FormControl>
                      <Input
                        data-testid="dashboard-page-size-input"
                        type="number"
                        min="10"
                        max="100"
                        disabled={saving}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>Items per page in lists</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button data-testid="dashboard-submit-button" type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
