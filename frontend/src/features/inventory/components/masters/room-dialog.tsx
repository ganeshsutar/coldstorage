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
import { roomService } from "../../api/masters"
import type { Room, CreateRoomRequest } from "../../types/masters"

const roomSchema = z.object({
  number: z.string().min(1, "Room number is required").max(20),
  name: z.string().optional(),
  capacity_quintals: z.number().min(0, "Capacity must be 0 or greater"),
  floor_count: z.number().min(1, "At least 1 floor required"),
  is_active: z.boolean(),
})

type RoomFormData = z.infer<typeof roomSchema>

interface RoomDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  editRoom?: Room
}

export function RoomDialog({
  open,
  onOpenChange,
  onSuccess,
  editRoom,
}: RoomDialogProps) {
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const form = useForm<RoomFormData>({
    resolver: zodResolver(roomSchema),
    defaultValues: {
      number: "",
      name: "",
      capacity_quintals: 0,
      floor_count: 1,
      is_active: true,
    },
  })

  React.useEffect(() => {
    if (open) {
      if (editRoom) {
        form.reset({
          number: editRoom.number,
          name: editRoom.name || "",
          capacity_quintals: editRoom.capacity_quintals,
          floor_count: editRoom.floor_count,
          is_active: editRoom.is_active,
        })
      } else {
        form.reset({
          number: "",
          name: "",
          capacity_quintals: 0,
          floor_count: 1,
          is_active: true,
        })
      }
      setError(null)
    }
  }, [open, editRoom, form])

  const onSubmit = async (data: RoomFormData) => {
    setLoading(true)
    setError(null)

    try {
      if (editRoom) {
        await roomService.updateRoom(editRoom.id, data)
      } else {
        await roomService.createRoom(data as CreateRoomRequest)
      }
      onSuccess()
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save room")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>
            {editRoom ? "Edit Room" : "Add Room"}
          </DialogTitle>
          <DialogDescription>
            {editRoom
              ? "Update room/chamber details"
              : "Create a new cold storage room/chamber"}
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
                name="number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Room Number</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., 1, A1"
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
                    <FormLabel>Name (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Main Chamber"
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
                name="capacity_quintals"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Capacity (Quintals)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
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
                name="floor_count"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Floor Count</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        placeholder="1"
                        disabled={loading}
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value) || 1)}
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
                      Inactive rooms won't appear in selection lists
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
                {loading ? "Saving..." : editRoom ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
