import * as React from "react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useUsers } from "../../hooks"
import { usersService } from "../../api/users"
import type { UserPermissions } from "../../types"

interface PermissionRow {
  key: keyof UserPermissions
  label: string
  description: string
  category: string
}

const PERMISSION_ROWS: PermissionRow[] = [
  // Basic permissions
  { key: "add", label: "Add Records", description: "Create new entries", category: "Basic Permissions" },
  { key: "modify", label: "Modify Records", description: "Edit existing entries", category: "Basic Permissions" },
  { key: "delete", label: "Delete Records", description: "Remove entries", category: "Basic Permissions" },
  { key: "print", label: "Print Reports", description: "Print documents", category: "Basic Permissions" },
  { key: "change_settings", label: "Change Settings", description: "Modify system settings", category: "Basic Permissions" },
  // Module access
  { key: "inventory", label: "Inventory", description: "Amad, Nikasi, Stock", category: "Module Access" },
  { key: "accounts", label: "Accounts", description: "Ledger, Vouchers", category: "Module Access" },
  { key: "billing", label: "Billing", description: "Bills, Receipts", category: "Module Access" },
  { key: "trading", label: "Trading", description: "Sauda, Trading", category: "Module Access" },
  { key: "bardana", label: "Bardana", description: "Packaging materials", category: "Module Access" },
  { key: "loans", label: "Loans", description: "Loan management", category: "Module Access" },
  { key: "payroll", label: "Payroll", description: "Employee wages", category: "Module Access" },
  { key: "reports", label: "Reports", description: "View reports", category: "Module Access" },
  { key: "system", label: "System", description: "System settings", category: "Module Access" },
  // Special permissions
  { key: "backdate_entry", label: "Backdate Entry", description: "Create backdated entries", category: "Special Permissions" },
  { key: "approve_loans", label: "Approve Loans", description: "Approve loan requests", category: "Special Permissions" },
  { key: "year_end_close", label: "Year End Close", description: "Perform year-end closing", category: "Special Permissions" },
  { key: "user_management", label: "User Management", description: "Manage user accounts", category: "Special Permissions" },
  { key: "multi_room", label: "Multi Room", description: "Access multiple rooms", category: "Special Permissions" },
]

// Default permissions by role
const DEFAULT_PERMISSIONS: Record<string, UserPermissions> = {
  ADMIN: {
    add: true,
    modify: true,
    delete: true,
    print: true,
    change_settings: true,
    inventory: true,
    accounts: true,
    billing: true,
    trading: true,
    bardana: true,
    loans: true,
    payroll: true,
    reports: true,
    system: true,
    backdate_entry: true,
    approve_loans: true,
    year_end_close: true,
    user_management: true,
    multi_room: true,
  },
  OPERATOR: {
    add: true,
    modify: false,
    delete: false,
    print: false,
    change_settings: false,
    inventory: true,
    accounts: false,
    billing: true,
    trading: false,
    bardana: true,
    loans: false,
    payroll: false,
    reports: false,
    system: false,
    backdate_entry: false,
    approve_loans: false,
    year_end_close: false,
    user_management: false,
    multi_room: false,
  },
}

export function PermissionEditor() {
  const { users, loading, error, refetch } = useUsers()
  const [permissions, setPermissions] = React.useState<Record<string, UserPermissions>>({})
  const [saving, setSaving] = React.useState(false)
  const [saveError, setSaveError] = React.useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = React.useState(false)

  // Initialize permissions from users
  React.useEffect(() => {
    const permMap: Record<string, UserPermissions> = {}
    users.forEach((user) => {
      // Merge default role permissions with custom permissions
      permMap[user.id] = {
        ...DEFAULT_PERMISSIONS[user.role],
        ...user.permissions,
      }
    })
    setPermissions(permMap)
  }, [users])

  const handlePermissionChange = (
    userId: string,
    permKey: keyof UserPermissions,
    checked: boolean
  ) => {
    setPermissions((prev) => ({
      ...prev,
      [userId]: {
        ...prev[userId],
        [permKey]: checked,
      },
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    setSaveError(null)
    setSaveSuccess(false)

    try {
      // Save permissions for each user
      await Promise.all(
        users.map((user) =>
          usersService.updateUserPermissions(user.id, permissions[user.id] || {})
        )
      )
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
      refetch()
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save permissions")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="text-muted-foreground">Loading permissions...</div>
  }

  if (error) {
    return <div className="text-destructive">{error}</div>
  }

  // Group permissions by category
  const categories = Array.from(new Set(PERMISSION_ROWS.map((r) => r.category)))

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Permission Matrix</CardTitle>
          <CardDescription>
            Configure permissions for each user in your organization
          </CardDescription>
        </div>
        <Button onClick={handleSave} disabled={saving} data-testid="permission-save-button">
          {saving ? "Saving..." : "Save Permissions"}
        </Button>
      </CardHeader>
      <CardContent>
        {saveError && (
          <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md mb-4" data-testid="permission-error-message">
            {saveError}
          </div>
        )}
        {saveSuccess && (
          <div className="text-sm text-status-success-foreground bg-status-success-muted p-3 rounded-md mb-4" data-testid="permission-success-message">
            Permissions saved successfully
          </div>
        )}

        <div className="overflow-x-auto">
          <Table data-testid="permission-table">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Permission</TableHead>
                {users.map((user) => (
                  <TableHead key={user.id} className="text-center min-w-[100px]">
                    <div className="font-medium">{user.user.full_name}</div>
                    <div className="text-xs text-muted-foreground font-normal">
                      {user.role}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <React.Fragment key={category}>
                  <TableRow className="bg-muted/50">
                    <TableCell
                      colSpan={users.length + 1}
                      className="font-semibold text-sm"
                    >
                      {category}
                    </TableCell>
                  </TableRow>
                  {PERMISSION_ROWS.filter((r) => r.category === category).map(
                    (row) => (
                      <TableRow key={row.key}>
                        <TableCell>
                          <div className="font-medium">{row.label}</div>
                          <div className="text-xs text-muted-foreground">
                            {row.description}
                          </div>
                        </TableCell>
                        {users.map((user) => (
                          <TableCell key={user.id} className="text-center">
                            <Checkbox
                              checked={permissions[user.id]?.[row.key] ?? false}
                              onCheckedChange={(checked) =>
                                handlePermissionChange(
                                  user.id,
                                  row.key,
                                  checked as boolean
                                )
                              }
                              disabled={saving}
                            />
                          </TableCell>
                        ))}
                      </TableRow>
                    )
                  )}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
