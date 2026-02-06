import * as React from "react"
import { useNavigate } from "@tanstack/react-router"
import { Plus, Eye, Edit, MoreHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { useEmployees } from "../../hooks"
import { getEmployeeStatusColor, formatCurrency } from "../../utils"
import type { EmployeeFilters, EmployeeStatus } from "../../types"

export function EmployeeList() {
  const navigate = useNavigate()
  const [filters, setFilters] = React.useState<EmployeeFilters>({})
  const { data: employees, isLoading } = useEmployees(filters)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search employees..."
            value={filters.search || ""}
            onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value || undefined }))}
            className="w-64"
          />
          <Select
            value={filters.status || "ALL"}
            onValueChange={(v) =>
              setFilters((f) => ({ ...f, status: v === "ALL" ? undefined : (v as EmployeeStatus) }))
            }
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Status</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="ON_LEAVE">On Leave</SelectItem>
              <SelectItem value="PROBATION">Probation</SelectItem>
              <SelectItem value="INACTIVE">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => navigate({ to: "/app/payroll/employees/new" })}>
          <Plus className="mr-2 h-4 w-4" />
          New Employee
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Designation</TableHead>
              <TableHead>Department</TableHead>
              <TableHead className="text-right">Salary</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  Loading employees...
                </TableCell>
              </TableRow>
            ) : !employees?.length ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  No employees found.
                </TableCell>
              </TableRow>
            ) : (
              employees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell className="font-medium font-mono">{employee.employee_code}</TableCell>
                  <TableCell>{employee.name}</TableCell>
                  <TableCell>{employee.designation || "-"}</TableCell>
                  <TableCell>{employee.department || "-"}</TableCell>
                  <TableCell className="text-right font-mono">
                    {formatCurrency(employee.basic_salary)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getEmployeeStatusColor(employee.status)}>
                      {employee.status_display}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() =>
                            navigate({ to: "/app/payroll/employees/$id", params: { id: employee.id } })
                          }
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            navigate({ to: "/app/payroll/employees/$id", params: { id: employee.id } })
                          }
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
