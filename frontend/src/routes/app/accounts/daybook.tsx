import * as React from "react"
import { format } from "date-fns"
import { LockIcon } from "lucide-react"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  DateNavigator,
  DailySummaryCards,
  TransactionFilters,
  DaybookTransactionTable,
} from "@/features/accounting/components/daybook"
import { useDaybook, type DaybookTab } from "@/features/accounting"

export function DaybookPage() {
  const [date, setDate] = React.useState(new Date())
  const [activeTab, setActiveTab] = React.useState<DaybookTab>("all")

  const dateStr = format(date, "yyyy-MM-dd")
  const { summary, transactions, loading, filterByType } = useDaybook(dateStr)

  const handleTabChange = (tab: DaybookTab) => {
    setActiveTab(tab)
    filterByType(tab)
  }

  const counts = React.useMemo(() => {
    return {
      all: transactions.length,
      receipts: transactions.filter((t) => t.voucher_type === "CR").length,
      payments: transactions.filter((t) => t.voucher_type === "DR").length,
      journal: transactions.filter(
        (t) => t.voucher_type === "JV" || t.voucher_type === "CV"
      ).length,
    }
  }, [transactions])

  return (
    <DashboardLayout activeNavItemId="daybook" breadcrumbs={[{ label: "Accounts", to: "/app/accounts/party-ledger" }, { label: "Daybook" }]}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 data-testid="daybook-title" className="text-2xl font-semibold">Daybook</h1>
            <p className="text-sm text-muted-foreground">
              Daily transaction summary and details
            </p>
          </div>
          <div className="flex items-center gap-4">
            <DateNavigator date={date} onChange={setDate} />
            {summary?.is_closed ? (
              <Badge data-testid="daybook-day-closed-badge" variant="secondary" className="gap-1">
                <LockIcon className="h-3 w-3" />
                Day Closed
              </Badge>
            ) : (
              <Button data-testid="daybook-close-day-button" variant="outline">Close Day</Button>
            )}
          </div>
        </div>

        <DailySummaryCards summary={summary} loading={loading} />

        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <CardTitle className="text-base font-medium">
                Transactions - {format(date, "dd MMM yyyy")}
              </CardTitle>
              <TransactionFilters
                value={activeTab}
                onChange={handleTabChange}
                counts={counts}
              />
            </div>
          </CardHeader>
          <CardContent>
            <DaybookTransactionTable
              transactions={transactions}
              loading={loading}
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
