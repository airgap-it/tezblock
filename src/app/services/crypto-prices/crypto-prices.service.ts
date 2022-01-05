import { Injectable } from '@angular/core';
import BigNumber from 'bignumber.js';
import * as cryptocompare from 'cryptocompare';
import { Observable, from, of } from 'rxjs';
import { filter, map, switchMap, tap } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { isNil, negate } from 'lodash';

import {
  CacheService,
  CacheKeys,
  ExchangeRates,
  ByHistoricPriceState,
} from '@tezblock/services/cache/cache.service';
import * as fromRoot from '@tezblock/reducers';
import { CurrencyConverterPipeArgs } from '@tezblock/pipes/currency-converter/currency-converter.pipe';
import { getCurrencyConverterPipeArgs } from '@tezblock/domain/contract';
import { isConvertableToUSD } from '@tezblock/domain/airgap';
import { HttpClient } from '@angular/common/http';
import { get as _get } from 'lodash';

export interface CurrentPrice {
  usd: number;
}
export interface MarketData {
  current_price: CurrentPrice;
}
export interface CoinGeckoResponse {
  market_data: MarketData;
}

export interface MarketDataSample {
  time: number;
  close: number;
  high: number;
  low: number;
  open: number;
  volumefrom: number;
  volumeto: number;
}

export interface CryptoPriceApiResponse {
  time: number;
  price: number;
}

export enum PricePeriod {
  day = 0,
  week = 1,
  threeMonths = 2,
}

export interface CurrencyInfo {
  symbol: string;
  currency: string;
  price: BigNumber;
}

@Injectable({
  providedIn: 'root',
})
export class CryptoPricesService {
  private readonly baseURL: string = 'https://api.coingecko.com/api/v3';

  constructor(
    private readonly http: HttpClient,
    private readonly cacheService: CacheService,
    private readonly store$: Store<fromRoot.State>
  ) {}

  getCryptoPrices(
    protocolIdentifier: string,
    baseSymbols = ['USD', 'BTC']
  ): Observable<{ [key: string]: number }> {
    const fromCurrency = protocolIdentifier.toUpperCase();

    return from(
      <Promise<{ [key: string]: number }>>(
        cryptocompare.price(fromCurrency, baseSymbols)
      )
    ).pipe(
      tap((prices) => {
        const change: ExchangeRates = {
          [fromCurrency]: baseSymbols
            .map((baseSymbol) => ({ [baseSymbol]: prices[baseSymbol] }))
            .reduce(
              (accumulator, currentValue) => ({
                ...currentValue,
                ...accumulator,
              }),
              {}
            ),
        };

        this.cacheService.update<ExchangeRates>(
          CacheKeys.exchangeRates,
          (value) => ({ ...value, ...change })
        );
      })
    );
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
          timestamp: date,
        })
      );
    }

    if (pricePeriod === PricePeriod.week) {
      return from(
        <Promise<any>>cryptocompare.histoDay(protocolIdentifier, baseSymbol, {
          limit: 7,
          timestamp: date,
        })
      );
    }

    // 3 months
    return from(
      <Promise<any>>cryptocompare.histoDay(protocolIdentifier, baseSymbol, {
        limit: 90,
        timestamp: date,
      })
    );
  }

  getCurrencyConverterArgs(
    symbol: string
  ): Observable<CurrencyConverterPipeArgs> {
    if (symbol && !isConvertableToUSD(symbol)) {
      return of(null);
    }

    if (!symbol) {
      return this.store$
        .select((state) => state.app.fiatCurrencyInfo)
        .pipe(
          filter(negate(isNil)),
          map((currInfo) => ({ currInfo, protocolIdentifier: 'xtz' }))
        );
    }

    return this.store$
      .select((state) => state.app.exchangeRates)
      .pipe(
        filter(negate(isNil)),
        map((exchangeRates) =>
          getCurrencyConverterPipeArgs({ symbol }, exchangeRates)
        )
      );
  }

  fetchChartData(
    from: string,
    to: string
  ): Observable<CryptoPriceApiResponse[]> {
    const symbolMapping = {
      XTZ: 'tezos',
      tzBTC: 'tzbtc',
    };
    const fromIdentifier = symbolMapping[from];
    const toIdentifier = symbolMapping[to];

    return this.http
      .get<any[]>(
        `${this.baseURL}/coins/${fromIdentifier}/market_chart?vs_currency=usd&days=7`
      )
      .pipe(
        switchMap((fromData: any) => {
          const fromPrices = fromData.prices;
          return this.http
            .get<any[]>(
              `${this.baseURL}/coins/${toIdentifier}/market_chart?vs_currency=usd&days=7`
            )
            .pipe(
              map((toData: any) => {
                const toPrices = toData.prices;
                return toPrices
                  .slice(0, fromPrices.length)
                  .map((tuple, i) => [
                    tuple[0],
                    new BigNumber(toPrices[i][1])
                      .div(fromPrices[i][1])
                      .toNumber(),
                  ]);
              })
            );
        })
      );
  }

  calculatePriceDelta(
    symbol: string,
    referenceSymbol: string
  ): Observable<string> {
    const symbolMapping = {
      BTC: 'bitcoin',
      XTZ: 'tezos',
      tzBTC: 'tzbtc',
    };
    const identifier = symbolMapping[symbol];
    const referenceIdentifier = symbolMapping[referenceSymbol];
    return this.http
      .get<any[]>(
        `${this.baseURL}/simple/price?ids=${identifier}&vs_currencies=usd`
      )
      .pipe(
        switchMap((data: any) => {
          const price = data[identifier]['usd'];
          return this.http
            .get<any[]>(
              `${this.baseURL}/simple/price?ids=${referenceIdentifier}&vs_currencies=usd`
            )
            .pipe(
              map((referenceData: any) => {
                const referencePrice =
                  referenceData[referenceIdentifier]['usd'];
                return `${new BigNumber(price)
                  .minus(referencePrice)
                  .dividedBy(referencePrice)
                  .times(100)
                  .toFixed(2)}%`;
              })
            );
        })
      );
  }
}
