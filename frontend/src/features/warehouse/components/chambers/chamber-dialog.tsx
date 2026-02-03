import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import type { Room, CreateRoomRequest } from "@/features/inventory/types/masters"

const chamberSchema = z.object({
  number: z.string().min(1, "Room number is required"),
  name: z.string().optional(),
  name_hindi: z.string().optional(),
  floor_count: z.coerce.number().int().min(1, "At least 1 floor required"),
  rack_count: z.coerce.number().int().min(0).optional(),
  racks_per_row: z.coerce.number().int().min(1).optional(),
  capacity_quintals: z.coerce.number().min(0).optional(),
  is_sugar_free: z.boolean().optional(),
  target_temperature: z.coerce.number().optional().nullable(),
  min_temperature: z.coerce.number().optional().nullable(),
  max_temperature: z.coerce.number().optional().nullable(),
  is_active: z.boolean().optional(),
})

type ChamberFormValues = z.infer<typeof chamberSchema>

interface ChamberDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  chamber?: Room | null
  suggestedNumber?: string
  onSubmit: (data: CreateRoomRequest) => Promise<void>
}

export function ChamberDialog({
  open,
  onOpenChange,
  chamber,
  suggestedNumber,
  onSubmit,
}: ChamberDialogProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const isEditing = !!chamber

  const form = useForm<ChamberFormValues>({
    resolver: zodResolver(chamberSchema),
    defaultValues: {
      number: "",
      name: "",
      name_hindi: "",
      floor_count: 1,
      rack_count: 0,
      racks_per_row: 10,
      capacity_quintals: 0,
      is_sugar_free: false,
      target_temperature: null,
      min_temperature: null,
      max_temperature: null,
      is_active: true,
    },
  })

  // Reset form when chamber changes or dialog opens
  React.useEffect(() => {
    if (open) {
      if (chamber) {
        form.reset({
          number: chamber.number,
          name: chamber.name || "",
          name_hindi: chamber.name_hindi || "",
          floor_count: chamber.floor_count,
          rack_count: chamber.rack_count || 0,
          racks_per_row: chamber.racks_per_row || 10,
          capacity_quintals: chamber.capacity_quintals || 0,
          is_sugar_free: chamber.is_sugar_free || false,
          target_temperature: chamber.target_temperature,
          min_temperature: chamber.min_temperature,
          max_temperature: chamber.max_temperature,
          is_active: chamber.is_active,
        })
      } else {
        form.reset({
          number: suggestedNumber || "",
          name: "",
          name_hindi: "",
          floor_count: 1,
          rack_count: 0,
          racks_per_row: 10,
          capacity_quintals: 0,
          is_sugar_free: false,
          target_temperature: null,
          min_temperature: null,
          max_temperature: null,
          is_active: true,
        })
      }
    }
  }, [open, chamber, suggestedNumber, form])

  const handleSubmit = async (values: ChamberFormValues) => {
    setIsSubmitting(true)
    try {
      const data: CreateRoomRequest = {
        number: values.number,
        name: values.name || undefined,
        name_hindi: values.name_hindi || undefined,
        floor_count: values.floor_count,
        rack_count: values.rack_count || 0,
        racks_per_row: values.racks_per_row || 10,
        capacity_quintals: values.capacity_quintals || 0,
        is_sugar_free: values.is_sugar_free || false,
        target_temperature: values.target_temperature || null,
        min_temperature: values.min_temperature || null,
        max_temperature: values.max_temperature || null,
        is_active: values.is_active ?? true,
      }
      await onSubmit(data)
      onOpenChange(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Chamber" : "Add Chamber"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the chamber configuration."
              : "Create a new chamber/room for the cold storage."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* Identity Section */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-muted-foreground">
                Identity
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Room Number</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 1, A1" {...field} />
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
                      <FormLabel>Name (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Main Storage" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name_hindi"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name (Hindi)</FormLabel>
                      <FormControl>
                        <Input placeholder="Hindi name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="is_active"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-3 mt-2">
                      <div className="space-y-0.5">
                        <FormLabel>Active</FormLabel>
                        <FormDescription className="text-xs">
                          Chamber is operational
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* Configuration Section */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-muted-foreground">
                Configuration
              </h4>
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="floor_count"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Floors</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value) || 1)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="rack_count"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Racks</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value) || 0)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="racks_per_row"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Racks/Row</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value) || 10)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="capacity_quintals"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Capacity (Quintals)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          step="0.01"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value) || 0)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="is_sugar_free"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-3 mt-2">
                      <div className="space-y-0.5">
                        <FormLabel>Sugar-Free</FormLabel>
                        <FormDescription className="text-xs">
                          For sugar-free storage
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* Temperature Section */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-muted-foreground">
                Temperature Settings (Optional)
              </h4>
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="target_temperature"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target (°C)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="-"
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value ? parseFloat(e.target.value) : null
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="min_temperature"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Min (°C)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="-"
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value ? parseFloat(e.target.value) : null
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="max_temperature"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max (°C)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="-"
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value ? parseFloat(e.target.value) : null
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? "Saving..."
                  : isEditing
                    ? "Update Chamber"
                    : "Create Chamber"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
