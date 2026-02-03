import { useSearch } from "@tanstack/react-router"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { ReceiptEntryForm } from "@/features/billing"

interface ReceiptSearchParams {
  party_id?: string
  bill_id?: string
}

export function NewReceiptPage() {
  const search = useSearch({ strict: false }) as ReceiptSearchParams

  return (
    <DashboardLayout activeNavItemId="billing">
      <ReceiptEntryForm
        initialPartyId={search?.party_id}
        initialBillId={search?.bill_id}
      />
    </DashboardLayout>
  )
}
