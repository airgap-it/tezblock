export interface TableState<T> {
    data: T[]
    pagination: {
      currentPage: number
      selectedSize: number
      pageSizes: [number, number, number, number]
      total?: number
    }
    loading: boolean
  }
  
  export const getInitialTableState = (selectedSize = 10): TableState<any> => ({
    data: [],
    pagination: {
      currentPage: 1,
      selectedSize,
      pageSizes: [5, 10, 20, 50],
      total: undefined
    },
    loading: false
  })
  