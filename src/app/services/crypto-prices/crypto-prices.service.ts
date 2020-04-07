import { Injectable } from '@angular/core'
import { MarketDataSample } from 'airgap-coin-lib/dist/wallet/AirGapMarketWallet'
import BigNumber from 'bignumber.js'
import * as cryptocompare from 'cryptocompare'
import { Observable, from } from 'rxjs'
import { tap } from 'rxjs/operators'

import { CacheService, CacheKeys, ExchangeRates } from '@tezblock/services/cache/cache.service'

export interface CurrencyInfo {
  symbol: string
  currency: string
  price: BigNumber
}

export enum Currency {
  BTC = 'BTC',
  USD = 'USD',
  XTZ = 'XTZ'
}

@Injectable({
  providedIn: 'root'
})
export class CryptoPricesService {
  constructor(private readonly cacheService: CacheService) {}

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

  // getCryptoPrice(protocolIdentifier: string, baseSymbol: string): Observable<{ [key: string]: number }> {
  //   return from(<Promise<{ [key: string]: number }>>cryptocompare.price(protocolIdentifier.toUpperCase(), [baseSymbol]))
  // }
}
