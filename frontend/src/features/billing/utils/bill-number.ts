/**
 * Bill and receipt number generation utilities
 */

/**
 * Bill number prefixes
 */
export const BILL_PREFIXES = {
  RENT_BILL: "KB", // Kiraya Bill
  SALE_BILL: "SB", // Sale Bill
  RECEIPT: "RV", // Receipt Voucher
  CREDIT_NOTE: "CN", // Credit Note
  DEBIT_NOTE: "DN", // Debit Note
} as const

/**
 * Get current financial year in format YYYY-YY (e.g., "2024-25")
 * Indian financial year runs from April to March
 */
export function getCurrentFinancialYear(): string {
  const now = new Date()
  const month = now.getMonth() // 0-11
  const year = now.getFullYear()

  // If month is April (3) or later, FY is current year - next year
  // If month is before April, FY is previous year - current year
  if (month >= 3) {
    return `${year}-${String(year + 1).slice(2)}`
  } else {
    return `${year - 1}-${String(year).slice(2)}`
  }
}

/**
 * Get financial year start date
 */
export function getFinancialYearStart(year?: number): Date {
  const now = new Date()
  const currentYear = year || now.getFullYear()
  const currentMonth = now.getMonth()

  // If before April, use previous year
  const fyYear = currentMonth >= 3 ? currentYear : currentYear - 1
  return new Date(fyYear, 3, 1) // April 1st
}

/**
 * Generate bill number with prefix and sequence
 * Format: PREFIX/FYYY/SEQUENCE (e.g., "KB/2024-25/0001")
 */
export function generateBillNo(
  prefix: string,
  sequence: number,
  financialYear?: string
): string {
  const fy = financialYear || getCurrentFinancialYear()
  const paddedSeq = String(sequence).padStart(4, "0")
  return `${prefix}/${fy}/${paddedSeq}`
}

/**
 * Generate receipt number with prefix and sequence
 * Format: PREFIX/FYYY/SEQUENCE (e.g., "RV/2024-25/0001")
 */
export function generateReceiptNo(
  prefix: string,
  sequence: number,
  financialYear?: string
): string {
  const fy = financialYear || getCurrentFinancialYear()
  const paddedSeq = String(sequence).padStart(4, "0")
  return `${prefix}/${fy}/${paddedSeq}`
}

/**
 * Parse bill/receipt number to extract components
 */
export function parseBillNo(billNo: string): {
  prefix: string
  financialYear: string
  sequence: number
} | null {
  const parts = billNo.split("/")
  if (parts.length !== 3) {
    return null
  }

  return {
    prefix: parts[0],
    financialYear: parts[1],
    sequence: parseInt(parts[2], 10),
  }
}

/**
 * Get next bill number from existing bills
 */
export function getNextBillNo(
  existingBills: { billNo: string }[],
  prefix: string = "KB"
): string {
  const currentFy = getCurrentFinancialYear()

  // Filter bills from current financial year
  const currentFyBills = existingBills.filter((bill) => {
    const parsed = parseBillNo(bill.billNo)
    return parsed && parsed.financialYear === currentFy
  })

  // Find max sequence number
  let maxSequence = 0
  for (const bill of currentFyBills) {
    const parsed = parseBillNo(bill.billNo)
    if (parsed && parsed.sequence > maxSequence) {
      maxSequence = parsed.sequence
    }
  }

  return generateBillNo(prefix, maxSequence + 1, currentFy)
}

/**
 * Get next receipt number from existing receipts
 */
export function getNextReceiptNo(
  existingReceipts: { receiptNo: string }[],
  prefix: string = "RV"
): string {
  const currentFy = getCurrentFinancialYear()

  // Filter receipts from current financial year
  const currentFyReceipts = existingReceipts.filter((receipt) => {
    const parsed = parseBillNo(receipt.receiptNo)
    return parsed && parsed.financialYear === currentFy
  })

  // Find max sequence number
  let maxSequence = 0
  for (const receipt of currentFyReceipts) {
    const parsed = parseBillNo(receipt.receiptNo)
    if (parsed && parsed.sequence > maxSequence) {
      maxSequence = parsed.sequence
    }
  }

  return generateReceiptNo(prefix, maxSequence + 1, currentFy)
}

/**
 * Validate bill number format
 */
export function validateBillNo(billNo: string): boolean {
  const regex = /^[A-Z]{2,4}\/\d{4}-\d{2}\/\d{4}$/
  return regex.test(billNo)
}
