import { createContext } from "react"

export interface UIState {
  sidebarOpen: boolean
  sidebarCollapsed: boolean
  activeNavId: string | null
  openNavGroups: Set<string>
}

export interface UIContextValue extends UIState {
  setSidebarOpen: (open: boolean) => void
  setSidebarCollapsed: (collapsed: boolean) => void
  setActiveNavId: (id: string | null) => void
  toggleSidebar: () => void
  toggleNavGroup: (groupId: string) => void
  openNavGroup: (groupId: string) => void
}

export const UIContext = createContext<UIContextValue | null>(null)
