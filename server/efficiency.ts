/**
 * Driver Efficiency Score Algorithm
 * 
 * Calculates a 0-100 efficiency score based on:
 * - Moves Per Hour (MPH) performance
 * - GPS tracking efficiency (miles driven vs moves)
 * - Attendance rate
 * - Consistency across shifts
 */

interface EfficiencyMetrics {
  totalMoves: number;
  totalHours: number;
  totalMilesDriven: number;
  avgMovesPerHour: number;
  avgMilesPerMove: number;
  scheduledDays: number; // How many days were they supposed to work
  actualDays: number; // How many days did they actually work
  breakOverage: number; // Minutes over allocated break time
  lateClockIns: number; // Number of times clocked in late (beyond 5-min grace period)
  minutesLate: number; // Total minutes late across all shifts
}

export function calculateEfficiencyScore(metrics: EfficiencyMetrics): number {
  let score = 0;

  // 1. PRODUCTIVITY SCORE (40 points max)
  // Based on Moves Per Hour (MPH) - Target: 5+ MPH is excellent
  const mphScore = Math.min(40, (metrics.avgMovesPerHour / 5) * 40);
  score += mphScore;

  // 2. GPS EFFICIENCY SCORE (25 points max)
  // Based on miles per move - Lower is better (more efficient routing)
  // Target: 0.5-0.7 miles per move is optimal
  const targetMilesPerMove = 0.6;
  const mileVariance = Math.abs(metrics.avgMilesPerMove - targetMilesPerMove);
  const gpsEfficiency = Math.max(0, 25 - (mileVariance * 50)); // Penalty for deviation
  score += gpsEfficiency;

  // 3. ATTENDANCE SCORE (20 points max)
  // Based on scheduled days vs actual days worked
  const attendanceRate = metrics.scheduledDays > 0 
    ? (metrics.actualDays / metrics.scheduledDays) 
    : 1;
  const attendanceScore = attendanceRate * 20;
  score += attendanceScore;

  // 4. PUNCTUALITY & DISCIPLINE SCORE (15 points max)
  // Grace period: 5 minutes (e.g., 3:30 shift can clock in until 3:35 without penalty)
  // Beyond grace = flagged for supervisors/management review (not automatic demerits)
  // Score reduction is gradual based on frequency and severity
  let disciplineScore = 15;
  disciplineScore -= Math.min(8, metrics.lateClockIns * 1.5); // -1.5 points per late clock-in
  disciplineScore -= Math.min(5, (metrics.minutesLate / 30) * 2); // -2 points per 30 min total lateness
  disciplineScore -= Math.min(2, (metrics.breakOverage / 15) * 1); // -1 point per 15 min break overage
  score += Math.max(0, disciplineScore);

  // Round to integer and ensure 0-100 range
  return Math.round(Math.max(0, Math.min(100, score)));
}

export function getEfficiencyGrade(score: number): {
  grade: string;
  color: string;
  label: string;
} {
  if (score >= 90) {
    return { grade: 'A+', color: 'green', label: 'Exceptional' };
  } else if (score >= 80) {
    return { grade: 'A', color: 'green', label: 'Excellent' };
  } else if (score >= 70) {
    return { grade: 'B', color: 'blue', label: 'Above Average' };
  } else if (score >= 60) {
    return { grade: 'C', color: 'yellow', label: 'Average' };
  } else if (score >= 50) {
    return { grade: 'D', color: 'orange', label: 'Below Average' };
  } else {
    return { grade: 'F', color: 'red', label: 'Needs Improvement' };
  }
}

export function calculateAttendanceRate(scheduledDays: number, actualDays: number): string {
  if (scheduledDays === 0) return '0.0';
  const rate = (actualDays / scheduledDays) * 100;
  return rate.toFixed(1);
}

/**
 * Shift Configuration Presets for Manheim Nashville
 */
export const SHIFT_PRESETS = {
  FIRST_SHIFT: {
    name: 'First Shift',
    startTime: '06:00',
    endTime: '15:30',
    daysOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    lunchDuration: 30,
    breakCount: 2,
    breakDuration: 15,
  },
  SECOND_SHIFT: {
    name: 'Second Shift',
    startTime: '15:30',
    endTime: '00:00', // Midnight
    daysOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    lunchDuration: 30,
    breakCount: 2,
    breakDuration: 15,
  },
  SATURDAY_SHIFT: {
    name: 'Saturday Shift',
    startTime: '06:00',
    endTime: '15:30',
    daysOfWeek: ['Saturday'],
    lunchDuration: 30,
    breakCount: 2,
    breakDuration: 15,
  },
};

/**
 * Calculate total break time allotted for a shift
 */
export function calculateAllowedBreakTime(lunchDuration: number, breakCount: number, breakDuration: number): number {
  return lunchDuration + (breakCount * breakDuration);
}
