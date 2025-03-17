/**
 * Checks if an unknown value is a string (typeguard)
 */
export function isString(val: unknown): val is string {
  return typeof val === 'string'
}

/**
 * Checks that string has whitespace at the beginning or end
 */
export function hasWhiteSpace(str: string): boolean {
  return /^\s/.test(str) || /\s$/.test(str)
}

/**
 * Checks that a value is a string and has the desired length without whitespaces
 * @param minLength default: 0
 * @param maxLength default: Infinity
 */
export function isStringWithoutWhitespace(
  value: unknown,
  minLength = 0,
  maxLength = Infinity
): value is string {
  return isString(value)
    ? !hasWhiteSpace(value) && value.length >= minLength && value.length <= maxLength
    : false
}
