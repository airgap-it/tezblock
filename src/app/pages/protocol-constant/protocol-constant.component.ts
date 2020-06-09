import { Component, OnInit } from '@angular/core'
import { Store } from '@ngrx/store'

import { ProtocolConstantResponse } from '@tezblock/services/protocol-variables/protocol-variables.service'
import * as fromRoot from '@tezblock/reducers'
import { Observable } from 'rxjs'

@Component({
  selector: 'protocol-constant',
  templateUrl: './protocol-constant.component.html',
  styleUrls: ['./protocol-constant.component.scss']
})
export class ProtocolConstantComponent implements OnInit {

  protocolVariables$: Observable<ProtocolConstantResponse>

  constructor(
    private readonly store$: Store<fromRoot.State>
  ) {}

  ngOnInit() {
    this.protocolVariables$ = this.store$.select(state => state.app.protocolVariables)
  }
}
