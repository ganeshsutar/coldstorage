import * as React from "react"
import { Plus, RefreshCw } from "lucide-react"
import { Link } from "@tanstack/react-router"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { useRooms } from "@/features/inventory"
import {
  useRoomMap,
  useRackContents,
  useLoadings,
  useUnloadings,
} from "@/features/warehouse"
import {
  RoomSelector,
  FloorSelector,
  RackGrid,
  RackDetailSheet,
  KpiCards,
  RackLegend,
} from "@/features/warehouse/components/room-map"
import { LoadingListTable } from "@/features/warehouse/components/loading"
import { UnloadingListTable } from "@/features/warehouse/components/unloading"

export function WarehouseIndexPage() {
  const [selectedRoomId, setSelectedRoomId] = React.useState<string | null>(null)
  const [selectedFloor, setSelectedFloor] = React.useState<number | null>(null)
  const [selectedRack, setSelectedRack] = React.useState<{
    floor: number
    rack: number
  } | null>(null)
  const [sheetOpen, setSheetOpen] = React.useState(false)

  // Fetch rooms
  const { rooms, loading: roomsLoading } = useRooms(true)

  // Auto-select first room
  React.useEffect(() => {
    if (rooms.length > 0 && !selectedRoomId) {
      setSelectedRoomId(rooms[0].id)
    }
  }, [rooms, selectedRoomId])

  // Fetch room map
  const { map, loading: mapLoading, refetch: refetchMap } = useRoomMap(selectedRoomId)

  // Auto-select first floor when map loads
  React.useEffect(() => {
    if (map && map.floors.length > 0 && !selectedFloor) {
      setSelectedFloor(map.floors[0].floor_number)
    }
  }, [map, selectedFloor])

  // Fetch rack contents when a rack is selected
  const {
    contents: rackContents,
    loading: rackLoading,
  } = useRackContents(
    selectedRoomId,
    selectedRack?.floor ?? null,
    selectedRack?.rack ?? null
  )

  // Fetch loading/unloading records for this room
  const { loadings, loading: loadingsLoading } = useLoadings(
    selectedRoomId ? { room_id: selectedRoomId } : undefined
  )
  const { unloadings, loading: unloadingsLoading } = useUnloadings(
    selectedRoomId ? { room_id: selectedRoomId } : undefined
  )

  const handleRoomSelect = (roomId: string) => {
    setSelectedRoomId(roomId)
    setSelectedFloor(null)
    setSelectedRack(null)
  }

  const handleFloorSelect = (floor: number) => {
    setSelectedFloor(floor)
    setSelectedRack(null)
  }

  const handleRackClick = (floor: number, rack: number) => {
    setSelectedRack({ floor, rack })
    setSheetOpen(true)
  }

  const currentFloor = map?.floors.find((f) => f.floor_number === selectedFloor)

  return (
    <DashboardLayout activeNavItemId="room-map">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Chamber Management</h1>
            <p className="text-muted-foreground">
              View and manage storage locations
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => refetchMap()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button asChild>
              <Link to="/app/warehouse/loading/new">
                <Plus className="h-4 w-4 mr-2" />
                New Loading
              </Link>
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <KpiCards
          summary={map?.summary ?? null}
          loading={mapLoading}
        />

        {/* Room Selector */}
        <RoomSelector
          rooms={rooms}
          selectedRoom={selectedRoomId}
          onSelectRoom={handleRoomSelect}
          loading={roomsLoading}
        />

        {/* Main Content */}
        <Tabs defaultValue="map">
          <TabsList>
            <TabsTrigger value="map">Room Map</TabsTrigger>
            <TabsTrigger value="loading">
              Loading ({loadings.length})
            </TabsTrigger>
            <TabsTrigger value="unloading">
              Unloading ({unloadings.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="map" className="mt-4">
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle>Rack Layout</CardTitle>
                  <FloorSelector
                    floors={map?.floors ?? []}
                    selectedFloor={selectedFloor}
                    onSelectFloor={handleFloorSelect}
                    disabled={mapLoading || !map}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <RackLegend />
                </div>
                <Separator className="my-4" />
                {mapLoading ? (
                  <div className="flex items-center justify-center h-48">
                    <div className="text-muted-foreground">Loading...</div>
                  </div>
                ) : currentFloor ? (
                  <RackGrid
                    floor={currentFloor}
                    occupancy={map?.occupancy ?? []}
                    racksPerRow={map?.racks_per_row ?? 10}
                    onRackClick={handleRackClick}
                    selectedRack={selectedRack}
                  />
                ) : (
                  <div className="flex items-center justify-center h-48">
                    <div className="text-muted-foreground">
                      Select a floor to view rack layout
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="loading" className="mt-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Loading Records</CardTitle>
                  <Button asChild size="sm">
                    <Link to="/app/warehouse/loading/new">
                      <Plus className="h-4 w-4 mr-2" />
                      New Loading
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <LoadingListTable
                  loadings={loadings}
                  loading={loadingsLoading}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="unloading" className="mt-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Unloading Records</CardTitle>
                  <Button asChild size="sm">
                    <Link to="/app/warehouse/unloading/new">
                      <Plus className="h-4 w-4 mr-2" />
                      New Unloading
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <UnloadingListTable
                  unloadings={unloadings}
                  loading={unloadingsLoading}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Rack Detail Sheet */}
        <RackDetailSheet
          open={sheetOpen}
          onOpenChange={setSheetOpen}
          contents={rackContents}
          loading={rackLoading}
        />
      </div>
    </DashboardLayout>
  )
}
