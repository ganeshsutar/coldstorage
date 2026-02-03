import * as React from "react"
import { useNavigate } from "@tanstack/react-router"
import { ArrowLeft, Loader2 } from "lucide-react"
import { Link } from "@tanstack/react-router"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useAmads } from "@/features/inventory/hooks/use-amad"
import { useAmadLocations, unloadingService } from "@/features/warehouse"
import { toast } from "sonner"

export function NewUnloadingPage() {
  const navigate = useNavigate()
  const [submitting, setSubmitting] = React.useState(false)

  // Form state
  const [amadId, setAmadId] = React.useState("")
  const [date, setDate] = React.useState(new Date().toISOString().split("T")[0])
  const [selectedLocation, setSelectedLocation] = React.useState<string | null>(null)
  const [quantity, setQuantity] = React.useState("")

  // Fetch data
  const { amads, loading: amadsLoading } = useAmads({ is_fully_dispatched: "false" })
  const { locations, loading: locationsLoading } = useAmadLocations(amadId || null)

  const selectedAmad = amads.find((a) => a.id === amadId)
  const selectedLoc = selectedLocation
    ? locations.find(
        (l) =>
          `${l.room_id}-${l.floor_number}-${l.rack_number}` === selectedLocation
      )
    : null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!amadId || !date || !selectedLoc || !quantity) {
      toast.error("Please fill in all required fields")
      return
    }

    const qty = parseInt(quantity)
    if (qty > selectedLoc.quantity) {
      toast.error(`Cannot unload more than ${selectedLoc.quantity} bags from this location`)
      return
    }

    setSubmitting(true)
    try {
      await unloadingService.createUnloading({
        amad: amadId,
        date,
        room: selectedLoc.room_id,
        floor_number: selectedLoc.floor_number,
        rack_number: selectedLoc.rack_number,
        quantity: qty,
      })

      toast.success("Unloading record created successfully")
      navigate({ to: "/app/warehouse" })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create unloading record")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <DashboardLayout activeNavItemId="room-map">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/app/warehouse">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">New Unloading</h1>
            <p className="text-muted-foreground">
              Record goods removal from storage
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Amad Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Select Amad</CardTitle>
                <CardDescription>
                  Choose the amad to unload from storage
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="amad">Amad *</Label>
                  <Select
                    value={amadId}
                    onValueChange={(value) => {
                      setAmadId(value)
                      setSelectedLocation(null)
                    }}
                    disabled={amadsLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select amad" />
                    </SelectTrigger>
                    <SelectContent>
                      {amads.map((amad) => (
                        <SelectItem key={amad.id} value={amad.id}>
                          {amad.amad_no} - {amad.party_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedAmad && (
                  <div className="rounded-lg border p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Party:</span>
                      <span className="font-medium">{selectedAmad.party_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Commodity:</span>
                      <span className="font-medium">{selectedAmad.commodity_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Remaining:</span>
                      <span className="font-medium">{selectedAmad.remaining_packets} bags</span>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Location Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Select Location</CardTitle>
                <CardDescription>
                  Choose where to unload from (FIFO recommended)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!amadId ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Select an amad first
                  </div>
                ) : locationsLoading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Loading locations...
                  </div>
                ) : locations.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No stored locations found for this amad
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Room</TableHead>
                        <TableHead>Floor</TableHead>
                        <TableHead>Rack</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Loaded</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {locations.map((loc) => {
                        const key = `${loc.room_id}-${loc.floor_number}-${loc.rack_number}`
                        return (
                          <TableRow
                            key={key}
                            className={selectedLocation === key ? "bg-muted" : ""}
                          >
                            <TableCell>{loc.room_number}</TableCell>
                            <TableCell>{loc.floor_number}</TableCell>
                            <TableCell>{loc.rack_number}</TableCell>
                            <TableCell className="font-mono">{loc.quantity}</TableCell>
                            <TableCell>
                              {new Date(loc.loaded_date).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <Button
                                type="button"
                                size="sm"
                                variant={selectedLocation === key ? "default" : "outline"}
                                onClick={() => setSelectedLocation(key)}
                              >
                                {selectedLocation === key ? "Selected" : "Select"}
                              </Button>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                )}

                {selectedLoc && (
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity to Unload (max: {selectedLoc.quantity}) *</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      max={selectedLoc.quantity}
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      placeholder="Number of bags"
                      required
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4 mt-6">
            <Button type="button" variant="outline" asChild>
              <Link to="/app/warehouse">Cancel</Link>
            </Button>
            <Button type="submit" disabled={submitting || !selectedLoc}>
              {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create Unloading
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
