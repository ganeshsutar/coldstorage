import { Download } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table"
import {
  formatIndianRupees,
  convertAmountToWords,
} from "../../utils/amount-to-words"
import { calculateGst } from "../../utils/gst-calculation"
import type { BillableAmad, GstType } from "../../types"
import type { ChargesFormData } from "./step-add-charges"

interface StepPreviewProps {
  partyName: string
  partyCode: string
  partyAddress?: string
  partyGstin?: string
  selectedAmads: BillableAmad[]
  charges: ChargesFormData
  graceDays?: number
  gstRate?: {
    cgst_rate: number
    sgst_rate: number
    igst_rate: number
  }
  gstType?: GstType
  billDate: string
}

export function StepPreview({
  partyName,
  partyCode,
  partyAddress,
  partyGstin,
  selectedAmads,
  charges,
  graceDays = 7,
  gstRate = { cgst_rate: 9, sgst_rate: 9, igst_rate: 18 },
  gstType = "INTRA",
  billDate,
}: StepPreviewProps) {
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

  // Calculate charges
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

  // Calculate GST
  const gstResult = calculateGst({
    taxableAmount,
    cgstRate: gstRate.cgst_rate,
    sgstRate: gstRate.sgst_rate,
    igstRate: gstRate.igst_rate,
    gstType,
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  return (
    <div className="space-y-6">
      {/* Invoice Preview */}
      <Card>
        <CardHeader className="pb-3 flex-row items-center justify-between">
          <CardTitle className="text-base">Bill Preview</CardTitle>
          <Button variant="outline" size="sm" disabled>
            <Download className="mr-2 size-4" />
            Download
          </Button>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg p-6 bg-white space-y-6">
            {/* Header */}
            <div className="text-center border-b pb-4">
              <h2 className="text-xl font-bold">KIRAAYA BILL</h2>
              <p className="text-sm text-muted-foreground">(Rent Invoice)</p>
            </div>

            {/* Company & Bill Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-semibold">Cold Storage XYZ</p>
                <p className="text-sm text-muted-foreground">
                  Address Line 1, City
                </p>
                <p className="text-sm text-muted-foreground">
                  GSTIN: 09XXXXX1234XXXXX
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm">
                  <span className="text-muted-foreground">Bill No:</span>{" "}
                  <span className="font-mono font-medium">Auto</span>
                </p>
                <p className="text-sm">
                  <span className="text-muted-foreground">Date:</span>{" "}
                  <span className="font-medium">{formatDate(billDate)}</span>
                </p>
              </div>
            </div>

            <Separator />

            {/* Bill To */}
            <div>
              <p className="text-sm text-muted-foreground mb-1">Bill To:</p>
              <p className="font-semibold">{partyName}</p>
              <p className="text-sm text-muted-foreground">
                Party Code: {partyCode}
              </p>
              {partyAddress && (
                <p className="text-sm text-muted-foreground">{partyAddress}</p>
              )}
              {partyGstin && (
                <p className="text-sm text-muted-foreground">
                  GSTIN: {partyGstin}
                </p>
              )}
            </div>

            <Separator />

            {/* Particulars */}
            <div>
              <p className="font-medium mb-3">Particulars</p>

              {/* Storage Rent */}
              <div className="mb-4">
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  Storage Rent (HSN: 996721)
                </p>
                <div className="space-y-1 pl-4">
                  {rentBreakdown.map((amad) => (
                    <div
                      key={amad.id}
                      className="flex justify-between text-sm"
                    >
                      <span>
                        Amad #{amad.amad_no}: {amad.total_packets} bags ×{" "}
                        {amad.billableDays} days × {formatIndianRupees(amad.rent_rate)}
                      </span>
                      <span className="font-mono">
                        {formatIndianRupees(amad.rentAmount)}
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between text-sm font-medium pt-1 border-t">
                    <span>Sub-total</span>
                    <span className="font-mono">
                      {formatIndianRupees(totalRent)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Additional Charges */}
              {loadingCharges > 0 && (
                <div className="flex justify-between text-sm">
                  <span>
                    Loading Charges ({charges.loadingQty} bags ×{" "}
                    {formatIndianRupees(charges.loadingRate)})
                  </span>
                  <span className="font-mono">
                    {formatIndianRupees(loadingCharges)}
                  </span>
                </div>
              )}
              {unloadingCharges > 0 && (
                <div className="flex justify-between text-sm">
                  <span>
                    Unloading Charges ({charges.unloadingQty} bags ×{" "}
                    {formatIndianRupees(charges.unloadingRate)})
                  </span>
                  <span className="font-mono">
                    {formatIndianRupees(unloadingCharges)}
                  </span>
                </div>
              )}
              {dalaCharges > 0 && (
                <div className="flex justify-between text-sm">
                  <span>
                    Dala Charges ({charges.dalaQty} bags ×{" "}
                    {formatIndianRupees(charges.dalaRate)})
                  </span>
                  <span className="font-mono">
                    {formatIndianRupees(dalaCharges)}
                  </span>
                </div>
              )}
              {kataiCharges > 0 && (
                <div className="flex justify-between text-sm">
                  <span>
                    Katai Charges ({charges.kataiQty} bags ×{" "}
                    {formatIndianRupees(charges.kataiRate)})
                  </span>
                  <span className="font-mono">
                    {formatIndianRupees(kataiCharges)}
                  </span>
                </div>
              )}
              {charges.insuranceAmount > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Insurance</span>
                  <span className="font-mono">
                    {formatIndianRupees(charges.insuranceAmount)}
                  </span>
                </div>
              )}
              {charges.customCharges.map(
                (c) =>
                  c.amount > 0 && (
                    <div key={c.id} className="flex justify-between text-sm">
                      <span>{c.name || "Other Charges"}</span>
                      <span className="font-mono">
                        {formatIndianRupees(c.amount)}
                      </span>
                    </div>
                  )
              )}

              <Separator className="my-3" />

              {/* Totals */}
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Taxable Amount</span>
                  <span className="font-mono">
                    {formatIndianRupees(gstResult.taxableAmount)}
                  </span>
                </div>
                {gstType === "INTRA" ? (
                  <>
                    <div className="flex justify-between text-sm">
                      <span>CGST @ {gstRate.cgst_rate}%</span>
                      <span className="font-mono">
                        {formatIndianRupees(gstResult.cgstAmount)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>SGST @ {gstRate.sgst_rate}%</span>
                      <span className="font-mono">
                        {formatIndianRupees(gstResult.sgstAmount)}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between text-sm">
                    <span>IGST @ {gstRate.igst_rate}%</span>
                    <span className="font-mono">
                      {formatIndianRupees(gstResult.igstAmount)}
                    </span>
                  </div>
                )}
                {gstResult.roundOff !== 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Round Off</span>
                    <span className="font-mono">
                      {gstResult.roundOff > 0 ? "+" : ""}
                      {formatIndianRupees(gstResult.roundOff)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
                  <span>TOTAL</span>
                  <span className="font-mono">
                    {formatIndianRupees(gstResult.netAmount)}
                  </span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Amount in Words */}
            <div>
              <p className="text-sm text-muted-foreground">Amount in Words:</p>
              <p className="font-medium">
                {convertAmountToWords(gstResult.netAmount)}
              </p>
            </div>

            {/* Bank Details */}
            <div className="text-sm">
              <p className="text-muted-foreground">Bank Details:</p>
              <p>Bank: HDFC Bank | A/C: 1234567890</p>
              <p>IFSC: HDFC0001234 | Branch: Main</p>
            </div>

            {/* Signatures */}
            <div className="grid grid-cols-2 gap-8 pt-8">
              <div className="text-center">
                <div className="border-t pt-2">
                  <p className="text-sm text-muted-foreground">
                    Receiver Signature
                  </p>
                </div>
              </div>
              <div className="text-center">
                <div className="border-t pt-2">
                  <p className="text-sm text-muted-foreground">
                    Authorized Signature
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* GST Summary Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">GST Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>HSN Code</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Taxable</TableHead>
                  {gstType === "INTRA" ? (
                    <>
                      <TableHead className="text-right">CGST</TableHead>
                      <TableHead className="text-right">SGST</TableHead>
                    </>
                  ) : (
                    <TableHead className="text-right">IGST</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-mono">996721</TableCell>
                  <TableCell>Cold Storage Services</TableCell>
                  <TableCell className="text-right font-mono">
                    {formatIndianRupees(taxableAmount)}
                  </TableCell>
                  {gstType === "INTRA" ? (
                    <>
                      <TableCell className="text-right font-mono">
                        {formatIndianRupees(gstResult.cgstAmount)}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatIndianRupees(gstResult.sgstAmount)}
                      </TableCell>
                    </>
                  ) : (
                    <TableCell className="text-right font-mono">
                      {formatIndianRupees(gstResult.igstAmount)}
                    </TableCell>
                  )}
                </TableRow>
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={2} className="font-medium">
                    Total Tax
                  </TableCell>
                  <TableCell className="text-right font-mono font-medium">
                    {formatIndianRupees(taxableAmount)}
                  </TableCell>
                  {gstType === "INTRA" ? (
                    <>
                      <TableCell className="text-right font-mono font-medium">
                        {formatIndianRupees(gstResult.cgstAmount)}
                      </TableCell>
                      <TableCell className="text-right font-mono font-medium">
                        {formatIndianRupees(gstResult.sgstAmount)}
                      </TableCell>
                    </>
                  ) : (
                    <TableCell className="text-right font-mono font-medium">
                      {formatIndianRupees(gstResult.igstAmount)}
                    </TableCell>
                  )}
                </TableRow>
              </TableFooter>
            </Table>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Total Tax: {formatIndianRupees(gstResult.totalGst)}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
