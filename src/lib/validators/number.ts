/**
 * Checks if a value is a number, excludes NaN or Infinity.
 * It is also a type guard.
 */
export function isNumber(val: unknown): val is number {
  // biome-ignore lint/suspicious/noGlobalIsNan: we check that type is number first
  return typeof val === 'number' && !isNaN(val) && Number.isFinite(val)
}

export function isPositiveNumber(input: string): boolean {
  const numberValue = Number(input)
  // biome-ignore lint/suspicious/noGlobalIsNan: we already cast to number
  return input !== '' && !isNaN(numberValue) && numberValue > 0
}
