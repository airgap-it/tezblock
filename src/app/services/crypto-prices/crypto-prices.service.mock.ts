import { EMPTY } from 'rxjs'

export const getCryptoPricesServiceMock = () => jasmine.createSpyObj('CryptoPricesService', {
    getCryptoPrices: EMPTY,
    getHistoricCryptoPrices: EMPTY,
    getCurrencyConverterArgs: EMPTY,
    getEfficiencyLast10Cycles: EMPTY
})
