/**
 * Attendance and Punctuality Tracking
 * 
 * Tracks clock-in times with 5-minute grace period
 * Flags late arrivals for supervisor/management review
 */

export interface ClockInEvent {
  driverNumber: string;
  driverName: string;
  scheduledStart: string; // "15:30"
  actualClockIn: Date;
  shiftType: 'first_shift' | 'second_shift' | 'saturday_shift';
  date: string; // "2025-11-20"
}

export interface LateClockInFlag {
  driverNumber: string;
  driverName: string;
  scheduledTime: string;
  actualTime: string;
  minutesLate: number;
  date: string;
  shiftType: string;
  isFlagged: boolean;
}

const GRACE_PERIOD_MINUTES = 5;

export function checkClockInStatus(event: ClockInEvent): LateClockInFlag {
  const [schedHours, schedMinutes] = event.scheduledStart.split(':').map(Number);
  const scheduled = new Date(event.actualClockIn);
  scheduled.setHours(schedHours, schedMinutes, 0, 0);

  const gracePeriodEnd = new Date(scheduled);
  gracePeriodEnd.setMinutes(gracePeriodEnd.getMinutes() + GRACE_PERIOD_MINUTES);

  const minutesLate = Math.max(0, 
    Math.floor((event.actualClockIn.getTime() - gracePeriodEnd.getTime()) / (1000 * 60))
  );

  const isFlagged = minutesLate > 0;

  return {
    driverNumber: event.driverNumber,
    driverName: event.driverName,
    scheduledTime: event.scheduledStart,
    actualTime: event.actualClockIn.toTimeString().substring(0, 5),
    minutesLate,
    date: event.date,
    shiftType: event.shiftType,
    isFlagged,
  };
}

export function formatLateFlag(flag: LateClockInFlag): string {
  if (!flag.isFlagged) {
    return `${flag.driverName} clocked in on time`;
  }

  const severity = flag.minutesLate > 30 ? 'LATE' : 
                   flag.minutesLate > 15 ? 'Late' : 'Tardy';

  return `${severity}: ${flag.driverName} clocked in at ${flag.actualTime} (scheduled ${flag.scheduledTime}) - ${flag.minutesLate} min late`;
}

/**
 * Shift time configurations with grace periods
 */
export const SHIFT_TIMES = {
  first_shift: {
    start: '06:00',
    end: '15:30',
    gracePeriodEnd: '06:05',
  },
  second_shift: {
    start: '15:30',
    end: '00:00',
    gracePeriodEnd: '15:35',
  },
  saturday_shift: {
    start: '06:00',
    end: '15:30',
    gracePeriodEnd: '06:05',
  },
};
