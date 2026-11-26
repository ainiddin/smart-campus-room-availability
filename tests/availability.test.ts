import { describe, it, expect } from 'vitest';
import { validate } from '../src/lib/validate';
import { checkAvailability, type Booking } from '../src/lib/availability';
import { BOOKINGS, bookingsSnapshot } from '../src/data';

const NOW = new Date('2026-11-26T00:00').getTime();

const FIXED_BOOKINGS: readonly Booking[] = Object.freeze([
  Object.freeze({ id: 'BK-1', start: '2026-12-10T10:00', end: '2026-12-10T11:00' }),
  Object.freeze({ id: 'BK-2', start: '2026-12-10T14:00', end: '2026-12-10T15:30' }),
]);

describe('validate', () => {
  it('T4: duration 0 -> INVALID_DURATION', () => {
    const r = validate({ start: '2026-12-10T12:00', duration: '0', blocked: false }, NOW);
    expect(r.ok).toBe(false);
    expect(r.code).toBe('INVALID_DURATION');
  });

  it('T5: duration 121 -> INVALID_DURATION', () => {
    const r = validate({ start: '2026-12-10T12:00', duration: '121', blocked: false }, NOW);
    expect(r.ok).toBe(false);
    expect(r.code).toBe('INVALID_DURATION');
  });

  it('T6: past start -> PAST_START', () => {
    const r = validate({ start: '2025-01-01T10:00', duration: '60', blocked: false }, NOW);
    expect(r.ok).toBe(false);
    expect(r.code).toBe('PAST_START');
  });

  it('AC6: empty start -> INVALID_INPUT', () => {
    const r = validate({ start: '', duration: '60', blocked: false }, NOW);
    expect(r.ok).toBe(false);
    expect(r.code).toBe('INVALID_INPUT');
  });

  it('AC6: non-numeric duration -> INVALID_INPUT', () => {
    const r = validate({ start: '2026-12-10T12:00', duration: 'abc', blocked: false }, NOW);
    expect(r.ok).toBe(false);
    expect(r.code).toBe('INVALID_INPUT');
  });

  it('valid input -> ok', () => {
    const r = validate({ start: '2026-12-10T12:00', duration: '60', blocked: false }, NOW);
    expect(r.ok).toBe(true);
    expect(r.code).toBe('OK');
  });

  it('duration exactly 120 -> ok', () => {
    const r = validate({ start: '2026-12-10T12:00', duration: '120', blocked: false }, NOW);
    expect(r.ok).toBe(true);
  });
});

describe('checkAvailability', () => {
  const start = (iso: string) => new Date(iso).getTime();

  it('T1: 12:00 for 60min -> OK', () => {
    const r = checkAvailability(start('2026-12-10T12:00'), start('2026-12-10T13:00'), FIXED_BOOKINGS, false);
    expect(r.available).toBe(true);
    expect(r.code).toBe('OK');
  });

  it('T2: 10:30 for 60min -> OVERLAP', () => {
    const r = checkAvailability(start('2026-12-10T10:30'), start('2026-12-10T11:30'), FIXED_BOOKINGS, false);
    expect(r.available).toBe(false);
    expect(r.code).toBe('OVERLAP');
  });

  it('T3: blocked room -> ROOM_BLOCKED even if free', () => {
    const r = checkAvailability(start('2026-12-10T12:00'), start('2026-12-10T13:00'), FIXED_BOOKINGS, true);
    expect(r.available).toBe(false);
    expect(r.code).toBe('ROOM_BLOCKED');
  });

  it('T7: 11:00 for 60min -> OK (touching interval not overlap)', () => {
    const r = checkAvailability(start('2026-12-10T11:00'), start('2026-12-10T12:00'), FIXED_BOOKINGS, false);
    expect(r.available).toBe(true);
    expect(r.code).toBe('OK');
  });

  it('AC5: bookings array is not mutated', () => {
    const before = JSON.stringify(FIXED_BOOKINGS);
    checkAvailability(start('2026-12-10T10:30'), start('2026-12-10T11:30'), FIXED_BOOKINGS, false);
    checkAvailability(start('2026-12-10T12:00'), start('2026-12-10T13:00'), FIXED_BOOKINGS, true);
    expect(JSON.stringify(FIXED_BOOKINGS)).toBe(before);
  });

  it('T8: data module bookings unchanged after checks', () => {
    const before = bookingsSnapshot();
    checkAvailability(start('2026-12-10T10:30'), start('2026-12-10T11:30'), BOOKINGS, false);
    checkAvailability(start('2026-12-10T12:00'), start('2026-12-10T13:00'), BOOKINGS, true);
    expect(bookingsSnapshot()).toBe(before);
  });
});
