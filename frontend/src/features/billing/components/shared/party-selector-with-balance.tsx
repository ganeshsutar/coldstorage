import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { usePartyAccounts } from "@/features/accounting"
import { formatIndianRupees } from "../../utils/amount-to-words"

interface PartySelectorWithBalanceProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  placeholder?: string
  showOutstanding?: boolean
  outstandingBillsCount?: number
  outstandingAmount?: number
}

export function PartySelectorWithBalance({
  value,
  onChange,
  disabled,
  placeholder = "Select party...",
  showOutstanding = true,
  outstandingBillsCount,
  outstandingAmount,
}: PartySelectorWithBalanceProps) {
  const [open, setOpen] = React.useState(false)
  const { parties, loading } = usePartyAccounts()

  const selectedParty = parties.find((p) => p.id === value)

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={disabled || loading}
          >
            {selectedParty ? (
              <span className="truncate">
                {selectedParty.name} ({selectedParty.code})
              </span>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0" align="start">
          <Command>
            <CommandInput placeholder="Search party..." />
            <CommandList>
              <CommandEmpty>No party found.</CommandEmpty>
              <CommandGroup>
                {parties.map((party) => (
                  <CommandItem
                    key={party.id}
                    onSelect={() => {
                      onChange(party.id)
                      setOpen(false)
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === party.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col">
                      <span>{party.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {party.code} | Balance:{" "}
                        {formatIndianRupees(party.balance)}{" "}
                        {party.balance_type}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {showOutstanding && selectedParty && (
        <div className="text-sm text-muted-foreground flex items-center gap-4">
          <span>
            Current Balance:{" "}
            <span
              className={cn(
                "font-medium",
                selectedParty.balance_type === "Dr"
                  ? "text-destructive"
                  : "text-green-600"
              )}
            >
              {formatIndianRupees(selectedParty.balance)} ({selectedParty.balance_type})
            </span>
          </span>
          {outstandingBillsCount !== undefined && (
            <span>
              Outstanding Bills:{" "}
              <span className="font-medium">{outstandingBillsCount}</span>
            </span>
          )}
          {outstandingAmount !== undefined && outstandingAmount > 0 && (
            <span>
              Outstanding:{" "}
              <span className="font-medium text-destructive">
                {formatIndianRupees(outstandingAmount)}
              </span>
            </span>
          )}
        </div>
      )}
    </div>
  )
}
