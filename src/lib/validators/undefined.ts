/**
 * Checks if an unknown value is undefined (typeguard)
 */
export function isUndefined(val: unknown): val is undefined {
  return typeof val === 'undefined'
}
