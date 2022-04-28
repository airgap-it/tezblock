import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { from, of, forkJoin } from 'rxjs';
import {
  map,
  catchError,
  filter,
  switchMap,
  take,
  tap,
  withLatestFrom,
} from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { get, isNil, negate } from 'lodash';

import { TransactionService } from '@tezblock/services/transaction/transaction.service';
import { BakingService } from '@tezblock/services/baking/baking.service';
import * as actions from './actions';
import { RewardService } from '@tezblock/services/reward/reward.service';
import { ApiService } from '@tezblock/services/api/api.service';
import { AccountService } from '@tezblock/services/account/account.service';
import {
  CurrentCycleState,
  CacheService,
  CacheKeys,
} from '@tezblock/services/cache/cache.service';
import { flatten } from '@tezblock/services/fp';
import * as fromRoot from '@tezblock/reducers';
import * as fromReducer from './reducer';
import { aggregateOperationCounts } from '@tezblock/domain/tab';
import {
  getTokenContracts,
  fillTransferOperations,
} from '@tezblock/domain/contract';
import { ChainNetworkService } from '@tezblock/services/chain-network/chain-network.service';
import { ContractService } from '@tezblock/services/contract/contract.service';
import { BakingRatingResponse } from './model';
import { OperationTypes } from '@tezblock/domain/operations';
import {
  CollectiblesService,
  DEFAULT_COLLECTIBLES_LIMIT,
} from '@tezblock/services/collectibles/collectibles.service';
import BigNumber from 'bignumber.js';

@Injectable()
export class AccountDetailEffects {
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

  onLoadAccountLoadDelegation$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadAccount),
      map(() => actions.loadDelegation())
    )
  );

  loadDelegation$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadDelegation),
      withLatestFrom(
        this.store$.select((state) => state.accountDetails.address)
      ),
      switchMap(([action, address]) =>
        this.accountService.getDelegatedAccounts(address).pipe(
          map((accounts) =>
            actions.loadDelegatedAccountsSucceeded({ accounts })
          ),
          catchError((error) =>
            of(actions.loadDelegatedAccountsFailed({ error }))
          )
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
        this.store$.select(
          (state) => state.accountDetails.collectibles.pagination
        ),
        this.store$.select((state) => state.accountDetails.address)
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
      withLatestFrom(
        this.store$.select((state) => state.accountDetails.address)
      ),
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

  getRewardAmount$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadRewardAmont),
      switchMap((action) =>
        this.rewardService
          .getRewardAmount(action.accountAddress, action.bakerAddress)
          .pipe(
            map((rewardAmount) =>
              actions.loadRewardAmontSucceeded({ rewardAmount })
            ),
            catchError((error) => of(actions.loadRewardAmontFailed({ error })))
          )
      )
    )
  );

  getTransactions$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadTransactionsByKind),
      filter(({ kind }) => kind !== 'assets' && kind !== 'collectibles'),
      withLatestFrom(
        this.store$.select(
          (state) => state.accountDetails.transactions.pagination
        ),
        this.store$.select((state) => state.accountDetails.address),
        this.store$.select((state) => state.accountDetails.transactions.orderBy)
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
      withLatestFrom(this.store$.select((state) => state.accountDetails.kind)),
      map(([action, kind]) => actions.loadTransactionsByKind({ kind }))
    )
  );

  onSorting$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.sortTransactionsByKind),
      withLatestFrom(this.store$.select((state) => state.accountDetails.kind)),
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
      withLatestFrom(
        this.store$.select((state) => state.accountDetails.address)
      ),
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

  loadBalanceForLast30Days$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadBalanceForLast30Days),
      switchMap(({ address }) =>
        this.apiService.getBalanceForLast30Days(address).pipe(
          map((balanceFromLast30Days) => {
            if (balanceFromLast30Days[0].balance === null) {
              return actions.loadExtraBalance({
                temporaryBalance: balanceFromLast30Days,
              });
            } else {
              return actions.loadBalanceForLast30DaysSucceeded({
                balanceFromLast30Days,
              });
            }
          }),
          catchError((error) =>
            of(actions.loadBalanceForLast30DaysFailed({ error }))
          )
        )
      )
    )
  );

  loadExtraBalance$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadExtraBalance),
      withLatestFrom(
        this.store$.select((state) => state.accountDetails.address),
        this.store$.select((state) => state.accountDetails.temporaryBalance)
      ),
      switchMap(([action, accountAddress, temporaryBalance]) => {
        return this.apiService
          .getEarlierBalance(accountAddress, temporaryBalance)
          .pipe(
            map((extraBalance) => {
              return actions.loadExtraBalanceSucceeded({ extraBalance });
            }),
            catchError((error) =>
              of(actions.loadBalanceForLast30DaysFailed({ error }))
            )
          );
      })
    )
  );

  loadBakingBadRatings$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadBakingBadRatings),
      withLatestFrom(this.store$.select((state) => state.accountDetails)),
      switchMap(([{ address }, state]) =>
        this.cacheService.get(CacheKeys.fromCurrentCycle).pipe(
          switchMap((currentCycleCache) => {
            const bakingBadRating = get(
              currentCycleCache,
              `fromAddress[${address}].bakerData.bakingBadRating`
            );
            const stakingCapacity = get(
              currentCycleCache,
              `fromAddress[${address}].bakerData.stakingCapacity`
            );
            const tezosBakerFee = get(
              currentCycleCache,
              `fromAddress[${address}].tezosBakerFee`
            );

            // bug was reported so now I compare to undefined OR null, not only undefined
            if (bakingBadRating && tezosBakerFee && stakingCapacity) {
              return of(<BakingRatingResponse>{
                bakingRating: bakingBadRating,
                tezosBakerFee,
                stakingCapacity,
              });
            }

            return this.bakingService
              .getBakingBadRatings(address)
              .pipe(
                map((response) =>
                  fromReducer.fromBakingBadResponse(response, state)
                )
              );
          }),
          map((response) =>
            actions.loadBakingBadRatingsSucceeded({ response })
          ),
          catchError((error) =>
            of(actions.loadBakingBadRatingsFailed({ error }))
          )
        )
      )
    )
  );

  cacheBakingBadRatings$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(actions.loadBakingBadRatingsSucceeded),
        withLatestFrom(this.store$.select((state) => state.accountDetails)),
        tap(([action, state]) =>
          this.cacheService.update<CurrentCycleState>(
            CacheKeys.fromCurrentCycle,
            (currentCycleCache) => ({
              ...currentCycleCache,
              fromAddress: {
                ...get(currentCycleCache, 'fromAddress'),
                [state.address]: {
                  ...get(currentCycleCache, `fromAddress[${state.address}]`),
                  bakerData: {
                    ...get(
                      currentCycleCache,
                      `fromAddress[${state.address}].bakerData`
                    ),
                    bakingBadRating: state.bakerTableRatings.bakingBadRating,
                    stakingCapacity: state.bakerTableRatings.stakingCapacity,
                  },
                  tezosBakerFee: state.tezosBakerFee,
                },
              },
            })
          )
        )
      ),
    { dispatch: false }
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

  onBakerLoadBakerReward$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadAccountSucceeded),
      filter(({ account }) => account.is_baker),
      map(({ account }) =>
        actions.loadBakerReward({ bakerAddress: account.account_id })
      )
    )
  );

  loadBakerReward$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadBakerReward),
      switchMap(({ bakerAddress }) =>
        this.store$.select(fromRoot.app.currentCycle).pipe(
          filter(negate(isNil)),
          take(1),
          switchMap((currentCycle) =>
            this.rewardService
              .getRewardsForAddressInCycle(bakerAddress, ++currentCycle)
              .pipe(
                map((bakerReward) =>
                  actions.loadBakerRewardSucceeded({ bakerReward })
                ),
                catchError((error) =>
                  of(actions.loadBakerRewardFailed({ error }))
                )
              )
          )
        )
      )
    )
  );

  onLoadAccountLoadContractAssets$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadAccount),
      withLatestFrom(
        this.store$.select((state) => state.accountDetails.contractAssets.data)
      ),
      filter(([action, contractAssets]) => contractAssets === undefined),
      map(() => actions.loadContractAssets())
    )
  );

  loadContractAssets$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadContractAssets),
      withLatestFrom(
        this.store$.select((state) => state.accountDetails.address)
      ),
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

  onBakingBadRatingsEmptyLoadStakingCapacityFromTezosProtocol$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(actions.loadBakingBadRatingsSucceeded),
        filter(({ response }) => !response.stakingCapacity),
        map(() => actions.loadStakingCapacityFromTezosProtocol())
      )
  );

  loadStakingCapacityFromTezosProtocol$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadStakingCapacityFromTezosProtocol),
      withLatestFrom(
        this.store$.select((state) => state.accountDetails.address)
      ),
      switchMap(([action, address]) =>
        this.bakingService.getStakingCapacityFromTezosProtocol(address).pipe(
          map((stakingCapacity) =>
            actions.loadStakingCapacityFromTezosProtocolSucceeded({
              stakingCapacity,
            })
          ),
          catchError((error) =>
            of(actions.loadStakingCapacityFromTezosProtocolFailed({ error }))
          )
        )
      )
    )
  );

  constructor(
    private readonly accountService: AccountService,
    private readonly collectiblesService: CollectiblesService,
    private readonly actions$: Actions,
    private readonly apiService: ApiService,
    private readonly bakingService: BakingService,
    private readonly cacheService: CacheService,
    private readonly chainNetworkService: ChainNetworkService,
    private readonly contractService: ContractService,
    private readonly rewardService: RewardService,
    private readonly store$: Store<fromRoot.State>,
    private readonly transactionService: TransactionService
  ) {}
}
