import * as React from "react"
import { RefreshCw, Plus } from "lucide-react"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  useLatestTemperatures,
  useTemperatureAlerts,
  useTemperatureReadings,
  useRoomTemperatureHistory,
} from "@/features/warehouse"
import { useRooms } from "@/features/inventory"
import {
  TemperatureCard,
  AlertCard,
  AlertSummaryCard,
  TemperatureLogTable,
  TempTrendChart,
} from "@/features/warehouse/components/temperature"
import {
  getDailyStats,
  getTemperatureTrend,
  type TemperatureTrend,
} from "@/features/warehouse/utils/temperature-utils"

export function TemperatureDashboardPage() {
  const [selectedRoomId, setSelectedRoomId] = React.useState<string | null>(null)

  const { rooms } = useRooms(true)

  const {
    temperatures,
    loading: temperaturesLoading,
    refetch: refetchTemperatures,
  } = useLatestTemperatures()

  const {
    alerts,
    loading: alertsLoading,
    refetch: refetchAlerts,
  } = useTemperatureAlerts()

  const { readings, loading: readingsLoading } = useTemperatureReadings(
    selectedRoomId ? { room_id: selectedRoomId } : undefined
  )

  const { readings: historyReadings, loading: historyLoading } =
    useRoomTemperatureHistory(selectedRoomId, 7)

  // Calculate daily stats for trend chart
  const dailyStats = React.useMemo(() => {
    return getDailyStats(historyReadings)
  }, [historyReadings])

  // Calculate trends for each room
  const roomTrends = React.useMemo(() => {
    const trends: Record<string, TemperatureTrend> = {}
    // For simplicity, we'll show "unknown" for all rooms unless selected
    // In a real app, you might fetch history for all rooms
    if (selectedRoomId && historyReadings.length > 0) {
      trends[selectedRoomId] = getTemperatureTrend(historyReadings)
    }
    return trends
  }, [selectedRoomId, historyReadings])

  const handleRefresh = () => {
    refetchTemperatures()
    refetchAlerts()
  }

  const handleRoomFilter = (value: string) => {
    setSelectedRoomId(value === "all" ? null : value)
  }

  return (
    <DashboardLayout activeNavItemId="temperature" breadcrumbs={[{ label: "Chambers", to: "/app/warehouse" }, { label: "Temperature" }]}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Temperature Dashboard</h1>
            <p className="text-muted-foreground">
              Monitor temperature across all chambers
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleRefresh}>
              <RefreshCw className="size-4 mr-2" />
              Refresh
            </Button>
            <Button>
              <Plus className="size-4 mr-2" />
              Add Reading
            </Button>
          </div>
        </div>

        {/* Alert Summary */}
        <AlertSummaryCard alerts={alerts} loading={alertsLoading} />

        {/* Tabs */}
        <Tabs defaultValue="all">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="all">All Rooms</TabsTrigger>
              <TabsTrigger value="alerts">
                Alerts ({alerts.length})
              </TabsTrigger>
              <TabsTrigger value="trends">Trends</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            {/* Room Filter */}
            <Select
              value={selectedRoomId || "all"}
              onValueChange={handleRoomFilter}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by room" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Rooms</SelectItem>
                {rooms.map((room) => (
                  <SelectItem key={room.id} value={room.id}>
                    Room {room.number}
                    {room.name && ` (${room.name})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* All Rooms Tab */}
          <TabsContent value="all" className="mt-4">
            {temperaturesLoading ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="h-32" />
                  </Card>
                ))}
              </div>
            ) : temperatures.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No temperature data available
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {temperatures
                  .filter(
                    (temp) => !selectedRoomId || temp.room_id === selectedRoomId
                  )
                  .map((temp) => (
                    <TemperatureCard
                      key={temp.room_id}
                      temperature={temp}
                      trend={roomTrends[temp.room_id]}
                    />
                  ))}
              </div>
            )}
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts" className="mt-4">
            {alertsLoading ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="h-24" />
                  </Card>
                ))}
              </div>
            ) : alerts.length === 0 ? (
              <Card className="border-status-success bg-status-success-muted">
                <CardContent className="py-8 text-center">
                  <p className="text-status-success-foreground font-medium">
                    All rooms are within normal temperature range
                  </p>
                  <p className="text-sm text-status-success-foreground mt-1">
                    No active alerts at this time
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {alerts
                  .filter(
                    (alert) =>
                      !selectedRoomId || alert.room_id === selectedRoomId
                  )
                  .map((alert) => (
                    <AlertCard key={alert.room_id} alert={alert} />
                  ))}
              </div>
            )}
          </TabsContent>

          {/* Trends Tab */}
          <TabsContent value="trends" className="mt-4">
            {selectedRoomId ? (
              <TempTrendChart
                data={dailyStats}
                loading={historyLoading}
                title={`Temperature Trends - Room ${
                  rooms.find((r) => r.id === selectedRoomId)?.number || ""
                }`}
              />
            ) : (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  Select a room from the filter above to view temperature trends
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Temperature History</CardTitle>
              </CardHeader>
              <CardContent>
                <TemperatureLogTable
                  readings={readings}
                  loading={readingsLoading}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
