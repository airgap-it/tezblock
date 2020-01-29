import { Component, OnInit } from '@angular/core'
import { Store } from '@ngrx/store'
import { ActivatedRoute } from '@angular/router'
import { Observable } from 'rxjs'

import { CopyService } from 'src/app/services/copy/copy.service'
import * as actions from './actions'
import * as fromRoot from '@tezblock/reducers'
import { BaseComponent } from '@tezblock/components/base.component'
import { ProposalDto } from '@tezblock/interfaces/proposal'

@Component({
  selector: 'app-proposal-detail',
  templateUrl: './proposal-detail.component.html',
  styleUrls: ['./proposal-detail.component.scss']
})
export class ProposalDetailComponent extends BaseComponent implements OnInit {
  proposal$: Observable<ProposalDto>

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly copyService: CopyService,
    private readonly store$: Store<fromRoot.State>
  ) {
    super()
    this.store$.dispatch(actions.reset())

    this.subscriptions.push(
      this.activatedRoute.paramMap.subscribe(paramMap => this.store$.dispatch(actions.loadProposal({ id: paramMap.get('id') })))
    )
  }

  ngOnInit() {
    this.proposal$ = this.store$.select(state => state.proposalDetails.proposal)
  }

  copyToClipboard() {
    this.copyService.copyToClipboard(fromRoot.getState(this.store$).proposalDetails.proposal.proposal)
  }
}
