import { getInitialTableState, tryUpdateTotal, TableState, toClientsideDataScource } from './table'

describe('table', () => {
    describe('tryUpdateTotal', () => {
        it('when new data is equal to previous or is not dividable by tables selectedSize then updates total', () => {
            const tableState: TableState<any> = { ...getInitialTableState(), data: [1,2,3,4,5,6,7,8,9,10] }
            const newData = [1,2,3,4,5,6,7,8,9,10,11]

            expect(<any>tryUpdateTotal(tableState, newData)).toEqual(jasmine.objectContaining({ total: 11 }))
        })

        it('otherwise it does not update total', () => {
            const tableState: TableState<any> = { ...getInitialTableState(), data: [1,2,3,4,5,6,7,8,9,10] }
            const newData = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20]

            expect(<any>tryUpdateTotal(tableState, newData)).toEqual(jasmine.objectContaining({ total: undefined }))
        })
    })

    xdescribe('toClientsideDataScource', () => {
        // TODO
    })
})