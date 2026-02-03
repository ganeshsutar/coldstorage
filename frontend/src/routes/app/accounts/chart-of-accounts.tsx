import * as React from "react"
import { PlusIcon, UserPlusIcon } from "lucide-react"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AccountTree,
  AddAccountDialog,
  AddPartyDialog,
} from "@/features/accounting/components/accounts"
import { useAccountTree, useAccounts } from "@/features/accounting"
import type { AccountTreeNode } from "@/features/accounting"

export function ChartOfAccountsPage() {
  const { tree, loading, refetch } = useAccountTree()
  const { accounts } = useAccounts()
  const [addAccountOpen, setAddAccountOpen] = React.useState(false)
  const [addPartyOpen, setAddPartyOpen] = React.useState(false)
  const [selectedAccount, setSelectedAccount] = React.useState<AccountTreeNode | null>(null)

  const handleAccountSelect = (node: AccountTreeNode) => {
    setSelectedAccount(node)
  }

  const handleSuccess = () => {
    refetch()
  }

  return (
    <DashboardLayout activeNavItemId="chart-of-accounts">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Chart of Accounts</h1>
            <p className="text-sm text-muted-foreground">
              Manage your account hierarchy and balances
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setAddAccountOpen(true)}
            >
              <PlusIcon className="mr-2 h-4 w-4" />
              Account
            </Button>
            <Button onClick={() => setAddPartyOpen(true)}>
              <UserPlusIcon className="mr-2 h-4 w-4" />
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
            <CardContent>
              {selectedAccount ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Code</p>
                    <p className="font-mono">{selectedAccount.code}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">{selectedAccount.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Type</p>
                    <p className="capitalize">{selectedAccount.type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Balance</p>
                    <p
                      className={`font-mono ${
                        selectedAccount.balance_type === "Dr"
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      {selectedAccount.balance_type}{" "}
                      {Math.abs(selectedAccount.balance).toLocaleString("en-IN")}
                    </p>
                  </div>
                  {selectedAccount.is_party && (
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Account Type
                      </p>
                      <p className="text-blue-600">Party Account</p>
                    </div>
                  )}
                  {selectedAccount.is_group && (
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Sub-accounts
                      </p>
                      <p>{selectedAccount.children?.length || 0} accounts</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Select an account to view details
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <AddAccountDialog
        open={addAccountOpen}
        onOpenChange={setAddAccountOpen}
        parentAccounts={accounts}
        onSuccess={handleSuccess}
      />

      <AddPartyDialog
        open={addPartyOpen}
        onOpenChange={setAddPartyOpen}
        onSuccess={handleSuccess}
      />
    </DashboardLayout>
  )
}
