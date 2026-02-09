import { cn } from "@/lib/utils"
import { formatCurrency } from "../../utils/format-currency"
import { amountToWords } from "../../utils/amount-to-words"

interface AmountInWordsProps {
  amount: number
  className?: string
}

export function AmountInWords({ amount, className }: AmountInWordsProps) {
  if (amount <= 0) return null

  return (
    <div
      data-slot="amount-in-words"
      data-testid="amount-in-words"
      className={cn(
        "rounded-lg border bg-muted/30 p-4",
        className
      )}
    >
      <p className="text-sm text-muted-foreground">Amount</p>
      <p data-testid="amount-in-words-value" className="text-lg font-medium font-mono">
        {formatCurrency(amount)}
      </p>
      <p data-testid="amount-in-words-text" className="text-sm text-muted-foreground mt-1">
        ({amountToWords(amount)})
      </p>
    </div>
  )
}
