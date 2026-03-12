/**
 * Serpentine Lane Routing Logic
 * Calculates optimal spot positioning based on lane orientation
 */

interface LaneConfig {
  laneNumber: number;
  totalSpots: number;
  reverseOrientation: boolean; // If true, lane starts on opposite side
}

/**
 * Calculate which side of the lane a spot is on (for serpentine pattern)
 * Standard: Odd spots on left, even on right
 * Reversed: Odd spots on right, even on left
 */
export function getSpotSide(spotNumber: number, reverseOrientation: boolean): 'left' | 'right' {
  const isOdd = spotNumber % 2 === 1;
  
  if (reverseOrientation) {
    return isOdd ? 'right' : 'left';
  } else {
    return isOdd ? 'left' : 'right';
  }
}

/**
 * Get next spot in serpentine order
 * Used for guidance when drivers are placing vehicles
 */
export function getNextSpot(currentSpot: number, totalSpots: number, reverseOrientation: boolean): number | null {
  if (currentSpot >= totalSpots) return null;
  return currentSpot + 1;
}

/**
 * Calculate approximate position along lane (0-1 scale)
 * 0 = front of lane, 1 = back of lane
 */
export function getSpotPosition(spotNumber: number, totalSpots: number): number {
  // Serpentine: spots zigzag, so position is based on pair
  const pairNumber = Math.ceil(spotNumber / 2);
  const totalPairs = Math.ceil(totalSpots / 2);
  
  return pairNumber / totalPairs;
}

/**
 * Get directional guidance for drivers
 * Returns simple instructions based on spot location
 */
export function getSpotGuidance(
  targetSpot: number,
  currentSpot: number | null,
  laneConfig: LaneConfig
): string {
  const side = getSpotSide(targetSpot, laneConfig.reverseOrientation);
  const position = getSpotPosition(targetSpot, laneConfig.totalSpots);
  
  // Position descriptions
  let positionDesc = '';
  if (position < 0.25) positionDesc = 'front';
  else if (position < 0.5) positionDesc = 'early middle';
  else if (position < 0.75) positionDesc = 'late middle';
  else positionDesc = 'back';
  
  // If we know current spot, give relative direction
  if (currentSpot !== null && currentSpot !== targetSpot) {
    const ahead = targetSpot > currentSpot;
    return `${side.toUpperCase()} side, ${positionDesc} (${ahead ? 'ahead' : 'behind'} spot ${currentSpot})`;
  }
  
  return `${side.toUpperCase()} side, ${positionDesc} of lane`;
}

/**
 * Validate spot number is within lane bounds
 */
export function isValidSpot(spotNumber: number, totalSpots: number): boolean {
  return spotNumber >= 1 && spotNumber <= totalSpots;
}

/**
 * Format spot number for display (with leading zeros if needed)
 */
export function formatSpotNumber(spotNumber: number, totalSpots: number): string {
  // If lane has 100+ spots, use 3 digits (e.g., "007")
  // Otherwise use 2 digits (e.g., "07")
  const digits = totalSpots >= 100 ? 3 : 2;
  return spotNumber.toString().padStart(digits, '0');
}

/**
 * Get orientation label for UI display
 */
export function getOrientationLabel(reverseOrientation: boolean): string {
  return reverseOrientation ? 'Reversed (starts right)' : 'Standard (starts left)';
}
