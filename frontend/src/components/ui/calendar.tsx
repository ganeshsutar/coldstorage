import * as React from "react"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
} from "date-fns"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export interface CalendarProps {
  mode?: "single"
  selected?: Date
  onSelect?: (date: Date | undefined) => void
  disabled?: (date: Date) => boolean
  className?: string
}

function Calendar({
  selected,
  onSelect,
  disabled,
  className,
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(selected || new Date())

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(monthStart)
  const startDate = startOfWeek(monthStart)
  const endDate = endOfWeek(monthEnd)

  const days = eachDayOfInterval({ start: startDate, end: endDate })

  const weekDays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]

  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1))
  }

  const handleDayClick = (day: Date) => {
    if (disabled?.(day)) return
    onSelect?.(day)
  }

  return (
    <div data-slot="calendar" className={cn("p-3", className)}>
      <div className="flex items-center justify-between mb-2">
        <Button
          variant="outline"
          size="icon"
          aria-label="Previous month"
          onClick={handlePrevMonth}
          className="h-7 w-7"
        >
          <ChevronLeftIcon className="h-4 w-4" />
        </Button>
        <div className="text-sm font-medium">
          {format(currentMonth, "MMMM yyyy")}
        </div>
        <Button
          variant="outline"
          size="icon"
          aria-label="Next month"
          onClick={handleNextMonth}
          className="h-7 w-7"
        >
          <ChevronRightIcon className="h-4 w-4" />
        </Button>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {weekDays.map((day) => (
          <div
            key={day}
            className="text-muted-foreground text-center text-xs font-medium py-1"
          >
            {day}
          </div>
        ))}
        {days.map((day) => {
          const isSelected = selected ? isSameDay(day, selected) : false
          const isCurrentMonth = isSameMonth(day, currentMonth)
          const isTodayDate = isToday(day)
          const isDisabled = disabled?.(day)

          return (
            <button
              key={day.toISOString()}
              type="button"
              onClick={() => handleDayClick(day)}
              disabled={isDisabled}
              className={cn(
                "h-8 w-8 rounded-md text-sm font-normal inline-flex items-center justify-center",
                "hover:bg-accent hover:text-accent-foreground",
                "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                !isCurrentMonth && "text-muted-foreground opacity-50",
                isSelected && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                isTodayDate && !isSelected && "bg-accent text-accent-foreground",
                isDisabled && "opacity-50 pointer-events-none"
              )}
            >
              {format(day, "d")}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export { Calendar }
