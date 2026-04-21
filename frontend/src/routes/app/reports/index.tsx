import { Link } from "@tanstack/react-router"
import {
  BookOpen,
  Package,
  Users,
  FileText,
  Handshake,
  UserCheck,
  Calculator,
  Boxes,
} from "lucide-react"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface ReportCard {
  title: string
  description: string
  to: string
  icon: React.ComponentType<{ className?: string }>
}

const reportCards: ReportCard[] = [
  {
    title: "Cash Book",
    description: "Daily cash and bank transaction summary",
    to: "/app/reports/cash-book",
    icon: BookOpen,
  },
  {
    title: "Stock Report",
    description: "Inventory stock by commodity, room, and party",
    to: "/app/reports/stock",
    icon: Package,
  },
  {
    title: "Party Ledger Summary",
    description: "Ledger entries and balances by party",
    to: "/app/accounts/party-ledger",
    icon: Users,
  },
  {
    title: "Rent Bill Register",
    description: "Register of all rent bills with status",
    to: "/app/reports/rent-register",
    icon: FileText,
  },
  {
    title: "Sauda Register",
    description: "Trading deals register with status tracking",
    to: "/app/reports/sauda-register",
    icon: Handshake,
  },
  {
    title: "Payroll Summary",
    description: "Salary register, attendance, and staff loans",
    to: "/app/reports/payroll",
    icon: UserCheck,
  },
  {
    title: "Interest Statement",
    description: "Interest calculations and component breakdown",
    to: "/app/accounts/interest",
    icon: Calculator,
  },
  {
    title: "Bardana Outstanding",
    description: "Outstanding bardana issue and return tracking",
    to: "/app/bardana/outstanding",
    icon: Boxes,
  },
]

export function ReportsPage() {
  return (
    <DashboardLayout
      activeNavItemId="reports"
      breadcrumbs={[{ label: "Reports" }]}
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground">
            Access all reports and analytics for your cold storage operations.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {reportCards.map((card) => (
            <Link key={card.title} to={card.to} className="block">
              <Card className="h-full transition-colors hover:bg-accent/50 cursor-pointer">
                <CardHeader className="flex flex-row items-start gap-4 space-y-0">
                  <div className="rounded-md bg-muted p-2">
                    <card.icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="space-y-1">
                    <CardTitle className="text-base">{card.title}</CardTitle>
                    <CardDescription>{card.description}</CardDescription>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
