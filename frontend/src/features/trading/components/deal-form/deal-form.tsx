import * as React from "react"
import { useNavigate } from "@tanstack/react-router"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

import { saudaService } from "../../api/saudas"
import { formatCurrency } from "../../utils"

export function DealForm() {
  const navigate = useNavigate()
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  // Form state
  const [dealDate, setDealDate] = React.useState(
    new Date().toISOString().split("T")[0]
  )
  const [sellerId, setSellerId] = React.useState("")
  const [buyerId, setBuyerId] = React.useState("")
  const [commodityId, setCommodityId] = React.useState("")
  const [variety, setVariety] = React.useState("")
  const [quantity, setQuantity] = React.useState<number>(0)
  const [rate, setRate] = React.useState<number>(0)
  const [dueDays, setDueDays] = React.useState<number>(0)
  const [dueDate, setDueDate] = React.useState("")
  const [paymentTerms, setPaymentTerms] = React.useState("")
  const [deliveryLocation, setDeliveryLocation] = React.useState("")
  const [remarks, setRemarks] = React.useState("")

  const totalAmount = quantity * rate

  const handleSubmit = async () => {
    if (!sellerId || !buyerId || !commodityId || quantity <= 0 || rate <= 0) {
      setError("Please fill in all required fields")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const result = await saudaService.createSauda({
        deal_date: dealDate,
        seller_id: sellerId,
        buyer_id: buyerId,
        commodity_id: commodityId,
        variety: variety || undefined,
        quantity,
        rate,
        due_days: dueDays || undefined,
        due_date: dueDate || undefined,
        payment_terms: paymentTerms || undefined,
        delivery_location: deliveryLocation || undefined,
        remarks: remarks || undefined,
      })

      navigate({ to: "/app/trading/deals/$id", params: { id: result.id } })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create deal")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate({ to: "/app/trading" })}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">New Deal (Sauda)</h1>
          <p className="text-muted-foreground">Create a new trading deal</p>
        </div>
      </div>

      {error && (
        <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
          {error}
        </div>
      )}

      {/* Deal Info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Deal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="deal_date">Deal Date *</Label>
              <Input
                id="deal_date"
                type="date"
                value={dealDate}
                onChange={(e) => setDealDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="variety">Variety</Label>
              <Input
                id="variety"
                value={variety}
                onChange={(e) => setVariety(e.target.value)}
                placeholder="Enter variety"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Parties */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Parties</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="seller_id">Seller (Party Account ID) *</Label>
              <Input
                id="seller_id"
                value={sellerId}
                onChange={(e) => setSellerId(e.target.value)}
                placeholder="Enter seller account ID"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="buyer_id">Buyer (Party Account ID) *</Label>
              <Input
                id="buyer_id"
                value={buyerId}
                onChange={(e) => setBuyerId(e.target.value)}
                placeholder="Enter buyer account ID"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="commodity_id">Commodity ID *</Label>
            <Input
              id="commodity_id"
              value={commodityId}
              onChange={(e) => setCommodityId(e.target.value)}
              placeholder="Enter commodity ID"
            />
          </div>
        </CardContent>
      </Card>

      {/* Quantity & Rate */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity (Bags) *</Label>
              <Input
                id="quantity"
                type="number"
                min="0"
                step="0.01"
                value={quantity || ""}
                onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
                placeholder="Enter quantity"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rate">Rate *</Label>
              <Input
                id="rate"
                type="number"
                min="0"
                step="0.01"
                value={rate || ""}
                onChange={(e) => setRate(parseFloat(e.target.value) || 0)}
                placeholder="Enter rate"
                className="font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground">Total Amount</Label>
              <div className="p-2 border rounded-md bg-muted text-lg font-mono font-medium">
                {formatCurrency(totalAmount)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Terms */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Terms</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="due_days">Due Days</Label>
              <Input
                id="due_days"
                type="number"
                min="0"
                value={dueDays || ""}
                onChange={(e) => setDueDays(parseInt(e.target.value) || 0)}
                placeholder="Number of days"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="due_date">Due Date</Label>
              <Input
                id="due_date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="delivery_location">Delivery Location</Label>
            <Input
              id="delivery_location"
              value={deliveryLocation}
              onChange={(e) => setDeliveryLocation(e.target.value)}
              placeholder="Enter delivery location"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="payment_terms">Payment Terms</Label>
            <Textarea
              id="payment_terms"
              value={paymentTerms}
              onChange={(e) => setPaymentTerms(e.target.value)}
              placeholder="Enter payment terms"
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="remarks">Remarks</Label>
            <Textarea
              id="remarks"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Add any remarks..."
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-between pt-4 border-t">
        <Button
          variant="outline"
          onClick={() => navigate({ to: "/app/trading" })}
        >
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? "Saving..." : "Save Deal"}
        </Button>
      </div>
    </div>
  )
}
