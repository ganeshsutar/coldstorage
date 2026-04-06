import * as React from "react"
import { useNavigate } from "@tanstack/react-router"
import { PlusIcon, UserPlusIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AccountTree,
} from "@/features/accounting/components/accounts"
import { useAccountTree } from "@/features/accounting"
import type { AccountTreeNode } from "@/features/accounting"

export function ChartOfAccountsPage() {
  const navigate = useNavigate()
  const { tree, loading } = useAccountTree()
  const [selectedAccount, setSelectedAccount] = React.useState<AccountTreeNode | null>(null)

  const handleAccountSelect = (node: AccountTreeNode) => {
    setSelectedAccount(node)
  }

  return (
    <DashboardLayout activeNavItemId="chart-of-accounts" breadcrumbs={[{ label: "Accounts", to: "/app/accounts/chart-of-accounts" }, { label: "Chart of Accounts" }]}>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 data-testid="chart-of-accounts-title" className="text-2xl font-semibold">Chart of Accounts</h1>
            <p className="text-sm text-muted-foreground">
              Manage your account hierarchy and balances
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              data-testid="coa-add-account-button"
              variant="outline"
              onClick={() => navigate({ to: "/app/accounts/accounts/new" })}
            >
              <PlusIcon className="mr-2 size-4" />
              Account
            </Button>
            <Button data-testid="coa-add-party-button" onClick={() => navigate({ to: "/app/accounts/parties/new" })}>
              <UserPlusIcon className="mr-2 size-4" />
              Party
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium">
                Account Hierarchy
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-[calc(100vh-280px)] border-t">
                <AccountTree
                  tree={tree}
                  loading={loading}
                  onSelect={handleAccountSelect}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium">
                Account Details
              </CardTitle>
            </CardHeader>
            <CardContent data-testid="coa-detail-panel">
              {selectedAccount ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Code</p>
                    <p data-testid="coa-detail-code" className="font-mono">{selectedAccount.code}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p data-testid="coa-detail-name" className="font-medium">{selectedAccount.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Type</p>
                    <p data-testid="coa-detail-type" className="capitalize">{selectedAccount.account_type === "GROUP" ? "Group" : "Account"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Balance</p>
                    <p
                      data-testid="coa-detail-balance"
                      className={cn(
                        "font-mono",
                        selectedAccount.balance_nature === "DEBIT"
                          ? "text-status-danger-foreground"
                          : "text-status-success-foreground"
                      )}
                    >
                      {selectedAccount.balance_nature === "DEBIT" ? "Dr" : "Cr"}{" "}
                      {parseFloat(selectedAccount.closing_balance).toLocaleString("en-IN")}
                    </p>
                  </div>
                  {selectedAccount.account_type === "GROUP" && (
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Sub-accounts
                      </p>
                      <p data-testid="coa-detail-children-count">{selectedAccount.children?.length || 0} accounts</p>
                    </div>
                  )}
                </div>
              ) : (
                <p data-testid="coa-detail-empty" className="text-sm text-muted-foreground">
                  Select an account to view details
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

    </DashboardLayout>
  )
}
