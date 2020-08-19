import { TestScheduler } from 'rxjs/testing'

import {
  dataSelector,
  getInitialTableState,
  Pagination,
  showLoadMoreSelector,
  tryUpdateTotal,
  TableState,
  toClientsideDataScource,
  toPagable
} from './table'

fdescribe('table', () => {
  let testScheduler: TestScheduler

  beforeEach(() => {
    testScheduler = new TestScheduler((actual, expected) => {
      // asserting the two objects are equal
      expect(actual).toEqual(expected)
    })
  })

  describe('tryUpdateTotal', () => {
    it('when new data is equal to previous or is not dividable by tables selectedSize then updates total', () => {
      const tableState: TableState<any> = { ...getInitialTableState(), data: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] }
      const newData = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]

      expect(<any>tryUpdateTotal(tableState, newData)).toEqual(jasmine.objectContaining({ total: 11 }))
    })

    it('otherwise it does not update total', () => {
      const tableState: TableState<any> = { ...getInitialTableState(), data: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] }
      const newData = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]

      expect(<any>tryUpdateTotal(tableState, newData)).toEqual(jasmine.objectContaining({ total: undefined }))
    })
  })

  describe('toClientsideDataScource', () => {
    let data: number[]

    beforeEach(() => {
      data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25]
    })

    it('properly returns 2nd page of data', () => {
      const dataSource = toClientsideDataScource(data, (item, filter) => item === filter)
      const pagination: Pagination = { currentPage: 2, selectedSize: 10 }
      const data$ = dataSource.get(pagination)

      testScheduler.run(({ expectObservable }) => {
        const expected = '(a|)'
        const expectedValues = { a: { data: [11, 12, 13, 14, 15, 16, 17, 18, 19, 20], total: 25 } }

        expectObservable(data$).toBe(expected, expectedValues)
      })
    })

    it('properly filters data', () => {
      const dataSource = toClientsideDataScource(data, (item, filter) => item % 10 === filter)
      const pagination: Pagination = { currentPage: 1, selectedSize: 10 }
      const data$ = dataSource.get(pagination, 3)

      testScheduler.run(({ expectObservable }) => {
        const expected = '(a|)'
        const expectedValues = { a: { data: [3, 13, 23], total: 3 } }

        expectObservable(data$).toBe(expected, expectedValues)
      })
    })
  })

  it('toPagable: properly returns 2nd page of data', () => {
    const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25]
    const pagination: Pagination = { currentPage: 2, selectedSize: 10 }

    expect(toPagable(data, pagination)).toEqual({ data: [11, 12, 13, 14, 15, 16, 17, 18, 19, 20], total: 25 })
  })

  it('dataSelector: returns data based on pagination', () => {
    const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    const pagination: Pagination = { currentPage: 2, selectedSize: 3 }
    const tableState: TableState<number> = {
      data,
      pagination,
      loading: false,
      orderBy: undefined,
      temporaryData: undefined
    }

    expect(dataSelector(tableState)).toEqual([1, 2, 3, 4, 5, 6])
  })

  describe('showLoadMoreSelector', () => {
    let data: number[]

    beforeEach(() => {
      data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    })

    it('when data length is lower than total then returns true', () => {
      const pagination: Pagination = { currentPage: 2, selectedSize: 3, total: 100 }
      const tableState: TableState<number> = {
        data,
        pagination,
        loading: false,
        orderBy: undefined,
        temporaryData: undefined
      }

      expect(showLoadMoreSelector(tableState)).toBe(true)
    })

    it('when data length is NOT lower than total then returns false', () => {
      const pagination: Pagination = { currentPage: 2, selectedSize: 3, total: 10 }
      const tableState: TableState<number> = {
        data,
        pagination,
        loading: false,
        orderBy: undefined,
        temporaryData: undefined
      }

      expect(showLoadMoreSelector(tableState)).toBe(false)
    })
  })
})
