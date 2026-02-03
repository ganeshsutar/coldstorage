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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useFinancialYearSettings } from "../../hooks"

const MONTHS = [
  { value: "1", label: "January" },
  { value: "2", label: "February" },
  { value: "3", label: "March" },
  { value: "4", label: "April" },
  { value: "5", label: "May" },
  { value: "6", label: "June" },
  { value: "7", label: "July" },
  { value: "8", label: "August" },
  { value: "9", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
]

const fySchema = z.object({
  financial_year_start: z.coerce.number().min(1).max(12),
  current_year: z.string().optional(),
  from_date: z.string().optional(),
  to_date: z.string().optional(),
})

type FYFormData = z.infer<typeof fySchema>

export function FinancialYearForm() {
  const { settings, loading, error, updateSettings } = useFinancialYearSettings()
  const [saving, setSaving] = React.useState(false)
  const [saveError, setSaveError] = React.useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = React.useState(false)

  const form = useForm<FYFormData>({
    resolver: zodResolver(fySchema),
    defaultValues: {
      financial_year_start: 4,
      current_year: "",
      from_date: "",
      to_date: "",
    },
  })

  React.useEffect(() => {
    if (settings) {
      form.reset({
        financial_year_start: settings.financial_year_start,
        current_year: settings.current_year || "",
        from_date: settings.from_date || "",
        to_date: settings.to_date || "",
      })
    }
  }, [settings, form])

  const onSubmit = async (data: FYFormData) => {
    setSaving(true)
    setSaveError(null)
    setSaveSuccess(false)

    try {
      await updateSettings({
        ...data,
        from_date: data.from_date || null,
        to_date: data.to_date || null,
      })
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="text-muted-foreground">Loading financial year settings...</div>
  }

  if (error) {
    return <div className="text-destructive">{error}</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Financial Year</CardTitle>
        <CardDescription>
          Configure the financial year period
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
                Financial year settings saved successfully
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="financial_year_start"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>FY Start Month</FormLabel>
                    <Select
                      disabled={saving}
                      value={String(field.value)}
                      onValueChange={(value) => field.onChange(Number(value))}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select month" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {MONTHS.map((month) => (
                          <SelectItem key={month.value} value={month.value}>
                            {month.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>Month when financial year starts</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="current_year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Year Label</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 2024-25" disabled={saving} {...field} />
                    </FormControl>
                    <FormDescription>Display label for current FY</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="from_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>From Date</FormLabel>
                    <FormControl>
                      <Input type="date" disabled={saving} {...field} />
                    </FormControl>
                    <FormDescription>Start date of current FY</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="to_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>To Date</FormLabel>
                    <FormControl>
                      <Input type="date" disabled={saving} {...field} />
                    </FormControl>
                    <FormDescription>End date of current FY</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save Financial Year Settings"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
