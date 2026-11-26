// UI rendering. Uses textContent only, never innerHTML for dynamic text.

import type { AvailabilityResult, Booking } from '../lib/availability';

export function renderResult(box: HTMLElement, result: AvailabilityResult): void {
  box.hidden = false;
  box.className = 'result ' + (result.available ? 'ok' : 'bad');
  box.querySelector('[data-role="badge"]')!.textContent = result.available ? 'Available' : 'Unavailable';
  box.querySelector('[data-role="code"]')!.textContent = result.code;
  box.querySelector('[data-role="message"]')!.textContent = result.message;
}

export function renderBookings(list: HTMLElement, bookings: readonly Booking[], countEl: HTMLElement): void {
  list.replaceChildren();
  if (bookings.length === 0) {
    const li = document.createElement('li');
    li.className = 'muted';
    li.textContent = 'No bookings.';
    list.appendChild(li);
  } else {
    for (const b of bookings) {
      const li = document.createElement('li');
      const strong = document.createElement('strong');
      strong.textContent = b.id;
      li.appendChild(strong);
      li.append(` ${b.start} to ${b.end}`);
      list.appendChild(li);
    }
  }
  countEl.textContent = String(bookings.length);
}
