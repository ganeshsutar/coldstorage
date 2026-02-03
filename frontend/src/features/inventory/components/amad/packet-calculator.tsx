import * as React from "react"
import { useFormContext } from "react-hook-form"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form"

interface PacketCalculatorProps {
  disabled?: boolean
}

export function PacketCalculator({ disabled }: PacketCalculatorProps) {
  const form = useFormContext()
  const [totals, setTotals] = React.useState({ packets: 0, weight: 0 })

  // Watch all packet and weight fields
  const pkt1 = form.watch("pkt1") || 0
  const pwt1 = form.watch("pwt1") || 0
  const pkt2 = form.watch("pkt2") || 0
  const pwt2 = form.watch("pwt2") || 0
  const pkt3 = form.watch("pkt3") || 0
  const pwt3 = form.watch("pwt3") || 0

  React.useEffect(() => {
    const totalPackets = Number(pkt1) + Number(pkt2) + Number(pkt3)
    const totalWeight = Number(pwt1) + Number(pwt2) + Number(pwt3)
    setTotals({ packets: totalPackets, weight: totalWeight })
  }, [pkt1, pwt1, pkt2, pwt2, pkt3, pwt3])

  const packetTypes = [
    { label: "Type 1 (Large)", pktField: "pkt1", wtField: "pwt1" },
    { label: "Type 2 (Medium)", pktField: "pkt2", wtField: "pwt2" },
    { label: "Type 3 (Small)", pktField: "pkt3", wtField: "pwt3" },
  ] as const

  return (
    <div className="space-y-4">
      <Label className="text-base font-medium">Packet Details</Label>
      <div className="grid gap-4">
        {/* Header */}
        <div className="grid grid-cols-3 gap-4 text-sm text-muted-foreground">
          <div>Type</div>
          <div>Packets</div>
          <div>Weight (kg)</div>
        </div>

        {/* Packet rows */}
        {packetTypes.map(({ label, pktField, wtField }) => (
          <div key={pktField} className="grid grid-cols-3 gap-4 items-center">
            <Label className="text-sm">{label}</Label>
            <FormField
              control={form.control}
              name={pktField}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      placeholder="0"
                      disabled={disabled}
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
              name={wtField}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      disabled={disabled}
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        ))}

        {/* Totals row */}
        <div className="grid grid-cols-3 gap-4 items-center pt-2 border-t">
          <Label className="font-semibold">Total</Label>
          <div className="font-mono font-bold text-lg">
            {totals.packets.toLocaleString("en-IN")}
          </div>
          <div className="font-mono font-bold text-lg">
            {totals.weight.toLocaleString("en-IN", { maximumFractionDigits: 2 })} kg
          </div>
        </div>
      </div>
    </div>
  )
}
