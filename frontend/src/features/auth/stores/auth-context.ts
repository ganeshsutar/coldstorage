import { createContext } from "react"
import type { UserWithOrganizations } from "../types/auth"

export interface AuthState {
  user: UserWithOrganizations | null
  isAuthenticated: boolean
  isLoading: boolean
}

export interface AuthContextValue extends AuthState {
  setUser: (user: UserWithOrganizations | null) => void
  clearUser: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
