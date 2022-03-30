import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { forkJoin, of } from 'rxjs';
import {
  map,
  catchError,
  switchMap,
  tap,
  withLatestFrom,
  delay,
  filter,
} from 'rxjs/operators';
import { Store } from '@ngrx/store';
import * as moment from 'moment';
import { isNil, negate } from 'lodash';

import * as actions from './actions';
import { ApiService } from '@tezblock/services/api/api.service';
import * as fromRoot from '@tezblock/reducers';
import { OperationTypes } from '@tezblock/domain/operations';
import { BakingService } from '@tezblock/services/baking/baking.service';
import { BaseService, Body, Operation } from '@tezblock/services/base.service';
import { first } from '@tezblock/services/fp';
import {
  CurrentCycleState,
  CacheService,
  CacheKeys,
} from '@tezblock/services/cache/cache.service';
import { get } from 'lodash';
import { RewardService } from '@tezblock/services/reward/reward.service';
import { TransactionService } from '@tezblock/services/transaction/transaction.service';

@Injectable()
export class BakerTableEffects {
  paging$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.increaseRightsPageSize),
      withLatestFrom(this.store$.select((state) => state.bakerTable.kind)),
      map(([action, kind]) =>
        kind === OperationTypes.BakingRights
          ? actions.loadBakingRights()
          : actions.loadEndorsingRights()
      )
    )
  );

  getBakingRights$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadBakingRights),
      withLatestFrom(
        this.store$.select((state) => state.bakerTable.accountAddress),
        this.store$.select((state) => state.bakerTable.bakingRights.pagination)
      ),
      switchMap(([, accountAddress, pagination]) =>
        this.apiService
          .getAggregatedBakingRights(
            accountAddress,
            pagination.selectedSize * pagination.currentPage
          )
          .pipe(
            map((bakingRights) =>
              actions.loadBakingRightsSucceeded({ bakingRights })
            ),
            catchError((error) => of(actions.loadBakingRightsFailed({ error })))
          )
      )
    )
  );

  getEndorsingRights$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadEndorsingRights),
      withLatestFrom(
        this.store$.select((state) => state.bakerTable.accountAddress),
        this.store$.select(
          (state) => state.bakerTable.endorsingRights.pagination
        )
      ),
      switchMap(([action, accountAddress, pagination]) =>
        this.apiService
          .getAggregatedEndorsingRights(
            accountAddress,
            pagination.selectedSize * pagination.currentPage
          )
          .pipe(
            map((endorsingRights) =>
              actions.loadEndorsingRightsSucceeded({ endorsingRights })
            ),
            catchError((error) =>
              of(actions.loadEndorsingRightsFailed({ error }))
            )
          )
      )
    )
  );

  loadCurrentCycleThenRights$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadCurrentCycleThenRights),
      switchMap(() =>
        this.store$.select(fromRoot.app.currentCycle).pipe(
          filter(negate(isNil)),
          map((currentCycle) =>
            actions.loadCurrentCycleThenRightsSucceeded({ currentCycle })
          ),
          catchError((error) => of(actions.loadBakingRightsFailed({ error })))
        )
      )
    )
  );

  // onCurrentCycleLoadRights$ = createEffect(() =>
  //   this.actions$.pipe(
  //     ofType(
  //       actions.loadCurrentCycleThenRightsSucceeded,
  //       actions.loadCurrentCycleThenRightsFailed
  //     ),
  //     switchMap(() => [
  //       actions.loadBakingRights(),
  //       actions.loadEndorsingRights(),
  //     ])
  //   )
  // );

  loadEfficiencyLast10Cycles$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadEfficiencyLast10Cycles),
      withLatestFrom(
        this.store$.select((state) => state.bakerTable.accountAddress)
      ),
      switchMap(([action, accountAddress]) =>
        this.cacheService.get(CacheKeys.fromCurrentCycle).pipe(
          switchMap((currentCycleCache) => {
            const efficiencyLast10Cycles = get(
              currentCycleCache,
              `fromAddress[${accountAddress}].bakerData.efficiencyLast10Cycles`
            );

            if (efficiencyLast10Cycles !== undefined) {
              return of(efficiencyLast10Cycles);
            }

            return this.bakingService.getEfficiencyLast10Cycles(accountAddress);
          }),
          map((efficiencyLast10Cycles) =>
            actions.loadEfficiencyLast10CyclesSucceeded({
              efficiencyLast10Cycles,
            })
          ),
          catchError((error) =>
            of(actions.loadEfficiencyLast10CyclesFailed({ error }))
          )
        )
      )
    )
  );

  cachEfficiencyLast10Cycles$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(actions.loadEfficiencyLast10CyclesSucceeded),
        withLatestFrom(
          this.store$.select((state) => state.bakerTable.accountAddress)
        ),
        tap(([{ efficiencyLast10Cycles }, accountAddress]) =>
          this.cacheService.update<CurrentCycleState>(
            CacheKeys.fromCurrentCycle,
            (currentCycleCache) => ({
              ...currentCycleCache,
              fromAddress: {
                ...get(currentCycleCache, 'fromAddress'),
                [accountAddress]: {
                  ...get(currentCycleCache, `fromAddress[${accountAddress}]`),
                  bakerData: {
                    ...get(
                      currentCycleCache,
                      `fromAddress[${accountAddress}].bakerData`
                    ),
                    efficiencyLast10Cycles: efficiencyLast10Cycles,
                  },
                },
              },
            })
          )
        )
      ),
    { dispatch: false }
  );

  loadUpcomingRights$ = createEffect(() => {
    const body = (
      address: string,
      /*blockLevel: number,*/ endorsing?: boolean
    ): Body => ({
      fields: ['estimated_time', 'block_level'],
      predicates: [
        {
          field: 'estimated_time',
          operation: Operation.after,
          set: [moment.utc().valueOf()],
          inverse: false,
        },
        //{ field: 'level', operation: 'gt', set: [blockLevel], inverse: false },
        {
          field: 'delegate',
          operation: Operation.eq,
          set: [address],
          inverse: false,
        },
      ].concat(
        endorsing
          ? []
          : {
              field: 'priority',
              operation: Operation.eq,
              set: ['0'],
              inverse: false,
            }
      ),
      orderBy: [{ field: 'estimated_time', direction: 'asc' }],
      limit: 1,
    });

    return this.actions$.pipe(
      ofType(actions.loadUpcomingRights),
      withLatestFrom(
        this.store$.select((state) => state.accountDetails.address)
      ),
      switchMap(([action, accountAddress]) =>
        forkJoin([
          this.baseService
            .post<any>('baking_rights', body(accountAddress))
            .pipe(map(first)),
          this.baseService
            .post<any>('endorsing_rights', body(accountAddress, true))
            .pipe(map(first)),
        ]).pipe(
          map(([baking, endorsing]: [any, any]) =>
            actions.loadUpcomingRightsSucceeded({
              upcomingRights: {
                baking: baking || null,
                endorsing: endorsing || null,
              },
            })
          ),
          catchError((error) => of(actions.loadUpcomingRightsFailed({ error })))
        )
      )
    );
  });

  loadUpcomingRightsRefresh$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadUpcomingRightsSucceeded),
      filter(
        ({ upcomingRights }) =>
          !!upcomingRights.baking && !!upcomingRights.endorsing
      ),
      switchMap(({ upcomingRights }) => {
        const nextChange = Math.min(
          upcomingRights.baking.estimated_time,
          upcomingRights.endorsing.estimated_time
        );
        const changeInMilliseconds = moment
          .utc(nextChange)
          .diff(moment.utc(), 'milliseconds');

        return of(null).pipe(
          delay(changeInMilliseconds),
          map(() => actions.loadUpcomingRights())
        );
      })
    )
  );

  loadActiveDelegations$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadActiveDelegations),
      withLatestFrom(
        this.store$.select((state) => state.accountDetails.address)
      ),
      switchMap(([action, accountAddress]) =>
        this.apiService.getDelegatedAccountsList(accountAddress).pipe(
          map((activeDelegations) =>
            actions.loadActiveDelegationsSucceeded({
              activeDelegations: activeDelegations.length,
            })
          ),
          catchError((error) =>
            of(actions.loadActiveDelegationsFailed({ error }))
          )
        )
      )
    )
  );

  loadRewards$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadRewards),
      withLatestFrom(
        this.store$.select((state) => state.bakerTable.accountAddress),
        this.store$.select((state) => state.bakerTable.rewards.pagination)
      ),
      switchMap(([action, accountAddress, pagination]) =>
        this.rewardService.getRewards(accountAddress, pagination).pipe(
          map((rewards) => actions.loadRewardsSucceeded({ rewards })),
          catchError((error) => of(actions.loadRewardsFailed({ error })))
        )
      )
    )
  );

  onPagingLoadRewards$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.increaseRewardsPageSize),
      map(() => actions.loadRewards())
    )
  );

  loadVotes$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadVotes),
      withLatestFrom(
        this.store$.select((state) => state.bakerTable.votes.pagination),
        this.store$.select((state) => state.bakerTable.accountAddress),
        this.store$.select((state) => state.bakerTable.votes.orderBy)
      ),
      switchMap(([action, pagination, address, orderBy]) =>
        this.transactionService
          .getAllTransactionsByAddress(
            address,
            'ballot',
            pagination.currentPage * pagination.selectedSize,
            orderBy
          )
          .pipe(
            map((data) => actions.loadVotesSucceeded({ data })),
            catchError((error) => of(actions.loadVotesFailed({ error })))
          )
      )
    )
  );

  onPagingLoadVotes$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.increaseVotesPageSize),
      map(() => actions.loadVotes())
    )
  );

  loadBakerReward$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadBakerReward),
      withLatestFrom(
        this.store$.select((state) => state.bakerTable.bakerReward)
      ),
      filter(
        ([{ baker, cycle }, bakerReward]) => bakerReward[cycle] === undefined
      ),
      switchMap(([{ baker, cycle }]) =>
        this.rewardService.getRewardsForAddressInCycle(baker, cycle).pipe(
          map((bakerReward) =>
            actions.loadBakerRewardSucceeded({ cycle, bakerReward })
          ),
          catchError((error) =>
            of(actions.loadBakerRewardFailed({ cycle, error }))
          )
        )
      )
    )
  );

  loadEndorsingRightItems$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadEndorsingRightItems),
      withLatestFrom(
        this.store$.select((state) => state.bakerTable.endorsingRightItems)
      ),
      filter(
        ([{ baker, cycle, endorsingRewardsDetails }, endorsingRightItems]) =>
          endorsingRightItems[cycle] === undefined
      ),
      switchMap(([{ baker, cycle, endorsingRewardsDetails }]) =>
        this.apiService
          .getEndorsingRightItems(baker, cycle, endorsingRewardsDetails)
          .pipe(
            map((endorsingRightItems) =>
              actions.loadEndorsingRightItemsSucceeded({
                cycle,
                endorsingRightItems,
              })
            ),
            catchError((error) =>
              of(actions.loadEndorsingRightItemsFailed({ cycle, error }))
            )
          )
      )
    )
  );

  loadBakingRightItems$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadBakingRightItems),
      withLatestFrom(
        this.store$.select((state) => state.bakerTable.bakingRightItems)
      ),
      filter(
        ([{ baker, cycle, bakingRewardsDetails }, bakingRightItems]) =>
          bakingRightItems[cycle] === undefined
      ),
      switchMap(([{ baker, cycle, bakingRewardsDetails }]) =>
        this.apiService
          .getBakingRightsItems(baker, cycle, bakingRewardsDetails)
          .pipe(
            map((bakingRightItems) =>
              actions.loadBakingRightItemsSucceeded({ cycle, bakingRightItems })
            ),
            catchError((error) =>
              of(actions.loadBakingRightItemsFailed({ cycle, error }))
            )
          )
      )
    )
  );

  constructor(
    private readonly actions$: Actions,
    private readonly apiService: ApiService,
    private readonly baseService: BaseService,
    private readonly bakingService: BakingService,
    private readonly cacheService: CacheService,
    private readonly rewardService: RewardService,
    private readonly store$: Store<fromRoot.State>,
    private readonly transactionService: TransactionService
  ) {}
}
