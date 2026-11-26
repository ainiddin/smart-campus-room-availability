import { describe, it, expect } from 'vitest';
import { overlaps } from '../src/lib/availability';

describe('overlaps (AC3 boundary cases)', () => {
  const ms = (iso: string) => new Date(iso).getTime();

  it('touching at start boundary is not overlap', () => {
    expect(overlaps(ms('2026-12-10T11:00'), ms('2026-12-10T12:00'), ms('2026-12-10T10:00'), ms('2026-12-10T11:00'))).toBe(false);
  });

  it('touching at end boundary is not overlap', () => {
    expect(overlaps(ms('2026-12-10T11:00'), ms('2026-12-10T12:00'), ms('2026-12-10T12:00'), ms('2026-12-10T13:00'))).toBe(false);
  });

  it('partial overlap is detected', () => {
    expect(overlaps(ms('2026-12-10T10:30'), ms('2026-12-10T11:30'), ms('2026-12-10T10:00'), ms('2026-12-10T11:00'))).toBe(true);
  });

  it('fully contained is detected', () => {
    expect(overlaps(ms('2026-12-10T14:30'), ms('2026-12-10T15:00'), ms('2026-12-10T14:00'), ms('2026-12-10T15:30'))).toBe(true);
  });

  it('completely separate is not overlap', () => {
    expect(overlaps(ms('2026-12-10T12:00'), ms('2026-12-10T13:00'), ms('2026-12-10T14:00'), ms('2026-12-10T15:30'))).toBe(false);
  });
});
