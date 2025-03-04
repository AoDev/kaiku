/**
 * Delay the execution of a Promise Chain
 * @param {Number} milliseconds
 */
export function sleep(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds))
}
