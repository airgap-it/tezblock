import { of } from 'rxjs'

export const getCryptoPricesServiceMock = () => jasmine.createSpyObj('CryptoPricesService', {
    getCryptoPrices: of(null),
    getHistoricCryptoPrices: of([]),
    getCurrencyConverterArgs: of(null),
    getEfficiencyLast10Cycles: of(null)
})
