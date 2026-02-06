import * as React from "react"
import { useNavigate } from "@tanstack/react-router"

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"

import { PayrollKpiCards } from "./dashboard"
import { EmployeeList } from "./employees"
import { AttendanceGrid } from "./attendance"
import { StaffLoanList } from "./loans"

export function PayrollDashboard() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = React.useState("employees")

  return (
    <div className="space-y-6">
      <PayrollKpiCards />

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Payroll</h2>
          <p className="text-muted-foreground">
            Manage employees, attendance, salary processing, and staff loans
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="employees">Employees</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="salary">Salary</TabsTrigger>
          <TabsTrigger value="loans">Staff Loans</TabsTrigger>
          <TabsTrigger value="ledger">Ledger</TabsTrigger>
        </TabsList>

        <TabsContent value="employees" className="mt-4">
          <EmployeeList />
        </TabsContent>

        <TabsContent value="attendance" className="mt-4">
          <AttendanceGrid />
        </TabsContent>

        <TabsContent value="salary" className="mt-4">
          <div className="flex justify-center py-8">
            <Button
              variant="outline"
              onClick={() => navigate({ to: "/app/payroll/salary" })}
            >
              Open Salary Processing
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="loans" className="mt-4">
          <StaffLoanList />
        </TabsContent>

        <TabsContent value="ledger" className="mt-4">
          <div className="flex justify-center py-8">
            <Button
              variant="outline"
              onClick={() => navigate({ to: "/app/payroll/ledger" })}
            >
              Open Full Ledger View
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
