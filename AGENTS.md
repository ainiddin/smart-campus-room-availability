# AGENTS.md

## Project
Smart Campus room availability checker; catalog of fictional rooms.
User story: As a student, I want to check a room's availability so I can choose a valid booking time.
User story: As a student, I want to filter rooms by attendees and equipment so I only see rooms that fit my needs.

## Room catalog
Each room has: id, name, capacity, equipment (string[]), blocked, bookings.
Catalog has at least 4 rooms (currently 5: A-101, B-202 blocked, C-303, D-404, E-505).
A-101, B-202 and C-303 keep their original blocked status and bookings (AC tests rely on them).

## Acceptance criteria
- AC1: Reject start >= end and past requests (0 <= start < end <= 1440, start strictly after now).
- AC2: Reject durations longer than 120 minutes (120 allowed).
- AC3: Reject a blocked room.
- AC4: Reject overlaps; allow bookings touching only at endpoints.
- AC5: Do not mutate booking data.
- AC6: Retain clear feedback on desktop and mobile.
- F1: Room capacity >= attendees.
- F2: Room has ALL selected equipment.
- F3: A blocked room is never reported available.
- F4: Show a clear empty state when no rooms match.
- F5: Changing the selected room refreshes the availability result.

## Design decisions
- filterRooms (F1+F2) only filters by capacity and equipment. It does NOT hide blocked or busy rooms,
  so the user still sees AC3/AC4 feedback.
- The selected room is checked with the unchanged checkAvailability; F3 is guaranteed by AC3.
- src/data.ts and tests/fixtures.ts are separate on purpose: demo data must not change test expectations.

## Constraints
No backend, login, payments, live APIs, database or booking creation.
Fictional data only. TypeScript + Vite + Vitest. Minimal changes, no full rewrite.

## Structure
- src/lib/availability.ts: pure booking rules (AC1–AC5)
- src/lib/filtering.ts: pure catalog filtering (F1, F2)
- index.html, src/main.ts, src/style.css: UI
- src/data.ts: demo fixtures
- tests/fixtures.ts: test-only fixtures
- tests/availability.test.ts, tests/filtering.test.ts: tests

## Engineering rules
Prefer pure functions and minimal changes; use at most 2 justified patterns
(pure rule functions, fixture factories).
Do not mutate booking fixtures; keep responsive UI feedback.
Do not change checkAvailability behaviour; do not weaken or delete existing test assertions.

## Verification
Run the test script defined in package.json and add focused regression tests.
Report changed files, rationale and test evidence.