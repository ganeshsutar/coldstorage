import { useNavigate } from "@tanstack/react-router"
import { useForm, useFieldArray, useWatch } from "react-hook-form"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useCreateBardanaReturn, useBardanaTypes } from "../hooks"
import type { BardanaCondition } from "../types"

const itemSchema = z.object({
  bardana_type_id: z.string().min(1, "Select a type"),
  qty: z.number().int().min(1, "Qty must be at least 1"),
  rate: z.number().min(0),
  condition: z.enum(["GOOD", "FAIR", "DAMAGED"] as const),
})

const formSchema = z.object({
  date: z.string().min(1, "Date is required"),
  party_id: z.string().min(1, "Party is required"),
  remarks: z.string().optional(),
  items: z.array(itemSchema).min(1, "At least one item is required"),
})

type FormValues = z.infer<typeof formSchema>

interface BardanaReturnFormProps {
  accounts?: { id: string; code: string; name: string }[]
}

export function BardanaReturnForm({ accounts = [] }: BardanaReturnFormProps) {
  const navigate = useNavigate()
  const createMutation = useCreateBardanaReturn()
  const { data: bardanaTypes = [] } = useBardanaTypes()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      party_id: "",
      remarks: "",
      items: [{ bardana_type_id: "", qty: 0, rate: 0, condition: "GOOD" as BardanaCondition }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  })

  const watchedItems = useWatch({ control: form.control, name: "items" })

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
        items: values.items.map((item) => ({
          bardana_type_id: item.bardana_type_id,
          qty: item.qty,
          rate: item.rate,
          condition: item.condition,
        })),
      })
      navigate({ to: "/app/bardana/returns" })
    } catch {
      // Error handled by mutation
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">New Bardana Return</h2>
        <p className="text-muted-foreground">Record bardana returned by a party</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Return Details</CardTitle>
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
                onClick={() =>
                  append({
                    bardana_type_id: "",
                    qty: 0,
                    rate: 0,
                    condition: "GOOD" as BardanaCondition,
                  })
                }
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
                    <FormField
                      control={form.control}
                      name={`items.${index}.condition`}
                      render={({ field: condField }) => (
                        <FormItem className="w-32">
                          {index === 0 && <FormLabel>Condition</FormLabel>}
                          <Select onValueChange={condField.onChange} value={condField.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="GOOD">Good</SelectItem>
                              <SelectItem value="FAIR">Fair</SelectItem>
                              <SelectItem value="DAMAGED">Damaged</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="w-24 text-right font-mono pb-2">
                      {index === 0 && (
                        <p className="text-sm font-medium mb-2">Amount</p>
                      )}
                      {(
                        (watchedItems?.[index]?.qty || 0) *
                        (watchedItems?.[index]?.rate || 0)
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

          <div className="flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate({ to: "/app/bardana/returns" })}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Creating..." : "Create Return"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
