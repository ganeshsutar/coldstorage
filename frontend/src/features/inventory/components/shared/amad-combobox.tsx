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
import type { AmadSummary } from "../../types/amad"

interface AmadComboboxProps {
  amads: AmadSummary[]
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  placeholder?: string
  filterByParty?: string
  "data-testid"?: string
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "2-digit",
  })
}

export function AmadCombobox({
  amads,
  value,
  onChange,
  disabled,
  placeholder = "Select amad...",
  filterByParty,
  "data-testid": dataTestId,
}: AmadComboboxProps) {
  const [open, setOpen] = React.useState(false)

  const filteredAmads = React.useMemo(() => {
    let result = amads.filter((a) => !a.is_fully_dispatched)
    if (filterByParty) {
      result = result.filter((a) => a.party === filterByParty)
    }
    return result
  }, [amads, filterByParty])

  const selectedAmad = amads.find((a) => a.id === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled}
          data-testid={dataTestId}
        >
          {selectedAmad ? (
            <span className="truncate">
              {selectedAmad.amad_no} - {selectedAmad.commodity_name} ({selectedAmad.remaining_packets} pkts)
            </span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[450px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search amad..." />
          <CommandList>
            <CommandEmpty>No amad found with available stock.</CommandEmpty>
            <CommandGroup>
              {filteredAmads.map((amad) => (
                <CommandItem
                  key={amad.id}
                  onSelect={() => {
                    onChange(amad.id)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === amad.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col flex-1">
                    <div className="flex justify-between">
                      <span className="font-mono">{amad.amad_no}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(amad.date)}
                      </span>
                    </div>
                    <span className="text-sm">{amad.commodity_name}</span>
                    <span className="text-xs text-muted-foreground">
                      {amad.party_name} | Remaining: {amad.remaining_packets} pkts, {amad.remaining_weight.toLocaleString("en-IN")} kg
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
