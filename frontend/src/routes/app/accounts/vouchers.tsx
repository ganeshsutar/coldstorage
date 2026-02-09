import * as React from "react"
import { Link } from "@tanstack/react-router"
import { PlusIcon } from "lucide-react"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { VoucherListTable } from "@/features/accounting/components/voucher"
import { useVouchers, type VoucherType } from "@/features/accounting"

type VoucherTab = "all" | "receipts" | "payments" | "journal"

function getVoucherTypeFromTab(tab: VoucherTab): VoucherType | "all" {
  switch (tab) {
    case "receipts":
      return "CR"
    case "payments":
      return "DR"
    case "journal":
      return "JV"
    default:
      return "all"
  }
}

export function VouchersPage() {
  const [activeTab, setActiveTab] = React.useState<VoucherTab>("all")
  const voucherType = getVoucherTypeFromTab(activeTab)
  const { vouchers, loading } = useVouchers(voucherType)

  const counts = React.useMemo(() => {
    return {
      all: vouchers.length,
      receipts: vouchers.filter((v) => v.voucher_type === "CR").length,
      payments: vouchers.filter((v) => v.voucher_type === "DR").length,
      journal: vouchers.filter((v) => v.voucher_type === "JV").length,
    }
  }, [vouchers])

  return (
    <DashboardLayout activeNavItemId="vouchers">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 data-testid="vouchers-title" className="text-2xl font-semibold">Vouchers</h1>
            <p className="text-sm text-muted-foreground">
              Manage accounting vouchers and transactions
            </p>
          </div>
          <Button asChild data-testid="vouchers-new-button">
            <Link to="/app/accounts/vouchers/new">
              <PlusIcon className="mr-2 h-4 w-4" />
              New Voucher
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle>Voucher List</CardTitle>
              <Tabs
                value={activeTab}
                onValueChange={(v) => setActiveTab(v as VoucherTab)}
              >
                <TabsList>
                  <TabsTrigger value="all" data-testid="vouchers-tab-all">
                    All ({counts.all})
                  </TabsTrigger>
                  <TabsTrigger value="receipts" data-testid="vouchers-tab-receipts">
                    Receipts ({counts.receipts})
                  </TabsTrigger>
                  <TabsTrigger value="payments" data-testid="vouchers-tab-payments">
                    Payments ({counts.payments})
                  </TabsTrigger>
                  <TabsTrigger value="journal" data-testid="vouchers-tab-journal">
                    Journal ({counts.journal})
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            <VoucherListTable vouchers={vouchers} loading={loading} />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
