import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { GradingForm } from "@/features/trading"

export function NewGradingPage() {
  return (
    <DashboardLayout activeNavItemId="trading" breadcrumbs={[{ label: "Trading", to: "/app/trading" }, { label: "New Grading" }]}>
      <GradingForm />
    </DashboardLayout>
  )
}
