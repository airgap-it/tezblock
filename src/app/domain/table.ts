import { Observable, of } from 'rxjs'

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
  data: [],
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

export interface DataSource<T> {
  get: (pagination: Pagination, filter?: any) => Observable<T[]>
  getTotal: (filter?: any) => Observable<number>
  isFilterable: boolean
}

export function toClientsideDataScource<T>(data: T[], filterCondition?: (item: T, filter: any) => boolean): DataSource<T> {
  const _filterCondition = (filter?: any) => filter && filterCondition ? (item: T) => filterCondition(item, filter) : () => true

  return {
    get: (pagination: Pagination, filter?: any) => {
      const startItem = (pagination.currentPage - 1) * pagination.selectedSize
      const endItem = pagination.currentPage * pagination.selectedSize
      

      return of(data.slice(startItem, endItem).filter(_filterCondition(filter)))
    },
    getTotal: (filter?: any) => {
      return of(data.filter(_filterCondition(filter)).length)
    },
    isFilterable: !!filterCondition
  }
}
