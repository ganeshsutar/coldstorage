import * as React from "react"
import { useNavigate } from "@tanstack/react-router"

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
import { Input } from "@/components/ui/input"

import { useAttendance, useCreateAttendance } from "../../hooks"
import { useEmployees } from "../../hooks"
import { getAttendanceStatusColor, getMonthName, formatCurrency } from "../../utils"
import type { AttendanceFilters, Employee } from "../../types"

export function AttendanceGrid() {
  const navigate = useNavigate()
  const now = new Date()
  const [month, setMonth] = React.useState(now.getMonth() + 1)
  const [year, setYear] = React.useState(now.getFullYear())

  const filters: AttendanceFilters = { month, year }
  const { data: attendance, isLoading: attendanceLoading } = useAttendance(filters)
  const { data: employees, isLoading: employeesLoading } = useEmployees({ status: "ACTIVE" })
  const createAttendance = useCreateAttendance()

  // Track attendance input for employees without records
  const [daysInput, setDaysInput] = React.useState<Record<string, number>>({})

  const getDaysInMonth = (m: number, y: number) => new Date(y, m, 0).getDate()
  const monthDays = getDaysInMonth(month, year)

  // Employees that don't have attendance for this month
  const employeesWithoutAttendance = React.useMemo(() => {
    if (!employees || !attendance) return []
    const attendedIds = new Set(attendance.map((a) => a.employee))
    return employees.filter((e) => !attendedIds.has(e.id))
  }, [employees, attendance])

  const handleMarkPresent = (employee: Employee) => {
    const days = daysInput[employee.id] ?? monthDays
    createAttendance.mutate({
      employee_id: employee.id,
      month,
      year,
      month_days: monthDays,
      present_days: days,
      lwp: monthDays - days,
    })
  }

  const handleMarkAllPresent = () => {
    for (const emp of employeesWithoutAttendance) {
      createAttendance.mutate({
        employee_id: emp.id,
        month,
        year,
        month_days: monthDays,
        present_days: monthDays,
        lwp: 0,
      })
    }
  }

  const isLoading = attendanceLoading || employeesLoading

  return (
    <div className="space-y-4">
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
          <span className="text-sm text-muted-foreground ml-2">{monthDays} days</span>
        </div>
        <div className="flex items-center gap-2">
          {employeesWithoutAttendance.length > 0 && (
            <Button variant="outline" onClick={handleMarkAllPresent} disabled={createAttendance.isPending}>
              Mark All Present
            </Button>
          )}
          <Button onClick={() => navigate({ to: "/app/payroll/salary" })}>
            Process Salary
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead className="text-center">Days</TableHead>
              <TableHead className="text-center">Present</TableHead>
              <TableHead className="text-center">LWP</TableHead>
              <TableHead className="text-center">CL</TableHead>
              <TableHead className="text-right">Gross</TableHead>
              <TableHead className="text-right">Net</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : (
              <>
                {attendance?.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">{record.employee_name}</TableCell>
                    <TableCell className="text-center">{record.month_days}</TableCell>
                    <TableCell className="text-center">{record.present_days}</TableCell>
                    <TableCell className="text-center">{record.lwp || 0}</TableCell>
                    <TableCell className="text-center">{record.cl || 0}</TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(record.gross_salary)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(record.net_salary)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getAttendanceStatusColor(record.status)}>
                        {record.status_display}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {employeesWithoutAttendance.map((emp) => (
                  <TableRow key={emp.id} className="bg-muted/30">
                    <TableCell className="font-medium">{emp.name}</TableCell>
                    <TableCell className="text-center">{monthDays}</TableCell>
                    <TableCell className="text-center">
                      <Input
                        type="number"
                        min="0"
                        max={monthDays}
                        value={daysInput[emp.id] ?? monthDays}
                        onChange={(e) =>
                          setDaysInput((prev) => ({
                            ...prev,
                            [emp.id]: Number(e.target.value),
                          }))
                        }
                        className="w-16 h-7 text-center"
                      />
                    </TableCell>
                    <TableCell className="text-center text-muted-foreground">
                      {monthDays - (daysInput[emp.id] ?? monthDays)}
                    </TableCell>
                    <TableCell className="text-center">-</TableCell>
                    <TableCell className="text-right">-</TableCell>
                    <TableCell className="text-right">-</TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleMarkPresent(emp)}
                        disabled={createAttendance.isPending}
                      >
                        Save
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {(!attendance?.length && !employeesWithoutAttendance.length) && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground">
                      No attendance records found.
                    </TableCell>
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
