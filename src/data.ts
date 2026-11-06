import type { Room } from './lib/availability';

// Fictional sample data only (same first three rooms as Practice #06).
// Demo data for the UI; tests use tests/fixtures.ts instead.
export function makeRooms(): Room[] {
  return [
    {
      id: 'A-101',
      name: 'Lecture Room A',
      capacity: 30,
      equipment: ['projector', 'whiteboard'],
      blocked: false,
      // intentionally listed out of time order
      bookings: [
        { id: 'BK-2', start: 780, end: 840 },
        { id: 'BK-1', start: 600, end: 660 },
      ],
    },
    {
      id: 'B-202',
      name: 'Seminar Room B',
      capacity: 20,
      equipment: ['projector', 'video-conf'],
      blocked: true,
      bookings: [],
    },
    {
      id: 'C-303',
      name: 'Study Room C',
      capacity: 6,
      equipment: ['whiteboard'],
      blocked: false,
      bookings: [],
    },
    {
      id: 'D-404',
      name: 'Computer Lab D',
      capacity: 24,
      equipment: ['computers', 'projector', 'whiteboard'],
      blocked: false,
      bookings: [{ id: 'BK-3', start: 720, end: 780 }],
    },
    {
      id: 'E-505',
      name: 'Meeting Room E',
      capacity: 10,
      equipment: ['video-conf', 'whiteboard'],
      blocked: false,
      bookings: [],
    },
  ];
}