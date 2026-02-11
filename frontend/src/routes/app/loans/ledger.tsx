import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { LoanLedgerView } from "@/features/loans"

export function LoanLedgerPage() {
  return (
    <DashboardLayout activeNavItemId="loans" breadcrumbs={[{ label: "Loans", to: "/app/loans" }, { label: "Ledger" }]}>
      <LoanLedgerView />
    </DashboardLayout>
  )
}
