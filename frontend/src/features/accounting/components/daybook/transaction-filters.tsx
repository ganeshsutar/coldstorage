import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { DaybookTab } from "../../types/daybook"

interface TransactionFiltersProps {
  value: DaybookTab
  onChange: (value: DaybookTab) => void
  counts: {
    all: number
    receipts: number
    payments: number
    journal: number
  }
}

export function TransactionFilters({
  value,
  onChange,
  counts,
}: TransactionFiltersProps) {
  return (
    <Tabs
      value={value}
      onValueChange={(v) => onChange(v as DaybookTab)}
    >
      <TabsList>
        <TabsTrigger value="all" data-testid="daybook-filter-all">
          All ({counts.all})
        </TabsTrigger>
        <TabsTrigger value="receipts" data-testid="daybook-filter-receipts">
          Receipts ({counts.receipts})
        </TabsTrigger>
        <TabsTrigger value="payments" data-testid="daybook-filter-payments">
          Payments ({counts.payments})
        </TabsTrigger>
        <TabsTrigger value="journal" data-testid="daybook-filter-journal">
          Journal ({counts.journal})
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
