import * as React from "react"
import { MoreHorizontal, Plus, Shield, UserCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useUsers } from "../../hooks"
import type { OrganizationUser } from "../../types"
import { UserDialog } from "./user-dialog"

function getRoleBadgeVariant(role: string) {
  switch (role) {
    case "ADMIN":
      return "default"
    case "OPERATOR":
      return "secondary"
    default:
      return "outline"
  }
}

function getStatusBadgeVariant(status: string) {
  switch (status) {
    case "ACTIVE":
      return "default"
    case "PENDING":
      return "secondary"
    case "SUSPENDED":
      return "destructive"
    default:
      return "outline"
  }
}

function formatDate(dateString: string | null) {
  if (!dateString) return "Never"
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function UserList() {
  const { users, loading, error, refetch, deleteUser } = useUsers()
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [editUser, setEditUser] = React.useState<OrganizationUser | undefined>()

  const handleAddUser = () => {
    setEditUser(undefined)
    setDialogOpen(true)
  }

  const handleEditUser = (user: OrganizationUser) => {
    setEditUser(user)
    setDialogOpen(true)
  }

  const handleDeleteUser = async (user: OrganizationUser) => {
    if (!confirm(`Are you sure you want to remove ${user.user.full_name}?`)) {
      return
    }
    try {
      await deleteUser(user.id)
    } catch {
      // Error is handled by the hook
    }
  }

  const handleSuccess = () => {
    refetch()
    setDialogOpen(false)
    setEditUser(undefined)
  }

  if (loading) {
    return <div className="text-muted-foreground">Loading users...</div>
  }

  if (error) {
    return <div className="text-destructive">{error}</div>
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>User Accounts</CardTitle>
            <CardDescription>
              Manage users in your organization
            </CardDescription>
          </div>
          <Button onClick={handleAddUser}>
            <Plus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No users found. Add your first user to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead className="w-[70px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                          <UserCircle className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div>
                          <div className="font-medium">{user.user.full_name}</div>
                          <div className="text-sm text-muted-foreground">
                            {user.user.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(user.role)}>
                        {user.role === "ADMIN" && (
                          <Shield className="mr-1 h-3 w-3" />
                        )}
                        {user.role_display}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(user.status)}>
                        {user.status_display}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(user.user.last_login_at)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditUser(user)}>
                            Edit User
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDeleteUser(user)}
                          >
                            Remove User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <UserDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={handleSuccess}
        editUser={editUser}
      />
    </>
  )
}
