import * as React from "react"
import { Plus, Trash2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table"
import { formatIndianRupees } from "../../utils/amount-to-words"
import { AmountSummaryRow } from "../shared/amount-display"
import type { BillableAmad } from "../../types"

export interface ChargesFormData {
  loadingRate: number
  loadingQty: number
  unloadingRate: number
  unloadingQty: number
  dalaRate: number
  dalaQty: number
  kataiRate: number
  kataiQty: number
  insuranceAmount: number
  customCharges: Array<{
    id: string
    name: string
    amount: number
  }>
}

interface StepAddChargesProps {
  selectedAmads: BillableAmad[]
  charges: ChargesFormData
  onChargesChange: (charges: ChargesFormData) => void
  graceDays?: number
}

export function StepAddCharges({
  selectedAmads,
  charges,
  onChargesChange,
  graceDays = 7,
}: StepAddChargesProps) {
  const totalBags = selectedAmads.reduce((sum, a) => sum + a.total_packets, 0)

  // Use refs to avoid stale closures in effects
  const onChargesChangeRef = React.useRef(onChargesChange)
  const chargesRef = React.useRef(charges)

  React.useEffect(() => {
    onChargesChangeRef.current = onChargesChange
  }, [onChargesChange])

  React.useEffect(() => {
    chargesRef.current = charges
  }, [charges])

  // Initialize quantities based on total bags if not set
  React.useEffect(() => {
    if (chargesRef.current.loadingQty === 0 && totalBags > 0) {
      onChargesChangeRef.current({
        ...chargesRef.current,
        loadingQty: totalBags,
        unloadingQty: totalBags,
        dalaQty: totalBags,
        kataiQty: 0,
      })
    }
  }, [totalBags])

  const handleChargeChange = (
    field: keyof ChargesFormData,
    value: number | string
  ) => {
    onChargesChange({
      ...charges,
      [field]: value,
    })
  }

  const handleAddCustomCharge = () => {
    onChargesChange({
      ...charges,
      customCharges: [
        ...charges.customCharges,
        { id: Date.now().toString(), name: "", amount: 0 },
      ],
    })
  }

  const handleRemoveCustomCharge = (id: string) => {
    onChargesChange({
      ...charges,
      customCharges: charges.customCharges.filter((c) => c.id !== id),
    })
  }

  const handleCustomChargeChange = (
    id: string,
    field: "name" | "amount",
    value: string | number
  ) => {
    onChargesChange({
      ...charges,
      customCharges: charges.customCharges.map((c) =>
        c.id === id ? { ...c, [field]: value } : c
      ),
    })
  }

  // Calculate rent for each amad
  const rentBreakdown = selectedAmads.map((amad) => {
    const billableDays = Math.max(0, amad.storage_days - graceDays)
    const rentAmount = amad.weight_qtl * amad.rent_rate * (billableDays / 30)
    return {
      ...amad,
      billableDays,
      rentAmount: Math.round(rentAmount * 100) / 100,
    }
  })

  const totalRent = rentBreakdown.reduce((sum, a) => sum + a.rentAmount, 0)

  // Calculate additional charges
  const loadingCharges = charges.loadingRate * charges.loadingQty
  const unloadingCharges = charges.unloadingRate * charges.unloadingQty
  const dalaCharges = charges.dalaRate * charges.dalaQty
  const kataiCharges = charges.kataiRate * charges.kataiQty
  const customTotal = charges.customCharges.reduce(
    (sum, c) => sum + (c.amount || 0),
    0
  )

  const taxableAmount =
    totalRent +
    loadingCharges +
    unloadingCharges +
    dalaCharges +
    kataiCharges +
    charges.insuranceAmount +
    customTotal

  return (
    <div className="space-y-6">
      {/* Rent Calculation */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Rent Calculation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Amad#</TableHead>
                  <TableHead className="text-right">Bags</TableHead>
                  <TableHead className="text-right">Wt (Qtl)</TableHead>
                  <TableHead className="text-right">Rate/Qtl</TableHead>
                  <TableHead className="text-right">Days</TableHead>
                  <TableHead className="text-right">Grace</TableHead>
                  <TableHead className="text-right">Billable</TableHead>
                  <TableHead className="text-right">Rent</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rentBreakdown.map((amad) => (
                  <TableRow key={amad.id}>
                    <TableCell className="font-mono">{amad.amad_no}</TableCell>
                    <TableCell className="text-right font-mono">
                      {amad.total_packets}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {amad.weight_qtl.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {amad.rent_rate.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {amad.storage_days}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {graceDays}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {amad.billableDays}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatIndianRupees(amad.rentAmount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={7} className="font-medium">
                    Total Rent
                  </TableCell>
                  <TableCell className="text-right font-mono font-medium">
                    {formatIndianRupees(totalRent)}
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Additional Charges */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Additional Charges</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Charge Type</TableHead>
                  <TableHead className="w-[120px]">Rate/Unit</TableHead>
                  <TableHead className="w-[100px]">Qty</TableHead>
                  <TableHead className="text-right w-[120px]">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>Loading</TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      step="0.5"
                      min="0"
                      value={charges.loadingRate || ""}
                      onChange={(e) =>
                        handleChargeChange(
                          "loadingRate",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      placeholder="Rate/bag"
                      className="h-8"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min="0"
                      value={charges.loadingQty || ""}
                      onChange={(e) =>
                        handleChargeChange(
                          "loadingQty",
                          parseInt(e.target.value) || 0
                        )
                      }
                      className="h-8"
                    />
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {formatIndianRupees(loadingCharges)}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Unloading</TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      step="0.5"
                      min="0"
                      value={charges.unloadingRate || ""}
                      onChange={(e) =>
                        handleChargeChange(
                          "unloadingRate",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      placeholder="Rate/bag"
                      className="h-8"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min="0"
                      value={charges.unloadingQty || ""}
                      onChange={(e) =>
                        handleChargeChange(
                          "unloadingQty",
                          parseInt(e.target.value) || 0
                        )
                      }
                      className="h-8"
                    />
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {formatIndianRupees(unloadingCharges)}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Dala Charges</TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      step="0.5"
                      min="0"
                      value={charges.dalaRate || ""}
                      onChange={(e) =>
                        handleChargeChange(
                          "dalaRate",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      placeholder="Rate/bag"
                      className="h-8"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min="0"
                      value={charges.dalaQty || ""}
                      onChange={(e) =>
                        handleChargeChange(
                          "dalaQty",
                          parseInt(e.target.value) || 0
                        )
                      }
                      className="h-8"
                    />
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {formatIndianRupees(dalaCharges)}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Katai (Grading)</TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      step="0.5"
                      min="0"
                      value={charges.kataiRate || ""}
                      onChange={(e) =>
                        handleChargeChange(
                          "kataiRate",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      placeholder="Rate/bag"
                      className="h-8"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min="0"
                      value={charges.kataiQty || ""}
                      onChange={(e) =>
                        handleChargeChange(
                          "kataiQty",
                          parseInt(e.target.value) || 0
                        )
                      }
                      className="h-8"
                    />
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {formatIndianRupees(kataiCharges)}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Insurance</TableCell>
                  <TableCell colSpan={2}>
                    <Input
                      type="number"
                      min="0"
                      value={charges.insuranceAmount || ""}
                      onChange={(e) =>
                        handleChargeChange(
                          "insuranceAmount",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      placeholder="Amount"
                      className="h-8"
                    />
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {formatIndianRupees(charges.insuranceAmount)}
                  </TableCell>
                </TableRow>
                {charges.customCharges.map((custom) => (
                  <TableRow key={custom.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Input
                          value={custom.name}
                          onChange={(e) =>
                            handleCustomChargeChange(
                              custom.id,
                              "name",
                              e.target.value
                            )
                          }
                          placeholder="Charge name"
                          className="h-8"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleRemoveCustomCharge(custom.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell colSpan={2}>
                      <Input
                        type="number"
                        min="0"
                        value={custom.amount || ""}
                        onChange={(e) =>
                          handleCustomChargeChange(
                            custom.id,
                            "amount",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        placeholder="Amount"
                        className="h-8"
                      />
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatIndianRupees(custom.amount || 0)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={handleAddCustomCharge}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Custom Charge
          </Button>
        </CardContent>
      </Card>

      {/* Bill Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Bill Summary (Pre-GST)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <AmountSummaryRow label="Storage Rent" amount={totalRent} />
            {loadingCharges > 0 && (
              <AmountSummaryRow label="Loading Charges" amount={loadingCharges} />
            )}
            {unloadingCharges > 0 && (
              <AmountSummaryRow label="Unloading Charges" amount={unloadingCharges} />
            )}
            {dalaCharges > 0 && (
              <AmountSummaryRow label="Dala Charges" amount={dalaCharges} />
            )}
            {kataiCharges > 0 && (
              <AmountSummaryRow label="Katai Charges" amount={kataiCharges} />
            )}
            {charges.insuranceAmount > 0 && (
              <AmountSummaryRow label="Insurance" amount={charges.insuranceAmount} />
            )}
            {charges.customCharges.map(
              (c) =>
                c.amount > 0 && (
                  <AmountSummaryRow
                    key={c.id}
                    label={c.name || "Other"}
                    amount={c.amount}
                  />
                )
            )}
            <AmountSummaryRow
              label="Taxable Amount"
              amount={taxableAmount}
              isSubtotal
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
