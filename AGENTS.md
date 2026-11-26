# AGENTS.md

## Project
Smart Campus room availability checker for a single fictional room (B-201).
User story: As a student, I want to check a room's availability so I can
choose a valid booking time.

## Room data
Room B-201 has two fixed fictional bookings (2026-12-10 10:00–11:00 and
14:00–15:30). Data is frozen with Object.freeze and never mutated.

## Acceptance criteria
- AC6: Empty or non-numeric input -> INVALID_INPUT.
- AC1: Start must be in the future -> PAST_START.
- AC2: Duration > 0 and <= 120 -> otherwise INVALID_DURATION.
- AC4: Blocked room -> ROOM_BLOCKED (checked before overlap).
- AC3: Overlap (newStart < existingEnd && existingStart < newEnd) -> OVERLAP;
  touching intervals are NOT overlap.
- AC5: Show the decision without changing bookings; display bookings list and
  a "Bookings count" under the form.
- Otherwise -> OK, Available.

## Module structure
- src/lib/validate.ts: validate(input, now) -> {ok, code, message}
- src/lib/availability.ts: checkAvailability(startMs, endMs, bookings, blocked)
  -> {available, code, message} (pure, no mutation)
- src/ui/render.ts: render(result) updates the UI (textContent only)
- src/data.ts: frozen fictional bookings
- src/main.ts: wiring + test runner (8 cases)
- index.html, src/style.css: page and styles
- tests/availability.test.ts, tests/overlap.test.ts: unit tests

## Constraints
No backend, login, payments, live APIs, database or booking creation.
Fictional data only. TypeScript + Vite + Vitest.

## Security
- Render all text with textContent, never innerHTML.
- No eval, no secrets, no .env files.

## Forbidden actions
- Do not read, create, or commit secrets or `.env` files.
- No deployment or publishing.
- No Bolt Database, Supabase or other persistence without explicit approval.
- No new dependencies and no network calls without approval.

## Review gate
1. Show the full diff of proposed changes first.
2. Run `npm test` and report the actual output before proposing acceptance.
3. Wait for explicit human approval before applying changes.