// Utility types for valuable values
export type NonNullish<T> = T extends null | undefined ? never : T

// Excludes null, undefined, empty string, and NaN
export type ValuableValue<T> = T extends null | undefined
  ? never
  : T extends string
    ? T extends ''
      ? never
      : T
    : T extends number
      ? T extends number
        ? T
        : never
      : T

// More specific type that ensures finite numbers
export type FiniteValue<T> = T extends number ? (T extends number ? T : never) : ValuableValue<T>

/**
 * * Disallow null and undefined
 * * Strings: disallow empty strings
 * * Numbers: disallow NaN and Infinity
 */
export function isValuable<T>(value: T): value is ValuableValue<T> {
  if (value === null || value === undefined) {
    return false
  }

  if (typeof value === 'string') {
    return value !== ''
  }

  if (typeof value === 'number') {
    return Number.isFinite(value)
  }

  return true
}
