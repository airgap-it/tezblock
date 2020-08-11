import { Component, Input, OnInit } from '@angular/core'
import { BehaviorSubject, combineLatest, forkJoin, Observable, of } from 'rxjs'
import { map, switchMap, take } from 'rxjs/operators'
import BigNumber from 'bignumber.js'
import { Store } from '@ngrx/store'

import * as fromRoot from '@tezblock/reducers'
import { get } from '@tezblock/services/fp'
import { isConvertableToUSD } from '@tezblock/domain/airgap'
import { CryptoPricesService } from '@tezblock/services/crypto-prices/crypto-prices.service'
import { CurrencyConverterPipe } from '@tezblock/pipes/currency-converter/currency-converter.pipe'
import { getPrecision } from '@tezblock/components/tezblock-table/amount-cell/amount-cell.component'
import { Transaction } from '@tezblock/interfaces/Transaction'

export interface Asset {
  value: string | number | BigNumber
  symbol: string
}

export const transactionToAsset = (transaction: Transaction): Asset => ({ symbol: transaction.symbol, value: transaction.amount })

@Component({
  selector: 'app-assets-value',
  templateUrl: './assets-value.component.html',
  styleUrls: ['./assets-value.component.scss']
})
export class AssetsValueComponent implements OnInit {
  @Input()
  set assets(value: Asset[]) {
    if (value !== this._assets) {
      this._assets = value
      this.assets$.next(value)
    }
  }

  @Input() useHeader: boolean

  value$: Observable<number>
  count$: Observable<number>
  getPrecision = getPrecision

  private _assets: Asset[]

  private assets$ = new BehaviorSubject<Asset[]>(undefined)

  constructor(
    private readonly cryptoPricesService: CryptoPricesService,
    private readonly currencyConverterPipe: CurrencyConverterPipe,
    private readonly store$: Store<fromRoot.State>
  ) {}

  ngOnInit() {
    this.count$ = this.assets$.pipe(
      map(assets => (Array.isArray(assets) ? assets.filter(asset => isConvertableToUSD(asset.symbol)).length : 0))
    )

    this.value$ = combineLatest(
      this.assets$,
      this.store$.select(state => state.app.exchangeRates)
    ).pipe(
      map(([assets]) => assets),
      switchMap(assets =>
        get<Asset[]>(_assets => _assets.length > 0)(assets)
          ? forkJoin(
              assets.map(asset =>
                isConvertableToUSD(asset.symbol) ? this.cryptoPricesService.getCurrencyConverterArgs(asset.symbol).pipe(take(1)) : of(null)
              )
            ).pipe(
              map(currencyConverterArgs =>
                currencyConverterArgs
                  .map((currencyConverterArg, index) =>
                    currencyConverterArg ? this.currencyConverterPipe.transform(assets[index].value, currencyConverterArg) : 0
                  )
                  .reduce((accumulator, currentItem) => accumulator + currentItem, 0)
              )
            )
          : of(0)
      )
    )
  }
}
