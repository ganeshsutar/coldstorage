import { cn } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import type { ComponentType } from "../../types/interest"

interface ComponentCheckboxesProps {
  selected: ComponentType[]
  onChange: (selected: ComponentType[]) => void
}

const components: { value: ComponentType; label: string; color: string }[] = [
  { value: "rent", label: "Rent", color: "text-status-info-foreground" },
  { value: "loan", label: "Loan", color: "text-status-success-foreground" },
  { value: "bardana", label: "Bardana", color: "text-status-warning-foreground" },
  { value: "other", label: "Other", color: "text-gray-600" },
]

export function ComponentCheckboxes({
  selected,
  onChange,
}: ComponentCheckboxesProps) {
  const handleToggle = (component: ComponentType) => {
    if (selected.includes(component)) {
      onChange(selected.filter((c) => c !== component))
    } else {
      onChange([...selected, component])
    }
  }

  return (
    <div data-slot="component-checkboxes" data-testid="component-checkboxes" className="space-y-4">
      <h3 className="font-medium">Apply On</h3>

      <div className="flex flex-wrap gap-4">
        {components.map((component) => (
          <div key={component.value} className="flex items-center space-x-2">
            <Checkbox
              id={`component-${component.value}`}
              data-testid={`interest-component-${component.value}`}
              checked={selected.includes(component.value)}
              onCheckedChange={() => handleToggle(component.value)}
            />
            <Label
              htmlFor={`component-${component.value}`}
              className={cn("font-normal cursor-pointer", component.color)}
            >
              {component.label}
            </Label>
          </div>
        ))}
      </div>
    </div>
  )
}
