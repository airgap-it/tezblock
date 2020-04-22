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
}

export const getInitialTableState = (orderBy?: OrderBy, selectedSize = 10): TableState<any> => ({
  data: undefined,
  pagination: {
    currentPage: 1,
    selectedSize,
    pageSizes: [5, 10, 20, 50],
    total: undefined
  },
  loading: false,
  orderBy
})

export interface Data<T> {
  data: T[]
  total: number
}

export const sort = (field: string, direction: Direction): OrderBy => ({ field, direction })

export const tryUpdateTotal = (tableState: TableState<any>, data: any[]): Pagination => {
  const previousLength = (tableState.data || []).length
  const newLength = (data || []).length

  return {
    ...tableState.pagination,
    total:
      newLength === previousLength || (newLength > 0 && newLength % tableState.pagination.selectedSize !== 0)
        ? newLength
        : tableState.pagination.total
  }
}
