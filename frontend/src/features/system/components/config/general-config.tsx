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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useGeneralConfig } from "../../hooks"

const schema = z.object({
  software_mode: z.enum(["S", "A"]),
  multi_chamber: z.boolean(),
  partial_lot: z.boolean(),
  map_required: z.boolean(),
  separate_voucher_numbers: z.boolean(),
  marka_on: z.enum(["L", "P"]),
  rack_quantity: z.number().min(0),
})

type FormData = z.infer<typeof schema>

export function GeneralConfig() {
  const { config, loading, error, updateConfig } = useGeneralConfig()
  const [saving, setSaving] = React.useState(false)
  const [saveError, setSaveError] = React.useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = React.useState(false)

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      software_mode: "S",
      multi_chamber: true,
      partial_lot: true,
      map_required: false,
      separate_voucher_numbers: true,
      marka_on: "L",
      rack_quantity: 500,
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
        <CardTitle>General Settings</CardTitle>
        <CardDescription>
          Configure general system behavior
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {saveError && (
              <div data-testid="general-error-message" className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                {saveError}
              </div>
            )}
            {saveSuccess && (
              <div data-testid="general-success-message" className="text-sm text-status-success-foreground bg-status-success-muted p-3 rounded-md">
                Settings saved successfully
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="software_mode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Software Mode</FormLabel>
                    <Select
                      disabled={saving}
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger data-testid="general-software-mode-select">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="S">Standard</SelectItem>
                        <SelectItem value="A">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>Basic or advanced features</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="marka_on"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Marka (Mark) On</FormLabel>
                    <Select
                      disabled={saving}
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger data-testid="general-marka-on-select">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="L">Lot</SelectItem>
                        <SelectItem value="P">Packet</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>How marks are tracked</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="rack_quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rack Capacity</FormLabel>
                  <FormControl>
                    <Input
                      data-testid="general-rack-quantity-input"
                      type="number"
                      min="0"
                      disabled={saving}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Default capacity per rack</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4 pt-4">
              <FormField
                control={form.control}
                name="multi_chamber"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Multi-Chamber Support</FormLabel>
                      <FormDescription>
                        Enable multiple chamber management
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        data-testid="general-multi-chamber-switch"
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
                name="partial_lot"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Partial Lot Dispatch</FormLabel>
                      <FormDescription>
                        Allow dispatching partial lots
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        data-testid="general-partial-lot-switch"
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
                name="map_required"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Map Required</FormLabel>
                      <FormDescription>
                        Enforce room mapping for all entries
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        data-testid="general-map-required-switch"
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
                name="separate_voucher_numbers"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Separate Voucher Numbers</FormLabel>
                      <FormDescription>
                        Use separate numbering for each voucher type
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        data-testid="general-separate-voucher-switch"
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
              <Button data-testid="general-submit-button" type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save Settings"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
