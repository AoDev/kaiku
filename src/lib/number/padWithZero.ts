/**
 * Pads a number with a zero to the left
 * @param number - The number to pad
 * @param digits - The number of digits to pad to
 *
 * padWithZero(1) => '01'
 * padWithZero(1, 3) => '001'
 */
export function padWithZero(number: number, digits = 2) {
  return number.toString().padStart(digits, '0')
}
