// Availability check against existing bookings.
// AC4: blocked room. AC3: overlap (half-open; touching is not overlap). AC5: never mutates bookings.

export interface Booking {
  id: string;
  start: string; // ISO 8601 "YYYY-MM-DDTHH:mm"
  end: string;
}

export interface AvailabilityResult {
  available: boolean;
  code: string;
  message: string;
}

export function overlaps(newStart: number, newEnd: number, exStart: number, exEnd: number): boolean {
  return newStart < exEnd && exStart < newEnd;
}

// Pure: reads bookings only, never writes. Returns a decision object.
export function checkAvailability(
  startMs: number,
  endMs: number,
  bookings: readonly Booking[],
  blocked: boolean,
): AvailabilityResult {
  if (blocked) {
    return { available: false, code: 'ROOM_BLOCKED', message: 'This room is currently blocked.' };
  }
  for (const b of bookings) {
    const exStart = new Date(b.start).getTime();
    const exEnd = new Date(b.end).getTime();
    if (overlaps(startMs, endMs, exStart, exEnd)) {
      return {
        available: false,
        code: 'OVERLAP',
        message: `Overlaps existing booking ${b.id} (${b.start} to ${b.end}).`,
      };
    }
  }
  return { available: true, code: 'OK', message: 'Room is available for the requested time.' };
}
