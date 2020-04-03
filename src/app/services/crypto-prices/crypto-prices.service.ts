import { Injectable } from '@angular/core'
import { MarketDataSample } from 'airgap-coin-lib/dist/wallet/AirGapMarketWallet'
import BigNumber from 'bignumber.js'
import * as cryptocompare from 'cryptocompare'
import { Observable, from } from 'rxjs'
import { tap } from 'rxjs/operators'

import { CacheService, CacheKeys, Currency } from '@tezblock/services/cache/cache.service'

export interface CurrencyInfo {
  symbol: string
  currency: string
  price: BigNumber
}

@Injectable({
  providedIn: 'root'
})
export class CryptoPricesService {
  
  constructor(private readonly cacheService: CacheService) {}

  getCryptoPrices(protocolIdentifier: string, baseSymbols = ['USD', 'BTC']): Observable<{ [key: string]: number }> {
    return from(<Promise<{ [key: string]: number }>>cryptocompare.price(protocolIdentifier.toUpperCase(), baseSymbols)).pipe(
      tap(prices => {
        const change = baseSymbols
          .map(baseSymbol => ({ [baseSymbol]: prices[baseSymbol] }))
          .reduce((accumulator, currentValue) => ({ ...currentValue, ...accumulator }), {})

        this.cacheService.update<Currency>(CacheKeys.currency, value => ({ ...value, ...change }))
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
}
