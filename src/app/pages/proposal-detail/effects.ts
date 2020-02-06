import { Injectable } from '@angular/core'
import { Actions, createEffect, ofType } from '@ngrx/effects'
import { of } from 'rxjs'
import { map, catchError, switchMap, withLatestFrom } from 'rxjs/operators'
import { Store } from '@ngrx/store'
import * as _ from 'lodash'

import * as actions from './actions'
import { ApiService } from '@tezblock/services/api/api.service'
import * as fromRoot from '@tezblock/reducers'
import { BaseService, Operation } from '@tezblock/services/base.service'
import { first } from '@tezblock/services/fp'
import { Block } from '@tezblock/interfaces/Block'

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

  loadVotes$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadVotes),
      withLatestFrom(this.store$.select(state => state.proposalDetails.id)),
      switchMap(([{ periodKind }, proposalHash]) =>
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
            orderBy: [
              {
                field: 'level',
                direction: 'desc'
              }
            ],
            limit: 1
          })
          .pipe(
            map(first),
            map(block => {
              return actions.loadVotesSucceeded({ votes: [] })
            }),
            catchError(error => of(actions.loadVotesFailed({ error })))
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
