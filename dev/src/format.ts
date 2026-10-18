/**
 * Formats a whole number with thousands separators.
 * @param value - The number.
 * @returns It, grouped.
 */
export function integer(value: number): string {
  return Math.round(value).toLocaleString('en-US');
}

/**
 * Formats a duration, in the unit that keeps it readable.
 * @param milliseconds - The duration.
 * @returns Milliseconds under a second, seconds otherwise.
 */
export function duration(milliseconds: number): string {
  if (milliseconds < 1000) return `${Math.round(milliseconds)} ms`;
  return `${(milliseconds / 1000).toFixed(2)} s`;
}

/**
 * Formats a throughput.
 * @param processed - How many molecules were scanned.
 * @param milliseconds - How long it took.
 * @returns Molecules per second, or a dash when nothing has been timed yet.
 */
export function rate(processed: number, milliseconds: number): string {
  if (milliseconds <= 0 || processed === 0) return '—';
  return `${integer((processed / milliseconds) * 1000)} mol/s`;
}

/**
 * Formats a ratio.
 * @param value - The ratio.
 * @returns It, to two decimals, with a multiplication sign.
 */
export function ratio(value: number): string {
  return Number.isFinite(value) ? `${value.toFixed(2)}×` : '—';
}

/**
 * Formats a percentage.
 * @param part - The part.
 * @param whole - The whole.
 * @returns The share, to one decimal.
 */
export function percent(part: number, whole: number): string {
  return whole === 0 ? '0.0%' : `${((part / whole) * 100).toFixed(1)}%`;
}

/**
 * Formats a share that may be tiny, with two significant digits.
 * @param part - The part.
 * @param whole - The whole.
 * @returns The share, as a percentage: `45%`, `1.2%`, `0.013%`.
 */
export function share(part: number, whole: number): string {
  if (whole === 0 || part === 0) return '0%';
  const value = (part / whole) * 100;
  return `${Number(value.toPrecision(2)).toLocaleString('en-US', { maximumFractionDigits: 6 })}%`;
}
