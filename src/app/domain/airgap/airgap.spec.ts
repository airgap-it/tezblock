import { SubProtocolSymbols } from '@airgap/coinlib-core'
import { convertSymbol, isConvertableToUSD, isInBTC } from './airgap'

describe('airgap', () => {
    describe('convertSymbol', () => {
        it('when executed with nill value returns undefined', () => {
            expect(convertSymbol(null)).toBe(undefined)
        })

        it('when executed with "usdtz" then returns "SubProtocolSymbols.XTZ_USD"', () => {
            expect(convertSymbol('usdtz')).toBe(SubProtocolSymbols.XTZ_USD)
        })
    })

    describe('isConvertableToUSD', () => {
        it('when argument is in ["xtz", "tzBTC", "BTC"] then returns true', () => {
            expect(isConvertableToUSD('tzBTC')).toBe(true)
        })

        it('when argument is NOT in ["xtz", "tzBTC", "BTC"] then returns false', () => {
            expect(isConvertableToUSD('foo')).toBe(false)
        })
    })

    describe('isInBTC', () => {
        it('when argument is in ["tzBTC", "BTC"] then returns true', () => {
            expect(isInBTC('BTC')).toBe(true)
        })

        it('when argument is NOT in ["tzBTC", "BTC"] then returns false', () => {
            expect(isInBTC('foo')).toBe(false)
        })
    })
})
