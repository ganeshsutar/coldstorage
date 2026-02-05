import type { NavItem, QuickCreateItem } from "@/types/navigation"

/**
 * Main platform navigation items
 */
export const mainNavItems: NavItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: "layout-dashboard",
    to: "/app/dashboard",
  },
  {
    id: "accounts",
    label: "Accounts",
    icon: "users",
    children: [
      {
        id: "party-ledger",
        label: "Party Ledger",
        to: "/app/accounts/party-ledger",
      },
      {
        id: "chart-of-accounts",
        label: "Chart of Accounts",
        to: "/app/accounts/chart-of-accounts",
      },
      {
        id: "vouchers",
        label: "Vouchers",
        to: "/app/accounts/vouchers",
      },
      {
        id: "daybook",
        label: "Daybook",
        to: "/app/accounts/daybook",
      },
      {
        id: "interest",
        label: "Interest",
        to: "/app/accounts/interest",
      },
    ],
  },
  {
    id: "inventory",
    label: "Inventory",
    icon: "package",
    children: [
      {
        id: "amad",
        label: "Amad (Receipts)",
        to: "/app/inventory/amad",
      },
      {
        id: "nikasi",
        label: "Nikasi (Dispatch)",
        to: "/app/inventory/nikasi",
      },
      {
        id: "takpatti",
        label: "Takpatti",
        to: "/app/inventory/takpatti",
      },
      {
        id: "stock-transfer",
        label: "Stock Transfer",
        to: "/app/inventory/stock-transfer",
      },
    ],
  },
  {
    id: "chambers",
    label: "Chambers",
    icon: "warehouse",
    children: [
      {
        id: "chamber-management",
        label: "Chamber Management",
        to: "/app/warehouse/chambers",
      },
      {
        id: "room-map",
        label: "Room Map",
        to: "/app/warehouse",
      },
      {
        id: "temperature",
        label: "Temperature",
        to: "/app/warehouse/temperature",
      },
      {
        id: "shifting",
        label: "Shifting",
        to: "/app/warehouse/shifting",
      },
    ],
  },
  {
    id: "billing",
    label: "Billing",
    icon: "receipt",
    to: "/app/billing",
  },
  {
    id: "trading",
    label: "Trading",
    icon: "trending-up",
    to: "/app/trading",
  },
]

/**
 * Operations navigation items
 */
export const operationsNavItems: NavItem[] = [
  {
    id: "bardana",
    label: "Bardana",
    icon: "package",
    children: [
      {
        id: "bardana-stock",
        label: "Stock Summary",
        to: "/app/bardana",
      },
      {
        id: "bardana-issues",
        label: "Issues",
        to: "/app/bardana/issues",
      },
      {
        id: "bardana-returns",
        label: "Returns",
        to: "/app/bardana/returns",
      },
      {
        id: "bardana-outstanding",
        label: "Outstanding",
        to: "/app/bardana/outstanding",
      },
      {
        id: "bardana-types",
        label: "Bardana Types",
        to: "/app/bardana/types",
      },
    ],
  },
  {
    id: "loans",
    label: "Loans",
    icon: "banknote",
    to: "/app/loans",
  },
  {
    id: "payroll",
    label: "Payroll",
    icon: "wallet",
    to: "/app/payroll",
  },
]

/**
 * System navigation items
 */
export const systemNavItems: NavItem[] = [
  {
    id: "masters",
    label: "Masters",
    icon: "database",
    to: "/app/masters",
  },
  {
    id: "reports",
    label: "Reports",
    icon: "file-text",
    to: "/app/reports",
  },
]

/**
 * Quick create action items
 */
export const quickCreateItems: QuickCreateItem[] = [
  {
    id: "new-amad",
    label: "New Amad",
    icon: "plus",
    description: "Create a new receipt entry",
    to: "/app/inventory/amad/new",
  },
  {
    id: "new-nikasi",
    label: "New Nikasi",
    icon: "plus",
    description: "Create a new dispatch entry",
    to: "/app/inventory/nikasi/new",
  },
  {
    id: "new-voucher",
    label: "New Voucher",
    icon: "plus",
    description: "Create a new accounting voucher",
    to: "/app/accounts/vouchers/new",
  },
  {
    id: "new-bardana-issue",
    label: "Issue Bardana",
    icon: "plus",
    description: "Issue bardana to a party",
    to: "/app/bardana/issues/new",
  },
]
