import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { Switch } from "@/components/ui/switch"
import { commodityService } from "../../api/masters"
import type { Commodity, CreateCommodityRequest } from "../../types/masters"

const commoditySchema = z.object({
  code: z.string().min(1, "Code is required").max(20),
  name: z.string().min(1, "Name is required").max(255),
  name_hindi: z.string().optional(),
  variety: z.string().optional(),
  grace_days: z.number().min(0, "Grace days must be 0 or greater"),
  default_rent_rate: z.number().min(0, "Rate must be 0 or greater"),
  is_active: z.boolean(),
})

type CommodityFormData = z.infer<typeof commoditySchema>

interface CommodityDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  editCommodity?: Commodity
}

export function CommodityDialog({
  open,
  onOpenChange,
  onSuccess,
  editCommodity,
}: CommodityDialogProps) {
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const form = useForm<CommodityFormData>({
    resolver: zodResolver(commoditySchema),
    defaultValues: {
      code: "",
      name: "",
      name_hindi: "",
      variety: "",
      grace_days: 0,
      default_rent_rate: 0,
      is_active: true,
    },
  })

  // Reset form when dialog opens/closes or editCommodity changes
  React.useEffect(() => {
    if (open) {
      if (editCommodity) {
        form.reset({
          code: editCommodity.code,
          name: editCommodity.name,
          name_hindi: editCommodity.name_hindi || "",
          variety: editCommodity.variety || "",
          grace_days: editCommodity.grace_days,
          default_rent_rate: editCommodity.default_rent_rate,
          is_active: editCommodity.is_active,
        })
      } else {
        form.reset({
          code: "",
          name: "",
          name_hindi: "",
          variety: "",
          grace_days: 0,
          default_rent_rate: 0,
          is_active: true,
        })
      }
      setError(null)
    }
  }, [open, editCommodity, form])

  const onSubmit = async (data: CommodityFormData) => {
    setLoading(true)
    setError(null)

    try {
      if (editCommodity) {
        await commodityService.updateCommodity(editCommodity.id, data)
      } else {
        await commodityService.createCommodity(data as CreateCommodityRequest)
      }
      onSuccess()
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save commodity")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {editCommodity ? "Edit Commodity" : "Add Commodity"}
          </DialogTitle>
          <DialogDescription>
            {editCommodity
              ? "Update commodity details"
              : "Create a new commodity for inventory tracking"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                {error}
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Code</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., POTATO"
                        disabled={loading}
                        {...field}
                      />
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
                      <Input
                        placeholder="e.g., Potato"
                        disabled={loading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="name_hindi"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name (Hindi)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., आलू"
                        disabled={loading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="variety"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Variety</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Kufri Pukhraj"
                        disabled={loading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="grace_days"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Grace Days</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        placeholder="0"
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
                name="default_rent_rate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Default Rent Rate (per qtl/month)</FormLabel>
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
            </div>

            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Active</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Inactive commodities won't appear in selection lists
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
                {loading ? "Saving..." : editCommodity ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
