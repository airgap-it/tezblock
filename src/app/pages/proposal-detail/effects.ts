import { Injectable } from '@angular/core'
import { Actions, createEffect, ofType } from '@ngrx/effects'
import { of, pipe } from 'rxjs'
import { map, catchError, filter, switchMap, withLatestFrom } from 'rxjs/operators'
import { Store } from '@ngrx/store'
import * as _ from 'lodash'

import * as actions from './actions'
import { ApiService } from '@tezblock/services/api/api.service'
import * as fromRoot from '@tezblock/reducers'
import { BaseService, Operation } from '@tezblock/services/base.service'
import { first, get } from '@tezblock/services/fp'
import { Block } from '@tezblock/interfaces/Block'
import { Transaction } from '@tezblock/interfaces/Transaction'

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

  onLoadVotesLoadMetaVotingPeriod$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadVotes),
      map(() => actions.loadMetaVotingPeriod())
    )
  )

  loadMetaVotingPeriod$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadMetaVotingPeriod),
      withLatestFrom(this.store$.select(state => state.proposalDetails.id), this.store$.select(state => state.proposalDetails.periodKind)),
      switchMap(([action, proposalHash, periodKind]) =>
        this.baseService
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
            limit: 1
          })
          .pipe(
            map(
              pipe(
                first,
                get<Block>(block => block.meta_voting_period)
              )
            ),
            map(metaVotingPeriod => actions.loadMetaVotingPeriodSucceeded({ metaVotingPeriod })),
            catchError(error => of(actions.loadMetaVotingPeriodFailed({ error })))
          )
      )
    )
  )

  onMetaVotingPeriodLoadVotes = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadMetaVotingPeriodSucceeded),
      filter(({ metaVotingPeriod }) => !!metaVotingPeriod),
      withLatestFrom(this.store$.select(state => state.proposalDetails.id)),
      switchMap(([{ metaVotingPeriod }, proposalHash]) =>
        this.baseService
          .post<Transaction[]>('operations', {
            predicates: [
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
            limit: 10
          })
          .pipe(
            map(votes => actions.loadVotesSucceeded({ votes })),
            catchError(error => of(actions.loadVotesFailed({ error })))
          )
      )
    )
  )

  onMetaVotingPeriodLoadVotesTotal$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadMetaVotingPeriodSucceeded),
      filter(({ metaVotingPeriod }) => !!metaVotingPeriod),
      map(() => actions.loadVotesTotal())
    )
  )

  // I need totals for each period ...
  loadVotesTotal$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadVotesTotal),
      withLatestFrom(
        this.store$.select(state => state.proposalDetails.id),
        this.store$.select(state => state.proposalDetails.metaVotingPeriod)
      ),
      switchMap(([action, proposalHash, metaVotingPeriod]) =>
        this.baseService
          .post<Transaction[]>('operations', {
            fields: ['proposal'],
            predicates: [
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
                get<any>(item => item.count_proposal)
              )
            ),
            map(total => actions.loadVotesTotalSucceeded({ total })),
            catchError(error => of(actions.loadVotesTotalFailed({ error })))
          )
      )
    )
  )

  // PROPOSAL
  // this.transactionsApiUrl,
  //       {
  //         fields: ['proposal', 'period'],
  //         predicates: [{ field: 'proposal', operation: 'eq', set: [id], inverse: false }],
  //         limit: 1
  //       },

  // 120:  getLatestTransactions ( skip originatedBalance ) ->  transactions by kind (10)
  // 226:  addVoteData -> create predicates by transaction.block_level
  // 1182: getVotingPeriod -> this.blocksApiUrl, { fields: ['level', 'period_kind'], predicates } -> adds voting_period to transactions

  // ['ballot', 'proposals']

  constructor(
    private readonly actions$: Actions,
    private readonly apiService: ApiService,
    private readonly baseService: BaseService,
    private readonly store$: Store<fromRoot.State>
  ) {}
}
