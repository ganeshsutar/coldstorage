import * as React from "react"
import { Eye, LogIn, LogOut, Plus, Edit2, Trash2, Printer, FileDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useAuditLog, useUsers } from "../../hooks"
import type { ActionType, ActivityLog, ActivityLogFilters } from "../../types"

function getActionIcon(actionType: ActionType) {
  switch (actionType) {
    case "LOGIN":
      return <LogIn className="h-4 w-4" />
    case "LOGOUT":
      return <LogOut className="h-4 w-4" />
    case "CREATE":
      return <Plus className="h-4 w-4" />
    case "UPDATE":
      return <Edit2 className="h-4 w-4" />
    case "DELETE":
      return <Trash2 className="h-4 w-4" />
    case "VIEW":
      return <Eye className="h-4 w-4" />
    case "PRINT":
      return <Printer className="h-4 w-4" />
    case "EXPORT":
      return <FileDown className="h-4 w-4" />
    default:
      return null
  }
}

function getActionBadgeVariant(actionType: ActionType) {
  switch (actionType) {
    case "CREATE":
      return "default"
    case "UPDATE":
      return "secondary"
    case "DELETE":
      return "destructive"
    case "LOGIN":
    case "LOGOUT":
      return "outline"
    default:
      return "secondary"
  }
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function AuditLogTable() {
  const [filters, setFilters] = React.useState<ActivityLogFilters>({})
  const { logs, loading, error } = useAuditLog(filters)
  const { users } = useUsers()
  const [selectedLog, setSelectedLog] = React.useState<ActivityLog | null>(null)

  const handleFilterChange = (key: keyof ActivityLogFilters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value === "all" ? undefined : value,
    }))
  }

  if (error) {
    return <div className="text-destructive">{error}</div>
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Activity Log</CardTitle>
          <CardDescription>
            Track all user activities in your organization
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <Input
                data-testid="audit-search-input"
                placeholder="Search..."
                value={filters.search || ""}
                onChange={(e) => handleFilterChange("search", e.target.value)}
              />
            </div>
            <Select
              value={filters.user || "all"}
              onValueChange={(value) => handleFilterChange("user", value)}
            >
              <SelectTrigger data-testid="audit-user-filter" className="w-[180px]">
                <SelectValue placeholder="All Users" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                {users.map((user) => (
                  <SelectItem key={user.user.id} value={user.user.id}>
                    {user.user.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filters.action_type || "all"}
              onValueChange={(value) => handleFilterChange("action_type", value)}
            >
              <SelectTrigger data-testid="audit-action-filter" className="w-[150px]">
                <SelectValue placeholder="All Actions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="LOGIN">Login</SelectItem>
                <SelectItem value="LOGOUT">Logout</SelectItem>
                <SelectItem value="CREATE">Create</SelectItem>
                <SelectItem value="UPDATE">Update</SelectItem>
                <SelectItem value="DELETE">Delete</SelectItem>
                <SelectItem value="VIEW">View</SelectItem>
                <SelectItem value="PRINT">Print</SelectItem>
                <SelectItem value="EXPORT">Export</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.module || "all"}
              onValueChange={(value) => handleFilterChange("module", value)}
            >
              <SelectTrigger data-testid="audit-module-filter" className="w-[150px]">
                <SelectValue placeholder="All Modules" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Modules</SelectItem>
                <SelectItem value="System">System</SelectItem>
                <SelectItem value="Settings">Settings</SelectItem>
                <SelectItem value="Amad">Amad</SelectItem>
                <SelectItem value="Rent">Rent</SelectItem>
                <SelectItem value="Voucher">Voucher</SelectItem>
                <SelectItem value="Inventory">Inventory</SelectItem>
              </SelectContent>
            </Select>
            <Input
              data-testid="audit-from-date-input"
              type="date"
              placeholder="From date"
              value={filters.from_date || ""}
              onChange={(e) => handleFilterChange("from_date", e.target.value)}
              className="w-[150px]"
            />
            <Input
              data-testid="audit-to-date-input"
              type="date"
              placeholder="To date"
              value={filters.to_date || ""}
              onChange={(e) => handleFilterChange("to_date", e.target.value)}
              className="w-[150px]"
            />
          </div>

          {/* Table */}
          {loading ? (
            <div className="text-muted-foreground py-8 text-center">
              Loading activity logs...
            </div>
          ) : logs.length === 0 ? (
            <div data-testid="audit-log-empty" className="text-muted-foreground py-8 text-center">
              No activity logs found
            </div>
          ) : (
            <Table data-testid="audit-log-table">
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Module</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead className="w-[70px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log, index) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-muted-foreground">
                      {formatDate(log.created_at)}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{log.user_name || "System"}</div>
                      <div className="text-xs text-muted-foreground">
                        {log.user_email}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={getActionBadgeVariant(log.action_type)}
                        className="flex w-fit items-center gap-1"
                      >
                        {getActionIcon(log.action_type)}
                        {log.action_type_display}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>{log.module}</div>
                      {log.entry_type && (
                        <div className="text-xs text-muted-foreground">
                          {log.entry_type}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {log.entry_id && (
                        <span className="font-mono text-sm">#{log.entry_id}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        data-testid={`audit-view-button-${index}`}
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedLog(log)}
                      >
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">View details</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent data-testid="audit-detail-dialog" className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Activity Detail</DialogTitle>
            <DialogDescription>
              Full details of the activity log entry
            </DialogDescription>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Timestamp
                  </div>
                  <div>{formatDate(selectedLog.created_at)}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    User
                  </div>
                  <div>{selectedLog.user_name || "System"}</div>
                  <div className="text-sm text-muted-foreground">
                    {selectedLog.user_email}
                  </div>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Action
                  </div>
                  <Badge variant={getActionBadgeVariant(selectedLog.action_type)}>
                    {selectedLog.action_type_display}
                  </Badge>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Module
                  </div>
                  <div>{selectedLog.module}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Entry Type
                  </div>
                  <div>{selectedLog.entry_type || "-"}</div>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Entry ID
                  </div>
                  <div className="font-mono">
                    {selectedLog.entry_id || "-"}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    IP Address
                  </div>
                  <div className="font-mono">
                    {selectedLog.ip_address || "-"}
                  </div>
                </div>
              </div>
              {Object.keys(selectedLog.details).length > 0 && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-2">
                    Details (JSON)
                  </div>
                  <pre className="bg-muted p-3 rounded-md text-sm overflow-auto max-h-[200px]">
                    {JSON.stringify(selectedLog.details, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
