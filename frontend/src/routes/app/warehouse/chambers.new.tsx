import * as React from "react"
import { useNavigate } from "@tanstack/react-router"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { ArrowLeftIcon } from "lucide-react"
import { toast } from "sonner"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useRooms, roomService } from "@/features/inventory"
import { getNextRoomNumber } from "@/features/warehouse/utils/floor-utils"
import type { CreateRoomRequest } from "@/features/inventory/types/masters"

const chamberSchema = z.object({
  number: z.string().min(1, "Room number is required"),
  name: z.string().optional(),
  name_hindi: z.string().optional(),
  floor_count: z.number().int().min(1, "At least 1 floor required"),
  rack_count: z.number().int().min(0).optional(),
  racks_per_row: z.number().int().min(1).optional(),
  capacity_quintals: z.number().min(0).optional(),
  is_sugar_free: z.boolean().optional(),
  target_temperature: z.number().optional().nullable(),
  min_temperature: z.number().optional().nullable(),
  max_temperature: z.number().optional().nullable(),
  is_active: z.boolean().optional(),
})

type ChamberFormValues = z.infer<typeof chamberSchema>

export function NewChamberPage() {
  const navigate = useNavigate()
  const { rooms } = useRooms()
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const suggestedNumber = React.useMemo(() => getNextRoomNumber(rooms), [rooms])

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

  React.useEffect(() => {
    if (suggestedNumber) {
      form.setValue("number", suggestedNumber)
    }
  }, [suggestedNumber, form])

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
      await roomService.createRoom(data)
      toast.success("Chamber created successfully")
      navigate({ to: "/app/warehouse/chambers" })
    } catch (error) {
      toast.error("Failed to create chamber", {
        description: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <DashboardLayout activeNavItemId="chambers" breadcrumbs={[{ label: "Warehouse", to: "/app/warehouse" }, { label: "New Chamber" }]}>
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Go back"
            onClick={() => navigate({ to: "/app/warehouse/chambers" })}
            data-testid="new-chamber-back-button"
          >
            <ArrowLeftIcon className="size-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold" data-testid="new-chamber-title">New Chamber</h1>
            <p className="text-sm text-muted-foreground">
              Create a new chamber/room for the cold storage
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">
              Chamber Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4" data-testid="new-chamber-form">
                {/* Identity Section */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-muted-foreground">Identity</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Room Number</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., 1, A1" disabled={isSubmitting} {...field} />
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
                            <Input placeholder="e.g., Main Storage" disabled={isSubmitting} {...field} />
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
                            <Input placeholder="Hindi name" disabled={isSubmitting} {...field} />
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
                            <FormDescription className="text-xs">Chamber is operational</FormDescription>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} disabled={isSubmitting} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <Separator />

                {/* Configuration Section */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-muted-foreground">Configuration</h4>
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
                              disabled={isSubmitting}
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
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
                              disabled={isSubmitting}
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
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
                              disabled={isSubmitting}
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 10)}
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
                              disabled={isSubmitting}
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
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
                            <FormDescription className="text-xs">For sugar-free storage</FormDescription>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} disabled={isSubmitting} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <Separator />

                {/* Temperature Section */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-muted-foreground">Temperature Settings (Optional)</h4>
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
                              disabled={isSubmitting}
                              {...field}
                              value={field.value ?? ""}
                              onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
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
                              disabled={isSubmitting}
                              {...field}
                              value={field.value ?? ""}
                              onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
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
                              disabled={isSubmitting}
                              {...field}
                              value={field.value ?? ""}
                              onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate({ to: "/app/warehouse/chambers" })}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Creating..." : "Create Chamber"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
