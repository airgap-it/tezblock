import { CurrencySymbolPipe } from './currency-symbol.pipe'

describe('CurrencySymbolPipe', () => {
    const pipe = new CurrencySymbolPipe()

    it('returns args "currInfo.symbol" property', () => {
        expect(pipe.transform(1, { currInfo: { symbol: 'foo'} })).toBe('foo')
    })

    it('when 2nd argument is falsy or does not have "currInfo.symbol" property returns empty string', () => {
        expect(pipe.transform(1, null)).toBe('')
    })
})