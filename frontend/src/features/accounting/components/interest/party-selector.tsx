import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

interface PartySelectorProps {
  selection: "all" | "selected"
  onChange: (selection: "all" | "selected") => void
}

export function PartySelector({ selection, onChange }: PartySelectorProps) {
  return (
    <div data-slot="party-selector" data-testid="party-selector" className="space-y-4">
      <h3 className="font-medium">Party Selection</h3>

      <RadioGroup
        value={selection}
        onValueChange={(v) => onChange(v as "all" | "selected")}
        className="flex flex-col sm:flex-row gap-4"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem data-testid="interest-party-all-radio" value="all" id="all-parties" />
          <Label htmlFor="all-parties" className="font-normal cursor-pointer">
            All Parties with Balance
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem data-testid="interest-party-selected-radio" value="selected" id="selected-parties" />
          <Label
            htmlFor="selected-parties"
            className="font-normal cursor-pointer"
          >
            Selected Parties Only
          </Label>
        </div>
      </RadioGroup>
    </div>
  )
}
