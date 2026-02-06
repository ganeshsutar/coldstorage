import * as React from "react"
import { useNavigate } from "@tanstack/react-router"
import { ArrowLeft, Check } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { useProcessSalary, useSalarySheet, useConfirmAttendance } from "../../hooks"
import { getAttendanceStatusColor, getMonthName, formatCurrency } from "../../utils"

export function SalaryProcessing() {
  const navigate = useNavigate()
  const now = new Date()
  const [month, setMonth] = React.useState(now.getMonth() + 1)
  const [year, setYear] = React.useState(now.getFullYear())

  const { data: salarySheet, isLoading, refetch } = useSalarySheet(month, year)
  const processSalary = useProcessSalary()
  const confirmAttendance = useConfirmAttendance()

  const handleProcessSalary = async () => {
    try {
      await processSalary.mutateAsync({ month, year })
      refetch()
    } catch (err) {
      console.error("Failed to process salary:", err)
    }
  }

  const handleConfirm = async (id: string) => {
    try {
      await confirmAttendance.mutateAsync(id)
      refetch()
    } catch (err) {
      console.error("Failed to confirm:", err)
    }
  }

  const handleConfirmAll = async () => {
    const processedRecords = salarySheet?.filter((r) => r.status === "PROCESSED") || []
    for (const record of processedRecords) {
      try {
        await confirmAttendance.mutateAsync(record.id)
      } catch (err) {
        console.error(`Failed to confirm ${record.employee_name}:`, err)
      }
    }
    refetch()
  }

  const hasProcessed = salarySheet?.some((r) => r.status === "PROCESSED")

  // Summary totals
  const totals = React.useMemo(() => {
    if (!salarySheet?.length) return null
    return {
      gross: salarySheet.reduce((sum, r) => sum + r.gross_salary, 0),
      deductions: salarySheet.reduce((sum, r) => sum + r.total_deductions, 0),
      pf: salarySheet.reduce((sum, r) => sum + r.pf_employee, 0),
      esi: salarySheet.reduce((sum, r) => sum + r.esi_employee, 0),
      loanEmi: salarySheet.reduce((sum, r) => sum + r.loan_emi, 0),
      net: salarySheet.reduce((sum, r) => sum + r.net_salary, 0),
    }
  }, [salarySheet])

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate({ to: "/app/payroll" })}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Salary Processing</h2>
          <p className="text-muted-foreground">Calculate and confirm monthly salaries</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Select value={String(month)} onValueChange={(v) => setMonth(Number(v))}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 12 }, (_, i) => (
                <SelectItem key={i + 1} value={String(i + 1)}>
                  {getMonthName(i + 1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
            <SelectTrigger className="w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 5 }, (_, i) => {
                const y = now.getFullYear() - 2 + i
                return (
                  <SelectItem key={y} value={String(y)}>
                    {y}
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleProcessSalary} disabled={processSalary.isPending}>
            {processSalary.isPending ? "Processing..." : "Calculate Salary"}
          </Button>
          {hasProcessed && (
            <Button
              variant="outline"
              onClick={handleConfirmAll}
              disabled={confirmAttendance.isPending}
            >
              <Check className="mr-2 h-4 w-4" />
              Confirm All
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead className="text-center">Days</TableHead>
              <TableHead className="text-right">Basic</TableHead>
              <TableHead className="text-right">Allowances</TableHead>
              <TableHead className="text-right">Gross</TableHead>
              <TableHead className="text-right">Deductions</TableHead>
              <TableHead className="text-right">PF</TableHead>
              <TableHead className="text-right">ESI</TableHead>
              <TableHead className="text-right">Loan EMI</TableHead>
              <TableHead className="text-right">Net</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={12} className="text-center">
                  Loading salary sheet...
                </TableCell>
              </TableRow>
            ) : !salarySheet?.length ? (
              <TableRow>
                <TableCell colSpan={12} className="text-center text-muted-foreground">
                  No salary records for {getMonthName(month)} {year}. Click "Calculate Salary" to
                  process.
                </TableCell>
              </TableRow>
            ) : (
              <>
                {salarySheet.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">{record.employee_name}</TableCell>
                    <TableCell className="text-center">
                      {record.present_days}/{record.month_days}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(record.basic_salary)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(record.total_allowances)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(record.gross_salary)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(record.total_deductions)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(record.pf_employee)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(record.esi_employee)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(record.loan_emi)}
                    </TableCell>
                    <TableCell className="text-right font-mono font-bold">
                      {formatCurrency(record.net_salary)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getAttendanceStatusColor(record.status)}>
                        {record.status_display}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {record.status === "PROCESSED" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleConfirm(record.id)}
                          disabled={confirmAttendance.isPending}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      {record.status === "CONFIRMED" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            navigate({
                              to: "/app/payroll/salary/$id",
                              params: { id: record.id },
                            })
                          }
                        >
                          Slip
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {totals && (
                  <TableRow className="font-bold bg-muted/30">
                    <TableCell>Total</TableCell>
                    <TableCell />
                    <TableCell />
                    <TableCell />
                    <TableCell className="text-right font-mono">
                      {formatCurrency(totals.gross)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(totals.deductions)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(totals.pf)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(totals.esi)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(totals.loanEmi)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(totals.net)}
                    </TableCell>
                    <TableCell />
                    <TableCell />
                  </TableRow>
                )}
              </>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
