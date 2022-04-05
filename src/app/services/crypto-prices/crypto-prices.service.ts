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

  fetchLiquidityBakingChartData(
    from: string
  ): Observable<CryptoPriceApiResponse[]> {
    const symbolMapping = {
      XTZ: 'tezos',
      tzBTC: 'tzbtc',
    };
    const fromIdentifier = symbolMapping[from];

    const now = new Date(Date.now()).toISOString();
    const ninetyDaysAgo = new Date(
      Date.now() - 90 * 24 * 60 * 60 * 1000
    ).toISOString();

    const body = {
      query:
        'query ($v1:quotes_1d_bool_exp,$v2:[quotes_1d_order_by!]){quotes1d(where:$v1,order_by:$v2){...f1}},fragment f1 on quotes_1d{average,bucket}',
      variables: {
        v1: {
          exchangeId: {
            _eq: 'KT1TxqZ8QtKvLu3V3JH7Gx58n7Co8pgtpQU5',
          },
          bucket: {
            _gt: ninetyDaysAgo,
            _lt: now,
          },
        },
        v2: {
          bucket: 'asc',
        },
      },
    };

    return this.http.post<any>('https://dex.dipdup.net/v1/graphql', body).pipe(
      map((response) => {
        const quotes = response.data.quotes1d;

        return fromIdentifier === symbolMapping.XTZ
          ? quotes.map((quote) => [quote.bucket, quote.average])
          : quotes.map((quote) => [
              quote.bucket,
              new BigNumber(1).dividedBy(quote.average),
            ]);
      })
    );
  }

  static symbolMapping = {
    BTC: 'bitcoin',
    XTZ: 'tezos',
    tzBTC: 'tzbtc',
  };

  public getPrice(symbol: string): Observable<number> {
    const identifier = CryptoPricesService.symbolMapping[symbol];
    return this.http
      .get<any>(
        `${this.baseURL}/simple/price?ids=${identifier}&vs_currencies=usd`
      )
      .pipe(map((data) => data[identifier]['usd']));
  }
}
