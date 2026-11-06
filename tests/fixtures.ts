import type { Room } from '../src/lib/availability';

// Test-only fixtures. Kept separate from the demo data in src/data.ts so
// changing what the app displays does not change test expectations.
// A-101, B-202, C-303 keep their original blocked status and bookings.
export function makeTestRooms(): Room[] {
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