import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { BardanaReturnForm } from "@/features/bardana/components"
import { useAccounts } from "@/features/accounting/hooks/use-accounts"

export function NewBardanaReturnPage() {
  const { accounts } = useAccounts()

  return (
    <DashboardLayout activeNavItemId="bardana">
      <BardanaReturnForm
        accounts={accounts.map((a) => ({ id: a.id, code: a.code, name: a.name }))}
      />
    </DashboardLayout>
  )
}
