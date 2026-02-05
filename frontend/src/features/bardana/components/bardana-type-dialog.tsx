import * as React from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
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
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { useCreateBardanaType, useUpdateBardanaType } from "../hooks"
import type { BardanaType } from "../types"

const formSchema = z.object({
  code: z.string().min(1, "Code is required").max(20),
  name: z.string().min(1, "Name is required").max(100),
  rate_per_unit: z.number().min(0, "Rate must be non-negative"),
  opening_stock: z.number().int().min(0, "Stock must be non-negative"),
  is_active: z.boolean(),
})

type FormValues = z.infer<typeof formSchema>

interface BardanaTypeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editType?: BardanaType | null
}

export function BardanaTypeDialog({ open, onOpenChange, editType }: BardanaTypeDialogProps) {
  const createMutation = useCreateBardanaType()
  const updateMutation = useUpdateBardanaType()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: "",
      name: "",
      rate_per_unit: 0,
      opening_stock: 0,
      is_active: true,
    },
  })

  React.useEffect(() => {
    if (editType) {
      form.reset({
        code: editType.code,
        name: editType.name,
        rate_per_unit: editType.rate_per_unit,
        opening_stock: editType.opening_stock,
        is_active: editType.is_active,
      })
    } else {
      form.reset({
        code: "",
        name: "",
        rate_per_unit: 0,
        opening_stock: 0,
        is_active: true,
      })
    }
  }, [editType, form])

  const onSubmit = async (values: FormValues) => {
    try {
      if (editType) {
        await updateMutation.mutateAsync({ id: editType.id, data: values })
      } else {
        await createMutation.mutateAsync(values)
      }
      onOpenChange(false)
    } catch {
      // Error handled by mutation
    }
  }

  const isSubmitting = createMutation.isPending || updateMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{editType ? "Edit" : "Add"} Bardana Type</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Code</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., JB" {...field} disabled={!!editType} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Jute Bag" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="rate_per_unit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rate per Unit</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" placeholder="0.00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="opening_stock"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Opening Stock</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="0" {...field} />
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
                  <FormLabel>Active</FormLabel>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : editType ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
