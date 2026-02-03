import { useCallback, useState, type ReactNode } from "react"

import {
  AuthContext,
  type AuthContextValue,
  type AuthState,
} from "./auth-context"
import type { UserWithOrganizations } from "../types/auth"

const AUTH_STORAGE_KEY = "cold-storage-auth-user"

function getInitialAuthState(): AuthState {
  const storedUser = localStorage.getItem(AUTH_STORAGE_KEY)
  if (storedUser) {
    try {
      const user = JSON.parse(storedUser) as UserWithOrganizations
      return {
        user,
        isAuthenticated: true,
        isLoading: false,
      }
    } catch {
      localStorage.removeItem(AUTH_STORAGE_KEY)
    }
  }
  return {
    user: null,
    isAuthenticated: false,
    isLoading: false,
  }
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>(getInitialAuthState)

  const setUser = useCallback((user: UserWithOrganizations | null) => {
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user))
      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
      })
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY)
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      })
    }
  }, [])

  const clearUser = useCallback(() => {
    localStorage.removeItem(AUTH_STORAGE_KEY)
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    })
  }, [])

  const value: AuthContextValue = {
    ...state,
    setUser,
    clearUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
