import { useNavigate } from "@tanstack/react-router"
import { useForm, useFieldArray } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useCreateBardanaIssue, useBardanaTypes } from "../hooks"

const itemSchema = z.object({
  bardana_type_id: z.string().min(1, "Select a type"),
  qty: z.number().int().min(1, "Qty must be at least 1"),
  rate: z.number().min(0),
})

const formSchema = z.object({
  date: z.string().min(1, "Date is required"),
  party_id: z.string().min(1, "Party is required"),
  remarks: z.string().optional(),
  is_advance: z.boolean(),
  interest_rate_pm: z.number().min(0).optional(),
  expected_arrival_date: z.string().optional(),
  expected_bags: z.number().int().min(0).optional(),
  reference_no: z.string().optional(),
  items: z.array(itemSchema).min(1, "At least one item is required"),
})

type FormValues = z.infer<typeof formSchema>

interface BardanaIssueFormProps {
  accounts?: { id: string; code: string; name: string }[]
}

export function BardanaIssueForm({ accounts = [] }: BardanaIssueFormProps) {
  const navigate = useNavigate()
  const createMutation = useCreateBardanaIssue()
  const { data: bardanaTypes = [] } = useBardanaTypes()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      party_id: "",
      remarks: "",
      is_advance: false,
      interest_rate_pm: 0,
      expected_arrival_date: "",
      expected_bags: 0,
      reference_no: "",
      items: [{ bardana_type_id: "", qty: 0, rate: 0 }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  })

  const isAdvance = form.watch("is_advance")

  const handleTypeChange = (index: number, typeId: string) => {
    const type = bardanaTypes.find((t) => t.id === typeId)
    if (type) {
      form.setValue(`items.${index}.rate`, type.rate_per_unit)
    }
  }

  const onSubmit = async (values: FormValues) => {
    try {
      await createMutation.mutateAsync({
        date: values.date,
        party_id: values.party_id,
        remarks: values.remarks,
        is_advance: values.is_advance,
        interest_rate_pm: values.interest_rate_pm,
        expected_arrival_date: values.expected_arrival_date || undefined,
        expected_bags: values.expected_bags || undefined,
        reference_no: values.reference_no,
        items: values.items.map((item) => ({
          bardana_type_id: item.bardana_type_id,
          qty: item.qty,
          rate: item.rate,
        })),
      })
      navigate({ to: "/app/bardana/issues" })
    } catch {
      // Error handled by mutation
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">New Bardana Issue</h2>
        <p className="text-muted-foreground">Issue bardana to a party</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Issue Details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="party_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Party</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select party" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {accounts.map((acc) => (
                          <SelectItem key={acc.id} value={acc.id}>
                            {acc.code} - {acc.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="reference_no"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reference No</FormLabel>
                    <FormControl>
                      <Input placeholder="Optional reference" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="remarks"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Remarks</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Optional remarks" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Items</CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ bardana_type_id: "", qty: 0, rate: 0 })}
              >
                <Plus className="mr-1 h-4 w-4" />
                Add Item
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex items-end gap-3">
                    <FormField
                      control={form.control}
                      name={`items.${index}.bardana_type_id`}
                      render={({ field: typeField }) => (
                        <FormItem className="flex-1">
                          {index === 0 && <FormLabel>Type</FormLabel>}
                          <Select
                            onValueChange={(val) => {
                              typeField.onChange(val)
                              handleTypeChange(index, val)
                            }}
                            value={typeField.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {bardanaTypes
                                .filter((t) => t.is_active)
                                .map((t) => (
                                  <SelectItem key={t.id} value={t.id}>
                                    {t.code} - {t.name}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`items.${index}.qty`}
                      render={({ field: qtyField }) => (
                        <FormItem className="w-24">
                          {index === 0 && <FormLabel>Qty</FormLabel>}
                          <FormControl>
                            <Input type="number" {...qtyField} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`items.${index}.rate`}
                      render={({ field: rateField }) => (
                        <FormItem className="w-28">
                          {index === 0 && <FormLabel>Rate</FormLabel>}
                          <FormControl>
                            <Input type="number" step="0.01" {...rateField} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="w-28 text-right font-mono pb-2">
                      {index === 0 && (
                        <p className="text-sm font-medium mb-2">Amount</p>
                      )}
                      {(
                        (form.watch(`items.${index}.qty`) || 0) *
                        (form.watch(`items.${index}.rate`) || 0)
                      ).toFixed(2)}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(index)}
                      disabled={fields.length === 1}
                      className="mb-0.5"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <span>Advance Details</span>
                <FormField
                  control={form.control}
                  name="is_advance"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardTitle>
            </CardHeader>
            {isAdvance && (
              <CardContent className="grid gap-4 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="interest_rate_pm"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Interest Rate (% p.m.)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="expected_arrival_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expected Arrival Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="expected_bags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expected Bags</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            )}
          </Card>

          <div className="flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate({ to: "/app/bardana/issues" })}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Creating..." : "Create Issue"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
