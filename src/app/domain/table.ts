import { OrderBy, Direction } from '@tezblock/services/base.service'

export interface Pagination {
  currentPage: number
  selectedSize: number
  pageSizes?: [number, number, number, number]
  total?: number
}

export interface TableState<T> {
  data: T[]
  pagination: Pagination
  loading: boolean
  orderBy: OrderBy
  temporaryData: T[]
}

export const getInitialTableState = (orderBy?: OrderBy, selectedSize = 10): TableState<any> => ({
  data: [],
  pagination: {
    currentPage: 1,
    selectedSize,
    pageSizes: [5, 10, 20, 50],
    total: undefined
  },
  loading: false,
  orderBy,
  temporaryData: []
})

export interface Data<T> {
  data: T[]
  total: number
}

export const sort = (field: string, direction: Direction): OrderBy => ({ field, direction })
