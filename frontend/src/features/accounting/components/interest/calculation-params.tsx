import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DatePicker } from "@/components/ui/date-picker"

interface CalculationParamsProps {
  fromDate: Date
  toDate: Date
  rate: number
  daysInYear: 360 | 365
  onFromDateChange: (date: Date) => void
  onToDateChange: (date: Date) => void
  onRateChange: (rate: number) => void
  onDaysInYearChange: (days: 360 | 365) => void
}

export function CalculationParams({
  fromDate,
  toDate,
  rate,
  daysInYear,
  onFromDateChange,
  onToDateChange,
  onRateChange,
  onDaysInYearChange,
}: CalculationParamsProps) {
  return (
    <div data-slot="calculation-params" data-testid="calculation-params" className="space-y-4">
      <h3 className="font-medium">Calculation Parameters</h3>

      <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="space-y-2">
          <Label>From Date</Label>
          <DatePicker
            data-testid="interest-from-date-picker"
            date={fromDate}
            onDateChange={(d) => d && onFromDateChange(d)}
          />
        </div>

        <div className="space-y-2">
          <Label>To Date</Label>
          <DatePicker
            data-testid="interest-to-date-picker"
            date={toDate}
            onDateChange={(d) => d && onToDateChange(d)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="rate">Rate (% per month)</Label>
          <Input
            id="rate"
            data-testid="interest-rate-input"
            type="number"
            step="0.1"
            value={rate}
            onChange={(e) => onRateChange(parseFloat(e.target.value) || 0)}
            className="font-mono"
          />
        </div>

        <div className="space-y-2">
          <Label>Days in Year</Label>
          <Select
            value={String(daysInYear)}
            onValueChange={(v) => onDaysInYearChange(parseInt(v) as 360 | 365)}
          >
            <SelectTrigger data-testid="interest-days-in-year-select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="360">360 Days</SelectItem>
              <SelectItem value="365">365 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
