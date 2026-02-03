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
import { villageService } from "../../api/masters"
import type { Village, CreateVillageRequest } from "../../types/masters"

const villageSchema = z.object({
  code: z.string().min(1, "Code is required").max(20),
  name: z.string().min(1, "Name is required").max(255),
  name_hindi: z.string().optional(),
  post: z.string().optional(),
  district: z.string().optional(),
  state: z.string().optional(),
  is_active: z.boolean(),
})

type VillageFormData = z.infer<typeof villageSchema>

interface VillageDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  editVillage?: Village
}

export function VillageDialog({
  open,
  onOpenChange,
  onSuccess,
  editVillage,
}: VillageDialogProps) {
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const form = useForm<VillageFormData>({
    resolver: zodResolver(villageSchema),
    defaultValues: {
      code: "",
      name: "",
      name_hindi: "",
      post: "",
      district: "",
      state: "",
      is_active: true,
    },
  })

  React.useEffect(() => {
    if (open) {
      if (editVillage) {
        form.reset({
          code: editVillage.code,
          name: editVillage.name,
          name_hindi: editVillage.name_hindi || "",
          post: editVillage.post || "",
          district: editVillage.district || "",
          state: editVillage.state || "",
          is_active: editVillage.is_active,
        })
      } else {
        form.reset({
          code: "",
          name: "",
          name_hindi: "",
          post: "",
          district: "",
          state: "",
          is_active: true,
        })
      }
      setError(null)
    }
  }, [open, editVillage, form])

  const onSubmit = async (data: VillageFormData) => {
    setLoading(true)
    setError(null)

    try {
      if (editVillage) {
        await villageService.updateVillage(editVillage.id, data)
      } else {
        await villageService.createVillage(data as CreateVillageRequest)
      }
      onSuccess()
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save village")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {editVillage ? "Edit Village" : "Add Village"}
          </DialogTitle>
          <DialogDescription>
            {editVillage
              ? "Update village/location details"
              : "Create a new village/location for party addresses"}
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
                        placeholder="e.g., AGR001"
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
                        placeholder="e.g., Agra"
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
                        placeholder="e.g., आगरा"
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
                name="post"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Post Office</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Post office name"
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
                name="district"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>District</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Agra"
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
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Uttar Pradesh"
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
                      Inactive villages won't appear in selection lists
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
                {loading ? "Saving..." : editVillage ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
