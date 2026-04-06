import { addDays, subDays } from "date-fns"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { DatePicker } from "@/components/ui/date-picker"

interface DateNavigatorProps {
  date: Date
  onChange: (date: Date) => void
}

export function DateNavigator({ date, onChange }: DateNavigatorProps) {
  const handlePrev = () => {
    onChange(subDays(date, 1))
  }

  const handleNext = () => {
    onChange(addDays(date, 1))
  }

  const handleToday = () => {
    onChange(new Date())
  }

  return (
    <div
      data-slot="date-navigator"
      data-testid="date-navigator"
      className="flex items-center gap-2"
    >
      <Button data-testid="date-navigator-prev-button" variant="outline" size="icon" aria-label="Previous day" onClick={handlePrev}>
        <ChevronLeftIcon className="size-4" />
      </Button>

      <DatePicker
        data-testid="date-navigator-date-picker"
        date={date}
        onDateChange={(d) => d && onChange(d)}
        className="w-48"
      />

      <Button data-testid="date-navigator-next-button" variant="outline" size="icon" aria-label="Next day" onClick={handleNext}>
        <ChevronRightIcon className="size-4" />
      </Button>

      <Button
        data-testid="date-navigator-today-button"
        variant="ghost"
        size="sm"
        onClick={handleToday}
        className="ml-2"
      >
        Today
      </Button>
    </div>
  )
}
