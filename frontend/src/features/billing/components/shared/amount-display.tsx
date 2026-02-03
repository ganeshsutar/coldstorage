import * as React from "react"
import { cn } from "@/lib/utils"
import {
  formatIndianRupees,
  formatCompactRupees,
  convertAmountToWords,
} from "../../utils/amount-to-words"

interface AmountDisplayProps {
  amount: number
  showWords?: boolean
  showCompact?: boolean
  size?: "sm" | "md" | "lg"
  className?: string
  variant?: "default" | "positive" | "negative"
}

const sizeClasses = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-2xl font-bold",
}

export function AmountDisplay({
  amount,
  showWords = false,
  showCompact = false,
  size = "md",
  className,
  variant = "default",
}: AmountDisplayProps) {
  const variantClasses = {
    default: "",
    positive: "text-green-600",
    negative: "text-destructive",
  }

  return (
    <div className={cn("space-y-0.5", className)}>
      <span
        className={cn(
          "font-mono",
          sizeClasses[size],
          variantClasses[variant]
        )}
      >
        {showCompact ? formatCompactRupees(amount) : formatIndianRupees(amount)}
      </span>
      {showWords && (
        <p className="text-xs text-muted-foreground">
          {convertAmountToWords(amount)}
        </p>
      )}
    </div>
  )
}

interface AmountSummaryRowProps {
  label: string
  amount: number
  isTotal?: boolean
  isSubtotal?: boolean
  className?: string
}

export function AmountSummaryRow({
  label,
  amount,
  isTotal = false,
  isSubtotal = false,
  className,
}: AmountSummaryRowProps) {
  return (
    <div
      className={cn(
        "flex justify-between items-center py-1",
        isTotal && "border-t-2 pt-2 font-bold",
        isSubtotal && "border-t pt-1 font-medium",
        className
      )}
    >
      <span className={cn(isTotal || isSubtotal ? "" : "text-muted-foreground")}>
        {label}
      </span>
      <span className="font-mono">{formatIndianRupees(amount)}</span>
    </div>
  )
}

interface BillSummaryCardProps {
  title?: string
  items: Array<{
    label: string
    amount: number
    isTotal?: boolean
    isSubtotal?: boolean
  }>
  className?: string
}

export function BillSummaryCard({
  title = "Bill Summary",
  items,
  className,
}: BillSummaryCardProps) {
  return (
    <div className={cn("space-y-1", className)}>
      {title && (
        <h4 className="font-medium text-sm mb-2">{title}</h4>
      )}
      {items.map((item, index) => (
        <AmountSummaryRow
          key={index}
          label={item.label}
          amount={item.amount}
          isTotal={item.isTotal}
          isSubtotal={item.isSubtotal}
        />
      ))}
    </div>
  )
}
