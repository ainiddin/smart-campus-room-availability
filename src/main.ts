import { validate, type ValidateInput } from './lib/validate';
import { checkAvailability } from './lib/availability';
import { BOOKINGS, ROOM_NAME, bookingsSnapshot } from './data';
import { renderResult, renderBookings } from './ui/render';

function $<T extends HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Missing element #${id}`);
  return el as T;
}

const form = $<HTMLFormElement>('form');
const startInput = $<HTMLInputElement>('start');
const durationInput = $<HTMLInputElement>('duration');
const blockedInput = $<HTMLInputElement>('blocked');
const checkButton = $<HTMLButtonElement>('check');
const resultBox = $('result');
const bookingsList = $('bookings');
const countEl = $('count');
const testButton = $<HTMLButtonElement>('run-tests');
const testResults = $('test-results');

function readInput(): ValidateInput {
  return { start: startInput.value, duration: durationInput.value, blocked: blockedInput.checked };
}

function clearResult(): void {
  resultBox.hidden = true;
}

function runCheck(): void {
  const now = Date.now();
  const input = readInput();
  const v = validate(input, now);
  if (!v.ok) {
    renderResult(resultBox, { available: false, code: v.code, message: v.message });
    return;
  }
  const startMs = new Date(input.start).getTime();
  const endMs = startMs + Number(input.duration) * 60_000;
  const result = checkAvailability(startMs, endMs, BOOKINGS, input.blocked);
  renderResult(resultBox, result);
}

// --- Test runner (8 cases) ---

interface TestCase {
  id: string;
  start: string;
  duration: string;
  blocked: boolean;
  expected: string;
}

const NOW_REFERENCE = new Date('2026-11-26T00:00').getTime();

const TEST_CASES: TestCase[] = [
  { id: 'T1', start: '2026-12-10T12:00', duration: '60', blocked: false, expected: 'OK' },
  { id: 'T2', start: '2026-12-10T10:30', duration: '60', blocked: false, expected: 'OVERLAP' },
  { id: 'T3', start: '2026-12-10T12:00', duration: '60', blocked: true, expected: 'ROOM_BLOCKED' },
  { id: 'T4', start: '2026-12-10T12:00', duration: '0', blocked: false, expected: 'INVALID_DURATION' },
  { id: 'T5', start: '2026-12-10T12:00', duration: '121', blocked: false, expected: 'INVALID_DURATION' },
  { id: 'T6', start: '2025-01-01T10:00', duration: '60', blocked: false, expected: 'PAST_START' },
  { id: 'T7', start: '2026-12-10T11:00', duration: '60', blocked: false, expected: 'OK' },
];

function runOne(tc: TestCase, now: number): string {
  const v = validate({ start: tc.start, duration: tc.duration, blocked: tc.blocked }, now);
  if (!v.ok) return v.code;
  const startMs = new Date(tc.start).getTime();
  const endMs = startMs + Number(tc.duration) * 60_000;
  return checkAvailability(startMs, endMs, BOOKINGS, tc.blocked).code;
}

function runTests(): void {
  const before = bookingsSnapshot();
  const rows: { id: string; input: string; expected: string; observed: string; pass: boolean }[] = [];

  for (const tc of TEST_CASES) {
    const observed = runOne(tc, NOW_REFERENCE);
    rows.push({
      id: tc.id,
      input: `${tc.start}, ${tc.duration}min${tc.blocked ? ', blocked' : ''}`,
      expected: tc.expected,
      observed,
      pass: observed === tc.expected,
    });
  }

  const after = bookingsSnapshot();
  const t8Pass = before === after;
  rows.push({
    id: 'T8',
    input: 'bookings JSON before/after',
    expected: 'unchanged',
    observed: t8Pass ? 'unchanged' : 'changed',
    pass: t8Pass,
  });

  renderTestTable(rows);
}

function renderTestTable(
  rows: { id: string; input: string; expected: string; observed: string; pass: boolean }[],
): void {
  testResults.hidden = false;
  const table = testResults.querySelector('table')!;
  const tbody = table.querySelector('tbody')!;
  tbody.replaceChildren();
  for (const r of rows) {
    const tr = document.createElement('tr');
    tr.className = r.pass ? 'pass' : 'fail';
    const tdId = document.createElement('td');
    tdId.textContent = r.id;
    const tdInput = document.createElement('td');
    tdInput.textContent = r.input;
    const tdExpected = document.createElement('td');
    tdExpected.textContent = r.expected;
    const tdObserved = document.createElement('td');
    tdObserved.textContent = r.observed;
    const tdStatus = document.createElement('td');
    tdStatus.textContent = r.pass ? 'PASS' : 'FAIL';
    tr.append(tdId, tdInput, tdExpected, tdObserved, tdStatus);
    tbody.appendChild(tr);
  }
}

// --- Wire up ---

renderBookings(bookingsList, BOOKINGS, countEl);

form.addEventListener('submit', (ev) => {
  ev.preventDefault();
  runCheck();
});
[startInput, durationInput].forEach((i) => i.addEventListener('input', clearResult));
blockedInput.addEventListener('change', clearResult);
testButton.addEventListener('click', runTests);
