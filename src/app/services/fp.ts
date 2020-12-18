import { squareBrackets } from '@tezblock/domain/pattern'

const hasLengthGreaterThanZero = (array: any[]) => array.length > 0

export const isNotEmptyArray = (array: any) => Array.isArray(array) && hasLengthGreaterThanZero(array)
export const isEmptyArray = (array: any) => Array.isArray(array) && !hasLengthGreaterThanZero(array)

export function first<T>(array: T[]) {
  return isNotEmptyArray(array) ? array[0] : undefined
}
export function last<T>(array: T[]) {
  return isNotEmptyArray(array) ? array[array.length - 1] : undefined
}
export function get<T>(accessor: (_entity: T) => any) {
  return (entity: T) => (entity ? accessor(entity) : undefined)
}

export function groupBy<T>(key: string): (array: T[]) =>  { [key: string]: T[] } {
  return function(array: T[]): { [key: string]: T[] } {
    return array.reduce((accumulator, currentItem) => {
      ;(accumulator[currentItem[key]] = accumulator[currentItem[key]] || []).push(currentItem)
      return accumulator
    }, {})
  }
}

export const toArray = (value: any) => (Array.isArray(value) ? value : [value])

export const toNotNilArray = (value: any) => Array.isArray(value) ? value : value ? [value] : []

export const withoutBraces = (value: string): string => (value ? value.replace(squareBrackets, '') : value) //TODO: use pattern.ts

export function distinctFilter<T>(value: T, index: number, _array: T[]) {
  return _array.indexOf(value) === index
}

export function flatten<T>(value: T[][]): T[] {
  return value.reduce((accumulator, currentItem) => currentItem.concat(accumulator), [])
}

export const numberToString = (radix?: number) => (value: number) => value.toString(radix)

export const bind = (_function: Function, ...args: any[]) => (value: any) => _function.bind(value)(args)

export const numberToDate = (value: number): Date => new Date(value)

export const multiplyBy = (multiplier: number) => (value: number): number => value * multiplier
