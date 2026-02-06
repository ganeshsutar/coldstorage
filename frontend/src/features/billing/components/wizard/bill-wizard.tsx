import * as React from "react"
import { useNavigate } from "@tanstack/react-router"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useNextNumber } from "@/features/system"
import { WizardStepIndicator } from "./wizard-step-indicator"
import { StepSelectAmads } from "./step-select-amads"
import { StepAddCharges, type ChargesFormData } from "./step-add-charges"
import { StepPreview } from "./step-preview"
import { useBillableAmads } from "../../hooks/use-rent-bills"
import { rentBillService } from "../../api/rent-bills"
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

interface BillWizardProps {
  onSuccess?: (billId: string) => void
  onCancel?: () => void
}

export function BillWizard({ onSuccess, onCancel }: BillWizardProps) {
  const navigate = useNavigate()
  const { nextNumber: nextBillNo, loading: numberLoading } = useNextNumber("RENT_BILL")
  const [step, setStep] = React.useState<Step>(1)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  // Wizard state
  const [partyId, setPartyId] = React.useState("")
  const [selectedAmadIds, setSelectedAmadIds] = React.useState<string[]>([])
  const [charges, setCharges] = React.useState<ChargesFormData>(DEFAULT_CHARGES)
  const [billDate] = React.useState(new Date().toISOString().split("T")[0])

  // Fetch billable amads
  const { data: amads = [] } = useBillableAmads(partyId || undefined)

  // Get selected amads data
  const selectedAmads = amads.filter((a: { id: string }) => selectedAmadIds.includes(a.id))

  // Get party info from first amad (all should have same party)
  const partyInfo = selectedAmads.length > 0 ? selectedAmads[0] : null

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

  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    } else {
      navigate({ to: "/app/billing" })
    }
  }

  const handleSubmit = async () => {
    if (!partyId || selectedAmadIds.length === 0) return

    setLoading(true)
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

      const result = await rentBillService.createRentBill(request)

      if (onSuccess) {
        onSuccess(result.id)
      } else {
        navigate({ to: "/app/billing/$id", params: { id: result.id } })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create bill")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleCancel}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Generate Rent Bill (Kiraaya Bill)
          </h1>
          <p className="text-muted-foreground">
            Create a new rent bill for dispatched amads
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Bill No:</span>
          <Input value={numberLoading ? "..." : nextBillNo} readOnly className="bg-muted font-mono w-40 h-9" />
        </div>
      </div>

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
          onClick={step === 1 ? handleCancel : handleBack}
        >
          {step === 1 ? "Cancel" : "Back"}
        </Button>
        {step < 3 ? (
          <Button onClick={handleNext} disabled={!canProceed()}>
            Next
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={loading || !canProceed()}>
            {loading ? "Generating..." : "Generate & Print"}
          </Button>
        )}
      </div>
    </div>
  )
}
