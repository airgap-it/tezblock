import { Component, OnInit } from '@angular/core'
import { Store } from '@ngrx/store'
import { Observable } from 'rxjs'
import { Router } from '@angular/router'

import * as fromRoot from '@tezblock/reducers'
import * as actions from './actions'
import { TokenContract } from '@tezblock/domain/contract'

@Component({
  selector: 'app-latest-contracts',
  templateUrl: './latest-contracts.component.html',
  styleUrls: ['./latest-contracts.component.scss']
})
export class LatestContractsComponent implements OnInit {

  contracts$: Observable<TokenContract[]>

  constructor(private readonly router: Router, private readonly store$: Store<fromRoot.State>) {
    this.store$.dispatch(actions.loadContracts())
  }

  ngOnInit() {
    this.contracts$ = this.store$.select(state => state.dashboardLatestContracts.contracts)
  }

  inspectDetail(contractHash: string) {
    this.router.navigate([`/contract/${contractHash}`])
  }
}
