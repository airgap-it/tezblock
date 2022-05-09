import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { Actions } from '@ngrx/effects';
import * as fromRoot from '@tezblock/reducers';
import * as actions from './actions';
import { BaseComponent } from '@tezblock/components/base.component';
import { OrderBy } from '@tezblock/services/base.service';
import { Column } from '@tezblock/components/tezblock-table/tezblock-table.component';
import { columns } from './table-definitions';
import { TranslateService } from '@ngx-translate/core';
import { Title, Meta } from '@angular/platform-browser';
import { TokenAsset } from '@tezblock/services/contract/contract.service';

@Component({
  selector: 'app-token-contract-overview',
  templateUrl: './token-contract-overview.component.html',
  styleUrls: ['./token-contract-overview.component.scss'],
})
export class TokenContractOverviewComponent
  extends BaseComponent
  implements OnInit
{
  data$: Observable<TokenAsset[]>;
  loading$: Observable<boolean>;
  showLoadMore$: Observable<boolean>;
  orderBy$: Observable<OrderBy>;
  columns: Column[];

  constructor(
    private readonly actions$: Actions,
    private readonly store$: Store<fromRoot.State>,
    private translateService: TranslateService,
    private titleService: Title,
    private metaTagService: Meta
  ) {
    super();

    this.store$.dispatch(actions.reset());
  }

  ngOnInit() {
    this.data$ = this.store$.select(
      (state) => state.tokenContractOverview.tokenAssets.data
    );

    this.loading$ = this.store$.select(
      (state) => state.tokenContractOverview.tokenAssets.loading
    );
    this.showLoadMore$ = this.store$
      .select((state) => state.tokenContractOverview.tokenAssets)
      .pipe(
        map(
          (contracts) =>
            (contracts.data || []).length < contracts.pagination.total
        )
      );
    this.orderBy$ = this.store$.select(
      (state) => state.tokenContractOverview.tokenAssets.orderBy
    );
    this.columns = columns(this.translateService);

    this.store$.dispatch(actions.loadTokenAssets());

    this.titleService.setTitle(`Tezos Assets - tezblock`);
    this.metaTagService.updateTag({
      name: 'description',
      content: `Tezos Assets. The name, contract address, total supply and description of each asset is detailed on tezblock.">`,
    });
  }

  loadMore() {
    this.store$.dispatch(actions.increasePageOfTokenContracts());
  }
}
