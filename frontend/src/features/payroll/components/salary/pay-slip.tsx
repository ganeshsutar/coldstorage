import { useNavigate } from "@tanstack/react-router"
import { ArrowLeft, Printer } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { useAttendanceDetail } from "../../hooks"
import { formatCurrency, getMonthName } from "../../utils"

interface PaySlipProps {
  attendanceId: string
}

export function PaySlip({ attendanceId }: PaySlipProps) {
  const navigate = useNavigate()
  const { data: attendance, isLoading } = useAttendanceDetail(attendanceId)

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Loading pay slip...</div>
  }

  if (!attendance) {
    return <div className="text-center py-8 text-muted-foreground">Pay slip not found.</div>
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between print:hidden">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate({ to: "/app/payroll/salary" })}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Pay Slip</h2>
            <p className="text-muted-foreground">
              {attendance.employee_name} - {getMonthName(attendance.month)} {attendance.year}
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={handlePrint}>
          <Printer className="mr-2 h-4 w-4" />
          Print
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-center">
            Pay Slip - {getMonthName(attendance.month)} {attendance.year}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 text-sm">
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Employee</span>
                <span className="font-medium">{attendance.employee_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Days in Month</span>
                <span>{attendance.month_days}</span>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Present Days</span>
                <span>{attendance.present_days}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">LWP</span>
                <span>{attendance.lwp}</span>
              </div>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <h4 className="font-semibold mb-2 text-sm">Earnings</h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Component</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Basic Salary</TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(attendance.basic_salary)}
                    </TableCell>
                  </TableRow>
                  {attendance.allowance_items?.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell className="text-right font-mono">
                        {formatCurrency(item.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="font-bold">
                    <TableCell>Gross Salary</TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(attendance.gross_salary)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            <div>
              <h4 className="font-semibold mb-2 text-sm">Deductions</h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Component</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendance.deduction_items?.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell className="text-right font-mono">
                        {formatCurrency(item.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                  {attendance.pf_employee > 0 && (
                    <TableRow>
                      <TableCell>PF (Employee)</TableCell>
                      <TableCell className="text-right font-mono">
                        {formatCurrency(attendance.pf_employee)}
                      </TableCell>
                    </TableRow>
                  )}
                  {attendance.esi_employee > 0 && (
                    <TableRow>
                      <TableCell>ESI (Employee)</TableCell>
                      <TableCell className="text-right font-mono">
                        {formatCurrency(attendance.esi_employee)}
                      </TableCell>
                    </TableRow>
                  )}
                  {attendance.loan_emi > 0 && (
                    <TableRow>
                      <TableCell>Loan EMI</TableCell>
                      <TableCell className="text-right font-mono">
                        {formatCurrency(attendance.loan_emi)}
                      </TableCell>
                    </TableRow>
                  )}
                  <TableRow className="font-bold">
                    <TableCell>Total Deductions</TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(
                        attendance.total_deductions +
                          attendance.pf_employee +
                          attendance.esi_employee +
                          attendance.loan_emi
                      )}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between text-lg font-bold">
              <span>Net Salary</span>
              <span className="font-mono">{formatCurrency(attendance.net_salary)}</span>
            </div>
          </div>

          {(attendance.pf_employer > 0 || attendance.esi_employer > 0) && (
            <div className="border-t pt-4 text-sm text-muted-foreground">
              <h4 className="font-semibold mb-1">Employer Contributions</h4>
              <div className="flex gap-6">
                {attendance.pf_employer > 0 && (
                  <span>PF: {formatCurrency(attendance.pf_employer)}</span>
                )}
                {attendance.esi_employer > 0 && (
                  <span>ESI: {formatCurrency(attendance.esi_employer)}</span>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
