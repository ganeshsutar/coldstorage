import {
  LayoutDashboard,
  Package,
  Warehouse,
  Users,
  Receipt,
  TrendingUp,
  Banknote,
  Wallet,
  Database,
  FileText,
  Settings2,
  HelpCircle,
  Search,
  Plus,
  ChevronRight,
  Snowflake,
  LogOut,
  BadgeCheck,
  Bell,
  CreditCard,
  Sparkles,
  Sun,
  Moon,
  Monitor,
  Palette,
  Circle,
  type LucideIcon,
} from "lucide-react"

/**
 * Static icon map for string-based icon references
 * This allows icons to be referenced by name in configuration files
 */
const iconMap: Record<string, LucideIcon> = {
  // Navigation icons
  "layout-dashboard": LayoutDashboard,
  package: Package,
  warehouse: Warehouse,
  users: Users,
  receipt: Receipt,
  "trending-up": TrendingUp,
  banknote: Banknote,
  wallet: Wallet,
  database: Database,
  "file-text": FileText,
  settings: Settings2,
  "help-circle": HelpCircle,
  search: Search,
  plus: Plus,
  "chevron-right": ChevronRight,
  snowflake: Snowflake,

  // User menu icons
  "log-out": LogOut,
  "badge-check": BadgeCheck,
  bell: Bell,
  "credit-card": CreditCard,
  sparkles: Sparkles,

  // Theme icons
  sun: Sun,
  moon: Moon,
  monitor: Monitor,
  palette: Palette,
  circle: Circle,
}

/**
 * Get an icon component by name
 * @param iconName - The name of the icon (e.g., "layout-dashboard")
 * @returns The LucideIcon component, or a fallback Circle icon if not found
 */
export function getIcon(iconName: string): LucideIcon {
  return iconMap[iconName] ?? Circle
}

/**
 * Check if an icon exists in the map
 */
export function hasIcon(iconName: string): boolean {
  return iconName in iconMap
}

export { iconMap }
