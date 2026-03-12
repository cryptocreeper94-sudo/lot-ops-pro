/**
 * Nashville-specific lane formatting
 * Sale Day Lanes (1-55) get a "6" prefix for van drivers to match handheld system
 * Inventory drivers see plain numbers
 */

export type DriverRole = 'driver' | 'inventory' | 'supervisor';

/**
 * Format a lane number based on driver role and lane type
 * @param location - Raw location string (e.g., "Lane 43", "Lot 514", "43")
 * @param driverRole - The role of the current user
 * @returns Formatted location string
 */
export function formatLaneForDriver(location: string | null | undefined, driverRole: DriverRole): string {
  if (!location) return '';
  
  // Inventory drivers always see plain numbers
  if (driverRole === 'inventory') {
    return location;
  }

  // Van drivers: Add "6" prefix to sale day lanes (1-55)
  // Match patterns like "Lane 43", "lane 12", "L43", or just "43"
  const laneMatch = location.match(/(?:lane|l)\s*(\d+)/i) || location.match(/^(\d+)$/);
  
  if (laneMatch) {
    const laneNumber = parseInt(laneMatch[1]);
    
    // Sale Day Lanes: 1-55 → 601-655
    if (laneNumber >= 1 && laneNumber <= 55) {
      return `Lane ${600 + laneNumber}`;
    }
  }
  
  // Return as-is for inventory lots, special locations, etc.
  return location;
}

/**
 * Parse a sale lane input from van driver (handles both 601 and 1 formats)
 * @param input - User input (e.g., "601", "Lane 601", "1", "Lane 1")
 * @returns Normalized lane number
 */
export function parseSaleLaneInput(input: string): string {
  const match = input.match(/(?:lane|l)?\s*(\d+)/i);
  if (!match) return input;
  
  const num = parseInt(match[1]);
  
  // If they entered 601-655, convert to 1-55 for storage
  if (num >= 601 && num <= 655) {
    return `Lane ${num - 600}`;
  }
  
  // If they entered 1-55, store as-is
  if (num >= 1 && num <= 55) {
    return `Lane ${num}`;
  }
  
  // Inventory lot or other number
  return input;
}

/**
 * Check if a location is a sale day lane (1-55)
 */
export function isSaleLane(location: string | null | undefined): boolean {
  if (!location) return false;
  
  const laneMatch = location.match(/(?:lane|l)\s*(\d+)/i);
  if (!laneMatch) return false;
  
  const laneNumber = parseInt(laneMatch[1]);
  return laneNumber >= 1 && laneNumber <= 55;
}
