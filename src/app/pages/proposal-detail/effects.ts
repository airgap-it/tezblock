import { Injectable } from '@angular/core'
import { Actions, createEffect, ofType } from '@ngrx/effects'
import { of, pipe, Observable, forkJoin } from 'rxjs'
import { map, catchError, filter, switchMap, withLatestFrom } from 'rxjs/operators'
import { Store } from '@ngrx/store'

import * as actions from './actions'
import { ApiService } from '@tezblock/services/api/api.service'
import * as fromRoot from '@tezblock/reducers'
import { BaseService, Operation } from '@tezblock/services/base.service'
import { first, get } from '@tezblock/services/fp'
import { Block } from '@tezblock/interfaces/Block'
import { Transaction } from '@tezblock/interfaces/Transaction'
import { PeriodKind } from '@tezblock/domain/vote'
import { proposals } from '@tezblock/interfaces/proposal'

@Injectable()
export class ProposalDetailEffects {
  getProposal$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadProposal),
      switchMap(({ id }) =>
        this.apiService.getProposal(id).pipe(
          map(proposal => {
            const match = proposals[id]

            return actions.loadProposalSucceeded({ proposal: {
              ...proposal,
              discussionLink: match ? match.discussionLink : undefined
            } })
          }),
          catchError(error => of(actions.loadProposalFailed({ error })))
        )
      )
    )
  )

  onLoadVotesLoadMetaVotingPeriod$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadVotes),
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
          // this.getMetaVotingPeriod(proposalHash, PeriodKind.Testing),
          this.getMetaVotingPeriod(proposalHash, PeriodKind.Promotion)
        ).pipe(
          map(metaVotingPeriodCounts =>
            actions.loadMetaVotingPeriodsSucceeded({
              metaVotingPeriods: [
                { periodKind: PeriodKind.Proposal, value: null },
                { periodKind: PeriodKind.Exploration, value: metaVotingPeriodCounts[0] },
                { periodKind: PeriodKind.Testing, value: null },
                { periodKind: PeriodKind.Promotion, value: metaVotingPeriodCounts[1] }
              ]
            })
          ),
          catchError(error => of(actions.loadMetaVotingPeriodsFailed({ error })))
        )
      )
    )
  )

  onMetaVotingPeriodLoadVotes = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadMetaVotingPeriodsSucceeded),
      withLatestFrom(this.store$.select(state => state.proposalDetails.periodKind)),
      map(([{ metaVotingPeriods }, periodKind]) => {
        const match = metaVotingPeriods.find(metaVotingPeriod => metaVotingPeriod.periodKind === periodKind)

        return match.value
      }),
      filter(metaVotingPeriod => !!metaVotingPeriod),
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

  loadProposalVotes = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadVotes),
      withLatestFrom(
        this.store$.select(state => state.proposalDetails.periodKind),
        this.store$.select(state => state.proposalDetails.id),
        this.store$.select(state => state.proposalDetails.votes.pagination)
      ),
      filter(([action, periodKind, proposalHash, pagination]) => periodKind === PeriodKind.Proposal),
      switchMap(([action, periodKind, proposalHash, pagination]) =>
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
      filter(({ metaVotingPeriods: metaVotingPeriod }) => !!metaVotingPeriod),
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
        const _metaVotingPeriods = metaVotingPeriods.filter(metaVotingPeriod => !!metaVotingPeriod.value)

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
