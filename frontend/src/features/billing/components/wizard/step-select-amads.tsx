import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { PartySelectorWithBalance } from "../shared/party-selector-with-balance"
import { AmadSelectionTable } from "./amad-selection-table"
import { useBillableAmads } from "../../hooks/use-rent-bills"
import { usePartyOutstanding } from "../../hooks/use-billing-stats"

interface StepSelectAmadsProps {
  partyId: string
  selectedAmadIds: string[]
  onPartyChange: (partyId: string) => void
  onAmadSelectionChange: (ids: string[]) => void
}

export function StepSelectAmads({
  partyId,
  selectedAmadIds,
  onPartyChange,
  onAmadSelectionChange,
}: StepSelectAmadsProps) {
  const { amads, loading: amadsLoading } = useBillableAmads(
    partyId || undefined
  )
  const { outstanding } = usePartyOutstanding(partyId || null)

  // Filter amads for the selected party
  const partyAmads = partyId
    ? amads.filter((a) => a.party === partyId)
    : []

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Party Selection</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="party">Select Party *</Label>
            <PartySelectorWithBalance
              value={partyId}
              onChange={(value) => {
                onPartyChange(value)
                onAmadSelectionChange([]) // Reset amad selection when party changes
              }}
              placeholder="Select party to generate bill..."
              showOutstanding={true}
              outstandingBillsCount={outstanding?.total_bills}
              outstandingAmount={outstanding?.outstanding_amount}
            />
          </div>
        </CardContent>
      </Card>

      {partyId && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              Available Amads for Billing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AmadSelectionTable
              amads={partyAmads}
              selectedIds={selectedAmadIds}
              onSelectionChange={onAmadSelectionChange}
              loading={amadsLoading}
            />
          </CardContent>
        </Card>
      )}

      {!partyId && (
        <Card>
          <CardContent className="flex items-center justify-center h-32 text-muted-foreground">
            Select a party to view billable amads
          </CardContent>
        </Card>
      )}
    </div>
  )
}
