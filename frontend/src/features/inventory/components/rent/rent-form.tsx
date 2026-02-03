import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
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
import { PartyCombobox } from "../shared/party-combobox"
import { AmadCombobox } from "../shared/amad-combobox"
import { RentCalculationCard } from "./rent-calculation-card"
import type { AmadSummary } from "../../types/amad"
import type { CreateRentRequest, RentCalculation } from "../../types/rent"

const rentSchema = z.object({
  date: z.string().min(1, "Date is required"),
  party: z.string().min(1, "Party is required"),
  amad: z.string().min(1, "Amad is required"),
  packets: z.number().min(1, "At least 1 packet required"),
  weight: z.number().min(0.01, "Weight must be greater than 0"),
  nikasi_type: z.enum(["SEEDHI", "KATAI"]),
  vehicle_no: z.string().optional(),
  receiver_name: z.string().optional(),
  narration: z.string().optional(),
})

type RentFormData = z.infer<typeof rentSchema>

interface RentFormProps {
  amads: AmadSummary[]
  onSubmit: (data: CreateRentRequest) => Promise<void>
  onCancel: () => void
  onCalculate: (amadId: string, date: string, packets: number, weight: number) => Promise<RentCalculation | null>
  loading?: boolean
  selectedPartyId?: string
}

export function RentForm({
  amads,
  onSubmit,
  onCancel,
  onCalculate,
  loading,
  selectedPartyId,
}: RentFormProps) {
  const [calculation, setCalculation] = React.useState<RentCalculation | null>(null)
  const [calculating, setCalculating] = React.useState(false)

  const form = useForm<RentFormData>({
    resolver: zodResolver(rentSchema),
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      party: selectedPartyId || "",
      amad: "",
      packets: 0,
      weight: 0,
      nikasi_type: "SEEDHI",
      vehicle_no: "",
      receiver_name: "",
      narration: "",
    },
  })

  const watchParty = form.watch("party")
  const watchAmad = form.watch("amad")
  const watchPackets = form.watch("packets")
  const watchWeight = form.watch("weight")
  const watchDate = form.watch("date")

  // Get selected amad for validation
  const selectedAmad = amads.find((a) => a.id === watchAmad)

  // Auto-fill packets and weight when amad changes
  React.useEffect(() => {
    if (selectedAmad) {
      // Pre-fill with remaining values
      form.setValue("packets", selectedAmad.remaining_packets)
      form.setValue("weight", selectedAmad.remaining_weight)
      // Also set party from amad
      form.setValue("party", selectedAmad.party)
    }
  }, [watchAmad, selectedAmad, form])

  // Calculate rent when relevant fields change
  React.useEffect(() => {
    const calculateRent = async () => {
      if (watchAmad && watchDate && watchPackets > 0 && watchWeight > 0) {
        setCalculating(true)
        try {
          const result = await onCalculate(watchAmad, watchDate, watchPackets, watchWeight)
          setCalculation(result)
        } catch {
          setCalculation(null)
        } finally {
          setCalculating(false)
        }
      } else {
        setCalculation(null)
      }
    }

    // Debounce the calculation
    const timer = setTimeout(calculateRent, 500)
    return () => clearTimeout(timer)
  }, [watchAmad, watchDate, watchPackets, watchWeight, onCalculate])

  const handleSubmit = async (data: RentFormData) => {
    if (!calculation) return

    await onSubmit({
      ...data,
      storage_days: calculation.storage_days,
      rent_rate: calculation.rent_rate,
      rent_amount: calculation.rent_amount,
      gst_percent: calculation.gst_percent,
      gst_amount: calculation.gst_amount,
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Form Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dispatch Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} disabled={loading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="nikasi_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nikasi Type</FormLabel>
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
                        <SelectItem value="KATAI">Katai (Cut)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Party and Amad */}
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
                        disabled={loading || !!watchAmad}
                      />
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
                    <FormLabel>Source Amad</FormLabel>
                    <FormControl>
                      <AmadCombobox
                        amads={amads}
                        value={field.value}
                        onChange={field.onChange}
                        disabled={loading}
                        filterByParty={watchParty || undefined}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Quantity */}
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="packets"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Packets
                      {selectedAmad && (
                        <span className="text-muted-foreground ml-1">
                          (max: {selectedAmad.remaining_packets})
                        </span>
                      )}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        max={selectedAmad?.remaining_packets}
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
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Weight (kg)
                      {selectedAmad && (
                        <span className="text-muted-foreground ml-1">
                          (max: {selectedAmad.remaining_weight.toLocaleString("en-IN")})
                        </span>
                      )}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0.01"
                        step="0.01"
                        max={selectedAmad?.remaining_weight}
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

            {/* Additional Details */}
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="vehicle_no"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vehicle No (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., UP32AB1234"
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
                name="receiver_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Receiver Name (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Person receiving goods"
                        disabled={loading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Narration */}
            <FormField
              control={form.control}
              name="narration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Narration (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Additional notes..."
                      disabled={loading}
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Calculation Card */}
          <div>
            <RentCalculationCard calculation={calculation} loading={calculating} />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading || !calculation}>
            {loading ? "Creating..." : "Create Dispatch"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
