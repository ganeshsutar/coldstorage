import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type { StockTypeInfo } from "../types"

interface StockTypeCardProps {
  type: StockTypeInfo
}

export function StockTypeCard({ type }: StockTypeCardProps) {
  const stockPercentage =
    type.opening_stock > 0
      ? Math.max(0, Math.min(100, (type.current_stock / type.opening_stock) * 100))
      : 0

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          <span>{type.name}</span>
          <span className="text-xs text-muted-foreground">{type.code}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between text-2xl font-bold">
          <span>{type.current_stock}</span>
          <span className="text-sm font-normal text-muted-foreground">
            / {type.opening_stock}
          </span>
        </div>
        <Progress value={stockPercentage} className="h-2" />
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div>
            <p className="text-muted-foreground">Issued</p>
            <p className="font-medium">{type.total_issued}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Returned</p>
            <p className="font-medium">{type.total_returned}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Outstanding</p>
            <p className="font-medium text-orange-600">{type.outstanding}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
