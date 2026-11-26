# Project memory

## Product intent & audience

- Single-page "Smart Campus Room Availability Checker" — frontend-only demo/teaching app.
- Plain HTML/CSS/JavaScript, no backend, no login, no real data.
- Audience: likely learners/reviewers evaluating structured JS modules, rule precedence, purity, and DOM-safety.

## Brand personality & voice

- Functional, instructional tone. Reason codes are uppercase machine tokens (e.g. `OVERLAP`); messages are plain human English.

## Visual design & UX direction

- Single room (B-201) only; no multi-room catalog/filtering (removed).
- Form: `datetime-local` start, numeric duration (minutes), "Room blocked" checkbox, check button.
- Output: Available/Unavailable badge + reason code + human message.
- Bookings list and "Bookings count" shown under the form (read-only display).
- "Run tests" button renders a results table: ID, input, expected, observed, PASS/FAIL.
- Responsive layout for desktop and narrow mobile.
- All DOM text written via `textContent`; never `innerHTML`, no `eval`.

## Decisions, constraints & rationale

- JS split into 3 modules:
  - `validate(input, now)` → `{ok, code, message}`
  - `checkAvailability(...)` → `{available, code, message}` — pure, must NOT mutate bookings.
  - `render(result)` → updates UI.
- Fixed data is `Object.freeze`d (read-only). Room B-201; bookings on 2026-12-10 10:00–11:00 and 14:00–15:30.
- Rule precedence (strict order): INVALID_INPUT → PAST_START → INVALID_DURATION → ROOM_BLOCKED → OVERLAP → OK.
  - AC1: start in future; AC2: duration >0 and <=120; AC4: blocked; AC6: empty/non-numeric.
- Overlap rule: `newStart < existingEnd && newEnd > existingStart`; touching intervals are not overlap.
- AC5: show decision without changing bookings.
- T8 invariant: bookings JSON identical before/after all checks.
- Old multi-room catalog/filter module and its tests deleted; README and AGENTS.md updated to new structure.
- 18 tests total pass (8 spec cases T1–T8 plus additional unit tests).

## Open questions & assumptions

- Current `now` baseline assumed dynamic at runtime; test T6 uses a hardcoded past date (2025-01-01) to guarantee `PAST_START`.
- Timezone handling for `datetime-local` assumed local browser time unless otherwise constrained.
- No explicit styling tokens/brand palette specified; visual treatment left to inferred minimal functional styling.