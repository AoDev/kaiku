import {isStringWithoutWhitespace} from './string'

/**
 * Checks if an unknown value is a valid email address
 * Does not allow spaces before or after.
 */
export function isValidEmail(value: unknown) {
  return isStringWithoutWhitespace(value) ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) : false
}
