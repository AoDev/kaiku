/**
 * Get the value of a dataset key from the target element or any of its parents
 * @example
 * const value = getDatasetValue(event, 'artistId')
 */
export function getDatasetValue(event: React.MouseEvent<HTMLDivElement>, key: string) {
  let target = event.target as HTMLElement
  let value: string | undefined
  while (!value && target !== event.currentTarget && target.parentNode !== null) {
    value = target.dataset[key]
    target = target.parentNode as HTMLElement
  }
  return value
}
