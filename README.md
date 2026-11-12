# Smart Campus Room Availability Checker

A small web app where a student checks whether a campus room is free for a
requested time slot and filters rooms by attendees and equipment. All room
data is fictional.

## Layout

- `index.html`, `src/style.css`, `src/main.ts`: the page and its wiring
- `src/lib/availability.ts`: booking rules
- `src/lib/filtering.ts`: room filtering by capacity and equipment
- `src/ui/render.ts`: HTML builders with escaping
- `src/data.ts`: demo rooms; `tests/fixtures.ts`: test-only rooms
- `tests/`: unit and UI tests

## Commands

```bash
npm install      # install dependencies
npm test         # run the test suite
npm run dev      # start the local dev server
npm run build    # produce a production build in dist/
```

## Project rules

See [AGENTS.md](AGENTS.md) for the requirements, acceptance criteria, and
workflow rules.