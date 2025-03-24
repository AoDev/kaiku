/**
 * Normalizes an unknown value into an Error instance.
 * @param err The caught error of unknown type
 * @returns An Error instance with as much detail as possible
 */
export function normalizeError(err: unknown): Error & {originalError?: unknown} {
  if (err instanceof Error) {
    return err // Already an Error, no need to wrap
  }

  if (err === null || err === undefined) {
    return new Error('An unknown error occurred') // Fallback for null/undefined
  }

  if (typeof err === 'string') {
    return new Error(err) // Use string directly as message
  }

  if (typeof err === 'object') {
    // Try to extract a message or useful info from objects
    const message = 'message' in err && typeof err.message === 'string' ? err.message : String(err)
    const error: Error & {originalError?: unknown} = new Error(message)
    error.originalError = err
    return error
  }

  // Fallback for numbers, booleans, etc.
  return new Error(String(err))
}
