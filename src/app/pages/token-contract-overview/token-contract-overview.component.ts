import { Component, OnInit } from '@angular/core'
import { Observable } from 'rxjs'
import { filter, map, switchMap } from 'rxjs/operators'
import { Store } from '@ngrx/store'
import { Actions, ofType } from '@ngrx/effects'

import * as fromRoot from '@tezblock/reducers'
import * as actions from './actions'
import * as appActions from '@tezblock/app.actions'
import { BaseComponent } from '@tezblock/components/base.component'
import { TokenContract } from '@tezblock/domain/contract'
import { OrderBy } from '@tezblock/services/base.service'
import { Column } from '@tezblock/components/tezblock-table/tezblock-table.component'
import { columns } from './table-definitions'
import { getRefresh } from '@tezblock/domain/synchronization'
import { Title, Meta } from '@angular/platform-browser'

@Component({
  selector: 'app-token-contract-overview',
  templateUrl: './token-contract-overview.component.html',
  styleUrls: ['./token-contract-overview.component.scss']
})
export class TokenContractOverviewComponent extends BaseComponent implements OnInit {
  data$: Observable<TokenContract[]>
  loading$: Observable<boolean>
  showLoadMore$: Observable<boolean>
  orderBy$: Observable<OrderBy>
  columns: Column[]

  constructor(
    private readonly actions$: Actions,
    private readonly store$: Store<fromRoot.State>,
    private titleService: Title,
    private metaTagService: Meta
  ) {
    super()

    this.store$.dispatch(actions.reset())
  }

  ngOnInit() {
    this.data$ = this.store$.select(state => state.tokenContractOveview.tokenContracts.data)
    this.loading$ = this.store$.select(state => state.tokenContractOveview.tokenContracts.loading)
    this.showLoadMore$ = this.store$
      .select(state => state.tokenContractOveview.tokenContracts)
      .pipe(map(contracts => (contracts.data || []).length < contracts.pagination.total))
    this.orderBy$ = this.store$.select(state => state.tokenContractOveview.tokenContracts.orderBy)
    this.columns = columns()

    this.store$.dispatch(actions.loadTokenContracts())

    this.subscriptions.push(
      this.data$
        .pipe(
          filter(data => Array.isArray(data) && data.some(item => ['tzBTC', 'BTC'].includes(item.symbol))),
          switchMap(() =>
            getRefresh([
              this.actions$.pipe(ofType(appActions.loadExchangeRateSucceeded)),
              this.actions$.pipe(ofType(appActions.loadExchangeRateFailed))
            ])
          )
        )
        .subscribe(() => this.store$.dispatch(appActions.loadExchangeRate({ from: 'BTC', to: 'USD' })))
    )

    this.titleService.setTitle(`Tezos Assets - tezblock`)
    this.metaTagService.updateTag({
      name: 'description',
      content: `Tezos Assets. The name, contract address, total supply and description of each asset is detailed on tezblock.">`
    })
  }

  loadMore() {
    this.store$.dispatch(actions.increasePageOfTokenContracts())
  }
}
