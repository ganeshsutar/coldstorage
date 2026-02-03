import { useCallback, useState, type ReactNode } from "react"

import {
  UIContext,
  type UIContextValue,
  type UIState,
} from "@/contexts/ui-context"

interface UIProviderProps {
  children: ReactNode
}

export function UIProvider({ children }: UIProviderProps) {
  const [state, setState] = useState<UIState>({
    sidebarOpen: true,
    sidebarCollapsed: false,
    activeNavId: null,
    openNavGroups: new Set<string>(),
  })

  const setSidebarOpen = useCallback((open: boolean) => {
    setState((prev) => ({ ...prev, sidebarOpen: open }))
  }, [])

  const setSidebarCollapsed = useCallback((collapsed: boolean) => {
    setState((prev) => ({ ...prev, sidebarCollapsed: collapsed }))
  }, [])

  const setActiveNavId = useCallback((id: string | null) => {
    setState((prev) => ({ ...prev, activeNavId: id }))
  }, [])

  const toggleSidebar = useCallback(() => {
    setState((prev) => ({ ...prev, sidebarOpen: !prev.sidebarOpen }))
  }, [])

  const toggleNavGroup = useCallback((groupId: string) => {
    setState((prev) => {
      const next = new Set(prev.openNavGroups)
      if (next.has(groupId)) {
        next.delete(groupId)
      } else {
        next.add(groupId)
      }
      return { ...prev, openNavGroups: next }
    })
  }, [])

  const openNavGroup = useCallback((groupId: string) => {
    setState((prev) => {
      if (prev.openNavGroups.has(groupId)) {
        return prev
      }
      const next = new Set(prev.openNavGroups)
      next.add(groupId)
      return { ...prev, openNavGroups: next }
    })
  }, [])

  const value: UIContextValue = {
    ...state,
    setSidebarOpen,
    setSidebarCollapsed,
    setActiveNavId,
    toggleSidebar,
    toggleNavGroup,
    openNavGroup,
  }

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>
}
