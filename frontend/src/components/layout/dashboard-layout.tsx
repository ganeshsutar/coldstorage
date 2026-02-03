import type { ReactNode } from "react"
import { useNavigate } from "@tanstack/react-router"

import { AppShell } from "@/components/layout/app-shell"
import type { BreadcrumbItem } from "@/components/layout/header"
import { useAuth, authService } from "@/features/auth"

type DashboardLayoutProps = {
  children: ReactNode
  breadcrumbs?: BreadcrumbItem[]
  activeNavItemId?: string
}

export function DashboardLayout({
  children,
  breadcrumbs = [{ label: "Dashboard" }],
  activeNavItemId = "dashboard",
}: DashboardLayoutProps) {
  const navigate = useNavigate()
  const { user, clearUser } = useAuth()

  const handleSignOut = async () => {
    try {
      await authService.logout()
    } catch {
      // Continue with logout even if API fails
    }
    clearUser()
    navigate({ to: "/auth/login" })
  }

  const userName = user?.full_name || "User"
  const userEmail = user?.email || ""
  const organizationName = user?.organizations?.[0]?.name || "ColdVault Inc"

  return (
    <AppShell
      organizationName={organizationName}
      userEmail={userEmail}
      userName={userName}
      onSignOut={handleSignOut}
      breadcrumbs={breadcrumbs}
      activeNavItemId={activeNavItemId}
    >
      {children}
    </AppShell>
  )
}
