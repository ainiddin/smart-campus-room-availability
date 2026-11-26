import type { Booking } from './lib/availability';

// Fixed fictional data, read-only.
export const ROOM_NAME = 'B-201';

export const BOOKINGS: readonly Booking[] = Object.freeze([
  Object.freeze({ id: 'BK-1', start: '2026-12-10T10:00', end: '2026-12-10T11:00' }),
  Object.freeze({ id: 'BK-2', start: '2026-12-10T14:00', end: '2026-12-10T15:30' }),
]);

export function bookingsSnapshot(): string {
  return JSON.stringify(BOOKINGS);
}
