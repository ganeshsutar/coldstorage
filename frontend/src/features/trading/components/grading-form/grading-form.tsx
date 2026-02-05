import * as React from "react"
import { useNavigate } from "@tanstack/react-router"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

import { kataiService } from "../../api/katais"
import { formatCurrency } from "../../utils"

interface GradingFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export function GradingForm({ onSuccess, onCancel }: GradingFormProps = {}) {
  const navigate = useNavigate()
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  // Form state
  const [kataiDate, setKataiDate] = React.useState(
    new Date().toISOString().split("T")[0]
  )
  const [partyId, setPartyId] = React.useState("")
  const [amadId, setAmadId] = React.useState("")
  const [bagsGraded, setBagsGraded] = React.useState<number>(0)
  const [motaBags, setMotaBags] = React.useState<number>(0)
  const [chattaBags, setChattaBags] = React.useState<number>(0)
  const [beejBags, setBeejBags] = React.useState<number>(0)
  const [mixBags, setMixBags] = React.useState<number>(0)
  const [gullaBags, setGullaBags] = React.useState<number>(0)
  const [chargePerBag, setChargePerBag] = React.useState<number>(0)
  const [laborName, setLaborName] = React.useState("")
  const [remarks, setRemarks] = React.useState("")

  const outputSum = motaBags + chattaBags + beejBags + mixBags + gullaBags
  const totalCharges = bagsGraded * chargePerBag
  const isOutputValid = outputSum === bagsGraded && bagsGraded > 0

  const handleSubmit = async () => {
    if (!partyId || !amadId || bagsGraded <= 0) {
      setError("Please fill in all required fields")
      return
    }
    if (!isOutputValid) {
      setError(`Output bags sum (${outputSum}) must equal bags graded (${bagsGraded})`)
      return
    }

    setLoading(true)
    setError(null)

    try {
      await kataiService.createKatai({
        katai_date: kataiDate,
        party_id: partyId,
        amad_id: amadId,
        bags_graded: bagsGraded,
        mota_bags: motaBags,
        chatta_bags: chattaBags,
        beej_bags: beejBags,
        mix_bags: mixBags,
        gulla_bags: gullaBags,
        charge_per_bag: chargePerBag || undefined,
        labor_name: laborName || undefined,
        remarks: remarks || undefined,
      })

      if (onSuccess) {
        onSuccess()
      } else {
        navigate({ to: "/app/trading" })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create grading record")
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
            <h1 className="text-2xl font-bold">New Grading (Katai)</h1>
            <p className="text-muted-foreground">Record commodity grading details</p>
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
          <div className="grid grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="katai_date">Date *</Label>
              <Input
                id="katai_date"
                type="date"
                value={kataiDate}
                onChange={(e) => setKataiDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="party_id">Party (Account ID) *</Label>
              <Input
                id="party_id"
                value={partyId}
                onChange={(e) => setPartyId(e.target.value)}
                placeholder="Enter party account ID"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amad_id">Amad ID *</Label>
              <Input
                id="amad_id"
                value={amadId}
                onChange={(e) => setAmadId(e.target.value)}
                placeholder="Enter amad ID"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bags_graded">Bags to Grade *</Label>
              <Input
                id="bags_graded"
                type="number"
                min="0"
                value={bagsGraded || ""}
                onChange={(e) => setBagsGraded(parseInt(e.target.value) || 0)}
                placeholder="Enter total bags"
              />
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-medium">
              Output Breakdown
              {bagsGraded > 0 && (
                <span className={`ml-2 text-sm font-normal ${isOutputValid ? "text-green-600" : "text-destructive"}`}>
                  ({outputSum}/{bagsGraded} bags)
                </span>
              )}
            </h4>
            <div className="grid grid-cols-5 gap-4">
              <div className="space-y-2">
                <Label htmlFor="mota_bags">Mota</Label>
                <Input id="mota_bags" type="number" min="0" value={motaBags || ""} onChange={(e) => setMotaBags(parseInt(e.target.value) || 0)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="chatta_bags">Chatta</Label>
                <Input id="chatta_bags" type="number" min="0" value={chattaBags || ""} onChange={(e) => setChattaBags(parseInt(e.target.value) || 0)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="beej_bags">Beej</Label>
                <Input id="beej_bags" type="number" min="0" value={beejBags || ""} onChange={(e) => setBeejBags(parseInt(e.target.value) || 0)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mix_bags">Mix</Label>
                <Input id="mix_bags" type="number" min="0" value={mixBags || ""} onChange={(e) => setMixBags(parseInt(e.target.value) || 0)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gulla_bags">Gulla</Label>
                <Input id="gulla_bags" type="number" min="0" value={gullaBags || ""} onChange={(e) => setGullaBags(parseInt(e.target.value) || 0)} />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-medium">Charges & Labor</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="charge_per_bag">Charge per Bag</Label>
                <Input
                  id="charge_per_bag"
                  type="number"
                  min="0"
                  step="0.01"
                  value={chargePerBag || ""}
                  onChange={(e) => setChargePerBag(parseFloat(e.target.value) || 0)}
                  placeholder="Rate per bag"
                  className="font-mono"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">Total Charges</Label>
                <div className="p-2 border rounded-md bg-muted text-lg font-mono font-medium">
                  {formatCurrency(totalCharges)}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="labor_name">Labor Name</Label>
                <Input
                  id="labor_name"
                  value={laborName}
                  onChange={(e) => setLaborName(e.target.value)}
                  placeholder="Enter labor name"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="grading_remarks">Remarks</Label>
              <Textarea
                id="grading_remarks"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Add any remarks..."
                rows={2}
              />
            </div>
          </div>
        </div>
      ) : (
        /* Full page layout with cards */
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Source</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="katai_date">Date *</Label>
                  <Input
                    id="katai_date"
                    type="date"
                    value={kataiDate}
                    onChange={(e) => setKataiDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="party_id">Party (Account ID) *</Label>
                  <Input
                    id="party_id"
                    value={partyId}
                    onChange={(e) => setPartyId(e.target.value)}
                    placeholder="Enter party account ID"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amad_id">Amad ID *</Label>
                  <Input
                    id="amad_id"
                    value={amadId}
                    onChange={(e) => setAmadId(e.target.value)}
                    placeholder="Enter amad ID"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bags_graded">Total Bags to Grade *</Label>
                <Input
                  id="bags_graded"
                  type="number"
                  min="0"
                  value={bagsGraded || ""}
                  onChange={(e) => setBagsGraded(parseInt(e.target.value) || 0)}
                  placeholder="Enter total bags"
                  className="max-w-[200px]"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                Output Breakdown
                {bagsGraded > 0 && (
                  <span className={`ml-2 text-sm font-normal ${isOutputValid ? "text-green-600" : "text-destructive"}`}>
                    ({outputSum}/{bagsGraded} bags)
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-5">
                <div className="space-y-2">
                  <Label htmlFor="mota_bags">Mota</Label>
                  <Input id="mota_bags" type="number" min="0" value={motaBags || ""} onChange={(e) => setMotaBags(parseInt(e.target.value) || 0)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="chatta_bags">Chatta</Label>
                  <Input id="chatta_bags" type="number" min="0" value={chattaBags || ""} onChange={(e) => setChattaBags(parseInt(e.target.value) || 0)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="beej_bags">Beej</Label>
                  <Input id="beej_bags" type="number" min="0" value={beejBags || ""} onChange={(e) => setBeejBags(parseInt(e.target.value) || 0)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mix_bags">Mix</Label>
                  <Input id="mix_bags" type="number" min="0" value={mixBags || ""} onChange={(e) => setMixBags(parseInt(e.target.value) || 0)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gulla_bags">Gulla</Label>
                  <Input id="gulla_bags" type="number" min="0" value={gullaBags || ""} onChange={(e) => setGullaBags(parseInt(e.target.value) || 0)} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Charges & Labor</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="charge_per_bag">Charge per Bag</Label>
                  <Input
                    id="charge_per_bag"
                    type="number"
                    min="0"
                    step="0.01"
                    value={chargePerBag || ""}
                    onChange={(e) => setChargePerBag(parseFloat(e.target.value) || 0)}
                    placeholder="Rate per bag"
                    className="font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Total Charges</Label>
                  <div className="p-2 border rounded-md bg-muted text-lg font-mono font-medium">
                    {formatCurrency(totalCharges)}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="labor_name">Labor Name</Label>
                  <Input
                    id="labor_name"
                    value={laborName}
                    onChange={(e) => setLaborName(e.target.value)}
                    placeholder="Enter labor name"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="grading_remarks">Remarks</Label>
                <Textarea
                  id="grading_remarks"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Add any remarks..."
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-between pt-4 border-t">
        <Button
          variant="outline"
          onClick={() => onCancel ? onCancel() : navigate({ to: "/app/trading" })}
        >
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={loading || !isOutputValid}>
          {loading ? "Saving..." : "Save Grading"}
        </Button>
      </div>
    </div>
  )
}
