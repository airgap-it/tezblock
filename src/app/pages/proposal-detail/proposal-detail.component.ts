import { Component, OnInit } from '@angular/core'
import { Store } from '@ngrx/store'
import { ActivatedRoute } from '@angular/router'
import { Observable } from 'rxjs'
import { TezosNetwork } from 'airgap-coin-lib/dist/protocols/tezos/TezosProtocol'

import { ChainNetworkService } from '@tezblock/services/chain-network/chain-network.service'
import { CopyService } from 'src/app/services/copy/copy.service'
import * as actions from './actions'
import * as fromRoot from '@tezblock/reducers'
import { BaseComponent } from '@tezblock/components/base.component'
import { ProposalDto } from '@tezblock/interfaces/proposal'
import { Tab } from '@tezblock/domain/tab'
import { columns } from './table-definitions'

@Component({
  selector: 'app-proposal-detail',
  templateUrl: './proposal-detail.component.html',
  styleUrls: ['./proposal-detail.component.scss']
})
export class ProposalDetailComponent extends BaseComponent implements OnInit {
  proposal$: Observable<ProposalDto>
  tabs: Tab[]

  get isMainnet(): boolean {
    return this.chainNetworkService.getNetwork() === TezosNetwork.MAINNET
  }

  constructor(
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
      })
    )
  }

  ngOnInit() {
    this.proposal$ = this.store$.select(state => state.proposalDetails.proposal)
    this.store$.select(state => state.proposalDetails.votes).subscribe(x => {
      const foo = x
    })
  }

  copyToClipboard() {
    this.copyService.copyToClipboard(fromRoot.getState(this.store$).proposalDetails.proposal.proposal)
  }

  private setTabs() {
    this.tabs = [
      {
        title: 'Proposal',
        active: true,
        kind: 'proposal',
        count: undefined,
        columns
      },
      {
        title: 'Expolration',
        active: false,
        kind: 'expolration',
        count: undefined,
        columns
      },
      {
        title: 'Testing',
        active: false,
        kind: 'testing',
        count: undefined,
        columns
      },
      {
        title: 'Promotion',
        active: false,
        kind: 'promotion',
        count: undefined,
        columns
      }
    ]
  }
}
