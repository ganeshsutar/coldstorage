import { Users, UserCheck, Wallet, Landmark } from "lucide-react"
import { StatCard } from "@/components/ui/stat-card"
import { usePayrollStats } from "../../hooks"
import { formatCurrency } from "../../utils"

export function PayrollKpiCards() {
  const { data: stats, isLoading } = usePayrollStats()

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Employees"
        value={stats?.total_employees ?? 0}
        icon={Users}
        description="All employees"
        loading={isLoading}
      />
      <StatCard
        title="Active Employees"
        value={stats?.active_employees ?? 0}
        icon={UserCheck}
        description="Currently active"
        loading={isLoading}
      />
      <StatCard
        title="Salary Payable"
        value={stats?.salary_payable ?? 0}
        formatter={formatCurrency}
        icon={Wallet}
        description="Processed, pending confirmation"
        loading={isLoading}
      />
      <StatCard
        title="Loan Outstanding"
        value={stats?.loan_outstanding ?? 0}
        formatter={formatCurrency}
        icon={Landmark}
        description="Active staff loans"
        loading={isLoading}
      />
    </div>
  )
}
