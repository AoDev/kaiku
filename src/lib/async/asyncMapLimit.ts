/**
 * Processes an array of items with an async function, limiting the number of concurrent operations.
 *
 * @param items The array of items to process
 * @param fn The async function to apply to each item
 * @param concurrency The maximum number of items to process concurrently
 * @param progressCallback Optional callback function to report progress
 * @returns An array of results in the same order as the input items
 */

// Define a proper error type
interface ProcessingError {
  error: unknown
  index: number
}

export async function asyncMapLimit<T, R>(
  items: T[],
  fn: (item: T, index: number) => Promise<R>,
  concurrency: number,
  progressCallback?: (completed: number, total: number) => void
): Promise<R[]> {
  // Validate inputs
  if (concurrency < 1) {
    throw new Error('Concurrency must be at least 1')
  }

  if (items.length === 0) {
    return []
  }

  const results: R[] = new Array(items.length)
  let nextIndex = 0
  let completedCount = 0
  const total = items.length

  // Create a function to process the next item
  async function processNext(): Promise<void> {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex++
      try {
        // Process the item
        results[currentIndex] = await fn(items[currentIndex], currentIndex)
      } catch (error) {
        // Re-throw to be caught by the Promise.all below
        throw {error, index: currentIndex} as ProcessingError
      }

      // Update progress
      completedCount++
      if (progressCallback) {
        progressCallback(completedCount, total)
      }
    }
  }

  // Create an array of worker promises
  const workerCount = Math.min(concurrency, items.length)
  const workers = Array.from({length: workerCount}, () => processNext())

  // Wait for all workers to complete
  try {
    await Promise.all(workers)
    return results
  } catch (err: unknown) {
    // Type guard to check if err is our ProcessingError
    if (err && typeof err === 'object' && 'index' in err && 'error' in err) {
      const processingError = err as ProcessingError
      throw new Error(
        `Error processing item at index ${processingError.index}: ${processingError.error}`
      )
    }
    // If it's some other error, just rethrow
    throw err
  }
}

/**
 * Similar to Promise.allSettled but with controlled concurrency.
 * Processes items and returns both fulfilled and rejected results.
 */
export async function asyncMapLimitSettled<T, R>(
  items: T[],
  fn: (item: T, index: number) => Promise<R>,
  concurrency: number,
  progressCallback?: (completed: number, total: number) => void
): Promise<PromiseSettledResult<R>[]> {
  // Validate inputs
  if (concurrency < 1) {
    throw new Error('Concurrency must be at least 1')
  }

  if (items.length === 0) {
    return []
  }

  const results: PromiseSettledResult<R>[] = new Array(items.length)
  let nextIndex = 0
  let completedCount = 0
  const total = items.length

  // Create a function to process the next item
  async function processNext(): Promise<void> {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex++
      try {
        // Process the item
        const value = await fn(items[currentIndex], currentIndex)
        results[currentIndex] = {status: 'fulfilled', value}
      } catch (error) {
        // Store the rejection
        results[currentIndex] = {status: 'rejected', reason: error}
      }

      // Update progress
      completedCount++
      if (progressCallback) {
        progressCallback(completedCount, total)
      }
    }
  }

  // Create an array of worker promises
  const workerCount = Math.min(concurrency, items.length)
  const workers = Array.from({length: workerCount}, () => processNext())

  // Wait for all workers to complete
  await Promise.all(workers)
  return results
}
