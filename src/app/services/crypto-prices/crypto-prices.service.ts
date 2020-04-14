import { Injectable } from '@angular/core'
import { MarketDataSample } from 'airgap-coin-lib/dist/wallet/AirGapMarketWallet'
import BigNumber from 'bignumber.js'
import * as cryptocompare from 'cryptocompare'
import { Observable, from } from 'rxjs'
import { filter, map, tap } from 'rxjs/operators'
import { Store } from '@ngrx/store'
import { isNil, negate } from 'lodash'

import { CacheService, CacheKeys, ExchangeRates } from '@tezblock/services/cache/cache.service'
import * as fromRoot from '@tezblock/reducers'
import { CurrencyConverterPipeArgs } from '@tezblock/pipes/currency-converter/currency-converter.pipe'
import { getCurrencyConverterPipeArgs } from '@tezblock/domain/contract'

export interface CurrencyInfo {
  symbol: string
  currency: string
  price: BigNumber
}

@Injectable({
  providedIn: 'root'
})
export class CryptoPricesService {
  constructor(private readonly cacheService: CacheService, private readonly store$: Store<fromRoot.State>) {}

  getCryptoPrices(protocolIdentifier: string, baseSymbols = ['USD', 'BTC']): Observable<{ [key: string]: number }> {
    const fromCurrency = protocolIdentifier.toUpperCase()

    return from(<Promise<{ [key: string]: number }>>cryptocompare.price(fromCurrency, baseSymbols)).pipe(
      tap(prices => {
        const change: ExchangeRates = {
          [fromCurrency]: baseSymbols
            .map(baseSymbol => ({ [baseSymbol]: prices[baseSymbol] }))
            .reduce((accumulator, currentValue) => ({ ...currentValue, ...accumulator }), {})
        }

        this.cacheService.update<ExchangeRates>(CacheKeys.exchangeRates, value => ({ ...value, ...change }))
      })
    )
  }

  getHistoricCryptoPrices(
    numberOfHours: number,
    date: Date,
    baseSymbol = 'USD',
    protocolIdentifier = 'XTZ'
  ): Observable<MarketDataSample[]> {
    return from(
      <Promise<any>>cryptocompare.histoHour(protocolIdentifier, baseSymbol, {
        limit: numberOfHours - 1,
        timestamp: date
      })
    )
  }

  getCurrencyConverterArgs(symbol: string): Observable<CurrencyConverterPipeArgs> {
    if (!symbol) {
      return this.store$
        .select(state => state.app.fiatCurrencyInfo)
        .pipe(
          filter(negate(isNil)),
          map(currInfo => ({ currInfo, protocolIdentifier: 'xtz' }))
        )
    }

    return this.store$
      .select(state => state.app.exchangeRates)
      .pipe(map(exchangeRates => getCurrencyConverterPipeArgs({ symbol }, exchangeRates)))
  }
}
