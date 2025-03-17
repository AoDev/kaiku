import {describe, expect, it} from 'vitest'
import {isNumber} from './number'

describe('isNumber', () => {
  it('should check that a value is a finite number', () => {
    // Positive numbers
    expect(isNumber(1)).toBe(true)
    expect(isNumber(123.45)).toBe(true)

    // Negative numbers
    expect(isNumber(-1)).toBe(true)
    expect(isNumber(-123.45)).toBe(true)

    // Decimal numbers
    expect(isNumber(0.1)).toBe(true)

    // Exponential notation
    expect(isNumber(1e3)).toBe(true)

    // Zero
    expect(isNumber(0)).toBe(true)

    // Infinity and NaN
    expect(isNumber(Infinity)).toBe(false)
    expect(isNumber(-Infinity)).toBe(false)
    expect(isNumber(NaN)).toBe(false)

    // Strings
    expect(isNumber('1')).toBe(false)
    expect(isNumber('123.45')).toBe(false)
    expect(isNumber('')).toBe(false)
    expect(isNumber('NaN')).toBe(false)

    // Boolean values
    expect(isNumber(true)).toBe(false)
    expect(isNumber(false)).toBe(false)

    // Null and undefined
    expect(isNumber(null)).toBe(false)
    expect(isNumber(undefined)).toBe(false)

    // Objects
    expect(isNumber({})).toBe(false)
    expect(isNumber({a: 1})).toBe(false)

    // Arrays
    expect(isNumber([])).toBe(false)
    expect(isNumber([1, 2, 3])).toBe(false)

    // Functions
    expect(isNumber(() => {})).toBe(false)

    // Symbols
    expect(isNumber(Symbol('symbol'))).toBe(false)

    // BigInt
    expect(isNumber(BigInt(123))).toBe(false)
  })
})
