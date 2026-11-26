# Smart Campus Room Availability Checker

A single-page web app where a student checks whether room **B-201** is free
for a requested time slot. All data is fictional and read-only.

## Layout

- `index.html`, `src/style.css`, `src/main.ts`: page, styles, and wiring
- `src/lib/validate.ts`: input validation (AC6, AC1, AC2)
- `src/lib/availability.ts`: availability check against bookings (AC4, AC3, AC5)
- `src/data.ts`: frozen fictional room data
- `src/ui/render.ts`: UI rendering helpers (textContent only)
- `tests/availability.test.ts`, `tests/overlap.test.ts`: unit tests

## Commands

```bash
npm install      # install dependencies
npm test         # run the test suite
npm run dev      # start the local dev server
npm run build    # produce a production build in dist/
```

## Project rules

See [AGENTS.md](AGENTS.md) for acceptance criteria and workflow rules.
