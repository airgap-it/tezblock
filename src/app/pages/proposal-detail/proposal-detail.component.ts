import { Component, OnInit } from '@angular/core'
import { Store } from '@ngrx/store'
import { ActivatedRoute } from '@angular/router'
import { Observable } from 'rxjs'
import { TezosNetwork } from 'airgap-coin-lib/dist/protocols/tezos/TezosProtocol'
import { Actions, ofType } from '@ngrx/effects'

import { ChainNetworkService } from '@tezblock/services/chain-network/chain-network.service'
import { CopyService } from 'src/app/services/copy/copy.service'
import * as actions from './actions'
import * as fromRoot from '@tezblock/reducers'
import { BaseComponent } from '@tezblock/components/base.component'
import { ProposalDto } from '@tezblock/interfaces/proposal'
import { Tab, updateTabCounts } from '@tezblock/domain/tab'
import { columns } from './table-definitions'
import { PeriodKind } from '@tezblock/domain/vote'
import { Transaction } from '@tezblock/interfaces/Transaction'

@Component({
  selector: 'app-proposal-detail',
  templateUrl: './proposal-detail.component.html',
  styleUrls: ['./proposal-detail.component.scss']
})
export class ProposalDetailComponent extends BaseComponent implements OnInit {
  proposal$: Observable<ProposalDto>
  votes$: Observable<Transaction[]>
  loading$: Observable<boolean>
  tabs: Tab[]

  get isMainnet(): boolean {
    return this.chainNetworkService.getNetwork() === TezosNetwork.MAINNET
  }

  constructor(
    private readonly actions$: Actions,
    private readonly activatedRoute: ActivatedRoute,
    private readonly chainNetworkService: ChainNetworkService,
    private readonly copyService: CopyService,
    private readonly store$: Store<fromRoot.State>
  ) {
    super()
    this.store$.dispatch(actions.reset())

    this.subscriptions.push(
      this.activatedRoute.paramMap.subscribe(paramMap => {
        const id = paramMap.get('id')

        this.store$.dispatch(actions.loadProposal({ id }))
        this.store$.dispatch(actions.loadVotes({ periodKind: 'testing_vote' }))
        this.setTabs()
      }),

      this.actions$.pipe(ofType(actions.loadVotesTotalSucceeded)).subscribe(
        ({ metaVotingPeriods }) =>
          (this.tabs = updateTabCounts(
            this.tabs,
            metaVotingPeriods.map(metaVotingPeriod => ({
              key: metaVotingPeriod.periodKind,
              count: metaVotingPeriod.count
            }))
          ))
      )
    )
  }

  ngOnInit() {
    this.proposal$ = this.store$.select(state => state.proposalDetails.proposal)
    this.votes$ = this.store$.select(state => state.proposalDetails.votes.data)
    this.loading$ = this.store$.select(state => state.proposalDetails.votes.loading)
  }

  copyToClipboard() {
    this.copyService.copyToClipboard(fromRoot.getState(this.store$).proposalDetails.proposal.proposal)
  }

  onLoadMore() {
    this.store$.dispatch(actions.increasePageSize())
  }

  tabSelected(periodKind: string) {
    this.store$.dispatch(actions.loadVotes({ periodKind }))
  }

  private setTabs() {
    this.tabs = [
      {
        title: 'Proposal',
        active: false,
        kind: PeriodKind.Proposal,
        count: undefined,
        columns
      },
      {
        title: 'Expolration',
        active: true,
        kind: PeriodKind.Exploration,
        count: undefined,
        columns
      },
      {
        title: 'Testing',
        active: false,
        kind: PeriodKind.Testing,
        count: undefined,
        columns
      },
      {
        title: 'Promotion',
        active: false,
        kind: PeriodKind.Promotion,
        count: undefined,
        columns
      }
    ]
  }
}
