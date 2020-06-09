import { Component, OnInit } from '@angular/core'
import { Observable } from 'rxjs'

import { WalletService } from '../../services/wallet/wallet.service'
import { Wallet } from '../../interfaces/Wallet'
import { Title, Meta } from '@angular/platform-browser'

@Component({
  selector: 'app-resources-wallets',
  templateUrl: './resources-wallets.component.html',
  styleUrls: ['./resources-wallets.component.scss']
})
export class ResourcesWalletsComponent implements OnInit {
  constructor(private walletService: WalletService, private titleService: Title, private metaTagService: Meta) {}

  get wallets$(): Observable<Wallet[]> {
    return this.walletService.get()
  }

  ngOnInit() {
    this.titleService.setTitle(`Tezos Wallets - tezblock`)
    this.metaTagService.updateTag({
      name: 'description',
      content: `Tezos Wallet list on tezblock is a list of wallets that support the Tezos protocol for transactions, delegations or other operations. We provide a short description with links to all relevant pages as well as download links.">`
    })
  }
}
