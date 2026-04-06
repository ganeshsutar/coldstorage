import * as React from "react"
import { useNavigate } from "@tanstack/react-router"
import { ArrowLeftIcon } from "lucide-react"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  SourceStep,
  DestinationStep,
  QuantityStep,
  ConfirmStep,
} from "@/features/warehouse/components/shifting"
import { useNextNumber } from "@/features/system"
import type { ShiftingWizardState } from "@/features/warehouse/types/shifting"

const initialState: ShiftingWizardState = {
  step: 1,
  pkt1: 0,
  pkt2: 0,
  pkt3: 0,
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

export function NewShiftingPage() {
  const navigate = useNavigate()
  const { nextNumber: nextShiftNo } = useNextNumber("SHIFT")
  const [state, setState] = React.useState<ShiftingWizardState>(initialState)

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
    navigate({ to: "/app/warehouse/shifting" })
  }

  const handleCancel = () => {
    navigate({ to: "/app/warehouse/shifting" })
  }

  const progress = (state.step / 4) * 100

  return (
    <DashboardLayout activeNavItemId="shifting" breadcrumbs={[{ label: "Chambers", to: "/app/warehouse" }, { label: "New Shift" }]}>
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Go back"
            onClick={() => navigate({ to: "/app/warehouse/shifting" })}
            data-testid="new-shifting-back-button"
          >
            <ArrowLeftIcon className="size-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold" data-testid="new-shifting-title">
              New Shift - {stepTitles[state.step]}
              {nextShiftNo && <span className="text-muted-foreground font-mono text-sm ml-2">({nextShiftNo})</span>}
            </h1>
            <p className="text-sm text-muted-foreground">
              {stepDescriptions[state.step]}
            </p>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between mb-2 text-sm text-muted-foreground">
              <span>Step {state.step} of 4</span>
              <span>{progress.toFixed(0)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </CardHeader>
          <CardContent>
            {state.step === 1 && (
              <SourceStep
                state={state}
                updateState={updateState}
                onNext={goNext}
                onCancel={handleCancel}
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
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
