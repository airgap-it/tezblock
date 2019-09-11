import { Injectable } from '@angular/core'
import { MarketDataSample } from 'airgap-coin-lib/dist/wallet/AirGapMarketWallet'
import BigNumber from 'bignumber.js'
import * as cryptocompare from 'cryptocompare'
import { BehaviorSubject, combineLatest, Observable, timer, from } from 'rxjs'
import { distinctUntilChanged, map, switchMap } from 'rxjs/operators'

import { Facade, disctinctChartData } from '../facade/facade'
import { ObserveOnOperator } from 'rxjs/internal/operators/observeOn'

export interface CurrencyInfo {
  symbol: string
  currency: string
  price: BigNumber
}

interface CryptoPricesServiceState {
  cryptoCurrencyInfo: CurrencyInfo
  fiatCurrencyInfo: CurrencyInfo
  loading: boolean
  historicData: MarketDataSample[]
  percentage: number
}

const initialState: CryptoPricesServiceState = {
  cryptoCurrencyInfo: {
    symbol: 'BTC',
    currency: 'BTC',
    price: new BigNumber(0)
  },
  fiatCurrencyInfo: {
    symbol: '$',
    currency: 'USD',
    price: new BigNumber(0)
  },
  loading: true,
  historicData: [],
  percentage: 0
}

@Injectable({
  providedIn: 'root'
})
export class CryptoPricesService extends Facade<CryptoPricesServiceState> {
  public fiatCurrencyInfo$ = this.state$.pipe(
    map(state => state.fiatCurrencyInfo),
    distinctUntilChanged()
  )
  public cryptoCurrencyInfo$ = this.state$.pipe(
    map(state => state.cryptoCurrencyInfo),
    distinctUntilChanged()
  )
  public historicData$ = this.state$.pipe(
    map(state => state.historicData),
    distinctUntilChanged(disctinctChartData)
  )
  public growthPercentage$ = this.state$.pipe(
    map(state => state.percentage),
    distinctUntilChanged()
  )

  constructor() {
    super(initialState)

    // We need this to not trigger infinite refreshes
    const fiatCurrencyInfo$ = this.fiatCurrencyInfo$.pipe(
      distinctUntilChanged(
        (previous, current) => previous.currency === current.currency && previous.price.toString(10) === current.price.toString(10)
      )
    )
    // We need this to not trigger infinite refreshes
    const cryptoCurrencyInfo$ = this.cryptoCurrencyInfo$.pipe(
      distinctUntilChanged(
        (previous, current) => previous.currency === current.currency && previous.price.toString(10) === current.price.toString(10)
      )
    )

    const historicData$ = this.historicData$.pipe(distinctUntilChanged())

    combineLatest([fiatCurrencyInfo$, cryptoCurrencyInfo$, this.timer$])
      .pipe(
        switchMap(([fiatCurrencyInfo, cryptoCurrencyInfo, _]) => {
          return new Observable<{ fiatPrice: BigNumber; cryptoPrice: BigNumber }>(observer => {
            this.getCryptoPrices('xtz', [fiatCurrencyInfo.currency, cryptoCurrencyInfo.currency])
              .then((prices: { [key: string]: number }) => {
                const fiatPrice = new BigNumber(prices[fiatCurrencyInfo.currency])
                const cryptoPrice = new BigNumber(prices[cryptoCurrencyInfo.currency])
                observer.next({ fiatPrice, cryptoPrice })
              })
              // tslint:disable-next-line:no-console
              .catch(console.error)
          })
        })
      )
      .subscribe(({ fiatPrice, cryptoPrice }) => {
        const fiatCurrencyInfo = { ...this._state.fiatCurrencyInfo, price: fiatPrice }
        const cryptoCurrencyInfo = { ...this._state.cryptoCurrencyInfo, price: cryptoPrice }

        this.updateState({ ...this._state, fiatCurrencyInfo, cryptoCurrencyInfo, loading: false })
      })

    combineLatest([this.timer$])
      .pipe(
        switchMap(([_]) => {
          return new Observable<MarketDataSample[]>(observer => {
            this.getHistoricCryptoPrices(24, new Date(), 'USD', 'XTZ')
              .then((historicData: MarketDataSample[]) => {
                observer.next(historicData)
              })
              // tslint:disable-next-line:no-console
              .catch(console.error)
          })
        })
      )
      .subscribe((historicData: MarketDataSample[]) => {
        this.updateState({ ...this._state, historicData, loading: false })
      })

    combineLatest([fiatCurrencyInfo$, historicData$, this.timer$])
      .pipe(
        switchMap(([fiatCurrencyInfo, historicData, _]) => {
          return new Observable<number>(observer => {
            observer.next(this.getGrowthPercentage(fiatCurrencyInfo.price, historicData))
          })
        })
      )
      .subscribe((percentage: number) => {
        this.updateState({ ...this._state, percentage, loading: false })
      })

    // this.updateCurrency('$', 'USD')
    // this.updateBitcoin('Ƀ', 'BTC')
  }

  public updateFiatCurrency(symbol: string, currency: string) {
    const currencyInfo = { ...this._state.fiatCurrencyInfo, symbol, currency }
    this.updateState({ ...this._state, fiatCurrencyInfo: currencyInfo, loading: true })
  }

  public updateCryptoCurrency(symbol: string, currency: string) {
    const cryptoCurrencyInfo = { ...this._state.cryptoCurrencyInfo, symbol, currency }
    this.updateState({ ...this._state, cryptoCurrencyInfo, loading: true })
  }

  public getCryptoPrices(protocolIdentifier: string, baseSymbols = ['USD', 'BTC']): Promise<{ [key: string]: number }> {
    return cryptocompare.price(protocolIdentifier.toUpperCase(), baseSymbols)
  }

  public getGrowthPercentage(priceNow: BigNumber, startingPrice: MarketDataSample[]): number | undefined {
    if (startingPrice.length > 0) {
      if (!startingPrice[0].open) {
        // tslint:disable-next-line:no-console
        console.log('startingPrice NULL')

        return 0
      } else if (!priceNow) {
        // tslint:disable-next-line:no-console
        console.log('priceNow NULL')

        return 0
      }
      if (priceNow && startingPrice) {
        return priceNow
          .minus(startingPrice[0].open)
          .multipliedBy(100)
          .dividedBy(startingPrice[0].open)
          .toNumber()
      }
    }

    return 0
  }

  public async getHistoricCryptoPrices(
    numberOfHours: number,
    date: Date,
    baseSymbol = 'USD',
    protocolIdentifier = 'XTZ'
  ): Promise<MarketDataSample[]> {
    const result = await cryptocompare.histoHour(protocolIdentifier, baseSymbol, {
      limit: numberOfHours - 1,
      timestamp: date
    })

    return result
  }
}
