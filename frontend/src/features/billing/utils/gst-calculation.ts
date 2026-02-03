import type { GstType } from "../types"

export interface GstCalculationInput {
  taxableAmount: number
  cgstRate: number
  sgstRate: number
  igstRate: number
  gstType: GstType
  tdsRate?: number
}

export interface GstCalculationResult {
  taxableAmount: number
  cgstAmount: number
  sgstAmount: number
  igstAmount: number
  totalGst: number
  tdsAmount: number
  totalAmount: number
  roundOff: number
  netAmount: number
  balanceAmount: number
}

/**
 * Calculate GST amounts based on taxable amount and rates.
 */
export function calculateGst(input: GstCalculationInput): GstCalculationResult {
  const {
    taxableAmount,
    cgstRate,
    sgstRate,
    igstRate,
    gstType,
    tdsRate = 0,
  } = input

  let cgstAmount = 0
  let sgstAmount = 0
  let igstAmount = 0

  if (gstType === "INTER") {
    igstAmount = roundToTwo(taxableAmount * igstRate / 100)
  } else {
    cgstAmount = roundToTwo(taxableAmount * cgstRate / 100)
    sgstAmount = roundToTwo(taxableAmount * sgstRate / 100)
  }

  const totalGst = cgstAmount + sgstAmount + igstAmount
  const tdsAmount = roundToTwo(taxableAmount * tdsRate / 100)
  const totalAmount = taxableAmount + totalGst

  // Round off to nearest rupee
  const roundedAmount = Math.round(totalAmount)
  const roundOff = roundToTwo(roundedAmount - totalAmount)
  const netAmount = roundedAmount

  // Balance after TDS
  const balanceAmount = netAmount - tdsAmount

  return {
    taxableAmount,
    cgstAmount,
    sgstAmount,
    igstAmount,
    totalGst,
    tdsAmount,
    totalAmount,
    roundOff,
    netAmount,
    balanceAmount,
  }
}

/**
 * Determine GST type based on party state and organization state.
 */
export function determineGstType(
  partyState: string | null | undefined,
  orgState: string
): GstType {
  if (!partyState) return "INTRA"

  const partyStateLower = partyState.toLowerCase().trim()
  const orgStateLower = orgState.toLowerCase().trim()

  return partyStateLower === orgStateLower ? "INTRA" : "INTER"
}

/**
 * Validate GSTIN format.
 */
export function validateGstin(gstin: string): boolean {
  if (!gstin) return true // Empty is valid (optional field)

  // GSTIN format: 2 digits state code + 10 char PAN + 1 digit entity code + 1 char Z + 1 check digit
  const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/
  return gstinRegex.test(gstin.toUpperCase())
}

/**
 * Extract state code from GSTIN.
 */
export function getStateCodeFromGstin(gstin: string): string | null {
  if (!gstin || gstin.length < 2) return null
  return gstin.substring(0, 2)
}

/**
 * Round to 2 decimal places.
 */
function roundToTwo(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100
}

/**
 * Calculate total charges from individual components.
 */
export function calculateTotalCharges(charges: {
  rentAmount?: number
  loadingCharges?: number
  unloadingCharges?: number
  dalaCharges?: number
  kataiCharges?: number
  insuranceAmount?: number
  reloadCharges?: number
  dumpCharges?: number
  otherCharges?: number
  discountAmount?: number
}): number {
  return (
    (charges.rentAmount || 0) +
    (charges.loadingCharges || 0) +
    (charges.unloadingCharges || 0) +
    (charges.dalaCharges || 0) +
    (charges.kataiCharges || 0) +
    (charges.insuranceAmount || 0) +
    (charges.reloadCharges || 0) +
    (charges.dumpCharges || 0) +
    (charges.otherCharges || 0) -
    (charges.discountAmount || 0)
  )
}
