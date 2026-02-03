import * as React from "react"
import { CheckCircle, AlertCircle, Loader2, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useCreateShiftHeader } from "../../hooks/use-shifting"
import { useRooms } from "@/features/inventory"
import type { ShiftingWizardState } from "./shifting-wizard"

interface ConfirmStepProps {
  state: ShiftingWizardState
  onBack: () => void
  onSuccess: () => void
}

export function ConfirmStep({ state, onBack, onSuccess }: ConfirmStepProps) {
  const { createShiftHeader, loading, error } = useCreateShiftHeader()
  const { rooms } = useRooms(true)

  // Get room names for display
  const sourceRoom = rooms.find((r) => r.id === state.sourceRoomId)
  const destRoom = rooms.find((r) => r.id === state.destinationRoomId)

  const totalQuantity = state.pkt1 + state.pkt2 + state.pkt3

  const handleConfirm = async () => {
    if (!state.amadId || !state.sourceRoomId || !state.destinationRoomId) return

    const today = new Date().toISOString().split("T")[0]

    const result = await createShiftHeader({
      date: today,
      from_room: state.sourceRoomId,
      to_room: state.destinationRoomId,
      remarks: state.remarks,
      items: [
        {
          amad: state.amadId,
          from_room: state.sourceRoomId,
          from_floor: state.sourceFloorNumber!,
          from_rack: state.sourceRackNumber!,
          to_room: state.destinationRoomId,
          to_floor: state.destinationFloorNumber!,
          to_rack: state.destinationRackNumber!,
          quantity: totalQuantity,
          narration: state.reason,
        },
      ],
    })

    if (result) {
      onSuccess()
    }
  }

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <div className="rounded-lg border p-4 space-y-4">
        <h4 className="font-semibold">Shift Summary</h4>

        {/* Location Transfer */}
        <div className="flex items-center gap-4">
          <div className="flex-1 rounded-lg bg-muted p-3">
            <p className="text-xs text-muted-foreground">From</p>
            <p className="font-medium">
              Room {sourceRoom?.number || state.sourceRoomId}
            </p>
            <p className="text-sm text-muted-foreground">
              Floor {state.sourceFloorNumber}, Rack {state.sourceRackNumber}
            </p>
          </div>
          <ArrowRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
          <div className="flex-1 rounded-lg bg-muted p-3">
            <p className="text-xs text-muted-foreground">To</p>
            <p className="font-medium">
              Room {destRoom?.number || state.destinationRoomId}
            </p>
            <p className="text-sm text-muted-foreground">
              Floor {state.destinationFloorNumber}, Rack {state.destinationRackNumber}
            </p>
          </div>
        </div>

        <Separator />

        {/* Amad Details */}
        {state.amad && (
          <div>
            <p className="text-xs text-muted-foreground mb-1">Amad</p>
            <p className="font-medium">{state.amad.amad_no}</p>
            <p className="text-sm text-muted-foreground">
              {state.amad.party_name} - {state.amad.commodity_name}
            </p>
          </div>
        )}

        <Separator />

        {/* Quantities */}
        <div>
          <p className="text-xs text-muted-foreground mb-2">Quantity</p>
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="rounded-lg border p-2">
              <p className="text-lg font-bold">{state.pkt1}</p>
              <p className="text-xs text-muted-foreground">Pkt 1</p>
            </div>
            <div className="rounded-lg border p-2">
              <p className="text-lg font-bold">{state.pkt2}</p>
              <p className="text-xs text-muted-foreground">Pkt 2</p>
            </div>
            <div className="rounded-lg border p-2">
              <p className="text-lg font-bold">{state.pkt3}</p>
              <p className="text-xs text-muted-foreground">Pkt 3</p>
            </div>
            <div className="rounded-lg border bg-primary/10 p-2">
              <p className="text-lg font-bold">{totalQuantity}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
          </div>
        </div>

        {/* Reason & Remarks */}
        {(state.reason || state.remarks) && (
          <>
            <Separator />
            <div className="space-y-2">
              {state.reason && (
                <div>
                  <p className="text-xs text-muted-foreground">Reason</p>
                  <p className="text-sm">{state.reason}</p>
                </div>
              )}
              {state.remarks && (
                <div>
                  <p className="text-xs text-muted-foreground">Remarks</p>
                  <p className="text-sm">{state.remarks}</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Confirmation Message */}
      <div className="flex gap-3 rounded-lg border bg-muted/50 p-4">
        <CheckCircle className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
        <p className="text-sm text-muted-foreground">
          Please review the details above. Once confirmed, the shift will be
          recorded and cannot be undone.
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="flex gap-3 rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack} disabled={loading}>
          Back
        </Button>
        <Button onClick={handleConfirm} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            "Confirm Shift"
          )}
        </Button>
      </div>
    </div>
  )
}
