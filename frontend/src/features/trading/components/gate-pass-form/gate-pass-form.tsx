import * as React from "react"
import { useNavigate, useSearch } from "@tanstack/react-router"
import { ArrowLeft, Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { gatePassService } from "../../api/gate-passes"
import type { GatePassItemInput } from "../../types"

interface GatePassFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

interface AmadDispatchRow {
  amad_id: string
  pkt1: number
  pkt2: number
  pkt3: number
  weight: number
  rate: number
}

export function GatePassForm({ onSuccess, onCancel }: GatePassFormProps = {}) {
  const navigate = useNavigate()
  const search = useSearch({ strict: false }) as Record<string, string>
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  // Form state
  const [gpDate, setGpDate] = React.useState(new Date().toISOString().split("T")[0])
  const [gpTime, setGpTime] = React.useState("")
  const [sellerId, setSellerId] = React.useState("")
  const [buyerId, setBuyerId] = React.useState("")
  const [saudaId, setSaudaId] = React.useState(search?.sauda_id || "")
  const [transportName, setTransportName] = React.useState("")
  const [vehicleNo, setVehicleNo] = React.useState("")
  const [driverName, setDriverName] = React.useState("")
  const [driverContact, setDriverContact] = React.useState("")
  const [biltiNo, setBiltiNo] = React.useState("")
  const [gpRate, setGpRate] = React.useState<number>(0)
  const [remarks, setRemarks] = React.useState("")

  // Items
  const [items, setItems] = React.useState<AmadDispatchRow[]>([
    { amad_id: "", pkt1: 0, pkt2: 0, pkt3: 0, weight: 0, rate: 0 },
  ])

  const addItem = () => {
    setItems([...items, { amad_id: "", pkt1: 0, pkt2: 0, pkt3: 0, weight: 0, rate: 0 }])
  }

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index))
    }
  }

  const updateItem = (index: number, field: keyof AmadDispatchRow, value: string | number) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    setItems(newItems)
  }

  const handleSubmit = async () => {
    if (!sellerId || !buyerId || items.every((i) => !i.amad_id)) {
      setError("Please fill in all required fields and add at least one amad")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const gpItems: GatePassItemInput[] = items
        .filter((i) => i.amad_id)
        .map((i) => ({
          amad_id: i.amad_id,
          pkt1: i.pkt1,
          pkt2: i.pkt2,
          pkt3: i.pkt3,
          weight: i.weight,
          rate: i.rate || gpRate,
        }))

      await gatePassService.createGatePass({
        gp_date: gpDate,
        gp_time: gpTime || undefined,
        seller_id: sellerId,
        buyer_id: buyerId,
        sauda_id: saudaId || undefined,
        transport_name: transportName || undefined,
        vehicle_no: vehicleNo || undefined,
        driver_name: driverName || undefined,
        driver_contact: driverContact || undefined,
        bilti_no: biltiNo || undefined,
        rate: gpRate || undefined,
        remarks: remarks || undefined,
        items: gpItems,
      })

      if (onSuccess) {
        onSuccess()
      } else {
        navigate({ to: "/app/trading" })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create gate pass")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {!onSuccess && (
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onCancel ? onCancel() : navigate({ to: "/app/trading" })}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">New Gate Pass</h1>
            <p className="text-muted-foreground">Create a new gate pass for dispatch</p>
          </div>
        </div>
      )}

      {error && (
        <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
          {error}
        </div>
      )}

      {onSuccess ? (
        /* Compact dialog layout — no card wrappers */
        <div className="space-y-5">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="gp_date">Date *</Label>
              <Input id="gp_date" type="date" value={gpDate} onChange={(e) => setGpDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gp_time">Time</Label>
              <Input id="gp_time" type="time" value={gpTime} onChange={(e) => setGpTime(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sauda_id">Deal (Sauda) ID</Label>
              <Input id="sauda_id" value={saudaId} onChange={(e) => setSaudaId(e.target.value)} placeholder="Link to deal (optional)" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="seller_id">Seller (Account ID) *</Label>
              <Input id="seller_id" value={sellerId} onChange={(e) => setSellerId(e.target.value)} placeholder="Enter seller account ID" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="buyer_id">Buyer (Account ID) *</Label>
              <Input id="buyer_id" value={buyerId} onChange={(e) => setBuyerId(e.target.value)} placeholder="Enter buyer account ID" />
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-medium">Transport Details</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="transport_name">Transport Name</Label>
                <Input id="transport_name" value={transportName} onChange={(e) => setTransportName(e.target.value)} placeholder="Enter transport name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vehicle_no">Vehicle No</Label>
                <Input id="vehicle_no" value={vehicleNo} onChange={(e) => setVehicleNo(e.target.value)} placeholder="Enter vehicle number" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="driver_name">Driver Name</Label>
                <Input id="driver_name" value={driverName} onChange={(e) => setDriverName(e.target.value)} placeholder="Enter driver name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="driver_contact">Driver Contact</Label>
                <Input id="driver_contact" value={driverContact} onChange={(e) => setDriverContact(e.target.value)} placeholder="Enter driver contact" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bilti_no">Bilti No</Label>
                <Input id="bilti_no" value={biltiNo} onChange={(e) => setBiltiNo(e.target.value)} placeholder="Transport receipt no" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gp_rate">Default Rate</Label>
                <Input id="gp_rate" type="number" min="0" step="0.01" value={gpRate || ""} onChange={(e) => setGpRate(parseFloat(e.target.value) || 0)} placeholder="Default rate for items" className="font-mono" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="gp_remarks">Remarks</Label>
              <Textarea id="gp_remarks" value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Add any remarks..." rows={2} />
            </div>
          </div>
        </div>
      ) : (
        /* Full page layout with cards */
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Gate Pass Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="gp_date">Date *</Label>
                  <Input id="gp_date" type="date" value={gpDate} onChange={(e) => setGpDate(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gp_time">Time</Label>
                  <Input id="gp_time" type="time" value={gpTime} onChange={(e) => setGpTime(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sauda_id">Deal (Sauda) ID</Label>
                  <Input id="sauda_id" value={saudaId} onChange={(e) => setSaudaId(e.target.value)} placeholder="Link to deal (optional)" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Party & Deal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="seller_id">Seller (Account ID) *</Label>
                  <Input id="seller_id" value={sellerId} onChange={(e) => setSellerId(e.target.value)} placeholder="Enter seller account ID" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="buyer_id">Buyer (Account ID) *</Label>
                  <Input id="buyer_id" value={buyerId} onChange={(e) => setBuyerId(e.target.value)} placeholder="Enter buyer account ID" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Transport Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="transport_name">Transport Name</Label>
                  <Input id="transport_name" value={transportName} onChange={(e) => setTransportName(e.target.value)} placeholder="Enter transport name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vehicle_no">Vehicle No</Label>
                  <Input id="vehicle_no" value={vehicleNo} onChange={(e) => setVehicleNo(e.target.value)} placeholder="Enter vehicle number" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="driver_name">Driver Name</Label>
                  <Input id="driver_name" value={driverName} onChange={(e) => setDriverName(e.target.value)} placeholder="Enter driver name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="driver_contact">Driver Contact</Label>
                  <Input id="driver_contact" value={driverContact} onChange={(e) => setDriverContact(e.target.value)} placeholder="Enter driver contact" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bilti_no">Bilti No</Label>
                  <Input id="bilti_no" value={biltiNo} onChange={(e) => setBiltiNo(e.target.value)} placeholder="Transport receipt no" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gp_rate">Default Rate</Label>
                  <Input id="gp_rate" type="number" min="0" step="0.01" value={gpRate || ""} onChange={(e) => setGpRate(parseFloat(e.target.value) || 0)} placeholder="Default rate for items" className="font-mono" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="gp_remarks">Remarks</Label>
                <Textarea id="gp_remarks" value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Add any remarks..." rows={2} />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Amad Items */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Amads for Dispatch</CardTitle>
            <Button variant="outline" size="sm" onClick={addItem}>
              <Plus className="mr-2 h-4 w-4" />
              Add Row
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Amad ID</TableHead>
                <TableHead>Pkt1</TableHead>
                <TableHead>Pkt2</TableHead>
                <TableHead>Pkt3</TableHead>
                <TableHead>Weight (kg)</TableHead>
                <TableHead>Rate</TableHead>
                <TableHead className="w-[50px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Input
                      value={item.amad_id}
                      onChange={(e) => updateItem(index, "amad_id", e.target.value)}
                      placeholder="Amad ID"
                      className="min-w-[200px]"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min="0"
                      value={item.pkt1 || ""}
                      onChange={(e) => updateItem(index, "pkt1", parseInt(e.target.value) || 0)}
                      className="w-20"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min="0"
                      value={item.pkt2 || ""}
                      onChange={(e) => updateItem(index, "pkt2", parseInt(e.target.value) || 0)}
                      className="w-20"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min="0"
                      value={item.pkt3 || ""}
                      onChange={(e) => updateItem(index, "pkt3", parseInt(e.target.value) || 0)}
                      className="w-20"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.weight || ""}
                      onChange={(e) => updateItem(index, "weight", parseFloat(e.target.value) || 0)}
                      className="w-28"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.rate || ""}
                      onChange={(e) => updateItem(index, "rate", parseFloat(e.target.value) || 0)}
                      className="w-28"
                    />
                  </TableCell>
                  <TableCell>
                    {items.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(index)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-between pt-4 border-t">
        <Button
          variant="outline"
          onClick={() => onCancel ? onCancel() : navigate({ to: "/app/trading" })}
        >
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? "Saving..." : "Save Gate Pass"}
        </Button>
      </div>
    </div>
  )
}
