import { PercentagePipe } from './percentage.pipe'

describe('PercentagePipe', () => {
    const pipe = new PercentagePipe()

    it('shows percentage in "XXX.XX% format"', () => {
        expect(pipe.transform(0.111)).toBe('11.10%')
    })

    it('rounds to 2 decimal places', () => {
        expect(pipe.transform(0.11115)).toBe('11.12%')
    })
})
