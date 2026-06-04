import * as chrono from 'chrono-node';

/**
 * Resolves any human date string to YYYY-MM-DD.
 * Valid ISO dates pass through unchanged.
 * Returns the raw input if parsing fails (caller should return a friendly error).
 *
 * Examples:
 *   "today"       → "2026-03-24"
 *   "tomorrow"    → "2026-03-25"
 *   "25"          → "2026-03-25"  (nearest future 25th)
 *   "25th"        → "2026-03-25"
 *   "March 25"    → "2026-03-25"
 *   "next friday" → next friday's date
 *   "2026-03-25"  → "2026-03-25"  (passthrough)
 */
export function resolveDate(input: string, referenceDate = new Date()): string {
  const trimmed = input.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;

  const parsed = chrono.parseDate(trimmed, referenceDate, { forwardDate: true });
  if (!parsed) return trimmed;
  return parsed.toISOString().split('T')[0];
}

export function isValidDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !isNaN(Date.parse(value));
}

/**
 * Try to extract two dates from a single string (user typed both at once).
 * e.g. "25, 26"         → { checkIn: "2026-03-25", checkOut: "2026-03-26" }
 * e.g. "March 25 to 28" → { checkIn: "2026-03-25", checkOut: "2026-03-28" }
 * Returns null if fewer than two dates are found.
 */
export function resolveDateRange(
  input: string,
  referenceDate = new Date(),
): { checkIn: string; checkOut: string } | null {
  const results = chrono.parse(input, referenceDate, { forwardDate: true });

  if (results.length >= 2) {
    return {
      checkIn: results[0].date().toISOString().split('T')[0],
      checkOut: results[1].date().toISOString().split('T')[0],
    };
  }
  if (results.length === 1 && results[0].end) {
    return {
      checkIn: results[0].date().toISOString().split('T')[0],
      checkOut: results[0].end.date().toISOString().split('T')[0],
    };
  }
  return null;
}
