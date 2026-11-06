// Smart Campus — room catalog filtering.
// F1: room capacity >= attendees.
// F2: room has ALL selected equipment.
// Filtering does NOT check blocked status or bookings: the selected room is
// still checked with checkAvailability(), so AC3/AC4 feedback stays visible
// and F3 (blocked never Available) is guaranteed by AC3.

import type { Room } from './availability';

export interface RoomRequirements {
  attendees?: number;
  equipment?: readonly string[];
}

export function meetsRequirements(room: Room, req: RoomRequirements = {}): boolean {
  const attendees = req.attendees ?? 0;
  const equipment = req.equipment ?? [];
  return room.capacity >= attendees && equipment.every((item) => room.equipment.includes(item));
}

// Pure: returns a new array, never mutates `rooms` or `req`.
export function filterRooms(rooms: readonly Room[], req: RoomRequirements = {}): Room[] {
  return rooms.filter((room) => meetsRequirements(room, req));
}