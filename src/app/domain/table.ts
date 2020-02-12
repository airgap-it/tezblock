export interface TableState<T> {
  data: T[]
  pagination: {
    currentPage: number
    selectedSize: number
    pageSizes: [number, number, number, number]
    total?: number
  }
  loading: boolean
  sorting: Sorting
}

export interface Sorting {
  direction: string
  value: string
}

export const getInitialTableState = (): TableState<any> => ({
  data: [],
  pagination: {
    currentPage: 1,
    selectedSize: 1,
    pageSizes: [5, 10, 20, 50],
    total: undefined
  },
  loading: false,
  sorting: { direction: undefined, value: undefined }
})

export interface Data<T> {
  data: T[]
  total: number
}
