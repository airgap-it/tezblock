import { Component, OnInit } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { select, Store } from '@ngrx/store'
import { Observable, timer } from 'rxjs'

import { BaseComponent } from '@tezblock/components/base.component'
import { refreshRate } from '@tezblock/services/facade/facade'
import { CopyService } from 'src/app/services/copy/copy.service'
import * as Actions from './actions'
import { Transaction } from '@tezblock/interfaces/Transaction'
import * as fromRoot from '@tezblock/reducers'
import { Slot } from './reducer'

@Component({
  selector: 'app-endorsement-detail',
  templateUrl: './endorsement-detail.component.html',
  styleUrls: ['./endorsement-detail.component.scss']
})
export class EndorsementDetailComponent extends BaseComponent implements OnInit {
  private get id(): string {
    return this.activatedRoute.snapshot.paramMap.get('id')
  }

  endorsements$: Observable<Transaction[]>
  selectedEndorsement$: Observable<Transaction>
  slots$: Observable<Slot[]>

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly store$: Store<fromRoot.State>,
    private readonly copyService: CopyService
  ) {
    super()
  }

  ngOnInit() {
    this.endorsements$ = this.store$.select(state => state.endorsementDetails.endorsements)
    this.selectedEndorsement$ = this.store$.select(state => state.endorsementDetails.selectedEndorsement)
    this.slots$ = this.store$.select(state => state.endorsementDetails.slots)

    this.store$.dispatch(Actions.loadEndorsementDetails({ id: this.id }))
    this.subscriptions.push(timer(refreshRate, refreshRate).subscribe(() => this.store$.dispatch(Actions.loadEndorsements())))
  }

  copyToClipboard() {
    this.copyService.copyToClipboard(fromRoot.getState(this.store$).endorsementDetails.selectedEndorsement.operation_group_hash)
  }

  getSlotsEndorsed(value: string): string {
    return value ? value.replace(/[\[\]']/g, '') : value
  }

  select(operation_group_hash: string) {
    if (operation_group_hash) {
      this.store$.dispatch(Actions.slotSelected({ operation_group_hash }))
    }
  }
}
