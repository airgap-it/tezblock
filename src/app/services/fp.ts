const hasLengthGreaterThanZero = (array: any[]) => array.length > 0
export const isNotEmptyArray = (array: any) => Array.isArray(array) && hasLengthGreaterThanZero(array)
export const filter = (condition: (entity) => boolean) => (array: any[]) => array.filter(condition)

export function first<T>(array: T[]) {
  return isNotEmptyArray(array) ? array[0] : undefined
}
export function get<T>(accessor: (_entity: T) => any) {
  return (entity: T) => (entity ? accessor(entity) : undefined)
}
export const groupBy = (key: string) => (array: any[]) =>
  array.reduce((accumulator, currentItem) => {
    ;(accumulator[currentItem[key]] = accumulator[currentItem[key]] || []).push(currentItem)
    return accumulator
  }, {})
