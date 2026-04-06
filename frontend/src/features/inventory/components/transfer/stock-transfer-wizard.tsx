import * as React from "react"
import { CheckIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FormDatePicker } from "@/components/ui/form-date-picker"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PartyCombobox } from "../shared/party-combobox"
import { AmadCombobox } from "../shared/amad-combobox"
import { rentService } from "../../api/rent"
import type { AmadSummary, Amad } from "../../types/amad"

interface StockTransferWizardProps {
  amads: AmadSummary[]
  onSuccess: (newAmad: Amad) => void
  onCancel: () => void
}

type Step = 1 | 2 | 3 | 4

interface StepIndicatorProps {
  currentStep: Step
  steps: { label: string }[]
}

function StepIndicator({ currentStep, steps }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-between mb-8" data-testid="transfer-step-indicator">
      {steps.map((step, index) => {
        const stepNumber = (index + 1) as Step
        const isCompleted = stepNumber < currentStep
        const isCurrent = stepNumber === currentStep

        return (
          <div key={index} className="flex items-center">
            <div
              className={cn(
                "flex items-center justify-center size-8 rounded-full border-2",
                isCompleted && "bg-primary border-primary text-primary-foreground",
                isCurrent && "border-primary text-primary",
                !isCompleted && !isCurrent && "border-muted text-muted-foreground"
              )}
              data-testid={`transfer-step-${stepNumber}`}
            >
              {isCompleted ? (
                <CheckIcon className="size-4" />
              ) : (
                <span className="text-sm font-medium">{stepNumber}</span>
              )}
            </div>
            <span
              className={cn(
                "ml-2 text-sm font-medium",
                isCurrent && "text-foreground",
                !isCurrent && "text-muted-foreground"
              )}
            >
              {step.label}
            </span>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "w-12 h-0.5 mx-4",
                  isCompleted ? "bg-primary" : "bg-muted"
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

export function StockTransferWizard({
  amads,
  onSuccess,
  onCancel,
}: StockTransferWizardProps) {
  const [step, setStep] = React.useState<Step>(1)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  // Form state
  const [sourcePartyId, setSourcePartyId] = React.useState("")
  const [selectedAmadId, setSelectedAmadId] = React.useState("")
  const [destPartyId, setDestPartyId] = React.useState("")
  const [packets, setPackets] = React.useState(0)
  const [weight, setWeight] = React.useState(0)
  const [date, setDate] = React.useState(new Date().toISOString().split("T")[0])
  const [narration, setNarration] = React.useState("")

  const selectedAmad = amads.find((a) => a.id === selectedAmadId)

  const steps = [
    { label: "Select Source" },
    { label: "Select Destination" },
    { label: "Specify Quantity" },
    { label: "Review & Confirm" },
  ]

  // Auto-set source party when amad is selected
  React.useEffect(() => {
    if (selectedAmad) {
      setSourcePartyId(selectedAmad.party)
      setPackets(selectedAmad.remaining_packets)
      setWeight(selectedAmad.remaining_weight)
    }
  }, [selectedAmad])

  const canProceed = () => {
    switch (step) {
      case 1:
        return !!selectedAmadId
      case 2:
        return !!destPartyId && destPartyId !== sourcePartyId
      case 3:
        return packets > 0 && weight > 0 && packets <= (selectedAmad?.remaining_packets || 0) && weight <= (selectedAmad?.remaining_weight || 0)
      case 4:
        return true
      default:
        return false
    }
  }

  const handleNext = () => {
    if (step < 4) {
      setStep((step + 1) as Step)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep((step - 1) as Step)
    }
  }

  const handleSubmit = async () => {
    if (!selectedAmadId || !destPartyId) return

    setLoading(true)
    setError(null)

    try {
      const result = await rentService.transferStock({
        amad_id: selectedAmadId,
        to_party_id: destPartyId,
        date,
        packets,
        weight,
        narration: narration || undefined,
      })
      onSuccess(result.new_amad)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to transfer stock")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6" data-testid="transfer-wizard">
      <StepIndicator currentStep={step} steps={steps} />

      {error && (
        <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md" data-testid="transfer-error">
          {error}
        </div>
      )}

      {/* Step 1: Select Source */}
      {step === 1 && (
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label>Source Party (Optional filter)</Label>
              <PartyCombobox
                value={sourcePartyId}
                onChange={setSourcePartyId}
                placeholder="Filter by party..."
                data-testid="transfer-source-party"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Select Amad to Transfer</Label>
              <AmadCombobox
                amads={amads}
                value={selectedAmadId}
                onChange={setSelectedAmadId}
                filterByParty={sourcePartyId || undefined}
                placeholder="Select source amad..."
                data-testid="transfer-source-amad"
              />
            </div>
          </div>

          {selectedAmad && (
            <Card data-testid="transfer-source-detail">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Selected Amad Details</CardTitle>
              </CardHeader>
              <CardContent className="text-sm flex flex-col gap-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amad No:</span>
                  <span className="font-mono">{selectedAmad.amad_no}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Party:</span>
                  <span>{selectedAmad.party_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Commodity:</span>
                  <span>{selectedAmad.commodity_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Available:</span>
                  <span className="font-mono">
                    {selectedAmad.remaining_packets} pkts / {selectedAmad.remaining_weight.toLocaleString("en-IN")} kg
                  </span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Step 2: Select Destination */}
      {step === 2 && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label>Destination Party</Label>
            <PartyCombobox
              value={destPartyId}
              onChange={setDestPartyId}
              placeholder="Select destination party..."
              data-testid="transfer-dest-party"
            />
          </div>

          {destPartyId === sourcePartyId && (
            <p className="text-sm text-destructive" data-testid="transfer-same-party-error">
              Destination party must be different from source party
            </p>
          )}

          <div className="flex flex-col gap-2">
            <Label>Transfer Date</Label>
            <FormDatePicker
              value={date}
              onChange={(val) => setDate(val)}
              data-testid="transfer-date-input"
            />
          </div>
        </div>
      )}

      {/* Step 3: Specify Quantity */}
      {step === 3 && (
        <div className="flex flex-col gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label>
                Packets (max: {selectedAmad?.remaining_packets})
              </Label>
              <Input
                type="number"
                min="1"
                max={selectedAmad?.remaining_packets}
                value={packets}
                onChange={(e) => setPackets(Number(e.target.value) || 0)}
                data-testid="transfer-packets-input"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>
                Weight in kg (max: {selectedAmad?.remaining_weight.toLocaleString("en-IN")})
              </Label>
              <Input
                type="number"
                min="0.01"
                step="0.01"
                max={selectedAmad?.remaining_weight}
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value) || 0)}
                data-testid="transfer-weight-input"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label>Narration (Optional)</Label>
            <Textarea
              placeholder="Notes about this transfer..."
              value={narration}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNarration(e.target.value)}
              rows={3}
              data-testid="transfer-narration-input"
            />
          </div>
        </div>
      )}

      {/* Step 4: Review & Confirm */}
      {step === 4 && (
        <Card data-testid="transfer-summary">
          <CardHeader>
            <CardTitle className="text-base">Transfer Summary</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid gap-2 text-sm">
              <div className="flex justify-between py-1 border-b">
                <span className="text-muted-foreground">Source Amad:</span>
                <span className="font-mono">{selectedAmad?.amad_no}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-muted-foreground">From Party:</span>
                <span>{selectedAmad?.party_name}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-muted-foreground">To Party:</span>
                <span>{amads.find((a) => a.party === destPartyId)?.party_name || "Selected"}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-muted-foreground">Commodity:</span>
                <span>{selectedAmad?.commodity_name}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-muted-foreground">Transfer Date:</span>
                <span>{new Date(date).toLocaleDateString("en-IN")}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-muted-foreground">Packets:</span>
                <span className="font-mono">{packets.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-muted-foreground">Weight:</span>
                <span className="font-mono">{weight.toLocaleString("en-IN")} kg</span>
              </div>
              {narration && (
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Narration:</span>
                  <span className="text-right max-w-[200px]">{narration}</span>
                </div>
              )}
            </div>

            <p className="text-sm text-muted-foreground">
              This will create a new Amad entry for the destination party with the specified quantity.
              No rent will be charged for this transfer.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={step === 1 ? onCancel : handleBack}
          data-testid="transfer-prev-button"
        >
          {step === 1 ? "Cancel" : "Back"}
        </Button>
        {step < 4 ? (
          <Button onClick={handleNext} disabled={!canProceed()} data-testid="transfer-next-button">
            Next
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={loading || !canProceed()} data-testid="transfer-confirm-button">
            {loading ? "Transferring..." : "Confirm Transfer"}
          </Button>
        )}
      </div>
    </div>
  )
}
