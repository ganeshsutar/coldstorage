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
import { useRooms } from "@/features/inventory"
import { useAmads } from "@/features/inventory/hooks/use-amad"
import { useRoomFloorsByRoom, loadingService } from "@/features/warehouse"
import { toast } from "sonner"

export function NewLoadingPage() {
  const navigate = useNavigate()
  const [submitting, setSubmitting] = React.useState(false)

  // Form state
  const [amadId, setAmadId] = React.useState("")
  const [date, setDate] = React.useState(new Date().toISOString().split("T")[0])
  const [roomId, setRoomId] = React.useState("")
  const [floorNumber, setFloorNumber] = React.useState("")
  const [rackNumber, setRackNumber] = React.useState("")
  const [quantity, setQuantity] = React.useState("")

  // Fetch data
  const { rooms, loading: roomsLoading } = useRooms(true)
  const { amads, loading: amadsLoading } = useAmads({ is_fully_dispatched: false })
  const { floors } = useRoomFloorsByRoom(roomId)

  const selectedAmad = amads.find((a) => a.id === amadId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!amadId || !date || !roomId || !floorNumber || !rackNumber || !quantity) {
      toast.error("Please fill in all required fields")
      return
    }

    setSubmitting(true)
    try {
      await loadingService.createLoading({
        amad: amadId,
        date,
        room: roomId,
        floor_number: parseInt(floorNumber),
        rack_number: parseInt(rackNumber),
        quantity: parseInt(quantity),
      })

      toast.success("Loading record created successfully")
      navigate({ to: "/app/warehouse" })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create loading record")
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
            <h1 className="text-2xl font-bold">New Loading</h1>
            <p className="text-muted-foreground">
              Record goods placement into storage
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
                  Choose the amad to load into storage
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="amad">Amad *</Label>
                  <Select
                    value={amadId}
                    onValueChange={setAmadId}
                    disabled={amadsLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select amad" />
                    </SelectTrigger>
                    <SelectContent>
                      {amads.map((amad) => (
                        <SelectItem key={amad.id} value={amad.id}>
                          {amad.amad_no} - {amad.party_name} ({amad.remaining_packets} bags)
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

            {/* Storage Location */}
            <Card>
              <CardHeader>
                <CardTitle>Storage Location</CardTitle>
                <CardDescription>
                  Specify where to place the goods
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="room">Room *</Label>
                  <Select
                    value={roomId}
                    onValueChange={(value) => {
                      setRoomId(value)
                      setFloorNumber("")
                    }}
                    disabled={roomsLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select room" />
                    </SelectTrigger>
                    <SelectContent>
                      {rooms.map((room) => (
                        <SelectItem key={room.id} value={room.id}>
                          Room {room.number}
                          {room.name && ` - ${room.name}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="floor">Floor *</Label>
                  <Select
                    value={floorNumber}
                    onValueChange={setFloorNumber}
                    disabled={!roomId || floors.length === 0}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select floor" />
                    </SelectTrigger>
                    <SelectContent>
                      {floors.map((floor) => (
                        <SelectItem
                          key={floor.floor_number}
                          value={floor.floor_number.toString()}
                        >
                          Floor {floor.floor_number} (Racks {floor.from_rack}-{floor.to_rack})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rack">Rack Number *</Label>
                  <Input
                    id="rack"
                    type="number"
                    min="1"
                    value={rackNumber}
                    onChange={(e) => setRackNumber(e.target.value)}
                    placeholder="Enter rack number"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity (bags) *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="Number of bags"
                    required
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4 mt-6">
            <Button type="button" variant="outline" asChild>
              <Link to="/app/warehouse">Cancel</Link>
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create Loading
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
