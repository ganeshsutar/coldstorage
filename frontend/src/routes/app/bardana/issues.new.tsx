import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { BardanaIssueForm } from "@/features/bardana/components"
import { useAccounts } from "@/features/accounting/hooks/use-accounts"

export function NewBardanaIssuePage() {
  const { accounts } = useAccounts()

  return (
    <DashboardLayout activeNavItemId="bardana">
      <BardanaIssueForm
        accounts={accounts.map((a) => ({ id: a.id, code: a.code, name: a.name }))}
      />
    </DashboardLayout>
  )
}
