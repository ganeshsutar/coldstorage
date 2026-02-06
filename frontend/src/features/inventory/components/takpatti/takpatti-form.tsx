import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { AmadCombobox } from "../shared/amad-combobox"
import type { AmadSummary } from "../../types/amad"
import type { Room } from "../../types/masters"
import type { CreateTakpattiRequest } from "../../types/takpatti"

const takpattiSchema = z
  .object({
    date: z.string().min(1, "Date is required"),
    amad: z.string().min(1, "Amad is required"),
    packets: z.number().min(1, "At least 1 packet required"),
    gross_weight: z.number().min(0.01, "Gross weight must be greater than 0"),
    tare_weight: z.number().min(0, "Tare weight cannot be negative"),
    room: z.string().optional(),
    floor_no: z.number().min(1).optional(),
  })
  .refine((data) => data.gross_weight > data.tare_weight, {
    message: "Gross weight must be greater than tare weight",
    path: ["gross_weight"],
  })

type TakpattiFormData = z.infer<typeof takpattiSchema>

interface TakpattiFormProps {
  amads: AmadSummary[]
  rooms: Room[]
  onSubmit: (data: CreateTakpattiRequest) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

export function TakpattiForm({
  amads,
  rooms,
  onSubmit,
  onCancel,
  loading,
}: TakpattiFormProps) {
  const form = useForm<TakpattiFormData>({
    resolver: zodResolver(takpattiSchema),
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      amad: "",
      packets: 0,
      gross_weight: 0,
      tare_weight: 0,
      room: "",
      floor_no: 1,
    },
  })

  // eslint-disable-next-line react-hooks/incompatible-library
  const grossWeight = form.watch("gross_weight")
  const tareWeight = form.watch("tare_weight")
  const netWeight = Math.max(0, (grossWeight || 0) - (tareWeight || 0))

  const handleSubmit = async (data: TakpattiFormData) => {
    const payload: CreateTakpattiRequest = {
      date: data.date,
      amad: data.amad,
      packets: data.packets,
      gross_weight: data.gross_weight,
      tare_weight: data.tare_weight,
    }
    if (data.room && data.room !== "") {
      payload.room = data.room
    }
    if (data.floor_no) {
      payload.floor_no = data.floor_no
    }
    await onSubmit(payload)
  }

  return (
    <FormProvider {...form}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Date and Amad */}
          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} disabled={loading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amad"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amad</FormLabel>
                  <FormControl>
                    <AmadCombobox
                      amads={amads}
                      value={field.value}
                      onChange={field.onChange}
                      disabled={loading}
                      placeholder="Select amad..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Packets and Weights */}
          <div className="grid gap-4 md:grid-cols-3">
            <FormField
              control={form.control}
              name="packets"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Packets</FormLabel>
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
              name="gross_weight"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gross Weight (kg)</FormLabel>
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
              name="tare_weight"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tare Weight (kg)</FormLabel>
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

          {/* Net Weight Display */}
          <div>
            <label className="text-sm font-medium">Net Weight</label>
            <div className="mt-1.5 flex h-9 items-center rounded-md border bg-muted px-3 text-sm font-mono tabular-nums">
              {netWeight.toLocaleString("en-IN", { maximumFractionDigits: 2 })} kg
            </div>
          </div>

          {/* Room and Floor */}
          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="room"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Room (Optional)</FormLabel>
                  <Select
                    disabled={loading}
                    onValueChange={(value) =>
                      field.onChange(value === "__none__" ? "" : value)
                    }
                    value={field.value || "__none__"}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select room" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="__none__">None</SelectItem>
                      {rooms
                        .filter((r) => r.is_active)
                        .map((room) => (
                          <SelectItem key={room.id} value={room.id}>
                            Room {room.number}{" "}
                            {room.name ? `- ${room.name}` : ""}
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
              name="floor_no"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Floor No</FormLabel>
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

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Takpatti"}
            </Button>
          </div>
        </form>
      </Form>
    </FormProvider>
  )
}
