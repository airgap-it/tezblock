import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import * as fromRoot from '@tezblock/reducers';
import * as actions from './actions';
import {
  Collectible,
  CollectibleCursor,
} from '@tezblock/services/collectibles/collectibles.types';
import { combineLatest, Observable, Subject } from 'rxjs';
import { filter, switchMap, takeUntil, withLatestFrom } from 'rxjs/operators';
import { Tab, updateTabCounts } from '@tezblock/domain/tab';
import { TranslateService } from '@ngx-translate/core';
import { IconPipe } from '@tezblock/pipes/icon/icon.pipe';
import { columns } from './table-definitions';
import { OperationTypes } from '@tezblock/domain/operations';
import { OrderBy } from '@tezblock/services/base.service';
import { getRefresh } from '@tezblock/domain/synchronization';
import { Actions, ofType } from '@ngrx/effects';
import { BeaconEnabledComponent } from '@tezblock/components/beacon-enabled-component';

@Component({
  selector: 'app-portfolio',
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.scss'],
})
export class PortfolioComponent
  extends BeaconEnabledComponent
  implements OnInit, OnDestroy
{
  tabs: Tab[];
  collectibleCursor$: Observable<CollectibleCursor<Collectible>[]>;
  transactions$: Observable<any[]>;
  portfolioValue$: Observable<string>;
  orderBy$: Observable<OrderBy>;
  areTransactionsLoading$: Observable<boolean>;

  private readonly ngDestroyed$: Subject<void> = new Subject();

  constructor(
    protected readonly store$: Store<fromRoot.State>,
    private translateService: TranslateService,
    private readonly iconPipe: IconPipe,
    private readonly actions$: Actions
  ) {
    super(store$);
  }

  ngOnInit(): void {
    super.ngOnInit();

    this.collectibleCursor$ = this.store$.select(
      (state) => state.portfolio.collectibles.data
    );
    this.connectedWallet$
      .pipe(takeUntil(this.ngDestroyed$))
      .subscribe((connectedWallet) => {
        if (connectedWallet) {
          this.store$.dispatch(actions.reset());
          this.store$.dispatch(
            actions.loadAccount({
              address: connectedWallet.address,
            })
          );
        }
      });

    const pageId = '';
    this.tabs = [
      {
        title: 'Assets',
        active: true,
        kind: 'assets',
        count: undefined,
        icon: this.iconPipe.transform('coins'),
        columns: columns[OperationTypes.PortfolioAssets](
          { pageId, showFiatValue: true },
          this.translateService
        ),
        disabled: function () {
          return !this.count;
        },
      },
      {
        title: this.translateService.instant(
          'tabbed-table.account-detail.transactions'
        ),
        active: false,
        kind: 'transaction',
        count: undefined,
        icon: this.iconPipe.transform('exchangeAlt'),
        columns: columns[OperationTypes.Transaction](
          { pageId, showFiatValue: true },
          this.translateService
        ),
        disabled: function () {
          return !this.count;
        },
      },
    ];

    this.transactions$ = this.store$
      .select((state) => state.portfolio.kind)
      .pipe(
        switchMap((kind) => {
          switch (kind) {
            case 'assets':
              return this.store$.select(
                (state) => state.portfolio.contractAssets.data
              );

            default:
              return this.store$.select(
                (state) => state.portfolio.transactions.data
              );
          }
        })
      );

    this.portfolioValue$ = this.store$.select(
      (state) => state.portfolio.portofolioValue
    );

    this.areTransactionsLoading$ = this.store$
      .select((state) => state.portfolio.kind)
      .pipe(
        switchMap((kind) =>
          kind !== 'assets'
            ? this.store$.select(
                (state) => state.portfolio.transactions.loading
              )
            : this.store$.select(
                (state) => state.portfolio.contractAssets.loading
              )
        )
      );

    combineLatest([
      this.connectedWallet$,
      getRefresh([
        this.actions$.pipe(ofType(actions.loadTransactionsByKindSucceeded)),
        this.actions$.pipe(ofType(actions.loadTransactionsByKindFailed)),
      ]),
    ])
      .pipe(
        withLatestFrom(
          this.connectedWallet$,
          this.store$.select((state) => state.portfolio.kind)
        )
      )
      .subscribe(([_action, connectedWallet, kind]) => {
        if (connectedWallet) {
          this.store$.dispatch(
            actions.loadTransactionsByKind({
              kind: kind || OperationTypes.PortfolioAssets,
            })
          );
        }
      });

    this.store$
      .select((state) => state.portfolio.counts)
      .pipe(filter((counts) => !!counts))
      .subscribe((counts) => {
        return (this.tabs = updateTabCounts(this.tabs, counts));
      });

    this.actions$
      .pipe(
        ofType(actions.loadContractAssetsSucceeded),
        takeUntil(this.ngDestroyed$)
      )
      .subscribe(() => {
        this.store$.dispatch(actions.wrapAssetsWithTez());
      });
  }

  tabSelected(kind: string) {
    if (kind !== 'assets') {
      this.store$.dispatch(actions.loadTransactionsByKind({ kind }));
      return;
    }

    this.store$.dispatch(actions.setKind({ kind }));
  }

  onLoadMore() {
    this.store$.dispatch(actions.increasePageSize());
  }

  onLoadMoreCollectibles() {
    this.store$.dispatch(actions.loadCollectibles());
  }

  sortBy(orderBy: OrderBy) {
    this.store$.dispatch(actions.sortTransactionsByKind({ orderBy }));
  }

  public ngOnDestroy(): void {
    this.ngDestroyed$.next();
    this.ngDestroyed$.complete();
  }
}
