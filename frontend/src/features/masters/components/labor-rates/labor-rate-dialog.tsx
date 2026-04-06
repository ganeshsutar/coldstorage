import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FormDatePicker } from "@/components/ui/form-date-picker"
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
import { Switch } from "@/components/ui/switch"
import { laborRateService } from "../../api/labor-rates"
import type { LaborRate, CreateLaborRateRequest, RateType, PacketType } from "../../types"

const laborRateSchema = z.object({
  rate_type: z.enum(["LOADING", "UNLOADING", "KATAI", "RELOAD", "DUMP", "DALA"]),
  packet_type: z.enum(["PKT1", "PKT2", "PKT3", "NONE"]),
  rate: z.number().min(0, "Rate must be 0 or greater"),
  effective_from: z.string().min(1, "Effective date is required"),
  is_active: z.boolean(),
})

type LaborRateFormData = z.infer<typeof laborRateSchema>

interface LaborRateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  editRate?: LaborRate
}

const rateTypeOptions: { value: RateType; label: string }[] = [
  { value: "LOADING", label: "Loading" },
  { value: "UNLOADING", label: "Unloading" },
  { value: "KATAI", label: "Katai (Cutting)" },
  { value: "RELOAD", label: "Reload" },
  { value: "DUMP", label: "Dump" },
  { value: "DALA", label: "Dala" },
]

const packetTypeOptions: { value: PacketType | "NONE"; label: string }[] = [
  { value: "NONE", label: "Flat Rate (No Packet Type)" },
  { value: "PKT1", label: "Packet Type 1" },
  { value: "PKT2", label: "Packet Type 2" },
  { value: "PKT3", label: "Packet Type 3" },
]

export function LaborRateDialog({
  open,
  onOpenChange,
  onSuccess,
  editRate,
}: LaborRateDialogProps) {
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const form = useForm<LaborRateFormData>({
    resolver: zodResolver(laborRateSchema),
    defaultValues: {
      rate_type: "LOADING",
      packet_type: "NONE",
      rate: 0,
      effective_from: new Date().toISOString().split("T")[0],
      is_active: true,
    },
  })

  React.useEffect(() => {
    if (open) {
      if (editRate) {
        form.reset({
          rate_type: editRate.rate_type,
          packet_type: editRate.packet_type || "NONE",
          rate: editRate.rate,
          effective_from: editRate.effective_from,
          is_active: editRate.is_active,
        })
      } else {
        form.reset({
          rate_type: "LOADING",
          packet_type: "NONE",
          rate: 0,
          effective_from: new Date().toISOString().split("T")[0],
          is_active: true,
        })
      }
      setError(null)
    }
  }, [open, editRate, form])

  const onSubmit = async (data: LaborRateFormData) => {
    setLoading(true)
    setError(null)

    try {
      const payload: CreateLaborRateRequest = {
        rate_type: data.rate_type,
        packet_type: data.packet_type === "NONE" ? undefined : data.packet_type,
        rate: data.rate,
        effective_from: data.effective_from,
        is_active: data.is_active,
      }

      if (editRate) {
        await laborRateService.updateLaborRate(editRate.id, payload)
      } else {
        await laborRateService.createLaborRate(payload)
      }
      onSuccess()
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save labor rate")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {editRate ? "Edit Labor Rate" : "Add Labor Rate"}
          </DialogTitle>
          <DialogDescription>
            {editRate
              ? "Update labor rate configuration"
              : "Create a new labor rate for billing"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                {error}
              </div>
            )}

            <FormField
              control={form.control}
              name="rate_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rate Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={loading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select rate type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {rateTypeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
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
              name="packet_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Packet Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={loading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select packet type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {packetTypeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="rate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rate (₹)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        disabled={loading}
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="effective_from"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Effective From</FormLabel>
                    <FormControl>
                      <FormDatePicker
                        disabled={loading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Active</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Inactive rates won't be used in calculations
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={loading}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : editRate ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
