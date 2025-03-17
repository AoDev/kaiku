/**
 * Checks if an unknown value is a boolean (typeguard)
 */
export function isBoolean(val: unknown): val is boolean {
  return typeof val === 'boolean'
}
