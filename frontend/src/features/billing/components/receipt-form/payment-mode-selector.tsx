import * as React from "react"
import { Banknote, CreditCard, Building2, Smartphone } from "lucide-react"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { cn } from "@/lib/utils"
import type { PaymentMode } from "../../types"

interface PaymentModeSelectorProps {
  value: PaymentMode
  onChange: (value: PaymentMode) => void
  disabled?: boolean
}

const modes: Array<{
  value: PaymentMode
  label: string
  icon: React.ComponentType<{ className?: string }>
}> = [
  { value: "CASH", label: "Cash", icon: Banknote },
  { value: "CHEQUE", label: "Cheque", icon: CreditCard },
  { value: "BANK", label: "Bank", icon: Building2 },
  { value: "UPI", label: "UPI", icon: Smartphone },
]

export function PaymentModeSelector({
  value,
  onChange,
  disabled,
}: PaymentModeSelectorProps) {
  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={(v) => v && onChange(v as PaymentMode)}
      disabled={disabled}
      className="justify-start"
    >
      {modes.map((mode) => {
        const Icon = mode.icon
        return (
          <ToggleGroupItem
            key={mode.value}
            value={mode.value}
            aria-label={mode.label}
            className={cn(
              "flex-1 sm:flex-none gap-2 px-4",
              value === mode.value && "bg-primary text-primary-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            <span>{mode.label}</span>
          </ToggleGroupItem>
        )
      })}
    </ToggleGroup>
  )
}
