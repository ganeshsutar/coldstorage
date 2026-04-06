import { cn } from "@/lib/utils"
import { Progress } from "@/components/ui/progress"

interface BalanceProgressProps {
  balance: number
  creditLimit: number
  className?: string
}

export function BalanceProgress({
  balance,
  creditLimit,
  className,
}: BalanceProgressProps) {
  if (creditLimit <= 0) {
    return <span className="text-sm text-muted-foreground">No limit</span>
  }

  const usage = Math.min((Math.abs(balance) / creditLimit) * 100, 100)
  const isOverLimit = Math.abs(balance) > creditLimit

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Progress
        value={usage}
        className={cn(
          "h-2 w-16",
          isOverLimit && "[&>div]:bg-status-danger"
        )}
      />
      <span
        className={cn(
          "text-sm font-mono tabular-nums",
          isOverLimit ? "text-status-danger-foreground" : "text-muted-foreground"
        )}
      >
        {Math.round(usage)}%
      </span>
    </div>
  )
}
