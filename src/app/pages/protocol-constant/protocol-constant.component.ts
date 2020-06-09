import { Component, OnInit } from '@angular/core'
import { Store } from '@ngrx/store'

import { ProtocolConstantResponse } from '@tezblock/services/protocol-variables/protocol-variables.service'
import * as fromRoot from '@tezblock/reducers'
import { Observable } from 'rxjs'
import { Title, Meta } from '@angular/platform-browser'

@Component({
  selector: 'protocol-constant',
  templateUrl: './protocol-constant.component.html',
  styleUrls: ['./protocol-constant.component.scss']
})
export class ProtocolConstantComponent implements OnInit {
  protocolVariables$: Observable<ProtocolConstantResponse>
  constructor(
    private readonly store$: Store<fromRoot.State>,

    private titleService: Title,
    private metaTagService: Meta
  ) {}

  ngOnInit() {
    this.protocolVariables$ = this.store$.select(state => state.app.protocolVariables)

    this.titleService.setTitle(`Tezos Constants - tezblock`)
    this.metaTagService.updateTag({
      name: 'description',
      content: `tezblock constants page shows relevant information about periods, rewards and limits of the tezos blockchain.">`
    })
  }
}
