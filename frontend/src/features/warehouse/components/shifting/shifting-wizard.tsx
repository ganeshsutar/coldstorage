import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { SourceStep } from "./source-step"
import { DestinationStep } from "./destination-step"
import { QuantityStep } from "./quantity-step"
import { ConfirmStep } from "./confirm-step"
import { useNextNumber } from "@/features/system"
import type { AmadSummary } from "@/features/inventory"

export interface ShiftingWizardState {
  step: 1 | 2 | 3 | 4
  // Source location
  sourceRoomId?: string
  sourceFloorNumber?: number
  sourceRackNumber?: number
  // Destination location
  destinationRoomId?: string
  destinationFloorNumber?: number
  destinationRackNumber?: number
  // Selected Amad
  amadId?: string
  amad?: AmadSummary
  // Quantities
  pkt1: number
  pkt2: number
  pkt3: number
  // Additional info
  reason?: string
  remarks?: string
}

const initialState: ShiftingWizardState = {
  step: 1,
  pkt1: 0,
  pkt2: 0,
  pkt3: 0,
}

interface ShiftingWizardProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

const stepTitles = {
  1: "Select Source",
  2: "Select Destination",
  3: "Enter Quantities",
  4: "Confirm Shift",
}

const stepDescriptions = {
  1: "Choose the room, floor, rack, and Amad to shift goods from",
  2: "Choose where to shift the goods to",
  3: "Enter the quantity of packets to shift",
  4: "Review and confirm the shift details",
}

export function ShiftingWizard({
  open,
  onOpenChange,
  onSuccess,
}: ShiftingWizardProps) {
  const { nextNumber: nextShiftNo } = useNextNumber("SHIFT")
  const [state, setState] = React.useState<ShiftingWizardState>(initialState)

  // Reset state when dialog closes
  React.useEffect(() => {
    if (!open) {
      setState(initialState)
    }
  }, [open])

  const updateState = (updates: Partial<ShiftingWizardState>) => {
    setState((prev) => ({ ...prev, ...updates }))
  }

  const goToStep = (step: 1 | 2 | 3 | 4) => {
    updateState({ step })
  }

  const goNext = () => {
    if (state.step < 4) {
      goToStep((state.step + 1) as 1 | 2 | 3 | 4)
    }
  }

  const goBack = () => {
    if (state.step > 1) {
      goToStep((state.step - 1) as 1 | 2 | 3 | 4)
    }
  }

  const handleSuccess = () => {
    onOpenChange(false)
    onSuccess?.()
  }

  const progress = (state.step / 4) * 100

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>New Shift - {stepTitles[state.step]} {nextShiftNo && <span className="text-muted-foreground font-mono text-sm ml-2">({nextShiftNo})</span>}</DialogTitle>
          <DialogDescription>{stepDescriptions[state.step]}</DialogDescription>
        </DialogHeader>

        <div className="py-2">
          <div className="flex items-center justify-between mb-2 text-sm text-muted-foreground">
            <span>Step {state.step} of 4</span>
            <span>{progress.toFixed(0)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="py-4">
          {state.step === 1 && (
            <SourceStep
              state={state}
              updateState={updateState}
              onNext={goNext}
              onCancel={() => onOpenChange(false)}
            />
          )}
          {state.step === 2 && (
            <DestinationStep
              state={state}
              updateState={updateState}
              onNext={goNext}
              onBack={goBack}
            />
          )}
          {state.step === 3 && (
            <QuantityStep
              state={state}
              updateState={updateState}
              onNext={goNext}
              onBack={goBack}
            />
          )}
          {state.step === 4 && (
            <ConfirmStep
              state={state}
              onBack={goBack}
              onSuccess={handleSuccess}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
