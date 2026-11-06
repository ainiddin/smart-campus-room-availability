// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { escapeHtml, renderBookings } from '../src/ui/render';

// UI tests use the test-only fixtures, not the demo data in src/data.ts.
vi.mock('../src/data', async () => {
  const { makeTestRooms } = await import('./fixtures');
  return { makeRooms: makeTestRooms };
});

const html = readFileSync(resolve(__dirname, '../index.html'), 'utf-8');
const css = readFileSync(resolve(__dirname, '../src/style.css'), 'utf-8');
const body = html.match(/<body[^>]*>([\s\S]*)<\/body>/)![1];

const el = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const optionIds = () => [...el<HTMLSelectElement>('room').options].map((o) => o.value);

function setValue(id: string, value: string, event = 'input') {
  const input = el<HTMLInputElement | HTMLSelectElement>(id);
  input.value = value;
  input.dispatchEvent(new Event(event, { bubbles: true }));
}
function toggleEquipment(item: string) {
  const box = document.querySelector<HTMLInputElement>(`#equipment input[value="${item}"]`)!;
  box.checked = !box.checked;
  box.dispatchEvent(new Event('change', { bubbles: true }));
}
function submit() {
  el('form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
}

beforeEach(async () => {
  document.head.innerHTML = `<style>${css}</style>`; // real stylesheet, so computed display is checked
  document.body.innerHTML = body; // fresh DOM per test
  vi.resetModules(); // re-run main.ts against the fresh DOM
  await import('../src/main');
});

describe('UI — filters (F1, F2, F4)', () => {
  it('UI-01 shows every room and all equipment checkboxes initially', () => {
    expect(optionIds()).toEqual(['A-101', 'B-202', 'C-303', 'D-404', 'E-505']);
    expect(document.querySelectorAll('#equipment input').length).toBe(4);
  });

  it('UI-02 filtering by attendees hides rooms that are too small', () => {
    setValue('attendees', '24');
    expect(optionIds()).toEqual(['A-101', 'D-404']);
    setValue('attendees', '25');
    expect(optionIds()).toEqual(['A-101']);
  });

  it('UI-03 an impossible filter shows the empty state and disables Check', () => {
    toggleEquipment('computers');
    toggleEquipment('video-conf');
    expect(optionIds()).toEqual([]);
    expect(el('empty').hidden).toBe(false);
    expect(el('empty').textContent).toMatch(/No rooms match/);
    expect(el<HTMLButtonElement>('check').disabled).toBe(true);
    expect(el<HTMLSelectElement>('room').disabled).toBe(true);
    expect(el('result').hidden).toBe(true);

    toggleEquipment('video-conf'); // relax the filter again
    expect(optionIds()).toEqual(['D-404']);
    expect(el('empty').hidden).toBe(true);
    expect(el<HTMLButtonElement>('check').disabled).toBe(false);
  });
});

describe('UI — availability result (AC3, F3, F5)', () => {
  it('UI-04 a valid slot shows Available', () => {
    // defaults: now 540, 660–720 in A-101 touches BK-1 (600–660) → allowed
    submit();
    const result = el('result');
    expect(result.hidden).toBe(false);
    expect(result.className).toContain('ok');
    expect(result.textContent).toMatch(/Available/);
    expect(result.getAttribute('role')).toBe('status');
  });

  it('UI-05 switching A-101 → B-202 after a check refreshes the result to blocked', () => {
    submit();
    expect(el('result').textContent).toMatch(/Available/);
    setValue('room', 'B-202', 'change');
    const result = el('result');
    expect(result.hidden).toBe(false);
    expect(result.className).toContain('bad');
    expect(result.textContent).toMatch(/Unavailable/);
    expect(result.textContent).toMatch(/blocked/);
    expect(el('room-name').textContent).toContain('B-202');
  });

  it('UI-06 a filter that removes the selected room keeps the shown result in sync', () => {
    setValue('room', 'C-303', 'change'); // C-303 free → Available
    expect(el('result').textContent).toMatch(/C-303/);
    setValue('attendees', '20'); // C-303 (6 seats) disappears, A-101 becomes selected
    expect(el<HTMLSelectElement>('room').value).toBe('A-101');
    expect(el('result').textContent).toMatch(/A-101/);
  });
});
describe('UI — hidden boxes are really hidden (regression)', () => {
  it('UI-08 empty state and a stale result are not displayed', () => {
   const shown = (id: string) => getComputedStyle(el(id)).display !== 'none';
   expect(shown('empty')).toBe(false); // rooms match → no yellow box
   expect(shown('result')).toBe(false); // nothing checked yet
   submit();
   expect(shown('result')).toBe(true);
   toggleEquipment('computers');
   toggleEquipment('video-conf'); // no rooms → old result must disappear
   expect(shown('empty')).toBe(true);
   expect(shown('result')).toBe(false);
  });
});
describe('render — escaping', () => {
  it('UI-07 escapes room and booking text before innerHTML', () => {
    expect(escapeHtml('<b>"x"&\'y\'</b>')).toBe('&lt;b&gt;&quot;x&quot;&amp;&#39;y&#39;&lt;/b&gt;');
    const out = renderBookings({
      id: 'X', name: 'X', capacity: 1, equipment: [], blocked: false,
      bookings: [{ id: '<img src=x onerror=alert(1)>', start: 600, end: 660 }],
    });
    expect(out).not.toContain('<img');
    expect(out).toContain('&lt;img');
  });
});