import { useEffect } from "react"
import { ChevronRight, Snowflake } from "lucide-react"
import { Link } from "@tanstack/react-router"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { SidebarUser } from "@/components/layout/sidebar-user"
import { getIcon } from "@/lib/icons"
import {
  mainNavItems,
  operationsNavItems,
  systemNavItems,
} from "@/config/navigation"
import { useUI } from "@/hooks/use-ui"
import type { NavItem as NavItemType } from "@/types/navigation"

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  organizationName?: string
  userEmail: string
  userName?: string
  onSignOut?: () => void
  activeItemId?: string
}

function NavGroup({
  items,
  label,
  activeItemId,
  className,
}: {
  items: NavItemType[]
  label: string
  activeItemId?: string
  className?: string
}) {
  const { openNavGroups, toggleNavGroup, openNavGroup } = useUI()

  // Auto-expand group when a child becomes active
  useEffect(() => {
    items.forEach((item) => {
      if (item.children?.some((c) => c.id === activeItemId)) {
        openNavGroup(item.id)
      }
    })
  }, [activeItemId, items, openNavGroup])

  return (
    <SidebarGroup className={className}>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const Icon = getIcon(item.icon)
          const isActive = item.id === activeItemId
          const hasChildren = item.children && item.children.length > 0

          if (hasChildren) {
            return (
              <Collapsible
                key={item.id}
                asChild
                open={openNavGroups.has(item.id)}
                onOpenChange={() => toggleNavGroup(item.id)}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip={item.label}>
                      <Icon />
                      <span>{item.label}</span>
                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.children?.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.id}>
                          <SidebarMenuSubButton
                            asChild
                            isActive={subItem.id === activeItemId}
                          >
                            <Link
                              to={subItem.to}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <span>{subItem.label}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            )
          }

          return (
            <SidebarMenuItem key={item.id}>
              <SidebarMenuButton asChild tooltip={item.label} isActive={isActive}>
                <Link to={item.to ?? ""}>
                  <Icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}

export function AppSidebar({
  organizationName = "ColdVault",
  userEmail,
  userName,
  onSignOut,
  activeItemId,
  ...props
}: AppSidebarProps) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/app/dashboard">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Snowflake className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{organizationName}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    Cold Storage Management
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavGroup items={mainNavItems} label="Platform" activeItemId={activeItemId} />
        <NavGroup items={operationsNavItems} label="Operations" activeItemId={activeItemId} />
      </SidebarContent>

      <SidebarFooter>
        <NavGroup items={systemNavItems} label="System" activeItemId={activeItemId} className="p-0" />
        <SidebarUser email={userEmail} name={userName} onSignOut={onSignOut} />
      </SidebarFooter>

    </Sidebar>
  )
}
