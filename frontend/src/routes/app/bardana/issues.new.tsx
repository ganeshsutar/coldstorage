import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { BardanaIssueForm } from "@/features/bardana/components"
import { useAccounts } from "@/features/accounting/hooks/use-accounts"

export function NewBardanaIssuePage() {
  const { accounts } = useAccounts()

  return (
    <DashboardLayout activeNavItemId="bardana" breadcrumbs={[{ label: "Bardana", to: "/app/bardana/issues" }, { label: "New Issue" }]}>
      <BardanaIssueForm
        accounts={accounts.map((a) => ({ id: a.id, code: a.code, name: a.name }))}
      />
    </DashboardLayout>
  )
}
