import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { from, of, forkJoin } from 'rxjs';
import {
  map,
  catchError,
  filter,
  switchMap,
  withLatestFrom,
} from 'rxjs/operators';
import { Store } from '@ngrx/store';

import { TransactionService } from '@tezblock/services/transaction/transaction.service';
import * as actions from './actions';
import { RewardService } from '@tezblock/services/reward/reward.service';
import { ApiService } from '@tezblock/services/api/api.service';
import { AccountService } from '@tezblock/services/account/account.service';
import { flatten } from '@tezblock/services/fp';
import * as fromRoot from '@tezblock/reducers';
import { aggregateOperationCounts } from '@tezblock/domain/tab';
import {
  getTokenContracts,
  fillTransferOperations,
} from '@tezblock/domain/contract';
import { ChainNetworkService } from '@tezblock/services/chain-network/chain-network.service';
import { ContractService } from '@tezblock/services/contract/contract.service';
import { OperationTypes } from '@tezblock/domain/operations';
import {
  CollectiblesService,
  DEFAULT_COLLECTIBLES_LIMIT,
} from '@tezblock/services/collectibles/collectibles.service';
import BigNumber from 'bignumber.js';

@Injectable()
export class PortfolioEffects {
  getAccount$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadAccount),
      switchMap(({ address }) =>
        this.accountService.getAccountById(address).pipe(
          map((account) => actions.loadAccountSucceeded({ account })),
          catchError((error) => of(actions.loadAccountFailed({ error })))
        )
      )
    )
  );

  onLoadAccountLoadCollectibles$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadAccountSucceeded),
      map(() => actions.loadCollectibles())
    )
  );

  loadCollectibles = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadCollectibles),
      withLatestFrom(
        this.store$.select((state) => state.portfolio.collectibles.pagination),
        this.store$.select((state) => state.portfolio.address)
      ),
      switchMap(([_action, pagination, address]) =>
        from(
          this.collectiblesService.getCollectibles(
            address,
            pagination.total
              ? pagination.currentPage + DEFAULT_COLLECTIBLES_LIMIT
              : DEFAULT_COLLECTIBLES_LIMIT
          )
        ).pipe(
          map((data) => actions.loadCollectiblesSucceeded({ data })),
          catchError((error) => of(actions.loadCollectiblesFailed({ error })))
        )
      )
    )
  );

  onLoadAccountLoadCollectiblesCount$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadAccountSucceeded),
      map(() => actions.loadCollectiblesCount())
    )
  );

  loadCollectiblesCount = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadCollectiblesCount),
      withLatestFrom(this.store$.select((state) => state.portfolio.address)),
      switchMap(([_action, address]) =>
        from(this.collectiblesService.getCollectiblesCount(address)).pipe(
          map((data) => actions.loadCollectiblesCountSucceeded({ data })),
          catchError((error) =>
            of(actions.loadCollectiblesCountFailed({ error }))
          )
        )
      )
    )
  );

  getTransactions$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadTransactionsByKind),
      filter(({ kind }) => kind !== 'assets' && kind !== 'collectibles'),
      withLatestFrom(
        this.store$.select((state) => state.portfolio.transactions.pagination),
        this.store$.select((state) => state.portfolio.address),
        this.store$.select((state) => state.portfolio.transactions.orderBy)
      ),
      switchMap(([{ kind }, pagination, address, orderBy]) =>
        this.transactionService
          .getAllTransactionsByAddress(
            address,
            kind,
            pagination.currentPage * pagination.selectedSize,
            orderBy,
            getTokenContracts(this.chainNetworkService.getNetwork()).data
          )
          .pipe(
            switchMap((data) =>
              kind === OperationTypes.Transaction
                ? from(fillTransferOperations(data, this.chainNetworkService))
                : of(data)
            ),
            map((data) =>
              kind === OperationTypes.Transaction
                ? data.filter(
                    (transaction) =>
                      transaction.source === address ||
                      transaction.destination === address
                  )
                : data
            ),
            map((data) => actions.loadTransactionsByKindSucceeded({ data })),
            catchError((error) =>
              of(actions.loadTransactionsByKindFailed({ error }))
            )
          )
      )
    )
  );

  onPaging$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.increasePageSize),
      withLatestFrom(this.store$.select((state) => state.portfolio.kind)),
      map(([action, kind]) => actions.loadTransactionsByKind({ kind }))
    )
  );

  onSorting$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.sortTransactionsByKind),
      withLatestFrom(this.store$.select((state) => state.portfolio.kind)),
      map(([action, kind]) => actions.loadTransactionsByKind({ kind }))
    )
  );

  onLoadTransactionLoadCounts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadTransactionsByKind),
      map(() => actions.loadTransactionsCounts())
    )
  );

  loadTransactionsCounts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadTransactionsCounts),
      withLatestFrom(this.store$.select((state) => state.portfolio.address)),
      switchMap(([action, address]) =>
        forkJoin([
          this.apiService.getOperationCount('source', address),
          this.apiService.getOperationCount('destination', address),
          this.apiService.getTokenTransferCount(
            address,
            getTokenContracts(this.chainNetworkService.getNetwork()).data
          ),
          this.apiService
            .getOperationCount('delegate', address)
            .pipe(
              map((counts) =>
                counts.map((count) =>
                  count.kind === 'origination'
                    ? { ...count, kind: 'delegation' }
                    : count
                )
              )
            ),
        ]).pipe(
          map(flatten),
          map(aggregateOperationCounts),
          map((counts) => actions.loadTransactionsCountsSucceeded({ counts })),
          catchError((error) =>
            of(actions.loadTransactionsCountsFailed({ error }))
          )
        )
      )
    )
  );

  onLoadTransactionsSucceededLoadErrors$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadTransactionsByKindSucceeded),
      filter(({ data }) =>
        data.some((transaction) => transaction.status !== 'applied')
      ),
      map(({ data }) => actions.loadTransactionsErrors({ transactions: data }))
    )
  );

  loadTransactionsErrors$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadTransactionsErrors),
      switchMap(({ transactions }) =>
        this.apiService.getErrorsForOperations(transactions).pipe(
          map((operationErrorsById) =>
            actions.loadTransactionsErrorsSucceeded({ operationErrorsById })
          ),
          catchError((error) =>
            of(actions.loadTransactionsErrorsFailed({ error }))
          )
        )
      )
    )
  );

  onLoadAccountLoadContractAssets$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadAccount),
      withLatestFrom(
        this.store$.select((state) => state.portfolio.contractAssets.data)
      ),
      filter(([action, contractAssets]) => contractAssets === undefined),
      map(() => actions.loadContractAssets())
    )
  );

  loadContractAssets$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadContractAssets),
      withLatestFrom(this.store$.select((state) => state.portfolio.address)),
      switchMap(([action, address]) =>
        this.contractService.fetchTokensByAddress(address).pipe(
          map((data) =>
            data.filter(
              (item) =>
                new BigNumber(item.amount).gt(0) && item.contract !== undefined
            )
          ),
          map((data) => actions.loadContractAssetsSucceeded({ data })),
          catchError((error) => of(actions.loadContractAssetsFailed({ error })))
        )
      )
    )
  );

  wrapAssetsWithTez$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.wrapAssetsWithTez),
      withLatestFrom(
        this.store$.select((state) => state.portfolio.contractAssets.data),
        this.store$.select((state) => state.portfolio.account),
        this.store$.select((state) => state.app.fiatCurrencyInfo)
      ),
      switchMap(([action, assets, account, fiatCurrencyInfo]) =>
        this.contractService
          .wrapAssetsWithTez(assets, account, fiatCurrencyInfo.price)
          .pipe(
            map((data) =>
              data.filter(
                (item) =>
                  new BigNumber(item.amount).gt(0) &&
                  item.contract !== undefined
              )
            ),
            map((data) => actions.wrapAssetsWithTezSucceeded({ data })),
            catchError((error) =>
              of(actions.wrapAssetsWithTezFailed({ error }))
            )
          )
      )
    )
  );

  loadPortfolioValue$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.wrapAssetsWithTezSucceeded),
      withLatestFrom(
        this.store$.select((state) => state.portfolio.contractAssets.data)
      ),
      switchMap(([action, contractAssets]) => {
        return this.contractService
          .calculatePortfolioValue(contractAssets)
          .pipe(
            map((data) => actions.loadPortfolioValueSucceeded({ data })),
            catchError((error) =>
              of(actions.loadPortfolioValueFailed({ error }))
            )
          );
      })
    )
  );

  constructor(
    private readonly accountService: AccountService,
    private readonly collectiblesService: CollectiblesService,
    private readonly actions$: Actions,
    private readonly apiService: ApiService,
    private readonly chainNetworkService: ChainNetworkService,
    private readonly contractService: ContractService,
    private readonly rewardService: RewardService,
    private readonly store$: Store<fromRoot.State>,
    private readonly transactionService: TransactionService
  ) {}
}
