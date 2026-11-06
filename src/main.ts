import { checkAvailability, type Room } from './lib/availability';
import { filterRooms, type RoomRequirements } from './lib/filtering';
import { makeRooms } from './data';
import {
  renderBookings,
  renderEmptyState,
  renderEquipmentOptions,
  renderResult,
  renderRoomOptions,
} from './ui/render';

const rooms = makeRooms();
const allEquipment = [...new Set(rooms.flatMap((r) => r.equipment))].sort();

function $<T extends HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Missing element #${id}`);
  return el as T;
}

const form = $<HTMLFormElement>('form');
const roomSelect = $<HTMLSelectElement>('room');
const attendeesInput = $<HTMLInputElement>('attendees');
const equipmentBox = $('equipment');
const emptyBox = $('empty');
const checkButton = $<HTMLButtonElement>('check');
const resultBox = $('result');
const timeInputs = ['now', 'start', 'end'].map((id) => $<HTMLInputElement>(id));

let visibleRooms: Room[] = rooms;

const selectedRoom = (): Room | undefined => visibleRooms.find((r) => r.id === roomSelect.value);

function readRequirements(): RoomRequirements {
  const attendees = Number(attendeesInput.value);
  const equipment = [...equipmentBox.querySelectorAll<HTMLInputElement>('input:checked')].map((i) => i.value);
  return { attendees: Number.isFinite(attendees) && attendees > 0 ? attendees : 0, equipment };
}

function clearResult(): void {
  resultBox.hidden = true;
}

function showSelectedBookings(): void {
  const room = selectedRoom();
  $('room-name').textContent = room ? `${room.id} — ${room.name}` : '—';
  $('bookings').innerHTML = room ? renderBookings(room) : '';
}

// F5: one place that reads the form, checks the selected room and renders the result.
function refresh(): void {
  const room = selectedRoom();
  if (!room) {
    clearResult();
    showSelectedBookings();
    return;
  }
  const num = (input: HTMLInputElement) => Number(input.value);
  const [now, start, end] = timeInputs.map(num);
  renderResult(resultBox, checkAvailability(room, start, end, now));
  showSelectedBookings();
}

// F1/F2 via filterRooms; F4 empty state when nothing matches.
function applyFilters(): void {
  const resultWasShown = !resultBox.hidden;
  const previous = roomSelect.value;

  visibleRooms = filterRooms(rooms, readRequirements());
  const empty = visibleRooms.length === 0;

  roomSelect.innerHTML = renderRoomOptions(visibleRooms);
  if (visibleRooms.some((r) => r.id === previous)) roomSelect.value = previous;
  roomSelect.disabled = empty;
  checkButton.disabled = empty;
  emptyBox.hidden = !empty;
  emptyBox.innerHTML = empty ? renderEmptyState() : '';

  if (empty) {
    clearResult();
    showSelectedBookings();
  } else if (resultWasShown) {
    refresh(); // selected room may have changed: keep the result in sync
  } else {
    showSelectedBookings();
  }
}

equipmentBox.innerHTML = renderEquipmentOptions(allEquipment);

form.addEventListener('submit', (ev) => {
  ev.preventDefault();
  refresh();
});
roomSelect.addEventListener('change', refresh);
attendeesInput.addEventListener('input', applyFilters);
equipmentBox.addEventListener('change', applyFilters);
timeInputs.forEach((i) => i.addEventListener('input', clearResult));

applyFilters();