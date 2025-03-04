import AsyncData from './AsyncData'

describe('AsyncData', () => {
  it('loaded is false on initialization', () => {
    const asyncData = new AsyncData<[]>([], jest.fn())

    expect(asyncData.loaded).toEqual(false)
  })

  it('reset sets all values to its initial state', async () => {
    const mockedFetchHandler = jest.fn(() => Promise.resolve(9999))
    const asyncData = new AsyncData<number>(100, mockedFetchHandler)

    await asyncData.fetch(123)
    asyncData.reset()

    expect(mockedFetchHandler).toHaveBeenCalledTimes(1)
    expect(asyncData.loaded).toEqual(false)
    expect(asyncData.pending).toEqual(false)
    expect(asyncData.updatedAt).toEqual(0)
    expect(asyncData.lastAttempt).toEqual(0)
    expect(asyncData.error).toEqual(null)
  })

  describe('fetch', () => {
    it('calls fetchHandler with all arguments', async () => {
      const mockedFetchHandler = jest.fn()
      const asyncData = new AsyncData<number>(0, mockedFetchHandler)
      const arg1 = 'hello'
      const arg2 = 'world'
      const arg3 = 1337

      await asyncData.fetch(arg1, arg2, arg3)

      expect(mockedFetchHandler).toHaveBeenCalledTimes(1)
      expect(mockedFetchHandler).toHaveBeenCalledWith(arg1, arg2, arg3)
    })

    it('sets pending to true', async () => {
      const asyncData = new AsyncData('', jest.fn())

      const fetchPromise = asyncData.fetch()

      expect(asyncData.pending).toBe(true)
      await fetchPromise
    })

    it('when finished successfully sets value, last attempt, last updated and loaded', async () => {
      const currentDateTime = new Date('2020-01-15 15:30:14')
      const expectedValue = 'hello world'
      jest.useFakeTimers().setSystemTime(currentDateTime)
      const mockFetchHandler = jest.fn(() => Promise.resolve(expectedValue))
      const asyncData = new AsyncData('', mockFetchHandler)

      const returnedValue = await asyncData.fetch()

      expect(returnedValue).toBe(expectedValue)
      expect(asyncData.value).toBe(expectedValue)
      expect(asyncData.updatedAt).toEqual(currentDateTime.getTime())
      expect(asyncData.lastAttempt).toEqual(currentDateTime.getTime())
      expect(asyncData.loaded).toEqual(true)
    })

    describe('on error', () => {
      it('calls error handler with thrown error and sets error value and loaded', async () => {
        const expectedError = new Error('Something went wrong!')
        const mockFetchHandler = jest.fn(() => {
          throw expectedError
        })
        const mockOnError = jest.fn()
        const asyncData = new AsyncData<number>(0, mockFetchHandler, {onError: mockOnError})

        await asyncData.fetch()

        expect(mockOnError).toHaveBeenCalledWith(expectedError)
        expect(asyncData.error).toBe(expectedError)
        expect(asyncData.loaded).toEqual(true)
      })

      it('logs error by default', async () => {
        const expectedError = new Error('Oopsie!')
        console.error = jest.fn()
        const mockFetchHandler = jest.fn(() => {
          throw expectedError
        })
        const asyncData = new AsyncData<number>(0, mockFetchHandler)

        await asyncData.fetch()

        expect(console.error).toHaveBeenCalledWith(expectedError)
      })
    })
  })
})
