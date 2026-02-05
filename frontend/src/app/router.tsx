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
// Bardana routes
import { BardanaStockPage } from "@/routes/app/bardana/index"
import { BardanaTypesPage } from "@/routes/app/bardana/types"
import { BardanaIssuesPage } from "@/routes/app/bardana/issues"
import { NewBardanaIssuePage } from "@/routes/app/bardana/issues.new"
import { BardanaIssueDetailPage } from "@/routes/app/bardana/issues.$id"
import { BardanaReturnsPage } from "@/routes/app/bardana/returns"
import { NewBardanaReturnPage } from "@/routes/app/bardana/returns.new"
import { BardanaReturnDetailPage } from "@/routes/app/bardana/returns.$id"
import { BardanaOutstandingPage } from "@/routes/app/bardana/outstanding"
// Trading routes
import { TradingPage } from "@/routes/app/trading/index"
import { NewDealPage } from "@/routes/app/trading/deals.new"
import { DealDetailPage } from "@/routes/app/trading/deals.$id"
import { NewGatePassPage } from "@/routes/app/trading/gate-passes.new"
import { NewGradingPage } from "@/routes/app/trading/grading.new"
// Loans routes
import { LoansPage } from "@/routes/app/loans/index"
import { NewAdvancePage } from "@/routes/app/loans/advances.new"
import { AdvanceDetailPage } from "@/routes/app/loans/advances.$id"
import { NewLoanPage } from "@/routes/app/loans/loans.new"
import { LoanDetailPage } from "@/routes/app/loans/loans.$id"
import { LoanLedgerPage } from "@/routes/app/loans/ledger"
// Masters routes
import { MastersPage } from "@/routes/app/masters/index"
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

// Bardana routes
const bardanaStockRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/app/bardana",
  component: BardanaStockPage,
})

const bardanaTypesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/app/bardana/types",
  component: BardanaTypesPage,
})

const bardanaIssuesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/app/bardana/issues",
  component: BardanaIssuesPage,
})

const bardanaIssuesNewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/app/bardana/issues/new",
  component: NewBardanaIssuePage,
})

const bardanaIssueDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/app/bardana/issues/$id",
  component: BardanaIssueDetailPage,
})

const bardanaReturnsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/app/bardana/returns",
  component: BardanaReturnsPage,
})

const bardanaReturnsNewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/app/bardana/returns/new",
  component: NewBardanaReturnPage,
})

const bardanaReturnDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/app/bardana/returns/$id",
  component: BardanaReturnDetailPage,
})

const bardanaOutstandingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/app/bardana/outstanding",
  component: BardanaOutstandingPage,
// Trading routes
const tradingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/app/trading",
  component: TradingPage,
})

const tradingNewDealRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/app/trading/deals/new",
  component: NewDealPage,
})

const tradingDealDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/app/trading/deals/$id",
  component: DealDetailPage,
})

const tradingNewGatePassRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/app/trading/gate-passes/new",
  component: NewGatePassPage,
})

const tradingNewGradingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/app/trading/grading/new",
  component: NewGradingPage,
})

// Loans routes
const loansRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/app/loans",
  component: LoansPage,
})

const loansAdvancesNewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/app/loans/advances/new",
  component: NewAdvancePage,
})

const loansAdvancesDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/app/loans/advances/$id",
  component: AdvanceDetailPage,
})

const loansLoansNewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/app/loans/loans/new",
  component: NewLoanPage,
})

const loansLoansDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/app/loans/loans/$id",
  component: LoanDetailPage,
})

const loansLedgerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/app/loans/ledger",
  component: LoanLedgerPage,
})

// Masters routes
const mastersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/app/masters",
  component: MastersPage,
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
  // Trading routes
  tradingRoute,
  tradingNewDealRoute,
  tradingDealDetailRoute,
  tradingNewGatePassRoute,
  tradingNewGradingRoute,
  // Loans routes
  loansRoute,
  loansAdvancesNewRoute,
  loansAdvancesDetailRoute,
  loansLoansNewRoute,
  loansLoansDetailRoute,
  loansLedgerRoute,
  // Billing routes
  billingRoute,
  billingNewRoute,
  billingDetailRoute,
  billingReceiptsRoute,
  billingReceiptsNewRoute,
  billingReceiptsDetailRoute,
  // Bardana routes
  bardanaStockRoute,
  bardanaTypesRoute,
  bardanaIssuesRoute,
  bardanaIssuesNewRoute,
  bardanaIssueDetailRoute,
  bardanaReturnsRoute,
  bardanaReturnsNewRoute,
  bardanaReturnDetailRoute,
  bardanaOutstandingRoute,
  // Masters routes
  mastersRoute,
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
