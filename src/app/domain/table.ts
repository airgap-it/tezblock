export interface TableState<T> {
    data: T[]
    pagination: {
      currentPage: number
      selectedSize: number
      pageSizes: [number, number, number, number]
    }
    loading: boolean
  }
  
  export const getInitialTableState = (): TableState<any> => ({
    data: [],
    pagination: {
      currentPage: 1,
      selectedSize: 10,
      pageSizes: [5, 10, 20, 50]
    },
    loading: false
  })
  