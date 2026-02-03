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
      className="flex items-center gap-2"
    >
      <Button variant="outline" size="icon" onClick={handlePrev}>
        <ChevronLeftIcon className="h-4 w-4" />
      </Button>

      <DatePicker
        date={date}
        onDateChange={(d) => d && onChange(d)}
        className="w-48"
      />

      <Button variant="outline" size="icon" onClick={handleNext}>
        <ChevronRightIcon className="h-4 w-4" />
      </Button>

      <Button
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
