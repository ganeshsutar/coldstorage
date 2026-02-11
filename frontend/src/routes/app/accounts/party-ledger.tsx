import * as React from "react";
import { SearchIcon, FilterIcon, UserPlusIcon } from "lucide-react";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  KPICards,
  PartyListTable,
  PartyDetailSheet,
} from "@/features/accounting/components/party-ledger";
import { AddPartyDialog } from "@/features/accounting/components/accounts";
import {
  usePartyAccounts,
  useAccountSummary,
  type PartyAccount,
} from "@/features/accounting";

export function PartyLedgerPage() {
  const { parties, loading: partiesLoading, refetch } = usePartyAccounts();
  const { summary, loading: summaryLoading } = useAccountSummary();
  const [search, setSearch] = React.useState("");
  const [filter, setFilter] = React.useState<"all" | "debtors" | "creditors">(
    "all",
  );
  const [selectedParty, setSelectedParty] = React.useState<PartyAccount | null>(
    null,
  );
  const [detailSheetOpen, setDetailSheetOpen] = React.useState(false);
  const [addPartyOpen, setAddPartyOpen] = React.useState(false);

  const filteredParties = React.useMemo(() => {
    let result = parties;

    if (search) {
      const lowerSearch = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(lowerSearch) ||
          p.code.toLowerCase().includes(lowerSearch),
      );
    }

    if (filter === "debtors") {
      result = result.filter((p) => p.balance_nature === "DEBIT" && parseFloat(p.closing_balance) !== 0);
    } else if (filter === "creditors") {
      result = result.filter((p) => p.balance_nature === "CREDIT" && parseFloat(p.closing_balance) !== 0);
    }

    return result;
  }, [parties, search, filter]);

  const handleViewParty = (party: PartyAccount) => {
    setSelectedParty(party);
    setDetailSheetOpen(true);
  };

  return (
    <DashboardLayout activeNavItemId="party-ledger" breadcrumbs={[{ label: "Accounts", to: "/app/accounts/party-ledger" }, { label: "Party Ledger" }]}>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 data-testid="party-ledger-title" className="text-2xl font-semibold">Party Ledger</h1>
            <p className="text-sm text-muted-foreground">
              View and manage party accounts and balances
            </p>
          </div>
          <Button data-testid="party-ledger-add-button" onClick={() => setAddPartyOpen(true)}>
            <UserPlusIcon className="mr-2 h-4 w-4" />
            Add Party
          </Button>
        </div>

        <KPICards summary={summary} loading={summaryLoading} />

        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <CardTitle className="text-base font-medium">
                Party Accounts
              </CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    data-testid="party-ledger-search-input"
                    placeholder="Search parties..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 w-full sm:w-64"
                  />
                </div>
                <Select
                  value={filter}
                  onValueChange={(v) => setFilter(v as typeof filter)}
                >
                  <SelectTrigger data-testid="party-ledger-filter-select" className="w-56">
                    <FilterIcon className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Parties</SelectItem>
                    <SelectItem value="debtors">Debtors Only</SelectItem>
                    <SelectItem value="creditors">Creditors Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <PartyListTable
              parties={filteredParties}
              loading={partiesLoading}
              onViewParty={handleViewParty}
            />
          </CardContent>
        </Card>
      </div>

      <PartyDetailSheet
        party={selectedParty}
        open={detailSheetOpen}
        onOpenChange={setDetailSheetOpen}
      />

      <AddPartyDialog
        open={addPartyOpen}
        onOpenChange={setAddPartyOpen}
        onSuccess={refetch}
      />
    </DashboardLayout>
  );
}
