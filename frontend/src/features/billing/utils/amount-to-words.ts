const ones = [
  "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
  "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
  "Seventeen", "Eighteen", "Nineteen"
]

const tens = [
  "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"
]

function twoDigit(n: number): string {
  if (n < 20) {
    return ones[n]
  }
  return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "")
}

function threeDigit(n: number): string {
  if (n < 100) {
    return twoDigit(n)
  }
  return ones[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " and " + twoDigit(n % 100) : "")
}

/**
 * Convert amount to words in Indian format.
 * @param amount Amount in rupees
 * @returns Amount in words (e.g., "Rupees One Lakh Twenty Three Thousand Four Hundred Fifty Six Only")
 */
export function convertAmountToWords(amount: number): string {
  const intAmount = Math.floor(Math.abs(amount))

  if (intAmount === 0) {
    return "Rupees Zero Only"
  }

  const crore = Math.floor(intAmount / 10000000)
  const afterCrore = intAmount % 10000000
  const lakh = Math.floor(afterCrore / 100000)
  const afterLakh = afterCrore % 100000
  const thousand = Math.floor(afterLakh / 1000)
  const hundred = afterLakh % 1000

  const parts: string[] = []

  if (crore) {
    parts.push(threeDigit(crore) + " Crore")
  }
  if (lakh) {
    parts.push(twoDigit(lakh) + " Lakh")
  }
  if (thousand) {
    parts.push(twoDigit(thousand) + " Thousand")
  }
  if (hundred) {
    parts.push(threeDigit(hundred))
  }

  const prefix = amount < 0 ? "Minus " : ""
  return prefix + "Rupees " + parts.join(" ") + " Only"
}

/**
 * Format number in Indian numbering system.
 * @param num Number to format
 * @returns Formatted string (e.g., "1,23,456")
 */
export function formatIndianNumber(num: number): string {
  const numStr = Math.abs(num).toFixed(2)
  const [intPart, decPart] = numStr.split(".")

  // Format integer part
  let lastThree = intPart.slice(-3)
  const otherDigits = intPart.slice(0, -3)

  if (otherDigits !== "") {
    lastThree = "," + lastThree
  }

  // Add commas every 2 digits for remaining
  const formatted = otherDigits.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree

  const prefix = num < 0 ? "-" : ""
  return prefix + formatted + (decPart ? "." + decPart : "")
}

/**
 * Format amount as Indian Rupees.
 * @param amount Amount to format
 * @returns Formatted string (e.g., "₹1,23,456.00")
 */
export function formatIndianRupees(amount: number): string {
  return "₹" + formatIndianNumber(amount)
}

/**
 * Format amount with compact notation for large numbers.
 * @param amount Amount to format
 * @returns Formatted string (e.g., "₹1.23 Cr" or "₹45.6 L")
 */
export function formatCompactRupees(amount: number): string {
  const absAmount = Math.abs(amount)
  const prefix = amount < 0 ? "-" : ""

  if (absAmount >= 10000000) {
    return prefix + "₹" + (absAmount / 10000000).toFixed(2) + " Cr"
  }
  if (absAmount >= 100000) {
    return prefix + "₹" + (absAmount / 100000).toFixed(2) + " L"
  }
  if (absAmount >= 1000) {
    return prefix + "₹" + (absAmount / 1000).toFixed(2) + " K"
  }

  return formatIndianRupees(amount)
}
