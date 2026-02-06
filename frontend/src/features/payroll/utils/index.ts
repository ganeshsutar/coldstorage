import type { EmployeeStatus, AttendanceStatus, StaffLoanStatus } from "../types"

export function getEmployeeStatusColor(status: EmployeeStatus): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "ACTIVE":
      return "default"
    case "ON_LEAVE":
      return "secondary"
    case "PROBATION":
      return "outline"
    case "INACTIVE":
      return "destructive"
    default:
      return "secondary"
  }
}

export function getAttendanceStatusColor(status: AttendanceStatus): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "CONFIRMED":
      return "default"
    case "PROCESSED":
      return "secondary"
    case "DRAFT":
      return "outline"
    case "CANCELLED":
      return "destructive"
    default:
      return "secondary"
  }
}

export function getStaffLoanStatusColor(status: StaffLoanStatus): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "ACTIVE":
      return "default"
    case "REPAID":
      return "secondary"
    case "CANCELLED":
      return "destructive"
    default:
      return "secondary"
  }
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(dateStr))
}

export function getMonthName(month: number): string {
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ]
  return months[month - 1] || ""
}
