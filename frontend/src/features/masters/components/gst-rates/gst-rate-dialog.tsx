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
import { gstRateService } from "../../api/gst-rates"
import type { GstRate, CreateGstRateRequest } from "../../types"

const gstRateSchema = z.object({
  code: z.string().min(1, "Code is required").max(20),
  description: z.string().min(1, "Description is required").max(255),
  cgst_rate: z.number().min(0).max(50),
  sgst_rate: z.number().min(0).max(50),
  igst_rate: z.number().min(0).max(100),
  hsn_code: z.string().optional(),
  is_default: z.boolean(),
  is_active: z.boolean(),
})

type GstRateFormData = z.infer<typeof gstRateSchema>

interface GstRateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  editRate?: GstRate
}

export function GstRateDialog({
  open,
  onOpenChange,
  onSuccess,
  editRate,
}: GstRateDialogProps) {
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const form = useForm<GstRateFormData>({
    resolver: zodResolver(gstRateSchema),
    defaultValues: {
      code: "",
      description: "",
      cgst_rate: 9,
      sgst_rate: 9,
      igst_rate: 18,
      hsn_code: "",
      is_default: false,
      is_active: true,
    },
  })

  // Watch CGST and SGST to auto-calculate IGST
  const cgstRate = form.watch("cgst_rate")
  const sgstRate = form.watch("sgst_rate")

  React.useEffect(() => {
    const igst = (cgstRate || 0) + (sgstRate || 0)
    form.setValue("igst_rate", igst)
  }, [cgstRate, sgstRate, form])

  React.useEffect(() => {
    if (open) {
      if (editRate) {
        form.reset({
          code: editRate.code,
          description: editRate.description,
          cgst_rate: editRate.cgst_rate,
          sgst_rate: editRate.sgst_rate,
          igst_rate: editRate.igst_rate,
          hsn_code: editRate.hsn_code || "",
          is_default: editRate.is_default,
          is_active: editRate.is_active,
        })
      } else {
        form.reset({
          code: "",
          description: "",
          cgst_rate: 9,
          sgst_rate: 9,
          igst_rate: 18,
          hsn_code: "",
          is_default: false,
          is_active: true,
        })
      }
      setError(null)
    }
  }, [open, editRate, form])

  const onSubmit = async (data: GstRateFormData) => {
    setLoading(true)
    setError(null)

    try {
      if (editRate) {
        await gstRateService.updateGstRate(editRate.id, data)
      } else {
        await gstRateService.createGstRate(data as CreateGstRateRequest)
      }
      onSuccess()
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save GST rate")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {editRate ? "Edit GST Rate" : "Add GST Rate"}
          </DialogTitle>
          <DialogDescription>
            {editRate
              ? "Update GST rate configuration"
              : "Create a new GST rate for billing"}
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
                        placeholder="e.g., GST18"
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
                name="hsn_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>HSN/SAC Code</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., 996721"
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
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Standard 18%"
                      disabled={loading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 md:grid-cols-3">
              <FormField
                control={form.control}
                name="cgst_rate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CGST Rate (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        max="50"
                        step="0.01"
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
                name="sgst_rate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SGST Rate (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        max="50"
                        step="0.01"
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
                name="igst_rate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>IGST Rate (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        disabled={true}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-3">
              <FormField
                control={form.control}
                name="is_default"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Default Rate</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Use this rate as default for new bills
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

              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Active</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Inactive rates won't appear in selection lists
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
            </div>

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
