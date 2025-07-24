import {isValuable} from '@lib/typescript'

export type NonEmptyArray<T> = [T, ...T[]]
export type ArrayWithTwoItemsMin<T> = [T, T, ...T[]]
export type ArrayWithThreeItemsMin<T> = [T, T, T, ...T[]]
export type ArrayWithFourItemsMin<T> = [T, T, T, T, ...T[]]
export type ArrayWithFiveItemsMin<T> = [T, T, T, T, T, ...T[]]
export type ArrayWithSixItemsMin<T> = [T, T, T, T, T, T, ...T[]]
export type ArrayWithSevenItemsMin<T> = [T, T, T, T, T, T, T, ...T[]]
export type ArrayWithEightItemsMin<T> = [T, T, T, T, T, T, T, T, ...T[]]
export type ArrayWithNineItemsMin<T> = [T, T, T, T, T, T, T, T, T, ...T[]]
export type ArrayWithTenItemsMin<T> = [T, T, T, T, T, T, T, T, T, T, ...T[]]

export const hasOneItemMin = <T>(arr: T[]): arr is NonEmptyArray<T> => arr.length > 0
export const hasTwoItemsMin = <T>(arr: T[]): arr is ArrayWithTwoItemsMin<T> => arr.length >= 2
export const hasThreeItemsMin = <T>(arr: T[]): arr is ArrayWithThreeItemsMin<T> => arr.length >= 3
export const hasFourItemsMin = <T>(arr: T[]): arr is ArrayWithFourItemsMin<T> => arr.length >= 4
export const hasFiveItemsMin = <T>(arr: T[]): arr is ArrayWithFiveItemsMin<T> => arr.length >= 5
export const hasSixItemsMin = <T>(arr: T[]): arr is ArrayWithSixItemsMin<T> => arr.length >= 6
export const hasSevenItemsMin = <T>(arr: T[]): arr is ArrayWithSevenItemsMin<T> => arr.length >= 7
export const hasEightItemsMin = <T>(arr: T[]): arr is ArrayWithEightItemsMin<T> => arr.length >= 8
export const hasNineItemsMin = <T>(arr: T[]): arr is ArrayWithNineItemsMin<T> => arr.length >= 9
export const hasTenItemsMin = <T>(arr: T[]): arr is ArrayWithTenItemsMin<T> => arr.length >= 10

export const allItemsValuable = <T extends number | string>(arr: (T | undefined)[]): arr is T[] =>
  !arr.some((item): item is T => !isValuable(item))
