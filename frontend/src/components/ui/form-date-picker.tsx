import * as React from "react"
import { format, parseISO } from "date-fns"
import { CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface FormDatePickerProps {
  value?: string
  onChange?: (value: string) => void
  onBlur?: () => void
  name?: string
  id?: string
  disabled?: boolean
  className?: string
  placeholder?: string
  "data-testid"?: string
}

const FormDatePicker = React.forwardRef<HTMLButtonElement, FormDatePickerProps>(
  (
    {
      value,
      onChange,
      onBlur,
      name,
      id,
      disabled,
      className,
      placeholder = "Pick a date",
      "data-testid": dataTestId,
    },
    ref
  ) => {
    const [open, setOpen] = React.useState(false)

    const dateValue = value ? parseISO(value) : undefined

    const handleSelect = (selected: Date | undefined) => {
      if (selected) {
        onChange?.(format(selected, "yyyy-MM-dd"))
      } else {
        onChange?.("")
      }
      setOpen(false)
    }

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            ref={ref}
            id={id}
            name={name}
            type="button"
            variant="outline"
            disabled={disabled}
            data-testid={dataTestId}
            data-empty={!value}
            onBlur={onBlur}
            className={cn(
              "w-full justify-start text-left font-normal data-[empty=true]:text-muted-foreground",
              className
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateValue ? format(dateValue, "dd/MM/yyyy") : <span>{placeholder}</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={dateValue}
            onSelect={handleSelect}
          />
        </PopoverContent>
      </Popover>
    )
  }
)
FormDatePicker.displayName = "FormDatePicker"

export { FormDatePicker }
