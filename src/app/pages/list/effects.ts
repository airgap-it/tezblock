import { Injectable } from '@angular/core'
import { Actions, createEffect, ofType } from '@ngrx/effects'
import { Store } from '@ngrx/store'
import * as moment from 'moment'
import { forkJoin, Observable, of } from 'rxjs'
import { catchError, map, switchMap, withLatestFrom } from 'rxjs/operators'

import { getTokenContracts } from '@tezblock/domain/contract'
import { OperationTypes } from '@tezblock/domain/operations'
import { Account } from '@tezblock/interfaces/Account'
import { Block } from '@tezblock/interfaces/Block'
import { Transaction } from '@tezblock/interfaces/Transaction'
import * as fromRoot from '@tezblock/reducers'
import { ApiService } from '@tezblock/services/api/api.service'
import { BaseService, Operation } from '@tezblock/services/base.service'
import { RewardService } from '@tezblock/services/reward/reward.service'
import { toNotNilArray } from '@tezblock/services/fp'
import * as listActions from './actions'

const getTimestamp24hAgo = (): number =>
  moment()
    .add(-1, 'days')
    .valueOf()

const getTimestamp7dAgo = (): number =>
  moment()
    .add(-7, 'days')
    .valueOf()

@Injectable()
export class ListEffects {
  blocksPaging$ = createEffect(() =>
    this.actions$.pipe(
      ofType(listActions.increasePageOfBlocks),
      map(() => listActions.loadBlocks())
    )
  )

  onSortingBlocks$ = createEffect(() =>
    this.actions$.pipe(
      ofType(listActions.sortBlocksByKind),
      map(() => listActions.loadBlocks())
    )
  )

  getBlocks$ = createEffect(() =>
    this.actions$.pipe(
      ofType(listActions.loadBlocks),
      withLatestFrom(
        this.store$.select(state => state.list.blocks.pagination),
        this.store$.select(state => state.list.blocks.orderBy)
      ),
      switchMap(([action, pagination, orderBy]) => {
        return this.apiService.getLatestBlocksWithData(pagination.currentPage * pagination.selectedSize, orderBy).pipe(
          map((blocks: Block[]) => listActions.loadBlocksSucceeded({ blocks })),
          catchError(error => of(listActions.loadBlocksFailed({ error })))
        )
      })
    )
  )

  transactionsPaging$ = createEffect(() =>
    this.actions$.pipe(
      ofType(listActions.increasePageOfTransactions),
      map(() => listActions.loadTransactions())
    )
  )

  onSortingTransactions$ = createEffect(() =>
    this.actions$.pipe(
      ofType(listActions.sortTransactionsByKind),
      map(() => listActions.loadTransactions())
    )
  )

  getTransactions = createEffect(() =>
    this.actions$.pipe(
      ofType(listActions.loadTransactions),
      withLatestFrom(
        this.store$.select(state => state.list.transactions.pagination),
        this.store$.select(state => state.list.transactions.orderBy)
      ),
      switchMap(([action, pagination, orderBy]) => {
        return this.apiService
          .getLatestTransactions(pagination.selectedSize * pagination.currentPage, [OperationTypes.Transaction], orderBy)
          .pipe(
            map((transactions: Transaction[]) => listActions.loadTransactionsSucceeded({ transactions })),
            catchError(error => of(listActions.loadTransactionsFailed({ error })))
          )
      })
    )
  )

  activationsPaging$ = createEffect(() =>
    this.actions$.pipe(
      ofType(listActions.increasePageOfActivations),
      map(() => listActions.loadActivations())
    )
  )

  onSortingActivations$ = createEffect(() =>
    this.actions$.pipe(
      ofType(listActions.sortActivationsByKind),
      map(() => listActions.loadActivations())
    )
  )

  getActivations$ = createEffect(() =>
    this.actions$.pipe(
      ofType(listActions.loadActivations),
      withLatestFrom(
        this.store$.select(state => state.list.activations.pagination),
        this.store$.select(state => state.list.activations.orderBy)
      ),
      switchMap(([action, pagination, orderBy]) => {
        return this.apiService
          .getLatestTransactions(pagination.selectedSize * pagination.currentPage, [OperationTypes.Activation], orderBy)
          .pipe(
            map((transactions: Transaction[]) => listActions.loadActivationsSucceeded({ transactions })),
            catchError(error => of(listActions.loadActivationsFailed({ error })))
          )
      })
    )
  )

  originationsPaging$ = createEffect(() =>
    this.actions$.pipe(
      ofType(listActions.increasePageOfOriginations),
      map(() => listActions.loadOriginations())
    )
  )

  onSortingOriginations$ = createEffect(() =>
    this.actions$.pipe(
      ofType(listActions.sortOriginationsByKind),
      map(() => listActions.loadOriginations())
    )
  )

  getOriginations$ = createEffect(() =>
    this.actions$.pipe(
      ofType(listActions.loadOriginations),
      withLatestFrom(
        this.store$.select(state => state.list.originations.pagination),
        this.store$.select(state => state.list.originations.orderBy)
      ),
      switchMap(([action, pagination, orderBy]) => {
        return this.apiService
          .getLatestTransactions(pagination.selectedSize * pagination.currentPage, [OperationTypes.Origination], orderBy)
          .pipe(
            map((transactions: Transaction[]) => listActions.loadOriginationsSucceeded({ transactions })),
            catchError(error => of(listActions.loadOriginationsFailed({ error })))
          )
      })
    )
  )

  onSortingDelgations$ = createEffect(() =>
    this.actions$.pipe(
      ofType(listActions.sortDelegationsByKind),
      map(() => listActions.loadDelegations())
    )
  )

  getDelegations$ = createEffect(() =>
    this.actions$.pipe(
      ofType(listActions.loadDelegations),
      withLatestFrom(
        this.store$.select(state => state.list.delegations.pagination),
        this.store$.select(state => state.list.delegations.orderBy)
      ),
      switchMap(([action, pagination, orderBy]) => {
        return this.apiService
          .getLatestTransactions(pagination.selectedSize * pagination.currentPage, [OperationTypes.Delegation], orderBy)
          .pipe(
            map((transactions: Transaction[]) => listActions.loadDelegationsSucceeded({ transactions })),
            catchError(error => of(listActions.loadDelegationsFailed({ error })))
          )
      })
    )
  )

  delegationsPaging$ = createEffect(() =>
    this.actions$.pipe(
      ofType(listActions.increasePageOfDelegations),
      map(() => listActions.loadDelegations())
    )
  )

  doubleBakingsPaging$ = createEffect(() =>
    this.actions$.pipe(
      ofType(listActions.increasePageOfDoubleBakings),
      map(() => listActions.loadDoubleBakings())
    )
  )

  onSortingDoubleBakings$ = createEffect(() =>
    this.actions$.pipe(
      ofType(listActions.sortDoubleBakingsByKind),
      map(() => listActions.loadDoubleBakings())
    )
  )

  getDoubleBakings$ = createEffect(() =>
    this.actions$.pipe(
      ofType(listActions.loadDoubleBakings),
      withLatestFrom(
        this.store$.select(state => state.list.doubleBakings.pagination),
        this.store$.select(state => state.list.doubleBakings.orderBy)
      ),
      switchMap(([action, pagination, orderBy]) => {
        return this.apiService
          .getLatestTransactions(pagination.selectedSize * pagination.currentPage, ['double_baking_evidence'], orderBy)
          .pipe(
            map((doubleBakings: Transaction[]) => {
              return listActions.loadBlockDataForDBE({ doubleBakings })
            }),
            catchError(error => of(listActions.loadDoubleBakingsFailed({ error })))
          )
      })
    )
  )

  getDoubleBakingsBlockData$ = createEffect(() =>
    this.actions$.pipe(
      ofType(listActions.loadBlockDataForDBE),
      withLatestFrom(this.store$.select(state => state.list.doubleBakings.temporaryData)),
      switchMap(([action, temporaryData]) => {
        const blockIds = []
        temporaryData.forEach(doubleBaking => {
          blockIds.push(doubleBaking.block_level)
        })
        return this.apiService.getBlocksOfIds(blockIds).pipe(
          map((blocks: Block[]) => {
            let doubleBakings = JSON.parse(JSON.stringify(temporaryData))

            doubleBakings.map(async doubleBaking => {
              const additionalData = blocks.find(block => block.level === doubleBaking.block_level)

              const calculatedrewards = await this.rewardService
                .calculateRewards(additionalData.baker, doubleBaking.cycle)
                .then(response => response.bakingRewards)

              return Promise.all(calculatedrewards).then(response => {
                return { ...doubleBaking, baker: additionalData.baker, reward: response.join('') }
              })

              // doubleBaking.baker = additionalData.baker

              // doubleBaking.reward = calculatedReward

              // return {
              //   ...doubleBaking,
              //   baker: additionalData.baker,
              //   reward: calculatedReward
              // }
            })

            return listActions.loadDoubleBakingsSucceeded({ doubleBakings })
          }),
          catchError(error => of(listActions.loadDoubleBakingsFailed({ error })))
        )
      })
    )
  )

  doubleEndorsementsPaging$ = createEffect(() =>
    this.actions$.pipe(
      ofType(listActions.increasePageOfDoubleEndorsements),
      map(() => listActions.loadDoubleEndorsements())
    )
  )

  onSortingDoubleEndorsements$ = createEffect(() =>
    this.actions$.pipe(
      ofType(listActions.sortDoubleEndorsementsByKind),
      map(() => listActions.loadDoubleEndorsements())
    )
  )

  getDoubleEndorsements$ = createEffect(() =>
    this.actions$.pipe(
      ofType(listActions.loadDoubleEndorsements),
      withLatestFrom(
        this.store$.select(state => state.list.doubleEndorsements.pagination),
        this.store$.select(state => state.list.doubleEndorsements.orderBy)
      ),
      switchMap(([action, pagination, orderBy]) => {
        return this.apiService
          .getLatestTransactions(pagination.selectedSize * pagination.currentPage, ['double_endorsement_evidence'], orderBy)
          .pipe(
            map((doubleEndorsements: Transaction[]) => listActions.loadDoubleEndorsementsSucceeded({ doubleEndorsements })),
            catchError(error => of(listActions.loadDoubleEndorsementsFailed({ error })))
          )
      })
    )
  )

  activeBakersPaging$ = createEffect(() =>
    this.actions$.pipe(
      ofType(listActions.increasePageOfActiveBakers),
      map(() => listActions.loadActiveBakers())
    )
  )

  onSortingActiveBakers$ = createEffect(() =>
    this.actions$.pipe(
      ofType(listActions.sortActiveBakersByKind),
      map(() => listActions.loadActiveBakers())
    )
  )

  getActiveBakers$ = createEffect(() =>
    this.actions$.pipe(
      ofType(listActions.loadActiveBakers),
      withLatestFrom(
        this.store$.select(state => state.list.activeBakers.pagination),
        this.store$.select(state => state.list.activeBakers.orderBy)
      ),
      switchMap(([action, pagination, orderBy]) => {
        return this.apiService.getActiveBakers(pagination.selectedSize * pagination.currentPage, orderBy).pipe(
          switchMap(activeBakers =>
            this.apiService.getNumberOfDelegatorsByBakers(activeBakers.map(activeBaker => activeBaker.pkh)).pipe(
              map(numberOfDelegatorsByBakers =>
                listActions.loadActiveBakersSucceeded({
                  activeBakers: activeBakers.map(activeBaker => {
                    const match = numberOfDelegatorsByBakers.find(item => item.delegate_value == activeBaker.pkh)
                    const number_of_delegators = match ? match.number_of_delegators : null

                    return {
                      ...activeBaker,
                      number_of_delegators
                    }
                  })
                })
              ),
              catchError(error => of(listActions.loadActiveBakersFailed({ error })))
            )
          )
        )
      })
    )
  )

  getTotalActiveBakers$ = createEffect(() =>
    this.actions$.pipe(
      ofType(listActions.loadTotalActiveBakers),
      switchMap(() =>
        this.apiService.getTotalBakersAtTheLatestBlock().pipe(
          map(totalActiveBakers => listActions.loadTotalActiveBakersSucceeded({ totalActiveBakers })),
          catchError(error => of(listActions.loadTotalActiveBakersFailed({ error })))
        )
      )
    )
  )

  proposalsPaging$ = createEffect(() =>
    this.actions$.pipe(
      ofType(listActions.increasePageOfProposals),
      map(() => listActions.loadProposals())
    )
  )

  getProposals$ = createEffect(() =>
    this.actions$.pipe(
      ofType(listActions.loadProposals),
      withLatestFrom(
        this.store$.select(state => state.list.proposals.pagination),
        this.store$.select(state => state.list.proposals.orderBy)
      ),
      switchMap(([action, pagination, orderBy]) => {
        return this.apiService.getProposals(pagination.selectedSize * pagination.currentPage, orderBy).pipe(
          map(proposals => listActions.loadProposalsSucceeded({ proposals })),
          catchError(error => of(listActions.loadProposalsFailed({ error })))
        )
      })
    )
  )

  onSortingProposals$ = createEffect(() =>
    this.actions$.pipe(
      ofType(listActions.sortProposalsByKind),
      map(() => listActions.loadProposals())
    )
  )

  votesPaging$ = createEffect(() =>
    this.actions$.pipe(
      ofType(listActions.increasePageOfVotes),
      map(() => listActions.loadVotes())
    )
  )

  onSortingVotes$ = createEffect(() =>
    this.actions$.pipe(
      ofType(listActions.sortVotesByKind),
      map(() => listActions.loadVotes())
    )
  )

  getVotes$ = createEffect(() =>
    this.actions$.pipe(
      ofType(listActions.loadVotes),
      withLatestFrom(
        this.store$.select(state => state.list.votes.pagination),
        this.store$.select(state => state.list.votes.orderBy)
      ),
      switchMap(([action, pagination, orderBy]) => {
        return this.apiService
          .getLatestTransactions(pagination.selectedSize * pagination.currentPage, ['ballot', 'proposals'], orderBy)
          .pipe(
            map(votes => listActions.loadVotesSucceeded({ votes })),
            catchError(error => of(listActions.loadVotesFailed({ error })))
          )
      })
    )
  )

  endorsementsPaging$ = createEffect(() =>
    this.actions$.pipe(
      ofType(listActions.increasePageOfEndorsements),
      map(() => listActions.loadEndorsements())
    )
  )

  getEndorsements$ = createEffect(() =>
    this.actions$.pipe(
      ofType(listActions.loadEndorsements),
      withLatestFrom(
        this.store$.select(state => state.list.endorsements.pagination),
        this.store$.select(state => state.list.endorsements.orderBy)
      ),
      switchMap(([action, pagination, orderBy]) => {
        return this.apiService
          .getLatestTransactions(pagination.selectedSize * pagination.currentPage, [OperationTypes.Endorsement], orderBy)
          .pipe(
            map((endorsements: Transaction[]) => listActions.loadEndorsementsSucceeded({ endorsements })),
            catchError(error => of(listActions.loadEndorsementsFailed({ error })))
          )
      })
    )
  )

  onSortingEndorsements$ = createEffect(() =>
    this.actions$.pipe(
      ofType(listActions.sortEndorsementsByKind),
      map(() => listActions.loadEndorsements())
    )
  )

  loadActivationsCountLast24h$ = createEffect(() =>
    this.actions$.pipe(
      ofType(listActions.loadActivationsCountLast24h),
      switchMap(() =>
        this.getEntitiesSince(getTimestamp24hAgo(), 'activate_account').pipe(
          map(activations => activations.length),
          map(activationsCountLast24h => listActions.loadActivationsCountLast24hSucceeded({ activationsCountLast24h })),
          catchError(error => of(listActions.loadActivationsCountLast24hFailed({ error })))
        )
      )
    )
  )

  loadOriginationsCountLast24h$ = createEffect(() =>
    this.actions$.pipe(
      ofType(listActions.loadOriginationsCountLast24h),
      switchMap(() =>
        this.getEntitiesSince(getTimestamp24hAgo(), 'origination').pipe(
          map(originations => originations.length),
          map(originationsCountLast24h => listActions.loadOriginationsCountLast24hSucceeded({ originationsCountLast24h })),
          catchError(error => of(listActions.loadOriginationsCountLast24hFailed({ error })))
        )
      )
    )
  )

  loadTransactionsCountLast24h$ = createEffect(() =>
    this.actions$.pipe(
      ofType(listActions.loadTransactionsCountLast24h),
      switchMap(() =>
        this.getEntitiesSince(getTimestamp24hAgo(), 'transaction').pipe(
          map(transactions => transactions.length),
          map(transactionsCountLast24h => listActions.loadTransactionsCountLast24hSucceeded({ transactionsCountLast24h })),
          catchError(error => of(listActions.loadTransactionsCountLast24hFailed({ error })))
        )
      )
    )
  )

  loadActivationsCountLastXd$ = createEffect(() =>
    this.actions$.pipe(
      ofType(listActions.loadActivationsCountLastXd),
      switchMap(() =>
        this.getEntitiesSince(getTimestamp7dAgo(), 'activate_account').pipe(
          map(activations => activations.map(activation => activation.timestamp)),
          map(activationsCountLastXd => listActions.loadActivationsCountLastXdSucceeded({ activationsCountLastXd })),
          catchError(error => of(listActions.loadActivationsCountLastXdFailed({ error })))
        )
      )
    )
  )

  loadOriginationsCountLastXd$ = createEffect(() =>
    this.actions$.pipe(
      ofType(listActions.loadOriginationsCountLastXd),
      switchMap(() =>
        this.getEntitiesSince(getTimestamp7dAgo(), 'origination').pipe(
          map(originations => originations.map(origination => origination.timestamp)),
          map(originationsCountLastXd => listActions.loadOriginationsCountLastXdSucceeded({ originationsCountLastXd })),
          catchError(error => of(listActions.loadOriginationsCountLastXdFailed({ error })))
        )
      )
    )
  )

  loadTransactionsCountLastXd$ = createEffect(() =>
    this.actions$.pipe(
      ofType(listActions.loadTransactionsChartData),
      switchMap(() =>
        this.getEntitiesSince(getTimestamp7dAgo(), 'transaction', ['timestamp', 'amount']).pipe(
          map(transactionsChartData => listActions.loadTransactionsChartDataSucceeded({ transactionsChartData })),
          catchError(error => of(listActions.loadTransactionsChartDataFailed({ error })))
        )
      )
    )
  )

  loadTokenContracts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(listActions.loadTokenContracts),
      withLatestFrom(this.store$.select(state => state.list.doubleEndorsements.pagination)),
      switchMap(([action, pagination]) => {
        const contracts = getTokenContracts(pagination.currentPage * pagination.selectedSize)

        if (!contracts || contracts.total === 0) {
          return of(listActions.loadTokenContractsSucceeded({ tokenContracts: { data: [], total: 0 } }))
        }

        return forkJoin(contracts.data.map(contract => this.apiService.getTotalSupplyByContract(contract))).pipe(
          map(totalSupplies =>
            listActions.loadTokenContractsSucceeded({
              tokenContracts: {
                data: totalSupplies.map((totalSupply, index) => ({ ...contracts.data[index], totalSupply })),
                total: contracts.total
              }
            })
          ),
          catchError(error => of(listActions.loadTokenContractsFailed({ error })))
        )
      })
    )
  )

  increasePageOfTokenContracts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(listActions.increasePageOfTokenContracts),
      map(() => listActions.loadTokenContracts())
    )
  )

  loadContracts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(listActions.loadContracts),
      withLatestFrom(
        this.store$.select(state => state.list.contracts.pagination),
        this.store$.select(state => state.list.contracts.orderBy).pipe(map(toNotNilArray))
      ),
      switchMap(([action, pagination, orderBy]) =>
        this.baseService
          .post<Account[]>('accounts', {
            fields: [],
            predicates: [
              {
                field: 'account_id',
                operation: Operation.startsWith,
                set: ['KT'],
                inverse: false
              }
            ],
            orderBy,
            limit: pagination.currentPage * pagination.selectedSize
          })
          .pipe(
            map(contracts => listActions.loadContractsSucceeded({ contracts })),
            catchError(error => of(listActions.loadContractsFailed({ error })))
          )
      )
    )
  )

  increasePageOfContracts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(listActions.increasePageOfContracts),
      map(() => listActions.loadContracts())
    )
  )

  sortContracts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(listActions.sortContracts),
      map(() => listActions.loadContracts())
    )
  )

  private getEntitiesSince(since: number, kind: string, fields: string[] = ['timestamp']): Observable<Transaction[]> {
    return this.baseService.post<Transaction[]>('operations', {
      fields,
      predicates: [
        { field: 'operation_group_hash', operation: Operation.isnull, inverse: true },
        { field: 'kind', operation: Operation.in, set: [kind] },
        { field: 'timestamp', operation: Operation.gt, set: [since] }
      ],
      orderBy: [{ field: 'timestamp', direction: 'desc' }],
      limit: 100000
    })
  }

  constructor(
    private readonly actions$: Actions,
    private readonly apiService: ApiService,
    private readonly baseService: BaseService,
    private readonly store$: Store<fromRoot.State>,
    private readonly rewardService: RewardService
  ) {}
}
