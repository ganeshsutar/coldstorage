import * as React from "react"
import { format, startOfMonth, endOfMonth } from "date-fns"
import { CalculatorIcon, SendIcon, EyeIcon } from "lucide-react"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  CalculationParams,
  PartySelector,
  ComponentCheckboxes,
  InterestResultTable,
} from "@/features/accounting/components/interest"
import {
  useInterestCalculation,
  interestService,
  formatCurrency,
  type ComponentType,
} from "@/features/accounting"

export function InterestPage() {
  const today = new Date()
  const [fromDate, setFromDate] = React.useState(startOfMonth(today))
  const [toDate, setToDate] = React.useState(endOfMonth(today))
  const [rate, setRate] = React.useState(1.5)
  const [daysInYear, setDaysInYear] = React.useState<360 | 365>(360)
  const [partySelection, setPartySelection] = React.useState<"all" | "selected">("all")
  const [components, setComponents] = React.useState<ComponentType[]>([
    "rent",
    "loan",
    "bardana",
  ])
  const [posting, setPosting] = React.useState(false)

  const { result, loading, error, calculate, reset } = useInterestCalculation()

  const handleCalculate = async () => {
    await calculate({
      from_date: format(fromDate, "yyyy-MM-dd"),
      to_date: format(toDate, "yyyy-MM-dd"),
      rate,
      days_in_year: daysInYear,
      party_selection: partySelection,
      components,
    })
  }

  const handlePost = async () => {
    if (!result) return

    try {
      setPosting(true)
      await interestService.postInterest({
        calculation_id: result.calculated_at,
        post_date: format(new Date(), "yyyy-MM-dd"),
      })
      reset()
    } catch (err) {
      console.error("Failed to post interest:", err)
    } finally {
      setPosting(false)
    }
  }

  return (
    <DashboardLayout activeNavItemId="interest">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Interest Calculation</h1>
            <p className="text-sm text-muted-foreground">
              Calculate and post interest on party balances
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">
              Parameters
            </CardTitle>
            <CardDescription>
              Configure interest calculation parameters
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <CalculationParams
              fromDate={fromDate}
              toDate={toDate}
              rate={rate}
              daysInYear={daysInYear}
              onFromDateChange={setFromDate}
              onToDateChange={setToDate}
              onRateChange={setRate}
              onDaysInYearChange={setDaysInYear}
            />

            <Separator />

            <PartySelector
              selection={partySelection}
              onChange={setPartySelection}
            />

            <Separator />

            <ComponentCheckboxes
              selected={components}
              onChange={setComponents}
            />

            <div className="flex justify-end">
              <Button
                onClick={handleCalculate}
                disabled={loading || components.length === 0}
              >
                <CalculatorIcon className="mr-2 h-4 w-4" />
                {loading ? "Calculating..." : "Calculate Interest"}
              </Button>
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </CardContent>
        </Card>

        {result && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-medium">
                    Calculation Results
                  </CardTitle>
                  <CardDescription>
                    {format(fromDate, "dd MMM yyyy")} to{" "}
                    {format(toDate, "dd MMM yyyy")} @ {rate}% per month
                  </CardDescription>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Total Interest</p>
                  <p className="text-2xl font-bold font-mono text-red-600">
                    {formatCurrency(result.total_interest)}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <InterestResultTable result={result} />

              <Separator />

              <div className="flex justify-end gap-2">
                <Button variant="outline">
                  <EyeIcon className="mr-2 h-4 w-4" />
                  Preview
                </Button>
                <Button
                  onClick={handlePost}
                  disabled={posting}
                >
                  <SendIcon className="mr-2 h-4 w-4" />
                  {posting ? "Posting..." : "Post Interest"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
