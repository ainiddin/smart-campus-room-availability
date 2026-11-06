import { describe, it, expect } from 'vitest';
import { filterRooms } from '../src/lib/filtering';
import { checkAvailability } from '../src/lib/availability';
import { makeTestRooms } from './fixtures';

const NOW = 540;
const ids = (rooms: { id: string }[]) => rooms.map((r) => r.id);

describe('catalog fixtures', () => {
  it('has at least 5 rooms with unique ids and all catalog fields', () => {
    const rooms = makeTestRooms();
    expect(rooms.length).toBeGreaterThanOrEqual(5);
    expect(new Set(ids(rooms)).size).toBe(rooms.length);
    for (const r of rooms) {
      expect(r.name).toBeTruthy();
      expect(Number.isInteger(r.capacity) && r.capacity > 0).toBe(true);
      expect(Array.isArray(r.equipment)).toBe(true);
    }
  });
});

describe('F1 — capacity >= attendees', () => {
  it('FT-01 includes a room whose capacity equals attendees', () => {
    // D-404 capacity 24
    expect(ids(filterRooms(makeTestRooms(), { attendees: 24 }))).toContain('D-404');
  });
  it('FT-02 excludes a room whose capacity is attendees - 1', () => {
    // 25 attendees: D-404 (24) is one seat short
    const result = ids(filterRooms(makeTestRooms(), { attendees: 25 }));
    expect(result).not.toContain('D-404');
    expect(result).toEqual(['A-101']);
  });
});

describe('F2 — room has ALL selected equipment', () => {
  it('FT-03 includes rooms that have every selected item', () => {
    expect(ids(filterRooms(makeTestRooms(), { equipment: ['projector', 'whiteboard'] })))
      .toEqual(['A-101', 'D-404']);
  });
  it('FT-04 excludes a room missing one selected item', () => {
    // C-303 has whiteboard but no video-conf
    const result = ids(filterRooms(makeTestRooms(), { equipment: ['whiteboard', 'video-conf'] }));
    expect(result).not.toContain('C-303');
    expect(result).toEqual(['E-505']);
  });
  it('FT-05 combines capacity and equipment', () => {
    expect(ids(filterRooms(makeTestRooms(), { attendees: 20, equipment: ['computers'] })))
      .toEqual(['D-404']);
  });
});

describe('no requirements / empty result', () => {
  it('FT-06 returns every room when nothing is required', () => {
    const rooms = makeTestRooms();
    expect(ids(filterRooms(rooms))).toEqual(ids(rooms));
    expect(ids(filterRooms(rooms, { attendees: 0, equipment: [] }))).toEqual(ids(rooms));
  });
  it('FT-07 returns an empty array when no room matches (basis for F4)', () => {
    expect(filterRooms(makeTestRooms(), { attendees: 100 })).toEqual([]);
    expect(filterRooms(makeTestRooms(), { equipment: ['computers', 'video-conf'] })).toEqual([]);
  });
});

describe('F3 — blocked room stays visible and is checked as Unavailable', () => {
  it('FT-08 keeps blocked B-202 in the filter result; checkAvailability rejects it', () => {
    const matches = filterRooms(makeTestRooms(), { equipment: ['projector', 'video-conf'] });
    expect(ids(matches)).toEqual(['B-202']);
    const decision = checkAvailability(matches[0], 900, 960, NOW);
    expect(decision.status).toBe('Unavailable');
    expect(decision.reason).toMatch(/blocked/);
  });
});

describe('purity — input not mutated', () => {
  it('FT-09 leaves rooms, bookings, order and requirements unchanged', () => {
    const rooms = makeTestRooms();
    const req = { attendees: 10, equipment: ['whiteboard'] };
    const roomsSnapshot = structuredClone(rooms);
    const reqSnapshot = structuredClone(req);
    const result = filterRooms(rooms, req);
    expect(rooms).toEqual(roomsSnapshot);
    expect(req).toEqual(reqSnapshot);
    expect(result).not.toBe(rooms);
  });
});