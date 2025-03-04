/**
 * Get how much percentage the first number is of the second number.
 *
 * eg: `percentage(10, 30) -> 33.33333333333333`
 * eg: `percentage(30, 10) -> 300`
 * eg: `percentage(10, 0) -> NaN`
 */

export function percentage(value: number, total: number): number {
  if (total === 0) {
    return NaN
  }
  return (value / total) * 100
}
