import { Injectable } from '@angular/core'
import { Actions, createEffect, ofType } from '@ngrx/effects'
import { of } from 'rxjs'
import { map, catchError, combineLatest, filter, switchMap, withLatestFrom } from 'rxjs/operators'
import { Store } from '@ngrx/store'

import * as actions from './actions'
import { ApiService } from '@tezblock/services/api/api.service'
import * as fromRoot from '@tezblock/reducers'
import * as appActions from '@tezblock/app.actions'
import { get } from '@tezblock/services/fp'
import { Transaction } from '@tezblock/interfaces/Transaction'
import { PeriodKind, MetaVotingPeriod } from '@tezblock/domain/vote'
import { proposals } from '@tezblock/interfaces/proposal'
import { ProposalService } from '@tezblock/services/proposal/proposal.service'

@Injectable()
export class ProposalDetailEffects {
  getProposal$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadProposal),
      switchMap(({ id }) =>
        this.apiService.getProposal(id).pipe(
          map((proposal) => {
            const match = proposals[id]

            return actions.loadProposalSucceeded({
              proposal: {
                ...proposal,
                discussionLink: match ? match.discussionLink : undefined
              }
            })
          }),
          catchError((error) => of(actions.loadProposalFailed({ error })))
        )
      )
    )
  )

  onLoadedProposalLoadDescription$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadProposalSucceeded),
      map(() => actions.loadProposalDescription())
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
      withLatestFrom(
        this.store$.select((state) => state.proposalDetails.id),
        this.store$.select((state) => state.proposalDetails.proposal)
      ),
      switchMap(([action, proposalHash, proposal]) => {
        return this.proposalService.getMetaVotingPeriods(proposalHash, proposal).pipe(
          map((metaVotingPeriods) => actions.loadMetaVotingPeriodsSucceeded({ metaVotingPeriods })),
          catchError((error) => of(actions.loadMetaVotingPeriodsFailed({ error })))
        )
      })
    )
  )

  onMetaVotingPeriodLoadVotes$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadMetaVotingPeriodsSucceeded),
      withLatestFrom(this.store$.select((state) => state.proposalDetails.periodKind)),
      filter(
        ([{ metaVotingPeriods }, periodKind]) =>
          periodKind === PeriodKind.Proposal ||
          !!get<MetaVotingPeriod>((period) => period.value)(
            metaVotingPeriods.find((metaVotingPeriod) => metaVotingPeriod.periodKind === periodKind)
          )
      ),
      map(([{ metaVotingPeriods }, periodKind]) => actions.loadVotes({ periodKind }))
    )
  )

  loadVotes$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadVotes),
      withLatestFrom(
        this.store$.select((state) => state.proposalDetails.metaVotingPeriods),
        this.store$.select((state) => state.proposalDetails.id),
        this.store$.select((state) => state.proposalDetails.votes.pagination)
      ),
      filter(([{ periodKind }]) => periodKind !== PeriodKind.Proposal),
      switchMap(([{ periodKind }, metaVotingPeriods, proposalHash, pagination]) => {
        return this.proposalService.getVotes(periodKind, metaVotingPeriods, proposalHash, pagination).pipe(
          map((votes) => actions.loadVotesSucceeded({ votes })),
          catchError((error) => of(actions.loadVotesFailed({ error })))
        )
      })
    )
  )

  loadProposalVotes$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadVotes),
      withLatestFrom(
        this.store$.select((state) => state.proposalDetails.id),
        this.store$.select((state) => state.proposalDetails.votes.pagination)
      ),
      filter(([{ periodKind }, proposalHash, pagination]) => periodKind === PeriodKind.Proposal),
      switchMap(([{ periodKind }, proposalHash, pagination]) =>
        this.proposalService.getProposalVotes(proposalHash, pagination).pipe(
          switchMap((votes: Transaction[]) =>
            this.proposalService.addVoteData(votes).pipe(
              map((votes) => actions.loadVotesSucceeded({ votes })),
              catchError((error) => of(actions.loadVotesFailed({ error })))
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
        this.store$.select((state) => state.proposalDetails.id),
        this.store$.select((state) => state.proposalDetails.metaVotingPeriods)
      ),
      switchMap(([action, proposalHash, metaVotingPeriods]) =>
        this.proposalService.getVotesTotal(proposalHash, metaVotingPeriods).pipe(
          map((metaVotingPeriods) => actions.loadVotesTotalSucceeded({ metaVotingPeriods })),
          catchError((error) => of(actions.loadVotesTotalFailed({ error })))
        )
      )
    )
  )

  onPaging$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.increasePageSize),
      withLatestFrom(this.store$.select((state) => state.proposalDetails.periodKind)),
      map(([action, periodKind]) => actions.loadVotes({ periodKind }))
    )
  )

  loadPeriodsTimespansTrigger$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadMetaVotingPeriodsSucceeded),
      combineLatest(this.actions$.pipe(ofType(appActions.loadPeriodInfosSucceeded))), // TODO JGD
      map(() => actions.loadPeriodsTimespans())
    )
  )

  loadPeriodsTimespans$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadPeriodsTimespans),
      withLatestFrom(
        this.store$.select((state) => state.proposalDetails.metaVotingPeriods),
        this.store$.select((state) => state.app.currentVotingPeriod),
        this.store$.select((state) => state.app.blocksPerVotingPeriod),
        this.store$.select((state) => state.app.protocolVariables?.minimal_block_delay)
      ),
      filter(([, , , timeBetweenBlocks]) => timeBetweenBlocks !== undefined),
      map(([, metaVotingPeriods, currentVotingPeriod, blocksPerVotingPeriod, timeBetweenBlocks]) => ({ metaVotingPeriods, currentVotingPeriod, blocksPerVotingPeriod, timeBetweenBlocks: Number(timeBetweenBlocks) })),
      switchMap(({ metaVotingPeriods, currentVotingPeriod, blocksPerVotingPeriod, timeBetweenBlocks }) => {
        return this.proposalService.getPeriodsTimespans(metaVotingPeriods, currentVotingPeriod, blocksPerVotingPeriod, timeBetweenBlocks).pipe(
          map(({ periodsTimespans, blocksPerVotingPeriod }) =>
            actions.loadPeriodsTimespansSucceeded({
              periodsTimespans,
              blocksPerVotingPeriod,
              timeBetweenBlocks
            })
          ),
          catchError((error) => of(actions.loadPeriodsTimespansFailed({ error })))
        )
      })
    )
  )

  loadProposalDescription$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadProposalDescription),
      withLatestFrom(this.store$.select((state) => state.proposalDetails.id)),
      switchMap(([action, id]) =>
        this.proposalService.getProposalDescription(id).pipe(
          map((description) => actions.loadProposalDescriptionSucceeded({ description })),
          catchError((error) => of(actions.loadProposalDescriptionFailed({ error })))
        )
      )
    )
  )

  onLoadVotesLoadDivisionOfVotes$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadVotes),
      withLatestFrom(this.store$.select((state) => state.proposalDetails.metaVotingPeriods)),
      map(([{ periodKind }, metaVotingPeriods]) => {
        const votingPeriod = get<MetaVotingPeriod>((metaVotingPeriod) => metaVotingPeriod.value)(
          metaVotingPeriods.find((metaVotingPeriod) => metaVotingPeriod.periodKind === periodKind)
        )

        return actions.loadDivisionOfVotes({ votingPeriod })
      })
    )
  )

  loadDivisionOfVotes$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadDivisionOfVotes),
      withLatestFrom(this.store$.select((state) => state.proposalDetails.id)),
      switchMap(([{ votingPeriod }, proposalHash]) =>
        this.proposalService.getDivisionOfVotes({ proposalHash, votingPeriod }).pipe(
          map((divisionOfVotes) => actions.loadDivisionOfVotesSucceeded({ divisionOfVotes })),
          catchError((error) => of(actions.loadDivisionOfVotesFailed({ error })))
        )
      )
    )
  )

  constructor(
    private readonly actions$: Actions,
    private readonly apiService: ApiService,
    private readonly proposalService: ProposalService,
    private readonly store$: Store<fromRoot.State>
  ) {}
}
