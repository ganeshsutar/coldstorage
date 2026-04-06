import type { ReactNode } from "react"

import { useRouterState } from "@tanstack/react-router"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { Header, type BreadcrumbItem } from "@/components/layout/header"

function getSidebarDefaultOpen(): boolean {
  const match = document.cookie.match(/(?:^|;\s*)sidebar_state=([^;]*)/)
  return match ? match[1] === "true" : true
}

interface AppShellProps {
  children: ReactNode
  organizationName?: string
  userEmail: string
  userName?: string
  onSignOut?: () => void
  breadcrumbs?: BreadcrumbItem[]
  activeNavItemId?: string
}

export function AppShell({
  children,
  organizationName,
  userEmail,
  userName,
  onSignOut,
  breadcrumbs,
  activeNavItemId,
}: AppShellProps) {
  const { location } = useRouterState()

  return (
    <SidebarProvider defaultOpen={getSidebarDefaultOpen()}>
      <AppSidebar
        organizationName={organizationName}
        userEmail={userEmail}
        userName={userName}
        onSignOut={onSignOut}
        activeItemId={activeNavItemId}
      />
      <SidebarInset>
        <Header breadcrumbs={breadcrumbs} />
        <div className="flex flex-1 flex-col p-6 group-has-data-[collapsible=icon]/sidebar-wrapper:pl-8">
          <div key={location.pathname} className="animate-in fade-in duration-200 flex flex-1 flex-col gap-4">
            {children}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
