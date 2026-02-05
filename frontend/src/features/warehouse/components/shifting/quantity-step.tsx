import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { ShiftingWizardState } from "./shifting-wizard"

interface QuantityStepProps {
  state: ShiftingWizardState
  updateState: (updates: Partial<ShiftingWizardState>) => void
  onNext: () => void
  onBack: () => void
}

export function QuantityStep({
  state,
  updateState,
  onNext,
  onBack,
}: QuantityStepProps) {
  // Get max available from amad
  const maxPkt1 = state.amad?.remaining_packets ?? 0

  const totalQuantity = state.pkt1 + state.pkt2 + state.pkt3
  const hasQuantity = totalQuantity > 0
  const exceedsAvailable = state.pkt1 > maxPkt1

  const handlePktChange = (
    field: "pkt1" | "pkt2" | "pkt3",
    value: string
  ) => {
    const numValue = parseInt(value, 10)
    updateState({ [field]: isNaN(numValue) ? 0 : Math.max(0, numValue) })
  }

  const canProceed = hasQuantity && !exceedsAvailable

  return (
    <div className="space-y-6">
      {/* Amad Summary */}
      {state.amad && (
        <div className="rounded-lg border bg-muted/50 p-4">
          <p className="text-sm font-medium mb-2">Moving from {state.amad.amad_no}</p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Party:</span>{" "}
              <span className="font-medium">{state.amad.party_name}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Commodity:</span>{" "}
              <span className="font-medium">{state.amad.commodity_name}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Available:</span>{" "}
              <span className="font-medium">{state.amad.remaining_packets} packets</span>
            </div>
          </div>
        </div>
      )}

      {/* Quantity Inputs */}
      <div className="space-y-4">
        <Label className="text-sm font-medium">Quantity to Shift</Label>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="pkt1" className="text-sm text-muted-foreground">
              Pkt 1 (Large)
            </Label>
            <Input
              id="pkt1"
              type="number"
              min={0}
              max={maxPkt1}
              value={state.pkt1 || ""}
              onChange={(e) => handlePktChange("pkt1", e.target.value)}
              placeholder="0"
            />
            <p className="text-xs text-muted-foreground">Max: {maxPkt1}</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="pkt2" className="text-sm text-muted-foreground">
              Pkt 2 (Medium)
            </Label>
            <Input
              id="pkt2"
              type="number"
              min={0}
              value={state.pkt2 || ""}
              onChange={(e) => handlePktChange("pkt2", e.target.value)}
              placeholder="0"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pkt3" className="text-sm text-muted-foreground">
              Pkt 3 (Small)
            </Label>
            <Input
              id="pkt3"
              type="number"
              min={0}
              value={state.pkt3 || ""}
              onChange={(e) => handlePktChange("pkt3", e.target.value)}
              placeholder="0"
            />
          </div>
        </div>

        {/* Total Display */}
        <div className="rounded-lg border p-3 text-center">
          <p className="text-sm text-muted-foreground">Total Packets to Shift</p>
          <p className="text-2xl font-bold">{totalQuantity}</p>
        </div>
      </div>

      {/* Exceeds Warning */}
      {exceedsAvailable && (
        <div className="flex gap-3 rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
          <p className="text-sm text-destructive">
            Quantity exceeds available packets ({maxPkt1} available)
          </p>
        </div>
      )}

      {/* Reason / Remarks */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="reason" className="text-sm text-muted-foreground">
            Reason for Shift (Optional)
          </Label>
          <Input
            id="reason"
            value={state.reason || ""}
            onChange={(e) => updateState({ reason: e.target.value })}
            placeholder="e.g., Space optimization, Temperature issue"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="remarks" className="text-sm text-muted-foreground">
            Additional Remarks (Optional)
          </Label>
          <Textarea
            id="remarks"
            value={state.remarks || ""}
            onChange={(e) => updateState({ remarks: e.target.value })}
            placeholder="Any additional notes..."
            rows={2}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onNext} disabled={!canProceed}>
          Next
        </Button>
      </div>
    </div>
  )
}
