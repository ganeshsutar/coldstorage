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
import type { Commodity } from "../../types/masters"

interface CommodityComboboxProps {
  commodities: Commodity[]
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  placeholder?: string
  "data-testid"?: string
}

export function CommodityCombobox({
  commodities,
  value,
  onChange,
  disabled,
  placeholder = "Select commodity...",
  "data-testid": dataTestId,
}: CommodityComboboxProps) {
  const [open, setOpen] = React.useState(false)

  const activeCommodities = commodities.filter((c) => c.is_active)
  const selectedCommodity = commodities.find((c) => c.id === value)

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
          {selectedCommodity ? (
            <span className="truncate">
              {selectedCommodity.name}
              {selectedCommodity.variety && ` (${selectedCommodity.variety})`}
            </span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[350px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search commodity..." />
          <CommandList>
            <CommandEmpty>No commodity found.</CommandEmpty>
            <CommandGroup>
              {activeCommodities.map((commodity) => (
                <CommandItem
                  key={commodity.id}
                  onSelect={() => {
                    onChange(commodity.id)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 size-4",
                      value === commodity.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col">
                    <span>
                      {commodity.name}
                      {commodity.variety && (
                        <span className="text-muted-foreground ml-1">
                          ({commodity.variety})
                        </span>
                      )}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {commodity.code} | Grace: {commodity.grace_days} days | Rate: Rs.{commodity.default_rent_rate}/qtl/mo
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
