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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useRentConfig } from "../../hooks"

const schema = z.object({
  rent_on: z.enum(["Q", "P", "W"]),
  rent_through: z.enum(["L", "B"]),
  rent_days: z.number().min(0),
})

type FormData = z.infer<typeof schema>

export function RentConfig() {
  const { config, loading, error, updateConfig } = useRentConfig()
  const [saving, setSaving] = React.useState(false)
  const [saveError, setSaveError] = React.useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = React.useState(false)

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      rent_on: "Q",
      rent_through: "L",
      rent_days: 0,
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
        <CardTitle>Rent Settings</CardTitle>
        <CardDescription>
          Configure how rent is calculated and processed
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {saveError && (
              <div data-testid="rent-error-message" className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                {saveError}
              </div>
            )}
            {saveSuccess && (
              <div data-testid="rent-success-message" className="text-sm text-green-600 bg-green-50 p-3 rounded-md">
                Settings saved successfully
              </div>
            )}

            <FormField
              control={form.control}
              name="rent_on"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Rent Calculation Basis</FormLabel>
                  <FormControl>
                    <RadioGroup
                      data-testid="rent-on-radio"
                      onValueChange={field.onChange}
                      value={field.value}
                      className="flex flex-col space-y-2"
                      disabled={saving}
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem data-testid="rent-on-Q" value="Q" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Per Quintal (Q) - Calculate rent based on weight in quintals
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem data-testid="rent-on-P" value="P" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Per Packet (P) - Calculate rent based on number of packets
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem data-testid="rent-on-W" value="W" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Per Weight (W) - Calculate rent based on exact weight
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="rent_through"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Rent Processing Mode</FormLabel>
                  <FormControl>
                    <RadioGroup
                      data-testid="rent-through-radio"
                      onValueChange={field.onChange}
                      value={field.value}
                      className="flex flex-col space-y-2"
                      disabled={saving}
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem data-testid="rent-through-L" value="L" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Through Ledger (L) - Post rent directly to party ledger
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem data-testid="rent-through-B" value="B" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Through Bill (B) - Generate rent bills for collection
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="rent_days"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Rent Days</FormLabel>
                  <FormControl>
                    <Input
                      data-testid="rent-days-input"
                      type="number"
                      min="0"
                      disabled={saving}
                      className="max-w-[200px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Extra days to add for rent calculation adjustment
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end pt-4">
              <Button data-testid="rent-submit-button" type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save Settings"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
