import {action} from 'mobx'

// Utility type to exclude method keys
export type NonFunctionKeys<T> = {
  // biome-ignore lint/complexity/noBannedTypes: Don't know how to fix this TS issue
  [K in keyof T]: T[K] extends Function ? never : K extends string ? K : never
}[keyof T]

// Utility type to extract boolean keys
export type BooleanKeys<T> = {
  [K in keyof T]: T[K] extends boolean ? K : never
}[keyof T]

type AssignProps<T> = Partial<Pick<T, NonFunctionKeys<T>>>

/**
 * Helper to set a property on a class instance that can not overwrite the class methods.
 */
export function setMethod<T>(instance: T) {
  return action(function <K extends NonFunctionKeys<T>>(this: T, prop: K, value: T[K]) {
    instance[prop] = value
  })
}

export type SetMethod<T> = ReturnType<typeof setMethod<T>>

/**
 * Helper to assign properties on a class instance that can not overwrite the class methods.
 */
export function assignMethod<T extends object>(instance: T) {
  return action(function (this: T, props: AssignProps<T>) {
    Object.assign(instance, props)
  })
}

export type AssignMethod<T extends object> = ReturnType<typeof assignMethod<T>>

/**
 * Helper to toggle boolean properties on a class instance.
 */
export function toggleMethod<T>(instance: T) {
  return action(function (this: T, prop: BooleanKeys<T>) {
    ;(instance[prop] as boolean) = !instance[prop]
  })
}

export type ToggleMethod<T> = ReturnType<typeof toggleMethod<T>>
