import { Injectable } from '@angular/core'
import { MarketDataSample } from 'airgap-coin-lib/dist/wallet/AirGapMarketWallet'
import BigNumber from 'bignumber.js'
import * as cryptocompare from 'cryptocompare'
import { Observable, from, of } from 'rxjs'
import { filter, map, tap } from 'rxjs/operators'
import { Store } from '@ngrx/store'
import { isNil, negate } from 'lodash'

import { CacheService, CacheKeys, ExchangeRates } from '@tezblock/services/cache/cache.service'
import * as fromRoot from '@tezblock/reducers'
import { CurrencyConverterPipeArgs } from '@tezblock/pipes/currency-converter/currency-converter.pipe'
import { getCurrencyConverterPipeArgs } from '@tezblock/domain/contract'
import { isConvertableToUSD } from '@tezblock/domain/airgap'

export enum PricePeriod {
  day = 0,
  week = 1,
  threeMonths = 2
}

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
    date: Date,
    baseSymbol = 'USD',
    protocolIdentifier = 'XTZ',
    pricePeriod: PricePeriod
  ): Observable<MarketDataSample[]> {
    if (pricePeriod === PricePeriod.day) {
      return from(
        <Promise<any>>cryptocompare.histoHour(protocolIdentifier, baseSymbol, {
          limit: 24 - 1,
          timestamp: date
        })
      )
    }

    if (pricePeriod === PricePeriod.week) {
      return from(
        <Promise<any>>cryptocompare.histoDay(protocolIdentifier, baseSymbol, {
          limit: 7,
          timestamp: date
        })
      )
    }

    // 3 months
    return from(
      <Promise<any>>cryptocompare.histoDay(protocolIdentifier, baseSymbol, {
        limit: 90,
        timestamp: date
      })
    )
  }

  getCurrencyConverterArgs(symbol: string): Observable<CurrencyConverterPipeArgs> {
    if (symbol && !isConvertableToUSD(symbol)) {
      return of(null)
    }

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
      .pipe(
        filter(negate(isNil)),
        map(exchangeRates => getCurrencyConverterPipeArgs({ symbol }, exchangeRates))
      )
  }
}
