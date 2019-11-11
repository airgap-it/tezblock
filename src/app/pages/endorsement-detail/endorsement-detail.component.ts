import { Component, OnInit } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { select, Store } from '@ngrx/store'
import { Observable } from 'rxjs'

import { CopyService } from 'src/app/services/copy/copy.service'
import * as Actions from './actions'
import { Transaction } from '@tezblock/interfaces/Transaction'
import * as fromRoot from '@tezblock/reducers'

@Component({
  selector: 'app-endorsement-detail',
  templateUrl: './endorsement-detail.component.html',
  styleUrls: ['./endorsement-detail.component.scss']
})
export class EndorsementDetailComponent implements OnInit {
  private get id(): string {
    return this.activatedRoute.snapshot.paramMap.get('id')
  }

  endorsements$: Observable<Transaction[]>
  selectedEndorsement$: Observable<Transaction>

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly store: Store<fromRoot.State>,
    private readonly copyService: CopyService
  ) {}

  ngOnInit() {
    this.endorsements$ = this.store.select(state => state.endorsementDetails.endorsements)
    this.selectedEndorsement$ = this.store.select(state => state.endorsementDetails.selectedEndorsement)

    this.store.dispatch(Actions.loadEndorsementDetails({ id: this.id }))
  }

  copyToClipboard(value: string) {
    this.copyService.copyToClipboard(value)
  }

  getSlotsEndorsed(value: string): string {
    return value ? value.replace(/[\[\]']/g,'' ) : value;
  }
}
