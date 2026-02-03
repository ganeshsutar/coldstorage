import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { BankList } from "@/features/masters"

export function BanksPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <BankList />
      </div>
    </DashboardLayout>
  )
}
