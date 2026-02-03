import type { ReactNode } from "react"

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { Header, type BreadcrumbItem } from "@/components/layout/header"

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
  return (
    <SidebarProvider>
      <AppSidebar
        organizationName={organizationName}
        userEmail={userEmail}
        userName={userName}
        onSignOut={onSignOut}
        activeItemId={activeNavItemId}
      />
      <SidebarInset>
        <Header breadcrumbs={breadcrumbs} />
        <div className="flex flex-1 flex-col gap-6 p-6 group-has-data-[collapsible=icon]/sidebar-wrapper:pl-8">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
