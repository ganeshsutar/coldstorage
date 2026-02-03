const ones = [
  "",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
  "Eleven",
  "Twelve",
  "Thirteen",
  "Fourteen",
  "Fifteen",
  "Sixteen",
  "Seventeen",
  "Eighteen",
  "Nineteen",
]

const tens = [
  "",
  "",
  "Twenty",
  "Thirty",
  "Forty",
  "Fifty",
  "Sixty",
  "Seventy",
  "Eighty",
  "Ninety",
]

function convertLessThanThousand(num: number): string {
  if (num === 0) return ""

  if (num < 20) {
    return ones[num]
  }

  if (num < 100) {
    const ten = Math.floor(num / 10)
    const one = num % 10
    return tens[ten] + (one ? " " + ones[one] : "")
  }

  const hundred = Math.floor(num / 100)
  const remainder = num % 100
  return (
    ones[hundred] +
    " Hundred" +
    (remainder ? " " + convertLessThanThousand(remainder) : "")
  )
}

/**
 * Convert amount to words in Indian format
 * e.g., 25000 -> "Twenty Five Thousand Only"
 */
export function amountToWords(amount: number): string {
  if (amount === 0) return "Zero Only"

  const absAmount = Math.abs(Math.floor(amount))

  if (absAmount >= 1000000000000) {
    return "Amount too large"
  }

  let result = ""

  // Crores (1,00,00,000)
  const crores = Math.floor(absAmount / 10000000)
  if (crores > 0) {
    result += convertLessThanThousand(crores) + " Crore "
  }

  // Lakhs (1,00,000)
  const lakhs = Math.floor((absAmount % 10000000) / 100000)
  if (lakhs > 0) {
    result += convertLessThanThousand(lakhs) + " Lakh "
  }

  // Thousands (1,000)
  const thousands = Math.floor((absAmount % 100000) / 1000)
  if (thousands > 0) {
    result += convertLessThanThousand(thousands) + " Thousand "
  }

  // Hundreds and below
  const remainder = absAmount % 1000
  if (remainder > 0) {
    result += convertLessThanThousand(remainder)
  }

  return result.trim() + " Only"
}

/**
 * Format amount with rupees prefix and words
 * e.g., 25000 -> "Rs. 25,000 (Twenty Five Thousand Only)"
 */
export function formatAmountWithWords(
  amount: number,
  formattedAmount: string
): string {
  return `${formattedAmount} (${amountToWords(amount)})`
}
