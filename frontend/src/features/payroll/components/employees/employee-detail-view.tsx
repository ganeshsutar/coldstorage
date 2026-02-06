import { useNavigate } from "@tanstack/react-router"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import { useEmployeeDetail } from "../../hooks"
import { getEmployeeStatusColor, formatCurrency, formatDate } from "../../utils"

interface EmployeeDetailViewProps {
  employeeId: string
}

export function EmployeeDetailView({ employeeId }: EmployeeDetailViewProps) {
  const navigate = useNavigate()
  const { data: employee, isLoading } = useEmployeeDetail(employeeId)

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Loading employee...</div>
  }

  if (!employee) {
    return <div className="text-center py-8 text-muted-foreground">Employee not found.</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate({ to: "/app/payroll" })}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{employee.name}</h2>
            <p className="text-muted-foreground font-mono">{employee.employee_code}</p>
          </div>
        </div>
        <Badge variant={getEmployeeStatusColor(employee.status)}>{employee.status_display}</Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Personal Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <InfoRow label="Phone" value={employee.phone} />
            <InfoRow label="Address" value={employee.address} />
            <InfoRow label="Aadhaar" value={employee.aadhaar} />
            <InfoRow label="PAN" value={employee.pan_number} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Employment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <InfoRow label="Designation" value={employee.designation} />
            <InfoRow label="Department" value={employee.department} />
            <InfoRow label="Pay Post" value={employee.pay_post_name} />
            <InfoRow
              label="Joining Date"
              value={employee.joining_date ? formatDate(employee.joining_date) : null}
            />
            <InfoRow label="Basic Salary" value={formatCurrency(employee.basic_salary)} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Bank Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <InfoRow label="Bank" value={employee.bank_name} />
            <InfoRow label="Account No" value={employee.bank_account_no} />
            <InfoRow label="IFSC" value={employee.bank_ifsc} />
            <InfoRow label="Branch" value={employee.bank_branch} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Statutory</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <InfoRow label="UAN" value={employee.uan} />
            <InfoRow label="PF Applicable" value={employee.pf_applicable ? "Yes" : "No"} />
            <InfoRow label="ESI Applicable" value={employee.esi_applicable ? "Yes" : "No"} />
          </CardContent>
        </Card>
      </div>

      {employee.allowances && employee.allowances.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Allowances</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {employee.allowances.map((a) => (
                <div key={a.id} className="flex justify-between text-sm">
                  <span>
                    {a.allowance_name}{" "}
                    <span className="text-muted-foreground">({a.component_type})</span>
                  </span>
                  <span className="font-mono">
                    {a.component_type === "PERCENTAGE" ? `${a.value}%` : formatCurrency(a.value)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {employee.deductions && employee.deductions.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Deductions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {employee.deductions.map((d) => (
                <div key={d.id} className="flex justify-between text-sm">
                  <span>
                    {d.deduction_name}{" "}
                    <span className="text-muted-foreground">({d.component_type})</span>
                  </span>
                  <span className="font-mono">
                    {d.component_type === "PERCENTAGE" ? `${d.value}%` : formatCurrency(d.value)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span>{value || "-"}</span>
    </div>
  )
}
