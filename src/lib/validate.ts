// AC6/AC1/AC2: input validation, independent of bookings.
// Returns {ok:false, code, message} on failure, {ok:true} when input is usable.

export interface ValidationResult {
  ok: boolean;
  code: string;
  message: string;
}

export interface ValidateInput {
  start: string; // datetime-local string "YYYY-MM-DDTHH:mm"
  duration: string; // raw string from a number input
  blocked: boolean;
}

export function validate(input: ValidateInput, now: number): ValidationResult {
  if (!input.start || input.start.trim() === '' || Number.isNaN(new Date(input.start).getTime())) {
    return { ok: false, code: 'INVALID_INPUT', message: 'Please enter a valid start date and time.' };
  }
  const durNum = Number(input.duration);
  if (input.duration.trim() === '' || !Number.isFinite(durNum)) {
    return { ok: false, code: 'INVALID_INPUT', message: 'Please enter a numeric duration in minutes.' };
  }

  const startDate = new Date(input.start).getTime();
  if (startDate <= now) {
    return { ok: false, code: 'PAST_START', message: 'Start time must be in the future.' };
  }

  if (!Number.isFinite(durNum) || durNum <= 0 || durNum > 120) {
    return { ok: false, code: 'INVALID_DURATION', message: 'Duration must be greater than 0 and at most 120 minutes.' };
  }

  return { ok: true, code: 'OK', message: '' };
}
