import {
  createRouter,
  createRootRoute,
  createRoute,
  RouterProvider,
  Outlet,
} from "@tanstack/react-router"

import { LandingPage } from "@/routes/index"
import { LoginPage } from "@/routes/auth/login"
import { RegisterPage } from "@/routes/auth/register"
import { ForgotPasswordPage } from "@/routes/auth/forgot-password"
import { DashboardPage } from "@/routes/app/dashboard"
import { PartyLedgerPage } from "@/routes/app/accounts/party-ledger"
import { ChartOfAccountsPage } from "@/routes/app/accounts/chart-of-accounts"
import { VouchersPage } from "@/routes/app/accounts/vouchers"
import { NewVoucherPage } from "@/routes/app/accounts/vouchers.new"
import { DaybookPage } from "@/routes/app/accounts/daybook"
import { InterestPage } from "@/routes/app/accounts/interest"
// Inventory routes
import { AmadPage } from "@/routes/app/inventory/amad"
import { NewAmadPage } from "@/routes/app/inventory/amad.new"
import { NikasiPage } from "@/routes/app/inventory/nikasi"
import { NewNikasiPage } from "@/routes/app/inventory/nikasi.new"
import { StockTransferPage } from "@/routes/app/inventory/stock-transfer"
import { TakpattiPage } from "@/routes/app/inventory/takpatti"
// Warehouse routes
import { WarehouseIndexPage } from "@/routes/app/warehouse/index"
import { NewLoadingPage } from "@/routes/app/warehouse/loading.new"
import { NewUnloadingPage } from "@/routes/app/warehouse/unloading.new"
import { TemperatureDashboardPage } from "@/routes/app/warehouse/temperature"
import { ShiftingPage } from "@/routes/app/warehouse/shifting"
import { ChambersPage } from "@/routes/app/warehouse/chambers"
// Billing routes
import { BillingPage } from "@/routes/app/billing/index"
import { NewBillPage } from "@/routes/app/billing/new"
import { BillDetailPage } from "@/routes/app/billing/$id"
import { ReceiptsPage } from "@/routes/app/billing/receipts"
import { NewReceiptPage } from "@/routes/app/billing/receipts/new"
import { ReceiptDetailPage } from "@/routes/app/billing/receipts/$id"
// Masters routes
import { GstRatesPage } from "@/routes/app/masters/gst-rates"
import { BanksPage } from "@/routes/app/masters/banks"
import { LaborRatesPage } from "@/routes/app/masters/labor-rates"
// System routes
import { SystemSettingsPage } from "@/routes/app/system/settings"

// Root route
const rootRoute = createRootRoute({
  component: () => <Outlet />,
})

// Landing page route
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: LandingPage,
})

// Auth routes
const authLoginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/auth/login",
  component: LoginPage,
})

const authRegisterRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/auth/register",
  component: RegisterPage,
})

const authForgotPasswordRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/auth/forgot-password",
  component: ForgotPasswordPage,
})

// App routes (protected in future)
const appDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/app/dashboard",
  component: DashboardPage,
})

// Accounting routes
const partyLedgerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/app/accounts/party-ledger",
  component: PartyLedgerPage,
})

const chartOfAccountsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/app/accounts/chart-of-accounts",
  component: ChartOfAccountsPage,
})

const vouchersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/app/accounts/vouchers",
  component: VouchersPage,
})

const newVoucherRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/app/accounts/vouchers/new",
  component: NewVoucherPage,
})

const daybookRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/app/accounts/daybook",
  component: DaybookPage,
})

const interestRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/app/accounts/interest",
  component: InterestPage,
})

// Inventory routes
const amadRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/app/inventory/amad",
  component: AmadPage,
})

const newAmadRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/app/inventory/amad/new",
  component: NewAmadPage,
})

const amadDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/app/inventory/amad/$id",
  component: AmadPage, // TODO: Create dedicated detail page
})

const nikasiRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/app/inventory/nikasi",
  component: NikasiPage,
})

const newNikasiRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/app/inventory/nikasi/new",
  component: NewNikasiPage,
})

const stockTransferRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/app/inventory/stock-transfer",
  component: StockTransferPage,
})

const takpattiRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/app/inventory/takpatti",
  component: TakpattiPage,
})

// Warehouse routes
const warehouseIndexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/app/warehouse",
  component: WarehouseIndexPage,
})

const warehouseLoadingNewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/app/warehouse/loading/new",
  component: NewLoadingPage,
})

const warehouseUnloadingNewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/app/warehouse/unloading/new",
  component: NewUnloadingPage,
})

const warehouseTemperatureRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/app/warehouse/temperature",
  component: TemperatureDashboardPage,
})

const warehouseShiftingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/app/warehouse/shifting",
  component: ShiftingPage,
})

const warehouseChambersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/app/warehouse/chambers",
  component: ChambersPage,
})

// Billing routes
const billingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/app/billing",
  component: BillingPage,
})

const billingNewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/app/billing/new",
  component: NewBillPage,
})

const billingDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/app/billing/$id",
  component: BillDetailPage,
})

const billingReceiptsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/app/billing/receipts",
  component: ReceiptsPage,
})

const billingReceiptsNewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/app/billing/receipts/new",
  component: NewReceiptPage,
})

const billingReceiptsDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/app/billing/receipts/$id",
  component: ReceiptDetailPage,
})

// Masters routes
const mastersGstRatesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/app/masters/gst-rates",
  component: GstRatesPage,
})

const mastersBanksRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/app/masters/banks",
  component: BanksPage,
})

const mastersLaborRatesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/app/masters/labor-rates",
  component: LaborRatesPage,
})

// System routes
const systemSettingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/app/system/settings",
  component: SystemSettingsPage,
})

// Create the route tree
const routeTree = rootRoute.addChildren([
  indexRoute,
  authLoginRoute,
  authRegisterRoute,
  authForgotPasswordRoute,
  appDashboardRoute,
  partyLedgerRoute,
  chartOfAccountsRoute,
  vouchersRoute,
  newVoucherRoute,
  daybookRoute,
  interestRoute,
  // Inventory routes
  amadRoute,
  newAmadRoute,
  amadDetailRoute,
  nikasiRoute,
  newNikasiRoute,
  stockTransferRoute,
  takpattiRoute,
  // Warehouse routes
  warehouseIndexRoute,
  warehouseLoadingNewRoute,
  warehouseUnloadingNewRoute,
  warehouseTemperatureRoute,
  warehouseShiftingRoute,
  warehouseChambersRoute,
  // Billing routes
  billingRoute,
  billingNewRoute,
  billingDetailRoute,
  billingReceiptsRoute,
  billingReceiptsNewRoute,
  billingReceiptsDetailRoute,
  // Masters routes
  mastersGstRatesRoute,
  mastersBanksRoute,
  mastersLaborRatesRoute,
  // System routes
  systemSettingsRoute,
])

// Create the router instance
const router = createRouter({ routeTree })

// Register the router for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }
}

export function AppRouter() {
  return <RouterProvider router={router} />
}
