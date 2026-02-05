import * as React from "react"
import { useNavigate } from "@tanstack/react-router"

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { WizardStepIndicator } from "./wizard-step-indicator"
import { StepSelectAmads } from "./step-select-amads"
import { StepAddCharges, type ChargesFormData } from "./step-add-charges"
import { StepPreview } from "./step-preview"
import { useBillableAmads, useCreateRentBill } from "../../hooks/use-rent-bills"
import type { RentBillCreateRequest } from "../../types"

type Step = 1 | 2 | 3

const WIZARD_STEPS = [
  { label: "Select Amads" },
  { label: "Add Charges" },
  { label: "Preview" },
]

const DEFAULT_CHARGES: ChargesFormData = {
  loadingRate: 3,
  loadingQty: 0,
  unloadingRate: 3,
  unloadingQty: 0,
  dalaRate: 2,
  dalaQty: 0,
  kataiRate: 0,
  kataiQty: 0,
  insuranceAmount: 0,
  customCharges: [],
}

interface BillWizardSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (billId: string) => void
}

export function BillWizardSheet({
  open,
  onOpenChange,
  onSuccess,
}: BillWizardSheetProps) {
  const navigate = useNavigate()
  const [step, setStep] = React.useState<Step>(1)
  const [error, setError] = React.useState<string | null>(null)

  // Wizard state
  const [partyId, setPartyId] = React.useState("")
  const [selectedAmadIds, setSelectedAmadIds] = React.useState<string[]>([])
  const [charges, setCharges] = React.useState<ChargesFormData>(DEFAULT_CHARGES)
  const [billDate] = React.useState(new Date().toISOString().split("T")[0])

  // Fetch billable amads
  const { data: amads = [] } = useBillableAmads(partyId || undefined)

  // Create mutation
  const createBillMutation = useCreateRentBill()

  // Get selected amads data
  const selectedAmads = amads.filter((a: { id: string }) => selectedAmadIds.includes(a.id))

  // Get party info from first amad (all should have same party)
  const partyInfo = selectedAmads.length > 0 ? selectedAmads[0] : null

  // Reset form when sheet closes
  React.useEffect(() => {
    if (!open) {
      // Reset after animation completes
      const timeout = setTimeout(() => {
        setStep(1)
        setPartyId("")
        setSelectedAmadIds([])
        setCharges(DEFAULT_CHARGES)
        setError(null)
      }, 300)
      return () => clearTimeout(timeout)
    }
  }, [open])

  const canProceed = () => {
    switch (step) {
      case 1:
        return partyId && selectedAmadIds.length > 0
      case 2:
        return true // Charges are optional
      case 3:
        return true
      default:
        return false
    }
  }

  const handleNext = () => {
    if (step < 3) {
      setStep((step + 1) as Step)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep((step - 1) as Step)
    }
  }

  const handleSubmit = async () => {
    if (!partyId || selectedAmadIds.length === 0) return

    setError(null)

    try {
      // Build request payload
      const loadingCharges = charges.loadingRate * charges.loadingQty
      const unloadingCharges = charges.unloadingRate * charges.unloadingQty
      const dalaCharges = charges.dalaRate * charges.dalaQty
      const kataiCharges = charges.kataiRate * charges.kataiQty
      const otherCharges = charges.customCharges.reduce(
        (sum, c) => sum + (c.amount || 0),
        0
      )

      const request: RentBillCreateRequest = {
        bill_date: billDate,
        party_id: partyId,
        loading_charges: loadingCharges,
        unloading_charges: unloadingCharges,
        dala_charges: dalaCharges,
        katai_charges: kataiCharges,
        insurance_amount: charges.insuranceAmount,
        other_charges: otherCharges,
        items: selectedAmadIds.map((amadId) => ({
          amad_id: amadId,
        })),
      }

      const result = await createBillMutation.mutateAsync(request)

      onOpenChange(false)

      if (onSuccess) {
        onSuccess(result.id)
      } else {
        navigate({ to: "/app/billing/$id", params: { id: result.id } })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create bill")
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-2xl overflow-y-auto"
        showCloseButton={false}
      >
        <SheetHeader>
          <SheetTitle>Generate Rent Bill (Kiraaya Bill)</SheetTitle>
          <SheetDescription>
            Create a new rent bill for dispatched amads
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 px-4 pb-4 space-y-6">
          {/* Step Indicator */}
          <WizardStepIndicator currentStep={step} steps={WIZARD_STEPS} />

          {/* Error Display */}
          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
              {error}
            </div>
          )}

          {/* Step Content */}
          {step === 1 && (
            <StepSelectAmads
              partyId={partyId}
              selectedAmadIds={selectedAmadIds}
              onPartyChange={setPartyId}
              onAmadSelectionChange={setSelectedAmadIds}
            />
          )}

          {step === 2 && (
            <StepAddCharges
              selectedAmads={selectedAmads}
              charges={charges}
              onChargesChange={setCharges}
              graceDays={7}
            />
          )}

          {step === 3 && partyInfo && (
            <StepPreview
              partyName={partyInfo.party_name}
              partyCode={partyInfo.party_code}
              selectedAmads={selectedAmads}
              charges={charges}
              graceDays={7}
              billDate={billDate}
            />
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={step === 1 ? () => onOpenChange(false) : handleBack}
            >
              {step === 1 ? "Cancel" : "Back"}
            </Button>
            {step < 3 ? (
              <Button onClick={handleNext} disabled={!canProceed()}>
                Next
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={createBillMutation.isPending || !canProceed()}
              >
                {createBillMutation.isPending ? "Generating..." : "Generate & Print"}
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
