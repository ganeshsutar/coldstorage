import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LocationPicker } from "../common/location-picker"
import type { ShiftingWizardState } from "./shifting-wizard"

interface DestinationStepProps {
  state: ShiftingWizardState
  updateState: (updates: Partial<ShiftingWizardState>) => void
  onNext: () => void
  onBack: () => void
}

export function DestinationStep({
  state,
  updateState,
  onNext,
  onBack,
}: DestinationStepProps) {
  const handleRoomChange = (roomId: string) => {
    updateState({
      destinationRoomId: roomId,
      destinationFloorNumber: undefined,
      destinationRackNumber: undefined,
    })
  }

  const handleFloorChange = (floorNumber: number) => {
    updateState({
      destinationFloorNumber: floorNumber,
      destinationRackNumber: undefined,
    })
  }

  const handleRackChange = (rackNumber: number) => {
    updateState({ destinationRackNumber: rackNumber })
  }

  const isSameLocation =
    state.sourceRoomId === state.destinationRoomId &&
    state.sourceFloorNumber === state.destinationFloorNumber &&
    state.sourceRackNumber === state.destinationRackNumber

  const canProceed =
    state.destinationRoomId &&
    state.destinationFloorNumber !== undefined &&
    state.destinationRackNumber !== undefined &&
    !isSameLocation

  return (
    <div className="space-y-6">
      {/* Source Summary */}
      <div className="rounded-lg border bg-muted/50 p-4">
        <p className="text-sm font-medium mb-2">Source Location</p>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Room:</span>{" "}
            <span className="font-medium">{state.sourceRoomId ? "Selected" : "-"}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Floor:</span>{" "}
            <span className="font-medium">{state.sourceFloorNumber ?? "-"}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Rack:</span>{" "}
            <span className="font-medium">{state.sourceRackNumber ?? "-"}</span>
          </div>
        </div>
        {state.amad && (
          <p className="text-sm mt-2">
            <span className="text-muted-foreground">Amad:</span>{" "}
            <span className="font-medium">{state.amad.amad_no}</span>
            <span className="text-muted-foreground ml-2">({state.amad.party_name})</span>
          </p>
        )}
      </div>

      {/* Destination Selection */}
      <LocationPicker
        label="Destination Location"
        selectedRoomId={state.destinationRoomId}
        selectedFloorNumber={state.destinationFloorNumber}
        selectedRackNumber={state.destinationRackNumber}
        onRoomChange={handleRoomChange}
        onFloorChange={handleFloorChange}
        onRackChange={handleRackChange}
      />

      {/* Same Location Warning */}
      {isSameLocation && state.destinationRackNumber !== undefined && (
        <div className="flex gap-3 rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
          <p className="text-sm text-destructive">
            Destination cannot be the same as source location. Please select a different rack.
          </p>
        </div>
      )}

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
