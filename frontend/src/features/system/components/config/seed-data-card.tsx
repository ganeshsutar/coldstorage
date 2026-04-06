import * as React from "react"
import { Database, Loader2, CheckCircle2, AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useSeedData } from "../../hooks"
import type { SeedCategoryStatus } from "../../types"

const CATEGORY_LABELS: Record<string, { label: string; unit: string }> = {
  chart_of_accounts: { label: "Chart of Accounts", unit: "accounts" },
  banks: { label: "Banks", unit: "banks" },
  bardana_types: { label: "Bardana Types", unit: "types" },
  commodities: { label: "Commodities", unit: "commodities" },
}

function CategoryRow({
  categoryKey,
  status,
}: {
  categoryKey: string
  status: SeedCategoryStatus
}) {
  const meta = CATEGORY_LABELS[categoryKey]
  if (!meta) return null

  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium">{meta.label}</span>
        <Badge variant={status.seeded ? "default" : "secondary"}>
          {status.seeded ? "Seeded" : "Pending"}
        </Badge>
      </div>
      <span className="text-sm text-muted-foreground">
        {status.existing}/{status.total} {meta.unit}
      </span>
    </div>
  )
}

export function SeedDataCard() {
  const { status, loading, error, seeding, result, seedAll } = useSeedData()
  const [seedError, setSeedError] = React.useState<string | null>(null)

  const handleSeed = async () => {
    try {
      setSeedError(null)
      await seedAll()
    } catch {
      setSeedError("Failed to seed data. Please try again.")
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="size-5" />
            Seed Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Loading seed data status...
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="size-5" />
          Seed Data
        </CardTitle>
        <CardDescription>
          Initialize your organization with default chart of accounts, banks, bardana types, and commodities.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="size-4" />
            {error}
          </div>
        )}

        {status && (
          <div className="divide-y">
            {(Object.keys(CATEGORY_LABELS) as string[]).map((key) => {
              const catStatus = status[key as keyof typeof status]
              if (typeof catStatus === "boolean") return null
              return (
                <CategoryRow
                  key={key}
                  categoryKey={key}
                  status={catStatus as SeedCategoryStatus}
                />
              )
            })}
          </div>
        )}

        {result && (
          <div className="flex items-start gap-2 rounded-md border border-status-success bg-status-success-muted p-3">
            <CheckCircle2 className="size-4 mt-0.5 text-status-success-foreground" />
            <div className="text-sm text-status-success-foreground">
              <p className="font-medium">Seeding complete</p>
              <ul className="mt-1 space-y-0.5">
                {Object.entries(result).map(([key, counts]) => {
                  const meta = CATEGORY_LABELS[key]
                  if (!meta) return null
                  return (
                    <li key={key}>
                      {meta.label}: {counts.created} created, {counts.updated} updated
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>
        )}

        {seedError && (
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="size-4" />
            {seedError}
          </div>
        )}

        <Button
          onClick={handleSeed}
          disabled={seeding}
          data-testid="seed-data-button"
        >
          {seeding && <Loader2 className="mr-2 size-4 animate-spin" />}
          {status?.all_seeded ? "Re-seed Data" : "Initialize Seed Data"}
        </Button>
      </CardContent>
    </Card>
  )
}
