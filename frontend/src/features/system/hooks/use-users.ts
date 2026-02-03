import * as React from "react"
import { usersService } from "../api/users"
import type {
  CreateUserRequest,
  OrganizationUser,
  UpdateUserRequest,
  UserPermissions,
} from "../types"

export function useUsers() {
  const [users, setUsers] = React.useState<OrganizationUser[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const fetchUsers = React.useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await usersService.getUsers()
      setUsers(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch users")
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const createUser = React.useCallback(
    async (data: CreateUserRequest) => {
      try {
        setError(null)
        const newUser = await usersService.createUser(data)
        setUsers((prev) => [...prev, newUser])
        return newUser
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to create user"
        setError(message)
        throw err
      }
    },
    []
  )

  const updateUser = React.useCallback(
    async (id: string, data: UpdateUserRequest) => {
      try {
        setError(null)
        const updated = await usersService.updateUser(id, data)
        setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)))
        return updated
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to update user"
        setError(message)
        throw err
      }
    },
    []
  )

  const deleteUser = React.useCallback(async (id: string) => {
    try {
      setError(null)
      await usersService.deleteUser(id)
      setUsers((prev) => prev.filter((u) => u.id !== id))
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to delete user"
      setError(message)
      throw err
    }
  }, [])

  return {
    users,
    loading,
    error,
    refetch: fetchUsers,
    createUser,
    updateUser,
    deleteUser,
  }
}

export function useUserDetail(id: string | null) {
  const [user, setUser] = React.useState<OrganizationUser | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const fetchUser = React.useCallback(async () => {
    if (!id) {
      setUser(null)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const data = await usersService.getUser(id)
      setUser(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch user")
    } finally {
      setLoading(false)
    }
  }, [id])

  React.useEffect(() => {
    fetchUser()
  }, [fetchUser])

  return { user, loading, error, refetch: fetchUser }
}

export function useUserPermissions(userId: string | null) {
  const [permissions, setPermissions] = React.useState<UserPermissions | null>(
    null
  )
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const fetchPermissions = React.useCallback(async () => {
    if (!userId) {
      setPermissions(null)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const data = await usersService.getUserPermissions(userId)
      setPermissions(data.permissions)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch permissions"
      )
    } finally {
      setLoading(false)
    }
  }, [userId])

  React.useEffect(() => {
    fetchPermissions()
  }, [fetchPermissions])

  const updatePermissions = React.useCallback(
    async (newPermissions: UserPermissions) => {
      if (!userId) return null

      try {
        setError(null)
        const data = await usersService.updateUserPermissions(
          userId,
          newPermissions
        )
        setPermissions(data.permissions)
        return data.permissions
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to update permissions"
        setError(message)
        throw err
      }
    },
    [userId]
  )

  return {
    permissions,
    loading,
    error,
    refetch: fetchPermissions,
    updatePermissions,
  }
}
