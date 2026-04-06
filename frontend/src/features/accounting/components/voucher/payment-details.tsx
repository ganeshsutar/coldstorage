import {
  BanknoteIcon,
  FileTextIcon,
  BuildingIcon,
  SmartphoneIcon,
} from "lucide-react"

import { Input } from "@/components/ui/input"
import { FormDatePicker } from "@/components/ui/form-date-picker"
import { Label } from "@/components/ui/label"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import type { PaymentDetails as PaymentDetailsType, PaymentMode } from "../../types/voucher"

interface PaymentDetailsProps {
  value: PaymentDetailsType
  onChange: (value: PaymentDetailsType) => void
}

const modes: { value: PaymentMode; label: string; icon: React.ElementType }[] = [
  { value: "cash", label: "Cash", icon: BanknoteIcon },
  { value: "cheque", label: "Cheque", icon: FileTextIcon },
  { value: "bank", label: "Bank", icon: BuildingIcon },
  { value: "upi", label: "UPI", icon: SmartphoneIcon },
]

export function PaymentDetails({ value, onChange }: PaymentDetailsProps) {
  const handleModeChange = (mode: string) => {
    if (mode) {
      onChange({ ...value, mode: mode as PaymentMode })
    }
  }

  const handleFieldChange = (field: keyof PaymentDetailsType, val: string) => {
    onChange({ ...value, [field]: val })
  }

  return (
    <div data-slot="payment-details" data-testid="payment-details" className="space-y-4">
      <div className="space-y-2">
        <Label>Payment Mode</Label>
        <ToggleGroup
          type="single"
          value={value.mode}
          onValueChange={handleModeChange}
          className="justify-start"
        >
          {modes.map((mode) => (
            <ToggleGroupItem
              key={mode.value}
              value={mode.value}
              data-testid={`payment-mode-${mode.value}`}
              className="gap-2"
            >
              <mode.icon className="size-4" />
              {mode.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      {value.mode === "cheque" && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="cheque_no">Cheque Number</Label>
            <Input
              id="cheque_no"
              data-testid="payment-cheque-no-input"
              value={value.cheque_no || ""}
              onChange={(e) => handleFieldChange("cheque_no", e.target.value)}
              placeholder="Enter cheque number"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cheque_date">Cheque Date</Label>
            <FormDatePicker
              id="cheque_date"
              data-testid="payment-cheque-date-input"
              value={value.cheque_date || ""}
              onChange={(val) => handleFieldChange("cheque_date", val)}
            />
          </div>
        </div>
      )}

      {value.mode === "bank" && (
        <div className="space-y-2">
          <Label htmlFor="bank_name">Bank Name</Label>
          <Input
            id="bank_name"
            data-testid="payment-bank-name-input"
            value={value.bank_name || ""}
            onChange={(e) => handleFieldChange("bank_name", e.target.value)}
            placeholder="Enter bank name"
          />
        </div>
      )}

      {value.mode === "upi" && (
        <div className="space-y-2">
          <Label htmlFor="upi_ref">UPI Reference</Label>
          <Input
            id="upi_ref"
            data-testid="payment-upi-ref-input"
            value={value.upi_ref || ""}
            onChange={(e) => handleFieldChange("upi_ref", e.target.value)}
            placeholder="Enter UPI reference number"
          />
        </div>
      )}
    </div>
  )
}
