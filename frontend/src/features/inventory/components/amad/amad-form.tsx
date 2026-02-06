import * as React from "react"
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
import { useNextNumber } from "@/features/system"
import { PartyCombobox } from "../shared/party-combobox"
import { CommodityCombobox } from "../shared/commodity-combobox"
import { PacketCalculator } from "./packet-calculator"
import type { Commodity, Room, Village } from "../../types/masters"
import type { CreateAmadRequest } from "../../types/amad"

const amadSchema = z.object({
  date: z.string().min(1, "Date is required"),
  party: z.string().min(1, "Party is required"),
  village: z.string().optional(),
  commodity: z.string().min(1, "Commodity is required"),
  room: z.string().optional(),
  pkt1: z.number().min(0),
  pwt1: z.number().min(0),
  pkt2: z.number().min(0),
  pwt2: z.number().min(0),
  pkt3: z.number().min(0),
  pwt3: z.number().min(0),
  marks: z.string().optional(),
  grace_days: z.number().min(0).optional(),
  rent_rate: z.number().min(0).optional(),
  amad_type: z.enum(["SEEDHI", "DUMP"]),
  e_way_bill: z.string().optional(),
}).refine(
  (data) => data.pkt1 + data.pkt2 + data.pkt3 > 0,
  { message: "At least one packet type must have a value", path: ["pkt1"] }
)

type AmadFormData = z.infer<typeof amadSchema>

interface AmadFormProps {
  commodities: Commodity[]
  rooms: Room[]
  villages: Village[]
  onSubmit: (data: CreateAmadRequest) => Promise<void>
  onCancel: () => void
  loading?: boolean
  initialData?: Partial<CreateAmadRequest>
}

export function AmadForm({
  commodities,
  rooms,
  villages,
  onSubmit,
  onCancel,
  loading,
  initialData,
}: AmadFormProps) {
  const { nextNumber: nextAmadNo, loading: numberLoading } = useNextNumber("AMAD")

  const form = useForm<AmadFormData>({
    resolver: zodResolver(amadSchema),
    defaultValues: {
      date: initialData?.date || new Date().toISOString().split("T")[0],
      party: initialData?.party || "",
      village: initialData?.village || "",
      commodity: initialData?.commodity || "",
      room: initialData?.room || "",
      pkt1: initialData?.pkt1 || 0,
      pwt1: initialData?.pwt1 || 0,
      pkt2: initialData?.pkt2 || 0,
      pwt2: initialData?.pwt2 || 0,
      pkt3: initialData?.pkt3 || 0,
      pwt3: initialData?.pwt3 || 0,
      marks: initialData?.marks || "",
      grace_days: initialData?.grace_days,
      rent_rate: initialData?.rent_rate,
      amad_type: initialData?.amad_type || "SEEDHI",
      e_way_bill: initialData?.e_way_bill || "",
    },
  })

  // eslint-disable-next-line react-hooks/incompatible-library
  const watchCommodityId = form.watch("commodity")
  const selectedCommodity = React.useMemo(() => {
    return commodities.find((c) => c.id === watchCommodityId)
  }, [commodities, watchCommodityId])

  // Auto-fill grace days and rent rate when commodity changes
  React.useEffect(() => {
    if (selectedCommodity) {
      if (form.getValues("grace_days") === undefined || form.getValues("grace_days") === 0) {
        form.setValue("grace_days", selectedCommodity.grace_days)
      }
      if (form.getValues("rent_rate") === undefined || form.getValues("rent_rate") === 0) {
        form.setValue("rent_rate", selectedCommodity.default_rent_rate)
      }
    }
  }, [selectedCommodity, form])

  const handleSubmit = async (data: AmadFormData) => {
    await onSubmit(data as CreateAmadRequest)
  }

  return (
    <FormProvider {...form}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Auto Number */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Amad No</label>
            <Input value={numberLoading ? "..." : nextAmadNo} readOnly className="bg-muted font-mono w-48" />
          </div>

          {/* Basic Info */}
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
              name="amad_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amad Type</FormLabel>
                  <Select
                    disabled={loading}
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="SEEDHI">Seedhi (Direct)</SelectItem>
                      <SelectItem value="DUMP">Dump</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Party and Village */}
          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="party"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Party (Depositor)</FormLabel>
                  <FormControl>
                    <PartyCombobox
                      value={field.value}
                      onChange={field.onChange}
                      disabled={loading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="village"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Village (Optional)</FormLabel>
                  <Select
                    disabled={loading}
                    onValueChange={(value) => field.onChange(value === "__none__" ? "" : value)}
                    value={field.value || "__none__"}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select village" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="__none__">None</SelectItem>
                      {villages.filter((v) => v.is_active).map((village) => (
                        <SelectItem key={village.id} value={village.id}>
                          {village.name} ({village.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Commodity and Room */}
          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="commodity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Commodity</FormLabel>
                  <FormControl>
                    <CommodityCombobox
                      commodities={commodities}
                      value={field.value}
                      onChange={field.onChange}
                      disabled={loading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="room"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Room (Optional)</FormLabel>
                  <Select
                    disabled={loading}
                    onValueChange={(value) => field.onChange(value === "__none__" ? "" : value)}
                    value={field.value || "__none__"}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select room" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="__none__">None</SelectItem>
                      {rooms.filter((r) => r.is_active).map((room) => (
                        <SelectItem key={room.id} value={room.id}>
                          Room {room.number} {room.name ? `- ${room.name}` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Packet Calculator */}
          <PacketCalculator disabled={loading} />

          {/* Additional Details */}
          <div className="grid gap-4 md:grid-cols-3">
            <FormField
              control={form.control}
              name="marks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Marks</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Identification marks"
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
              name="rent_rate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rent Rate (per quintal/month)</FormLabel>
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

          {/* E-way bill */}
          <FormField
            control={form.control}
            name="e_way_bill"
            render={({ field }) => (
              <FormItem>
                <FormLabel>E-Way Bill (Optional)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="E-way bill number"
                    disabled={loading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Amad"}
            </Button>
          </div>
        </form>
      </Form>
    </FormProvider>
  )
}
