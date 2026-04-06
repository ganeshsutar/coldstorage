import { cn } from "@/lib/utils"
import { Package, Clock, User, Upload, Download, ArrowRightLeft } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import type { RackContents } from "../../types/room-map"

interface RackDetailSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  contents: RackContents | null
  loading?: boolean
  onLoadClick?: () => void
  onUnloadClick?: () => void
  onShiftClick?: () => void
}

const typeLabels: Record<string, { label: string; color: string }> = {
  load: { label: "Loaded", color: "bg-status-success" },
  unload: { label: "Unloaded", color: "bg-status-warning" },
  shift_in: { label: "Shifted In", color: "bg-status-info" },
  shift_out: { label: "Shifted Out", color: "bg-purple-500" },
}

export function RackDetailSheet({
  open,
  onOpenChange,
  contents,
  loading,
  onLoadClick,
  onUnloadClick,
  onShiftClick,
}: RackDetailSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>
            {contents
              ? `Rack ${contents.rack.rack_number} (Floor ${contents.rack.floor_number})`
              : "Rack Details"}
          </SheetTitle>
          <SheetDescription>
            {contents
              ? `Current quantity: ${contents.rack.current_quantity} bags`
              : "Loading..."}
          </SheetDescription>
        </SheetHeader>

        {/* Quick Actions */}
        {contents && !loading && (
          <div className="mt-4 flex gap-2">
            {onLoadClick && (
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={onLoadClick}
              >
                <Upload className="size-4 mr-2" />
                Load
              </Button>
            )}
            {onUnloadClick && contents.items.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={onUnloadClick}
              >
                <Download className="size-4 mr-2" />
                Unload
              </Button>
            )}
            {onShiftClick && contents.items.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={onShiftClick}
              >
                <ArrowRightLeft className="size-4 mr-2" />
                Shift
              </Button>
            )}
          </div>
        )}

        {loading ? (
          <div className="mt-6 space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : contents ? (
          <ScrollArea className="mt-6 h-[calc(100vh-180px)]">
            {/* Current Items */}
            <div className="space-y-4">
              <h4 className="font-semibold flex items-center gap-2">
                <Package className="size-4" />
                Current Contents ({contents.items.length} items)
              </h4>
              {contents.items.length === 0 ? (
                <p className="text-sm text-muted-foreground">This rack is empty</p>
              ) : (
                <div className="space-y-3">
                  {contents.items.map((item, index) => (
                    <div
                      key={index}
                      className="p-3 rounded-lg border bg-card"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{item.amad_no}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.party_name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {item.commodity_name}
                          </p>
                        </div>
                        <Badge variant="secondary">
                          {item.quantity} bags
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Loaded: {new Date(item.loaded_date).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Separator className="my-6" />

            {/* History */}
            <div className="space-y-4">
              <h4 className="font-semibold flex items-center gap-2">
                <Clock className="size-4" />
                Recent History
              </h4>
              {contents.history.length === 0 ? (
                <p className="text-sm text-muted-foreground">No history available</p>
              ) : (
                <div className="space-y-2">
                  {contents.history.map((entry, index) => {
                    const typeInfo = typeLabels[entry.type] ?? {
                      label: entry.type,
                      color: "bg-gray-500",
                    }
                    return (
                      <div
                        key={index}
                        className="flex items-start gap-3 text-sm"
                      >
                        <div
                          className={cn("size-2 rounded-full mt-1.5", typeInfo.color)}
                        />
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <span className="font-medium">{typeInfo.label}</span>
                            <span className="text-muted-foreground">
                              {entry.quantity} bags
                            </span>
                          </div>
                          <p className="text-muted-foreground">
                            {entry.amad_no}
                          </p>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <User className="size-3" />
                            {entry.user} - {new Date(entry.date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </ScrollArea>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}
