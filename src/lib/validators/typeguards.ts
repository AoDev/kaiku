export function isUndefined(val: unknown): val is undefined {
  return typeof val === 'undefined'
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    Object.keys(value).every((key) => typeof key === 'string')
  )
}
