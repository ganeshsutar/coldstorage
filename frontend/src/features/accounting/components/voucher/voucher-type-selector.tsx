import * as React from "react"

import { cn } from "@/lib/utils"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import type { VoucherType } from "../../types/voucher"
import { VOUCHER_TYPE_LABELS, VOUCHER_TYPE_SHORTCUTS } from "../../types/voucher"

interface VoucherTypeSelectorProps {
  value: VoucherType
  onChange: (value: VoucherType) => void
  disabled?: boolean
}

const voucherTypes: VoucherType[] = ["CR", "DR", "JV", "CV", "BH"]

export function VoucherTypeSelector({
  value,
  onChange,
  disabled,
}: VoucherTypeSelectorProps) {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (disabled) return
      const type = VOUCHER_TYPE_SHORTCUTS[e.key]
      if (type) {
        e.preventDefault()
        onChange(type)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [onChange, disabled])

  return (
    <div data-slot="voucher-type-selector" className="space-y-2">
      <ToggleGroup
        type="single"
        value={value}
        onValueChange={(v) => v && onChange(v as VoucherType)}
        disabled={disabled}
        className="justify-start"
      >
        {voucherTypes.map((type) => {
          const shortcut = Object.entries(VOUCHER_TYPE_SHORTCUTS).find(
            ([, t]) => t === type
          )?.[0]

          return (
            <ToggleGroupItem
              key={type}
              value={type}
              aria-label={VOUCHER_TYPE_LABELS[type]}
              className={cn(
                "px-4 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
              )}
            >
              <span className="font-medium">{type}</span>
              {shortcut && (
                <span className="ml-1.5 text-xs opacity-60">{shortcut}</span>
              )}
            </ToggleGroupItem>
          )
        })}
      </ToggleGroup>
      <p className="text-xs text-muted-foreground">
        {VOUCHER_TYPE_LABELS[value]}
      </p>
    </div>
  )
}
