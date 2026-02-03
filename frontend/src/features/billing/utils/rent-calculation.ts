/**
 * Calculate storage days between two dates.
 */
export function calculateStorageDays(arrivalDate: Date, dispatchDate: Date): number {
  const msPerDay = 24 * 60 * 60 * 1000
  const arrival = new Date(arrivalDate)
  const dispatch = new Date(dispatchDate)

  arrival.setHours(0, 0, 0, 0)
  dispatch.setHours(0, 0, 0, 0)

  return Math.floor((dispatch.getTime() - arrival.getTime()) / msPerDay)
}

/**
 * Calculate billable days after applying grace period.
 */
export function calculateBillableDays(storageDays: number, graceDays: number): number {
  return Math.max(0, storageDays - graceDays)
}

/**
 * Calculate rent based on weight.
 * @param weightQtl Weight in quintals
 * @param days Number of billable days
 * @param ratePerQtlPerMonth Rate per quintal per month
 * @returns Rent amount
 */
export function calculateRentByWeight(
  weightQtl: number,
  days: number,
  ratePerQtlPerMonth: number
): number {
  // Convert monthly rate to daily
  const dailyRate = ratePerQtlPerMonth / 30
  return roundToTwo(weightQtl * dailyRate * days)
}

/**
 * Calculate rent based on number of bags.
 * @param bags Number of bags
 * @param days Number of billable days
 * @param ratePerBagPerMonth Rate per bag per month
 * @returns Rent amount
 */
export function calculateRentByBags(
  bags: number,
  days: number,
  ratePerBagPerMonth: number
): number {
  // Convert monthly rate to daily
  const dailyRate = ratePerBagPerMonth / 30
  return roundToTwo(bags * dailyRate * days)
}

export interface AmadRentInput {
  arrivalDate: Date
  dispatchDate: Date
  weightKg: number
  totalPackets: number
  graceDays: number
  ratePerQtl: number
  ratePerBag?: number
  basis?: "weight" | "bags"
}

export interface AmadRentResult {
  storageDays: number
  billableDays: number
  weightQtl: number
  rentAmount: number
}

/**
 * Calculate rent for an Amad.
 */
export function calculateAmadRent(input: AmadRentInput): AmadRentResult {
  const {
    arrivalDate,
    dispatchDate,
    weightKg,
    totalPackets,
    graceDays,
    ratePerQtl,
    ratePerBag = 0,
    basis = "weight",
  } = input

  const storageDays = calculateStorageDays(arrivalDate, dispatchDate)
  const billableDays = calculateBillableDays(storageDays, graceDays)
  const weightQtl = weightKg / 100

  let rentAmount: number
  if (basis === "bags" && ratePerBag > 0) {
    rentAmount = calculateRentByBags(totalPackets, billableDays, ratePerBag)
  } else {
    rentAmount = calculateRentByWeight(weightQtl, billableDays, ratePerQtl)
  }

  return {
    storageDays,
    billableDays,
    weightQtl,
    rentAmount,
  }
}

/**
 * Round bill amount according to Indian rounding rules.
 * Amounts ending in 0.50 or more round up, otherwise down.
 */
export function roundBillAmount(amount: number): number {
  return Math.round(amount)
}

/**
 * Round to 2 decimal places.
 */
function roundToTwo(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100
}

/**
 * Convert weight from kg to quintals.
 */
export function kgToQuintals(kg: number): number {
  return roundToTwo(kg / 100)
}

/**
 * Convert weight from quintals to kg.
 */
export function quintalsToKg(qtl: number): number {
  return roundToTwo(qtl * 100)
}
