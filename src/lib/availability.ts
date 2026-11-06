// Smart Campus — Room Availability Checker (continued from Practice #06)
// User story: As a student, I want to check a room's availability
// so that I can choose a valid booking time.
// All times are minutes since midnight (0–1440).

export const MAX_DURATION = 120;
export const DAY_END = 1440;

export interface Booking {
  id: string;
  start: number;
  end: number;
}

export interface Room {
  id: string;
  name: string;
  capacity: number;
  equipment: string[];
  blocked: boolean;
  bookings: Booking[];
}

export type Status = 'Available' | 'Unavailable';

export interface Decision {
  status: Status;
  reason: string;
}

// AC4: intervals are half-open [start, end).
// Touching endpoints (600–660 and 660–720) are allowed.
export function overlaps(aStart: number, aEnd: number, bStart: number, bEnd: number): boolean {
  return aStart < bEnd && bStart < aEnd;
}

export function checkAvailability(room: Room, start: number, end: number, now: number): Decision {
  // AC1: 0 <= start < end <= 1440 and start is after the current time
  if (![start, end, now].every(Number.isInteger)) {
    return { status: 'Unavailable', reason: 'Times must be whole minutes' };
  }
  if (start < 0 || end > DAY_END) {
    return { status: 'Unavailable', reason: 'Times must be between 0 and 1440' };
  }
  if (start >= end) {
    return { status: 'Unavailable', reason: 'Start must be before end' };
  }
  if (start <= now) {
    return { status: 'Unavailable', reason: 'Start must be after the current time' };
  }

  // AC2: maximum duration
  if (end - start > MAX_DURATION) {
    return { status: 'Unavailable', reason: `Maximum duration is ${MAX_DURATION} minutes` };
  }

  // AC3: blocked room
  if (room.blocked) {
    return { status: 'Unavailable', reason: `Room ${room.id} is blocked` };
  }

  // AC4: overlap check (sorted so the earliest conflict is reported)
  const sorted = [...room.bookings].sort((a, b) => a.start - b.start);
  const conflict = sorted.find((b) => overlaps(start, end, b.start, b.end));
  if (conflict) {
    return {
      status: 'Unavailable',
      reason: `Overlaps booking ${conflict.id} (${conflict.start}–${conflict.end})`,
    };
  }

  // AC5
  return { status: 'Available', reason: `Room ${room.id} is free for ${start}–${end}` };
}