import { describe, it, expect } from 'vitest';
import { checkAvailability, MAX_DURATION } from '../src/lib/availability';
import { makeTestRooms } from './fixtures';

// Fixed clock (minutes since midnight): 540 = 09:00.
const NOW = 540;

// Fresh fixtures in every test — no shared mutable data.
const room = (id: string) => makeTestRooms().find((r) => r.id === id)!;
const check = (id: string, start: number, end: number) =>
  checkAvailability(room(id), start, end, NOW);

describe('AC1 — valid interval after current time', () => {
  it('TC-01 rejects start == end', () => {
    expect(check('C-303', 600, 600).status).toBe('Unavailable');
  });
  it('TC-02 rejects start > end', () => {
    expect(check('C-303', 700, 650).status).toBe('Unavailable');
  });
  it('TC-03 rejects start == now (must be after)', () => {
    expect(check('C-303', 540, 570).status).toBe('Unavailable');
  });
  it('TC-04 rejects a request in the past', () => {
    expect(check('C-303', 480, 510).status).toBe('Unavailable');
  });
  it('TC-05 rejects end > 1440', () => {
    expect(check('C-303', 1400, 1441).status).toBe('Unavailable');
  });
});

describe('AC2 — maximum duration', () => {
  it('TC-06 allows exactly 120 minutes', () => {
    expect(MAX_DURATION).toBe(120);
    expect(check('C-303', 720, 840).status).toBe('Available');
  });
  it('TC-07 rejects 121 minutes', () => {
    expect(check('C-303', 720, 841).status).toBe('Unavailable');
  });
});

describe('AC3 — blocked room', () => {
  it('TC-08 rejects blocked room B-202', () => {
    const r = check('B-202', 660, 720);
    expect(r.status).toBe('Unavailable');
    expect(r.reason).toMatch(/blocked/);
  });
});

describe('AC4 — overlaps, touching allowed', () => {
  it('TC-09 rejects a real overlap (630–690 vs 600–660)', () => {
    const r = check('A-101', 630, 690);
    expect(r.status).toBe('Unavailable');
    expect(r.reason).toMatch(/BK-1/);
  });
  it('TC-10 allows touching end (660–720 after 600–660)', () => {
    expect(check('A-101', 660, 720).status).toBe('Available');
  });
  it('TC-11 allows touching start (720–780 before 780–840)', () => {
    expect(check('A-101', 720, 780).status).toBe('Available');
  });
});

describe('AC5 — decision without changing data', () => {
  it('TC-12 returns Available for a free slot', () => {
    expect(check('A-101', 900, 960).status).toBe('Available');
  });
  it('TC-13 does not modify the room bookings', () => {
    const r = room('A-101');
    const snapshot = structuredClone(r.bookings);
    checkAvailability(r, 900, 960, NOW);
    expect(r.bookings).toEqual(snapshot);
  });
});

describe('regression — rule edges', () => {
  it('AC1: rejects a past request even when the room is otherwise free', () => {
    // 480–510 is before the 09:00 clock; the room has no bookings there.
    expect(check('C-303', 480, 510).status).toBe('Unavailable');
  });

  it('AC1: rejects a reversed interval on a room with bookings', () => {
    // start 900 > end 800 must never be reported as Available.
    const r = check('A-101', 900, 800);
    expect(r.status).toBe('Unavailable');
    expect(r.reason).toMatch(/before end/);
  });

  it('AC2: rejects 121 minutes on a free room', () => {
    expect(check('C-303', 900, 1021).status).toBe('Unavailable');
  });

  it('AC3: rejects a blocked room even for a valid, free slot', () => {
    expect(check('B-202', 900, 960).status).toBe('Unavailable');
  });

  it('AC4: rejects a booking that fully contains an existing booking', () => {
    // 590–700 contains BK-1 (600–660).
    const r = check('A-101', 590, 700);
    expect(r.status).toBe('Unavailable');
    expect(r.reason).toMatch(/BK-1/);
  });

  it('AC4: allows a slot touching existing bookings at both endpoints', () => {
    // 660–780 touches BK-1 at 660 and BK-2 at 780.
    expect(check('A-101', 660, 780).status).toBe('Available');
  });

  it('AC5: an overlap rejection leaves booking order and contents unchanged', () => {
    const r = room('A-101');
    const snapshot = structuredClone(r.bookings);
    checkAvailability(r, 630, 690, NOW);
    expect(r.bookings).toEqual(snapshot);
  });
});
