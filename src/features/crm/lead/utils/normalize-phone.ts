/**
 * Canonicalises a phone number to a stable, country-prefixed form so the same
 * human entering different shapes resolves to one lead row:
 *
 *   "9539192684"      + default "91"   →  "919539192684"
 *   "919539192684"                     →  "919539192684"
 *   "+91 95391-92684"                  →  "919539192684"
 *   "+1 (555) 123-4567"                →  "15551234567"
 *
 * Rules:
 *   1. Strip everything except digits and a leading "+".
 *   2. If the cleaned value starts with "+", drop the "+".
 *   3. If the cleaned value already begins with the default country code,
 *      keep it; otherwise prepend the default country code.
 *   4. If the cleaned value starts with another known country prefix (any "+"
 *      input is treated as already-canonicalised), keep it.
 *   5. If the input is empty/null/garbage, return null so callers can decide
 *      whether to reject or store null.
 */
export function normalizePhone(raw: string | null | undefined, defaultCountryCode: string): string | null {
  if (raw == null) return null;
  const str = String(raw).trim();
  if (!str) return null;

  const hadPlus = str.startsWith('+');
  const digitsOnly = str.replace(/\D/g, '');
  if (!digitsOnly) return null;

  // "+" prefix => caller already supplied an internationalised number; trust it.
  if (hadPlus) return digitsOnly;

  const cc = String(defaultCountryCode || '').replace(/\D/g, '') || '91';

  // Already starts with the default country code? leave it alone.
  if (digitsOnly.startsWith(cc)) return digitsOnly;

  // Common Indian local prefix "0" before the 10-digit subscriber number.
  // Drop a leading zero if it would result in a 10-digit local number.
  let local = digitsOnly;
  if (cc === '91' && local.startsWith('0') && local.length === 11) {
    local = local.slice(1);
  }

  return `${cc}${local}`;
}

/** Convenience: normalise + check non-empty. */
export function normalizePhoneOrThrow(raw: string | null | undefined, defaultCountryCode: string): string {
  const result = normalizePhone(raw, defaultCountryCode);
  if (!result) throw new Error(`Invalid phone number: ${raw}`);
  return result;
}
