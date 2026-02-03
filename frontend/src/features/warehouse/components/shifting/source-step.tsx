import * as React from "react"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { LocationPicker } from "../common/location-picker"
import { useAmads, type AmadSummary } from "@/features/inventory"
import type { ShiftingWizardState } from "./shifting-wizard"

interface SourceStepProps {
  state: ShiftingWizardState
  updateState: (updates: Partial<ShiftingWizardState>) => void
  onNext: () => void
  onCancel: () => void
}

export function SourceStep({
  state,
  updateState,
  onNext,
  onCancel,
}: SourceStepProps) {
  const [searchTerm, setSearchTerm] = React.useState("")

  // Fetch amads for the selected room
  const { amads, loading: amadsLoading } = useAmads(
    state.sourceRoomId
      ? { room_id: state.sourceRoomId, is_fully_dispatched: false }
      : undefined
  )

  // Filter amads based on search term
  const filteredAmads = React.useMemo(() => {
    if (!searchTerm) return amads
    const search = searchTerm.toLowerCase()
    return amads.filter(
      (amad) =>
        amad.amad_no.toLowerCase().includes(search) ||
        amad.party_name.toLowerCase().includes(search) ||
        amad.commodity_name.toLowerCase().includes(search)
    )
  }, [amads, searchTerm])

  const handleRoomChange = (roomId: string) => {
    updateState({
      sourceRoomId: roomId,
      sourceFloorNumber: undefined,
      sourceRackNumber: undefined,
      amadId: undefined,
      amad: undefined,
    })
  }

  const handleFloorChange = (floorNumber: number) => {
    updateState({
      sourceFloorNumber: floorNumber,
      sourceRackNumber: undefined,
    })
  }

  const handleRackChange = (rackNumber: number) => {
    updateState({ sourceRackNumber: rackNumber })
  }

  const handleSelectAmad = (amad: AmadSummary) => {
    updateState({
      amadId: amad.id,
      amad: amad,
    })
  }

  const canProceed =
    state.sourceRoomId &&
    state.sourceFloorNumber !== undefined &&
    state.sourceRackNumber !== undefined &&
    state.amadId

  return (
    <div className="space-y-6">
      {/* Location Selection */}
      <LocationPicker
        label="Source Location"
        selectedRoomId={state.sourceRoomId}
        selectedFloorNumber={state.sourceFloorNumber}
        selectedRackNumber={state.sourceRackNumber}
        onRoomChange={handleRoomChange}
        onFloorChange={handleFloorChange}
        onRackChange={handleRackChange}
      />

      {/* Amad Selection */}
      {state.sourceRoomId && (
        <div className="space-y-3">
          <Label className="text-sm font-medium">Select Amad</Label>

          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by Amad No, Party, or Commodity..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Amad List */}
          <ScrollArea className="h-[200px] rounded-md border">
            {amadsLoading ? (
              <div className="space-y-2 p-3">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : filteredAmads.length === 0 ? (
              <div className="flex h-full items-center justify-center p-6 text-sm text-muted-foreground">
                {amads.length === 0
                  ? "No amads found in this room"
                  : "No matching amads found"}
              </div>
            ) : (
              <div className="space-y-2 p-3">
                {filteredAmads.map((amad) => (
                  <button
                    key={amad.id}
                    type="button"
                    onClick={() => handleSelectAmad(amad)}
                    className={`w-full rounded-lg border p-3 text-left transition-colors hover:bg-accent ${
                      state.amadId === amad.id
                        ? "border-primary bg-primary/5"
                        : "border-transparent"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{amad.amad_no}</p>
                        <p className="text-sm text-muted-foreground">
                          {amad.party_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {amad.commodity_name}
                        </p>
                      </div>
                      <Badge variant="secondary">
                        {amad.remaining_packets} pkts
                      </Badge>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Selected Amad Display */}
          {state.amad && (
            <div className="rounded-lg border bg-muted/50 p-3">
              <p className="text-sm font-medium">Selected: {state.amad.amad_no}</p>
              <p className="text-xs text-muted-foreground">
                {state.amad.party_name} - {state.amad.commodity_name}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Available: {state.amad.remaining_packets} packets
              </p>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={onNext} disabled={!canProceed}>
          Next
        </Button>
      </div>
    </div>
  )
}
