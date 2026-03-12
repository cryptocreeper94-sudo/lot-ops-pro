// Get current ISO week number
export function getCurrentWeekNumber(): number {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const days = Math.floor((now.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
  return Math.ceil((days + startOfYear.getDay() + 1) / 7);
}

// Parse week number from scan data (e.g., "Week 47" or "47")
export function parseWeekNumber(weekString: string | undefined): number | null {
  if (!weekString) return null;
  
  const match = weekString.match(/\d+/);
  return match ? parseInt(match[0], 10) : null;
}

// Check if scanned week matches current active week
export function isCorrectWeek(scannedWeek: string | undefined): {
  isValid: boolean;
  currentWeek: number;
  scannedWeek: number | null;
  message: string;
} {
  const currentWeek = getCurrentWeekNumber();
  const scanned = parseWeekNumber(scannedWeek);
  
  if (scanned === null) {
    return {
      isValid: true, // No week specified, allow through
      currentWeek,
      scannedWeek: null,
      message: ""
    };
  }
  
  if (scanned !== currentWeek) {
    return {
      isValid: false,
      currentWeek,
      scannedWeek: scanned,
      message: `⚠️ WRONG WEEK! Current week is ${currentWeek}, scanned week is ${scanned}. Check destination!`
    };
  }
  
  return {
    isValid: true,
    currentWeek,
    scannedWeek: scanned,
    message: ""
  };
}
