import { Injectable } from '@angular/core'
import { Actions, createEffect, ofType } from '@ngrx/effects'
import { of, pipe, Observable, forkJoin } from 'rxjs'
import { map, catchError, combineLatest, filter, switchMap, withLatestFrom } from 'rxjs/operators'
import { Store } from '@ngrx/store'

import * as actions from './actions'
import { ApiService } from '@tezblock/services/api/api.service'
import * as fromRoot from '@tezblock/reducers'
import { isEmptyPeriodKind } from './reducer'
import { BaseService, Operation, Direction, Body, ENVIRONMENT_URL } from '@tezblock/services/base.service'
import { first, get } from '@tezblock/services/fp'
import { Block } from '@tezblock/interfaces/Block'
import { Transaction } from '@tezblock/interfaces/Transaction'
import { PeriodKind, MetaVotingPeriod, PeriodTimespan } from '@tezblock/domain/vote'

const getPeriodTimespanQuery = (period: number, direction: Direction): Body => ({
  fields: ['timestamp'],
  predicates: [
    {
      field: 'meta_voting_period',
      operation: Operation.eq,
      set: [period],
      inverse: false
    }
  ],
  orderBy: [
    {
      field: 'level',
      direction
    }
  ],
  limit: 1
})

@Injectable()
export class ProposalDetailEffects {
  getProposal$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadProposal),
      switchMap(({ id }) =>
        this.apiService.getProposal(id).pipe(
          map(proposal => actions.loadProposalSucceeded({ proposal })),
          catchError(error => of(actions.loadProposalFailed({ error })))
        )
      )
    )
  )

  onStartLoadingVotesLoadMetaVotingPeriod$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.startLoadingVotes),
      map(() => actions.loadMetaVotingPeriods())
    )
  )

  loadMetaVotingPeriod$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadMetaVotingPeriods),
      withLatestFrom(this.store$.select(state => state.proposalDetails.id)),
      switchMap(([action, proposalHash]) =>
        forkJoin(
          // this.getMetaVotingPeriod(proposalHash, PeriodKind.Proposal),
          this.getMetaVotingPeriod(proposalHash, PeriodKind.Exploration),
          this.getMetaVotingPeriod(proposalHash, PeriodKind.Testing),
          this.getMetaVotingPeriod(proposalHash, PeriodKind.Promotion)
        ).pipe(
          map(metaVotingPeriodCounts =>
            actions.loadMetaVotingPeriodsSucceeded({
              metaVotingPeriods: [
                { periodKind: PeriodKind.Proposal, value: metaVotingPeriodCounts[0] - 1 /* TODO: CONFIRM */ },
                { periodKind: PeriodKind.Exploration, value: metaVotingPeriodCounts[0] },
                { periodKind: PeriodKind.Testing, value: metaVotingPeriodCounts[1] },
                { periodKind: PeriodKind.Promotion, value: metaVotingPeriodCounts[2] }
              ]
            })
          ),
          catchError(error => of(actions.loadMetaVotingPeriodsFailed({ error })))
        )
      )
    )
  )

  onMetaVotingPeriodLoadVotes$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadMetaVotingPeriodsSucceeded),
      withLatestFrom(this.store$.select(state => state.proposalDetails.periodKind)),
      filter(
        ([{ metaVotingPeriods }, periodKind]) =>
          periodKind === PeriodKind.Proposal ||
          !!get<MetaVotingPeriod>(period => period.value)(
            metaVotingPeriods.find(metaVotingPeriod => metaVotingPeriod.periodKind === periodKind)
          )
      ),
      map(([{ metaVotingPeriods }, periodKind]) => actions.loadVotes({ periodKind }))
    )
  )

  loadVotes$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadVotes),
      withLatestFrom(this.store$.select(state => state.proposalDetails.metaVotingPeriods)),
      map(([{ periodKind }, metaVotingPeriods]) =>
        get<MetaVotingPeriod>(period => period.value)(metaVotingPeriods.find(period => period.periodKind === periodKind))
      ),
      withLatestFrom(
        this.store$.select(state => state.proposalDetails.id),
        this.store$.select(state => state.proposalDetails.votes.pagination)
      ),
      switchMap(([metaVotingPeriod, proposalHash, pagination]) =>
        this.baseService
          .post<Transaction[]>('operations', {
            predicates: [
              {
                field: 'kind',
                operation: Operation.eq,
                set: ['ballot']
              },
              {
                field: 'proposal',
                operation: Operation.eq,
                set: [proposalHash]
              },
              {
                field: 'period',
                operation: Operation.eq,
                set: [metaVotingPeriod]
              }
            ],
            orderBy: [
              {
                field: 'block_level',
                direction: 'desc'
              }
            ],
            limit: pagination.currentPage * pagination.selectedSize
          })
          .pipe(
            switchMap((votes: Transaction[]) =>
              this.apiService.addVoteData(votes).pipe(
                map(votes => actions.loadVotesSucceeded({ votes })),
                catchError(error => of(actions.loadVotesFailed({ error })))
              )
            )
          )
      )
    )
  )

  loadProposalVotes$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadVotes),
      withLatestFrom(
        this.store$.select(state => state.proposalDetails.id),
        this.store$.select(state => state.proposalDetails.votes.pagination),
        this.store$.select(state => state.proposalDetails.metaVotingPeriods)
      ),
      filter(([{ periodKind }, proposalHash, pagination, metaVotingPeriods]) => periodKind === PeriodKind.Proposal),
      switchMap(([{ periodKind }, proposalHash, pagination, metaVotingPeriods]) =>
        this.baseService
          .post<Transaction[]>('operations', {
            fields: [],
            predicates: [
              {
                field: 'kind',
                operation: Operation.eq,
                set: ['proposals'],
                inverse: false
              },
              {
                field: 'proposal',
                operation: Operation.like,
                set: [proposalHash],
                inverse: false
              }
            ],
            orderBy: [
              {
                field: 'block_level',
                direction: 'desc'
              }
            ],
            limit: pagination.currentPage * pagination.selectedSize
          })
          .pipe(
            switchMap((votes: Transaction[]) =>
              this.apiService.addVoteData(votes).pipe(
                map(votes => actions.loadVotesSucceeded({ votes })),
                catchError(error => of(actions.loadVotesFailed({ error })))
              )
            )
          )
      )
    )
  )

  onMetaVotingPeriodLoadVotesTotal$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadMetaVotingPeriodsSucceeded),
      map(() => actions.loadVotesTotal())
    )
  )

  loadVotesTotal$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadVotesTotal),
      withLatestFrom(
        this.store$.select(state => state.proposalDetails.id),
        this.store$.select(state => state.proposalDetails.metaVotingPeriods)
      ),
      switchMap(([action, proposalHash, metaVotingPeriods]) => {
        const _metaVotingPeriods = metaVotingPeriods.filter(
          metaVotingPeriod => !!metaVotingPeriod.value && metaVotingPeriod.periodKind !== PeriodKind.Proposal
        )

        return forkJoin(
          [this.getProposalVotesCount(proposalHash)].concat(
            _metaVotingPeriods.map(metaVotingPeriod => this.getMetaVotingPeriodCount(proposalHash, metaVotingPeriod.value))
          )
        ).pipe(
          map(counts =>
            actions.loadVotesTotalSucceeded({
              metaVotingPeriods: [
                {
                  ...metaVotingPeriods[0],
                  count: counts[0]
                }
              ].concat(_metaVotingPeriods.map((metaVotingPeriod, index) => ({ ...metaVotingPeriod, count: counts[index + 1] })))
            })
          ),
          catchError(error => of(actions.loadVotesTotalFailed({ error })))
        )
      })
    )
  )

  onPaging$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.increasePageSize),
      withLatestFrom(this.store$.select(state => state.proposalDetails.periodKind)),
      map(([action, periodKind]) => actions.loadVotes({ periodKind }))
    )
  )

  loadPeriodInfos$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadPeriodInfos),
      switchMap(() =>
        forkJoin(
          this.baseService
            .post<{ meta_voting_period: number; meta_voting_period_position: number }[]>('blocks', {
              fields: ['meta_voting_period', 'meta_voting_period_position'],
              orderBy: [
                {
                  field: 'level',
                  direction: 'desc'
                }
              ],
              limit: 1
            })
            .pipe(map(first)),
          this.baseService
            .get<any>(`${ENVIRONMENT_URL.rpcUrl}/chains/main/blocks/head/context/constants`, true)
            .pipe(map(response => response.blocks_per_voting_period))
        ).pipe(
          map(([{ meta_voting_period, meta_voting_period_position }, blocksPerVotingPeriod]) =>
            actions.loadPeriodInfosSucceeded({
              currentVotingPeriod: meta_voting_period,
              currentVotingeriodPosition: meta_voting_period_position,
              blocksPerVotingPeriod
            })
          ),
          catchError(error => of(actions.loadVotesFailed({ error })))
        )
      )
    )
  )

  loadPeriodsTimespansTrigger$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadPeriodInfosSucceeded),
      combineLatest(this.actions$.pipe(ofType(actions.loadMetaVotingPeriodsSucceeded))),
      map(() => actions.loadPeriodsTimespans())
    )
  )

  loadPeriodsTimespans$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadPeriodsTimespans),
      withLatestFrom(
        this.store$.select(state => state.proposalDetails.metaVotingPeriods),
        this.store$.select(state => state.proposalDetails.currentVotingPeriod)
      ),
      switchMap(([action, metaVotingPeriods, currentVotingPeriod]) =>
        forkJoin(
          forkJoin(
            metaVotingPeriods.map(period =>
              period.value <= currentVotingPeriod
                ? this.baseService.post<{ timestamp: number }[]>('blocks', getPeriodTimespanQuery(period.value, 'asc')).pipe(
                    map(first),
                    map(get(item => item.timestamp))
                  )
                : of(null)
            )
          ),
          forkJoin(
            metaVotingPeriods.map(period =>
              period.value < currentVotingPeriod
                ? this.baseService.post<{ timestamp: number }[]>('blocks', getPeriodTimespanQuery(period.value, 'desc')).pipe(
                    map(first),
                    map(get(item => item.timestamp))
                  )
                : of(null)
            )
          )
        ).pipe(
          map(response =>
            actions.loadPeriodsTimespansSucceeded({
              periodsTimespans: response[0].map((start, index) => <PeriodTimespan>{ start, end: response[1][index] })
            })
          ),
          catchError(error => of(actions.loadPeriodsTimespansFailed({ error })))
        )
      )
    )
  )

  private getMetaVotingPeriod(proposalHash: string, periodKind: string): Observable<number> {
    return this.baseService
      .post<Block[]>('blocks', {
        fields: ['meta_voting_period'],
        predicates: [
          {
            field: 'active_proposal',
            operation: Operation.eq,
            set: [proposalHash],
            inverse: false
          },
          {
            field: 'period_kind',
            operation: Operation.eq,
            set: [periodKind],
            inverse: false
          }
        ],
        orderBy: [
          {
            field: 'level',
            direction: 'desc'
          }
        ],
        limit: 1
      })
      .pipe(
        map(
          pipe(
            first,
            get<Block>(block => block.meta_voting_period)
          )
        )
      )
  }

  private getMetaVotingPeriodCount(proposalHash: string, metaVotingPeriod: number): Observable<number> {
    return this.baseService
      .post<Transaction[]>('operations', {
        fields: ['proposal'],
        predicates: [
          {
            field: 'kind',
            operation: Operation.eq,
            set: ['ballot']
          },
          {
            field: 'proposal',
            operation: Operation.eq,
            set: [proposalHash]
          },
          {
            field: 'period',
            operation: Operation.eq,
            set: [metaVotingPeriod]
          }
        ],
        aggregation: [
          {
            field: 'proposal',
            function: 'count'
          }
        ]
      })
      .pipe(
        map(
          pipe(
            first,
            get<any>(item => parseInt(item.count_proposal))
          )
        )
      )
  }

  private getProposalVotesCount(proposalHash: string): Observable<number> {
    return this.baseService
      .post<Transaction[]>('operations', {
        fields: ['proposal'],
        predicates: [
          {
            field: 'kind',
            operation: Operation.eq,
            set: ['proposals'],
            inverse: false
          },
          {
            field: 'proposal',
            operation: Operation.like,
            set: [proposalHash],
            inverse: false
          }
        ],
        aggregation: [
          {
            field: 'proposal',
            function: 'count'
          }
        ]
      })
      .pipe(
        map(
          pipe(
            first,
            get<any>(item => parseInt(item.count_proposal))
          )
        )
      )
  }

  constructor(
    private readonly actions$: Actions,
    private readonly apiService: ApiService,
    private readonly baseService: BaseService,
    private readonly store$: Store<fromRoot.State>
  ) {}
}
