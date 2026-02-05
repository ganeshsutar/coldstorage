import type { Room } from "@/features/inventory/types/masters"
import type { FloorConfig } from "../types/room-map"

/**
 * Auto-generate floor configurations based on chamber settings.
 * Distributes racks evenly across floors.
 */
export function generateFloorConfigs(
  totalFloors: number,
  totalRacks: number
): FloorConfig[] {
  if (totalFloors <= 0 || totalRacks <= 0) {
    return []
  }

  const racksPerFloor = Math.floor(totalRacks / totalFloors)
  const remainder = totalRacks % totalFloors

  const configs: FloorConfig[] = []
  let currentRack = 1

  for (let floor = 1; floor <= totalFloors; floor++) {
    // Distribute remainder racks to lower floors first
    const extraRack = floor <= remainder ? 1 : 0
    const floorRacks = racksPerFloor + extraRack
    const fromRack = currentRack
    const toRack = currentRack + floorRacks - 1

    configs.push({
      floor_number: floor,
      from_rack: fromRack,
      to_rack: toRack,
      rack_count: floorRacks,
    })

    currentRack = toRack + 1
  }

  return configs
}

/**
 * Get the next available room number based on existing rooms.
 * Finds the highest numeric room number and increments by 1.
 */
export function getNextRoomNumber(rooms: Room[]): string {
  if (rooms.length === 0) {
    return "1"
  }

  // Extract numeric portions and find the max
  const numbers = rooms
    .map((room) => {
      const match = room.number.match(/(\d+)/)
      return match ? parseInt(match[1], 10) : 0
    })
    .filter((n) => !isNaN(n))

  if (numbers.length === 0) {
    return "1"
  }

  const maxNumber = Math.max(...numbers)
  return String(maxNumber + 1)
}

/**
 * Validate floor configurations for overlapping rack ranges.
 * Returns an array of validation errors, empty if valid.
 */
export function validateFloorConfigs(configs: FloorConfig[]): string[] {
  const errors: string[] = []

  // Check for overlapping ranges
  for (let i = 0; i < configs.length; i++) {
    const config1 = configs[i]

    // Validate individual config
    if (config1.from_rack > config1.to_rack) {
      errors.push(
        `Floor ${config1.floor_number}: From rack cannot be greater than To rack`
      )
    }

    if (config1.from_rack < 1) {
      errors.push(`Floor ${config1.floor_number}: From rack must be at least 1`)
    }

    // Check for overlaps with other floors
    for (let j = i + 1; j < configs.length; j++) {
      const config2 = configs[j]

      const hasOverlap =
        config1.from_rack <= config2.to_rack &&
        config2.from_rack <= config1.to_rack

      if (hasOverlap) {
        errors.push(
          `Floor ${config1.floor_number} and Floor ${config2.floor_number} have overlapping rack ranges`
        )
      }
    }
  }

  return errors
}

/**
 * Calculate total racks from floor configurations.
 */
export function getTotalRacksFromConfigs(configs: FloorConfig[]): number {
  return configs.reduce((total, config) => total + config.rack_count, 0)
}
