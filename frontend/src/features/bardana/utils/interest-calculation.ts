/**
 * Calculate simple interest on bardana advance.
 * @param amount - Principal amount
 * @param monthlyRate - Monthly interest rate (%)
 * @param fromDate - Start date
 * @param toDate - End date (defaults to today)
 */
export function calculateInterest(
  amount: number,
  monthlyRate: number,
  fromDate: string,
  toDate?: string
): number {
  if (monthlyRate <= 0 || amount <= 0) return 0

  const from = new Date(fromDate)
  const to = toDate ? new Date(toDate) : new Date()
  const days = Math.max(0, Math.floor((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)))

  if (days <= 0) return 0

  // Simple interest: P * R * T / (100 * 30)
  const dailyRate = monthlyRate / 30
  const interest = (amount * dailyRate * days) / 100

  return Math.round(interest * 100) / 100
}
