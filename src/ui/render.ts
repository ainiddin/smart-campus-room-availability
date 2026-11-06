// Smart Campus — UI rendering helpers.
// Pure string builders plus one helper that updates a given element.
// All room/booking text is escaped before it goes into innerHTML.

import type { Decision, Room } from '../lib/availability';

export function escapeHtml(value: string | number): string {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function renderRoomOptions(rooms: readonly Room[]): string {
  return rooms
    .map((r) => {
      const label = `${r.id} — ${r.name} (${r.capacity} seats)${r.blocked ? ' (blocked)' : ''}`;
      return `<option value="${escapeHtml(r.id)}">${escapeHtml(label)}</option>`;
    })
    .join('');
}

export function renderEquipmentOptions(items: readonly string[]): string {
  return items
    .map(
      (item) =>
        `<label class="chip"><input type="checkbox" name="equipment" value="${escapeHtml(item)}" /> ${escapeHtml(item)}</label>`,
    )
    .join('');
}

export function renderBookings(room: Room): string {
  return room.bookings.length
    ? room.bookings
        .map((b) => `<li><b>${escapeHtml(b.id)}</b> ${escapeHtml(b.start)}–${escapeHtml(b.end)}</li>`)
        .join('')
    : '<li class="muted">No bookings</li>';
}

export function renderEmptyState(): string {
  return '<strong>No rooms match</strong><span>Reduce attendees or clear some equipment filters.</span>';
}

// Updates the given result element (keeps its role="status" / aria-live).
export function renderResult(box: HTMLElement, decision: Decision): void {
  box.hidden = false;
  box.className = 'result ' + (decision.status === 'Available' ? 'ok' : 'bad');
  box.innerHTML = `<strong>${escapeHtml(decision.status)}</strong><span>${escapeHtml(decision.reason)}</span>`;
}