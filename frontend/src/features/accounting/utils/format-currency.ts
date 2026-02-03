/**
 * Format number as Indian currency (Rs. 1,23,456.00)
 */
export function formatCurrency(amount: number, showSymbol = true): string {
  const absAmount = Math.abs(amount)
  const formatted = formatIndianNumber(absAmount)
  const withDecimals = `${formatted}.00`

  if (showSymbol) {
    return `Rs. ${withDecimals}`
  }
  return withDecimals
}

/**
 * Format number with Indian number system (1,23,456)
 */
export function formatIndianNumber(num: number): string {
  const numStr = Math.floor(num).toString()

  if (numStr.length <= 3) {
    return numStr
  }

  // Last 3 digits
  let result = numStr.slice(-3)
  let remaining = numStr.slice(0, -3)

  // Add commas every 2 digits for remaining
  while (remaining.length > 0) {
    const chunk = remaining.slice(-2)
    remaining = remaining.slice(0, -2)
    result = chunk + "," + result
  }

  return result
}

/**
 * Format balance with Dr/Cr suffix
 */
export function formatBalance(amount: number, type: "Dr" | "Cr"): string {
  return `${type} ${formatCurrency(Math.abs(amount), false)}`
}

/**
 * Format compact currency for KPI cards (25L, 1.2Cr, etc.)
 */
export function formatCompactCurrency(amount: number): string {
  const absAmount = Math.abs(amount)

  if (absAmount >= 10000000) {
    // Crores
    return `${(absAmount / 10000000).toFixed(1)}Cr`
  }

  if (absAmount >= 100000) {
    // Lakhs
    return `${(absAmount / 100000).toFixed(1)}L`
  }

  if (absAmount >= 1000) {
    // Thousands
    return `${(absAmount / 1000).toFixed(1)}K`
  }

  return formatIndianNumber(absAmount)
}
