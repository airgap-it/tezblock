import { Component, OnInit } from '@angular/core'
import { Observable } from 'rxjs'

import { EcosystemService } from '../../services/ecosystem/ecosystem'
import { EcosystemItem } from '../../interfaces/Ecosystem'
import { Title, Meta } from '@angular/platform-browser'

@Component({
  selector: 'app-resources-wallets',
  templateUrl: './resources-wallets.component.html',
  styleUrls: ['./resources-wallets.component.scss']
})
export class ResourcesWalletsComponent implements OnInit {
  constructor(private ecosystemService: EcosystemService, private titleService: Title, private metaTagService: Meta) {}

  get ecosystems$(): Observable<EcosystemItem[]> {
    return this.ecosystemService.get()
  }

  ngOnInit() {
    this.titleService.setTitle(`Tezos Wallets - tezblock`)
    this.metaTagService.updateTag({
      name: 'description',
      content: `Tezos Wallet list on tezblock is a list of wallets that support the Tezos protocol for transactions, delegations or other operations. We provide a short description with links to all relevant pages as well as download links.">`
    })
  }
}
