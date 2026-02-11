import * as React from "react"
import { useNavigate } from "@tanstack/react-router"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { DashboardLayout } from "@/components/layout/dashboard-layout"

import { usePayrollLedger, useEmployees } from "@/features/payroll/hooks"
import { formatCurrency, formatDate } from "@/features/payroll/utils"
import type { PayrollLedgerFilters } from "@/features/payroll/types"

export function PayrollLedgerPage() {
  const navigate = useNavigate()
  const [filters, setFilters] = React.useState<PayrollLedgerFilters>({})
  const { data: employees } = useEmployees()
  const { data: entries, isLoading } = usePayrollLedger(filters)

  return (
    <DashboardLayout activeNavItemId="payroll" breadcrumbs={[{ label: "Payroll", to: "/app/payroll" }, { label: "Ledger" }]}>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate({ to: "/app/payroll" })}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Payroll Ledger</h2>
            <p className="text-muted-foreground">
              Transaction history for salary, loans, and EMIs
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Select
            value={filters.employee_id || "ALL"}
            onValueChange={(v) =>
              setFilters((f) => ({ ...f, employee_id: v === "ALL" ? undefined : v }))
            }
          >
            <SelectTrigger className="w-52">
              <SelectValue placeholder="All Employees" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Employees</SelectItem>
              {employees?.map((emp) => (
                <SelectItem key={emp.id} value={emp.id}>
                  {emp.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={filters.type || "ALL"}
            onValueChange={(v) =>
              setFilters((f) => ({ ...f, type: v === "ALL" ? undefined : (v as "SAL" | "ADV" | "LOAN" | "EMI") }))
            }
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Types</SelectItem>
              <SelectItem value="SAL">Salary</SelectItem>
              <SelectItem value="LOAN">Loan</SelectItem>
              <SelectItem value="EMI">EMI</SelectItem>
              <SelectItem value="ADV">Advance</SelectItem>
            </SelectContent>
          </Select>
          <Input
            type="date"
            value={filters.from_date || ""}
            onChange={(e) =>
              setFilters((f) => ({ ...f, from_date: e.target.value || undefined }))
            }
            className="w-40"
          />
          <Input
            type="date"
            value={filters.to_date || ""}
            onChange={(e) =>
              setFilters((f) => ({ ...f, to_date: e.target.value || undefined }))
            }
            className="w-40"
          />
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Employee</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Debit</TableHead>
                <TableHead className="text-right">Credit</TableHead>
                <TableHead className="text-right">Balance</TableHead>
                <TableHead>Remarks</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center">
                    Loading ledger...
                  </TableCell>
                </TableRow>
              ) : !entries?.length ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground">
                    No ledger entries found.
                  </TableCell>
                </TableRow>
              ) : (
                entries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-mono text-muted-foreground">
                      {entry.serial_number}
                    </TableCell>
                    <TableCell>{formatDate(entry.transaction_date)}</TableCell>
                    <TableCell>{entry.employee_name}</TableCell>
                    <TableCell>{entry.transaction_type_display}</TableCell>
                    <TableCell className="text-right font-mono">
                      {entry.debit > 0 ? formatCurrency(entry.debit) : "-"}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {entry.credit > 0 ? formatCurrency(entry.credit) : "-"}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(entry.running_balance)}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {entry.remarks || "-"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </DashboardLayout>
  )
}
