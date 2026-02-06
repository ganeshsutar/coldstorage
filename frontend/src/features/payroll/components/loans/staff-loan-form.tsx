import * as React from "react"
import { useNavigate } from "@tanstack/react-router"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { useCreateStaffLoan, useEmployees } from "../../hooks"

export function StaffLoanForm() {
  const navigate = useNavigate()
  const createLoan = useCreateStaffLoan()
  const { data: employees } = useEmployees({ status: "ACTIVE" })

  const [employeeId, setEmployeeId] = React.useState("")
  const [loanDate, setLoanDate] = React.useState(new Date().toISOString().split("T")[0])
  const [loanAmount, setLoanAmount] = React.useState(0)
  const [emi, setEmi] = React.useState(0)
  const [remarks, setRemarks] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)

  const handleSubmit = async () => {
    if (!employeeId || !loanAmount || !emi) {
      setError("Employee, loan amount, and EMI are required")
      return
    }

    setError(null)

    try {
      await createLoan.mutateAsync({
        employee_id: employeeId,
        loan_date: loanDate,
        loan_amount: loanAmount,
        emi,
        remarks: remarks || undefined,
      })
      navigate({ to: "/app/payroll" })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create loan")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate({ to: "/app/payroll" })}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">New Staff Loan</h2>
          <p className="text-muted-foreground">Issue a loan to an employee</p>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">{error}</div>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Loan Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="employee">Employee *</Label>
              <Select value={employeeId} onValueChange={setEmployeeId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees?.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.name} ({emp.employee_code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="loan_date">Loan Date *</Label>
              <Input
                id="loan_date"
                type="date"
                value={loanDate}
                onChange={(e) => setLoanDate(e.target.value)}
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="loan_amount">Loan Amount *</Label>
              <Input
                id="loan_amount"
                type="number"
                min="0"
                value={loanAmount || ""}
                onChange={(e) => setLoanAmount(parseFloat(e.target.value) || 0)}
                className="font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emi">Monthly EMI *</Label>
              <Input
                id="emi"
                type="number"
                min="0"
                value={emi || ""}
                onChange={(e) => setEmi(parseFloat(e.target.value) || 0)}
                className="font-mono"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="remarks">Remarks</Label>
            <Textarea
              id="remarks"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Add any notes..."
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between pt-4 border-t">
        <Button variant="outline" onClick={() => navigate({ to: "/app/payroll" })}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={createLoan.isPending}>
          {createLoan.isPending ? "Saving..." : "Save Loan"}
        </Button>
      </div>
    </div>
  )
}
